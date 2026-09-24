# Punjab intracity routes, round 2 (2026-09-24)

Outputs:
- `research/incoming/punjab-round2.json` (SCHEMA.md format): 10 systems, 43 routes, 639 stops. It parses, and every route has at least 2 stops and a source URL.
- Working files are in `research/cache/punjab-round2/`:
  - `et_routes.json`: the raw eTransit stop lists and first-stop departure times for 79 routes
  - `dwl_planner.json`: the eTransit line and route catalogue
  - `osm_stops.json`: OSM bus-stop nodes
  - `etransit-vs-existing.txt`: every official route compared with `data/systems`
  - `build.py`, `cmp.py`, `et_fetch.py`: the scripts. Run them from that folder.
- Nothing in `data/` was changed.

## Main finding: an official source for the government e-bus routes

The PMA public site **eTransit Punjab** (https://etransit.punjab.gov.pk/public/route-planner) runs on a public JSON backend:
- `GET …/repo/backend/public/api/home-page/districts-with-lines?page=planner` lists all 45 PMA/PTC lines and their routes.
- `POST …/home-page/get-line-schedules {line_id, main_route_id}` returns each route's ordered stops (forward and backward), with coordinates and that day's timetable.

This is the **official** source for the Green Electric Bus, Metrobus and feeder routes. Until now the project used safar.fyi for these, which `sources-apis.md` marks "do not use" without permission. safar's ids (`bwp:229`, `mlt:457`) are the PMA route ids, so safar evidently mirrors this API.

**Comparison with `data/systems`** (see `etransit-vs-existing.txt`):
- Most existing e-bus and MFR routes match the official lists at 85–100% stop overlap. The DGK, Gujrat, Jhang, Kasur, RYK, Sheikhupura, Sialkot, Wazirabad and Okara routes are confirmed as they are.
- New routes and changed routes are listed below.

**Licensing:** the API publishes no reuse terms. These are facts (stop names, order and times) from a government site. Whether to ask PMA for written permission (contact listed in `sources-apis.md`) is the owner's decision.

## Counts per city

| City | System (merge target) | New routes | Replacements (`merge_action: replace_existing`) | Source type | Confidence |
|---|---|---|---|---|---|
| Multan | multan-electric-bus | 10 (MFR-EV) | 1 (EV-VC-NC: unverified, now operational) | official PMA | high |
| Sargodha | sargodha-electric-bus | 2 (Shahpur, Lak Morr) | – | official PMA | high |
| Sargodha | sargodha-private-wagons (new) | 7 corridors | – | Urban Unit PCIIP c.2010 | low |
| Sahiwal | sahiwal-electric-bus | 1 (Harappa Museum) | – | official PMA | high |
| Sahiwal | sahiwal-private-wagons (new) | 4 corridors (1 wagon, 3 Qingqi) | – | PCIIP c.2010 | low |
| Okara | okara-electric-bus | 1 (Fatehpur) | – | official PMA | high |
| Bahawalpur | bahawalpur-electric-bus | – | 4 (3 renamed and extended, 1 with a stop added) | official PMA | high |
| Rawalpindi | rawalpindi-electric-bus | – | 2 (RWP-EB-01X and RWP-EB-05: unverified, now operational) | official PMA | high |
| Gujrat | gujrat-private-wagons (new) | 5 corridors | – | PCIIP c.2010 | low |
| Jhang | jhang-private-wagons (new) | 6 corridors | – | PCIIP c.2010 | low |
| Sialkot, Gujranwala, Rahim Yar Khan, DG Khan, Sheikhupura, Kasur | – | 0 | – | – | – |

**Totals:** 14 new e-bus routes (398 stops), 7 replacements (192 stops), and 22 low-confidence paratransit corridors (49 stops).

## Per city

### Multan
**Green Electric Bus (PMA line "MFR-EV")**
- The CM launched it on 17 Sep 2026 with 45 buses. The fare is Rs 20; women, students, persons with disabilities and people over 60 ride free (The Nation 18 Sep, ARY and ProPakistani 17 Sep).
- eTransit lists 11 routes:
  - 8 are electric twins of the diesel MFR feeders, with separate route ids and slightly different stop lists: MFR01, 01B, 01C, 03, 03B, 09, 09B and 09C.
  - 2 are new alignments:
    - **Vehari Chowk – Qasim Bela**, via BCG Chowk, Ghalla Mandi, Railway Station, Dera Adda and CMH
    - **Dera Adda – DHA Multan**, via Kumharanwala, Khad Factory and Women University
  - The 11th is Vehari Chowk – Nishtar Hospital. It is already in data as `EV-VC-NC` (unverified, from safar), so it is supplied as a replacement from the official data.
- New route ids are `MFR-EV-<eTransit route id>`, because no printed number is published.

**Timing caveat:** the service is one week old. Some routes' timetables for 24 Sep cover only part of the day (e.g., MFR-EV-487 runs 09:20–11:40). MFR-EV-489 had too few departures, so its headway and hours are null.

**Private wagons, Hiace and Qingqi:** nothing with route numbers or stops was found, in Urdu or English (Jang, Nawa-i-Waqt, Dunya, Loksujag and others). The Urban Unit Multan-division Transport & Connectivity plan (2023) has no intracity route table.
- **Lead not modelled:** Loksujag (2023) reports a DC-run Pink Bus, 18 Aug 2023. It ran Chungi No. 9 – Nadirabad Phatak, twice a day, women only. It is probably no longer running, and its stops aren't given.

### Sargodha
- **e-bus:** eTransit now lists 7 routes. **GBS Sargodha – Shahpur** (36 stops) and **GBS Sargodha – Lak Morr** (24 stops) are new; the first 14 stops are shared. These probably use the extra buses announced 4 Sep 2026 (Lahore Times).
- **Paratransit:**
  - PCIIP City Profile (c.2010), Table 20 gives 7 Qingqi/auto-rickshaw corridors with passengers per day.
  - The same profile says there was no bus or wagon service.
  - Two entries are ambiguous and are noted in the routes:
    - "Sargodha – Bhalwal road"
    - "PAF Road – Jail Rial – Block 8"

### Sahiwal
- **e-bus:** **Electro Bus Depot – Harappa Museum** is new: 27 stops, via Jogi Chowk, the GBS on Railway Road and the 6-R chaks.
- **Paratransit:** the PCIIP profile, Table 19, gives 4 corridors from Jogi Chowk. **Jogi Chowk – Arif Chowk** is the only one listed as a *wagon* corridor.

### Okara
- **e-bus:** **GBS Okara – Fatehpur** is new: 18 stops, via Satghara Morr, the Cadet College and Bangla Gogera.
- **Paratransit:** the PCIIP profile lists only road names, e.g., "Depalpur road". Those are not routes, so nothing was modelled.

### Bahawalpur
The official data shows three routes renamed and extended since the safar-based import. The existing ids are kept so the replacements merge in place:
- `13-solang-to-cattle-market` becomes **DHA – Cattle Market (via 13 Solang)**.
- `talha-town-to-al-raheem-town` becomes **Sama Satta – Al Raheem Town**, with 5 more stops.
- `bhatta-1-to-goth-lashkar` becomes **Bhatta No 1 / Alina Hospital – Mari Qasim Shah**, with 7 more stops.
- Dera Bakha – Lodhran gains "Al Raheem Town".

**Private routes:** no intermediate stops were found for the 6 PCIIP corridors already in data. Urdu searches (e.g., بہاولپور شہر ویگن روٹ, Farid Gate) returned nothing.

### Rawalpindi
- eTransit's RFR-EV line lists all 6 e-bus routes. That confirms RWP-EB-01X (Saddar – Bhatta Chowk) and RWP-EB-05 (Railway Station – Hamrahi), which were `unverified`. Both are supplied as status upgrades with identical stops.
- **Suzuki and Hiace routes 2023–26:** nothing newer than the 86 routes already in `islamabad-rawalpindi-private-wagons`. The RTA publishes enforcement news (Nawa-i-Waqt, 10 Jul 2026) but no route lists.

### Gujrat
- The PCIIP profile, Table 19, gives 5 corridors served by Qingqi, auto-rickshaws and small pickups.
- TPU Punjab did a "Comprehensive Study for the Public Transport System in Gujrat City" (2011) with operational route plans, but only an abstract is online at tpu.punjab.gov.pk/public_transport_gujrat_city.

### Jhang
The PCIIP profile, Table 19, gives 6 Qingqi/auto-rickshaw corridors with passengers per day. It also lists a private bus and van stand near Ayub Chowk.

### Gujranwala (B1, B2, B4 and B5 intermediate stops)
No intermediate stops were found. Searched:
- Urdu (کامونکی عزیز کراس, چن دا قلعہ گکھڑ)
- the TPU project page "Improvement of Urban Transport in Gujranwala City" (methodology only; the report isn't online)
- the MUET 2017 paper (its download link now returns a 5 KB stub PDF)

The Gujranwala city e-bus is not in eTransit yet. The Wazirabad lines are already in data.

### Sialkot, Rahim Yar Khan, DG Khan, Sheikhupura, Kasur
**Sialkot:**
- The TPU 2012 note repeats that paratransit runs "without any proper routes".
- The RTA page on sialkot.punjab.gov.pk lists fees only.
- There is no PCIIP profile for Sialkot.

**DG Khan and RYK:** the PCIIP profiles list road names only ("Jampur Road", "Khanpur road"), so nothing was modelled.

**Sheikhupura and Kasur:** no PCIIP profile exists. The TPU "Sheikhupura Urban Transport Master Plan" (2013) is not online.

The e-bus routes for all five cities already match eTransit.

## Sources

| Title | URL | Publisher | Date | Official |
|---|---|---|---|---|
| eTransit Punjab route planner and API (districts-with-lines, get-line-schedules) | https://etransit.punjab.gov.pk/public/route-planner | Punjab Masstransit Authority / PITB | fetched 2026-09-24 | yes |
| CM Maryam inaugurates electric bus service in Multan | https://www.nation.com.pk/18-Sep-2026/cm-maryam-inaugurates-electric-bus-service-multan | The Nation | 2026-09-18 | no |
| CM Punjab inaugurates electric bus service in Multan | https://arynews.tv/cm-punjab-inaugurates-electric-bus-service-in-multan | ARY News | 2026-09-17 | no |
| Another Punjab district gets Green Electric Bus service | https://propakistani.pk/2026/09/17/another-punjab-district-gets-green-electric-bus-service/ | ProPakistani | 2026-09-17 | no |
| Maryam Nawaz announces seven more electric buses for Sargodha | https://www.lhrtimes.com/2026/09/04/maryam-nawaz-announces-seven-more-electric-buses-for-sargodha/ | Lahore Times | 2026-09-04 | no |
| PCIIP City Profiles: Sargodha, Sahiwal, Gujrat, Jhang (also read: DG Khan, RYK, Okara) | https://urbanunit.gov.pk/Download/publications/Files/8/2021/PCIIP%20Cities%20Profile-Sargodha.pdf (swap the city name) | The Urban Unit / GHK (ADB) | c.2010 | no |
| Transport & Connectivity plans: Multan (2023), Sargodha (2022), DG Khan (2024), Sahiwal (2024) divisions | https://urbanunit.gov.pk/Download/publications/Files/18/2023/Transport%20&%20Connectivity.pdf etc. | The Urban Unit | 2022–24 | no (no intracity route tables; DG Khan has 2 planned Muzaffargarh lines) |
| TPU Punjab project pages (Sialkot, Gujrat, Gujranwala, Sheikhupura) | https://tpu.punjab.gov.pk/completed_projects | Transport Planning Unit | 2011–15 | yes (abstracts only) |
| Pink bus Multan (female transport story) | https://loksujag.com/story/female-transport-issues-multan | Lok Sujag | 2023 | no |
| OpenStreetMap bus-stop nodes (Overpass) | https://overpass-api.de/api/interpreter | OSM contributors (ODbL) | 2026-09-24 | no |

**OSM checks:**
- The Overpass route relations in all 14 city bboxes (mail.ru mirror) found no private routes: only the known Metro, CDA feeder and Lahore MBS relations, plus 3 untagged ones.
- Wikiroutes has no catalogue for any of the target cities; only Faisalabad, Lahore and Islamabad exist.

## Coordinates
- **From OSM:** 28 e-bus stops were matched to named OSM `highway=bus_stop` nodes within 150 m, e.g., "Chowk Kumharanwala" and "Adda Boti Pal". These carry `coord_source: osm:node/<id>`.
- **From PMA:** the other 562 e-bus stops carry the official coordinates, with `coord_source: ext:etransit.punjab.gov.pk:stop/<id>`. Each stop also has an extra `pma_stop_id` field.
  - SCHEMA.md allows only OSM or Wikipedia coordinates, but `data/systems` already contains `ext:safar.fyi` coordinates. Decide whether to keep these or null them.
- **Paratransit corridors:** no coordinates.

## Gaps and next steps
1. **Private routes:** the district RTA route-permit registers are the only complete source, and none is online. File RTI requests with the RTAs in Multan, Sialkot, Gujranwala, Bahawalpur and Rawalpindi.
2. **Stale PCIIP corridors:** they date from c.2010. Many Qingqi corridors are now also served by e-buses. Keep them `unverified/low`, or drop them after an on-ground check.
3. **Other districts in eTransit:** the endpoint covers all 45 lines. It also has routes that may be missing from data for districts outside this brief:
   - Toba Tek Singh: "GBS TTS – Peer Mahal"
   - Vehari: "Peer Mahal – Tibba Sultanpur"
   - Pakpattan, Narowal, Nankana, Lodhran and Layyah
   - line 71 "PTC Electric Bus (MZA)" (district 153): its routes (Asgharabad – Industrial Area; Airport – Chattar parking) suggest **Muzaffarabad**
   
   A full diff is a quick follow-up with `cmp.py`, after widening `LINE2SYS` in `cmp.py` and `LINES` in `et_fetch.py`.
4. **Refresh:** run `et_fetch.py` again periodically. It is one request per route with a 0.7 s delay. MFR-EV timetables should settle after launch week.
5. **Search budget:** this pass used about 30 web searches. Most Urdu queries returned nothing relevant, because the search backend is US-focused. Facebook groups (e.g., Gujranwala333) and YouTube were not usable through search.
