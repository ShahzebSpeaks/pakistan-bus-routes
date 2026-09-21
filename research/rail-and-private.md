# Pakistan Railways trains and private intracity routes (2026-09-21)

Outputs:
- `research/incoming/pakistan-railways-trains.json`: city `intercity`, system `pakistan-railways`, mode `rail`, 100 routes (one per train number and direction), variant `rail`.
- `research/incoming/pakistan-railways/passenger-fare-2025-04-20.json`: the official fare table (w.e.f. 20 April 2025), extracted from the PDF.
- `research/incoming/private-intracity.json`: private wagon, Suzuki and Hiace routes outside Karachi and Lahore.
- Working files and scripts are in `research/cache/pr-trains/`: `build_trains.py`, `match.py`, `parse_pakinfo.py`, `parse_fares.py`, Wikipedia wikitext, pakinformation.com HTML, and the Overpass station dump.

All three JSON files parse. Nothing in `data/` was changed.

## A. Pakistan Railways passenger trains

### Coverage
- The official list at pakrail.gov.pk has 122 entries.
- **100 are built as routes:** 47 named trains, each as UP and DN (94 routes), plus 6 PDK shuttle services.
- **100 of 100 routes have ordered stops.** That is 1,867 stops in total, and 1,852 of them (99.2%) have coordinates.
- **88 routes have coordinates for every stop.** The other 12 miss one or two small halts.
- Status: 94 `operational`, 4 `suspended`, 2 `unverified`.
  - Suspended: Jinnah Express 31/32 and Sir Syed Express 35/36. pakinformation.com says "closed", and Wikipedia gives 2019–21 for Jinnah and 2024–25 for Sir Syed.
  - Unverified: Shah Hussain 43/44. Wikipedia says "2025-Suspended", but the train is still in the official list with a timetable.
