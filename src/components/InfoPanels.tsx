import { useMemo } from 'react';
import { REPO_URL, asset } from '../config';
import { GridIndex } from '../lib/geo';
import type { Dict, Lang } from '../lib/i18n';
import { fmtDistance, localName, num } from '../lib/i18n';
import type { CityData, DatasetIndex } from '../types';
import { RouteBadge } from './RouteBadge';
import { fareText, Sources, SystemContact } from './RoutesPanel';

interface NearbyProps {
  data: CityData;
  lang: Lang;
  t: Dict;
  location: { lat: number; lon: number } | null;
  status: 'idle' | 'locating' | 'denied' | 'ok';
  onLocate: () => void;
  onStop: (id: string) => void;
  onRoute: (index: number) => void;
}

export function NearbyPanel({ data, lang, t, location, status, onLocate, onStop, onRoute }: NearbyProps) {
  const near = useMemo(() => {
    if (!location) return [];
    return new GridIndex(data.stops).near(location.lat, location.lon, 1500).slice(0, 25);
  }, [data, location]);

  return (
    <div className="panel-body">
      <button type="button" className="btn btn-primary wide" onClick={onLocate}>
        ◎ {t.locateMe}
      </button>
      {status === 'locating' && <p className="hint">{t.locating}</p>}
      {status === 'denied' && <p className="empty">{t.locationDenied}</p>}
      {status === 'ok' && (
        <>
          <h3>{t.nearbyStops}</h3>
          {near.length === 0 ? (
            <p className="empty">{t.noNearby}</p>
          ) : (
            <ul className="nearby-list">
              {near.map(({ item: s, dist }) => (
                <li key={s.id}>
                  <button type="button" className="nearby-stop" onClick={() => onStop(s.id)}>
                    <span className="tl-name">{localName(lang, s)}</span>
                    <span className="muted">{fmtDistance(t, lang, dist)}</span>
                  </button>
                  <div className="nearby-routes">
                    {s.routes.map((ri) => (
                      <button key={ri} type="button" className="badge-btn" onClick={() => onRoute(ri)} title={data.routes[ri].name}>
                        <RouteBadge route={data.routes[ri]} />
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

const QUALITY_ORDER = ['exact', 'sourced', 'matched', 'geocoded', 'estimated'] as const;

function QualityBar({ data, t, lang }: { data: CityData; t: Dict; lang: Lang }) {
  const counts = { exact: 0, sourced: 0, matched: 0, geocoded: 0, estimated: 0 };
  for (const s of data.stops) if (s.quality in counts) counts[s.quality as keyof typeof counts]++;
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="quality-block">
      <div className="quality-bar" role="img" aria-label={t.stopAccuracy}>
        {QUALITY_ORDER.map((q) => counts[q] > 0 && (
          <span key={q} className={`qb q-${q}`} style={{ width: `${(counts[q] / total) * 100}%` }} title={`${t[q]}: ${counts[q]}`} />
        ))}
      </div>
      <ul className="quality-legend">
        {QUALITY_ORDER.filter((q) => counts[q] > 0).map((q) => (
          <li key={q}>
            <span className={`qb q-${q}`} /> {t[q]} <strong>{num(lang, Math.round((counts[q] / total) * 100))}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface AboutProps {
  data: CityData;
  index: DatasetIndex;
  lang: Lang;
  t: Dict;
}

export function AboutPanel({ data, index, lang, t }: AboutProps) {
  return (
    <div className="panel-body about">
      <p className="lead">{t.disclaimer}</p>

      <section>
        <h3>{t.totals}</h3>
        <div className="stats">
          <div><strong>{num(lang, index.totals.cities)}</strong><span>{t.citiesWord}</span></div>
          <div><strong>{num(lang, index.totals.systems)}</strong><span>{t.systemsWord}</span></div>
          <div><strong>{num(lang, index.totals.routes)}</strong><span>{t.routesWord}</span></div>
          <div><strong>{num(lang, index.totals.stops)}</strong><span>{t.stopsWord}</span></div>
        </div>
      </section>

      <section>
        <h3>{t.stopAccuracy}</h3>
        <QualityBar data={data} t={t} lang={lang} />
      </section>

      <section>
        <h3>{t.systemsInCity}</h3>
        {data.systems.map((s) => {
          const routes = data.routes.filter((r) => r.system === s.id);
          return (
            <details key={s.id} className="system-card">
              <summary>
                <span className="sys-name">{localName(lang, s)}</span>
                <span className="sys-badges">
                  {routes.slice(0, 8).map((r) => <RouteBadge key={r.key} route={r} />)}
                  {routes.length > 8 && <small>+{num(lang, routes.length - 8)}</small>}
                </span>
              </summary>
              <dl className="facts compact">
                <div>
                  <dt>{t.fare}</dt>
                  <dd>{fareText(s.fare_rules, t, lang)}{s.fare_rules.as_of ? ` (${s.fare_rules.as_of})` : ''}</dd>
                </div>
                {s.hours && (s.hours.start || s.hours.end) && (
                  <div>
                    <dt>{t.hours}</dt>
                    <dd dir="ltr">{s.hours.start ?? '?'}–{s.hours.end ?? '?'}</dd>
                  </div>
                )}
                {s.last_verified && (
                  <div>
                    <dt>{t.lastVerified}</dt>
                    <dd dir="ltr">{s.last_verified}</dd>
                  </div>
                )}
              </dl>
              {s.fare_rules.concessions && <p className="note">{s.fare_rules.concessions}</p>}
              <SystemContact t={t} system={s} />
              <Sources t={t} sources={s.sources} />
            </details>
          );
        })}
      </section>

      <section>
        <h3>{t.downloads}</h3>
        <ul className="downloads">
          <li><a href={asset('downloads/pakistan-bus-routes-gtfs.zip')}>⬇ {t.gtfs}</a></li>
          <li><a href={asset('downloads/pakistan-bus-routes.geojson')}>⬇ {t.geojson}</a></li>
          <li><a href={asset('downloads/stops.csv')}>⬇ {t.csv}</a></li>
        </ul>
      </section>

      <section>
        <h3>{t.howItWorks}</h3>
        <p>{t.howItWorksBody}</p>
        <p className="muted">
          {t.licenseNote}{' '}
          <a href={asset('privacy.html')}>{t.privacyPolicy}</a>
        </p>
        <a className="btn btn-outline" href={REPO_URL} target="_blank" rel="noopener">
          ★ {t.contribute}
        </a>
      </section>
      <p className="muted small" dir="ltr">
        v{index.version} · data built {index.generated_at.slice(0, 10)}
      </p>
    </div>
  );
}
