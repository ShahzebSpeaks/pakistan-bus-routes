# Intercity bus research (pseudo-city `intercity`)

Researched 2026-09-21. Output: `research/incoming/intercity-bus.json` (SCHEMA.md format, parses OK). Build scripts were kept in the session scratchpad; downloaded source files are in `research/cache/intercity/`.

## Counts

| System | Type | Routes | Routes with fare | Source quality |
|---|---|---|---|---|
| intercity-pta-sindh | Official regulator (PTA Sindh) | 20 | 20 | Official notice, 4 Apr 2026 |
| intercity-punjab-transport | Official regulator (Punjab Transport Dept / RTAs) | 19 | 19 | News reports of official decisions, 2026; 2018 per-km PDF |
| intercity-daewoo | Daewoo Express | 29 | 22 | Official terminal list; fares/times third-party |
| intercity-faisal-movers | Faisal Movers | 10 | 8 | 5 official fares (homepage, undated) |
| intercity-skyways | Skyways | 15 | 6 | Official terminals/destinations; Bookme; pkbuses |
| intercity-bilal-travels | Bilal Travels | 11 | 10 | Third-party only |
| intercity-niazi-express | Niazi Express | 20 | 7 | Official terminal cities; Bookme; pkbuses |
| intercity-q-connect | Q Connect | 1 | 1 | Official route data and terminals |
| intercity-road-master | Road Master | 5 | 3 | Official terminals; Bookme; 2023 timetable |
| intercity-kohistan | Kohistan Express | 4 | 1 | Facebook + third-party, low |
| intercity-waraich-express | Waraich Express | 8 | 8 | Third-party only (no official site) |
| intercity-manthar | Manthar Transport | 8 | 2 | Sastaticket + third-party, low |
| intercity-natco | NATCO (government) | 20 | 4 | Official route list + live fares (natco.gov.pk) |
| intercity-silk-line | Silk Line | 17 | 0 | Official site + Bookme route list |
| intercity-kainat | Kainat Travels | 4 | 0 | Booking sites only |
| **Total** | 15 systems | **191** | 111 | |

There are 155 distinct stop names. 62 of them are named operator terminals, and 34 of those have OSM coordinates (`coord_source` osm:node/way). The rest are city-level stops.

## Official fare data

