# Karachi round 2: Mnzil gazetteer, Chinchi gaps, new minibus routes, SMTA 2025-26

Researched 2026-09-24. Outputs:

| File | What it holds |
|---|---|
| `incoming/karachi-mnzil-stations.json` | Gazetteer of every Mnzil station: 598 stations, all with lat/lon, plus 152 Mnzil vehicles mapped to our route ids |
| `incoming/karachi-round2.json` | SCHEMA.md format: 1 new minibus route (Z-22) and 2 planned PBS EV corridors. Also `corroboration[]` (24 existing minibus routes seen in 2024-26 videos) and `chinchi_candidates[]` |

Both files parse with Node `JSON.parse` and Python `json.load`. `data/systems` was not edited.

## 1. Mnzil station gazetteer

**Method**
- **Station list:** the `station/` URLs in `https://mnzil.app/api/sitemap`, 600 slugs.
- **Station pages:** each station page embeds `stationData` (id, English name, lat/lon, slug) and `vehiclesData` in its Next.js RSC payload. All 600 were fetched on 2026-09-24, one request per second.
- **Vehicle pages:** the 152 pages fetched by the previous pass on 2026-09-23 were reused from its scratch cache (`parsed.json`). Their `stationsData` gives each station's position (`seq`) on every vehicle.
- **Merge:** records were joined by Mnzil station id.

**Fields per station:** `name`, `lat`, `lon`, `mnzil_id`, `slug`, `url`, `routes` (vehicle slugs), `route_detail` (vehicle id, type, seq), `station_page`, `flags`.

**Fields per vehicle:** `id`, `slug`, `type_id`, `n_stations`, `our_routes`.
- `our_routes` maps each vehicle to our ids, such as `karachi-minibus:G-7 (Mnzil)` or `karachi-pbs:R1`.
- 151 of the 152 vehicles map. D-17 has no match: it exists only in the 2010 list.

**Counts**
- **Stations:** 598, all with coordinates.
  - 595 come from station pages.
  - 3 come only from vehicle pages: ICI Brigde, Korangi 2 ½ and Shaheen Complex.
  - 15 have a station page but no vehicle serving them, for example Alize Garden, PIA Society and Nadra Center.
- **Broken station pages:** 5 sitemap slugs return `{"detail":"An unexpected error occurred."}`, even after a retry: arena, cm-house-f-r-saddar, ic-bridge, ic-pull and ici-bridge.
- **No new vehicles:** no station page names a vehicle missing from the 152-vehicle sitemap.
- **Vehicle types:** type 1 = PBS/EV/DD (16), 2 = BRT (2), 3 = Chinchi (53), 4 = bus/coach (64), 6 = Chinchi, second category (17).

**Data problems**
- **Bad longitude:** "PMTF - Jumma Goth" has longitude `6725409355624929`. The decimal point was lost; the value is almost certainly 67.2540935… It is kept raw and flagged.
- **Doubtful location:** "Soorty Factory" sits at 67.649 E, well east of Port Qasim. Check it before use.
- **Possible duplicates:** Korangi 2 (ids 319/414) and Shaheen Complex (ids 21/502).
- **Coordinates:** these are Mnzil's own points, not OSM. Under SCHEMA.md use them only as a geocoding hint or a cross-check. None were copied into any route's `lat`/`lon`.
- **Licence:** Mnzil states none (Cheeltech, all rights reserved). The data is included with attribution because the owner decided to include unofficial sources.

## 2. Chinchi M-5, MK 081, P-1 and the terminal-only Qingqi routes: still gaps

- **Mnzil:**
  - M-5 has only Expo Center.
  - MK-081, P-1 and bus 4-E have no stations.
  - No station page lists MK-081 or P-1.
- **Wikiroutes:** it has **no Karachi routes**. The Karachi catalog is empty, and the Pakistan page lists only Faisalabad, Islamabad, Lahore and Peshawar.
- **Other sources that gave nothing:**
  - YouTube search (script, results pages only)
  - TikTok search
  - English and Urdu web search (چنچی روٹ کراچی)
  - the PakWheels forum thread (read via its public `.json` endpoint)
  - Mnzil's own YouTube channel
