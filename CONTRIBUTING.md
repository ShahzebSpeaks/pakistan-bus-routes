# Contributing

Thank you for helping make public transport in Pakistan easier to use. Most useful contributions are **data corrections from people who actually ride these routes**.

## 1. Report a problem (no coding)

Use the **Report a mistake** button on any route or stop page in the app, or open an issue:

- **Route correction:** wrong stop order, missing or extra stop, route changed or suspended.
- **Stop location:** stop is in the wrong place on the map.
- **New route:** a government bus route that is missing.
- **Fare or timing change.**

Please include a **source**: a link to an official notice or news report, a photo of a route board, or "I ride this route daily" with the date.

## 2. Edit the data directly

Every transit system is one JSON file in [`data/systems/`](data/systems). You can edit it in the GitHub web editor and open a pull request.

### Fix a stop list

Stops are listed **in order in one direction**, from the first terminal to the last. The app assumes buses run the same stops in reverse.

```json
{ "name": "Malir Halt", "name_ur": "ملیر ہالٹ", "lat": null, "lon": null, "coord_source": null, "is_station": false }
```

Leave `lat`/`lon` as `null` if you don't know the location. The geocoder will try to find it.

### Fix a stop location

1. Find the exact point on [openstreetmap.org](https://www.openstreetmap.org). Right-click, choose **Show address**, and copy the coordinates.
2. Set `lat`, `lon` and set `coord_source` to `"manual"`, or to `"osm:node/<id>"` if you used an OpenStreetMap element.
3. Coordinates whose `coord_source` does not start with `auto:` are never overwritten by scripts.

Even better: add or fix the bus stop in OpenStreetMap itself, so every map benefits.

### Add a route or change status

Copy an existing route object. Required fields are `id`, `name`, `status` and `stops`. Add at least one entry in `sources`. Status values are `operational`, `under_construction`, `planned`, `suspended` and `unverified`.

See [docs/DATA_FORMAT.md](docs/DATA_FORMAT.md) for every field.

### Add a new city

Add the city to [`data/cities.json`](data/cities.json) with its centre and bounding box `[south, west, north, east]`, then create `data/systems/<city>-<system>.json`.

## 3. Rebuild and check locally

```bash
npm install
npm run data:validate         # must pass
npm run data:geocode -- <system-id>   # optional, needs internet
npm run data:shapes -- <system-id>    # optional, needs internet
npm run data:build
npm run dev
```

Commit the changed `data/systems/*.json` and `data/shapes/**` files. `public/data` and `public/downloads` are generated in CI.

## 4. Code contributions

- The app is React, TypeScript and Leaflet built with Vite. The trip planner is in `src/lib/planner.ts` and has tests in `tests/`.
- Run `npm test` and `npm run typecheck` before opening a pull request.
- Keep the UI bilingual. Add every new string to both languages in `src/lib/i18n.ts`.

## Data rules

- **Do not copy** maps, PDFs, images or long text from other websites. Facts such as stop names, route numbers and fares are fine. Cite where they came from.
- **Do not import** data from Google Maps or other sources whose terms forbid it. OpenStreetMap, official government publications and your own observations are fine.
- By contributing data you agree to publish it under the [ODbL](DATA_LICENSE.md). By contributing code you agree to publish it under the [MIT License](LICENSE).

Please be kind and patient with each other. See the [Code of Conduct](CODE_OF_CONDUCT.md).
