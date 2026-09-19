#!/usr/bin/env python3
"""Polite extractor for public safar.fyi transit-line pages.

Reads sitemap.xml, fetches each /<city>/transit-lines/<id> HTML page (cached
under research/cache/safar/<city>/<slug>.html), parses the Next.js RSC payload
embedded in the page and writes research/incoming/safar/<city-id>.json.

Rules: obeys robots.txt, never touches /api/, one request at a time with a
delay of at least 2 s, descriptive User-Agent, stops after repeated 403/429.

Usage:  python scripts/safar-extract.py [--parse-only]
"""
import datetime as dt
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from pathlib import Path

BASE = "https://www.safar.fyi"
UA = "pakistan-bus-routes-research/0.1 (+https://github.com/topics/pakistan-bus-routes)"
DELAY = 2.5
ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "research" / "cache" / "safar"
OUT = ROOT / "research" / "incoming" / "safar"
CITY_MAP = {"islamabad": "islamabad-rawalpindi", "rawalpindi": "islamabad-rawalpindi"}

_last = 0.0
_blocked = 0


def fetch(url, dest=None):
    """GET url politely; returns text or None. Uses cache when dest exists."""
    global _last, _blocked
    if dest and dest.exists() and dest.stat().st_size > 0:
        return dest.read_text(encoding="utf-8")
    if "/api/" in urllib.parse.urlparse(url).path:
        raise RuntimeError(f"refusing /api/ path: {url}")
    wait = DELAY - (time.time() - _last)
    if wait > 0:
        time.sleep(wait)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xml"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read().decode("utf-8", "replace")
        _blocked = 0
    except urllib.error.HTTPError as e:
        _last = time.time()
        print(f"  HTTP {e.code} {url}", flush=True)
        if e.code in (403, 429):
            _blocked += 1
            if _blocked >= 3:
                sys.exit(f"Stopping: repeated HTTP {e.code}")
            time.sleep(30)
        return None
    except Exception as e:  # network error
        _last = time.time()
        print(f"  ERROR {e} {url}", flush=True)
        return None
    _last = time.time()
    if dest:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(body, encoding="utf-8")
    return body


def rsc_payload(html):
    """Concatenate the string parts of all self.__next_f.push([...]) chunks."""
    out = []
    for chunk in re.findall(r"self\.__next_f\.push\((\[.*?\])\)</script>", html, re.S):
        try:
            arr = json.loads(chunk)
        except json.JSONDecodeError:
            continue
        if len(arr) > 1 and isinstance(arr[1], str):
            out.append(arr[1])
    return "".join(out)


def parse_line(html, url):
    s = rsc_payload(html)
    dec = json.JSONDecoder()
    i = s.find('{"routeName"')
    if i < 0:
        return None, "no routeName object"
    obj, _ = dec.raw_decode(s, i)
    dirs = obj.get("directions") or []
    if not isinstance(dirs, list) or not dirs:
        return None, "no directions"
    dirs = sorted(dirs, key=lambda d: d.get("direction", 0) if isinstance(d.get("direction"), int) else 0)
    d0 = dirs[0]
    stops = d0.get("stops") or []
    pts = d0.get("mapPoints") or []
    if isinstance(stops, str) or isinstance(pts, str):
        return None, "unresolved RSC reference for stops/mapPoints"

    # Pair stops with mapPoints: by index when names agree, else first unused same-name point.
    used = set()
    out_stops = []
    for k, st in enumerate(stops):
        name = (st.get("name") or "").strip()
        pt = None
        if k < len(pts) and (pts[k].get("name") or "").strip() == name and k not in used:
            pt = k
        else:
            for j, p in enumerate(pts):
                if j not in used and (p.get("name") or "").strip() == name:
                    pt = j
                    break
        lat = lon = None
        if pt is not None:
            used.add(pt)
            lat, lon = pts[pt].get("lat"), pts[pt].get("lng")
            if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
                lat = lon = None
        out_stops.append({"name": name, "name_ur": "", "lat": lat, "lon": lon, "safar_stop_id": st.get("id")})

    # Rider-facing code: breadcrumb current-page span, else "(CODE)" in the name.
    code = None
    m = re.search(r'"aria-current":"page","children":"([^"]+)"', s)
    if m:
        code = m.group(1)
    name = obj.get("routeName") or ""
    if not code:
        m = re.search(r"\(([^()]+)\)\s*$", name)
        code = m.group(1) if m else None
    mode = None
    m = re.search(r'"@type":"(\w*Route|\w*Line|Trip|\w+Trip)","@id":"[^"]*#route"', s)
    if m:
        mode = m.group(1)
    color = obj.get("color")
    if not (isinstance(color, str) and re.fullmatch(r"#[0-9A-Fa-f]{6}", color)):
        color = None
    line_id = urllib.parse.unquote(url.rstrip("/").rsplit("/", 1)[1])
    return {
        "id": line_id,
        "code": code,
        "name": name,
        "url": url,
        "color": color.upper() if color else None,
        "mode": mode,
        "headsign": d0.get("headsign"),
        "direction_count": len(dirs),
        "stops": out_stops,
    }, None


