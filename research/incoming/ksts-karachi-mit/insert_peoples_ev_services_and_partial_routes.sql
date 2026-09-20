-- IMPORTANT: This script inserts master data for the Peoples bus services and their stops.
-- To seed ALL route-stop mappings, you must also run:
--   insert_peoples_ev_all_routes_and_stops.sql
-- This companion script handles route-stop associations for all Red-Bus, EV-Bus, and Pink-Bus routes.

USE ksts_db;

-- =============================================================================
-- SERVICES (Idempotent inserts)
-- =============================================================================

INSERT INTO services (service_name) VALUES
  ('Red-Bus'),
  ('EV-Bus'),
  ('Pink-Bus')
ON DUPLICATE KEY UPDATE
  service_name = VALUES(service_name);

-- Capture service_ids into variables for use below
SELECT service_id INTO @service_red  FROM services WHERE service_name='Red-Bus' LIMIT 1;
SELECT service_id INTO @service_ev   FROM services WHERE service_name='EV-Bus' LIMIT 1;
SELECT service_id INTO @service_pink FROM services WHERE service_name='Pink-Bus' LIMIT 1;

-- =============================================================================
-- ROUTES
-- =============================================================================

-- Insert Red-Bus routes (R1-R13)
INSERT INTO routes (service_id, route_name) VALUES
  (@service_red, 'R1 (Khokrapar - Dockyard)'),
  (@service_red, 'R2 (Powerhouse - Indus Hospital)'),
  (@service_red, 'R3 (Powerhouse - Nasir Jump)'),
  (@service_red, 'R4 (Power House - Keamari)'),
  (@service_red, 'R8 (Yousuf Goth - Tower)'),
  (@service_red, 'R9 (Gulshan e Hadeed - Tower)'),
  (@service_red, 'R10 (Numaish - Ibrahim Hyderi)'),
  (@service_red, 'R11 (Miran Nakka - Shireen Jinnah Colony)'),
  (@service_red, 'R12 (Naddi Kinara - Lucky Star)'),
  (@service_red, 'R13 (Hawksbay - Tower)')
ON DUPLICATE KEY UPDATE
  route_name = VALUES(route_name);

-- Insert EV-Bus routes
INSERT INTO routes (service_id, route_name) VALUES
  (@service_ev, 'EV1 (Malir Cantt - Dolmen Mall Clifton)'),
  (@service_ev, 'EV2 (Bahria Town - Malir Halt)'),
  (@service_ev, 'EV3 (Malir Cantt - Numaish)'),
  (@service_ev, 'EV4 (Bahria Town - Ayesha Manzil)'),
  (@service_ev, 'EV5 (DHA City - Sohrab Goth)')
ON DUPLICATE KEY UPDATE
  route_name = VALUES(route_name);

-- Insert Pink-Bus routes (female-only service; uses P prefix to distinguish from Red-Bus)
INSERT INTO routes (service_id, route_name) VALUES
  (@service_pink, 'P1 (Khokrapar - Dockyard)'),
  (@service_pink, 'P2 (Powerhouse - Indus Hospital)'),
  (@service_pink, 'P3 (Powerhouse - Nasir Jump)'),
  (@service_pink, 'P9 (Gulshan e Hadeed - Tower)'),
  (@service_pink, 'P10 (Numaish - Ibrahim Hyderi)')
ON DUPLICATE KEY UPDATE
  route_name = VALUES(route_name);

-- =============================================================================
-- STOPS (Explicit stop_ids to guarantee correct ID assignment)
-- =============================================================================

