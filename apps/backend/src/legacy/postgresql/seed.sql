-- VaxCare demo seed data
-- Run after schema.sql to populate the same demo dataset the original
-- mock-data prototype shipped with (3 staff accounts, 10 residents, their
-- vaccination history, vaccine stock, schedules, and notifications).
--
-- Run with: psql -U <user> -d <database> -f src/legacy/postgresql/seed.sql

-- ─── Staff accounts ─────────────────────────────────────────────────────────
-- Passwords (bcrypt-hashed below): admin / admin2025, ana.reyes / health123,
-- luz.garcia / health123. Resident accounts don't need a users row — the
-- resident login endpoint checks the residents table's id + birthdate.
INSERT INTO users (username, password_hash, display_name, role, avatar, title) VALUES
  ('admin',      '$2b$10$PnUZwREExo/ixpjOWa/D7.SUdbp5/uEz8t8tiplZwGYDICEJbSMvu', 'Dr. Pedro Cruz', 'admin',  'P', 'Barangay Health Officer'),
  ('ana.reyes',  '$2b$10$0XKXLnTWkzyDtq7250i5W.ysgW6SZUYoCRO/ez5bT7G0cgQd81I6C', 'RN Ana Reyes',   'worker', 'A', 'Registered Nurse'),
  ('luz.garcia', '$2b$10$HRby3qyO/oSvm3XgNwTVtuhYzU9HCmSNtgFVG091pd6ZJqIdPr4EG', 'RN Luz Garcia',  'worker', 'L', 'Registered Nurse')
ON CONFLICT (username) DO NOTHING;

-- ─── Residents ───────────────────────────────────────────────────────────────
INSERT INTO residents (id, name, age, gender, birthdate, address, phone, purok, status, next_due) VALUES
  ('R001', 'Maria Santos',      34, 'Female', '1990-03-15', '123 Sampaguita St.', '09171234567', 'Purok 1', 'Fully Vaccinated',     NULL),
  ('R002', 'Jose dela Cruz',    45, 'Male',   '1979-07-22', '45 Rizal Ave.',      '09282345678', 'Purok 2', 'Partially Vaccinated', '2025-07-22'),
  ('R003', 'Ana Reyes',         28, 'Female', '1996-11-08', '78 Mabini Blvd.',    '09393456789', 'Purok 1', 'Fully Vaccinated',     NULL),
  ('R004', 'Carlos Mendoza',    62, 'Male',   '1962-05-30', '9 Aguinaldo Rd.',    '09504567890', 'Purok 3', 'Partially Vaccinated', '2025-08-15'),
  ('R005', 'Luisa Torres',      19, 'Female', '2005-12-01', '56 Luna St.',        '09615678901', 'Purok 2', 'Unvaccinated',         '2025-07-10'),
  ('R006', 'Ramon Villanueva',  55, 'Male',   '1969-08-14', '32 Bonifacio St.',   '09726789012', 'Purok 4', 'Fully Vaccinated',     NULL),
  ('R007', 'Gloria Aquino',     41, 'Female', '1983-04-17', '11 Magsaysay Blvd.', '09837890123', 'Purok 3', 'Partially Vaccinated', '2025-07-30'),
  ('R008', 'Ernesto Lim',       70, 'Male',   '1954-01-23', '88 Quezon Ave.',     '09948901234', 'Purok 5', 'Fully Vaccinated',     NULL),
  ('R009', 'Precy Abad',        25, 'Female', '2000-06-11', '22 Pasig Rd.',       '09159012345', 'Purok 1', 'Unvaccinated',         '2025-07-15'),
  ('R010', 'Roberto Castillo',  38, 'Male',   '1986-09-28', '67 Taft Ave.',       '09260123456', 'Purok 4', 'Partially Vaccinated', '2025-08-01')
ON CONFLICT (id) DO NOTHING;

-- ─── Vaccination history ─────────────────────────────────────────────────────
INSERT INTO vaccinations (resident_id, vaccine, dose, date, worker, batch_no, site) VALUES
  ('R001', 'COVID-19 Bivalent', 'Booster',   '2024-11-10', 'RN Ana Reyes',    'BV-2024-001', 'Left Arm'),
  ('R001', 'Influenza',         'Annual',    '2025-03-05', 'RN Ana Reyes',    'FLU-2025-01', 'Right Arm'),
  ('R002', 'COVID-19 Bivalent', '1st Dose',  '2025-01-15', 'RN Luz Garcia',   'BV-2025-003', 'Left Arm'),
  ('R003', 'HPV',               '1st Dose',  '2024-09-20', 'Dr. Pedro Cruz',  'HPV-2024-05', 'Right Arm'),
  ('R003', 'HPV',               '2nd Dose',  '2024-12-20', 'Dr. Pedro Cruz',  'HPV-2024-08', 'Right Arm'),
  ('R004', 'Pneumococcal',      '1st Dose',  '2025-02-10', 'RN Luz Garcia',   'PNE-2025-02', 'Left Arm'),
  ('R006', 'COVID-19 Bivalent', 'Booster',   '2024-10-05', 'Dr. Pedro Cruz',  'BV-2024-002', 'Left Arm'),
  ('R006', 'Influenza',         'Annual',    '2025-02-28', 'Dr. Pedro Cruz',  'FLU-2025-02', 'Right Arm'),
  ('R007', 'Hepatitis B',       '1st Dose',  '2025-04-30', 'RN Ana Reyes',    'HB-2025-01',  'Right Arm'),
  ('R008', 'COVID-19 Bivalent', 'Booster',   '2025-01-08', 'RN Luz Garcia',   'BV-2025-001', 'Left Arm'),
  ('R008', 'Pneumococcal',      'Annual',    '2025-03-15', 'RN Luz Garcia',   'PNE-2025-04', 'Right Arm'),
  ('R010', 'COVID-19 Bivalent', '1st Dose',  '2025-03-20', 'Dr. Pedro Cruz',  'BV-2025-005', 'Left Arm');

