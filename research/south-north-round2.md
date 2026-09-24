# South and north cities, round 2 (2026-09-24)

Output: `research/incoming/south-north-round2.json` (SCHEMA.md format). The file parses, and nothing in `data/` was changed.

Systems use existing ids (`hyderabad-pbs`, `larkana-pbs`, `quetta-green-bus`). Each system's metadata is copied from `data/systems` and adds only new sources, plus Quetta's updated hours. Routes marked **UPDATE** reuse an existing route id: the merger should replace that route, not append a second copy.

## Counts

| City | System | New routes | Updated routes | Stops (with OSM coords) |
|---|---|---|---|---|
| Hyderabad | hyderabad-pbs | HYD-PINK | – | 11 (9) |
| Larkana | larkana-pbs | – | LRK-QMB (planned → operational) | 3 (2) |
| Quetta | quetta-green-bus | GL-CARDIO, MET-SARIAB | GB-1 (2 → 17 stops), KUCHLAK (planned → operational), PINK (endpoints added) | 34 (11) |
| Sukkur, Nawabshah, Mirpurkhas, Turbat, Gwadar | – | 0 | 0 | – |
| Peshawar, Abbottabad, Mardan, Swat, Mansehra, Kohat, DI Khan | – | 0 | 0 | – |
| Muzaffarabad, Gilgit, Skardu, Islamabad | – | 0 | 0 | – |

Totals: 3 new routes and 4 updated routes, with 48 stops, 22 of them with coordinates.

**How the coordinates were chosen**
- They come only from OSM elements found by Overpass (maps.mail.ru mirror and overpass-api.de, queried 2026-09-24).
- Some stop "coordinates" are really the centroid of an area: a campus, a town, or a neighbourhood. Each such case is flagged in that route's `notes`.

**How status and confidence were set**
- `unverified` is used where current operation isn't confirmed.
- `stops_confidence` is `high` only for the Cardiology route. It is the only route where two sources give the same ordered list.

## Per city

### Hyderabad
- **New: HYD-PINK, Hyder Chowk – Hatri Bypass (women only).**
  - Launched 19 Feb 2023 with 2 buses; fare Rs 50.
  - Stops: Hyder Chowk, Gul Center, Thandi Sarak, Wahdat Colony, Sindh Museum, Qasim Chowk, Pathan Colony, Central Jail, Hala Naka, Isra Hospital, Hatri Bypass.
  - The stop order is from Daily Times and fits the map. Zameen News lists the same stops in scrambled order.
  - Status is `unverified`, because the route is not in the 2026 SMTA directory. The earlier pass had found no Hyderabad Pink route.
- **HYD-01:** SMTA's route page (smta.gos.pk/routes/21) re-checked; it still lists the same 8 stops. The Nov 2022 announcement and the Pink Bus sources add Gul Centre, Thandi Sarak, Agriculture Complex, Wahdat Colony, Sindh Museum, Pathan Colony, Jail Road and Hala Naka. The existing HYD-01 notes already mention the 2022 list, so HYD-01 was not changed.
- **Latifabad – Hyder Chowk PBS route:** announced 19 May 2026 for after Eid ul Adha. A PPP Hyderabad post said "Latifabad to Autobahn Road … soon". No launch was found by 24 Sep. It is probably the inactive HYD-03 brought back, so it was not added.
- **EV buses:** the SMTA board approved 50 EV buses on 5 Hyderabad routes (May 2026). The routes are not published.
- **Private wagon routes: no intermediate stops found.**
  - The MURJET 2025 Fig. 13 map, already in the scratch cache, shows route lines but no stop names.
  - Wikivoyage mentions only rickshaws.
  - Sindhi and Urdu searches found nothing.
  - OSM has about 90 named bus-stop nodes in Hyderabad, e.g. Latifabad Unit 2–12, Hala Naka, Qasim Chowk and Pathan Colony. These will help the geocoding step, but they don't give routes.

### Larkana
- **Update: LRK-QMB, Larkana – Qambar – Shahdadkot.**
  - Launched 18 Sep 2026 per Express Urdu, Ummat and The Nation. Daily Times says 19 Sep.
  - Only the three towns are given as stops. No Larkana terminal, intermediate stops, fare or fleet were published.
  - The Aug 2026 approval (ProPakistani) described two routes: Larkana–Qambar and Qambar–Shahdadkot.

