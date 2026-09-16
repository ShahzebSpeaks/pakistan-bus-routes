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
| 5 | **Punjab Masstransit Authority (PMA)** | Metrobus and feeder stop lists for Lahore, Rawalpindi-Islamabad and Multan | Official stop order and names | https://pma.punjab.gov.pk/contact-us, helpline 111-222-627 |
| 6 | **Urban Resource Centre (URC) Karachi** | "Bus Routes Karachi" (2010): 326 minibus and coach routes with stops | The only complete list of Karachi private routes. It is old, so each route needs checking | https://urckarachi.org (contact page) |
| 7 | **RastaYaar** (GitHub `itsdeewankumar-tech/rastayaar`) | 71 current Karachi routes including minibuses and coaches | Most recent minibus list found; the repository has no licence | Open an issue on the repository (template below) |
| 8 | **redbus.shop** (Surge Studios) | Karachi route chains | Useful cross-check for PBS stops | `surgestudioshq@gmail.com` |
| 9 | **Think Transportation** | Karachi PBS route alignment map (Google My Maps) | Used only privately to check our geocoding; permission would let us publish better lines | https://thinktransportation.net (contact page) |
| 10 | **Regional Transport Authority Karachi** | Register of private bus routes and permits | No public route list exists | Right of Access to Information request (Sindh Transparency and Right to Information Act 2016) |

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
