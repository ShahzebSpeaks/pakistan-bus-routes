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

- **Punjab Masstransit Authority eTransit** (etransit.punjab.gov.pk): official stop lists and positions for the new Multan, Okara, Sargodha and Sahiwal e-bus routes, and updates to Bahawalpur and Rawalpindi routes (coord_source `ext:etransit.punjab.gov.pk:...`), plus 11 more routes in Rawalpindi, Lahore, Gujranwala, Khanewal, Chiniot, Okara, Attock, Bhakkar and Lodhran. The site itself states no reuse terms; the project owner obtained PMA's permission to reuse this data (2026).
- **Mnzil station positions** for Karachi stops where we had only an estimate (coord_source `ext:mnzil:...`), and the "Lets go pk" YouTube channel for route Z-22 and for evidence that routes still run.
- **Urban Unit city profiles** (about 2010): Qingqi and wagon corridors in Sargodha, Sahiwal, Gujrat and Jhang.

- **Pakistan Railways train schedule** (pakrailways.gov.pk/train): official station order and times for 70 trains. This is a government work; only facts (times and station order) are used.
- **Intercity bus departure times**: NATCO's own booking search, and pkbuses.com, a third-party listing that is often incomplete. Routes from pkbuses.com name only towns, not terminals, and are marked unverified.

- **Old official Karachi lists** (read from web.archive.org copies): the City District Government Karachi "Bus Routes" page of 2007, with 86 routes (system `karachi-cdgk-2007`, old routes only), and the Karachi Green Bus fare charts of 2005 (`karachi-green-bus-2005`).
- **Khyber Pakhtunkhwa Transport Department**: the RTA Peshawar fare table of 1 April 2024, giving 52 routes with their ends and fares, and the 2011 CNG route notification (`peshawar-cng-routes-2011`, old routes only).
- **Newspaper reports of RTA decisions**: Dawn's 2002-03 reports of District RTA Karachi decisions (system `karachi-drta-notices-2002`, old routes only), the RTA Hazara 2026 Suzuki fare notice as reported by APP (Abbottabad), and RTA Rawalpindi decisions reported by Dawn.
- **Karachi Red Bus, EV and Pink bus timings** come from news reports and guides (BOL, Dawn, redbus.shop and others). SMTA publishes no timetable.
- **Hours and frequencies** for Punjab and Islamabad metro, feeder and e-bus routes come from the PMA eTransit timetable for 23 October 2026.
- **Capital Development Authority (CDA), Islamabad**: electric feeder routes, stops and timetables from CDA's published route timetables. CDA's website terms prohibit reproduction without authorisation; the project owner obtained CDA's permission to reuse this data (2026).

None of these publish a data licence.

Wikiroutes is not used. Its terms forbid extracting or republishing its data. If a rights holder objects, their data will be removed.

These two sources do have open licences and are credited as they require:

- **Karachi bus network dataset**, Habib University, DOI 10.5281/zenodo.13951512, **CC-BY-4.0**: stop positions and 17 Karachi routes. Its authors placed the points on a web map by hand.
- **Karachi Smart Transit System**, FAST semester project, **MIT licence**: stop positions for Pink Bus and EV routes. [docs/OUTREACH.md](docs/OUTREACH.md) has the messages for asking each of them for permission.

This project is independent and is not endorsed by any transit authority. The data is provided as is, without warranty. Always confirm with the operator before travelling.
