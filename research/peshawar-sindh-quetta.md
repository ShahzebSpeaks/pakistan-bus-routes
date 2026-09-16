# Peshawar, interior Sindh, Quetta/Balochistan: research summary (2026-09-16)

Data file: `peshawar-sindh-quetta.json`. Raw downloads are in `cache/psq/`: OSM Overpass JSON, TransPeshawar pages, the network map and fare images, and SMTA route pages. Builder script: session scratchpad `psq_build.py`.

## Coverage

| System | City | Routes | Stops | With coords |
|---|---|---|---|---|
| peshawar-zu-brt | peshawar | 19 | 273 | 164 |
| hyderabad-pbs | hyderabad | 3 (1 inactive) | 24 | 4 |
| sukkur-pbs | sukkur | 1 | 11 | 0 |
| shikarpur-pbs | shikarpur | 1 | 14 | 0 |
| larkana-pbs | larkana | 2 (1 planned) | 8 | 0 |
| nawabshah-pbs | nawabshah | 1 | 8 | 0 |
| mirpurkhas-pbs | mirpurkhas | 1 | 8 | 0 |
| khairpur-pbs | khairpur | 2 | 17 | 0 |
| quetta-green-bus | quetta | 3 (1 planned, 1 unverified) | 2 | 2 (campus centroids) |
| turbat-green-bus | turbat | 1 | 0 | 0 |

## Peshawar (Zu / TransPeshawar)
- Main source: the official "Zu Peshawar Network" map v46, updated April 2025 and published on transpeshawar.pk in June 2025. It shows 19 routes:
  - BRT routes: ER01, SR02, SR08, XER15.
  - Express routes: ER09, ER10, ER12, ER16.
  - Direct/feeder routes: DR03A, DR03B, DR04A, DR04B, DR05, DR06, DR07, DR11, DR13, DR14, DR14A.
- Corridor stations are numbered 1-31. Number 17 is not built, which leaves 30 stations. All 30 have OSM station coordinates.
- Feeder stop numbers (100-221) and names come from the map. About 40 feeder stops were matched to OSM Zu platforms. OSM relation DR 05 confirms that route's sequence.
- Fare table (official image, April 2026), by distance:

  | Distance | Fare |
  |---|---|
  | Under 5 km | Rs30 |
  | 5-10 km | Rs35 |
  | 10-15 km | Rs45 |
  | 15-20 km | Rs50 |
  | 20-25 km | Rs55 |
  | 25-30 km | Rs60 |
  | 30-35 km | Rs65 |
  | Over 35 km | Rs70 |

  A single-journey ticket costs Rs70. Express buses on feeder routes charge a flat Rs55. The Zu card costs Rs400.
- Hours: 06:00-22:00. The last ER01 departure is 20:30 (since July 2026). Helpline: 091-111-477-477.
- Uncertain: which corridor stations the express routes stop at was read visually from the map (low/medium confidence). New Ring Road, Dilzak Road and Khyber Road feeders were approved in May 2026 but have no published details.

## Sindh Peoples Bus Service (outside Karachi)
- Source: the official SMTA provincial route directory (smta.gos.pk/route-map, 2026). Route codes: HYD-01/02/03, SUK-01, LRK-01, SBA, Mirpur Khas, Shikarpur, Khairpur 01/02.
- Stops come from SMTA's "via" lists, which mix stops with area names. Only 4 Hyderabad stops have OSM coordinates, taken from SMTA-tagged OSM nodes.
- New routes:
  - Sukkur-Shikarpur: April 2026, 50% fare subsidy.
  - Hyderabad-Tando Allahyar: 22 April 2026.
  - Khairpur: May 2026.
  - Larkana-Qambar-Shahdadkot: due 18 September 2026.
- Fares and hours are not published for these cities.
- No Hyderabad Pink or EV service was found.

## Balochistan
- Quetta Green Bus:
  - Launched July 2023 on BUITEMS - University of Balochistan (18.7 km, 18 stops). Fare Rs30; hours 07:00-20:00.
  - Fleet grew to 25 buses in late 2025, and a Pink Bus started in December 2025.
  - The stop list is not published, and the Kuchlak extension is still planned.
- Turbat: Green Bus launched March 2026 (18.4 km, 18 stops). No stop names or fare published.

## Not operational / not found
- KP cities Mardan, Swat, Abbottabad and D.I. Khan: feasibility studies only.
- Muzaffarabad (AJK): electric buses at the pre-launch stage (August 2026).
- Gilgit-Baltistan: nothing found.
