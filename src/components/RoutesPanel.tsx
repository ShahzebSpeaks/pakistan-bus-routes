import { useMemo, useState } from 'react';
import { issueUrl } from '../config';
import { matches } from '../lib/data';
import type { Dict, Lang } from '../lib/i18n';
import { localName, num } from '../lib/i18n';
import type { CityData, FareRules, Route, Stop, SystemInfo } from '../types';
import { RouteBadge } from './RouteBadge';

/** Copies the current page link (routes and stops have their own URL). */
export function ShareButton({ t }: { t: Dict }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-outline"
      onClick={async () => {
        const url = window.location.href;
        try {
          if (navigator.share) await navigator.share({ url });
          else {
            await navigator.clipboard.writeText(url);
            setDone(true);
            setTimeout(() => setDone(false), 2000);
          }
        } catch {
          /* the user dismissed the share sheet */
        }
      }}
    >
      {done ? '✓ ' + t.copied : '↗ ' + t.share}
    </button>
  );
}

const ACTIVE = new Set(['operational', 'unverified']);

export function fareText(f: FareRules | undefined, t: Dict, lang: Lang) {
  if (!f || f.type === 'unknown') return t.fareUnknown;
  if (f.type === 'flat' && f.flat != null) return `${t.rs} ${num(lang, f.flat)}`;
  if (f.type === 'range' && f.min != null && f.max != null) return `${t.rs} ${num(lang, f.min)}–${num(lang, f.max)}`;
  if (f.slabs?.length) {
    const v = f.slabs.map((s) => s.fare);
    const lo = Math.min(...v);
    const hi = Math.max(...v);
    return lo === hi ? `${t.rs} ${num(lang, lo)}` : `${t.rs} ${num(lang, lo)}–${num(lang, hi)}`;
  }
  return t.fareUnknown;
}

interface ListProps {
  data: CityData;
  lang: Lang;
  t: Dict;
  systemFilter: string | null;
  showInactive: boolean;
  onSystemFilter: (id: string | null) => void;
  onShowInactive: (v: boolean) => void;
  onRoute: (index: number) => void;
  onStop: (id: string) => void;
}

