# Reusable open datasets / code for Pakistani transit (hunt 2026-09-16)

Every find below was fetched and checked. Licences come from the repo or portal itself. "No licence" means all rights reserved, so it cannot be imported.

## Ranked table

| # | Source | Contents | Coords? | Format | Licence | Updated | Usable? |
|---|--------|----------|---------|--------|---------|---------|---------|
| 1 | **OpenStreetMap via Overpass** (`research/incoming/osm-transit-stops/`) | 2,004 stop/platform/station elements: Karachi 1134, Isl-Rwp 373, Lahore 183, Peshawar 180, Multan 71, Faisalabad 63. About 98% have names, and some have `name:ur` | **Yes, surveyed** | GeoJSON (built by us) | **ODbL-1.0** | live, pulled 2026-09-16 | **Yes.** The best source for stop coordinates |
| 2 | OSM route relations in PK (20 total) | Lahore Orange Line (both directions, rel 11803498/11803500), Lahore MBS 19984670, Isl-Rwp Metrobus 13911249/13911250, Multan Metro 10995086, Zu Peshawar 20012008/20012341, CDA FR-4/FR-04A 18946704/18950634/19222651/19222652, Faisalabad RTA 14168850 | Yes (ordered members + geometry) | OSM relations; tags in `incoming/.../pk-route-relations-tags.json` | **ODbL-1.0** | live | **Yes**, for shapes and stop order of these lines |
| 3 | URC "Bus Routes Karachi" PDF, https://urckarachi.org/wp-content/uploads/2020/07/Bus-Routes-Karachi.pdf | **344 Karachi minibus/coach routes** (incl. W-11, 1-A…, X-, G-, N- series), 5,700 ordered stop mentions, 1,815 unique names | No | PDF (39 pp, text-extractable) | **Not stated** (Urban Resource Centre NGO) | Jan 2010 | **Reference only.** Stop sequences are facts, but ask URC for permission before bulk import. Data is 16 years old and needs checking against a newer source. Not copied into incoming/ |
| 4 | itsdeewankumar-tech/rastayaar (GitHub), `src/data/routes.ts` | 71 Karachi routes with ordered stop names: 28 minibus, 6 coach, 10 named fleets, 8 other, PBS, EV, BRT, double-decker | No | TS array | **None** (all rights reserved) | 2026-09-07 | **No** unless the author adds a licence. Worth asking: it is the most current minibus list |
| 5 | fazal305/karachi-transit-tracker | Green Line (22) + Orange Line (4) stations with lat/lng | Fake | JS | MIT | 2026-09-14 | **No.** The coordinates are a straight-line interpolation (every step about -0.006/+0.006, rounded to 0.0005). Station lists are wrong too (Numaish appears twice; the Orange Line is invented) |
| 6 | Asad-noob69/RedBus-API `utils/busRoutes.js` | PBS routes with "waypoints" | Fake (round, evenly stepped) | JS | None | 2026-08 | No |
| 7 | FahadImdad/bus-kahan-hai | PBS tracker, stops embedded in `app/tracker.tsx` | unverified | TSX | None | 2026-08-19 | No (no licence) |
| 8 | Arooba-21/Karachi-Transit-Navigator | Karachi route finder | ? | web app | NOASSERTION (no LICENSE file found) | 2026-06-17 | No |

## Dead ends (verified)
- **GTFS:** no Pakistan feed on Mobility Database, Transitland (the Transitland feed search showed no Pakistan feeds; its operator API needs a key), TransitFeeds archive, gtfs.org or awesome-transit. No official GTFS from SMTA, PMA, TransPeshawar or CDA.
- **HDX:** hotosm_pak_roads/railways exports exist (ODbL) but have no transit layer. The CKAN search returned 0 transit datasets.
- **opendata.com.pk:** only the "Lahore Urban Transport Plan" (JICA 2012 PDFs, no licence, no route geodata).
- **ArcGIS Hub, Zenodo, figshare, Kaggle, Hugging Face:** nothing Pakistan-transit.
- **waqas-ansari/KarachiBusRoute:** an empty Android skeleton with no data.
- **punjabtransport.org/route list.pdf:** the host would not connect.
- **punjab-electric-bus.vercel.app:** its APK repo is not reachable through the GitHub API, and it has no licence.
- **PBS app (KentKart):** no public API documentation.
- **Timetables:** none found anywhere.

## Mapping OSM gazetteer to SCHEMA.md
`pk-transit-stops.geojson` Feature, mapped to a Stop:
- `properties.name` → `name` (when English exists, some names are Urdu-only; use `name_en` if present)
- `properties.name_ur` → `name_ur`
- `geometry.coordinates[1]` / `[0]` → `lat` / `lon`
- `properties.coord_source` (`osm:node/123`) → `coord_source` as is
- `kind` = `pt_station`/`bus_station` → `is_station: true`; `bus_stop` → `false`
- `properties.city` = our city id (bounding-box assignment)

Suggested pipeline: for each route stop with `lat == null`, fuzzy-match its name within the same city, normalising e.g. "Chowrangi/Chorangi", "No./Number", "Mor/Mour" and dropping the "Bus Stop" suffix. Accept only unique matches, and still require a human check for generic names like "Tower" or "Petrol Pump". For the 20 route relations, fetch members with `rel(ID);>;out geom;` to get ordered stop lists and line shapes.

**Licence duty:** ODbL means credit "© OpenStreetMap contributors". Any derived stop database we publish must also be released under ODbL (share-alike), so check that this fits DATA_LICENSE.md.

**Not yet fetched:** Quetta, Hyderabad, Sukkur, Larkana, Bahawalpur, Sialkot, Gujranwala and the other small e-bus cities. Overpass returned 504. Re-run this per city:
```
[out:json][timeout:90];
(node(S,W,N,E)["highway"="bus_stop"];node(S,W,N,E)["public_transport"~"^(platform|station)$"];
 node(S,W,N,E)["amenity"="bus_station"];way(S,W,N,E)["amenity"="bus_station"];);out tags center;
```

## Side note found during the hunt
`research/reference/karachi-pink-bus.geojson` is **byte-identical** to `karachi-pbs.geojson` (md5 add63ffe…). Both hold Red Bus lines, so the Pink Bus reference file is wrong.
