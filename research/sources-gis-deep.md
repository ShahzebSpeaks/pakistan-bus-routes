# Deep sweep: government GIS portals, urban units and international development projects

Researched 2026-09-21. This is a second pass that deliberately avoids repeating
`research/sources-official.md` and `research/sources-apis.md`. Every URL below was fetched
and opened; every PDF claim was verified by extracting the text with PyMuPDF and reading the
actual table. Where a source was already logged in an earlier file, it is listed here only if
this sweep found something new inside it.

Headline: **there is no public Pakistani GIS service carrying transit geometry.** Not one.
The usable material is all inside engineering and safeguard PDFs written for the
international lenders. Two of those yielded new, verified route data.

## Ranked table

| # | Source | URL | What it holds | Format | Licence / terms | Usable |
|---|---|---|---|---|---|---|
| 1 | **ADB / SMTA Karachi Red Line BRT – Environmental Impact Assessment** (EPCM detailed engineering design, doc 382188 I 05 I D, Mott MacDonald, 29 Nov 2018) | https://www.adb.org/sites/default/files/linked-documents/47279-002-eiaab-01.pdf | **Table 3-3 "Red Line BRT Bus Station Inventory": all 24 stations, numbered 1–24 in corridor order** (Mazar-e-Quaid → Liaquat Avenue Model Colony). Plus the full alignment description (E-3.2), two depot locations (Mausamiat / Gulistan-e-Jauhar Block 6 and Malir Halt), station dimensions, and the direct-service / off-corridor operating concept. 615 pages, 59 MB | PDF, clean text layer | ADB public disclosure (linked document to RRP PAK 47279). Facts reusable with attribution; figures and maps are Mott MacDonald artwork | **Yes — extracted** |
| 2 | **JICA, Lahore Urban Transport Master Plan (LUTMP), Final Report Vol. II of II** | https://openjicareport.jica.go.jp/pdf/12068219_01.pdf (parts 01–03) | **Table 1.2.11 "Bus Occupancy Survey Routes Ten": 10 notified Lahore bus routes (2010) with route number, operating company, origin and destination.** Also Table 1.2.13: the road inventory counted **373 bus stops** over 2,233 km — but the stop inventory itself is not printed | PDF, clean text layer | JICA open report library, public | **Yes — extracted** (historical) |
| 3 | **Karachi Mobility Project official site (SMTA/World Bank), `kmp.gos.pk`** — not previously logged | https://kmp.gos.pk/downloads/ | 2026 ESIA Vol I & II for the Yellow Line (supersedes the 2024 URC copy already in the repo) + 3 Compensation & Livelihood Rehabilitation Plans (2024–2026). Vol I confirms **24 stops**, gives the corridor split into **7 named segments with lengths** (Dawood Chowrangi–Future Colony 1.15 km; 8000 Road 10.65 km; Malir River bridge 1.1 km; …), and lists 5 network integration points (Numaish hub, Red Line at Kashmir Rd, Brown MRT at Singer Chowrangi, KCR at Kala Pull and Landhi Railway Station) | PDF | Sindh government / World Bank disclosure. No reuse statement | **Partly** — segment lengths and interchange facts are new; no ordered station table |
| 4 | ADB Peshawar Sustainable BRT — Resettlement Plans Reach 1/2/3 | https://www.adb.org/sites/default/files/project-documents/48289/48289-002-rp-en_1.pdf (and `_2`) | Table 2: the 6 civil packages with landmark **from/to and chainages** (Reach 1 Chamkani Mor→Firdous Cinema, Reach 2 Firdous→Aman Chowk, Reach 3 Aman Chowk→Hayatabad, plus 2 depots and the staging facility). Confirms 8 feeder routes and 8 corridor stations per reach | PDF | ADB public disclosure | **Marginal** — corridor segmentation only; the RP itself says station locations "are not known yet". The Zu 2022 data book already in the repo is better |
| 5 | JICA, LUTMP Final Report Vol. I of II (7 parts) | https://openjicareport.jica.go.jp/pdf/12068110_01.pdf … `_07.pdf` | Master plan narrative: 4 proposed RMTS lines (Green, Orange, Blue, Purple — Purple downgraded to BRT), bus terminal inventory (Badami Bagh, Daewoo, Niazi, Railway Station, 11 private 'D-class' stands), Table 6.3.1 proposed projects | PDF | JICA public | **Background only** — no route inventory |
| 6 | JICA, Karachi Transportation Improvement Project, Vol.1 Master Plan (12086369) and Vol.2 Feasibility Study (12086393) | https://openjicareport.jica.go.jp/pdf/12086369_01.pdf , `12086393_04.pdf` | Survey methodology, 70 turning-movement and 25 mid-block count sites, KSDP 2020 review. Consistent with the already-logged `12086377` finding | PDF | JICA public | **No** — still no per-route inventory |
| 7 | World Bank documents API (v3) | `https://search.worldbank.org/api/v3/wds?format=json&qterm=…` | Works well and is the right way to search WB. Best hit: Karachi Mobility Project Additional Financing, 2026-01-30 (`.../099060526160556453/pdf/BOSIB-…pdf`). Nothing with a route or stop table | JSON API → PDF | WB open-access (CC BY 4.0 for most reports) | **Search tool: yes. Transit data: no** |
| 8 | TEPA Punjab, LUTMP Executive Summary | https://tepa.punjab.gov.pk/system/files/LUMTP%20Executive%20Summary.pdf | 15-page summary, no route or station tables | PDF | Govt of Punjab, no terms | **No** |
| 9 | Punjab Urban Unit — ICT & GIS Development | https://urbanunit.gov.pk/projects/Index/5 | Lists dashboards only: `spacetech.urbanunit.gov.pk`, an environment dashboard, an air-quality system, an LRC. The transport-adjacent product is a C&W **road asset** management system (pavement/bridge), not transit. No dataset downloads, no service endpoints | HTML | © Urban Unit, no open licence | **No** |
| 10 | PMDFC — GIS Municipal Services Maps, 16 PCP cities | https://pmdfc.punjab.gov.pk/gis-map-16_cities-pcp | Links to 16 city viewers (`mc<city>.lgpunjab.org.pk/map/`). Thematic layers are base map, roads and chowks, solid waste, sewerage, street lights, parks, water supply — **no transit layer even in the advertised list** | Web GIS | n/a | **No — and dead**: every `*.lgpunjab.org.pk` host fails DNS resolution (NXDOMAIN) as of 2026-09-21 |
| 11 | ArcGIS Online public search API | `https://www.arcgis.com/sharing/rest/search?q=…&f=json` | Ran 8 queries (pakistan bus route, karachi transport, lahore transit, peshawar BRT, islamabad metro bus, punjab transport GIS, quetta bus, pakistan transit stops). Total transit-relevant hits: **zero**. Everything returned is student StoryMaps | JSON API | n/a | **No** |
| 12 | ArcGIS Hub open-data API | `https://hub.arcgis.com/api/v3/datasets?q=…` | Relevance ranking is broken for these queries (returns 180k+ "matches" that are FAO climate stations, flood-risk coursework, geology). No Pakistani transit dataset exists | JSON API | n/a | **No** |
| 13 | Greater Karachi Regional Plan 2047 | (feature service `services9.arcgis.com/z1SJCwV0uraLyDNJ/.../survey123_552d0e1fa28b438cb88a793fac8089ba`) | The only ArcGIS item naming the plan. It is a Survey123 **form** on a Gulf consultant's org account; `query` returns `"This operation is not supported"`. The plan itself is not due until late 2026 | ArcGIS FeatureServer | n/a | **No** |
| 14 | Pakistani government ArcGIS / GeoServer hosts | probed directly | `gis.urbanunit.gov.pk`, `gis.punjab.gov.pk`, `services.urbanunit.gov.pk`, `gis.pbs.gov.pk`, `gis.kmc.gos.pk`, `gis.cda.gov.pk`, `geoserver.urbanunit.gov.pk` → **no DNS / no TLS**. `pmdfc.punjab.gov.pk/arcgis/rest/services` and `pbs.gov.pk/arcgis/rest/services` → 404 HTML. `kpgis.kp.gov.pk` → 200 but it is a React SPA catch-all; its only backend is `https://mgn1.kp.gov.pk/api`, which 404s on every path tried | — | — | **Dead end (confirms and extends the earlier finding)** |