def main():
    parse_only = "--parse-only" in sys.argv
    CACHE.mkdir(parents=True, exist_ok=True)
    robots_txt = fetch(f"{BASE}/robots.txt", CACHE / "robots.txt")
    rp = urllib.robotparser.RobotFileParser()
    rp.parse((robots_txt or "").splitlines())
    sm = fetch(f"{BASE}/sitemap.xml", CACHE / "sitemap.xml") or ""
    locs = re.findall(r"<loc>([^<]+)</loc>", sm)
    # sub-sitemaps (sitemap index) if any
    for sub in [l for l in locs if l.endswith(".xml")]:
        name = re.sub(r"[^A-Za-z0-9_.-]", "_", urllib.parse.urlparse(sub).path.strip("/"))
        locs += re.findall(r"<loc>([^<]+)</loc>", fetch(sub, CACHE / name) or "")
    lines = []
    for u in dict.fromkeys(locs):
        p = urllib.parse.urlparse(u).path
        m = re.fullmatch(r"/([a-z0-9-]+)/transit-lines/([^/]+)", p)
        if m and m.group(1) != "ur":
            lines.append((m.group(1), u))
    print(f"{len(lines)} transit-line pages in sitemap")

    cities = json.loads((ROOT / "data" / "cities.json").read_text(encoding="utf-8"))
    known = {c["id"] for c in cities["cities"]}
    by_city, skipped, errors = {}, [], []
    for n, (slug, url) in enumerate(lines, 1):
        if not rp.can_fetch(UA, url) or "/api/" in url:
            skipped.append(url)
            continue
        fname = re.sub(r"[^A-Za-z0-9_.-]", "_", urllib.parse.unquote(url.rsplit("/", 1)[1])) + ".html"
        dest = CACHE / slug / fname
        if parse_only and not dest.exists():
            continue
        if not dest.exists():
            print(f"[{n}/{len(lines)}] {url}", flush=True)
        html = fetch(url, dest)
        if html is None:
            errors.append((url, "fetch failed"))
            continue
        line, err = parse_line(html, url)
        if err:
            errors.append((url, err))
            continue
        cid = CITY_MAP.get(slug, slug)
        if cid not in known:
            print(f"  warning: city slug {slug} not in data/cities.json")
        by_city.setdefault(cid, []).append(line)

    OUT.mkdir(parents=True, exist_ok=True)
    today = dt.date.today().isoformat()
    tl = ts = tc = 0
    for cid, ls in sorted(by_city.items()):
        doc = {"city": cid, "source": "safar.fyi", "source_url": BASE, "fetched_at": today, "lines": ls}
        path = OUT / f"{cid}.json"
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        json.loads(path.read_text(encoding="utf-8"))  # validate
        ns = sum(len(l["stops"]) for l in ls)
        nc = sum(1 for l in ls for s in l["stops"] if s["lat"] is not None)
        tl, ts, tc = tl + len(ls), ts + ns, tc + nc
        print(f"{cid:22s} lines={len(ls):3d} stops={ns:5d} with_coords={nc:5d}")
    print(f"TOTAL cities={len(by_city)} lines={tl} stops={ts} with_coords={tc} ({100*tc/max(ts,1):.1f}%)")
    print(f"robots-skipped={len(skipped)} errors={len(errors)}")
    for u, e in errors:
        print("  ERR", u, e)


if __name__ == "__main__":
    main()
