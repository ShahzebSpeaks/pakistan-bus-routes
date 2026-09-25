# Press and video research, round 3 (2026-09-25)

Outputs:
- `research/incoming/press-video-round3.json` (SCHEMA.md format). It parses with Python `json.load` and Node `JSON.parse`. Every route has at least 2 stops and at least one dated source URL.
- Working files: `research/cache/press-video-round3/`.
  - `et_routes3.json` holds the raw eTransit stop lists for 61 more routes. `etransit-vs-existing-r3.txt` compares them with data/systems.
  - The helper scripts are `art.py` (article text), `yt.py` (YouTube watch, channel and playlist pages), `cmp3.py` and `build_*.py`. They read their inputs from the current folder, so run them from inside that folder.
- Nothing in `data/` was changed.

## Counts

| System (merge target) | Route | Action | Stops (with coords) | Status / confidence | Source |
|---|---|---|---|---|---|
| karachi-pink-bus | PINK-ACN | **replace** (`merge_action: replace_existing`), 2 → 22 stops | 22 (22 OSM) | unverified / medium | PakWheels 2025-11-20, Express Urdu 2025-11-15 and 2026-07-08 |
| muzaffarabad-electric-bus (**new system**) | MZA-441, MZA-442, MZA-443 | new | 2 each (6, eTransit coords) | operational / medium | eTransit Punjab (official), 2026-09-25 |
| isb-rwp-metrobus | RED-537 Saddar – Faiz Ahmad Faiz, RED-538 Kashmir Highway – Pak Secretariat | new | 14 + 10 (all OSM) | operational / high | eTransit Punjab (official), 2026-09-25 |
| peshawar-zu-brt | PLAN-JAMRUD, PLAN-BARA, PLAN-GBR-DABGARI, PLAN-NAGUMAN | new (planned, terminals only) | 2 each (0) | planned / low | ProPakistani 2026-01-07 and 2026-09-07, Express Urdu 2025-02-11 and 2026-01-06 |
| islamabad-electric-feeder | PLAN-DD-TOUR (CDA electric double-decker) | new (planned) | 6 (0), not in stop order | planned / low | Express Urdu 2026-09-24 |

**Totals:**
- 11 routes across 5 systems: 1 replacement and 10 new.
- 66 stops, 52 of them with coordinates.
- `corroboration[]` holds 8 notes that change nothing in the data.

## Main findings

1. **Karachi Pink "Abdullah Chowk – Numaish" runs on the Green Line BRT corridor.**
   - Abdullah Chowk – Numaish is exactly the Green Line alignment.
   - PakWheels (20 Nov 2025) says the women-only Pink service was extended to the Green Line corridor.
   - Express Urdu (8 Jul 2026) quotes Sharjeel Memon on the "Pink bus service on the Green Line BRT".
   - PINK-ACN therefore takes the 22 Green Line stations, with their OSM node ids, from `karachi-breeze` GREEN.
   - No source lists Pink stops, so stopping at every station is an inference: confidence is medium and the status stays unverified.
2. **Muzaffarabad e-bus routes are in eTransit.**
   - PMA's eTransit lists district "Muzaffarabad" with line 71 "PTC Electric Bus (MZA)" and 3 routes:
     - Asgharabad – Industrial Area Chehla via Gojra Bypass (every 40 min)
     - the same pair of terminals via Bank Road (every 45 min)
     - Airport – Parking Area Chattar via Alamdar Chowk (every 25 min)
   - Service runs 06:00–22:10.
   - The earlier round found no Muzaffarabad routes because the press never named them. eTransit publishes only the terminals, so each route has 2 stops.
   - Coordinates are eTransit's own points, using the `ext:etransit…` convention from punjab-round2.
3. **Two new Red Line short services** appeared in eTransit on 25 Sep 2026; they were not in the 24 Sep catalogue:
   - route 537, Saddar – Faiz Ahmad Faiz
   - route 538, Kashmir Highway – Pak Secretariat, a morning shuttle every 3 min from 06:00 to 06:45
   - Stops and OSM coordinates are copied from the existing RED route.
   - eTransit names Shamsabad "Khatam-e-Nabuwat". Its Potohar/IJP order conflicts with its own coordinates, so the RED order is kept (see the route notes).
