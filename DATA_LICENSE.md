# Data license

The **Pakistan Bus Routes** database, meaning everything in `data/` and the files published under `downloads/` (GTFS, GeoJSON, CSV), is made available under the
**Open Database License (ODbL) v1.0**: https://opendatacommons.org/licenses/odbl/1-0/

Individual contents of the database are licensed under the
**Database Contents License (DbCL) v1.0**: https://opendatacommons.org/licenses/dbcl/1-0/

## Why ODbL

Stop coordinates are matched against OpenStreetMap, and route lines are routed over OpenStreetMap roads with OSRM. That makes this a derivative database of OpenStreetMap, which is licensed under ODbL.

## Attribution

When you use this data, credit:

> Pakistan Bus Routes contributors, © OpenStreetMap contributors

and link to this repository and https://www.openstreetmap.org/copyright.

If you publish a modified version of the database, you must share it under the ODbL too.

## Sources of facts

Route numbers, stop names, fares and timings are factual information compiled from public sources: government transit authorities, Wikipedia, news organisations and route-guide websites. Each system file lists its sources, and [docs/SOURCES.md](docs/SOURCES.md) lists them all. Maps, PDFs, images and text from those sources are **not** redistributed here.

## Third-party route guides

Some routes and stop positions come from unofficial compilations. They are credited on every route that uses them and listed in docs/SOURCES.md:

- **safar.fyi**: stop positions for Islamabad, Rawalpindi, Lahore, Multan and 35 Punjab cities (coord_source `ext:safar.fyi:...`).
- **RastaYaar** (github.com/itsdeewankumar-tech/rastayaar): current Karachi minibus and coach stop lists (system `karachi-minibus`).
- **Urban Resource Centre, Karachi**: the January 2010 list of minibus and coach routes (system `karachi-minibus-2010`, shown as old routes only).
- **Punjab Transport Company**: Lahore wagon fare tables (system `lahore-ptc-lov`).
- **mnzil.app (Cheeltech)**: Karachi Chinchi/Qingqi routes (system `karachi-chinchi`) and minibus routes. Some come from the scraped copy in github.com/naumanaarif/musafir, and the rest come from the stop lists on mnzil.app's route pages.
- **pakinformation.com**: station order and times for Pakistan Railways trains (system `pakistan-railways`). Station positions for the trains come from Wikidata (CC0) and OpenStreetMap.
- **Intercity bus operators and booking sites**: route lists, terminals and fares from the operators' own websites (Daewoo, Faisal Movers, Skyways, Niazi, Road Master, Q Connect, NATCO, Silk Line), from bookme.pk and sastaticket.pk, and from pkbuses.com and buses.pk (systems `intercity-*`). Fares from third-party sites are marked as unverified in each route's notes.
- **Rawalpindi/Islamabad wagon routes**: a 2007 rawalpindi-city blog, wagon tables uploaded to Scribd (including a copy of the 2009 ITA route list), and adventureplanners.net (system `islamabad-rawalpindi-private-wagons`). Most of this data is 10 to 20 years old.
- **SpeedoRoutes** (github.com/Fahad741/SpeedoRoutes): eleven extra Lahore Speedo routes, low confidence because their numbering differs from PMA's.
- **Rahnuma** (github.com/mabdullahamjad/Rahnuma): alternative R-series names for four Rawalpindi electric bus routes.

- **Other private routes**: Faisalabad routes come from a 2003 WEDC (Loughborough University) case report and from Wikiroutes, a crowdsourced site. Hyderabad, Gujranwala and Bahawalpur routes come from university papers (MUET) and Urban Unit city profiles. Routes marked "(Mnzil)" in Karachi are Mnzil's version of a route that our other sources describe differently. The station positions on those routes also come from Mnzil.

None of these publish a data licence. If a rights holder objects, their data will be removed.

These two sources do have open licences and are credited as they require:

- **Karachi bus network dataset**, Habib University, DOI 10.5281/zenodo.13951512, **CC-BY-4.0**: stop positions and 17 Karachi routes. Its authors placed the points on a web map by hand.
- **Karachi Smart Transit System**, FAST semester project, **MIT licence**: stop positions for Pink Bus and EV routes. [docs/OUTREACH.md](docs/OUTREACH.md) has the messages for asking each of them for permission.

This project is independent and is not endorsed by any transit authority. The data is provided as is, without warranty. Always confirm with the operator before travelling.