- `stops_confidence`: 59 `high` (OSM, or pakinformation.com within 3 stations of Wikipedia's list), 41 `medium`.
- 56 routes have an end-to-end Economy fare.
- **Not built:** 22 entries. These are 9 Eid/"Special Train" services, 6 Sehwan specials, 99UP TEST, 167UP Talibgaran-e-Chal Madina and 170DN Mohaddis-e-Azam (event specials), and KCR-1 to KCR-4. KCR is already in `research/incoming/pakistan-railways/kcr-services.json`.

### Method and source priority
1. **Stop order from OSM route relations (ODbL):** used for 5 train directions: 349UP and 350DN Chaman Mixed, 4DN Bolan Mail, 146DN Sukkur Express and 103UP Subak Kharam.
   - The brief said 38 train relations had ordered stops. `osm-route-relations.json` actually has only 8. The other two are Khushhal Khan Khattak 20DN and Zahedan 403UP, and neither is in the official list.
   - Relation 19834928 (Rehman Baba 48DN) was not used, because its members are not in travel order.
   - Arrival and departure times are attached to OSM stops from pakinformation.com wherever a station matched within 3 km. Any stations the timetable has and OSM lacks are listed in `notes`.
2. **The Pakistan Railways website has no timetable data.** TrainTiming.aspx returns no rows, and pakrailways.gov.pk/train is a single-page app on the booking API, which is excluded. So every other stop list comes from the **pakinformation.com timetable pages**: one table per direction, with arrival and departure times. These are third-party pages. Their "effective" labels range from 2024 to 2026, and each route's notes quote that label.
3. **Wikipedia train articles** were used for:
   - cross-checking the station lists (the station count goes in `notes`)
   - distance (`length_km`), journey time, classes and Urdu name
   - operating period and status, from the "List of named passenger trains of Pakistan"
4. **Coordinates:**
   - First, a Wikidata station match (CC0, `wikidata:<qid>`), found by normalised name. Aliases handle abbreviations and misspellings such as "Karachi Cant", "T.T Singh", "Drig Road" and "Liaqatpur". When the same name occurs twice, the stop nearest the previous one wins.
   - Otherwise, OSM `railway=station/halt` nodes (`osm:node/<id>`). These came from one Overpass bbox query on overpass.private.coffee, with OSM data as of 2026-07-15, filtered to nodes within about 30 km of a Pakistani Wikidata station.
   - No geocoding was done.
5. **Direction:**
   - The UP/DN direction comes from pakinformation.com (its headings and its "X to Y is N Up" text) and from the Wikipedia infobox.
   - These sources disagree for Badar (111UP), Ghouri (113UP) and Mianwali (147UP). Each case is explained in the route's notes.
6. **Hours:** `route.hours` is the departure from the first stop and the arrival at the last stop. Each stop also has extra `arrival` and `departure` fields, not in SCHEMA.md, in 24-hour time. These can cross midnight.
7. **Fares:**
   - The system-level `fare_rules` points to the official PDF (distance slabs, by train group and class).
   - Where a route has `fare_override.flat`, that is the Economy fare for the full distance, looked up in the official table for the train's group:
     - Group A (Khyber Mail, Millat and similar)
     - Group B (Karachi Express, Karakoram, Jaffar, Tezgam, Business)
     - passenger/branch-line trains
     - Musa Pak
   - These are computed values, not published per-train fares. The distance comes from Wikipedia, or else from pakinformation.com.
   - The following have no fare:
     - Green Line, Shah Hussain, Fareed and Sir Syed, because the PDF's columns for them are ambiguous
     - Mehr, Thal and Mianwali, because the intercity table stops at 340 km
     - trains without a clear fare group

### Sources (Task A)
| Source | URL | Official | Used for |
|---|---|---|---|
| Pakistan Railways, Train Timings dropdown | https://www.pakrail.gov.pk/TrainTiming.aspx | yes | train numbers and names |
| Pakistan Railways, Passenger Fare w.e.f. 20 Apr 2025 (PDF) | https://www.pakrail.gov.pk/images/fareRatesTable/Passenger_Fare_20_04_2025.pdf | yes | fare table, concessions |
| pakinformation.com, railway timings (48 train pages) | https://www.pakinformation.com/railway-timings/ | no | ordered stops per direction, times, classes, distance |
| Wikipedia, List of named passenger trains of Pakistan | https://en.wikipedia.org/wiki/List_of_named_passenger_trains_of_Pakistan | no | endpoints, operating years, operator |
| Wikipedia, 35 individual train articles (URL in each route's `sources`) | e.g. https://en.wikipedia.org/wiki/Khyber_Mail_(passenger_train) | no | station lists, distance, journey time, classes |
| OpenStreetMap route relations 19850888, 19850889, 19946243, 19828022, 19846006 | https://www.openstreetmap.org/relation/19850889 etc. | no (ODbL) | stop order and coordinates |
| OpenStreetMap railway stations via Overpass | https://overpass.private.coffee/api/interpreter | no (ODbL) | coordinates |
| Wikidata railway stations (`research/wikidata-stations.json`) | https://query.wikidata.org/ | no (CC0) | coordinates, Urdu names |

Attribution: "© OpenStreetMap contributors" (ODbL). Wikipedia content is CC BY-SA; only facts were taken. pakinformation.com publishes no licence, so only facts (station order and times) were taken, and the source is cited.

### Gaps (Task A)
- **No official stop-level timetable.** Stop order for 95 of the 100 routes rests on one third-party site, cross-checked against Wikipedia. Some of its pages carry 2024–25 timetable labels.
- **Station counts differ between sources.** Examples: Khyber Mail has 44 stops on pakinformation.com and 43 on Wikipedia. Subak Kharam in OSM lacks Wazirabad.
- **Stops without coordinates:**
  - Domala (Lasani)
  - Ehsanpur and Karor Lal Eason (Mehr/Thal)
  - Layyah (130DN)
  - Faqir Turko Mangrio and Sadar Halt (Marvi)
  - Sukheke (Pakistan Express)
  - Usman Khattar (Rawalpindi Passenger)
- **Possible wrong matches:** names were matched automatically. Distances between consecutive stops were checked, and every jump over 250 km turned out to be a genuine non-stop express leg. A few near-duplicate names remain, such as "Sind University" and "Sindh University", or "Dera Allah Yar" and "Dera Allahyar".
- **Running trains missing from the official dropdown are not included:** Khushhal Khan Khattak Express (19/20, which has an OSM relation), DGK Shuttle, Babu Passenger, Bulleh Shah Passenger and Sandal Express.
- **The PDK shuttle numbering in the official list** ("PDK-3DN", "PDK-5DN") conflicts with pakinformation.com, which has 1/3/5 as Up.

## B. Private intracity routes (outside Karachi and Lahore)

A research sub-agent built this file. Every route has status `unverified`. Stops are only those listed in a source: when only the endpoints were known, only the endpoints are given, with `stops_confidence: low`.

| City | System | Routes | Stops | Stops with coords |
|---|---|---|---|---|
| islamabad-rawalpindi | islamabad-rawalpindi-private-wagons | 86 | 753 | 386 |
| peshawar | peshawar-private-wagons | 1 | 2 | 1 |
| faisalabad | faisalabad-private-wagons | 1 | 1 | 1 |
| multan, hyderabad, gujranwala, sialkot, quetta | none | 0 | – | – |

Rawalpindi/Islamabad breakdown:
- **Twin-city and Rawalpindi wagon routes:** 1-C, 1-B, 1-B-A, 2, 3, 3-A, 4, 5, 6, 7, 7-C, 9, 12, 14, 21, 21-A, 21-B, 23, 24, 29 and 32.
- **ITA routes:** 101 to 140, plus the A variants and 121-A. These come from the 2009 Islamabad Transport Authority list.
- **Suzuki routes:** 15, from Tench Bhatta/The Nation and Fawara Chowk.
- **Other named-endpoint routes:** 4.
- **Route-number conflicts:** 1-C, 2, 3, 6, 7, 9, 24, 104, 105, 110, 120 and 121 are described differently by different sources. Each conflict is in that route's `notes`.
- **Fares:**
  - Two 2015 figures: Route 7 Saddar–Rawat was Rs 27, and the Suzuki fare was Rs 16. Both are outdated.
  - The April 2026 RTA increase (+25% non-AC, +30% AC) is recorded at system level.
  - Peshawar has the March 2026 RTA per-km rate (Rs 3.51/km for minibus/wagon).
- **Coordinates:** stops were matched by hand to OSM elements, plus two Wikidata stations. Where a sector name like "G-7" stands for a stop, the coordinate is the sector centroid, so it is approximate.
- **Peshawar:** the one route is Haji Camp – Karkhano (Ford wagon). Dawn reported in 2019 that it was being withdrawn for the BRT, so it probably no longer runs.
- **Faisalabad:** the one route is B-10 (Kotwali – Narwala via Millat Road), from an OSM relation tagged RTA Faisalabad. It is only partly mapped.

### Sources (Task B)
| Title | URL | Publisher | Date | Official |
|---|---|---|---|---|
| Rawalpindi Buses Routes | http://rawalpindi-city.blogspot.com/2007/12/rawalpindi-buses-routes.html | rawalpindi-city blogspot | 2007-12 | no |
| Detail of Wagon Routes in Rawalpindi and Islamabad | https://www.scribd.com/document/360292584/traficroutes-rwp-ibd | Scribd (user upload) | undated | no |
| Total ITA Routes – 2009 (101–140) | https://www.scribd.com/document/318945745/Ict-Routes-Short | Scribd (copy of an Islamabad Transport Authority list) | 2009 | official content, unofficial copy |
| Routes in Islamabad | https://adventureplanners.net/routes-in-islamabad/ | adventureplanners.net | undated | no |
| Oil prices dip but fares stay high | https://www.nation.com.pk/30-Jan-2015/oil-prices-dip-but-fares-stay-high | The Nation | 2015-01-30 | no |
| Routes No 1, 3, 21, 120, 127 violating route permits | https://customstoday.media/routes-no-1-3-21-120-and-127-public-transporters-violating-route-permits-in-twin-cities/ | Customs Today | 2015-02-28 | no |
| Transporters Increase Ticket Prices | https://propakistani.pk/2025/06/17/transporters-increase-ticket-prices/ | ProPakistani | 2025-06-17 | no |
| RTA approves up to 37% fare increase in Rawalpindi | https://propakistani.pk/2026/04/04/rta-approves-up-to-37-increase-in-public-transport-fares-in-rawalpindi/ | ProPakistani | 2026-04-04 | no |
| Suzuki/Taxi Stand Rawalpindi | https://pakistanplaces.com/listing/suzuki-taxi-stand-rawalpindi | Pakistan Places | undated | no |
| Public Transport in Rawalpindi | https://murreeroad.org/transport/public-transport-rawalpindi | MurreeRoad.org | 2026-06 | no |
| Commuters caught between infrastructure and inertia | https://www.dawn.com/news/1931111 | Dawn | 2025-08-16 | no |
| Public Transport in Islamabad | https://www.zameen.com/blog/public-transport-islamabad.html | Zameen.com | 2022-07-18 | no |
| RTA Rawalpindi overcharging crackdown | https://www.nawaiwaqt.com.pk/10-Jul-2026/2009121 | Nawa-i-Waqt | 2026-07-10 | no |
| Urbanscape: A farewell to wagons | https://www.dawn.com/news/1496631 | Dawn | 2019-07-28 | no |
| Peshawar fare increase | https://jang.com.pk/news/1564243 | Daily Jang | 2026-03-12 | no |
| New fares for passenger vehicles in Peshawar | https://mmnews.tv/new-fares-announced-for-passenger-vehicles-in-peshawar/ | MM News | 2026-08-13 | no |
| Transportation (Faisalabad) | https://faisalabad.punjab.gov.pk/transportation | District Government Faisalabad | undated | yes |
| Faisalabad app with live public transport tracking | https://propakistani.pk/2026/07/25/faisalabad-to-launch-app-with-live-public-transport-tracking/ | ProPakistani | 2026-07-25 | no |
| OpenStreetMap (Overpass; relation 14168850) | https://www.openstreetmap.org | OSM contributors (ODbL) | 2026-09-21 | no |
| Wikidata (via wikidata-stations.json) | https://www.wikidata.org | Wikidata (CC0) | 2026-09-16 | no |

### Gaps (Task B)
- **Rawalpindi/Islamabad:**
  - All the data is old (2007–2015). No 2025–26 RTA or ITA route-permit list or per-route fare table was found online.
  - Nothing shows which routes survived the Metrobus, CDA feeder and e-bus launches.
  - The adventureplanners.net lists look scrambled.
  - Suzuki routes have no published numbers.
- **Peshawar:** the RTA publishes per-km rates only. The old wagon routes may be listed in ADB's BRT preparation reports or in Express Tribune, but Tribune blocked access.
- **Quetta:** a bus association reports about 550 private buses on 15 routes (Arab News, 2023), but none of the routes are named.
- **Faisalabad:** FUTS has a Hiace route register, which it is using to build a tracking app, but the register is not published.
- **Gujranwala:** RTA data is referenced in a 2021 Urban Unit plan but not published.
- **Sialkot:** nothing was found.
- **Multan:** only the planned government network turned up, which is out of scope.
- **Hyderabad:** only the areas served by old-city rickshaws are named, with no routes.
- **Search stopped early:** the session's web-search limit (200) was reached partway through. Multan, Hyderabad and the smaller cities were only lightly searched, and Urdu and Sindhi local papers were not searched.
- **Next steps:**
  - raise the web search limit (`CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`) and search Urdu and Sindhi local papers
  - file Right to Information requests with the district RTAs for their route-permit registers
  - ask on-ground contributors to verify routes
