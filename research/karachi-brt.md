# Karachi BRT and mass transit: research summary (2026-09-16)

Data file: `karachi-brt.json`. Raw downloads are in `cache/`: OSM Overpass extracts `osm_stations_stops.json` and `osm_orange_corridor.json`, plus Wikipedia wikitext `wp_*.wiki`.

## Systems and routes

| System | Route | Status | Stops | With coords |
|---|---|---|---|---|
| karachi-breeze | GREEN: Abdullah Chowk to Numaish | operational (since 2021-12-25) | 22 | 22 (OSM) |
| karachi-breeze | GREEN-EXT: Numaish to Jama Cloth (then Tower) | under construction, promised by 2026-10-31 | 6 | 2 |
| karachi-breeze | ORANGE: Orangi TMO to Board Office to Nagan Chowrangi | operational (since 2022-09-10; runs through to Nagan since Dec 2025) | 10 | 9 |
| karachi-breeze | GREEN-EXPRESS: limited-stop peak service | unverified (launched 2025-06-17) | 6 | 6 |
| karachi-breeze | RED: Malir Halt to Numaish | under construction (FWO resumed 2026-04; about mid-2027) | 15 | 0 |
| karachi-breeze | YELLOW: Dawood Chowrangi to Numaish | under construction (depots and bridge; corridor packages at tender) | 2 (terminals) | 0 |
| karachi-breeze | BROWN: Singer Chowrangi to Nagan Chowrangi | planned (pre-feasibility) | 2 (terminals) | 0 |
| karachi-circular-railway | KCR-LOOP | planned (ADB pledged $1bn, May 2026) | 19 | 13 |

## Fares and hours
- **Green Line:** fare depends on distance, from Rs15 minimum to Rs55 for the full route. The smart card costs Rs100. The Sindh subsidy keeps the fare unchanged. No published fare table by distance was found.
- **Orange Line:** sources conflict. One gives Rs25 cash or Rs20 with the card; another gives Rs10 to Rs20. Since 2025-12-31 a single ticket covers a trip on both Orange and Green.
- **Hours:** 07:00 to 22:00. Peak headway is about 3 minutes (other sources say up to 10).
- **Helpline:** SMTA 0800-07682. TransKarachi (Red Line) UAN 111-544-278.

## Key caveats
- OSM and Wikipedia name two Green Line stations differently: "Baqai" vs "Annu Bhai Park" and "Model Park" vs "Enquiry Office".
- The Red Line station list comes from blogs (Zameen, rehbar) and the two lists disagree. No official list was found.
- No operational Breeze feeder or EV feeder routes were found. The EV feeder project is still at feasibility stage.
- Some Orange Line coordinates are approximate: a road junction node and a street bus stop node.
