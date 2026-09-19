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

None of these publish a data licence. If a rights holder objects, their data will be removed. [docs/OUTREACH.md](docs/OUTREACH.md) has the messages for asking each of them for permission.

This project is independent and is not endorsed by any transit authority. The data is provided as is, without warranty. Always confirm with the operator before travelling.
