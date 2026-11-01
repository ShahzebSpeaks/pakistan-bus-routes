# Data outreach: who to ask, and ready-to-send messages

Some of the best transit data in Pakistan exists but cannot be copied without permission. This page lists each holder, what to ask for, and a message you can send. Replace the parts in `<angle brackets>`.

Only use a source in `data/` after you have written permission, and record that permission (date, who agreed, what licence) in the system's `sources`.

## Priority list

| # | Who | What they have | Why it matters | Contact |
|---|---|---|---|---|
| 1 | **safar.fyi** | Stops with coordinates for Islamabad, Rawalpindi and about 38 Punjab cities | Would give real positions for most Punjab e-bus stops that are missing today | `info@safar.fyi`, https://www.safar.fyi/contribute (founder Abdullah Qaisar) |
| 2 | **Sindh Mass Transit Authority (SMTA)** + Kentkart | Peoples Bus Service, Pink, EV and BRT stops and timetables behind the official app | Official Karachi stop positions and real timetables | `info@smta.gos.pk`, 021-99332206/07/09, D-43/1 Shahra-e-Ghalib, Block 2 Clifton, Karachi. Copy Kentkart via https://www.kentkart.com/ |
| 3 | **CDA Islamabad** | The timetable data behind its per-route PDFs (the fields look like GTFS) | Exact timetables for 21 feeder routes | Right of Access to Information request to CDA's Public Information Officer (template below) |
| 4 | **TransPeshawar (Zu)** | Route and stop lists with timetables | Their terms forbid copying without written consent | Public Information Officer: Muhammad Shuja Ud Din, Manager Legal, +92 91-2621393-94, 1st Floor KPUMA Building, Main BRT Depot, GT Road Chamkani, Peshawar |
| 5 | **Punjab Masstransit Authority (PMA)** | eTransit (etransit.punjab.gov.pk): every PMA/PTC line with ordered stops, positions and daily timetables | We already use its public data with credit. Written permission, or an open licence or GTFS feed, would make it safe to publish, and the timetables could be added | https://pma.punjab.gov.pk/contact-us, helpline 111-222-627 |
| 6 | **Urban Resource Centre (URC) Karachi** | "Bus Routes Karachi" (2010): 326 minibus and coach routes with stops | The only complete list of Karachi private routes. It is old, so each route needs checking | https://urckarachi.org (contact page) |
| 7 | **RastaYaar** (GitHub `itsdeewankumar-tech/rastayaar`) | 71 current Karachi routes including minibuses and coaches | Most recent minibus list found; the repository has no licence | Open an issue on the repository (template below) |
| 8 | **redbus.shop** (Surge Studios) | Karachi route chains | Useful cross-check for PBS stops | `surgestudioshq@gmail.com` |
| 9 | **Think Transportation** | Karachi PBS route alignment map (Google My Maps) | Used only privately to check our geocoding; permission would let us publish better lines | https://thinktransportation.net (contact page) |
| 10 | **Regional Transport Authority Karachi** | Register of private bus routes and permits | No public route list exists | Right of Access to Information request (Sindh Transparency and Right to Information Act 2016) |
| 11 | **Cheeltech (mnzil.app)** | 145+ Karachi routes, including 70 Chinchi/Qingqi routes that no other source we found has | We already use their public stop lists with credit. Permission and stop positions would make this data safe and accurate | Contact through mnzil.app |
| 12 | **Yango Pakistan** | The 60+ routes behind its Superapp Transport feature (Lahore, Karachi, Islamabad, Rawalpindi) | Recent, curated, and they publicly invited partnerships | Yango Pakistan press and partnerships contact |
| 13 | **Fahad741/SpeedoRoutes** (GitHub) | 34 Lahore Speedo routes with stops; we hold 23 | Would complete the Speedo network | Open an issue asking for the source and a licence |
| 14 | **mabdullahamjad/Rahnuma** (GitHub) | Rawalpindi R-1 to R-10 feeder routes, which we do not have | Adds a whole missing network | Ask for the original spreadsheet and who issued it |
| 15 | **CDA Islamabad (again, stronger case)** | Their GTFS feed. Google Maps shows live Islamabad transit with no stale-data banner, which means CDA almost certainly maintains a GTFS feed | Would give real timetables for 21 routes | Right of Access to Information request, citing the Google Maps integration announced in August 2025 |
| 16 | **Pakistan Railways** | Stop-level timetables for every train (the website's timetable page returns no rows) | Our train times come from a third-party site | Right of Access to Information request to the Ministry of Railways, or PR's IT directorate |
| 17 | **Bookme.pk / Sastaticket.pk** | Operator route lists, terminals and timetables for intercity buses | Would replace dated third-party fare and timing pages | Partnerships contact on each site |
| 18 | **RTA Rawalpindi and Islamabad Transport Authority** | Current wagon and Hiace route permits and fare tables | Our twin-city wagon routes come from 2007–2015 lists | Right of Access to Information request (Punjab Transparency and RTI Act 2013 / federal RTI Act 2017) |
| 19 | **Urban Resource Centre library, Karachi** | Paper-only: "List of private bus routes plying in Karachi" (Karachi Transport Ittehad / URC, catalogue TRAN-144) and the Karachi Bus Owners Association fare list for city routes, April 2011 (TRAN-242) | The closest thing to the current private route register that exists outside RTA Karachi | Visit or email URC (urckarachi.org) and ask to photograph or scan the two documents |

## Email: data sharing request (safar.fyi, SMTA, PMA, URC, redbus.shop, Think Transportation)

> **Subject:** Open data request: bus routes and stops for a free public app
>
> Assalam-o-Alaikum <name / team>,
>
> I run **Pakistan Bus Routes**, a free, open-source website that helps people find buses, BRT and metro routes in Pakistani cities: <link to the GitHub repository and website>.
>
> Commuters currently have no single place to see routes, stops and fares. We compile public information and credit every source.
>
> Your <website / app / report> has <what they have, e.g. "stop locations for Islamabad feeder routes">. Would you allow us to use this information in our open dataset? We would:
>
> - credit <organisation> on every page that uses the data and in our sources list
> - publish it under the Open Database License (ODbL), so it stays free for everyone
> - send you corrections that commuters report to us
>
> If a file export (CSV, GTFS or similar) is easier for you, that would be ideal.
>
> JazakAllah,
> <your name>
> <phone / email>

## Right to Information request (CDA, RTA Karachi, TransPeshawar)

Federal bodies (CDA) use the **Right of Access to Information Act 2017**. Sindh uses the **Sindh Transparency and Right to Information Act 2016**. Khyber Pakhtunkhwa uses the **KP Right to Information Act 2013**. Send it to the Public Information Officer by post or email and keep a copy.

> **Subject:** Request for information under the <Act name>
>
> To the Public Information Officer, <organisation>,
>
> Under section <section> of the <Act name>, I request copies of the following public records:
>
> 1. The list of all public bus routes currently operated or permitted by <organisation>, with route numbers and terminals.
> 2. For each route, the ordered list of stops and, if available, their locations.
> 3. The current timetable or frequency for each route, and the current fare notification.
> 4. If this information is held electronically (for example as GTFS, CSV or Excel), please provide it in that format.
>
> I am willing to pay the prescribed fee, if any. Please send the records to <postal address / email>.
>
> <your name>, <CNIC not required unless the form asks>, <date>

## GitHub issue: ask RastaYaar to add a licence

> **Title:** Could you add an open licence to the route data?
>
> Hi! Your list of Karachi routes in `src/data/routes.ts` is the most up-to-date one I have found, especially for minibuses and coaches.
>
> I maintain Pakistan Bus Routes (<link>), an open dataset and trip planner for Pakistani cities. Without a licence we are not allowed to reuse your route list. Would you consider adding an open licence such as CC-BY-4.0 or ODbL for the data (MIT for the code)? We would credit the project wherever the data appears.
>
> Thank you for building this!
