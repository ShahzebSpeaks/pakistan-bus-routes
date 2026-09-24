# Bulk datasets and timetables, round 2 (2026-09-24)

This round checked GTFS catalogues, Wikiroutes, the official Pakistan Railways timetable, intercity bus timetables and other bulk sources. Earlier findings in `sources-*.md` are not repeated here; only new checks or changes are listed. Every request was read-only, spaced 1.2–1.5 s apart, with no login and no captcha. Nothing in `data/` was changed.

## New files

| File | What it holds | Licence / terms | Parses |
|---|---|---|---|
| `incoming/pakrail-official-timetable.json` | **75 train directions** with 1,627 stop rows. Each stop has `station`, `station_code`, `arr`, `dep`, `day`, `distance_km` and `running_state`. It also lists the 52 dropdown codes the API did not return. | Official Pakistan Railways data. No licence or API terms are published. The times are facts, so cite the source. | yes |
| `incoming/intercity-timetables.json` | **321 operator × corridor records**: 7 official NATCO records and 314 from pkbuses.com. There are 992 departures and 68 operators; 55 operators are not yet in `data/systems`. The shape is `{system_hint, operator, from, to, departures[], departures_per_day, first, last, bus_types, source_url, official, fetched, …}`. | NATCO: official, no licence. pkbuses.com: third party, no licence; its terms only say "respect the intellectual property rights". The times are facts. | yes |
| `incoming/wikiroutes.json` | SCHEMA.md format. **4 systems, 7 routes and 97 stop entries, all with coordinates** (`coord_source: wikiroutes:stop/<id>`). | **Restricted.** Read the Wikiroutes section before merging. | yes |
| `incoming/osm-route-relations.json` | The diff against the 60 relations harvested on 2026-09-16. **1 new relation.** | ODbL-1.0 | yes |
| `cache/pakrail-api/` | Raw `stopTimeTable` responses, `getStations.json` (342 stations with codes) and the fetch and build scripts | Pakistan Railways (see above) | – |
| `cache/citylines/` | Citylines exports for Lahore, Karachi, Islamabad and Faisalabad | **ODbL-1.0** | – |
| `cache/osm-relations-2026-09-24/` | Tags of every PK route relation, plus relation 21419077 | ODbL-1.0 | – |

`cache/gtfs/` was not created, because there is no Pakistani GTFS zip to download.

## 1. GTFS feeds: still none

- **Mobility Database.** The catalogue CSV (`https://bit.ly/catalogs-csv` redirects to `storage.googleapis.com/…/sources.csv`) has 3,511 rows. **None are Pakistani (PK)**; the region has only IN 19 and LK 1. A text search for Pakistan and city names also found nothing. The GitHub tree re-download failed on network truncation. The CSV is generated from that repo, so this does not change the result.
- **Transitland, OpenMobilityData/TransitFeeds, Transitous.** These were not re-checked because `sources-ecosystem-deep.md` did so on 2026-09-21. The Transitland API still needs a key.
- **Agency pages.** CDA `cdaTransitMap`, PMA `route-maps` and TransPeshawar were scanned for `gtfs`, `.zip` or open-data links and have none. `smta.gos.pk` timed out.
- **Google Transit partner feeds** are never public. The CDA request drafted in `sources-apis.md` is still the route to a GTFS feed.

## 2. Wikiroutes: small, and its terms forbid reuse

- **Coverage.** `https://wikiroutes.info/en/country/pakistan` lists only **Faisalabad, Islamabad, Lahore and Peshawar**, with **7 routes in total**:

  | Wikiroutes city | Route | Stops | Timetable | Last edited |
  |---|---|---|---|---|
  | Faisalabad | Bus 11b (Kotwali – Khurianwala loop) | 34 | 31 departures, 07:00–22:00, every 30 min | 2018-03 |
  | Faisalabad | 1 No. Wagon (Narwala Chowk – Allied Hospital loop) | 12 | service window 07:00–22:00, Rs 30 | 2018-03 |
  | Faisalabad | 20 No. Wagon (Chenab Chowk – GTS loop) | 15 | service window 07:00–22:00, Rs 20 | 2018-03 |
  | Lahore | FR-08 (Thokar – Canal) | 13 | service window 06:00–23:00 | 2018-11 |
  | Lahore | Metro Bus System | 19 (the real line has 27) | – | 2016-04 |
  | Islamabad → **re-homed to `murree`** | Patriata cable car | 2 | – | – |
  | Peshawar → **re-homed to `abbottabad`** | Ayubia gondola | 2 | – | – |

  The cable cars were moved to the city where their coordinates actually fall. `cable_car` is not a mode in SCHEMA.md, so it is used here as a proposed extension. The three Faisalabad loops list the outbound and return legs in one sequence.