4. **eTransit completeness check.** The 23 Punjab district lines that punjab-round2 did not fetch have 61 routes, and all of them already exist in data/systems.
   - Most stop overlaps are 85–100%.
   - Four routes have low overlap and are worth a look: Muzaffargarh jhang-mor-to-turkey-hospital (0.40) and the railway-phattak loop (0.41), Chakwal balkasar (0.55), and Rajanpur hajipur (0.62).
5. **Peshawar BRT extensions (planned).** The Sept 2026 list of 5 routes for 50 new e-buses gives terminals only:
   - Mall of Hayatabad – Jamrud: the Jan 2026 plan was Karkhano – Jamrud, 5 km, 8 stops
   - Pishtakhara – Bara Bazaar: 7 km, 10 stops
   - Gulbahar – Dabgari Garden
   - Shah Alam Pul – Naguman
   - a Kohat Adda extension to an unnamed terminal, which was not added

## What the new angles gave

### Urdu newspaper site search
The site searches themselves were not usable:
- **Jang and Urdu Geo:** the search URL redirects to the home page.
- **Express and Dunya Urdu:** search runs through a JavaScript Google CSE, so there is nothing to fetch.
- **Dawn News and Aaj:** `robots.txt` disallows `/search`.
- **BBC Urdu:** its robots.txt terms forbid dataset creation, so it was skipped.

The workaround was sitemaps:
- **Express Urdu:** its post sitemaps (454k URLs) have English or transliterated slugs. A slug grep found about 170 transport stories from 2025–26, and about 20 were read.
- **Independent Urdu:** its sitemap and tag pages were read with the 10 s crawl delay. Nothing useful turned up.
- **Hazara Express News:** the WordPress API was used.

WebSearch with an Urdu query plus `allowed_domains` works, but it returns mostly irrelevant results.

**Result:** the news articles announce routes by their terminals, and none of those read gave an ordered stop list for a private route.

### YouTube
- `/results` is disallowed by robots.txt, so discovery went through WebSearch, and it returned almost nothing route-specific outside Karachi.
- **Lets go pk uploads playlist** (UUqfh-QDg4lCcYzjqSN8NYkw), 100 items: all its minibus videos were already processed in karachi-round2. The only extras are PBS route videos (R1–R4, R9–R12, EV2), which add nothing to the official data.
- **Other channels checked, none of which document routes:**
  - Quetta Buses (intercity buses)
  - Peshawar auto rickshaw
  - Pakistan Kay Sath
  - DGPR Balochistan (official launch clips without stop names)
- No equivalent route-documenting channel was found for Lahore, Rawalpindi, Peshawar, Multan, Hyderabad or Quetta.

## Gaps (unchanged or new)

**Karachi Chinchi**
- M-5, MK 081 and P-1 still have no stops.
- The same goes for the three ARY-2018 Qingqi routes: Nagan – Iqra North, Bakra Mandi – Lee Market, and Five Minute Chowrangi – North Karachi 6.
- Nothing was found in Express Urdu, YouTube or WebSearch.

**Abbottabad**
- The July 2026 route-colour stickers have no public list.
- The "Pink and Blue Suzuki" enforcement (Sept 2026) is about passenger class (pink for women and families), not routes.

**Muzaffarabad**
- Intermediate stops and the fare are unknown.

**Peshawar**
- No private wagon or Qingqi route lists. Express says 504 BRT-corridor permit holders were compensated, but the list is not public.
- The planned BRT extension stops are unnamed.

**Sukkur, Multan, Sialkot and Hyderabad private routes**
- Nothing was found in the Urdu press, in fare-chart (کرایہ نامہ) searches or on YouTube.

**Quetta**
- The Kuchlak and Metropolitan–Sariab routes still have terminals only.
- The NUST route (Apr 2026) has no terminals named.
- The Turbat route has 18 stations, none of them named.

**Larkana**
- LRK-QMB has no new stops.

## Sources

