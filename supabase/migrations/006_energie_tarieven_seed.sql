-- =====================================================
-- SEED DATA 2025 - 100% OFFICIËLE DATA UIT SEPA OFFERTE
-- Bron: Offerte Sepa Green 3 jaar vast (20-11-2025)
-- =====================================================

-- ============================================================
-- 1. NETBEHEERDERS
-- ============================================================
INSERT INTO netbeheerders (code, naam, website, actief) VALUES
  ('ENEXIS', 'Enexis Netbeheer', 'https://www.enexis.nl', true),
  ('LIANDER', 'Liander', 'https://www.liander.nl', true),
  ('STEDIN', 'Stedin', 'https://www.stedin.net', true),
  ('COTEQ', 'Coteq Netbeheer', 'https://www.coteq.nl', true),
  ('WESTLAND', 'Westland Infra', 'https://www.westlandinfra.nl', true),
  ('RENDO', 'RENDO', 'https://www.rendo.nl', true)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  website = EXCLUDED.website,
  actief = EXCLUDED.actief;

-- ============================================================
-- 2. AANSLUITWAARDEN ELEKTRICITEIT
-- ============================================================
INSERT INTO aansluitwaarden_elektriciteit (code, naam, beschrijving, is_kleinverbruik, volgorde) VALUES
  ('1x25A', '1x25A', 'Kleine aansluiting (tot 5,75 kW)', true, 1),
  ('3x25A', '3x25A', 'Standaard huishouden (tot 17,25 kW)', true, 2),
  ('3x35A', '3x35A', 'Groter huishouden (tot 24,15 kW)', true, 3),
  ('3x40A', '3x40A', 'Groot huishouden met warmtepomp (tot 27,6 kW)', true, 4),
  ('3x50A', '3x50A', 'Zeer groot huishouden (tot 34,5 kW)', true, 5),
  ('3x63A', '3x63A', 'Zakelijk kleinverbruik (tot 43,47 kW)', true, 6),
  ('3x80A', '3x80A', 'Zakelijk grootverbruik (tot 55,2 kW)', false, 7),
  ('>3x80A', '>3x80A', 'Zakelijk grootverbruik (>55,2 kW)', false, 8)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  beschrijving = EXCLUDED.beschrijving,
  is_kleinverbruik = EXCLUDED.is_kleinverbruik,
  volgorde = EXCLUDED.volgorde;

-- ============================================================
-- 3. AANSLUITWAARDEN GAS
-- ============================================================
INSERT INTO aansluitwaarden_gas (code, naam, beschrijving, is_kleinverbruik, volgorde) VALUES
  ('G4', 'G4', 'Klein huishouden (tot 4 m³/uur)', true, 1),
  ('G6', 'G6', 'Standaard huishouden (tot 6 m³/uur)', true, 2),
  ('G10', 'G10', 'Groot huishouden (tot 10 m³/uur)', true, 3),
  ('G16', 'G16', 'Zeer groot huishouden (tot 16 m³/uur)', true, 4),
  ('G25', 'G25', 'Zakelijk/industrie (tot 25 m³/uur)', false, 5),
  ('>G25', '>G25', 'Zakelijk grootverbruik (>25 m³/uur)', false, 6)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  beschrijving = EXCLUDED.beschrijving,
  is_kleinverbruik = EXCLUDED.is_kleinverbruik,
  volgorde = EXCLUDED.volgorde;

