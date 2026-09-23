import { useCallback, useEffect, useMemo, useState } from 'react';
import { AboutPanel, NearbyPanel } from './components/InfoPanels';
import MapView from './components/MapView';
import PlanPanel from './components/PlanPanel';
import { RouteDetail, RouteList, StopDetail } from './components/RoutesPanel';
import { loadCity, loadIndex, type Place } from './lib/data';
import { DICTS, localName, num, type Lang } from './lib/i18n';
import { Planner } from './lib/planner';
import { buildHash, parseHash, type AppLocation, type Tab } from './lib/router';
import type { CityData, DatasetIndex } from './types';

const store = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, v: string) {
    try {
      localStorage.setItem(key, v);
    } catch {
      /* storage unavailable */
    }
  },
};

const initialLang = (): Lang => {
  const saved = store.get('lang');
  if (saved === 'en' || saved === 'ur') return saved;
  return navigator.language?.startsWith('ur') ? 'ur' : 'en';
};

const initialTheme = (): 'light' | 'dark' => {
  const saved = store.get('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

type GeoStatus = 'idle' | 'locating' | 'denied' | 'ok';

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const t = DICTS[lang];
  const [index, setIndex] = useState<DatasetIndex | null>(null);
  const [data, setData] = useState<CityData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loc, setLoc] = useState<AppLocation>(() => parseHash(window.location.hash));
  const [systemFilter, setSystemFilter] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [womenOnly, setWomenOnly] = useState(() => store.get('womenOnly') === '1');
  const [selectedItinerary, setSelectedItinerary] = useState(0);
  const [geo, setGeo] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [sheetOpen, setSheetOpen] = useState(true);

  // language + theme on <html>
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.title = `${t.appName} · ${lang === 'ur' ? 'Pakistan Bus Routes' : 'پاکستان بس روٹس'}`;
    store.set('lang', lang);
  }, [lang, t.appName]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    store.set('theme', theme);
  }, [theme]);
  useEffect(() => store.set('womenOnly', womenOnly ? '1' : '0'), [womenOnly]);

  // dataset index
  useEffect(() => {
    loadIndex()
      .then(setIndex)
      .catch(() => setError('index'));
  }, []);

  // hash <-> state
  useEffect(() => {
    const onHash = () => setLoc(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((next: Partial<AppLocation>, push = true) => {
    setLoc((prev) => {
      const merged = { ...prev, ...next };
      const hash = buildHash(merged);
      if (hash !== window.location.hash) {
        if (push) window.history.pushState(null, '', hash);
        else window.history.replaceState(null, '', hash);
      }
      return merged;
    });
  }, []);

  // default city
  const cityId = loc.city && index?.cities.some((c) => c.id === loc.city) ? loc.city : null;
  useEffect(() => {
    if (!index || cityId) return;
    const saved = store.get('city');
    const fallback = index.cities.find((c) => c.id === saved) ?? index.cities.find((c) => c.id === 'karachi') ?? index.cities[0];
    if (fallback) go({ city: fallback.id, tab: loc.tab, routeKey: null, stopId: null }, false);
  }, [index, cityId, go, loc.tab]);

  // city data
  useEffect(() => {
    if (!cityId) return;
    store.set('city', cityId);
    let alive = true;
    setError(null);
    loadCity(cityId)
      .then((d) => alive && setData(d))
      .catch(() => alive && setError('city'));
    return () => {
      alive = false;
    };
  }, [cityId]);

  const cityData = data && data.city.id === cityId ? data : null;
  const planner = useMemo(() => (cityData ? new Planner(cityData, { womenOnlyAllowed: womenOnly }) : null), [cityData, womenOnly]);
  const results = useMemo(() => {
    if (!planner || !loc.from || !loc.to) return null;
    return planner.plan(loc.from, loc.to);
  }, [planner, loc.from, loc.to]);
  useEffect(() => setSelectedItinerary(0), [results]);

  const routeIndex = cityData && loc.routeKey ? cityData.routes.findIndex((r) => r.key === loc.routeKey) : -1;
  const route = routeIndex >= 0 ? cityData!.routes[routeIndex] : null;
  const stop = cityData && loc.stopId ? cityData.stops.find((s) => s.id === loc.stopId) ?? null : null;

  const activeRoutes = useMemo(() => {
    if (!cityData) return [];
    return cityData.routes
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => (showInactive || r.status === 'operational' || r.status === 'unverified') && (!systemFilter || r.system === systemFilter))
      .map(({ i }) => i);
  }, [cityData, showInactive, systemFilter]);

  const itinerary = loc.tab === 'plan' && results?.length ? results[Math.min(selectedItinerary, results.length - 1)] : null;
  const highlight = useMemo(() => (route ? [routeIndex] : stop ? stop.routes : []), [route, routeIndex, stop]);
  const background = useMemo(() => (loc.tab === 'plan' && itinerary ? [] : activeRoutes), [loc.tab, itinerary, activeRoutes]);

  const locate = useCallback(
    (then?: (p: { lat: number; lon: number }) => void) => {
      if (!navigator.geolocation) {
        setGeoStatus('denied');
        return;
      }
      setGeoStatus('locating');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy };
          setGeo(p);
          setGeoStatus('ok');
          then?.(p);
        },
        () => setGeoStatus('denied'),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      );
    },
    [],
  );

  const pick = useCallback(
    (which: 'from' | 'to', lat: number, lon: number, label?: string) => {
      const place: Place = { lat, lon, label: label ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}` };
      go({ tab: 'plan', routeKey: null, stopId: null, [which]: place }, false);
      setSheetOpen(true);
    },
    [go],
  );

  const openRoute = (i: number) => {
    if (!cityData) return;
    go({ tab: 'routes', routeKey: cityData.routes[i].key, stopId: null });
    setSheetOpen(true);
  };
  const openStop = (id: string) => {
    go({ tab: 'routes', stopId: id, routeKey: null });
    setSheetOpen(true);
  };
  const setTab = (tab: Tab) => {
    go({ tab, routeKey: null, stopId: null });
    setSheetOpen(true);
  };

  const city = index?.cities.find((c) => c.id === cityId);
  const provinces = useMemo(() => {
    const m = new Map<string, DatasetIndex['cities']>();
    for (const c of index?.cities ?? []) {
      if (!m.has(c.province)) m.set(c.province, []);
      m.get(c.province)!.push(c);
    }
    // The nationwide intercity network goes first, before the provinces.
    return [...m.entries()].sort(([a], [b]) => Number(b === 'Pakistan') - Number(a === 'Pakistan'));
  }, [index]);

  const outsideCity = geo && city && !(geo.lat >= city.bbox[0] && geo.lat <= city.bbox[2] && geo.lon >= city.bbox[1] && geo.lon <= city.bbox[3]);
  // The intercity box covers the whole country, so suggest it only when no city contains the location.
  const inBox = (c: DatasetIndex['cities'][number]) => geo!.lat >= c.bbox[0] && geo!.lat <= c.bbox[2] && geo!.lon >= c.bbox[1] && geo!.lon <= c.bbox[3];
  const cityForGeo = outsideCity ? (index?.cities.find((c) => c.id !== 'intercity' && inBox(c)) ?? index?.cities.find(inBox)) : null;

  let panel: React.ReactNode = <p className="hint pad">{error ? t.loadError : t.loading}</p>;
  if (cityData && index) {
    if (loc.tab === 'plan') {
      panel = (
        <PlanPanel
          data={cityData}
          lang={lang}
          t={t}
          from={loc.from}
          to={loc.to}
          results={results}
          selected={selectedItinerary}
          womenOnly={womenOnly}
          onFrom={(p) => go({ from: p }, false)}
          onTo={(p) => go({ to: p }, false)}
          onSwap={() => go({ from: loc.to, to: loc.from }, false)}
          onLocate={() => locate((p) => pick('from', p.lat, p.lon, t.myLocation))}
          onSelect={setSelectedItinerary}
          onWomenOnly={setWomenOnly}
          onRoute={openRoute}
        />
      );
    } else if (loc.tab === 'routes' && route) {
      panel = <RouteDetail data={cityData} route={route} lang={lang} t={t} selectedStopId={null} onBack={() => window.history.length > 1 ? window.history.back() : setTab('routes')} onStop={openStop} />;
    } else if (loc.tab === 'routes' && stop) {
      panel = (
        <StopDetail
          data={cityData}
          stop={stop}
          lang={lang}
          t={t}
          onBack={() => (window.history.length > 1 ? window.history.back() : setTab('routes'))}
          onRoute={openRoute}
          onPlanFrom={() => pick('from', stop.lat, stop.lon, localName(lang, stop))}
          onPlanTo={() => pick('to', stop.lat, stop.lon, localName(lang, stop))}
        />
      );
    } else if (loc.tab === 'routes') {
      panel = (
        <RouteList
          data={cityData}
          lang={lang}
          t={t}
          systemFilter={systemFilter}
          showInactive={showInactive}
          onSystemFilter={setSystemFilter}
          onShowInactive={setShowInactive}
          onRoute={openRoute}
          onStop={openStop}
        />
      );
    } else if (loc.tab === 'nearby') {
      panel = <NearbyPanel data={cityData} lang={lang} t={t} location={geo} status={geoStatus} onLocate={() => locate()} onStop={openStop} onRoute={openRoute} />;
    } else {
      panel = <AboutPanel data={cityData} index={index} lang={lang} t={t} />;
    }
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'plan', label: t.plan, icon: '⇄' },
    { id: 'routes', label: t.routes, icon: '☰' },
    { id: 'nearby', label: t.nearby, icon: '◎' },
    { id: 'about', label: t.about, icon: 'ⓘ' },
  ];

  return (
    <div className={`app ${sheetOpen ? 'sheet-open' : 'sheet-closed'}`}>
      <aside className="panel" aria-label={t.appName}>
        <header className="topbar">
          <a className="brand" href={`#/${cityId ?? ''}`} onClick={() => setTab('plan')}>
            <img src={`${import.meta.env.BASE_URL}icons/favicon.svg`} alt="" width="34" height="34" />
            <span>
              <strong>{t.appName}</strong>
              <small>{t.tagline}</small>
            </span>
          </a>
          <div className="top-actions">
            <button type="button" className="ghost" onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} lang={lang === 'en' ? 'ur' : 'en'}>
              {t.language}
            </button>
            <button type="button" className="ghost icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={t.theme} title={t.theme}>
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <button type="button" className="ghost icon sheet-toggle" onClick={() => setSheetOpen((v) => !v)} aria-expanded={sheetOpen} aria-label="Toggle panel">
              {sheetOpen ? '▾' : '▴'}
            </button>
          </div>
        </header>

        {index && (
          <div className="city-row">
            <label htmlFor="city" className="sr-only">
              {t.city}
            </label>
            <select
              id="city"
              value={cityId ?? ''}
              onChange={(e) => {
                setSystemFilter(null);
                go({ city: e.target.value, routeKey: null, stopId: null, from: null, to: null });
              }}
            >
              {provinces.map(([prov, cs]) => (
                <optgroup key={prov} label={prov}>
                  {cs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {localName(lang, c)}{t.sep}{num(lang, c.routes)} {t.routesWord}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        <nav className="tabs" role="tablist">
          {tabs.map((tb) => (
            <button key={tb.id} type="button" role="tab" aria-selected={loc.tab === tb.id} className={loc.tab === tb.id ? 'on' : ''} onClick={() => setTab(tb.id)}>
              <span aria-hidden="true">{tb.icon}</span> {tb.label}
            </button>
          ))}
        </nav>

        {cityForGeo && cityForGeo.id !== cityId && (
          <button type="button" className="banner" onClick={() => go({ city: cityForGeo.id, routeKey: null, stopId: null, from: null, to: null })}>
            📍 {localName(lang, cityForGeo)} →
          </button>
        )}

        <div className="panel-scroll">{panel}</div>
      </aside>

      <main className="map-wrap">
        {city && (
          <MapView
            city={city}
            data={cityData}
            lang={lang}
            t={t}
            backgroundRoutes={background}
            highlightRoutes={highlight}
            selectedStopId={loc.stopId}
            itinerary={itinerary}
            from={loc.tab === 'plan' ? loc.from : null}
            to={loc.tab === 'plan' ? loc.to : null}
            userLocation={geo}
            fitKey={`${cityId}|${cityData ? 1 : 0}|${loc.tab}|${loc.routeKey}|${loc.stopId}|${highlight.length}|${itinerary ? selectedItinerary : '-'}|${results?.length ?? ''}`}
            onStopClick={openStop}
            onRouteClick={openRoute}
            onPick={(w, la, lo) => pick(w, la, lo)}
          />
        )}
        <p className="map-disclaimer">{t.disclaimer}</p>
      </main>
    </div>
  );
}
