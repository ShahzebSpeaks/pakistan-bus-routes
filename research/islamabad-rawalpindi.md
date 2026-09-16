# Islamabad & Rawalpindi: research summary

Researched on 2026-09-16. Data file: `islamabad-rawalpindi.json`. The build script and raw downloads are in `cache/isb/`: OSM relations and stops, CDA timetable PDFs, Safar pages and `build.py`.

## Systems

| System id | Operator | Routes | Fare |
|---|---|---|---|
| `isb-rwp-metrobus` | PMA (Red); CDA/CMTA (Orange, Blue, Green) | RED, ORANGE, BLUE (CDA FRB-01), GREEN (CDA FRG-1) | Red Rs 40 from 2026-03-26 (was Rs 30); CDA lines Rs 50 |
| `islamabad-electric-feeder` | CDA / CMTA | FR-01, 03A, 04, 04A, 04B, 05, 06, 07, 08A, 08B, 08C, 09, 10, 11, 12, 13, 14, 14A, 15, EX-16, FR-17, ST-01, ST-02 | Rs 50 flat (the Rs 100 hike of 1 Jun 2025 was withdrawn on 4 Jun 2025) |
| `rawalpindi-electric-bus` | Punjab Masstransit Authority | RWP-EB-01, 01X, 02, 03, 04, 05 (ids are provisional) | Rs 20; free for women, students, seniors and disabled people (Dawn, Nov 2025) |

In total there are 33 routes and 647 stops. 128 stops have OSM coordinates. Red (24/24) and Orange (9/9) are fully covered, and FR-04 has 18 of 25 stops. Most feeder stops are not mapped in OSM.

## Sources used
- **Official CDA pages:** the `cdaTransitMap` route table and per-route timetable PDFs (`Assets/metro_transit_route/*.pdf`), plus Transit Map PDFs V-06, V-07 and V-08 (Oct 2025). They give stop order, headways and first/last trips.
- **Wikipedia:** Rawalpindi–Islamabad Metrobus (opening dates, lengths).
- **Safar (safar.fyi):** route pages (JSON-LD stop names only). Used where the CDA data is stale or missing, and for the Rawalpindi routes.
- **News:** Dawn, Aaj, 24NewsHD, PakWheels and ProPakistani for launch dates and fares.
- **OSM:** relations 13911249 (Red), 13911250 (Orange), 18946704/18950634 (FR-4) and 19222651/2 (FR-04A). The relations came from the OSM API because Overpass rate-limited the relation query. Bus stops and platforms came from Overpass (bbox 33.45,72.80,33.85,73.30).

## Key conflicts and uncertainties
1. **Red Line fare:** Rs 40 from 26 Mar 2026 according to news reports. Safar still shows Rs 30.
2. **Orange Line:** Safar shows the BRT ending at N-5, with a separate N-5 to Airport express at Rs 90. It is not clear whether buses still run through to the airport. The OSM station names for G-13 and Golra Morr are mapped by assumption.
3. **FR-05:** the CDA table says Golra Morh–Taxila, but the timetable PDF shows NUST–D-12, and Safar does not list the route. Marked `unverified`.
4. **Official timetable PDFs lag the route table in places:**
   - FR-03A: PDF ends at Flower Market; route table says Saidpur.
   - FR-11: PDF ends at I-14; route table says I-16/4.
   - FR-06: PDF ends at Golra Sharif; newer map shows E-11 Markaz.
   - FR-04A: CDA says QAU; Safar says Barakahu.

   I used the longer or newer pattern and recorded the difference in each route's notes.
5. **Routes found only on Safar:** EX-16 (PIMS–Media Chowk) and FR-17 (Humak–Aari Syedan), both `unverified`. FR-08B appears only on the CDA map and Safar.
6. **Rawalpindi electric buses:** no official route numbers exist. The Railway Station–Hamrahi and Saddar–Bhatta Chowk routes are unverified. Dawn reports 7 routes, but only 6 were found.
7. **Colours:** no official line colour hex codes were found; all `color` fields are null.