| Title | URL | Publisher | Date |
|---|---|---|---|
| eTransit Punjab route planner and API (districts-with-lines, get-line-schedules) | https://etransit.punjab.gov.pk/public/route-planner | PMA / PITB (official) | fetched 2026-09-25 |
| Karachi Expands Women-Only "Pink Bus" Service to Green Line Corridor | https://www.pakwheels.com/blog/karachi-expands-women-only-pink-bus-service-to-green-line-corridor/ | PakWheels Blog | 2025-11-20 |
| شرجیل میمن کا خواتین کیلئے پنک بس سروس کا نیا روٹ فعال کرنے کا اعلان | https://www.express.pk/story/2787167/ | Express Urdu | 2025-11-15 |
| Sindh govt exclusive bus routes under PPP (Pink on Green Line) | https://www.express.pk/story/2821194/ | Express Urdu | 2026-07-08 |
| گلشن معمار میں ای وی بس سروس کا آغاز | https://www.express.pk/story/2804652/ | Express Urdu | 2026-03-17 |
| Sindh transport decisions (Sukkur–Shikarpur, Hyderabad, Khairpur) | https://www.express.pk/story/2808452/ | Express Urdu | 2026-04-14 |
| SHC Chingchi ban hearing | https://www.express.pk/story/2797005/ | Express Urdu | 2026-01-19 |
| KP decides to expand BRT Peshawar route (Jamrud, Bara) | https://www.express.pk/story/2795028/ | Express Urdu | 2026-01-06 |
| KP BRT expansion, Shah Alam – Naguman feasibility | https://www.express.pk/story/2747355/ | Express Urdu | 2025-02-11 |
| Peshawar: report sought on buses and wagons on BRT routes | https://www.express.pk/story/2750464/ | Express Urdu | 2025-03-03 |
| KP to Expand Peshawar BRT to Two More Tehsils | https://propakistani.pk/2026/01/07/kp-to-expand-peshawar-brt-to-two-more-tehsils/ | ProPakistani | 2026-01-07 |
| KP to Add 50 Buses to Peshawar BRT for 5 New Routes | https://propakistani.pk/2026/09/07/kp-to-add-50-buses-to-peshawar-brt-for-5-new-routes/ | ProPakistani | 2026-09-07 |
| CDA electric double-decker buses for Islamabad | https://www.express.pk/story/2834445/ | Express Urdu | 2026-09-24 |
| ایبٹ آباد: پنک اینڈ بلیو سوزوکی سروس | https://hazaraexpressnews.org/7767/ | Hazara Express News | 2026-09-01 |
| Commissioner Hazara launches colour-coded public transport | https://www.app.com.pk/kp/commissioner-hazara-launches-color-coded-public-transport-system-in-abbottabad/ | APP | 2026-07 |
| AJK PM thanks Nawaz, Maryam for green buses for Muzaffarabad | https://tribune.com.pk/story/2626412/ajk-pm-gilani-thanks-nawaz-maryam-for-green-buses-for-muzaffarabad | Express Tribune | 2026-08 |
| AJK PM inaugurates Green Bus Service | https://wenews.pk/news/502764/ | WE News | 2026 |
| Quetta Green Bus to NUST (video) | https://www.youtube.com/watch?v=ndYArht80_M | DGPR Balochistan (YouTube) | 2026-04-23 |
| Turbat Green Peoples Bus launch (video) | https://www.youtube.com/watch?v=zD9N22VdeZI | DGPR Balochistan (YouTube) | 2026-03-09 |
| Lets go pk uploads | https://www.youtube.com/playlist?list=UUqfh-QDg4lCcYzjqSN8NYkw | Lets go pk (YouTube) | 2024-2026 |

## Notes for the merger
- **PINK-ACN:** replace the existing route rather than adding a copy. Its old sources are kept and the new ones are appended.
- **Muzaffarabad:** `muzaffarabad` is already in cities.json.
- **Coordinates:** the eTransit coordinates (`ext:etransit.punjab.gov.pk:stop/<id>`) are not OSM. Apply the owner's ruling from punjab-round2 to them.
- **Planned routes:** the planned Peshawar and Islamabad routes have null coordinates, and their route ids are ours.
- **Licensing:** eTransit publishes no reuse terms. Whether to ask PMA for permission is the owner's decision, as noted in punjab-round2.