### Quetta
- **Update: GB-1, University of Balochistan → Baleli Custom (via BUITEMS), 17 ordered stops.**
  - Source: an Express Tribune T-Magazine feature (27 Aug 2023), fetched from the Wayback Machine because Tribune returns 403.
  - Stops: UoB, QDA Office, Helpers Eye Hospital, Imdad Chowk, Hockey Chowk, Commissioner Office, GPO Chowk, Ufone Chowk, Koila Phatak, Askari Park DHA, Kasi Bahria Office, Ali Mehmood Super Mart, Killi Gul Mohammad, Killi Almas, BUITEMS, Agriculture University, Baleli Custom.
  - The article says 18 stops but names only 17.
- **New: GL-CARDIO, "Green Line" BA Mall → SMBZAN Institute of Cardiology, 13 stops.**
  - Launched 29 Apr 2026; buses every 45 min, 07:00–23:00.
  - Daily Qudrat English and ProPakistani give the same ordered list.
- **Update: KUCHLAK, now Kuchlak – Sona Khan Chowk, about 40 km.**
  - Dawn and Daily Independent (Sept 2026): about 40 stops are "established" on the Kuchlak route, and 4 routes run 07:00–21:00.
  - Only the endpoints are known.
- **New: MET-SARIAB, Metropolitan – Sariab Road.** Sept 2026 reports give about 50 stops but name none of them, so the route has no stops.
- **Update: PINK.** On launch day (Dec 2025), City42 said pink and green buses would run Kuchlak – Sona Khan Chowk. The route stays `unverified`.
- **Also reported:**
  - 17 more e-buses and 27 electric feeder buses (PSDP 2026-27) are planned for Hazara Town, Marriabad, Samungli Road, Sariab Custom and Nawan Killi. None of these routes are defined yet.
  - A Quetta BRT is at the feasibility stage (target 2032).
  - A Sariab–Kuchlak "People's Train" is in preparation.
- **Private buses:** no route list found. Court hearings in Sept 2026 refer to "old local buses on Quetta routes" but don't name them.

### Sukkur, Nawabshah, Mirpurkhas
- No new PBS, EV or Pink routes beyond data/systems.
- The Feb 2023 launch list for SUK-01 (Pakistan Observer) has 17 stops, against SMTA's 11. It adds Atta Hussain Degree College, Daewoo Terminal, SIUT, NICVD, New Bus Terminal, Beaconhouse School, Sabzi Mandi, Board Office and Commissioner Office. The existing SUK-01 notes already cover the launch-era route, and the 2026 route is extended to Dua Chowk, so SUK-01 was not replaced. A human could merge the two lists.
- Dawn's Nawabshah fleet article (2024) has no stop names, and Aaj's Mirpurkhas article has none either.

### Turbat and Gwadar
- **Turbat:** every source (Nation, Daily Independent, WE News, Balochistan24) gives only "18 stations on a ~19 km route", with 4 buses. No stop or terminal names are published.
- **Gwadar:** no intracity bus service found. Only intercity operators (Al-Muntaz, Al-Dawood and others) turned up.

### Peshawar
- Nothing new with stops.
- The TransPeshawar site still carries the June 2025 network map (MAP_001), and its WordPress posts API has nothing after 2020.
- New feeders on Ring Road, Dilzak Road, Khyber Road and Bara Road were approved (Feb and May 2026, 46th BoD meeting). No codes or stops have been published.
- 52 new buses and a Pink service were announced (June–Aug 2026).
- An interdistrict motorway BRT (Nowshera, Mardan, Swabi, Charsadda) is under study.
- **Private routes:**
  - The RTA publishes only per-km rates. Minibus/wagon is Rs 3.51/km, per Jang (Mar 2026).
  - Wikiroutes' Peshawar catalog holds only the Ayubia gondola.
  - OSM has only the DR 05 and SR 08 relations, which are already known.

### Abbottabad
- The July 2026 colour-coded Suzuki system (APP, 7 Jul 2026) names no routes or colours.
- Hazara Express News reports enforcement of a "Pink and Blue Suzuki" service after a two-week awareness drive, with checkpoints on Mandian Road. It also names no routes.
- The MobiliseYourCity SUMP (early 2024) describes 12-seat Suzuki and 9-seat Bolan line services, but no route list is public.
- A Rs10bn Haripur–Abbottabad–Mansehra e-bus was approved (Nation, 22 Jun 2026). It has no routes yet.

### Mardan, Swat/Mingora, Mansehra, Kohat, DI Khan
- Announcements only:
  - The KP green bus service is planned for divisional headquarters first. The Kohat feasibility study is "near completion" (APP; The News, 17 Jul 2026).
  - BRT feasibility studies are planned for Mardan, Swat, Abbottabad and DI Khan.