- **ARY 2018 Qingqi routes:** still no stop lists for Nagan Chowrangi - Iqra University North Campus, Bakra Mandi - Lee Market, or Five Minute Chowrangi - North Karachi No. 6.
- **Forum leads:** the PakWheels thread (2019-2021) names Chinchi **F-18, U-18, G-18 and M-18** on the UP Mor / Disco Mor - Millennium Mall - NIPA corridor. They are recorded under `chinchi_candidates` only, with no stops.

## 3. Minibus and coach routes

**New route**
- **Z-22**, Pakhtoonabad (Nazimabad) - Zafar Town (Landhi): 27 stops, `unverified`, stops_confidence `low`.
- Source: the "Lets go pk" YouTube description of 2025-08-31, which lists areas in travel order as hashtags.
- This id appears nowhere else: not in data/systems, the 2010 list, Mnzil or Zenodo.

**The "Lets go pk" channel** (UCqfh-QDg4lCcYzjqSN8NYkw)
- It has 24 more route videos, uploaded between 2024-01 and 2026-09-20.
- Each is stored in `corroboration[]` with its date, terminals and raw hashtags. This is the best evidence found that these routes were running in 2024-2026: Masood, Z-18, D-11, Safari Coach, G-27, Bilal, A-3, Sheraz, D-7, X-10, Ilyas, G-3, Imran, Khan, Z-2, MashAllah, Marwat, New Afridi, Mashriq, W-55, Muslim, N-5, X-8 and G-17.
- The videos settle some terminal conflicts:
  - Khan, Z-2 and N-5 match Mnzil.
  - Masood, G-27 and D-7 match RastaYaar.
- They raise new conflicts:
  - **Imran:** the video runs Model Colony - Machli Chowk (Younusabad), not Hawksbay - Qayyumabad.
  - **D-11:** Bilal Colony - Muhammad Khan Colony.
  - **X-10:** Muhajir Camp - Gizri.
  - **X-8:** ends at Qayyumabad.
  - **"Marwat 11":** Bhains Colony - Naval Colony, which is Mnzil's Mashriq alignment.

**Routes checked, with no 2023-26 evidence found**
- X-5, 4-K, U-4, U-6, 2-D, 1-L, 2-C, 7-K, 45-A, 51-C, C-2, C-3, D-4, F-1, F-18, G-55, P-9, 19-D and the Starline, Shaheen, National, Omar and Mahfooz coaches.
- About 50 ids were searched on YouTube by title. G-7 is already held, both as the Mnzil and the RastaYaar version.
- The Zenodo 2024 routes that are missing from karachi-minibus are already in `incoming/zenodo-karachi-bus-network/` and were not repeated.

**Other sources checked**
- **Scribd "BUSROUTEKHI"** (508980583, 76 pages): a copy of the URC January 2010 list (Route 1-A Faqir Colony … Bandar Road), so nothing new.
- **Scribd "bus route karachi and defence karachi"** (429834569): 3 pages of coach routes that would not render.
- **Tribune and Scribd downloads:** they sit behind Cloudflare or bot challenges and were not bypassed.
- **Dead ends:** Moovit, Careem Bus, Airlift and Swvl were already recorded in `sources-ecosystem-deep.md`, and nothing new was found.
- **Yango "Transport"** (Mar 2026): it has no public route data.

## 4. SMTA / PBS / EV / Pink / Double-decker, 2025-2026

- **SMTA directory:** https://smta.gos.pk/route-map, re-read 2026-09-24. It still lists **20 Karachi routes**: R1-R14 (R5, R6 and R7 inactive), EV1-EV5 and DD01, plus Hyderabad 3, Larkana 1, Sukkur 1, Mirpur Khas 1, Shaheed Benazirabad 1, Shikarpur 1 and Khairpur 2.
  - Nothing is new since the last pass: R14 of Mar 2026 and the DD Malir-Tower extension of Feb 2026 are already in data/systems.
