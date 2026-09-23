# Research output schema (one JSON file per assignment)

Write UTF-8 JSON, 2-space indent. Top level:

{
  "assignment": "karachi-pbs",
  "researched_on": "2026-09-16",
  "systems": [ System, ... ],
  "open_questions": ["things you could not verify"]
}

System:
{
  "id": "karachi-pbs",                      // kebab-case, globally unique
  "city": "karachi",                        // kebab-case city id: karachi, lahore, islamabad-rawalpindi, multan, peshawar, hyderabad, sukkur, larkana, nawabshah, mirpurkhas, quetta, faisalabad, ...
  "name": "Peoples Bus Service",
  "name_ur": "پیپلز بس سروس",
  "operator": "Sindh Mass Transit Authority (operated by NRTC)",
  "mode": "bus" | "brt" | "metro_rail" | "feeder" | "electric_bus",
  "website": "https://...",
  "helpline": "0800-07682" | null,
  "payment": "cash / Breeze card / T-Cash ...",
  "fare_rules": {
     "type": "flat" | "distance_slab" | "stop_count" | "unknown",
     "currency": "PKR",
     "flat": 30 | null,
     "slabs": [ {"up_to_km": 15, "fare": 80}, {"up_to_km": null, "fare": 120} ],
     "concessions": "students/women/senior notes",
     "as_of": "2026-06",               // when this fare was announced
     "source_url": "https://..."
  },
  "hours": { "start": "07:00", "end": "22:00", "notes": "" },
  "sources": [ { "title": "...", "url": "https://...", "publisher": "...", "date": "2025-02-03", "official": true|false } ],
  "routes": [ Route, ... ]
}

Route:
{
  "id": "R1",                               // as printed on bus / official code
  "name": "Khokhrapar - Dockyard",
  "name_ur": "" ,
  "variant": "red" | "pink" | "ev" | "brt" | "metro" | "feeder" | "electric" | "regular",
  "color": "#C62828",                       // official line colour if known, else null
  "status": "operational" | "under_construction" | "planned" | "suspended" | "unverified",
  "launched": "2022-06-27" | null,
  "length_km": 28 | null,
  "headway_min": 10 | null,
  "hours": { "start": "07:00", "end": "22:00" } | null,   // only if differs from system
  "fare_override": null | { ... same shape as fare_rules ... },
  "women_only": false,
  "stops": [ Stop, ... ],                    // ordered from first terminal to last terminal, ONE direction
  "stops_confidence": "high" | "medium" | "low",   // high = official or 2+ agreeing sources
  "stop_times": ["07:30", null, ...],       // optional, timetabled services only (trains): one "HH:MM" or null per stop.
                                            // Such a route runs only in its listed direction; the return is its own route.
  "sources": [ { "title": "...", "url": "..." } ],
  "notes": "conflicts between sources, recent changes, extensions etc."
}

Stop:
{
  "name": "Malir Halt",                     // common English/Roman spelling used locally
  "name_ur": "ملیر ہالٹ" | "",
  "lat": 24.8921 | null,
  "lon": 67.1843 | null,
  "coord_source": "osm:node/123456" | "osm:way/789" | "wikipedia" | null,
  "is_station": true | false                // true for BRT/metro stations with platforms
}

Rules
- Never invent stops or coordinates. Unknown = null. Record source conflicts in `notes`.
- Prefer official sources (SMTA, PMA, TransPeshawar, CDA, Punjab govt) > Wikipedia > reputable news (Dawn, Tribune, The News, Geo, ARY) > route-info sites (rehbar.pk, redbus.shop, thinktransportation.net, zameen blog, incpak).
- Prefer the most recent information (2025-2026). Mention if routes were renamed/extended/suspended.
- Coordinates: fill only from OpenStreetMap (Overpass API: https://overpass-api.de/api/interpreter) or Wikipedia infobox. Always put the OSM element id in coord_source. Do not bulk-geocode with Nominatim; a pipeline will geocode missing stops later.
- Do not copy long prose from sources; stop names, numbers and short facts only.