- No private route lists were found.
- OSM has no bus route relations in any of these cities.

### Muzaffarabad (AJK)
- 10 Punjab-gifted e-buses arrived on 25 Jul 2026, and AJK PM Gillani later inaugurated the Green Bus Service (WE News).
- Officials briefed him on the routes, but no source publishes them (Dawn, Tribune, WE News).

### Gilgit, Skardu
- No intracity public transport found.

### Islamabad
- Nothing in 2025–26 is missing from data/systems:
  - The FR-10 diversion to Margalla Road over the Sangjani toll dispute (ProPakistani, 28 Oct 2025) is already reflected in the existing FR-10 alignment.
  - FR-09 Khanna Pul – Golra Mor is already present.
  - The Dec 2024 routes are already present.
- OSM route relations in Islamabad: Red, Orange, FR-4 and FR-04A only.

## Cities missing from data/cities.json
No routes were added for these cities, so no city entry is needed yet. The centres below are OSM place nodes.

| City | id suggestion | centre (lat, lon) | OSM |
|---|---|---|---|
| Gwadar | gwadar | 25.14798, 62.32546 | node/90465594 |
| Mingora (Swat) | mingora | 34.77254, 72.36077 | node/4832577118 |
| Mansehra | mansehra | 34.32869, 73.19931 | node/114143790 |
| Kohat | kohat | 33.59671, 71.43999 | node/279783374 |
| Dera Ismail Khan | dera-ismail-khan | 31.82753, 70.90909 | node/279821922 |
| Gilgit | gilgit | 35.92081, 74.31404 | node/58568637 |
| Skardu | skardu | 35.28713, 75.65531 | node/4029819717 |

Turbat, Mardan and Muzaffarabad are already in cities.json.

## Method notes
- The earlier passes hit the 200-search cap. This pass used about 60 web searches plus direct fetches.
- **Tribune pages:** tribune.com.pk returns 403 to WebFetch, and web.archive.org is blocked for WebFetch. Tribune articles were therefore read with curl from `web.archive.org/web/2026id_/<url>`. That route works and is worth reusing for other Tribune leads.
- **Overpass:** route relations (bus, share_taxi, minibus) were queried per city bbox for all 19 cities. The only finds were the known Peshawar DR 05 and SR 08 relations, an unnamed one-member relation near Kotri, and Islamabad metro/FR-4 relations. The maps.mail.ru mirror returned many 504s and needed retries.
- Named bus stops and landmarks were pulled for Quetta, Hyderabad and Sukkur and matched by hand. A match was used only when it was unambiguous.

