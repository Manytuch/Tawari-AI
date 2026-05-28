-- RescueAI Hospital Seed Data — South Sudan
-- Real and representative hospitals/health centers in Juba and key towns

INSERT INTO hospitals (name, type, address, city, state, lat, lng, phone, capacity, available_beds, has_emergency, has_surgery, has_blood_bank, operating_hours) VALUES

-- Juba (capital) — primary facilities
('Juba Teaching Hospital', 'hospital', 'Juba Teaching Hospital Rd', 'Juba', 'Central Equatoria', 4.8517, 31.5825, '+211-920-000-001', 500, 80, true, true, true, '24/7'),
('Dr. John Garang Memorial Hospital', 'hospital', 'Garang Mausoleum Area', 'Juba', 'Central Equatoria', 4.8500, 31.5770, '+211-920-000-002', 300, 45, true, true, false, '24/7'),
('Military Hospital Juba', 'hospital', 'Ministry of Defence Rd', 'Juba', 'Central Equatoria', 4.8560, 31.5810, '+211-920-000-003', 200, 30, true, true, false, '24/7'),
('Nyakuron Health Centre', 'health_center', 'Nyakuron Cultural Centre Area', 'Juba', 'Central Equatoria', 4.8490, 31.5900, '+211-920-000-004', 60, 12, true, false, false, '8am-8pm'),
('Nimule Road Clinic', 'clinic', 'Nimule Road, Gudele', 'Juba', 'Central Equatoria', 4.8720, 31.5650, '+211-920-000-005', 40, 8, false, false, false, '7am-6pm'),
('MSF South Sudan Clinic', 'clinic', 'Munuki Area', 'Juba', 'Central Equatoria', 4.8610, 31.5740, '+211-920-000-006', 80, 20, true, false, false, '24/7'),
('Juba International Airport Clinic', 'clinic', 'Juba International Airport', 'Juba', 'Central Equatoria', 4.8722, 31.6011, '+211-920-000-007', 20, 5, true, false, false, '24/7'),
('Catholic Health Network — Juba', 'health_center', 'Cathedral Area, Juba', 'Juba', 'Central Equatoria', 4.8545, 31.5880, '+211-920-000-008', 70, 15, true, false, false, '7am-9pm'),

-- Malakal
('Malakal Teaching Hospital', 'hospital', 'Malakal Town', 'Malakal', 'Upper Nile', 9.5334, 31.6608, '+211-920-000-009', 250, 40, true, true, false, '24/7'),
('Malakal Primary Health Care', 'health_center', 'Malakal', 'Malakal', 'Upper Nile', 9.5290, 31.6570, '+211-920-000-010', 50, 10, true, false, false, '8am-6pm'),

-- Wau
('Wau Teaching Hospital', 'hospital', 'Wau Town Centre', 'Wau', 'Western Bahr el Ghazal', 7.7010, 27.9906, '+211-920-000-011', 200, 35, true, true, false, '24/7'),
('St. Daniel Comboni Hospital', 'hospital', 'Catholic Mission, Wau', 'Wau', 'Western Bahr el Ghazal', 7.7050, 27.9870, '+211-920-000-012', 150, 25, true, false, false, '24/7'),

-- Yei
('Yei Civil Hospital', 'hospital', 'Yei Town', 'Yei', 'Central Equatoria', 4.0914, 30.6778, '+211-920-000-013', 120, 20, true, false, false, '24/7'),

-- Torit
('Torit State Hospital', 'hospital', 'Torit', 'Torit', 'Eastern Equatoria', 4.4118, 32.5714, '+211-920-000-014', 100, 18, true, false, false, '24/7'),

-- Bor
('Bor State Hospital', 'hospital', 'Bor', 'Bor', 'Jonglei', 6.2083, 31.5592, '+211-920-000-015', 130, 22, true, false, false, '24/7'),

-- Nimule (border town, key entry point)
('Nimule Hospital', 'hospital', 'Nimule', 'Nimule', 'Eastern Equatoria', 3.5967, 32.0597, '+211-920-000-016', 80, 14, true, false, false, '24/7');
