# Deep sweep: archived ride-sharing/bus apps, the transit-data ecosystem, trip planners, crowd data and Pakistan Railways

Researched 2026-09-21. Every row below was fetched (curl / WebFetch) before it was written down; anything not
fetched is marked **unverified**. Nothing under `data/` was changed. No login, captcha or paywall was bypassed,
and no private app API was queried.

This file does **not** repeat `sources-apis.md` (CDA / PMA / SMTA / TransPeshawar / safar.fyi / Kentkart) or
`sources-datasets.md` (Overpass stops, the 20 OSM route relations, the URC PDF, the GitHub student repos).
Read those first.

---

## Ranked table

Rank = usefulness to this project right now.

| # | Source | What is actually there | Licence / terms | Verdict |
|---|--------|------------------------|-----------------|---------|
| 1 | **Organic Maps "subways" validator, Lahore dump** — `https://cdn.organicmaps.app/subway/lahore.yaml`, `.geojson`, index `https://cdn.organicmaps.app/subway/pakistan.html` | A QA'd, machine-readable dump of the Lahore Orange Line: ref `O`, colour `#f7943a`, **26/26 stations in order for both directions**, each with its **English name, Urdu name and OSM element id**. Validator says 1/1 lines, 0 errors, 0 warnings, 1 notice. Regenerated daily (the copy we took was produced 2026-09-20 18:45 UTC). Pakistan's only entry is Lahore. | **ODbL-1.0** (it is an OSM derivative). Validator code: `https://github.com/organicmaps/subways` | **Usable now.** Saved to `research/incoming/organicmaps-lahore-metro/` |
| 2 | **Pakistan Railways — Train Timings** `https://www.pakrail.gov.pk/TrainTiming.aspx` | The official train dropdown: **122 services**, including **KCR-1UP, KCR-2DN, KCR-3DNDN, KCR-4DN**. This is first-party evidence that KCR runs four services today. Submitting the form (train + date, valid `__VIEWSTATE`/`__EVENTVALIDATION`, button value `Search Timings`) returned **no timetable rows** for any train tried, so no stop times exist to extract. | Government work, no open licence, no `robots.txt` (404), no sitemap. Train codes and names are plain facts. | **Usable (facts, cite the URL).** Saved to `research/incoming/pakistan-railways/` |
| 3 | **Google Maps transit in Pakistan** | Transit directions do work. Islamabad/Rawalpindi returns `PMBS`/`PMBS0` lines at PKR 30 with **no stale-timetable banner**; Lahore returns PMA/LTC's own codes (`MBRT1`, `FRT03`, `FRT14`, `FRT19`) plus Pakistan Railways `121UP`/`206DN`; Karachi returns BRT legs. Lahore and Karachi show Google's "We don't have the most recent timetables for this area" banner. CDA confirmed an August 2025 integration of **13 e-bus feeder routes + 5 Metro Bus lines** (`https://propakistani.pk/2025/08/22/cda-launches-real-time-tracking-of-metro-and-electric-buses-on-google-maps/`; the article never says "GTFS"). | `https://www.google.com/help/terms_maps/` forbids "mass download or create bulk feeds of the content" and using Maps "to create or augment any other mapping-related dataset". Partner sign-up: `https://support.google.com/transitpartners/answer/1106422` ("comes at no charge"). Google does not publish its partner list. | **Needs permission — but the real lesson is: the data holders are CDA and PMA/LTC, so ask them, not Google.** It also means CDA almost certainly has a GTFS export, which strengthens the ask already drafted in `sources-apis.md` |
| 4 | **Transitous** `https://github.com/public-transport/transitous` + `https://api.transitous.org` | `feeds/` holds ~133 region files (ad, ae, … in, in-dl, eg, ma, et, …). **There is no `pk.json`.** I confirmed it live too: `GET https://api.transitous.org/api/v1/map/stops?min=…&max=…` returns `[]` for Karachi, Lahore and Islamabad bounding boxes. | Repo is FOSS (CC0 headers); it aggregates third-party feeds under their own licences. Adding a region: `https://transitous.org/doc/#adding-a-region`. Matrix `#transitous:matrix.spline.de` | **Dead end as a source, best publication target we found.** Once we can emit GTFS, one PR makes Pakistan routable in a FOSS planner |
| 5 | **Yango Pakistan "Transport"** (launched 26 Mar 2026) | In-app public-transport routing for **Lahore, Karachi, Islamabad, Rawalpindi**: "more than 60 public transport routes", "over 1,000 kilometres", buses + Metrobus/BRT + Metro. Verified at `https://propakistani.pk/2026/03/26/yango-pakistan-launches-transport-service-to-simplify-public-transport-journey/`. The announcement **never says where the data came from**, and there is no feed or API. | No published data terms. Stated intent to partner with "local mobility and infrastructure players, as well as public sector organizations". | **Needs permission.** Newest and most complete commercial holder of PK route data; worth a partnership email |
| 6 | **Mobility Database** catalog CSV | Downloaded the full catalog (3,513 rows, 1.18 MB). Country codes present include US 1180, ES 169, CA 156, … **IN 19, EG 5 — and zero PK rows.** Re-verified, not inherited from the earlier note. | Per-dataset | **Dead end** (confirmed again) |
| 7 | **transit.land / transitland-atlas** | `https://api.github.com/repos/transitland/transitland-atlas/git/trees/main?recursive=1` lists **795 `.dmfr.json` feed files; none is Pakistani** (the only `pk` hit is `skm.pkp.pl`, Poland). The REST API still refuses without a key: `GET https://transit.land/api/v2/rest/feeds?adm0_iso=PK` → `401 {"error":"Unauthorized"}`. | Atlas is CC0; feeds keep their own licences | **Dead end** |
| 8 | **OpenStreetMap wiki / OSM-PK community** | `wiki.openstreetmap.org/wiki/WikiProject_Pakistan` is genuinely active (last edit 11 Sep 2026) but is **entirely roads** — motorway/national-highway tagging, no bus or BRT guidance anywhere. A full-text wiki search for "Pakistan public transport" returns 56 generic hits and no PK transit page. Karachi (2010-era), Islamabad (last edited 2009) and Lahore city pages have no PT section. **OpenStreetMap Pakistan is a registered HOT organisation (id 670, slug `openstreetmap-pakistan`, founder Uzair Ahmad)**; its declared channel is a Facebook group. A PK category on `community.openstreetmap.org` was requested in June 2025 and is still effectively empty. | Wiki CC-BY-SA 2.0; data ODbL | **Cite-only as documentation; valuable as a contact.** No transit-mapping effort exists to join — there is one to start |
| 9 | **HOT Tasking Manager** `https://tasking-manager-tm4-production-api.hotosm.org/api/v2/projects/?country=Pakistan` | Exactly **11 Pakistan projects, none about transit**. Six by OSM Pakistan (Upper Chitral, Abbottabad, Mansehra roads; Chitral buildings), five by Open Mapping Hub Asia-Pacific (Manzoor Colony Karachi roads **98% mapped**, Delhi Colony Karachi, Multan roads/buildings). Searching the TM for `bus` or `transport` returns zero PK hits. `https://www.hotosm.org/where-we-work/pakistan/` is a **404**. | All edits land in OSM → **ODbL-1.0** | **Usable (as OSM), but no transit content.** Proposing a bus-stop TM project is the obvious move |
| 10 | **Mapillary** | Point features are downloadable: `GET https://graph.mapillary.com/map_features?access_token=…&fields=id,object_value,geometry&bbox=…&object_values=…`, plus vector tiles at `https://tiles.mapillary.com/maps/vtp/mly_map_feature_point/2/{z}/{x}/{y}`. Hard limit: **bbox must be under 0.01° square**, so city-wide extraction means tens of thousands of calls. **No bus-stop object class confirmed — unverified, likely absent.** PK coverage volume unverified. | Imagery CC-BY-SA, but `https://www.mapillary.com/terms` does **not** extend that to derived detections and prohibits "data mining, robots or similar data gathering" designed to scrape or extract data | **Needs permission. Do not treat detections as ODbL-compatible** |
| 11 | **Daewoo Express city services** `https://www.daewoo.com.pk/home/lahore-feeder-route-services`, `/home/multan-metro-bus-service` | Live, not archived. Both pages are **prose only**: the Lahore page says PMA put 200 buses on **15 feeder routes covering 123 km**, operating from Green Town Depot and Lahore Railway Station, with e-ticketing and GPS. **No route list, no stop list, no numbers.** The intercity site (`/Home/Terminals`, `/Home/fare`) is a commercial ASP.NET booking app with session-id URLs. | `/Home/TermsAndConditions`, "Copyright 1997–, Daewoo Express … All Rights Reserved" | **Cite-only** (the "15 routes / 123 km" figure corroborates PMA) |
| 12 | **ÖPNVKarte** | `https://www.oepnvkarte.de/` now **302s to a domain-sale page**. The tile server survives: `https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png` → 200. It renders whatever PT data is already in OSM, so PK coverage equals our 20 route relations. | Data ODbL, tiles CC-BY-SA | **Usable as a renderer, not a source** |
| 13 | **Organic Maps / Maps.me as an app** | OSM-backed; app Apache-2.0. Bus routes surface by tapping a stop. Only Lahore appears in the rail/subway layer (see row 1). | OSM ODbL | **Usable** — and a downstream consumer of anything we push into OSM |
| 14 | **Airlift (airlifttech.com)** | The bus startup's domain is **`airlifttech.com`**, not `airlift.pk` (that is an unrelated freight forwarder, archived 2010–2018 with only `profile.htm`, `services.htm`, `contactus.htm`). The Wayback CDX for `airlifttech.com` returns 428 captures that are **almost entirely WordPress theme assets and 2021 HR/funding blog posts**. There are exactly two content pages: `/airlift-transit/` and `/airlift-express/`, both Elementor marketing pages with **no route or stop data**. `airlifttech.com/routes` and `/cities` have **no snapshots at all**. Routes only ever existed inside the app. Company shut down 13 July 2022. | n/a | **Dead** |
| 15 | **Swvl Pakistan** | `swvl.pk`, `pk.swvl.com`, `swvl.com/pk`, `swvl.com/pakistan`, `swvl.com/en-pk`, `app.swvl.com` — **zero Wayback snapshots** for every one. Domain-wide CDX for `swvl.com` filtered to Pakistan terms yields only **job ads on `crafts.swvl.com`** and one marketing page `https://travel.swvl.com/pakistan_charter_buses` (2020, charter sales, no routes). Today `swvl.com` is an Egypt/KSA intercity site. | n/a | **Dead** |
| 16 | **Careem Bus** | `careem.com/bus`, `/en-PK/bus`, `/pakistan/bus` — **no snapshots**. `careembus.com` archived only `/` and `/robots.txt`. Careem Bus closed 2020; Careem exited Pakistan ride-hailing in July 2025. | n/a | **Dead** |
| 17 | **Moovit** | `https://moovitapp.com/index/en/public_transit-countries` lists 24 Asian countries (India, Indonesia, Israel, Japan, Saudi Arabia, UAE, Uzbekistan, …). **Pakistan is not among them**, and there is no Karachi/Lahore/Islamabad city page. The `mooviters.moovit.com` editor portal is geo-blocked from PK and login-gated. | `https://moovit.com/legals/terms/` bars users who "create a database by systematically downloading and storing all or any of the content" | **Dead end** |
| 18 | **Apple Maps** | `https://www.apple.com/ios/feature-availability/` → Maps → Transit lists ~24 cities/regions (Boston, Chicago, Japan, London, Riyadh, Singapore, Sydney, Toronto …). **No Pakistani city in any Maps feature list.** | n/a | **Dead end** |
| 19 | **Citymapper** | `https://citymapper.com/cities` — Asia & ROW covers Hong Kong, Singapore, Seoul, Tokyo, Utsunomiya (beta), Taiwan, Sydney, Melbourne, São Paulo, Mexico City. **No Pakistani city, and no "coming soon"/voting page.** | n/a | **Dead end** |
| 20 | **Navitia** | `https://api.navitia.io/v1/coverage` → `401 {"message":"no token…"}`. `https://www.navitia.io/coverage/` is a 4 KB JS shell with no server-rendered list, so the coverage list could not be read without an account. | Commercial (Hove) | **Unverified / not pursued** — no evidence of PK, and a token would be needed |
| 21 | **OpenTripPlanner deployments** | `https://docs.opentripplanner.org/en/latest/Deployments/` — Nordics, Western Europe, Poland, and a dozen US metros. **No Asian, South Asian or Pakistani deployment.** | n/a | **Dead end** |
| 22 | **awesome-transit** | Fetched `https://raw.githubusercontent.com/CUTR-at-USF/awesome-transit/master/README.md`. **No mention of Pakistan, Karachi, Lahore or Islamabad.** Its global catalogues are exactly Mobility Database and Transitland, both already checked above. | n/a | **Dead end** (re-confirmed) |
| 23 | **transitfeeds.com / openmobilitydata.org** | Both now sit behind Cloudflare and return **403** to any non-browser client (`/l/pakistan`, `/l/asia`). The archive has also been superseded by the Mobility Database. | n/a | **Dead end** |
| 24 | **osm2gtfs** `https://github.com/grote/osm2gtfs` | Working tool, **no Pakistan config**; the only documented city manual is Accra. | Tool is FOSS | **Usable tool, zero PK content** — we would author the first PK config |
| 25 | **Bykea / inDrive / Careem (current)** | None publishes fixed-route bus data or a feed for Pakistan. Bykea's public API docs cover delivery, cash and bill payment only. | n/a | **Dead end** |