- **Planned (added):** two corridors from the 500-EV approval. Business Recorder and Profit reported them on 2026-05-19: 450 buses on 25 Karachi routes and 4 depots.
  - `EV-PLAN-ITTEHAD-CANTT`: Ittehad Town - Banaras Colony - Liaquatabad - Jahangir Road - Cantt Station.
  - `EV-PLAN-ORANGI-ZAHOOR`: an area list with no order (Orangi Ghaziabad, Iqbal Market, Walika, Nazimabad No. 2, Ayesha Manzil, Zahoor Chowk).
  - Both ids are ours, not official codes.
- **Pink Abdullah Chowk - Numaish** (17 Nov 2025): TechJuice and Minute Mirror give only the terminals, time windows (08-09, 13-14, 17-19) and a Rs 50 fare. There is still no stop list.
- **Announced for later 2026, no routes given:**
  - 1,000 EV buses by end-2026 and 50 double-deckers arriving in Oct 2026 (Aug 2026 reports).
  - Exclusive PPP bus routes (Business Recorder / Aaj, 2026-07-08/09).
  - Red Line mixed-traffic section on University Road due Sep 2026 (BRT).
- **Outside Karachi:** the new PBS routes of 2026 are Tando Allahyar-Hyderabad (22 Apr), Latifabad-Hyder Chowk (May), Khairpur-Rohri and Khairpur-Ranipur (May) and Larkana-Qambar-Shahdadkot (18 Sep; Express, Nation, ProPakistani). None has a stop list.

## Sources
- Mnzil: https://mnzil.app/api/sitemap, https://mnzil.app/station/<slug>, https://mnzil.app/vehicles/<slug> (Cheeltech, unofficial)
- Lets go pk (YouTube): https://www.youtube.com/watch?v=1MXIpOhYJQQ (Z-22), plus the 24 videos listed in `corroboration[]`
- SMTA route directory: https://smta.gos.pk/route-map
- Business Recorder 2026-05-19: https://www.brecorder.com/news/40421844/purchase-of-500-ev-buses-for-karachi-routes-approved-sharjeel
- Profit 2026-05-19: https://profit.pakistantoday.com.pk/2026/05/19/sindh-moves-to-add-500-ev-buses-as-transport-network-expansion-accelerates/
- ProPakistani 2026-05-08, 2026-08-04, 2026-09-04: Karachi EV/DD plans; Larkana route
- Express (Urdu) 2026-09-15: https://www.express.pk/story/2832823/new-route-of-peoples-bus-service-sharjeel-memon-announces-good-news-2832823
- Nation 2026-09-05: https://www.nation.com.pk/05-Sep-2026/govt-expands-public-transport-network-promotes-electric-mobility
- TechJuice 2025-11-17 (Pink route): https://www.techjuice.pk/karachi-pink-bus-gets-new-route-timings-for-women/
- PakWheels forum: https://www.pakwheels.com/forums/t/karachi-chingchi-extended-rickshaw-routes/245226
- Wikiroutes (empty for Karachi): https://wikiroutes.info/en/karachi/catalog, https://wikiroutes.info/en/country/pakistan

## Gaps to carry forward
1. The stop lists for M-5, MK 081 and P-1, and for the three ARY 2018 Qingqi routes. Next step: ask Cheeltech/Mnzil, or read the Facebook group "Karachi Public Transport Route" (it needs a login).
2. The 2026 EV corridors: route codes, stop lists and launch dates.
3. The terminal conflicts above: Imran, D-11, X-10, X-8, Marwat/Mashriq, Sheraz and Muslim. They need a field check or another 2025-26 source.
4. `route_detail.seq` gives the order along each Mnzil vehicle. A pipeline could use the gazetteer to add coordinates to the Mnzil-derived routes in karachi-minibus and karachi-chinchi, if the owner accepts non-OSM coordinates as hints.