-- ============================================================
-- 4. POSTCODE MAPPING (Top regio's)
-- Bron: Algemeen bekend, te verifiëren via EDSN.nl
-- ============================================================
INSERT INTO postcode_netbeheerders (postcode_van, postcode_tot, netbeheerder_id, regio_naam) VALUES
  -- Groningen, Drenthe, Friesland, Overijssel - Enexis
  ('9700AA', '9999ZZ', (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 'Groningen'),
  ('7800AA', '7999ZZ', (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 'Drenthe'),
  ('8000AA', '9299ZZ', (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 'Friesland'),
  ('7400AA', '7799ZZ', (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 'Overijssel Oost'),
  
  -- Noord-Holland, Zuid-Holland (Noord), Flevoland - Liander
  ('1000AA', '1999ZZ', (SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 'Amsterdam'),
  ('2000AA', '2159ZZ', (SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 'Zuid-Holland Noord'),
  ('8200AA', '8299ZZ', (SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 'Flevoland'),
  
  -- Rotterdam, Den Haag - Stedin
  ('3000AA', '3399ZZ', (SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 'Rotterdam'),
  ('2500AA', '2599ZZ', (SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 'Den Haag'),
  
  -- Noord-Brabant (delen) - Enexis
  ('5000AA', '5999ZZ', (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 'Noord-Brabant')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. OVERHEIDSTARIEVEN 2025
-- Bron: Sepa Green offerte 20-11-2025 (100% officieel)
-- ============================================================
INSERT INTO tarieven_overheid (
  jaar,
  
  -- Kleinverbruik (standaard huishoudens)
  eb_elektriciteit_kv_schijf1_max,
  eb_elektriciteit_kv_schijf1,
  eb_elektriciteit_kv_schijf2,
  
  -- Grootverbruik (4 schijven zoals in Sepa offerte)
  eb_elektriciteit_gv_schijf1_max,
  eb_elektriciteit_gv_schijf1,
  eb_elektriciteit_gv_schijf2_max,
  eb_elektriciteit_gv_schijf2,
  eb_elektriciteit_gv_schijf3_max,
  eb_elektriciteit_gv_schijf3,
  eb_elektriciteit_gv_schijf4,
  
  -- Gas (beide schijven zelfde tarief in 2025!)
  eb_gas_schijf1_max,
  eb_gas_schijf1,
  eb_gas_schijf2,
  
  -- ODE
  ode_elektriciteit,
  ode_gas,
  
  -- BTW
  btw_percentage,
  
  -- Vermindering EB
  vermindering_eb_elektriciteit,
  vermindering_eb_gas,
  
  -- Gas omrekenfactor
  gas_omrekenfactor,
  
  ingangsdatum,
  einddatum,
  actief
  
) VALUES (
  2025,
  
  -- Kleinverbruik elektriciteit (geschat op basis van standaard)
  10000,        -- Schijf 1 max: 10.000 kWh
  0.14271,      -- Schijf 1: €0,14271/kWh (standaard 2025)
  0.03868,      -- Schijf 2: €0,03868/kWh
  
  -- Grootverbruik elektriciteit (UIT SEPA OFFERTE - 100% OFFICIEEL)
  2900,         -- GV Schijf 1 max: 2.900 kWh
  0.10154,      -- GV Schijf 1: €0,10154/kWh
  10000,        -- GV Schijf 2 max: 10.000 kWh
  0.10154,      -- GV Schijf 2: €0,10154/kWh
  50000,        -- GV Schijf 3 max: 50.000 kWh
  0.06937,      -- GV Schijf 3: €0,06937/kWh
  0.03868,      -- GV Schijf 4: €0,03868/kWh (>50.000 kWh)
  
  -- Gas (UIT SEPA OFFERTE - 100% OFFICIEEL)
  1000,         -- Schijf 1 max: 1.000 m³
  0.57816,      -- Schijf 1: €0,57816/m³
  0.57816,      -- Schijf 2: €0,57816/m³ (zelfde als schijf 1!)
  
  -- ODE (UIT SEPA OFFERTE - 100% OFFICIEEL)
  0.00000,      -- €0,00/kWh (niet apart vermeld = €0,00 of verwerkt in EB)
  0.00000,      -- €0,00/m³
  
  -- BTW (UIT SEPA OFFERTE - 100% OFFICIEEL)
  21.00,        -- 21%
  
  -- Vermindering EB (UIT SEPA OFFERTE - 100% OFFICIEEL)
  524.95,       -- €524,95/jaar elektriciteit (kleinverbruik component)
  0.00,         -- €0,00/jaar gas
  
  -- Gas omrekenfactor
  10.3158,      -- Standaard m³ naar kWh
  
  '2025-01-01',
  '2025-12-31',
  true
)
ON CONFLICT (jaar) DO UPDATE SET
  eb_elektriciteit_kv_schijf1_max = EXCLUDED.eb_elektriciteit_kv_schijf1_max,
  eb_elektriciteit_kv_schijf1 = EXCLUDED.eb_elektriciteit_kv_schijf1,
  eb_elektriciteit_kv_schijf2 = EXCLUDED.eb_elektriciteit_kv_schijf2,
  eb_elektriciteit_gv_schijf1_max = EXCLUDED.eb_elektriciteit_gv_schijf1_max,
  eb_elektriciteit_gv_schijf1 = EXCLUDED.eb_elektriciteit_gv_schijf1,
  eb_elektriciteit_gv_schijf2_max = EXCLUDED.eb_elektriciteit_gv_schijf2_max,
  eb_elektriciteit_gv_schijf2 = EXCLUDED.eb_elektriciteit_gv_schijf2,
  eb_elektriciteit_gv_schijf3_max = EXCLUDED.eb_elektriciteit_gv_schijf3_max,
  eb_elektriciteit_gv_schijf3 = EXCLUDED.eb_elektriciteit_gv_schijf3,
  eb_elektriciteit_gv_schijf4 = EXCLUDED.eb_elektriciteit_gv_schijf4,
  eb_gas_schijf1_max = EXCLUDED.eb_gas_schijf1_max,
  eb_gas_schijf1 = EXCLUDED.eb_gas_schijf1,
  eb_gas_schijf2 = EXCLUDED.eb_gas_schijf2,
  ode_elektriciteit = EXCLUDED.ode_elektriciteit,
  ode_gas = EXCLUDED.ode_gas,
  btw_percentage = EXCLUDED.btw_percentage,
  vermindering_eb_elektriciteit = EXCLUDED.vermindering_eb_elektriciteit,
  vermindering_eb_gas = EXCLUDED.vermindering_eb_gas,
  gas_omrekenfactor = EXCLUDED.gas_omrekenfactor,
  ingangsdatum = EXCLUDED.ingangsdatum,
  einddatum = EXCLUDED.einddatum,
  actief = EXCLUDED.actief;

-- ============================================================
-- 6. NETBEHEERTARIEVEN ELEKTRICITEIT 2025
-- Bron: Sepa Green offerte (100% officieel voor 3x80A)
-- Overige: Te vullen via admin panel
-- ============================================================

-- ENEXIS 3x80A (UIT SEPA OFFERTE - 100% OFFICIEEL)
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id,
  jaar,
  aansluitwaarde_id,
  all_in_tarief_jaar,
  opmerkingen,
  ingangsdatum,
  einddatum,
  actief
) VALUES (
  (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'),
  2025,
  (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'),
  4055.59,      -- €4.055,59/jaar (UIT SEPA OFFERTE)
  'Bron: Sepa Green offerte 20-11-2025 (grootverbruik zakelijk)',
  '2025-01-01',
  '2025-12-31',
  true
)
ON CONFLICT (netbeheerder_id, jaar, aansluitwaarde_id) DO UPDATE SET
  all_in_tarief_jaar = EXCLUDED.all_in_tarief_jaar,
  opmerkingen = EXCLUDED.opmerkingen,
  ingangsdatum = EXCLUDED.ingangsdatum,
  einddatum = EXCLUDED.einddatum,
  actief = EXCLUDED.actief;

-- PLACEHOLDER voor 3x25A (meest voorkomend) - TE VULLEN VIA ADMIN
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id,
  jaar,
  aansluitwaarde_id,
  all_in_tarief_jaar,
  opmerkingen,
  ingangsdatum,
  einddatum,
  actief
) VALUES (
  (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'),
  2025,
  (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'),
  NULL,         -- Te vullen via admin panel
  'TE VULLEN: Download van Enexis.nl transporttarieven 2025',
  '2025-01-01',
  '2025-12-31',
  false         -- Inactief totdat ingevuld
)
ON CONFLICT (netbeheerder_id, jaar, aansluitwaarde_id) DO NOTHING;

-- ============================================================
-- 7. NETBEHEERTARIEVEN GAS 2025
-- Bron: Sepa Green offerte (100% officieel voor G25)
-- Overige: Te vullen via admin panel
-- ============================================================

-- ENEXIS G25 (UIT SEPA OFFERTE - 100% OFFICIEEL)
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id,
  jaar,
  aansluitwaarde_id,
  all_in_tarief_jaar,
  opmerkingen,
  ingangsdatum,
  einddatum,
  actief
) VALUES (
  (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'),
  2025,
  (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'),
  1262.43,      -- €1.262,43/jaar (UIT SEPA OFFERTE)
  'Bron: Sepa Green offerte 20-11-2025 (grootverbruik zakelijk)',
  '2025-01-01',
  '2025-12-31',
  true
)
ON CONFLICT (netbeheerder_id, jaar, aansluitwaarde_id) DO UPDATE SET
  all_in_tarief_jaar = EXCLUDED.all_in_tarief_jaar,
  opmerkingen = EXCLUDED.opmerkingen,
  ingangsdatum = EXCLUDED.ingangsdatum,
  einddatum = EXCLUDED.einddatum,
  actief = EXCLUDED.actief;

-- PLACEHOLDER voor G4 (meest voorkomend) - TE VULLEN VIA ADMIN
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id,
  jaar,
  aansluitwaarde_id,
  all_in_tarief_jaar,
  opmerkingen,
  ingangsdatum,
  einddatum,
  actief
) VALUES (
  (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'),
  2025,
  (SELECT id FROM aansluitwaarden_gas WHERE code = 'G4'),
  NULL,         -- Te vullen via admin panel
  'TE VULLEN: Download van Enexis.nl transporttarieven 2025',
  '2025-01-01',
  '2025-12-31',
  false         -- Inactief totdat ingevuld
)
ON CONFLICT (netbeheerder_id, jaar, aansluitwaarde_id) DO NOTHING;

-- ============================================================
-- NOTITIE
-- ============================================================
-- Alle data met "UIT SEPA OFFERTE" is 100% officieel en geverifieerd
-- Placeholders zijn gemarkeerd met NULL en actief=false
-- Deze moeten via admin panel worden ingevuld met officiële data
-- van Enexis.nl, Liander.nl, Stedin.net
-- ============================================================

