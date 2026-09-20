# Deep sweep of code hosts, FYP repos and dataset portals (2026-09-21)

Second, wider pass after `sources-datasets.md`. Everything below was **fetched and opened**: repos were
downloaded as tarballs, data files parsed, and every coordinate set was scored against our own OSM
gazetteer (`incoming/osm-transit-stops/pk-transit-stops.geojson`) by name match + haversine distance.
A dataset is called genuine only if its coordinates land on the real stop; "fabricated" means the
numbers are interpolated, rounded to a grid, or otherwise invented.

Searched: GitHub repository API (45 query shapes, 112 distinct Pakistani hits), 62 repos downloaded in
full; GitLab, Codeberg, Hugging Face, Zenodo, OSF, figshare, Harvard Dataverse, npm, PyPI; Google
Scholar / ResearchGate / university-repository queries. GitHub *code* search and grep.app both need a
login or return a Vercel challenge, so repository search plus whole-repo download was used instead.

## Ranked table

| # | Source | Contents | Coords? | Format | Licence (exact) | Updated | Usable? |
|---|--------|----------|---------|--------|-----------------|---------|---------|
| 1 | **Karachi Bus Network**, Zenodo 10.5281/zenodo.13951512 (Pasta, Khan, Aslam — Habib University) → `incoming/zenodo-karachi-bus-network/` | **76 route labels → 81 ordered chains, 1,571 stop entries, 572 unique stops**, all with lat/lon. Minibus, coach, Peoples Bus (Route-3…12), EV-1…3, Pink Bus, Green Line, Orange Line | **Yes, real** | CSV (node + edge list) + GraphML + R script | **Creative Commons Attribution 4.0 International (CC-BY-4.0)** | 2024-10-18 | **Yes — best new find** |
| 2 | **Karachi Smart Transit System (public)**, `FAST-Dev-Team-Semester-Projects/karachi-smart-transit-system-public` → `incoming/ksts-karachi-mit/` | 26 routes / 466 ordered route-stop rows / **235 stops with coords**: Green Line, 5 planned BRT corridors, PBS R1–R13, EV1–5, Pink P1/P2/P3/P9/P10 | **Yes, real** (median 101 m from OSM) | JSON + MySQL seed SQL | **MIT** (LICENSE, © 2025 Syed Haider Murtaza, Muhammad Rayyan, Muhammad Mujtaba Kamran) | 2026-04-23 | **Yes** |
| 3 | `naumanaarif/musafir` → `data/mnzil_scrapedata.json`, scraped from **mnzil.app** (Cheeltech) | **145 vehicles: 66 Chinchi, 62 bus, 15 Peoples Bus, 2 BRT; 1,775 stop entries, 436 unique names**. Chinchi/Qingqi routes appear in no other source we have | No | JSON | **None** in the repo; upstream mnzil.app footer says "© 2026 Cheeltech. All Rights Reserved." | 2026-05-17 | **No — but ask Cheeltech.** Highest-value permission target |
| 4 | `mabdullahamjad/Rahnuma` → `data/transit-routes/*.pdf` + `src/data/transitData.ts` | 26 Isl-Rwp routes: 4 BRT + **FR-1…FR-10 + R-1…R-10 (Rawalpindi feeders)**. We currently have no Rawalpindi R-series. PDFs are "Transit Routes" sheets (PDF creator: Google Sheets), plus an Islamabad-Rawalpindi metro map dated December 2025 | Repo says only coords from "Copy of Transit Routes.xlsx" are used; none found in `transitData.ts` | TS + PDF | **None stated** | 2026-07-27 | **No as-is.** Chase the PDFs' real origin (CDA) — the route list itself is a genuine gap-filler |
| 5 | `Fahad741/SpeedoRoutes` → `details.html` | **34 Lahore Speedo routes** with ordered stops, first/last bus, frequency, approx length. We hold 23 | No | HTML | **None stated** | 2026-05-09 | **No.** Unsourced; termini match the official 34-route list, intermediate stops unverified. Worth asking the author |
| 6 | `shaheerhussain05/Karachi-Bus-Routes-Finder` | `cleaned_karachi_graph.json`: 1,182 stop nodes, **289 distinct Karachi route labels** (adjacency, not ordered sequences) + `location_coords.json` with **700 geocoded stops** (580 nulls) | Partly real (median 442 m; 10 hits are in Bangalore/Hyderabad-India/Sharjah) | JSON | **None stated** | 2025-06-21 | **No.** No licence, no stop order, dirty geocoding |
| 7 | `Aawaiz-Soomro/Karachi-Transit-Guide` (+ `_V2`, identical `data.ts`) | PBS + BRT routes, 115 stop coords | Mostly real (median 233 m) but several stops share one coordinate | TS | **None stated** | 2026-06-14 | No |
| 8 | `Umaimamashhood/safarz` | `extracted_routes.json`, 52 Karachi routes OCR'd from WhatsApp images + `safarz.db` | No | JSON/SQLite | **None stated** | 2026-09-07 | No — and it is the same route corpus we already have from RastaYaar |
| 9 | `dearabesss/Karachi-Transit` | `transitData.ts`, 81 stop coords | Real-ish (median 575 m) | TS | **None stated** | 2026-09-05 | No |
| 10 | `BilalAntall/nav-lahore` | Lahore Metrobus 27 stations with accurate coords, Orange Line and "eco bus" info text | Yes, real for Metrobus | JSON/TXT | **None stated** | 2026-06-11 | No — and OSM relation 19984670 already gives us this |
| 11 | `daniyalaslam63/lahore-bus-routes` + `rawalpindi-bus-routes` | Terminal-pair edge lists (Speedo 34 pairs; Rawalpindi metro/feeder pairs), plus `lahorebusroutes.xlsx` | No | TXT/XLSX | **None stated** | 2019-07 | No — pairs only, no intermediate stops |
| 12 | `usamajaved1928/pu_buses_route_optimizer` | **Punjab University Lahore staff-shuttle** routes, `data.csv` (577 name rows) + `coordinates.csv` (74 points) | Yes | CSV | **None stated** | 2022-04 | No — university shuttle, out of scope, no licence |
| 13 | `iam-devAlhan/people-bus-service-karachi-helpdesk_slackbot` | `People_Bus_Service_Scraped_Data.csv` — PBS routes 1–13 + EV | No | CSV | **None stated** | 2025-08 | No — it is the Wikipedia PBS table, which we already hold |
| 14 | `mohdabrarbaloch-arch/day-3-rasta` | `scripts/seed.py`, 42 Karachi stops | **Weak** — median 2.74 km from OSM, hand-typed approximations | Python | **MIT** | 2026-08-12 | No — licence is fine, the data is not |
| 15 | `SajjadArifGul/TransitPakistan` | 2017 FYP, Karachi Android app; route working files as `.xlsx` under `Documents/Rough/` | unchecked | XLSX in an 85 MB repo | **None stated** | 2017-04 | No |

