# Karachi private minibus, bus and coach routes

Built 2026-09-19. The project owner decided to include both sources with attribution, even though they are unofficial and neither states a licence.

| Output | System id | Source | Routes | Stop entries | Unique stop names |
|---|---|---|---|---|---|
| `incoming/karachi-minibus-current.json` | `karachi-minibus` | RastaYaar `src/data/routes.ts` (repo last pushed 2026-09-07, branch `main`) | 52 | 1,266 | 553 |
| `incoming/karachi-minibus-2010.json` | `karachi-minibus-2010` | URC "Bus Routes Karachi", January 2010 | 304 | 4,900 | 1,721 |

Both systems use the RTA fare bands of 4 April 2026, copied exactly from `data/systems/karachi-private-buses.json`. All coordinates are null and are left for the geocoding pipeline. Both files were checked by loading them with Python `json.load`: route ids are unique and the fare_rules match the source file.

## Current routes (RastaYaar)

- There are 71 routes in RastaYaar. **52 were kept**: 28 minibus, 10 named fleet, 8 "other bus" (9-C, 4-L, 4-Q, 7-C, 11-C, 20, 51, 55) and 6 coach.
- **19 were skipped** because official data already covers them: 11 Peoples Bus Service routes (R-1…R-14), EV-1…EV-5, the Green and Orange BRT lines, and DD01.
- Every route has status `unverified`, variant `regular` and stops_confidence `medium`. Each route's notes also record its RastaYaar category.
- RastaYaar labels one route "51 (Thatta)". Its id is stored as `51` and the original label is kept in the notes.
- `Rind` has only two stops listed (Lee Market, Hub Chowki).
- Spelling fixes, 13 routes (each one is recorded in that route's notes):
  - Reejant/Rejant Plaza → Regent Plaza
  - Metrovils/Metrowel/Metrovill/Merroville → Metroville
  - Mensehra → Mansehra Colony
  - Fazal Mil → Fazal Mill
  - Reegal → Regal
  - Khudad Colony → Khudadad Colony
  - Jamia DarulUloom → Jamia Darul Uloom
  - Gold Mark Shipping Mall → Shopping Mall
- Other spelling variants were left as written (for example Maleer/Malir, Sadar/Saddar, Hydri/Haidri/Hyderi, Teen Hati/Teen Hatti, Shereen/Sherin/Shireen Jinnah Colony). The geocoder should treat these as aliases.

## 2010 routes (URC)

- The PDF has **344 entries**. `sources-official.md` says 326, but 344 is the correct count, and `sources-datasets.md` already gives 344.
- 40 entries overlap with RastaYaar and were dropped. **304 were kept**, and 67 of them are named coach services.
- Every route has status `historical`, stops_confidence `low` and the requested note. **Note:** `historical` is not one of the status values in SCHEMA.md. Add it to the schema, or map it to `unverified`/`suspended` at import.
- Ids were compared after normalising: upper case, spaces, hyphens and dots removed, and a trailing "Coach"/"Flying Coach"/"Luxury Coach" removed. Illyas was treated as the same name as Ilyas.
- The comparison used only the 52 kept RastaYaar routes. The URC 2010 minibus routes **R, R-1 and R-2 were kept**: they share a number with PBS Red Bus routes R-1/R-2 but are different services.
- Duplicate ids were given suffixes: `16-F-2`, `17-I-2`, `17-J-2`, `18-K-2`, `5-A-2`. The first entry of each pair keeps its plain id, and both entries say this in their notes.

### Overlaps: 40 URC entries left out because RastaYaar has the same number

"Shared" is a rough count of shared stop names, compared after normalising spelling.

| URC id | RastaYaar id | URC stops | RY stops | Shared | Comment |
|---|---|---|---|---|---|
| 11-C | 11-C | 18 | 22 | 14 | same route |
| 20 | 20 | 17 | 25 | 8 | |
| 4-L | 4-L | 13 | 15 | 10 | same route |
| 4-Q | 4-Q | 9 | 12 | 5 | 2010: Filter Plant - Keamari; now Gulzaar-e-Hijri - Bolton Market |
| 51 | 51 | 13 | 32 | 1 | **different route** (2010: Pir Sahib Goth - Moach Goth; now Thatta - Lee Market) |
| 55 | 55 | 8 | 17 | 2 | **mostly different** (2010: Malir City - Lee Market) |
| 7 Star Flying Coach | 7 Star | 18 | 20 | 10 | same termini |
| 7-C | 7-C | 18 | 23 | 8 | reversed |
| A-25 | A-25 | 18 | 23 | 11 | |
| A-3 | A-3 | 21 | 26 | 9 | 2010 was a loop |
| Al-Qadri Coach | AL-Qadri | 17 | 16 | 13 | same route |
| Bilal Coach | Bilal | 26 | 27 | 11 | |
| C-1 | C-1 | 26 | 27 | 7 | termini differ |
| D-1 | D-1 | 17 | 27 | 10 | |
| D-11 | D-11 | 24 | 34 | 14 | |
| D-7 | D-7 | 17 | 24 | 11 | |
| F-11 | F-11 | 23 | 38 | 10 | |
| G-11 | G-11 | 37 | 30 | 18 | same termini |
| G-17 | G-17 | 23 | 21 | 14 | |
| G-19 | G-19 | 21 | 26 | 9 | |
| G-7 | G-7 | 22 | 25 | 10 | |
| Gulistan Coach | Gulistan | 16 | 21 | 2 | **mostly different**; 2010 list ends in a cut-off "M.A" |
| H | H | 15 | 18 | 5 | same termini |
| Illyas Coach | Ilyas | 22 | 21 | 6 | |
| Khan Coach | Khan | 18 | 23 | 7 | termini differ |
| Marwat Coach | Marwat | 19 | 47 | 5 | **largely different** |
| Mashriq Coach | Mashriq | 16 | 22 | 6 | |
| Muslim Coach | Muslim | 18 | 21 | 9 | |
| N-4 | N-4 | 24 | 28 | 13 | |
| N-5 | N-5 | 22 | 24 | 14 | |
| New Afridi Coach | New Afridi | 24 | 30 | 9 | same termini |
| Super Hasan Zai Coach | Super Hasanzai | 18 | 21 | 7 | |
| Sheraz Coach | Sheraz | 23 | 29 | 10 | |
| SL | SL | 10 | 16 | 1 | **different route** |
| W-11 | W-11 | 13 | 29 | 6 | same corridor, termini renamed |
| W-18 | W-18 | 25 | 23 | 4 | **largely different** (2010: Surjani - Fish Harbour) |
| W-22 | W-22 | 35 | 31 | 10 | |
| W-25 | W-25 | 22 | 25 | 11 | |
| X-10 | X-10 | 19 | 19 | 10 | |
| X-23 | X-23 | 28 | 23 | 10 | same termini |

For 51, 55, SL, Gulistan, W-18 and Marwat, the 2010 alignment differs so much that it may be worth adding the old version back as a historical variant (for example `51-2010`). The rule was applied as given, so these are left out for now.

### Fixes made to URC stop text (20 routes, each recorded in that route's notes)

- **Words run together in the PDF's text layer were split:**
  - HassanSquare, NathaKhan Goth, JetLine, MalirCity, FaqirColony, BundChowrangi, BhenseColony, OldExhibition, M.A JinnahRoad/M.AJinnah Road, Agha KhanRoad, New KarachiSector
  - MuBarak → Mubarak
  - JinnahHospiutal → Jinnah Hospital
- **Names cut off in the PDF:**
  - Tariq Coach "Shahrah-e-Qu" → Shahrah-e-Quaideen
  - U-8 "Shahrah-e-Humayu" → Shahrah-e-Humayun
- **Cut-off last stops were dropped** because they are fragments, not stops. The true last terminal of these routes is unknown:
  - G-12 "Sa"
  - Ghulam Coach "Ma"
  - H-2 "F"
  - Rainbow Coach "K"
  - Waziristan Coach "Gr"
- **Commas in the wrong place:**
  - Rehman Coach "Dr, Ziaudin Ahmed Road" → one stop
  - W-A "Aza, Basti" → Azam Basti
  - X-4 "Coast guard, (HQ) Mansfield street" → "Coast guard (HQ)", "Mansfield street"
- **Spacing around brackets:** routes 21 and 57-B.

## Data problems still open

1. **Stops that are not single places.** Some URC stops cover several places:
   - "Landhi No.6 to No.1" (the Illyas entry, overlap)
   - "Gulshan-e-Hadeed Phase 1 and Phase 2"
   - "Korangi No. 1 and No. 5"
   - "Khokrapar No.1 and No. 4"
   - "Surjani Town Sector 5-A/2"

   RastaYaar has the same problem:
   - "Korangi 1–6"
   - "Korangi 2½,3,4,5,6"
   - "Orangi 5,12,13,14"
   - "Bahria Complex (1,2,3)"
   - "Nayi Abadi 8,9"
   - "Liaqatabad 4,10"

   These were kept as written. The geocoder should treat each as an area, or a person should split them by hand.
2. **Bare number stops in RastaYaar.** Some stops are only a number, for example F-11 "No.6 · 5½ · 5 · 3 · 1" (Korangi sectors), "No.4", "No.10" and "89" (Landhi 89). They make sense only in context, so the geocoder needs the route's area as a hint.
3. **Missing commas in URC.** Some stops were run together because the source has no comma between them, for example 1-F "Garden Bara Board". These were not split, to avoid guessing.
4. **Stops repeated within a route (URC).** Examples: B-3 (Empress Market and Fleet Club), P-8, D-22, W-16, W-31, Qayyum Coach (Korangi No. 4 listed twice in a row) and 2-D. These may be loops or copy errors.
5. **Heavy spelling variation.** There are 1,721 unique URC stop names, for example Chowrangi/Chorangi, Qabrustan/Qabristan, Mour/Mor, Jouhar/Jauhar/Johar, Mohajir/Muhajir. The geocoder needs an alias table.
6. **Stop order is one direction only.** Both sources give one direction. Some URC lists run the opposite way from RastaYaar (7-C, D-11, 20).
7. **Age of the URC list.** The list is 16 years old and was taken from a 2009 blog. It is unknown whether each route still runs.
8. **Schema gap.** The status value `historical` is not in the schema enum (see above).
