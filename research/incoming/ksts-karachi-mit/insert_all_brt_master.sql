-- insert_all_brt_master.sql
-- Master script to insert all 6 BRT lines into ksts_db
-- Order: Green → Orange → Red → Yellow → Blue → Brown
-- Run this in MySQL Workbench with ksts_db selected.

USE ksts_db;

-- Truncate route/stop related tables only (preserves users, bookings, payments, etc.)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE routes_stops;
TRUNCATE TABLE stops;
TRUNCATE TABLE routes;
TRUNCATE TABLE services;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1) GREEN LINE BRT
-- =============================================================================

INSERT INTO services (service_name) VALUES
('Green Line BRT')
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name);

INSERT INTO routes (service_id, route_name) VALUES
(1, 'Green Line Corridor')
ON DUPLICATE KEY UPDATE route_name = VALUES(route_name);

INSERT INTO stops (stop_name, latitude, longitude) VALUES
('Numaish Chowrangi', 24.87240426312202, 67.03530333664018),
('Patel Para (Guru Mandir) Station', 24.8811317, 67.0384163),
('Lasbela Chowk Station', 24.8860049, 67.0345593),
('Sanitary Market (Gulbahar) Station', 24.8950959, 67.0307358),
('Nazimabad No.1 Station', 24.8999637, 67.0304847),
('Enquiry Office Station', 24.9066014, 67.0310170),
('Annu Bhai Park Station', 24.9171505, 67.0313289),
('Board Office', 24.9268943, 67.0298399),
('Hyderi Station', 24.9381443, 67.0428257),
('Five Star Chowrangi Station', 24.9460741, 67.0503766),
('Jummah Bazaar (Bayani Center) Station', 24.9505593, 67.0544800),
('Erum Shopping Mall (Shadman No.2) Station', 24.9587886, 67.0615444),
('Nagan Chowrangi', 24.9659013, 67.0670411),
('U.P. More Station', 24.9737143, 67.0668378),
('Road 4200 (Saleem Centre) Station', 24.9782804, 67.0669920),
('Power House Chowrangi Station', 24.9842907, 67.0661188),
('Road 2400 (Aisha Complex) Station', 24.9927508, 67.0653392),
('2 Minute Chowrangi Station', 25.0006681, 67.0649429),
('Surjani Chowrangi (4K) Station', 25.0051709, 67.0648499),
('Karimi Chowrangi Station', 25.0113722, 67.0645019),
('KDA Flats Station', 25.0176914, 67.0641370),
('Abdullah Chowk Station', 25.0274073, 67.0642646)
ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude);

INSERT INTO routes_stops (route_id, stop_id, stop_order) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(1, 4, 4),
(1, 5, 5),
(1, 6, 6),
(1, 7, 7),
(1, 8, 8),
(1, 9, 9),
(1, 10, 10),
(1, 11, 11),
(1, 12, 12),
(1, 13, 13),
(1, 14, 14),
(1, 15, 15),
(1, 16, 16),
(1, 17, 17),
(1, 18, 18),
(1, 19, 19),
(1, 20, 20),
(1, 21, 21),
(1, 22, 22)
ON DUPLICATE KEY UPDATE stop_order = VALUES(stop_order);

-- =============================================================================
-- 2) ORANGE LINE BRT
-- =============================================================================

INSERT INTO services (service_name) VALUES
('Orange Line BRT')
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name);

INSERT INTO routes (service_id, route_name) VALUES
(2, 'Orange Line Corridor')
ON DUPLICATE KEY UPDATE route_name = VALUES(route_name);

INSERT INTO stops (stop_name, latitude, longitude) VALUES
('Orangi 5 No.', 24.9421791, 66.9984457),
('Pone Panch Chowrangi', 24.9388544, 67.0048105),
('Abdullah College', 24.9292090, 67.0253194)
ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude);

INSERT INTO routes_stops (route_id, stop_id, stop_order) VALUES
(2, 23, 1),
(2, 24, 2),
(2, 25, 3),
(2, 8, 4)
ON DUPLICATE KEY UPDATE stop_order = VALUES(stop_order);

-- =============================================================================
-- 3) RED LINE BRT
-- =============================================================================

INSERT INTO services (service_name) VALUES
('Red Line BRT')
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name);

INSERT INTO routes (service_id, route_name) VALUES
(3, 'Red Line Corridor')
ON DUPLICATE KEY UPDATE route_name = VALUES(route_name);