## Do not use (verified reasons)

- **`Ubaidrees/raahiq` ("RaahIQ", Karachi Public Transit Dataset).** `bus_routes.json` holds 70 routes /
  1,575 stop entries — **the same corpus as RastaYaar**: 28 of the 52 routes we kept match our file
  stop-for-stop, and the other 24 differ only by the spellings we already fixed (Reejant→Regent,
  Metrovils→Metroville…). Its release notes advertise "`stop_coordinates.json`: pre-geocoded GPS
  coordinates for ~1,750+ unique bus stops"; the file is literally `{}` on both `main` and the `v1.0`
  tag, the release has **no assets**, and `build_stop_coordinates.py` shows the coordinates are meant
  to be generated locally from the OpenRouteService geocoder. **No licence.** Adds nothing.
- **`Mubalyy/BusEasePk` `Database/speedo.json` — fabricated coordinates.** 15 Lahore Speedo routes, 351
  stops, but the latitudes step in a straight line: FRT03 runs −0.0072, −0.0060, −0.0060, −0.0055,
  −0.0055, −0.0040, −0.0030, −0.0025, −0.0025… with longitude rising in matching increments. That is
  interpolation between two terminals, not survey. Rejected. (Its `metro.json`, 27 Metrobus stations
  at 13–15 decimal places, looks hand-picked off a map and is redundant with OSM.)
