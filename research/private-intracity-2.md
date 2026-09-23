# Private intracity routes, pass 2, and intercity place coordinates (2026-09-23)

Outputs:
- `research/incoming/private-intracity-2.json` (SCHEMA.md format).
- `research/incoming/intercity-places.json`.
- Working files: `research/cache/private-intracity-2/`. This holds the per-city research JSON and `merge.py`. `merge.py` still reads its inputs from the session scratch folder, so change its input paths before re-running it.

Both JSON files parse. Nothing in `data/` was changed.

Every private route has `status: "unverified"`. No stop has coordinates: none of the sources gave any, and OSM has no private route relations in these cities. The previous country-wide harvest (`research/osm-route-relations.json`, 2026-09-16) was re-checked for this.

**Search limit hit again.** The session-wide cap of 200 web searches was reached during this pass. Multan and Bahawalpur got about 32 searches between them. The other cities got 45 to 55 each.

## Counts

| City | System | Routes | Stops | Confidence | Data date |
|---|---|---|---|---|---|
| Faisalabad | faisalabad-private-wagons | 28 | 111 | 5 medium, 23 low | 2002 (WEDC/FUTS), 2018 (Wikiroutes) |
| Hyderabad | hyderabad-private-wagons | 7 | 14 | low (endpoints only) | 2025 (MUET survey paper) |
| Bahawalpur | bahawalpur-private-wagons | 6 | 12 | low (endpoints only) | c.2010 (Urban Unit PCIIP profile) |
| Gujranwala | gujranwala-private-wagons | 4 | 8 | low (endpoints only) | 2006 permits, 2017 paper |
| Peshawar | peshawar-private-wagons | 1 | 2 | low | undated directory |
| Abbottabad | abbottabad-pink-bus (government, suspended) | 1 | 20 | medium | 2018-19 (Dawn) |
| Mardan | mardan-pink-bus (government, suspended) | 1 | 16 | medium | 2018-19 (PakWheels, Dawn) |
| Multan, Sialkot, Quetta, Sukkur | none | 0 | – | – | – |

Abbottabad and Mardan have no private routes, so neither has a `-private-wagons` system. Their Pink Bus systems are KP-government women-only services, suspended in 2019. They are kept as separate systems so they are not mislabelled as private.

## Per city

### Faisalabad (28 routes)
**FUTS wagon routes (June 2002): 1, 2, 3, 5, 6, 7, 7-A, 7-B, 8, 9, 11, 12, 13 and 14.**
- These come from Table 3.1 of the WEDC case report (Atta Ullah Khan, Loughborough University, 2003), which uses data from the FUTS administrator.
- Routes 1, 2, 3, 5 and 6 list their areas in order. Some of these "stops" are road names.
- The other routes give only their ends plus the FUTS main terminal at Aminpur Bazaar.
- Each route has its wagon count and length. The table has no routes 4 or 10.

**Other routes from the same report:**
- 4 Suzuki pick-up routes that were still running in 2002
- 7 private urban bus routes from RTA Faisalabad, ends only

**Wikiroutes (crowdsourced, 2018):**
- "1 No. Wagon": Narwala Chowk – Allied Hospital, Rs 30
- "20 No. Wagon": Chenab Chowk – Railway Station, Rs 20
- Bus "11b": Kotwali – Khurrianwala, 16 stops

**Conflict:** route 1 in FUTS 2002 is Ghulamabad – Makkuana Bypass, but Wikiroutes' 2018 "1 No. Wagon" is Narwala Chowk – Allied Hospital. Numbering has evidently changed.

**Merge note:** `faisalabad-private-wagons` already exists in `research/incoming/private-intracity.json` with route B-10. Merge the new routes into it; don't create a second system.

**Gap:** FUTS still exists and is building a tracking app (ProPakistani, July 2026), but it publishes no current route list.

### Hyderabad (7 routes)
- The routes come from Table 1 and Fig. 13 of Memon et al. 2025, MURJET 44(2), whose route data came from the RTA and site surveys:
  - Channel Mori – LMC Jamshoro (Coaster)
  - Gol Building – Khuda Ki Basti
  - Giddu Chowk – Latifabad
  - Gari Khata – Naseem Nagar
  - Civil Hospital – LMC Jamshoro
  - Civil Hospital – Miani Goth
  - Badin Stop – Hala Naka (mini taxi)
