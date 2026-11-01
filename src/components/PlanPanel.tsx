import type { Place } from '../lib/data';
import type { Dict, Lang } from '../lib/i18n';
import { fmtDistance, fmtMinutes, localName, num } from '../lib/i18n';
import type { Itinerary } from '../lib/planner';
import type { CityData } from '../types';
import PlaceInput from './PlaceInput';
import { RouteBadge } from './RouteBadge';

interface Props {
  data: CityData;
  lang: Lang;
  t: Dict;
  from: Place | null;
  to: Place | null;
  results: Itinerary[] | null;
  selected: number;
  womenOnly: boolean;
  onFrom: (p: Place | null) => void;
  onTo: (p: Place | null) => void;
  onSwap: () => void;
  onLocate: () => void;
  onSelect: (i: number) => void;
  onWomenOnly: (v: boolean) => void;
  onRoute: (index: number) => void;
}

export default function PlanPanel(p: Props) {
  const { data, lang, t, results, selected } = p;
  const stops = new Map(data.stops.map((s) => [s.id, s]));
  const stopName = (id?: string) => {
    const s = id ? stops.get(id) : undefined;
    return s ? localName(lang, s) : '';
  };
  /** Scheduled time at a stop of a timetabled route (trains), as " (07:30)". */
  const at = (routeIndex: number, id?: string) => {
    const r = data.routes[routeIndex];
    const time = id && r.stop_times ? r.stop_times[r.stops.indexOf(id)] : null;
    return time ? ` (${time})` : '';
  };
  const money = (it: Itinerary) =>
    it.fare == null ? t.fareUnknown : `${it.fareIsApprox ? '~' : ''}${t.rs} ${num(lang, it.fare)}${it.fareIsPartial ? '+' : ''}`;

  return (
    <div className="panel-body">
      <div className="plan-inputs">
        <PlaceInput label={t.from} placeholder={t.fromPlaceholder} value={p.from} data={data} lang={lang} t={t} marker="from" onChange={p.onFrom} onLocate={p.onLocate} />
        <button type="button" className="swap-btn" onClick={p.onSwap} title={t.swap} aria-label={t.swap}>
          ⇅
        </button>
        <PlaceInput label={t.to} placeholder={t.toPlaceholder} value={p.to} data={data} lang={lang} t={t} marker="to" onChange={p.onTo} />
      </div>
      <label className="check">
        <input type="checkbox" checked={p.womenOnly} onChange={(e) => p.onWomenOnly(e.target.checked)} />
        {t.womenOnly}
      </label>

      {!p.from || !p.to ? (
        <p className="hint">{t.pickOnMap}</p>
      ) : results && results.length === 0 ? (
        <p className="empty">{t.noResults}</p>
      ) : results ? (
        <>
          <ol className="itineraries">
            {results.map((it, i) => {
              const rides = it.legs.filter((l) => l.kind === 'ride');
              return (
                <li key={i}>
                  <button type="button" className={`itinerary ${i === selected ? 'selected' : ''}`} onClick={() => p.onSelect(i)} aria-pressed={i === selected}>
                    <div className="it-top">
                      <strong className="it-time">{fmtMinutes(t, lang, it.totalMinutes)}</strong>
                      <span className="it-fare">{it.rides ? money(it) : ''}</span>
                    </div>
                    <div className="it-chain">
                      {rides.length === 0 && <span className="walk-chip">🚶 {t.walkOnly}</span>}
                      {rides.map((l, j) => (
                        <span key={j} className="chain-item">
                          {j > 0 && <span className="chain-sep">›</span>}
                          {l.kind === 'ride' && <RouteBadge route={data.routes[l.routeIndex]} />}
                        </span>
                      ))}
                    </div>
                    <div className="it-meta">
                      {it.rides === 1 ? t.direct : it.rides > 1 ? `${num(lang, it.rides - 1)} ${it.rides === 2 ? t.transfer : t.transfers}` : ''}
                      {it.rides > 0 && t.sep}🚶 {fmtDistance(t, lang, it.walkMetres)}
                      {i === 0 && <span className="best-chip">{t.bestOption}</span>}
                    </div>
                  </button>
                  {i === selected && (
                    <ol className="steps">
                      {it.legs.map((leg, j) =>
                        leg.kind === 'walk' ? (
                          <li key={j} className="step walk">
                            <span className="step-icon">🚶</span>
                            <div>
                              {t.walk} {fmtDistance(t, lang, leg.metres)}{t.sep}{fmtMinutes(t, lang, leg.minutes)}
                              {leg.to.stopId && (
                                <div className="muted">
                                  → {stopName(leg.to.stopId)}
                                </div>
                              )}
                            </div>
                          </li>
                        ) : (
                          <li key={j} className="step ride" style={{ ['--route-color' as string]: data.routes[leg.routeIndex].color }}>
                            <span className="step-icon">{data.routes[leg.routeIndex].mode === 'rail' ? '🚆' : '🚌'}</span>
                            <div>
                              <button type="button" className="linklike" onClick={() => p.onRoute(leg.routeIndex)}>
                                <RouteBadge route={data.routes[leg.routeIndex]} /> {localName(lang, data.routes[leg.routeIndex])}
                              </button>
                              <div>
                                {t.board}: <strong>{stopName(leg.stopIds[0])}</strong>
                                <span dir="ltr">{at(leg.routeIndex, leg.stopIds[0])}</span>
                              </div>
                              <div className="muted">
                                {t.towards} {stopName(data.routes[leg.routeIndex].stops[leg.reverse ? 0 : data.routes[leg.routeIndex].stops.length - 1])}
                              </div>
                              <details>
                                <summary>
                                  {num(lang, leg.stopIds.length - 1)} {leg.stopIds.length - 1 === 1 ? t.stop : t.stops}{t.sep}{num(lang, leg.km.toFixed(1))} {t.km}{t.sep}{fmtMinutes(t, lang, leg.minutes)}
                                  {leg.fare != null && `${t.sep}${leg.fareExact ? '' : '~'}${t.rs} ${num(lang, leg.fare)}`}
                                </summary>
                                <ol className="mini-stops">
                                  {leg.stopIds.map((id) => (
                                    <li key={id}>{stopName(id)}</li>
                                  ))}
                                </ol>
                              </details>
                              <div>
                                {t.getOff}: <strong>{stopName(leg.stopIds[leg.stopIds.length - 1])}</strong>
                                <span dir="ltr">{at(leg.routeIndex, leg.stopIds[leg.stopIds.length - 1])}</span>
                              </div>
                            </div>
                          </li>
                        ),
                      )}
                    </ol>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="note">{t.estimatesNote}</p>
        </>
      ) : null}
    </div>
  );
}