- **`varunsainani/smart-bus-route-finder` `database/full_dump.sql` — fabricated coordinates.** 49 stops
  at exactly 3 decimals marching in near-uniform steps (25.015/67.068 → 24.999/67.061 → 24.985/67.056
  → 24.972/67.053). Nagan Chowrangi lands ~1 km off. The repo's own seed script says the operational
  rows are generated by a seeded PRNG. No licence either.
- **`fazal305/karachi-transit-tracker`** — already rejected in `sources-datasets.md`; re-confirmed.
- **`Asad-noob69/RedBus-API`**, **`FahadImdad/bus-kahan-hai`**, **`Arooba-21/Karachi-Transit-Navigator`**
  — unchanged from the previous sweep.
- **No data at all** (opened and checked): `MuhammadGhayas1/punjab-electric-bus` (landing page only),
  `zainsandhu001/lahore-smart-transit-guide`, `hasnainahmad87/peshawar-brt-tracker`,
  `JAVERIA-TALAB9/peshawar-BRT-frontend`, `hannan228/tarinoriginal` (APKs only),
  `SufiyanAasim/metro-navigation-system` (MIT, but no route data),
  `Muhammad-Noman-804/BusKahan-Hai`, `drawarpk958-source/karachi-bus-booking-app` (MIT, 2 files),
  `arida4466-ctrl/SafeDrive-FYP`, `Zeeshan281199/BUS-TRACKING-APP`, `hanan-bhatti/transitFLOW-cli`,
  `Neeha2005/Metrobot`, `Ahmadjamil888/pak-maps` (GPL-3.0, intercity road routing only),
  `Adil2723/Karachi-Smart-Transit-System` and `MujtabaQureshiii/SDA-PROJECT-KSTS` (course PDFs),
  `LaibaNadeem14/NED_Route_Finder` (MIT, report + code, no dataset),
  `eeshasaqib/Pakistan-Bus-Delay-Predictor` (MIT, but intercity *delay* samples, no routes),
  `waqas-ansari/KarachiBusRoute`, `Ibrahimkhawaja/…`, `basitali1509/Route-Tracker`,
  `Syed-Bilal-Hassan-SBH/NextStop-AI-Metro-Tracker-FYP`.
- **Hard-coded route strings inside C++/Java course projects** (`fizafarooqq/Karachi-Red-Bus-Route-Finder`
  and `AyeshaAbdulRahman/Karachi-Red-Bus-RouteFinder` share a byte-identical 25 KB source;
  `muhammadshaheer18/Shortest-Route-of-Red-Bus-using-Dijikstra`;
  `HairamNaseem/People-s-Bus-Service-Shortest-Route-Finder`): PBS route 1–13 stop lists we already hold,
  no licence, no coordinates.
- **`S-Hoorain/Karachi-Bus-Network-Dynamic-Transit-Analysis`** is a verbatim copy of the Zenodo CSVs
  (row 1 and 2 above). Useful only as corroboration that the Zenodo files circulate unchanged.

## Dead ends by host

- **GitLab**: 0 Pakistani transit projects across 6 query shapes. **Codeberg**: 0. **Bitbucket**: no
  public search worth the name; nothing surfaced via web search.
- **Hugging Face datasets**: `karachi` → AQI and a university prospectus; `lahore` → traffic images and
  a polling-booth set. Nothing transit.
- **OSF**: 0. **figshare**: only journal articles and PLOS supplementary tables — no route data.
  **Harvard Dataverse**: 0. **Kaggle**: nothing Pakistan-transit (confirmed again).
- **Zenodo**: a title-scoped query (`title:(bus AND (karachi OR lahore OR pakistan))`) returns exactly
  7 records. Six are papers with no data (BRT Corridor III engineering analysis, Lahore BRT evaluation,
  Peshawar BRT benchmarking, harassment at Lahore bus stops, Green Line impact, intercity terminals).
  The seventh is row 1. `Proposing Local Demand in Public Transport Network in Lahore` (18092489,
  CC-BY-4.0, 2025-12) is a paper only — worth reading, but it publishes no route file.