---

## The two extracts saved

### `research/incoming/organicmaps-lahore-metro/`
- `lahore-orange-line.json` — SCHEMA.md-shaped. One system, one route, **26 ordered stops**, each with `name`, `name_ur`,
  `lat`, `lon` and `coord_source` (`osm:node/…` or `osm:way/…`). Station order and the English↔Urdu pairing came from the
  Organic Maps dump; **coordinates and name tags were independently re-fetched from `https://api.openstreetmap.org/api/0.6/nodes.json`
  by element id**, so nothing is interpolated. Two stations (Shalimar Garden `w611924568`, GPO `w611921782`) are mapped as building
  ways, so their coordinates are way-node centroids — this is recorded in `open_questions`.
- `source-lahore.yaml`, `source-lahore.geojson` — the untouched upstream dumps.
- Licence duty: **ODbL-1.0**, credit "© OpenStreetMap contributors". Same share-alike duty as the rest of our OSM data.

### `research/incoming/pakistan-railways/`
- `kcr-services.json` — SCHEMA.md-shaped. Four KCR routes with **empty `stops` arrays**, because Pakistan Railways
  publishes no stopping pattern. This is deliberately thin: it is evidence, not a route database.
- `pakrail-train-list.json` — the verbatim 122-entry train dropdown with the site's internal ids.