1. **PTA Sindh intercity provisional fare rates list, 4 Apr 2026.** [Image](https://mwb.sindh.gov.pk/storage/Transport/intercity.jpeg), linked from [transport.sindh.gov.pk/fares](https://transport.sindh.gov.pk/fares).
   - 20 routes from Karachi, all transcribed with km and 4 classes.
   - `fare_override.flat` holds the deluxe non-AC bus fare; the other classes are in `concessions`.
   - Per-km rates for routes not on the list: Rs 3.30 non-AC bus, 3.10 non-AC van, 3.80 AC bus, 3.50 AC van.
   - The Sanghar non-AC bus fare is printed as Rs 849, but 256 km × 3.30 = 845. It is kept as printed and noted.
2. **Punjab Transport Department notification, 21 Jun 2018.** [PDF](https://transport.punjab.gov.pk/system/files/Notification%20Fuel%20Prices%20Existing%20Fare%20Structure%20of%20Non-AC%20Public%20Transport%2021-06-2018,%20.pdf).
   - Non-AC intercity rates: Rs 0.93/km on metalled roads, 0.98/km on kacha roads, 1.04/km on hilly roads.
   - It has no AC rate. It is the newest per-km notification online.
3. **Punjab 2026 route fares, reported in news.** Fares changed about six times in 2026. Each route keeps the full history in `concessions`.
   - Jan 2026 cut: ProPakistani/APP.
   - 3 Apr 2026 "notified" +25%: Minute Mirror.
   - 4 Apr 2026 RTA Rawalpindi: ProPakistani / The Nation.
   - 9 May 2026 approved fares: The Nation.
   - Jun 2026 cuts: Dawn / Radio Pakistan.
   - Sep 2026 Rawalpindi +10–12%: Express Tribune.
   - Class labels conflict between reports.
4. **KP, Balochistan, GB, AJK, ICT:** no official intercity fare list is online.
   - KP: Business Recorder (4 Apr 2026) says the government had not issued a revised schedule; The Nation (1 Sep 2026) says a "scheduled rates" chart exists but is not published.
   - Balochistan: Minute Mirror (4 Apr 2026) reports operator increases only.
   - No systems were created for these regions.

## All sources used

**Official**
- PTA Sindh intercity list (above)
- transport.sindh.gov.pk/fares
- transport.punjab.gov.pk 2018 notification
- daewoo.com.pk/Home/Terminals (addresses)
- faisalmovers.com (homepage fares, /contact-us, /route-map)
- skywaysonline.pk/contactus and /destandfares
- niaziexpress.com.pk/our-terminals
- roadmaster.pk/bus/contact
- qconnect.pk and /contact
- natco.gov.pk, /times, /contact
- silkline.pk
- Operator Facebook pages: NATCO, Kohistan Express, Manthar Group

**News**
- ProPakistani (2026-01-01, 2026-04-04)
- APP (2026-01-01)
- Minute Mirror (2026-04-03, 2026-04-04)
- The Nation (2025-03-08 Kashgar bus; 2026-04-04, 2026-05-09, 2026-05-31, 2026-09-01)
- Dawn news/2009549 (2026-06-21)
- Radio Pakistan (2026-06-20)
- Express Tribune 2628239 (2026-09)
- Business Recorder (2026-04-04)
- MM News

**Booking and aggregator sites** (route names and terminals only; a handful of pages each)
- bookme.pk: operator pages for Daewoo, Skyways, Niazi, Road Master, Silk Line, NATCO, Kainat, plus lahore-to-karachi-sleeper-bus
- sastaticket.pk: operator pages for Daewoo, Faisal Movers, Manthar, Kainat
- pkbuses.com: fare lists and timetables for Daewoo, Faisal Movers, Skyways, Bilal, Niazi, Waraich, Road Master, Q Connect, Kohistan, Manthar
- daewooinfo.pk
- buses.pk: Daewoo and Waraich pages
- asiafirms.com: NATCO Pirwadhai office
- en.wikipedia.org/wiki/Daewoo_Express

**Coordinates**
- OpenStreetMap via the Overpass mirror maps.mail.ru. There was one query for amenity=bus_station plus operator names across Pakistan; the result is cached as `cache/intercity/osm-busstations.json`. © OpenStreetMap contributors, ODbL.

Every route has its own `sources`. Each system's `sources` marks `official` true or false.

## Gaps and caveats

- **Daewoo's own fare and route lookups** (`/Home/GetFare`, `/Home/GetArrivalsByDeparture`) returned `[]` on 2026-09-21, even from a browser. Daewoo fares and times therefore come from third-party sites that disagree with each other; for example, the Lahore–Karachi sleeper is listed at 9,190–11,870.
- **Sastaticket timetables** (first/last bus) are the same template text across several operators, so they were not used except for the Daewoo first/last times, which are marked undated.
- **Departures per day** (`headway_min`) are known for only 10 routes: 6 Daewoo routes (Sukkur and DI Khan), 3 Road Master routes (2023 timetable) and Q Connect. Journey times are in `notes`.
- **Intermediate stops** are partial:
  - Daewoo Karachi corridor: Khanewal, Sukkur, Moro, Hyderabad.
  - NATCO: KKH stops Hasan Abdal … Chilas, and the southern stops on Gilgit–Karachi. These are the places NATCO sells tickets to; the order is geographic and assumed.
  - All other routes are origin and destination only.
- **PTA Sindh and Punjab routes** use city names, not terminals. The regulators do not name terminals.
- **Terminals without coordinates:**
  - Daewoo Multan, Hyderabad and Moro
  - Road Master (all)
  - Q Connect (both)
  - Waraich (all)
  - Faisal Movers and Skyways Karachi
  - Bilal Rawalpindi
  - NATCO Skardu, Karachi and Lahore
- **Shared terminals:** Kohistan Terminal in Faisalabad is used by Faisal Movers, Bilal and Kohistan. Band Road in Lahore hosts Bilal, Niazi, Faisal Movers, Silk Line and Kainat.
- **Operators with weak evidence:** Waraich has no working official site. Kohistan and Manthar have only Facebook pages, which need a login. Kainat's own site did not respond. Their routes are mostly `unverified`.
- **Excluded operators:**
  - Quetta–Karachi coach companies (Al Aziz, Al Mumtaz, Al Saif, Al Mahmood): found only on pkbuses.
  - "Musa Express": a train, not a bus.
  - Dua Express, Al-Hamd, Saeed Express: no evidence found.
- **NATCO Gilgit–Kashgar** (Mar 2025 trial) is unconfirmed for 2026. The Rawalpindi–Skardu search returned no trips.
- **Licensing:** route lists on operator sites that run on Bookme are facts. The fares copied from aggregators should be treated as indicative only.