INSERT INTO stops (stop_name, latitude, longitude) VALUES
('Khudadad Colony', 24.872591906324153, 67.04574534198314),
('Islamia College', 24.878901925255455, 67.0464204694135),
('Usmania Park', 24.88373792567521, 67.05350953320101),
('Jail Chowrangi', 24.885780222032384, 67.05730204929694),
('Faizan-e-Madina', 24.893789783357384, 67.06400373172573),
('Civic Center', 24.901152602669395, 67.07302080324726),
('Expo Centre', 24.90288367002563, 67.07567426176806),
('Bait-ul-Mukarram', 24.90724729911918, 67.0821156294626),
('Urdu University', 24.911896307929332, 67.08883359601032),
('NIPA', 24.917581440310872, 67.09700022450569),
('Safari Park', 24.92505083754034, 67.10597568600606),
('NED University', 24.929764671382994, 67.11554709383492),
('Karachi University', 24.9340174681357, 67.12930410916971),
('Sheikh Zayed Islamic Center', 24.934354183237364, 67.13057088340703),
('Mosamiyat', 24.9366308938889, 67.14142710220455),
('Jauhar Complex', 24.937877403295552, 67.14839398143384),
('Safoora Chowrangi', 24.939418567854688, 67.15618076871317),
('Race Course', 24.938536231841834, 67.1615078809408),
('Check Post 6', 24.934545475808225, 67.17713018444539),
('Acacia Golf Club', 24.919083966816252, 67.18664214148241),
('Tank Chowk', 24.912566334753254, 67.1858099546142),
('Model Colony', 24.90347282541858, 67.18196503888005),
('Malir Halt', 24.884567796344673, 67.17534284081654)
ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude);

INSERT INTO routes_stops (route_id, stop_id, stop_order) VALUES
(3, 1, 1),
(3, 26, 2),
(3, 27, 3),
(3, 28, 4),
(3, 29, 5),
(3, 30, 6),
(3, 31, 7),
(3, 32, 8),
(3, 33, 9),
(3, 34, 10),
(3, 35, 11),
(3, 36, 12),
(3, 37, 13),
(3, 38, 14),
(3, 39, 15),
(3, 40, 16),
(3, 41, 17),
(3, 42, 18),
(3, 43, 19),
(3, 44, 20),
(3, 45, 21),
(3, 46, 22),
(3, 47, 23),
(3, 48, 24)
ON DUPLICATE KEY UPDATE stop_order = VALUES(stop_order);

-- =============================================================================
-- 4) YELLOW LINE BRT
-- =============================================================================

INSERT INTO services (service_name) VALUES
('Yellow Line BRT')
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name);

INSERT INTO routes (service_id, route_name) VALUES
(4, 'Yellow Line Corridor')
ON DUPLICATE KEY UPDATE route_name = VALUES(route_name);

INSERT INTO stops (stop_name, latitude, longitude) VALUES
('Khalid Bin Waleed Road', 24.867504898232795, 67.05222073727084),
('Shahrah e Faisal', 24.859240242123473, 67.05262987717214),
('Naval Estate', 24.85181024943895, 67.05305233143332),
('NMC', 24.84671915873347, 67.05574776839089),
('Circular Avenue', 24.840988666376212, 67.06006715576254),
('Sunset Boulevard', 24.831641537613198, 67.06020628981624),
('Khayaban-e-Ittehad', 24.803347749762963, 67.07767191476876),
('KPT Interchange 2', 24.829448091011514, 67.08085653134863),
('KPT Interchange 1', 24.830871733331776, 67.08012134424729),
('Brookes Chowrangi', 24.834716129393808, 67.09902092306002),
('Toyota Southern', 24.836470091621877, 67.10870652015737),
('Sector 23', 24.83663704099525, 67.10964085129434),
('Shan Chowrangi', 24.838799619975536, 67.1209064402609),
('National Refinery', 24.84009939796714, 67.12683195740193),
('VITA Chowrangi', 24.84136626520311, 67.13370521262114),
('Bilal Chowrangi', 24.843197439309964, 67.14243037064311),
('SNA Motors', 24.84403902335185, 67.14534562472252),
('Getz Pharma', 24.845641374081072, 67.15494858347624),
('Singer Chowrangi', 24.84644304368058, 67.16016397320567),
('Jamia Dar-ul-Uloom', 24.84731411187606, 67.16278633690862),
('Herbion Pharma', 24.84972988946234, 67.17567002289562),
('Murtaza Chowrangi', 24.851139248589522, 67.18137635261786),
('Sector 21', 24.8529468586667, 67.19180019379803),
('Landhi Graveyard', 24.854558111204287, 67.1997757850886),
('Mansehra Colony', 24.855091742204646, 67.20192904425605),
('Dawood Chowrangi', 24.85036339954677, 67.20686980624312)
ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude);