INSERT INTO stops (stop_id, stop_name, latitude, longitude) VALUES
  (102, 'Khokrapar', 24.90360681160809, 67.20617577301523),
  (103, 'Saudabad', 24.898749126696448, 67.19921741179233),
  (104, 'RCD Ground', 24.89944932896936, 67.19745819954272),
  (105, 'Kalaboard', 24.882153982398762, 67.18266553410584),
  (106, 'Colony Gate', 24.887164078527558, 67.14963159506532),
  (107, 'PAF Base Faisal', 24.884199977735726, 67.1160425753197),
  (108, 'Laal Kothi', 24.8625808, 67.0697333),
  (109, 'Karsaz', 24.8761439, 67.1010692),
  (110, 'Nursery', 24.860866, 67.0628421),
  (111, 'FTC', 24.858449836777126, 67.05022041587226),
  (112, 'Regent Plaza', 24.855713, 67.0389185),
  (113, 'Metropole', 24.8506013, 67.0299892),
  (114, 'Fawwara Chowk', 24.85379451066601, 67.02805522601828),
  (115, 'Arts Council', 24.8532534, 67.0209219),
  (116, 'Shaheen Complex', 24.8508957, 67.018763),
  (117, 'I.I.Chundrigar', 24.848810645826088, 66.9974697027558),
  (118, 'Tower', 24.847932677751412, 66.99524513871249),
  (119, 'Fisheries', 24.848456719313468, 66.98110610616409),
  (120, 'Dockyard', 24.8304462, 66.9707783),
  (121, 'UP Mor', 24.9730337, 67.0667428),
  (122, 'Shafiq Morr', 24.957391, 67.0762029),
  (123, 'Gulshan Chowrangi', 24.9221389, 67.0941637),
  (124, 'Shah Faisal Colony', 24.878677195436808, 67.14539952391964),
  (125, 'Khaddi Stop', 24.8406313, 67.1613792),
  (126, 'Indus Hospital', 24.81750469763461, 67.11130052914348),
  (127, 'Liaquatabad 10 Number', 24.9094604, 67.0494807),
  (128, 'Laloo Khait', 24.9090536, 67.049716),
  (129, 'Jehangir Road', 24.8868168, 67.0414495),
  (130, 'Mobile Market', 24.86451886219809, 67.02407298827531),
  (131, 'Urdu Bazar', 24.86068685928718, 67.01763420242416),
  (132, 'Civil Hospital', 24.85834345459461, 67.01349332560326),
  (133, 'City Court', 24.8554421, 67.0084028),
  (134, 'Light House', 24.856213039444395, 67.00983970704101),
  (135, 'Bolton Market', 24.8511218, 67.0008605),
  (136, 'Keamari', 24.8248799, 66.9789668),
  (137, 'Gulshan e Hadeed', 24.870861225752197, 67.37268289825623),
  (138, 'Dolmen Mall Clifton', 24.802814, 67.0300302),
  (139, 'Clock Tower DHA', 24.7785106, 67.0542486),
  (140, 'Ibrahim Hyderi', 24.7944215, 67.1360628),
  (141, 'Hawksbay', 24.8629656, 66.8496776),
  (142, 'Mauripur', 24.8685538, 66.9180648),
  (143, 'Gulbai', 24.8758492, 66.9677188),
  (144, 'Agra Taj', 24.87327210228411, 66.98130441002405),
  (145, 'Daryabad', 24.86240720939563, 66.98690650604185),
  (146, 'Jinnah Bridge', 24.8459993, 66.9930716),
  (147, 'CMH Malir Cantt', 24.949415902809378, 67.21400068620798),
  (148, 'Quaidabad', 24.855477839938263, 67.21181225153327),
  (167, 'Sakhi Hasan', 24.9534677, 67.0577717),
  (168, 'KDA Chowrangi', 24.9313398, 67.0380543),
  (169, 'Nazimabad Eid Gah Ground', 24.9116613, 67.0299321),
  (170, 'Essa Nagri', 24.9045029, 67.0677116),
  (171, 'National Stadium', 24.89293790389886, 67.08443974804159),
  (172, 'Main Korangi Road', 24.83593286479085, 67.10588699537331),
  (173, 'Nasir Jump', 24.8207435, 67.1251238),
  (174, 'Naval Colony', 24.94490170700308, 66.93317604584138),
  (175, 'Baldia', 24.905842703998612, 66.96219424473288),
  (176, 'Sher Shah', 24.8897941, 66.9826881),
  (177, 'Salah Uddin Ayubi Road', 24.867315421715197, 67.35966570617978),
  (178, 'Allah Wali Chowrangi', 24.864365836078512, 67.349828944599),
  (179, 'National Highway 5', 24.86139488067893, 67.35104279951992),
  (180, 'Steel Mill More', 24.8617619, 67.3247927),
  (181, 'Port Bin Qasim More', 24.86632668111742, 67.3001004518521),
  (182, 'Razzakabad', 24.86431927742789, 67.29258770168065),
  (183, 'Abdullah Goth', 24.8626079, 67.2848234),
  (184, 'Chowkundi More', 24.859392617375672, 67.27269573302797),
  (185, 'Fast University', 24.857411579627374, 67.26400478811345),
  (186, 'Bhains Colony More', 24.8561466, 67.2583039),
  (187, 'Manzil Pump', 24.85480076123636, 67.22908274475193),
  (188, 'Murghi Khana', 24.860382, 67.2076289),
  (189, 'Prince Aly Boys School', 24.8700262, 67.2003008),
  (190, 'Nadra Center Malir', 24.8715583, 67.1977487),
  (191, 'Malir Session Court', 24.8740009, 67.1944212),
  (192, 'Malir 15', 24.8795765, 67.1884363),
  (193, 'Malir Mandir', 24.8753688, 67.1930641),
  (194, 'Babar Market', 24.8407762, 67.1868077),
  (195, 'Landhi Road', 24.8307882, 67.1717165),
  (196, 'Frere Hall', 24.847044167199112, 67.03133763333648),
  (197, 'Teen Talwar', 24.8348047, 67.0335215),
  (198, 'Do Talwar', 24.8218071, 67.0340807),
  (199, 'Abdullah Shah Ghazi', 24.810787987512004, 67.03093089884264),
  (200, '26 Street', 24.7888053, 67.0647565),
  (201, 'Masjid-e-Ayesha', 24.803143, 67.0779536),
  (202, 'Rahat Park', 24.8160516, 67.0757359),
  (203, 'Korangi Crossing', 24.817064229933052, 67.10778325390034),
  (204, 'CBM University', 24.8146036, 67.117558),
  (205, 'Parco', 24.8021315, 67.1336995),
  (206, 'Miran Nakka', 24.87930852988802, 66.99516786645329),
  (207, 'Gulistan Colony', 24.877321702968498, 66.99044104884575),
  (208, 'Bihar Colony', 24.87514167754211, 66.98524848675882),
  (209, 'Bahria Complex', 24.84555958184107, 66.99628658486732),
  (210, 'M.T.Khan Road', 24.845063633293993, 66.9994446480543),
  (211, 'PICD', 24.84662058662934, 67.02450549794344),
  (212, 'Submarine Chowk', 24.8290453, 67.0419605),
  (213, 'Bahria Complex 3', 24.824595111981235, 67.04417510623115),
  (214, 'Khadda Market', 24.813405935894743, 67.04805687387612),
  (215, 'Bilawal Chowrangi', 24.815644721749464, 67.01997484423575),
  (216, 'Ziauddin Hospital', 24.81684812902694, 67.00694412479469),
  (217, 'Shireen Jinnah Colony', 24.813420676272653, 66.99459214187371),
  (218, 'Naddi Kinara', 24.9090922, 67.2150609),
  (219, 'Qayyumabad', 24.829476, 67.0808179),
  (220, 'Defence Mor', 24.8379604, 67.0676111),
  (221, 'National Medical Center', 24.846489249037113, 67.05510890337621),
  (222, 'Gora Qabristan', 24.854741270436573, 67.05165454038803),
  (223, 'Jutt Land', 24.8615609, 67.0422107),
  (224, 'Lines Area', 24.86051364183229, 67.0448388300816),
  (225, 'Army Public School', 24.860152922682563, 67.0392210700604),
  (226, 'Lucky Star Saddar', 24.8569874430202, 67.03341306029265),
  (227, 'Jinnah Ave', 24.9033517, 67.1823491),
  (228, 'Airport', 24.897516282556328, 67.17985246840544),
  (229, 'DHA Phase 1', 24.833806429666307, 67.07379104568369),
  (230, 'Bahria Town', 25.071409108597887, 67.30525112992133),
  (231, 'Dumba Goth', 24.97600581564162, 67.26931829835877),
  (232, 'Toll Plaza', 24.982724644299836, 67.22765360651692),
  (233, 'Baqai University', 24.984934638549305, 67.21279862694061),
  (234, 'Malir Cantt Check Post 5', 24.9481486, 67.1830428),
  (235, 'Malir Cantt Gate 6', 24.9347056, 67.1771908),
  (236, 'Rim Jhim Tower', 24.940271682432204, 67.16030814668274),
  (237, 'Kamran Chowrangi', 24.923774830723154, 67.13808592104827),
  (238, 'Darul Sehat Hospital', 24.91394111064369, 67.12793700411997),
  (239, 'Millennium Mall', 24.9016005, 67.1153535),
  (240, 'Dalmia Road', 24.8965479, 67.0991636),
  (241, 'Bahria University', 24.8940444, 67.0879168),
  (242, 'Aga Khan Hospital', 24.8906318, 67.0750727),
  (243, 'Liaquat National Hospital', 24.889612, 67.0678073),
  (244, 'PIB Colony', 24.8859374, 67.057353),
  (245, 'Dawood Engineering University', 24.8795444, 67.0478064),
  (246, 'People Secretariat Chowrangi', 24.8768741, 67.0440489),
  (247, 'Jamali Pull', 24.9732052, 67.1183428),
  (248, 'New Sabzi Mandi', 24.99340288659762, 67.1543249468857),
  (249, 'DHA City', 25.036966976480297, 67.4468665951188),
  (250, 'Yousuf Goth', 24.95693516470721, 66.92543455817282),
  (251, 'Korangi Road', 24.84171613851047, 67.05917569322027),
  (252, 'Johar Chowrangi', 24.912068918366348, 67.12577571645011),
  (253, 'Bahria Town Bus Terminal', 24.992515420061718, 67.31767362185657)
ON DUPLICATE KEY UPDATE
  stop_name = VALUES(stop_name),
  latitude = VALUES(latitude),
  longitude = VALUES(longitude);