- The four middle routes and Civil Hospital – Miani Goth are Suzuki vans.
- The paper's numbers 02–08 are its own survey numbers, so the routes use slug ids.
- **Not found:** the numbered coach routes (e.g. Latifabad No. 7/8/10/11) with stops, and any fares.
- OSM has about 60 named bus-stop nodes (e.g. "Latifabad Unit No 7", "10 Number Bus Stop", Hala Naka). They could help geocode stops later.

### Bahawalpur (6 routes)
- The routes come from Table 21 of the Urban Unit PCIIP Bahawalpur City Profile (c.2010), which lists major Qingqi, auto-rickshaw and pick-up corridors:
  - University Road – Welcome Chowk
  - University Road – Yazman Road
  - City Hotel Chowk – Farid Gate
  - Farid Gate – Dubai Chowk
  - Dubai Chowk – Welcome Chowk
  - City Hotel Chowk – Welcome Chowk
- They have no route numbers. The profile says the city had no bus or van service.

### Gujranwala (4 routes)
- The routes are City Tour private bus routes gazetted in June 2006 and still running in 2017, from Aslam & Batool, MUET Research Journal 36(3), 2017:
  - B1 Kamonki – Aziz Cross
  - B2 Chan Da Qilla – Gakhar
  - B4 Sheikhupura Morr – Wazirabad Railway Station
  - B5 Daska – Gulshan Iqbal Park Mor
- The paper describes the service as failing, so current status is doubtful.
- B3, B6, B7 and B8 were already not running in 2017; they are listed only in the system notes.
- The paper says Qingqis have no fixed routes.
- The 2021 Urban Unit Gujranwala Connectivity Plan (83 pages) has no route table.

### Peshawar (1 route)
- **Haji Camp Adda – Kohat Adda:** from an undated pakistanplaces.com listing that doesn't give the vehicle type.
- **Merge note:** append this route to the existing `peshawar-private-wagons` in `data/systems`.
- **Dropped:** Dawn's 2019 "Bara Bus"/"Rocket" (Peshawar – Bara), because its Peshawar terminal isn't named and it was probably scrapped under the BRT bus-industry restructuring.
- **Fares:** the RTA per-km rate from March 2026 (minibus/wagon Rs 3.51/km) is at system level, with `type: unknown`.
- **Gap:** Express Urdu mentions 504 permit holders compensated when BRT replaced their routes, but that list isn't online. ADB 48289 documents apart from the sector assessment were 403 or 404.

### Abbottabad (Pink Bus only)
- The route is Mansehra Bus Stop – Frontier Medical College, 20 ordered stops, 18 km (Dawn 2018; Dawn Images 2019). It was suspended in 2019.
- **Private Suzuki routes:** in July 2026 the Commissioner Hazara introduced route colour-coded stickers (APP, ProPakistani). Neither article gives the routes or colours.
- **Unread lead:** an Express Tribune article on Suzuki fares (Rs 3.50/km to Ayub Medical Complex and Nawan Shehr) returned 403.

### Mardan (Pink Bus only)
- The route is Baghdada Chowk – Abdul Wali Khan University Garden Campus, 16 stops merged from PakWheels (2019) and Dawn (2018). The flat fare was Rs 20 in April 2019, and the service is suspended.
- **Fleet conflict:** PakWheels says 7 buses; Geo says 10.
- **Not a known city:** `mardan` is not in `data/cities.json`. It would need a bbox of about [34.12, 71.95, 34.28, 72.15].
- **Gap:** no private wagon or Qingqi routes found.

### Multan, Sialkot, Quetta, Sukkur (nothing)
- **Multan:** the only route lists online are government ones (Metro, MFR feeders, Green e-bus, planned PMA network), all excluded. safar.fyi and the Urban Unit plan list no private routes.
- **Sialkot:** a 2012 Transport Planning Unit (TPU) note says Qingqis, pick-ups and wagons run "without any proper routes". The four proposed bus routes it mentions are unnamed.
- **Quetta:**
  - Arab News reports about 550 private buses. It gives the route count as 7 in March 2023 but 15 in July 2023, and names none of them.
  - A GPP Balochistan intracity bus study was tendered in November 2021, but no output was found.
- **Sukkur:** sources say Suzukis run fixed main-road routes, but none is named.

## Task B: intercity places

| Name | lat, lon | Source | Confidence |
|---|---|---|---|
| Sikandrabad (Nagar, GB) | 36.2425421, 74.3748436 | osm:node/737324983 (place=town "Sikandarabad"), agreeing with Wikidata Q7513568 | high |
| Marot (Bahawalnagar) | 29.1770224, 72.43446 | osm:way/506998382 (Marot Fort; the OSM town has no place node), agreeing with GeoNames 1170785 "Marot Fort" (alt. Marot) | medium |
| Jhangra (Silk Line) | null | unresolved; candidate only | – |

