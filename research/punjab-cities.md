# Punjab cities (excluding Lahore and Rawalpindi): research summary

Researched on 2026-09-16. Data file: `punjab-cities.json`. Raw downloads: `cache/punjab/` (safar.fyi pages gzipped, OSM Overpass JSON, PMA route-plan PDF).

## Totals
- 38 systems, 119 routes, 2,725 stops, all in 36 city ids.
- Coordinates: 46 stops. These are all 21 Multan Metrobus stations (OSM `*_Metrobus` nodes) plus about 7 distinct Multan feeder stops matched by exact OSM `highway=bus_stop` name. Every other stop is null and left for the geocoding pipeline.

## Multan
| System | Routes | Fare | Notes |
|---|---|---|---|
| `multan-metrobus` (PMA) | 1 corridor, BZU to Kumharanwala Chowk, 18.5 km, 21 stations, opened 2017-01-24 | Rs 40 from 26 Mar 2026 (Rs 25 with Green Transport Card); was Rs 25 | Helpline 061-111-222-627 |
| `multan-feeder` (PMA) | 19 routes: MFR01, 01B, 01C, 02, 03, 03B, 04, 04B, 07B, 08B, 09, 09B, 09C, 10, 11, 12A, 12B, 30, 39 | PMA policy: Rs 20 single, +Rs 5 per transfer with card | Codes and stops come from safar.fyi only |
| `multan-electric-bus` | 1 route (Vehari Chowk to Nishtar Chowk), status unverified | Unknown | Only safar.fyi lists it |

The PMA "Integrated Public Transport Network Multan" PDF has 40 planned feeder, express and suburban routes, plus planned Orange, Purple and Blue MBS lines. It is a planning document, so it is only cited and not modelled.

## Green Electric Bus (CM Punjab programme): operational districts
All district systems use a flat Rs 20 fare. Women, students, senior citizens and persons with disabilities ride free. Route terminals and stops come from safar.fyi. Launch reports are cited per system.

| Launch batch | Cities (routes) |
|---|---|
| Sep 2025 | Sargodha (5), Wazirabad (2), Dera Ghazi Khan (4), Faisalabad (2 of 7 reported), Sahiwal (4) |
| Nov 2025 ten-city phase | Bahawalpur (4), Bahawalnagar (3), Rahim Yar Khan (4), Rajanpur (4), Jhang (3), Toba Tek Singh (3), Jhelum (3), Chakwal (3), Gujar Khan (2) |
| ~6 Jul 2026 | Attock (2), Bhakkar (2), Hafizabad (2), Khanewal (2), Khushab (3), Mandi Bahauddin (2) |
| 16 Jul 2026 | Chiniot (2), Layyah (2), Okara (3), Sialkot (2), Murree (3, EVM01-03) |
| 31 Jul 2026 | Gujrat (2), Kasur (2), Lodhran (2), Nankana Sahib (2), Narowal (5), Sheikhupura (2), Vehari (2) |
| Launch date not found | Mianwali (3), Muzaffargarh (4), Pakpattan (3) |

## Not included (planned, no published routes)
- Gujranwala city e-buses: 12 buses were due by end-July 2026.
- Gujranwala Yellow Line BRT and the Faisalabad Metro.
- Tehsil-level expansion starting January 2027, with a target of 3,000 buses by June 2027.

## Main uncertainties
1. Stop lists for the district e-buses and Multan feeders come from one non-official source (safar.fyi) and cover one direction only.
2. Multan fares conflict: news reports the 2026 increase, but PMA and safar.fyi still show Rs 25.
3. Faisalabad: only 2 of the 7 reported routes could be identified.
4. Murree: news names routes to Kotli Sattian and 17 Mile, but safar.fyi lists routes to Barrian, Rawat and New Murree.
5. Multan's e-bus route has no official confirmation.
6. Official route codes are missing outside Multan and Murree, so the other route ids are made from the route names.