export function RouteList({ data, lang, t, systemFilter, showInactive, onSystemFilter, onShowInactive, onRoute, onStop }: ListProps) {
  const [q, setQ] = useState('');
  const stopsById = useMemo(() => new Map(data.stops.map((s) => [s.id, s])), [data]);

  const filtered = useMemo(() => {
    return data.routes
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => (showInactive || ACTIVE.has(r.status)) && (!systemFilter || r.system === systemFilter))
      .filter(({ r }) => {
        if (!q.trim()) return true;
        if (matches(q, r.id, r.name, r.name_ur)) return true;
        return r.stops.some((id) => {
          const s = stopsById.get(id);
          return s && matches(q, s.name, s.name_ur);
        });
      });
  }, [data, q, systemFilter, showInactive, stopsById]);

  const stopHits = useMemo(
    () => (q.trim().length >= 2 ? data.stops.filter((s) => matches(q, s.name, s.name_ur)).slice(0, 5) : []),
    [q, data],
  );

  const bySystem = new Map<string, { r: Route; i: number }[]>();
  for (const item of filtered) {
    if (!bySystem.has(item.r.system)) bySystem.set(item.r.system, []);
    bySystem.get(item.r.system)!.push(item);
  }
  const systems = new Map(data.systems.map((s) => [s.id, s]));
  const systemsWithRoutes = data.systems.filter((sys) => data.routes.some((r) => r.system === sys.id));
  const inactiveCount = data.routes.filter((r) => !ACTIVE.has(r.status)).length;

  return (
    <div className="panel-body">
      <input className="search" type="search" placeholder={t.searchRoutes} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.searchRoutes} />
      {systemsWithRoutes.length > 1 && (
        <div className="chips" role="group">
          <button type="button" className={`chip ${!systemFilter ? 'on' : ''}`} onClick={() => onSystemFilter(null)}>
            {t.allSystems}
          </button>
          {systemsWithRoutes.map((s) => (
            <button key={s.id} type="button" className={`chip ${systemFilter === s.id ? 'on' : ''}`} onClick={() => onSystemFilter(systemFilter === s.id ? null : s.id)}>
              {localName(lang, s)}
            </button>
          ))}
        </div>
      )}
      {inactiveCount > 0 && (
        <label className="check">
          <input type="checkbox" checked={showInactive} onChange={(e) => onShowInactive(e.target.checked)} />
          {t.showNonOperational} ({num(lang, inactiveCount)})
        </label>
      )}
      {stopHits.length > 0 && (
        <ul className="stop-hits">
          {stopHits.map((s) => (
            <li key={s.id}>
              <button type="button" className="linklike" onClick={() => onStop(s.id)}>
                <span className="sg-icon stop" aria-hidden="true" /> {localName(lang, s)} <small>{num(lang, s.routes.length)} {t.routesWord}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
      {[...bySystem.entries()].map(([sid, items]) => {
        const sys = systems.get(sid)!;
        return (
          <section key={sid} className="system-group">
            <h3>
              {localName(lang, sys)} <small>{sys.operator}</small>
            </h3>
            <ul className="route-list">
              {items.map(({ r, i }) => (
                <li key={r.key}>
                  <button type="button" className="route-row" onClick={() => onRoute(i)}>
                    <RouteBadge route={r} />
                    <span className="route-row-main">
                      <span className="route-name">{localName(lang, r)}</span>
                      <span className="route-sub">
                        {num(lang, r.stops.length)} {r.stops.length === 1 ? t.stop : t.stops}
                        {r.length_km ? `${t.sep}${num(lang, r.length_km)} ${t.km}` : ''}
                        {r.women_only ? `${t.sep}${t.womenOnlyBadge}` : ''}
                      </span>
                    </span>
                    {r.status !== 'operational' && <span className={`status status-${r.status}`}>{t[r.status]}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

interface DetailProps {
  data: CityData;
  route: Route;
  lang: Lang;
  t: Dict;
  selectedStopId: string | null;
  onBack: () => void;
  onStop: (id: string) => void;
}

export function RouteDetail({ data, route, lang, t, selectedStopId, onBack, onStop }: DetailProps) {
  const system = data.systems.find((s) => s.id === route.system) as SystemInfo;
  const stops = new Map(data.stops.map((s) => [s.id, s]));
  const hours = route.hours ?? system?.hours;
  // Times that go backwards mean the service has passed midnight: show "+1", "+2" days.
  const timeLabels = (() => {
    if (!route.stop_times) return null;
    let day = 0;
    let prev = -1;
    return route.stop_times.map((hm) => {
      if (!hm) return null;
      const [h, m] = hm.split(':').map(Number);
      const min = h * 60 + m;
      if (prev >= 0 && min < prev - 60) day++;
      prev = min;
      return day ? `${hm} +${day}` : hm;
    });
  })();
  const firstTime = timeLabels?.find(Boolean);
  const lastTime = timeLabels?.at(-1);
  const approxStops = route.stops.filter((id) => {
    const q = stops.get(id)?.quality;
    return q === 'estimated' || q === 'geocoded';
  }).length;
  const body = `**Route:** ${route.key} (${route.name})\n**City:** ${data.city.name}\n\n**What is wrong?**\n\n**Correct information and source (link, photo or official notice):**\n`;

  return (
    <div className="panel-body">
      <button type="button" className="back" onClick={onBack}>
        ← {t.back}
      </button>
      <header className="detail-head" style={{ ['--route-color' as string]: route.color }}>
        <RouteBadge route={route} />
        <div>
          <h2>{localName(lang, route)}</h2>
          <p className="muted">
            {localName(lang, system)}{t.sep}<span className={`status status-${route.status}`}>{t[route.status]}</span>
            {route.women_only && <span className="status status-pink">{t.womenOnlyBadge}</span>}
          </p>
        </div>
      </header>

      <dl className="facts">
        <div>
          <dt>{t.fare}</dt>
          <dd>{fareText(route.fare, t, lang)}</dd>
        </div>
        {route.length_km != null && (
          <div>
            <dt>{t.length}</dt>
            <dd>
              {num(lang, route.length_km)} {t.km}
            </dd>
          </div>
        )}
        {firstTime && (
          <div>
            <dt>{t.departs}</dt>
            <dd dir="ltr">{firstTime}</dd>
          </div>
        )}
        {lastTime && (
          <div>
            <dt>{t.arrives}</dt>
            <dd dir="ltr">{lastTime}</dd>
          </div>
        )}
        {hours && (hours.start || hours.end) && (
          <div>
            <dt>{t.hours}</dt>
            <dd dir="ltr">
              {hours.start ?? '?'}–{hours.end ?? '?'}
            </dd>
          </div>
        )}
        {route.headway_min != null && (
          <div>
            <dt>{t.headway}</dt>
            <dd>
              {num(lang, route.headway_min)} {t.min}
            </dd>
          </div>
        )}
        <div>
          <dt>{t.confidence}</dt>
          <dd>{t[route.stops_confidence]}</dd>
        </div>
        {route.launched && (
          <div>
            <dt>{t.launched}</dt>
            <dd dir="ltr">{route.launched}</dd>
          </div>
        )}
      </dl>
      {route.departures && route.departures.length > 0 && (
        <section className="departures">
          <h3>{t.departuresTitle}</h3>
          {route.departures.map((d) => (
            <p key={`${d.from}-${d.source_url}`}>
              <strong>{d.from}</strong>:{' '}
              <span dir="ltr">{d.times.join(', ')}</span>{' '}
              <a className="muted" href={d.source_url} target="_blank" rel="noopener">
                ({d.official ? t.officialSource : t.unofficialSource}
                {d.as_of ? `, ${d.as_of}` : ''})
              </a>
            </p>
          ))}
        </section>
      )}
      {route.fare?.concessions && <p className="note">{route.fare.concessions}</p>}
      {!route.shape && <p className="note warn">{t.noMapLine}</p>}
      {approxStops > 0 && (
        <p className="note warn">
          ◌ {num(lang, approxStops)} {approxStops === 1 ? t.stop : t.stops}: {t.estimated}
        </p>
      )}

      <ol className="timeline" style={{ ['--route-color' as string]: route.color }}>
        {route.stops.map((id, i) => {
          const s = stops.get(id) as Stop;
          const others = s.routes.filter((ri) => data.routes[ri].key !== route.key);
          return (
            <li key={`${id}-${i}`} className={`${selectedStopId === id ? 'selected' : ''} ${s.quality === 'estimated' ? 'approx' : ''}`}>
              <button type="button" className="tl-stop" onClick={() => onStop(id)}>
                {timeLabels?.[i] && (
                  <time className="tl-time" dir="ltr">
                    {timeLabels[i]}
                  </time>
                )}
                <span className="tl-name">{localName(lang, s)}</span>
                {others.length > 0 && (
                  <span className="tl-transfers">
                    {others.slice(0, 6).map((ri) => (
                      <RouteBadge key={ri} route={data.routes[ri]} />
                    ))}
                    {others.length > 6 && <small>+{num(lang, others.length - 6)}</small>}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {route.notes && (
        <section className="notes">
          <h3>{t.notes}</h3>
          <p>{route.notes}</p>
        </section>
      )}
      <Sources t={t} sources={[...route.sources, ...(system?.sources ?? [])]} />
      <SystemContact t={t} system={system} />
      <div className="btn-row">
        <ShareButton t={t} />
        <a className="btn btn-outline" href={issueUrl(`Route correction: ${route.key}`, body)} target="_blank" rel="noopener">
          ✎ {t.reportIssue}
        </a>
      </div>
    </div>
  );
}

export function Sources({ t, sources }: { t: Dict; sources: { title: string; url: string; date?: string }[] }) {
  const seen = new Set<string>();
  const unique = sources.filter((s) => s?.url && !seen.has(s.url) && seen.add(s.url));
  if (!unique.length) return null;
  return (
    <section className="sources">
      <h3>{t.sources}</h3>
      <ul>
        {unique.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title || new URL(s.url).hostname}
            </a>
            {s.date && <small> · {s.date}</small>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SystemContact({ t, system }: { t: Dict; system?: SystemInfo }) {
  if (!system) return null;
  return (
    <dl className="facts compact">
      {system.operator && (
        <div>
          <dt>{t.operator}</dt>
          <dd>{system.operator}</dd>
        </div>
      )}
      {system.helpline && (
        <div>
          <dt>{t.helpline}</dt>
          <dd>
            <a href={`tel:${system.helpline.replace(/[^\d+]/g, '')}`} dir="ltr">
              {system.helpline}
            </a>
          </dd>
        </div>
      )}
      {system.payment && (
        <div>
          <dt>{t.payment}</dt>
          <dd>{system.payment}</dd>
        </div>
      )}
      {system.website && (
        <div>
          <dt>{t.officialWebsite}</dt>
          <dd>
            <a href={system.website} target="_blank" rel="noopener noreferrer">
              {new URL(system.website).hostname}
            </a>
          </dd>
        </div>
      )}
    </dl>
  );
}

interface StopProps {
  data: CityData;
  stop: Stop;
  lang: Lang;
  t: Dict;
  onBack: () => void;
  onRoute: (index: number) => void;
  onPlanFrom: () => void;
  onPlanTo: () => void;
}

export function StopDetail({ data, stop, lang, t, onBack, onRoute, onPlanFrom, onPlanTo }: StopProps) {
  const body = `**Stop:** ${stop.name} (${stop.id})\n**City:** ${data.city.name}\n**Current position:** https://www.openstreetmap.org/?mlat=${stop.lat}&mlon=${stop.lon}#map=18/${stop.lat}/${stop.lon}\n\n**What is wrong?** (wrong location, wrong name, missing route…)\n\n**Correct information / source:**\n`;
  return (
    <div className="panel-body">
      <button type="button" className="back" onClick={onBack}>
        ← {t.back}
      </button>
      <header className="detail-head">
        <span className="stop-glyph" aria-hidden="true" />
        <div>
          <h2>{localName(lang, stop)}</h2>
          {lang === 'en' && stop.name_ur && <p className="urdu-sub" lang="ur">{stop.name_ur}</p>}
          <p className="muted">
            {t.coordQuality}: <span className={`quality q-${stop.quality}`}>{t[stop.quality]}</span>
          </p>
        </div>
      </header>
      <div className="btn-row">
        <button type="button" className="btn btn-from" onClick={onPlanFrom}>
          {t.planFromStop}
        </button>
        <button type="button" className="btn btn-to" onClick={onPlanTo}>
          {t.planToStop}
        </button>
      </div>
      <h3>{t.routesHere}</h3>
      <ul className="route-list">
        {stop.routes.map((ri) => {
          const r = data.routes[ri];
          const sys = data.systems.find((s) => s.id === r.system);
          return (
            <li key={r.key}>
              <button type="button" className="route-row" onClick={() => onRoute(ri)}>
                <RouteBadge route={r} />
                <span className="route-row-main">
                  <span className="route-name">{localName(lang, r)}</span>
                  <span className="route-sub">{sys ? localName(lang, sys) : ''}</span>
                </span>
                {r.status !== 'operational' && <span className={`status status-${r.status}`}>{t[r.status]}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="btn-row">
        <ShareButton t={t} />
        <a className="btn btn-outline" href={issueUrl(`Stop correction: ${data.city.id}/${stop.id}`, body)} target="_blank" rel="noopener">
          ✎ {t.reportIssue}
        </a>
      </div>
    </div>
  );
}
