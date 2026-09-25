# Round 3: route inventories in donor, planning and academic documents

Researched 2026-09-25. Earlier passes are not repeated. The PDFs are in `research/cache/reports/`, which is not committed. Output: `research/incoming/reports-round3.json` (4 systems, 53 routes).

## Results

| City | System | Routes | Status | Stops | Source |
|---|---|---|---|---|---|
| Faisalabad | faisalabad-iptn-planned | 35 | planned | low (origin, named via-points, destination) | PMA "Integrated Public Transport Network Faisalabad", https://pma.punjab.gov.pk/system/files?file=Faisalabad+Integrated+Feeder+Routes_1.pdf (pp.1-2) |
| Multan | multan-private-buses-2012 | 3 | historical | low (via-points) | Integrated Master Plan for Multan 2008-2028, Vol-2, p.12-23 (PDF p.37), https://mda.punjab.gov.pk/system/files/MMP%20-%20Vol-2.pdf |
| Multan | multan-private-buses | 9 | unverified | endpoints | same page |
| Islamabad-Rawalpindi | rawalpindi-pma-feeder-planned | 6 | planned (never launched) | low | https://pma.punjab.gov.pk/rawalpindi-integrated-transportation-system-phase-1 (image /system/files/RawalpindiRoute_1.png) |

## Documents checked

**JICA**
- **KTIP Master Plan, chapter 3** (12086369_02, 2012). It gives counts only. Table 3-3-7 lists 88 bus, 145 minibus and 34 coach routes: 267 routes and 12,399 permits (source: CDGK RSOQ 2009). The survey itself recorded 132 routes. Only a few route numbers appear as examples (W-11, D-7, F-18). There is no route inventory.
- **KTIP chapter 4 and appendix 5.** No route data.
- **LUTMP Lahore volume II.** Only the June 2010 bus and wagon fare bands. No routes beyond the 10 already used.
- **Other cities.** No JICA urban transport study for Faisalabad, Multan, Hyderabad, Peshawar or Rawalpindi is online.

**ADB**
- **Peshawar BRT EIAs (2017).** They give route counts only: 7 minibus, 2 wagon, 13 Suzuki and 6 Qingqi routes. There is no route table.
- **Other Peshawar documents.** The linked documents, the completion report and the social monitoring reports contain no route list. The 2016 inception report, which holds the survey of existing routes, is not disclosed.
- **Karachi Red Line.** The linked documents, resettlement plans and EIA contain no table of existing routes.

**World Bank / Karachi Mobility Project**
- **Yellow Line ESIA 2026.** Its services are already in `karachi-yellow-line-services.json`.
- **World Bank documents API.** No route lists for Peshawar, Quetta, Hyderabad, Faisalabad or Multan.

**Government planning**
- **PMA Faisalabad route table.** Extracted: 35 routes.
- **PMA Rawalpindi Phase I.** Extracted: 6 routes.
- **Multan Master Plan (MDA/NESPAK, 2012), Vol-2 §12.3.4.** Extracted: 3 urban and 9 district routes. The plan cites an unpublished 2005 UET study (8 bus routes, 12 wagon routes) and an RTA franchise scheme (6 routes).
- **FDA Faisalabad Master Plan 2021-41, Transportation Report (2023).** A map shows 14 old route numbers, B-1 to W-23. Only B-10, B-11 and W-20 were running in 2023. These were not added because the map gives no termini and no stops.
- **Urban Unit.** The PCIIP profiles give road names only. The Punjab PT Accessibility Index 2024 has no route lists.
- **TPU Punjab.** The Sialkot, Bahawalpur, Gujrat, Gujranwala and Sheikhupura studies are online as abstracts only.
- **KP Transport and RTA.** There is no Peshawar intracity route list, and the route-permit portal returns 404.
- **TransPeshawar RFP (2026).** Mentions 13 possible new routes but names none.
- **Quetta intra-city bus study (2021).** Not published.

**Academic**
- **HEC Pakistan Research Repository.** Returned HTTP 504 all day.
- **Sukkur and Hyderabad papers.** Neither names any routes.

## Gaps
1. **Peshawar:** the pre-BRT route register. Needs an RTI request to RTA Peshawar.
2. **Karachi:** the 267-route register (CDGK RSOQ 2009). Needs an RTI request to RTA Karachi.
3. **Quetta:** the intra-city bus study and the QDA master plan transport plan.
4. **Punjab secondary cities:** the TPU reports and the e-bus feasibility studies.
5. **Faisalabad:** the FUTS register of old B- and W- routes.
6. **HEC theses:** retry when the repository is back up.
