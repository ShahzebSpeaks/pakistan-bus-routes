# Karachi Peoples Bus Service (PBS): research summary

Researched 2026-09-16. Data is in `karachi-pbs.json`. It has two systems: `karachi-pbs` and `karachi-pink-bus`.

## Coverage

| System | Route | Terminals | Stops | With coords |
|---|---|---|---|---|
| PBS red | R1 | Khokhrapar - Dockyard | 25 | 13 |
| PBS red | R2 | Power House - Korangi Crossing | 19 | 13 |
| PBS red | R3 | Power House - Nasir Jump | 21 | 12 |
| PBS red | R4 | Power House - Keamari | 25 | 13 |
| PBS red | R8 | Yousuf Goth - Tower | 14 | 6 |
| PBS red | R9 | Gulshan-e-Hadeed - Tower | 35 | 22 |
| PBS red | R10 | Numaish - Ibrahim Hyderi | 23 | 7 |
| PBS red | R11 | Miran Naka - Ziauddin Hospital | 19 | 5 |
| PBS red | R12 | Memon Goth - Lucky Star | 27 | 14 |
| PBS red | R13 | Hawksbay - Tower | 11 | 4 |
| PBS EV | R14 | Gulshan-e-Maymar - Tower (from 17 Mar 2026) | 17 | 7 |
| PBS EV | EV1 | CMH Malir Cantt - Dolmen Mall | 23 | 10 |
| PBS EV | EV2 | Bahria Town - Malir Halt | 11 | 4 |
| PBS EV | EV3 | Malir Cantt - Numaish | 26 | 13 |
| PBS EV | EV4 | Bahria Town - Ayesha Manzil | 11 | 5 |
| PBS EV | EV5 | DHA City - Sohrab Goth | 12 | 4 |
| PBS double-decker | DD1 | Model Colony - Tower (from 1 Jan 2026, extended 16 Feb 2026) | 16 | 9 |
| Pink | R1, R2, R3, R9, R10 | same as red routes, women-only | 123 | 67 |
| Pink | PINK-ACN | Abdullah Chowk - Numaish (Nov 2025, unverified) | 2 | 1 |

Totals: 23 route entries, 460 stop rows, 229 with coordinates. The pink routes repeat the red stop lists.

## Fares, hours and payment
- **Fare:** Rs 80 for trips up to 15 km and Rs 120 beyond 15 km, from 1 Feb 2025 (Dawn, Tribune). Before that the minimum fare was Rs 50. Sources say the same slab applies to EV and double-decker buses. I found no later change up to Sep 2026.
- **Pink fare:** unclear. It was Rs 50 in 2023-24, and Nov 2025 news still quoted Rs 50.
- **EV5 fare at launch (May 2024):** Rs 100 or Rs 150.
- **Hours:** 07:00-22:00, with a bus about every 15 min at peak and every 30 min off-peak (Think Transportation, redbus.shop, rehbar.pk). INCPak says 07:00-20:00. There is no official timetable.
- **Payment:** cash, or the Zindigi/Mastercard "Sindh Mass Transit" contactless card. The card system was introduced in May 2024 and rolled out in phases. The Breeze card is not documented for PBS.
- **Helpline:** 0800-07682 (SMTA).

## Sources consulted
- **Official:** SMTA route directory at smta.gos.pk/route-map (2026). It is the primary source, with 30 route pages saved in `cache/karachi_pbs_smta_routes/`. Also smta.sindh.gov.pk (PBS project page and the EV-5 launch notice).
- **Route-info sites:** thinktransportation.net (Feb 2025), redbus.shop (a near-copy of Think Transportation), rehbar.pk, INCPak, Zameen blog (2022/2023). Wikipedia was checked but is outdated.
- **News:** Dawn (fare Feb 2025; card May 2024; double-decker Dec 2025), Express Tribune, ProPakistani (July 2024 launches, Feb 2026 double-decker, Mar 2026 EV route), ARY, Dunya, Daily Jang (R3 diversion), Business Recorder (500 EV buses), TechJuice and The Nation (pink route Nov 2025).
- Rehbar's older URL and several Tribune, Business Recorder and Hamariweb pages returned 403 or 404.

## Method for stop lists and coordinates
- **Stop lists:** I merged the SMTA "via" lists with the Think Transportation lists. Where they disagree on order, I used OSM element positions projected onto the reference polylines in `reference/karachi-pbs.geojson`. After the fixes, every route's placed coordinates run in order along its polyline. Road names such as "National Highway 5", "Korangi Road" and "Malir Link Road" are left out as stops.
- **Coordinates:** taken only from OSM, downloaded through the overpass.kumi.systems mirror because overpass-api.de timed out. The dumps are `cache/karachi_pbs_osm_*.json`.
  - Each match was accepted by hand, and only where it was clearly the same place and within 500 m of that route's polyline.
  - Rejected: shops/restaurants named after a place, railway stations (e.g. "Airport"), and area centroids for junction-named stops.
  - DD1 was checked against the R1 polyline. R14 and the Numaish stop on PINK-ACN were checked against any PBS polyline, because they have no reference geometry of their own.

## Main conflicts and uncertainties
1. **R2:** ends at Indus Hospital according to Think Transportation, redbus.shop and rehbar.pk, but at Korangi Crossing according to SMTA and the polyline.
2. **R11:** ends at Ziauddin Hospital according to SMTA and the polyline, but at Shireen Jinnah Colony according to Think Transportation.
3. **R12:** starts at Memon Goth according to SMTA and news, but at Naddi Kinara according to Think Transportation. The polyline hits Khokhrapar after about 2 km.
4. **R4 downtown:** SMTA lists Sindh High Court; Think Transportation and the polyline follow M.A. Jinnah Road.
5. **Stop order:** Lal Kothi comes after Karsaz according to OSM, not before as Think Transportation lists it. Ordering is unverified in the DHA sections of R10 and R11, in the Baldia section of R8, and around Dua Restaurant, ICI and Jinnah Bridge on R8 and R13.
6. **R14:** the code comes only from the SMTA directory and the stop list is single-source. News reports the route only as "Gulshan-e-Maymar to Tower".
7. **EV4:** launched in 2024 as Kathore - Numaish and is now Bahria Town - Ayesha Manzil. SMTA says "Old Sabzi Mandi"; other sources say New Sabzi Mandi.
8. **Route lengths:** SMTA and Think Transportation often differ by 5-24 km (EV4: 58 km vs 34 km).
9. **Pink service:** the scope (all-day or peak-only), the fare, and the Abdullah Chowk route (location, stops, whether it still runs) are all unconfirmed.
10. **Inactive routes:** SMTA marks R5, R6 and R7 as inactive, so they are left out. The planned 500-EV-bus routes are not launched yet.