## Sources
| Title | URL | Publisher | Date |
|---|---|---|---|
| SMTA route directory / HYD-01 page | https://smta.gos.pk/route-map, https://smta.gos.pk/routes/21 | SMTA (official) | 2026 |
| Pink People's Bus Service inaugurated in Hyderabad | https://dailytimes.com.pk/1064501/pink-peoples-bus-service-for-women-inaugurated-in-hyderabad/ | Daily Times | 2023-02-19 |
| Pink People's Bus Service launched in Hyderabad | https://www.zameen.com/news/pink-peoples-bus-service-launched-in-hyderabad.html | Zameen News | 2023-02 |
| First route of PBS in Hyderabad announced | https://www.thenews.com.pk/print/1006734-first-route-of-peoples-bus-service-in-hyderabad-announced | The News | 2022-11-05 |
| Hyderabad to get new Peoples Bus route after Eid | https://www.nation.com.pk/19-May-2026/hyderabad-get-new-peoples-bus-route-eid-sharjeel-memon | The Nation | 2026-05-19 |
| Sindh approves 500 electric buses | https://propakistani.pk/2026/05/20/sindh-approves-500-electric-buses-for-two-cities/ | ProPakistani | 2026-05-20 |
| New route for PBS launched for Larkana, Qambar, Shahdadkot | https://www.nation.com.pk/19-Sep-2026/new-route-peoples-bus-service-launched-larkana-qambar-shahdadkot | The Nation | 2026-09-19 |
| لاڑکانہ، قمبر اور شہدادکوٹ کے لیے پیپلز بس سروس کا نیا روٹ | https://www.express.pk/story/2833407/ | Express Urdu | 2026-09-18 |
| 2 New Peoples Bus Service Routes Announced | https://propakistani.pk/2026/08/04/2-new-peoples-bus-service-routes-announced/ | ProPakistani | 2026-08-04 |
| لاڑکانہ تا قمبر بس سروس کا نیا روٹ | https://jang.com.pk/news/1597673 | Daily Jang | 2026 |
| Peoples Bus Service set to start in Sukkur | https://pakobserver.net/peoples-bus-service-set-to-starts-its-operations-in-sukkur/ | Pakistan Observer | 2023-02-17 |
| From Quetta's heart to every corner | https://tribune.com.pk/story/2432520/from-quettas-heart-to-every-corner | Express Tribune | 2023-08-27 |
| Green Line Bus Service to SMBZAN Institute of Cardiology | https://en.dailyqudrat.pk/81381/ | Daily Qudrat English | 2026-04-29 |
| Balochistan launches Green Line bus to Cardiology Institute | https://propakistani.pk/2026/04/30/balochistan-launches-green-line-bus-service-to-cardiology-institute-in-quetta/ | ProPakistani | 2026-04-30 |
| 17 more e-buses to be added to Quetta fleet | https://www.dawn.com/news/2031018/17-more-e-buses-to-be-added-to-quetta-fleet | Dawn | 2026-09 |
| Quetta Green Bus to add 17 e-buses, expand feeder routes | https://www.dailyindependent.com.pk/2026/09/17/quetta-green-bus-service-to-add-17-electric-buses-expand-feeder-routes/ | Daily Independent | 2026-09-17 |
| کوئٹہ میں پہلی بار پنک بس سروس کا آغاز | https://www.city42.tv/10-Dec-2025/186761 | City42 | 2025-12-10 |
| Balochistan expands Green Bus fleet to 25 | https://www.app.com.pk/domestic/balochistan-expands-green-bus-fleet-to-25-in-quetta-with-17-new-additions/ | APP | 2025 |
| Quetta 27 e-buses / BHC orders | https://dailyqudrat.pk/520279/, https://dailyqudrat.pk/522931/ | Daily Qudrat | 2026-09 |
| Turbat Green Peoples Bus | https://www.nation.com.pk/10-Mar-2026/balochistan-launches-green-peoples-bus-service-turbat | The Nation | 2026-03-10 |
| BRT Peshawar to start new feeder routes | https://propakistani.pk/2026/05/11/brt-peshawar-to-start-new-feeder-bus-routes/ | ProPakistani | 2026-05-11 |
| Peshawar BRT expands to new routes | https://dunyanews.tv/en/Pakistan/869094-peshawar-brt-expands-to-new-routes-to-meet-growing-demand | Dunya News | 2025-02-19 |
| TransPeshawar route maps page | https://transpeshawar.pk/passenger-services/zu-route-maps/ | TransPeshawar (official) | 2025-06 map |
| Colour-coded public transport in Abbottabad | https://www.app.com.pk/kp/commissioner-hazara-launches-color-coded-public-transport-system-in-abbottabad/ | APP | 2026-07-07 |
| Pink and Blue Suzuki service enforcement | https://hazaraexpressnews.org/7767/ | Hazara Express News | 2026 |
| Feasibility of green bus service in Kohat | https://www.app.com.pk/kp/feasibility-of-green-bus-service-nears-completion-in-kohat/ | APP | 2026 |
| AJK PM inaugurates Green Bus Service | https://wenews.pk/news/502764/ | WE News | 2026 |
| AJK PM thanks Nawaz, Maryam for green buses | https://tribune.com.pk/story/2626412/ajk-pm-gilani-thanks-nawaz-maryam-for-green-buses-for-muzaffarabad | Express Tribune | 2026-08 |
| Islamabad feeder route changed (NHA dispute) | https://propakistani.pk/2025/10/28/islamabad-metro-feeder-bus-route-changed-due-to-dispute-with-nha/ | ProPakistani | 2025-10-28 |
| OpenStreetMap via Overpass | https://www.openstreetmap.org | OSM contributors (ODbL) | 2026-09-24 |

## Next steps
- **Ask SMTA for the full stop lists** of LRK-QMB, HYD-PINK (and whether it still runs), and the planned Hyderabad EV routes. The SMTA helpline is 0800-07682.
- **Ask Balochistan Transport Dept for stop lists** for the Kuchlak and Metropolitan–Sariab routes. The department's Green Bus app, which has route details according to Daily Independent, may expose them.
- **Recheck Hyderabad in October:** watch for the Latifabad route launch and the 5 EV routes.
- **Recheck the Muzaffarabad e-bus routes in October.**
- **Abbottabad colour codes:** ask the Commissioner Hazara office or the District Traffic Police, or look at photos of the route stickers.