## Notes

**Why the GIS angle fails.** Every provincial "GIS portal" in Pakistan is a dashboard product
(air quality, revenue boundaries, municipal services, road assets) rather than a data
catalogue. None exposes `/arcgis/rest/services` or `/geoserver`. The one thing close to an
open spatial catalogue, the PMDFC 16-city viewer set, has gone offline entirely — the domain
`lgpunjab.org.pk` no longer resolves, so even the roads layer is unrecoverable without an
archive copy. ArcGIS Online and ArcGIS Hub contain no Pakistani transit layer at all; this is
now verified by direct API queries rather than by web search, so it can be treated as settled.

**Where the data actually lives.** Route and station facts exist only inside safeguard and
engineering documents commissioned by ADB, the World Bank, AIIB, AFD and JICA. The pattern is
consistent: the **EIA / ESIA** is the volume that carries the station inventory, because the
consultant has to enumerate receptors. The PAM, RRP and project-information documents never
do — which is why the earlier pass, which checked the Red Line **PAM**, concluded there was
nothing there. There was; it was in the EIA.

**A caution on the Red Line table.** The same paragraph that introduces Table 3-3 states that
station names and locations *beyond Safoora Intersection* were not finalised, and that station
types were unknown. The design dates from November 2018 and the corridor has been re-scoped
since (ADB now quotes 26.6 km; AIIB quotes 24.2 km main corridor plus a 2.4 km common
corridor). Stations 21–24 should be treated as provisional.