INSERT INTO routes_stops (route_id, stop_id, stop_order) VALUES
(4, 1, 1),
(4, 49, 2),
(4, 50, 3),
(4, 51, 4),
(4, 52, 5),
(4, 53, 6),
(4, 54, 7),
(4, 55, 8),
(4, 56, 9),
(4, 57, 10),
(4, 58, 11),
(4, 59, 12),
(4, 60, 13),
(4, 61, 14),
(4, 62, 15),
(4, 63, 16),
(4, 64, 17),
(4, 65, 18),
(4, 66, 19),
(4, 67, 20),
(4, 68, 21),
(4, 69, 22),
(4, 70, 23),
(4, 71, 24),
(4, 72, 25),
(4, 73, 26),
(4, 74, 27)
ON DUPLICATE KEY UPDATE stop_order = VALUES(stop_order);

-- =============================================================================
-- 5) BLUE LINE BRT
-- =============================================================================

INSERT INTO services (service_name) VALUES
('Blue Line BRT')
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name);

INSERT INTO routes (service_id, route_name) VALUES
(5, 'Blue Line Corridor')
ON DUPLICATE KEY UPDATE route_name = VALUES(route_name);

INSERT INTO stops (stop_name, latitude, longitude) VALUES
('Guru Mandir', 24.8812583, 67.0384270),
('Teen Hatti', 24.8933472, 67.0436162),
('Dak Khana', 24.9089165, 67.0487164),
('Al-Karam Apartments', 24.9125962, 67.0496603),
('Karimabad', 24.91844640965097, 67.05405838068752),
('Jamat Khana', 24.9230484, 67.0597761),
('Ayesha Manzil', 24.927355232949047, 67.06454643687691),
('Water Pump', 24.9358602, 67.0755901),
('Yousuf Plaza', 24.9397104, 67.0808159),
('Sohrab Goth', 24.94366868161439, 67.08424604837266),
('Al-Asif Square', 24.9509926, 67.0921191)
ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude);

INSERT INTO routes_stops (route_id, stop_id, stop_order) VALUES
(5, 1, 1),
(5, 75, 2),
(5, 76, 3),
(5, 77, 4),
(5, 78, 5),
(5, 79, 6),
(5, 80, 7),
(5, 81, 8),
(5, 82, 9),
(5, 83, 10),
(5, 84, 11),
(5, 85, 12)
ON DUPLICATE KEY UPDATE stop_order = VALUES(stop_order);

-- =============================================================================
-- 6) BROWN LINE BRT
-- =============================================================================

INSERT INTO services (service_name) VALUES
('Brown Line BRT')
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name);

INSERT INTO routes (service_id, route_name) VALUES
(6, 'Brown Line Corridor')
ON DUPLICATE KEY UPDATE route_name = VALUES(route_name);

INSERT INTO stops (stop_name, latitude, longitude) VALUES
('Korangi Sector 20', 24.84928636185377, 67.15949569922965),
('Colony #2', 24.88147989335521, 67.14550325257535),
('Shama Center', 24.884677397971068, 67.14555458828029),
('Nata Khan', 24.886940080873273, 67.1321118134096),
('Drigh Road', 24.88694238181265, 67.12836191263865),
('COD', 24.892080281717142, 67.12183525220568),
('Askari IV', 24.899734356619685, 67.11669169170801),
('Johar Morr', 24.9043838262249, 67.11341388899848),
('Sunday Bazar', 24.910418068238613, 67.10656950835792),
('Sindbad', 24.91578129572602, 67.0993004868166),
('Moti Mehal', 24.926873854574072, 67.08940458946007),
('UBL Sports Complex', 24.931124207164682, 67.08590081657329),
('Al-Mohsin Imam Bargah', 24.940260616098513, 67.08480132788807),
('Ancholi', 24.948622437359614, 67.08174602729449),
('Afroz Textiles', 24.95121188472058, 67.08016804814658),
('Namak Bank', 24.95926286157221, 67.07449765370525)
ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude);

INSERT INTO routes_stops (route_id, stop_id, stop_order) VALUES
(6, 67, 1),
(6, 86, 2),
(6, 87, 3),
(6, 88, 4),
(6, 89, 5),
(6, 90, 6),
(6, 91, 7),
(6, 92, 8),
(6, 93, 9),
(6, 94, 10),
(6, 95, 11),
(6, 35, 12),
(6, 96, 13),
(6, 97, 14),
(6, 98, 15),
(6, 84, 16),
(6, 99, 17),
(6, 100, 18),
(6, 101, 19),
(6, 13, 20)
ON DUPLICATE KEY UPDATE stop_order = VALUES(stop_order);