- **npm / PyPI**: no package embeds Pakistani route data. The only transit-data package that surfaced
  is `straeto` (Iceland).
- **IEEE DataPort / Mendeley Data**: no Pakistani transit dataset reachable without a subscription.
- Still no **GTFS** anywhere, and still no timetables.

## The two usable finds in detail

### 1. Zenodo — Karachi Bus Network (CC-BY-4.0) → `incoming/zenodo-karachi-bus-network/`

Files copied verbatim: `karachi_bus_network_node_data.csv` (572 rows: `node, latit, long`),
`karachi_bus_network_edge_list.csv` (1,490 rows: `stop1, stop2, bus_name`), `generate_bus_network.R`.
I also wrote `karachi-zenodo-routes.schema.json`, a SCHEMA.md-shaped conversion.

**Why I believe it.** Every one of the 572 points falls inside the Karachi bounding box; latitudes carry
7–8 decimals (a map pick, not a grid); there are no duplicate-coordinate runs and no arithmetic
stepping. 44 stop names match our OSM gazetteer by normalised name, and the **median offset is 49 m**,
with 32 of 44 inside 300 m. The four worst outliers are name collisions, not bad data (Chandni Chowk,
Nursery, Jinnah University, Korangi 2½ — generic names that exist more than once).

**How it maps to SCHEMA.md.**
- `bus_name` → `Route.id` / `Route.name`. Consecutive `(stop1, stop2)` rows for one `bus_name` chain
  into an ordered single-direction `Route.stops`, exactly what SCHEMA.md asks for.
  Four labels (`D-10`, `17-I`, `45-A`, `pink_bus`) bundle more than one alignment; the chain breaks
  cleanly and I split them into `…-part1/-part2`, so 76 labels become 81 routes. Re-merge by hand if
  the parts turn out to be one loop.
- `node` → `Stop.name` (snake_case, so `pretty()` re-cases it; keep the raw string as a join key),
  `latit`/`long` → `Stop.lat`/`Stop.lon`, `coord_source` → `zenodo:10.5281/zenodo.13951512`.
- No fares, hours, headways, Urdu names or `is_station` flags: leave null.

**Which of our systems it improves.**
- `karachi-minibus`: checked id by id against all 390 Karachi route ids we already hold, **14 numbered
  routes are new** — 1-E, 1-L, 2-C, 7-K, 45-A, 51-C, 61-A, C-2, C-3, D-4, D-10, F-1, F-18, G-55 — plus
  **13 named coaches** we have no record of: Agroor, Al-Noor, DATA, GUL, Gulistan, Mahfooz, National,
  Omar, Safari, Shaheen, Sheraz, Starline and Super Hassan Zai. The rest overlap with
  `karachi-minibus-2010` / `karachi-minibus-current` and act as a second opinion on those stop orders.
- **It is our first Karachi minibus source with coordinates at all.** Both `karachi-minibus-current`
  (RastaYaar) and `karachi-minibus-2010` (URC) are 100% `lat: null` — 1,845 distinct un-geocoded stop
  names between them. **356 of those match a Zenodo point on normalised name alone**, before any fuzzy
  matching, so this is the single biggest lever we have on the geocoding backlog after OSM.
- It also independently corroborates PBS Route-3/4/9/10/11/12, EV-1…3, Green and Orange Line stop lists.

**What the licence allows.** CC-BY-4.0: copy, redistribute, remix and build upon, commercially too, as
long as we credit. Credit line to use: *"Karachi Bus Network — Muhammad Qasim Pasta, Moid Raza Khan,
Fatima Aslam (Habib University), 2024, DOI 10.5281/zenodo.13951512, CC BY 4.0."* No share-alike, so it
mixes with ODbL OSM data without forcing anything new on the rest of our corpus — but check
`DATA_LICENSE.md`, because ODbL's share-alike still governs whatever we derive from OSM.
**One caveat to record:** the authors state they read the coordinates off **Google Maps**. They licensed
their dataset CC-BY, but Google's terms restrict re-publishing data derived from its maps. That is a
question for the project owner; the safest route is to treat these points as a *matching aid* and
re-anchor each stop onto an OSM node before publishing.