**Correction this forces.** `data/systems/karachi-circular-railway.json` currently says `"status": "planned"` and
`"notes": "Not operational as a mass-transit system."` Pakistan Railways' own site lists four KCR services, and Dawn
(`https://www.dawn.com/news/1591237`) reported partial operations from November 2020. The system should be re-modelled as a
partially operational shuttle plus a planned full loop.

---

## Notes and judgement calls

**The archived-startup hypothesis is disproved.** Airlift, Swvl Pakistan and Careem Bus never published route or stop
lists on the open web — their routes lived entirely inside their apps, so the Wayback Machine has nothing to recover.
I checked this three ways: domain-wide CDX listings, the `archive.org/wayback/available` probe on nine plausible route
URLs (all empty), and fetching the only two Airlift content pages that exist. Do not spend more time here. Launch-era
news coverage does name a handful of Airlift corridors, but for a 2019–2022 operator that is stale, informal and not
worth importing.

**Do not query `https://isapi.pakrailways.gov.pk/v1/`.** The RABTA SPA's bundle (`/js/app.20975fbe.js`) hard-codes that
as `baseURL`. It is an undocumented private booking backend with no published terms — exactly the Kentkart situation in
`sources-apis.md`. I recorded the base URL and stopped there. If we want Pakistan Railways data, file a Right of Access
to Information Act 2017 request instead.