- **Useful additions.** Stop order and coordinates for the three Faisalabad routes, which `private-intracity-2.md` knew only by name. Everything else is stale or already covered by better sources.
- **Terms: the owner must decide before merging.**
  - The User Agreement (`https://wikiroutes.info/en/manual/agreement`) limits data to "personal, non-commercial use" and prohibits "any extraction, copying, reproduction, processing, distribution of the Service data, its placement at free access (publication) on the Internet". The footer reads "© 2026 WikiRoutes. All rights reserved."
  - `robots.txt` has `User-agent: ClaudeBot / Disallow: /`. `User-agent: *` is allowed, and this was a one-off user-directed fetch of 7 routes and 96 stop pages.
  - Wikiroutes data is also sold through the BusMaps API, which needs a key.
  - Deciding to accept unofficial sources with attribution does not override an explicit no-republication clause. Either treat these 7 routes as a matching aid only, or ask `support@wikiroutes.info` for permission.

## 3. Pakistan Railways official timetable: found

- **`pakrail.gov.pk/TrainTiming.aspx`** still returns no rows. It was re-tested today with a valid form post (trains 9UP and 201UP).
- **`www.pakrailways.gov.pk/train` (RABTA)** has a public "Train" page. The page calls three endpoints on `https://isapi.pakrailways.gov.pk/v1/` with `isToken:false`, meaning no login:
  - `GET /ticket/getStations` returns 342 stations with codes such as KCT, LHR, RWP and PSC.
  - `POST /ticket/trainInfo/trainInfoList` with `{boardStationCode, arrivalStationCode, travelDate:"YYYY-MM-DD"}` returns the trains between a station pair on a date, each with a `trainDirDay.id`.
  - `GET /ticket/trainInfo/stopTimeTable/<trainDirDay.id>` returns every stop with arrival, departure, day offset and cumulative km.
  - `GET /ticket/trainTimes` returns **401**, so it was left alone.

  `sources-ecosystem-deep.md` had advised against touching this host. Only the three anonymous read endpoints that the public page itself uses were called: 64 station-pair lookups (plus retries on two more dates) and 75 timetable fetches. Do not poll it. For reuse permission, the RTI route in that file still applies.
- **Results:**
  - 75 directions are covered.
  - **Not in the API:** Bolan Mail 3/4, Shalimar 27/28, Badar 111/112, Ghouri 113/114, Ravi 121/122, Mehran 149/150, Narowal Passenger 211/212, Marvi 335/336, Chaman Mixed 349/350, Shah Hussain 43/44, Jinnah 31/32, Sir Syed 35/36, KCR-1 to KCR-4, the PDK shuttles, and the Eid/Sehwan/test specials. These may be suspended or sold outside RABTA.
  - **New trains that are not in `pakistan-railways-trains.json`:** 171UP/172DN (Lahore–Wazirabad, 13 stops), and S2DN/S3UP/S4DN (Pind Dadan Khan / Malakwal / Lala Musa / Sargodha shuttles).
- **Compared with our pakinformation.com-based file:**
  - 57 of 70 shared trains have the same stop count; 13 differ by 1–2 stops.
  - The origin departure time differs for 5 trains (API vs ours): 10DN 07:00 vs 07:30, 25UP 18:15 vs 18:30, 126DN 05:30 vs 05:00, 135UP 08:00 vs 06:00, and 210DN 04:45 vs 05:00.
  - The API is the official, current source, so prefer it.
  - 27 stop rows have `running_state` of "0". The site marks these "(Stop)"; the meaning is unclear, and it may be a suspended halt.
- **Licence.** None is published. Train times are facts, so cite `https://www.pakrailways.gov.pk/train`.

## 4. Intercity bus timetables