**Marot conflicts:**
- Wikidata Q15248566 and GeoNames 13431359 put Marot about 5.5 km north, at 29.227, 72.43, on the Fort Abbas–Mandi Yazman road.
- The en.wikipedia infobox (28.51, 71.5) is wrong.

**Jhangra:**
- Silk Line lists Lahore – Jhangra: Rs 2,150, the same fare as DG Khan, Jatoi and Alipur, departing Jhangra at 20:30 (tracktrainlive).
- Silk Line's own terminal lists don't mention it, and OSM has no south-Punjab place of that name.
- **Candidate:** GeoNames 1175895 "Jangre Basti" (alt. Jhangra), Bahawalpur District, 29.382389, 71.204316. It lies between Jalalpur Pirwala and Uch Sharif, both Silk Line stops. It is stored only under `candidate` and needs confirming, e.g. by calling Silk Line on 0311 1254 333.
- The Wikipedia/Wikidata "Jhangra" (Q3246923) is in Abbottabad District and is not this stop.

## Sources

| Title | URL | Publisher | Date |
|---|---|---|---|
| Partnerships to Improve Access and Quality of Public Transport – Faisalabad case report | https://wedc-knowledge.lboro.ac.uk/resources/books/Partnerships_to_improve_access_transport_-_Pakistan.pdf | WEDC, Loughborough University | 2003 |
| Wikiroutes Faisalabad | https://wikiroutes.info/en/faisalabad/catalog | Wikiroutes (crowdsourced) | 2018 |
| PCIIP Cities Profile – Bahawalpur | https://urbanunit.gov.pk/Download/publications/Files/8/2021/PCIIP%20Cities%20Profile-Bahawalpur.pdf | The Urban Unit / ADB | c.2010 |
| Evaluation of Urban Bus Transport Failure in Gujranwala | https://publications.muet.edu.pk/index.php/muetrj/article/view/252 | MUET Research Journal | 2017 |
| Gujranwala Regional Plan – Connectivity Plan | https://urbanunit.gov.pk/Download/publications/Files/13/2021/Gujranwala%20Regional%20Plan%20-%20Connectivity%20Plan.pdf | The Urban Unit | 2021 |
| TPU Sialkot bus routes / Gujranwala urban transport | https://tpu.punjab.gov.pk/bus_routes_sialkot_city | Transport Planning Unit, Punjab | 2012 |
| Commuter perception and optimization of public transit routes in Hyderabad | https://murjet.muet.edu.pk/index.php/home/article/view/142 | MURJET | 2025 |
| Kohat Bus Stand Peshawar listing | https://pakistanplaces.com/listing/kohat-bus-stand-peshawar | Pakistan Places | undated |
| Urbanscape: A farewell to wagons | https://www.dawn.com/news/1496631 | Dawn | 2019-07-28 |
| Peshawar fare increase | https://jang.com.pk/news/1564243 | Daily Jang | 2026-03-12 |
| Pink bus Abbottabad/Mardan | https://www.dawn.com/news/1417736 | Dawn | 2018 |
| Pink Bus service launched in Mardan | https://www.pakwheels.com/blog/pink-bus-service-launched-mardan/ | PakWheels | 2019-04 |
| Colour-coded public transport system in Abbottabad | https://www.app.com.pk/kp/commissioner-hazara-launches-color-coded-public-transport-system-in-abbottabad/ | APP | 2026-07 |
| Quetta private buses | https://www.arabnews.pk/node/2339311/pakistan | Arab News | 2023-07 |
| OpenStreetMap (Overpass; node 737324983, way 506998382) | https://www.openstreetmap.org | OSM contributors (ODbL) | 2026-09-23 |
| Wikidata Q7513568, Q15248566 | https://www.wikidata.org | Wikidata (CC0) | 2026-09-23 |
| GeoNames 1170785, 13431359, 1175895 | https://www.geonames.org | GeoNames (CC BY) | 2026-09-23 |
| Silk Line routes and fares | https://tracktrainlive.com/pakistan/silk-line, https://bookme.pk/silk-line | third-party aggregators | 2026 |

The full per-route source lists are in the JSON.

## Next steps
- Raise `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION` and run another pass on Multan, Sukkur and Quetta, using Urdu and Sindhi papers and Facebook community groups.
- Use RTI requests to district RTAs for route-permit registers. These are the only route lists that would be complete and current.
- Geocode stops later with the pipeline. Hyderabad's OSM stop nodes are a good start.
