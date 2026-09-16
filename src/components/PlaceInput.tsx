import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { matches, searchPlaces, type Place } from '../lib/data';
import type { Dict, Lang } from '../lib/i18n';
import { localName } from '../lib/i18n';
import type { CityData } from '../types';

interface Props {
  label: string;
  placeholder: string;
  value: Place | null;
  data: CityData;
  lang: Lang;
  t: Dict;
  marker: 'from' | 'to';
  onChange: (p: Place | null) => void;
  onLocate?: () => void;
}

export default function PlaceInput({ label, placeholder, value, data, lang, t, marker, onChange, onLocate }: Props) {
  const [text, setText] = useState(value?.label ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [searching, setSearching] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const id = useId();

  useEffect(() => setText(value?.label ?? ''), [value]);

  const stopHits = useMemo(() => {
    if (!text.trim() || (value && text === value.label)) return [];
    return data.stops
      .filter((s) => matches(text, s.name, s.name_ur))
      .sort((a, b) => b.routes.length - a.routes.length)
      .slice(0, 8);
  }, [text, data, value]);

  const items: Place[] = [
    ...stopHits.map((s) => ({ lat: s.lat, lon: s.lon, label: localName(lang, s), stopId: s.id })),
    ...(places ?? []),
  ];

  const choose = (p: Place) => {
    onChange(p);
    setText(p.label);
    setOpen(false);
    setPlaces(null);
  };

  const runPlaceSearch = async () => {
    if (!text.trim()) return;
    abort.current?.abort();
    abort.current = new AbortController();
    setSearching(true);
    try {
      setPlaces(await searchPlaces(text, data.city.bbox, abort.current.signal));
    } catch {
      setPlaces([]);
    } finally {
      setSearching(false);
      setOpen(true);
    }
  };

  return (
    <div className="place-input">
      <label htmlFor={id} className="place-label">
        <span className={`dot dot-${marker}`}>{marker === 'from' ? 'A' : 'B'}</span>
        {label}
      </label>
      <div className="place-row">
        <input
          id={id}
          type="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(0);
            setPlaces(null);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, items.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (items[active]) choose(items[active]);
              else runPlaceSearch();
            } else if (e.key === 'Escape') setOpen(false);
          }}
        />
        {onLocate && (
          <button type="button" className="icon-btn" onClick={onLocate} title={t.myLocation} aria-label={t.myLocation}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        )}
      </div>
      {open && text.trim() && !(value && text === value.label) && (
        <ul className="suggestions" id={`${id}-list`} role="listbox">
          {stopHits.length > 0 && <li className="group">{t.stopsLabel}</li>}
          {items.map((p, i) => (
            <li
              key={`${p.stopId ?? 'p'}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(p);
              }}
            >
              <span className={p.stopId ? 'sg-icon stop' : 'sg-icon place'} aria-hidden="true" />
              {p.label}
              {p.stopId && <small>{data.stops.find((s) => s.id === p.stopId)?.routes.length} {t.routesWord}</small>}
            </li>
          ))}
          {places && places.length === 0 && <li className="muted">{t.noPlaces}</li>}
          {!places && (
            <li className="search-more" onMouseDown={(e) => { e.preventDefault(); runPlaceSearch(); }}>
              {searching ? t.searching : `🔎 ${t.searchPlaces}`}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