| Source | Result |
|---|---|
| **natco.gov.pk** (Bookme-hosted) | `/times` now redirects to the home page. The home page embeds the whole NATCO network as JSON: 14 origins, 81 origin–destination pairs, with a schedule window of 2026-09-23 to 2026-10-23. The `/times` search form (CSRF token, no captcha) returned departures for **7 corridors on 2026-09-26**: Rawalpindi→Gilgit 14:00 and 15:00 (Rs 5,000), →Hunza 14:00, →Karachi 22:30, →Chilas 15:00, →Gahkuch 16:00; Gilgit→Rawalpindi 10:00 and 11:00; Hunza→Rawalpindi 08:00. Thirteen other pairs, including Skardu and Karachi→north, returned nothing on 09-26 and 09-29. **Official.** |
| daewoo.com.pk | `GetDepartureOnLoad` works (terminal list), but `GetArrivalsByDeparture` still returns `[]` and `SearBusSchedule` returns HTTP 500. **Dead end** again. |
| faisalmovers.com | `/booking?origin=&destination=&date=` renders an empty, truncated page. City pages hold template text only. **Dead end.** |
| skywaysonline.pk | The `/bookingsecond` POST answers "No Routes Available" for all 7 major pairs tried. **Dead end.** |
| roadmaster.pk | HTTP 500 |
| bookme.pk | `robots.txt` allows Claude-User. Its operator pages (21 in the bus sitemap) carry no times, and search goes through its private API. **Dead end** for times. |
| **pkbuses.com `/bus-timings`** | 131 pages: 15 corridor pages and 116 operator pages. After de-duplication these give **314 operator × corridor timetables, 983 departures, 68 operators and 194 corridors**, marked "verified" between Jun and Jul 2026. **Third party and often incomplete**: for example, it lists one Daewoo Lahore→Islamabad departure. Treat the counts as a lower bound. |

`system_hint` maps each operator to our existing `intercity-*` system where one exists (13 do). Otherwise it is `new:<slug>`: 55 operators and 233 records, such as Sandhu Power, Crystal Lines, Moon Ways, Madina Flying Coach, Motorway Express and AL Makkah President.

## 5. Other bulk sources

| Source | Finding | Licence | Verdict |
|---|---|---|---|
| **OSM route relations (Overpass, 2026-09-24T04:53Z)** | There are 61 public-transport relations in PK now: 17 bus, 29 railway, 9 train, 2 subway, 1 trolleybus and 3 masters. **Only one is new:** route_master 21419077, "Ganj Gate to Jameel Chowk" (operator Qingqi, share_taxi). It is on Phandu Road, Peshawar, and holds 2 ways, no stops and no child routes, so it is mis-tagged. Karachi, Hyderabad, Sukkur, Quetta and the Punjab e-bus cities still have no bus relations. | ODbL | Usable, but adds almost nothing |
| **Citylines.co** (new to us) | Covers Lahore, Karachi, Islamabad and Faisalabad. Lahore: Metrobus and Orange Line, with 52 stations that carry OSM ids and opening years. Islamabad: Metrobus lines 1 and 2, with 32 stations, most unnamed. Karachi: 4 KCR sections, no stations. Faisalabad: empty. It is OSM-derived and small. API: `/api/<city>/view/base_data` and `/api/<city>/raw_source/{stations,sections}`. | **ODbL-1.0** (DbCL for contents); code MIT | Usable for opening years and polylines only |
| **Kaggle** (the public list API works without a key) | `arooba21/karachi-public-transit-routes-and-stops`, CC0, 2026-09-20, 8 KB: routes, stops and stop_times, **derived from the URC 2010 list, with synthetic delays**. `muhammdrehman/metro-bus-and-orange-line-geospatial-lahore`, labelled MIT, 2025-12: **a Citylines export relabelled MIT, but it is really ODbL**. `zerghamwarraich1/pakistan-railways-shapefiles`: licence unknown, 2021. The others are images or synthetic. | as listed | No new usable data. Files not downloaded, because Kaggle downloads need a login. |
| GitHub (14 queries, repos pushed since 2026-09-15) | Only unrelated repos (a Peshawar BRT lost-and-found app, business demos) | – | Nothing new |
| HDX (CKAN, group `pak`) | 17 hits: hotosm roads and railways (ODbL), accessibility indicators (CC-BY-SA), World Bank indicators. **No transit routes.** | – | Dead end (unchanged) |
| Zenodo, figshare | Recent-first searches give only papers and unrelated data. The CC-BY Karachi Bus Network (10.5281/zenodo.13951512) is still the only route dataset. | – | Nothing new |
| opendata.com.pk | `package_search` for bus, transit, metro or railway returns 0 | – | Dead end |
| data.gov.pk | HTTP 404 | – | Dead end |

## Suggested next steps

1. Import `pakrail-official-timetable.json` as the **authoritative times** for the 70 matching trains, and add 171/172 and the S-series shuttles. Keep pakinformation.com only for the 30 of our 100 train directions the API does not return (listed in section 3).
2. Use the NATCO records to fill `intercity-natco` departures. Load pkbuses as `unverified` departures, and triage the 55 new operators before creating systems for them.
3. Do not merge `wikiroutes.json` until the owner rules on the Wikiroutes terms. At most, use its 3 Faisalabad stop sequences as a matching aid.
4. The GTFS situation is unchanged. The CDA feed request remains the single highest-value ask.