-- ─── Medical Supplies ─────────────────────────────────────────────────────────
INSERT INTO medical_supplies (id, name, category, quantity, min_stock, expiry_date, manufacturer, last_restocked) VALUES
  ('VS001', 'COVID-19 Bivalent',        'mRNA',             145, 50, '2025-12-31', 'Pfizer-BioNTech',  '2025-05-10'),
  ('VS002', 'Influenza (Quadrivalent)', 'Inactivated',       38, 40, '2025-10-15', 'Sanofi Pasteur',   '2025-04-20'),
  ('VS003', 'HPV (Cervarix)',           'VLP',               62, 30, '2026-03-20', 'GlaxoSmithKline',  '2025-03-05'),
  ('VS004', 'Hepatitis B',              'Recombinant',       15, 30, '2025-09-30', 'Merck & Co.',      '2025-02-15'),
  ('VS005', 'Pneumococcal (PCV13)',     'Conjugate',         89, 25, '2026-01-10', 'Pfizer',           '2025-05-01'),
  ('VS006', 'Measles-Mumps-Rubella',    'Live Attenuated',   74, 35, '2025-11-25', 'Serum Institute',  '2025-04-12'),
  ('VS007', 'Varicella',                'Live Attenuated',   22, 20, '2025-08-14', 'Merck & Co.',      '2025-01-30')
ON CONFLICT (id) DO NOTHING;

-- ─── Schedules ───────────────────────────────────────────────────────────────
INSERT INTO schedules (id, resident_id, appointment_type, details, scheduled_date, status, worker, purok) VALUES
  ('S001', 'R002', 'Vaccination', 'COVID-19 Bivalent - 2nd Dose', '2025-07-22', 'Upcoming',  'RN Ana Reyes',   'Purok 2'),
  ('S002', 'R005', 'Vaccination', 'COVID-19 Bivalent - 1st Dose', '2025-07-10', 'Upcoming',  'RN Luz Garcia',  'Purok 2'),
  ('S003', 'R009', 'Vaccination', 'HPV - 1st Dose',               '2025-07-15', 'Upcoming',  'Dr. Pedro Cruz', 'Purok 1'),
  ('S004', 'R004', 'Vaccination', 'Pneumococcal - 2nd Dose',      '2025-08-15', 'Upcoming',  'RN Ana Reyes',   'Purok 3'),
  ('S005', 'R010', 'Vaccination', 'COVID-19 Bivalent - 2nd Dose', '2025-08-01', 'Upcoming',  'Dr. Pedro Cruz', 'Purok 4'),
  ('S006', 'R007', 'Vaccination', 'Hepatitis B - 2nd Dose',       '2025-07-30', 'Upcoming',  'RN Ana Reyes',   'Purok 3'),
  ('S007', 'R001', 'Vaccination', 'Influenza - Annual',           '2025-06-10', 'Missed',    'RN Luz Garcia',  'Purok 1'),
  ('S008', 'R006', 'Vaccination', 'Influenza - Annual',           '2025-06-05', 'Completed', 'Dr. Pedro Cruz', 'Purok 4')
ON CONFLICT (id) DO NOTHING;

-- ─── Notifications ───────────────────────────────────────────────────────────
INSERT INTO notifications (type, title, message, read) VALUES
  ('alert',   'Critical Stock Level',  'Hepatitis B vaccine has fallen below minimum stock threshold (15 remaining, minimum 30).', false),
  ('warning', 'Low Inventory Warning', 'Influenza (Quadrivalent) stock is below minimum (38 remaining, minimum 40).', false),
  ('warning', 'Missed Vaccination',    'Maria Santos (R001) missed her scheduled Influenza vaccination on June 10, 2025.', false),
  ('info',    'Upcoming Schedule',     '5 residents have vaccinations scheduled in the next 7 days.', true),
  ('warning', 'Near-Expiry Vaccine',   'Varicella vaccine lot expires on August 14, 2025. Prioritize usage.', true),
  ('success', 'Stock Replenished',     'COVID-19 Bivalent vaccines restocked: 145 doses available.', true);
