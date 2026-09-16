# OSM route relations + Wikidata stations: Pakistan harvest (2026-09-16)

Sources: OpenStreetMap via Overpass (maps.mail.ru mirror, data timestamp 2026-09-16T07:21Z, ODbL, "© OpenStreetMap contributors") and Wikidata SPARQL (CC0).
Outputs:
- `research/osm-route-relations.json`: 58 route relations + 2 route masters, grouped by city, with SCHEMA.md-style routes (ordered stops, `osm:node/<id>`, polylines for non-rail routes)
- `research/wikidata-stations.json`: 1,234 station items
- Raw data: `research/cache/osm-relations/` (60 files) and `research/cache/osm-geometry/` (57 files)

Nothing in `data/` or `public/` was changed.

## 1. OSM: very little transit mapping

The Pakistan area query returned 60 relations. I checked 18 city bounding boxes as well and found **0** more.

| City | Relations | With stops | Notes |
|---|---|---|---|
| islamabad-rawalpindi | 6 | 2 | FR-4 (23 stops, 16.1 km), FR-4 variant (2 stops), FR-04A x2 (geometry only, 2.9 km), Red Metrobus track 13911249 and Orange Metrobus 13911250 (geometry only) |
| lahore | 4 | 3 | Orange Line both directions (26 stops each, 25.4 km, `#F7943A`), Metro Bus System 19984670 (27.1 km, geometry only), 1 train |
| peshawar | 4 | 2 | Zu SR 08 (`#803A1C`, 24.9 km) and DR 05 (17.3 km): geometry only; 2 long-distance trains. Route master "TransPeshawar BRT" is empty |
| multan | 1 | 0 | Multan Metro Bus 10995086: 18.6 km geometry, no stops |
| quetta / chaman / jacobabad | 3 / 1 / 1 | all | Pakistan Railways passenger trains (only rail relations with stops) |
| bahawalpur, faisalabad, kotri | 2 / 1 / 1 | 1 | Small fragments (0.1–0.7 km). Faisalabad B-10 has 1 stop |
| country-wide / unassigned | 34 | 0 | Railway line relations (ML-3, Zhob Valley, branch lines), plus 4 bus stubs with 1–10 members |

**Karachi, Hyderabad, Sukkur and all Punjab electric-bus cities have no bus relations.** There is nothing for Green/Orange Line BRT, Peoples Bus, Pink Bus or KCR.

Totals: 244 stop members, all with coordinates. 172 have `name:ur`. 15 routes have a colour.

## 2. Wikidata: mostly railway stations

- **1,234 items:** 1,180 railway stations, 26 Orange Line stations (24 "elevated" + 2 "metro"), 6 bus stations, 1 bus stop, plus a few junction/border/former stations.
- **Coverage:** 960 have coordinates, 1,196 have Urdu labels, 647 have a line (P81), 1,177 link to English Wikipedia and 1,191 to Urdu Wikipedia.
- **By city:** lahore 61, karachi 38, islamabad-rawalpindi 18, hyderabad 13, peshawar 11, faisalabad 9, quetta 8, multan 6, sukkur 4. 768 are rural stations outside any city radius and have no P131, so `city` is null.
- **Lines:**
  - Orange Line: all 26 stations.
  - Lahore Metrobus: only 4 items (Shahdara, Niazi Chowk, Timber Market, Gajjumata), with no P81.
  - Karachi Circular Railway: its stations exist as ordinary railway stations; only 1 has P81=KCR.
- **Missing entirely:** stations for Rawalpindi-Islamabad Metrobus, Peshawar BRT, Multan Metrobus and Karachi Green/Orange Line BRT. I checked with a label search and P81/P361/P16 links.

## 3. What each system could gain

| Our system | Import | Source |
|---|---|---|
| lahore-orange-line | Official colour `#F7943A` (we have null). Polyline (373 points). Confirms stop order. Coords are already the same OSM nodes (0.01 km apart) | OSM 11803498/11803500 |
| lahore-metrobus | Polyline (27.1 km, colour tag "red"). 4 Wikidata QIDs and Wikipedia links (coords within ~0.2 km of ours) | OSM 19984670, Wikidata |
| multan-metrobus | Polyline (18.6 km vs our 18.5) | OSM 10995086 |
| isb-rwp-metrobus | Polylines for RED and ORANGE, but both carriageways are included, so lengths are 38.6 and 47.5 km | OSM 13911249/13911250 |
| islamabad-electric-feeder FR-04 | Coords for "PIMS Hospital" (our only missing one; OSM "PIMS Gate FR"). Polyline (16.1 km). Route master exists | OSM 18946704 |
| peshawar-zu-brt | Polylines for SR 08 and DR 05. Colour `#803A1C` for SR 08 (compare with ours) | OSM 20012008/20012341 |
| karachi-circular-railway | Urdu names for Karsaz, Depot Hill, Karachi University and Urdu College (after stripping the " ریلوے اسٹیشن" suffix). QIDs for 14 of 19 stops | Wikidata |
| Other systems (name matching) | 64 `name_ur` and 14 coordinate fills, mostly railway-station names that match bus stops (Karachi 18, Lahore 9, Multan 5) | Wikidata |

A few of those name matches are wrong, for example "Islamabad Chowk" matched to Islamabad railway station and "Madharian Wala Chowk" matched to a railway station. **Review every one before import.**

## 4. Conflicts and caveats

- **Wikidata KCR coordinates are off by 1–3 km:** Karsaz 2.56 km, Karachi University 2.95 km, Depot Hill 2.25 km, Baldia 1.19 km, Liaquatabad 1.16 km. Keep our coordinates.
- **Wikidata Urdu labels carry suffixes:** " (لاہور میٹرو)", " ریلوے اسٹیشن", "، لاہور". Strip them before import. 13 Orange Line stations have no Urdu label.
- **Orange Line spellings differ:**

  | Ours | OSM / Wikidata |
  |---|---|
  | Lakshmi Chowk | Lakshmi |
  | Salahuddin Road | Salahudin Road |
  | Shahnoor (Khatam-e-Nabuwat) | Shahnoor |
  | Shalamar Garden | Shalimar Gardens |

  In OSM, 8 Orange Line station nodes have Urdu text in `name=` instead of `name:ur`.
- **FR-04:**
  - Our "Metropolitan Corporation" is 0.41 km from OSM "Municipal Corporation".
  - Our "Youth Hostel" and "Diplomatic Enclave Gate 4" (0.32–0.37 km from the nearest OSM stop) are not stops in OSM.
  - OSM has one stop with no name.
- **Lahore MBS relation** 19984670 has operator "Daewoo Express" and network "Punjab MassTransit Authority".
- **Orange Line OSM relations** are tagged `route=subway`.
- **Gaps:** the length query failed for railway relation 19920896 (Overpass 504), so its `length_km` is null. Railway relations have no polylines.