**On the World Bank API.** `https://search.worldbank.org/api/v3/wds` with
`format=json&qterm=…&srt=docdt&order=desc` is the correct way to sweep WB. Note the response
nests `docna` as a dict-of-dicts, which will break a naive parser. ADB has no equivalent open
API and its project pages are JS-rendered and return 403 to WebFetch, so ADB documents have to
be reached by their direct `sites/default/files/...` PDF URLs.

**Download gotchas, for whoever runs this next.** `kmp.gos.pk` breaks Windows curl with
`schannel: failed to receive handshake`; Python `urllib` with a relaxed SSL context works.
`openjicareport.jica.go.jp` is slow enough (roughly 4 MB in 60–90 s) that parallel curl with a
short timeout silently produces zero-byte files.

## Extraction plan for the best three

**1. Karachi Red Line — done, needs geocoding.**
Saved to `research/incoming/karachi-red-brt-adb/karachi-red-brt-stations.json` (SCHEMA-shaped,
24 stations in corridor order, `stops_confidence: medium`, `status: under_construction`, all
coordinates `null` because the source publishes none). Next step: geocode the 24 names against
OSM via Overpass along the M.A. Jinnah Road → University Road → Malir Cantt Link Road
corridor, filling `coord_source` with the OSM element id per SCHEMA.md. Cross-check the
station names against the Yellow Line EIA's integration list, since Numaish and the Kashmir
Road interchange should appear in both. Confirm the post-2018 station set from any 2024–26
TransKarachi or SMTA notification before promoting `stops_confidence` above medium.

**2. Lahore JICA 2010 notified routes — done, historical only.**
Saved to `research/incoming/lahore-jica-2010/lahore-jica-notified-routes-2010.json`: 10 routes
with number, operator (New Khan, Daewoo, Premier, METRO) and both termini. These carry a third
Lahore numbering scheme, distinct from both the PMA IPTN feeder numbers and today's Speedo
RT-xx codes, which is itself worth recording so the three schemes are not conflated. All ten
are `status: unverified`. Do not attempt to reconstruct stops: the survey rode the routes and
counted boardings per stop, but the per-stop data was never printed.

**3. KMP Yellow Line 2026 ESIA — worth one focused pass.**
Re-read `kmp-esia-vol1-2026.pdf` around the Chapter 2 alignment section (report pages 2-14 to
2-20) and pull the seven segment names and lengths into the `notes` of the existing
`research/incoming/karachi-yellow-brt.json`, and add the five integration points. Then diff the
2026 ESIA station count against the 2024 EIA already in the repo — both say 24, which is a
useful confirmation. Do not re-transcribe the station names from the 2024 document; they are
already captured.

## Asked and answered: what is confirmed not to exist

- Any Pakistani ArcGIS FeatureServer, MapServer, WMS or WFS carrying bus routes or stops.
- Any GIS data annex, shapefile or geodatabase attached to a JICA, ADB, World Bank or AIIB
  Pakistan transport report. All spatial content in these reports is raster figures.
- A Karachi Master Plan 2047 / Greater Karachi Regional Plan 2047 transport annex — the plan
  was launched in Feb 2025 on a two-year consultative process and is not due until late 2026.
- A Quetta or Balochistan transport department route publication. The Green Bus Service route
  details (4 routes, 18.7 km first route with 18 stops from Balochistan University via QDA
  Office, Helper Eye Hospital, Imdad Chowk, Hockey Chowk; ~40 stops on the Kuchlak route;
  ~50 stops Metropolitan–Sariab Road) exist **only in news reporting**, never in a government
  document. That remains a fieldwork or RTI target.
- Any transit layer in the PMDFC / Punjab Cities Program municipal GIS — and those viewers are
  now offline regardless.
