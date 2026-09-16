# Lahore – research summary (2026-09-16)

Output: `research/lahore.json`. Build script and raw downloads: `research/cache/lahore/` (Safar HTML pages, parsed stop lists, timetable-derived headways, OSM Overpass stops extract, `build.py`).

## Systems

| System id | Mode | Routes | Stops | With coords | Fare |
|---|---|---|---|---|---|
| lahore-metrobus | brt | 1 (Shahdara – Gajju Matah, 27 km, 2013) | 27 | 27 (OSM) | Rs40 flat from 2026-03-26 (Rs25 with Green Transport Card, reported) |
| lahore-orange-line | metro_rail | 1 (Ali Town – Dera Gujran, 27.1 km, 2020) | 26 | 26 (OSM) | Distance slabs Rs25/30/35/40/45 (since early 2024) |
| lahore-feeder (Speedo) | feeder | 23 (RT-03…RT-28) | 559 | 92 | Rs25 flat |
| lahore-electric-bus | electric_bus | 3 (EV03, RT20-E, RT26-E) | 132 | 17 | Rs20 flat; students and disabled ride free |
| lahore-metro-planned | metro_rail | Blue, Purple (planned) | 0 | – | – |

Total 744 stops; 162 have coordinates.

## Routes
- **Speedo feeders.** 15 routes are on PMA's official Phase-I list (FRT03–FRT18, no FRT06). They are RT-03, 04, 05, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17 and 18. RT-19, 20, 21, 23, 24, 25, 27 and 28 come only from Safar and have low confidence. The ordered stop lists and timetables come from safar.fyi, because PMA does not publish stop lists.
- **Electric buses.**
  - EV03: Railway Station – Green Town. 27 buses, about 21 km, launched Feb 2025.
  - Phase II (opened 2025-10-04): RT20-E Jinnah Terminal – Raiwind and RT26-E Jinnah Terminal – Harbanspura (Khaira Pull).
- **Headways** are the median gap in Safar's published timetable from the first stop. **Hours** are Safar's first and last service times.

## Coordinates
- **Metrobus and Orange Line:** every station is matched by hand to an OSM station or PMA bus_stop element, using Urdu names.
- **Feeder and electric stops:** a coordinate is filled only when an OSM element has a clearly matching name. A feeder stop at a metro station uses that station's element. All other stops are null.
- **Route relations:** Overpass returned none. overpass-api.de could not be reached, so the data came from the maps.mail.ru mirror.

## Key uncertainties
1. The Orange Line fare may have changed after the Nov 2025 Rs50 proposal and the March 2026 BRT fare rise. It is not confirmed.
2. Speedo fare after March 2026 is not confirmed. The free-travel period ended 2026-06-13.
3. Speedo RT-01, 02, 06, 22 and 26 are missing from all sources. The RT-20 title and stop list on Safar don't match.
4. Safar's "LFR01" route repeats the Metrobus stations exactly, so it was left out.
5. Orange Line station names differ between sources: Wahdat Road vs Saad Mughal Road, and Shahnoor vs Khatam-e-Nabuwat.
6. No 2025–26 confirmation was found that Lahore Transport Company (TransLahore) routes still run, so they are not included.