**The most actionable finding is indirect.** Islamabad/Rawalpindi transit in Google Maps has no stale-timetable warning,
and CDA publicly announced the integration in August 2025. An agency does not get schedules into Google Maps by hand —
it ships a feed. Combined with the fact that CDA's `metro_transit_route` PDFs are literally GTFS fields printed to paper
(`sources-apis.md` row 1), **CDA holding a GTFS export is now close to certain.** That should be the first permission
email we send, and it should say so explicitly.

**Where Pakistan is simply absent.** Moovit, Apple Maps, Citymapper, OpenTripPlanner's deployment list, awesome-transit,
the Mobility Database (3,513 feeds), Transitland's atlas (795 feeds) and Transitous (133 regions) all have zero Pakistani
content. That is not a gap in our searching; it is the actual state of the world. It also means the first credible
open Pakistani feed will have no competition, and that Transitous is the cheapest way to make it visible.

**Contacts worth adding to the permission list in `sources-apis.md`:**

| Organisation | Ask for | Channel (verified) |
|---|---|---|
| Yango Pakistan | The 60+ routes behind Superapp "Transport", or a data-sharing agreement | They publicly invited partnerships with "public sector organizations"; approach via Yango Pakistan press/partnerships |
| OpenStreetMap Pakistan (HOT org 670) | Co-run a bus-stop / route-relation mapping project through the HOT Tasking Manager | Founder Uzair Ahmad; Facebook group `https://www.facebook.com/groups/163510627129515/`; PK category `https://community.openstreetmap.org/t/osm-pakistan-community/130947` |
| Transitous | Not a permission ask — a PR adding `feeds/pk.json` once we can emit GTFS | `https://transitous.org/doc/#adding-a-region`; Matrix `#transitous:matrix.spline.de` |
| Pakistan Railways | KCR stopping pattern and times; any station list or GTFS | `https://www.pakrail.gov.pk/ContactUs.aspx`, +92-51-9272117; or an RTI Act 2017 request |

**Still unverified:** Navitia's coverage list (token required), Mapillary's PK imagery volume and whether it has a bus-stop
object class, and whether any Pakistani agency appears on Google's unpublished transit-partner list.