### 2. Karachi Smart Transit System (MIT) → `incoming/ksts-karachi-mit/`

Copied: `stops.json` (235 stops, `stop_id/stop_name/latitude/longitude`), `routes.json` (26),
`routes_stops.json` (466 rows with `stop_order`), the `LICENSE`, and the three MySQL seed scripts from
the private-side repo (same authors, same MIT licence). `ksts-routes.schema.json` is my conversion.

**Why I believe it.** 31 names match our OSM gazetteer with a **median offset of 101 m** (20 inside
300 m); no duplicate coordinates; Green Line checks out station by station (Numaish 24.8724/67.0353,
Power House 24.9843/67.0661). The four worst outliers are named-place ambiguities (Bahria Town, Airport,
Nursery, DHA Phase 1).

**How it maps to SCHEMA.md.** `routes_stops.stop_order` is already our ordered `Route.stops`;
`stops.latitude/longitude` → `Stop.lat/lon`; `is_station: true` for the six BRT "Corridor" routes.
`route_name` carries the terminals in brackets, which fills `Route.name`.

**Which of our systems it improves.** `karachi-pbs` and `karachi-brt` — it supplies **coordinates and
ordered stops for Pink Bus P1/P2/P3/P9/P10 and EV1–EV5**, and a full 22-stop Green Line. Treat the Red,
Yellow, Blue and Brown "Corridor" rows as **planned alignments** (`status: planned`), not service; the
Orange Line row has only 4 stops and should be dropped in favour of ours.

**What the licence allows.** MIT — reuse, modify and redistribute, including commercially, provided the
copyright notice and permission text travel with it. Keep `incoming/ksts-karachi-mit/LICENSE` in the
tree and add the line *"Portions © 2025 Syed Haider Murtaza, Muhammad Rayyan, Muhammad Mujtaba Kamran,
MIT"* to `DATA_LICENSE.md`. MIT is a software licence being applied to data, which is loose but
unambiguous enough to rely on.

## Worth asking permission for

1. **Cheeltech (mnzil.app)** — 145 Karachi routes including **66 Chinchi/Qingqi routes**, a mode we have
   no data on anywhere. Site says all rights reserved; there is no API. Ask for a CC-BY or ODbL release.
2. **`itsdeewankumar-tech/rastayaar`** — still the most current minibus list; still unlicensed. Asking
   the author to add a licence file remains the single highest-value email.
3. **Urban Resource Centre, Karachi** — unchanged from the last sweep, for the 2010 344-route PDF.
4. **`Fahad741/SpeedoRoutes`** — 34 Lahore Speedo routes with stops against our 23; ask where the stop
   lists came from before trusting them.
5. **`mabdullahamjad/Rahnuma`** — ask for the original "Copy of Transit Routes.xlsx" and who issued it.
   If it is CDA's, the Rawalpindi R-1…R-10 feeders are a clean gap-fill for `islamabad-rawalpindi`.

## Method notes

- Repository search hit `api.github.com/search/repositories` (45 queries, paced under the 10/min
  unauthenticated limit). Whole repos came from `codeload.github.com/<repo>/tar.gz/refs/heads/<branch>`,
  which avoids the 60/hour core-API limit; 62 repos were pulled and scanned for Pakistani stop-name
  signatures and Pakistan-range coordinates.
- GitHub code search, grep.app and Sourcegraph are all gated now (login or bot challenge), so
  literal-string searches for `W-11`, `R-10 Numaish`, `FR-04`, `RT-19`, `MFR`, `LOV-101` could not be run
  directly; they were approximated by downloading every plausible repo and grepping locally.
- Coordinate verification script logic: normalise names (fold `Chorangi/Chowrangi`, drop
  `Bus/Stop/Station/Route`, strip brackets), match against city-filtered OSM stops, take the minimum
  haversine distance, then report median, count under 300 m, and the decimal-place histogram.
  Anything with repeating differences between consecutive stops was treated as interpolated.
