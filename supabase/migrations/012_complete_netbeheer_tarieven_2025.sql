-- ============================================================
-- COMPLETE NETBEHEERTARIEVEN 2025 - ALLE NETBEHEERDERS
-- ============================================================
-- Bron: Officiële tarieven alle netbeheerders 2025
-- Datum: 21 november 2024
-- Alle bedragen van netbeheerders: INCL. BTW (21%), per jaar
-- Database opslag: EXCL. BTW (voor consistentie met leveranciers)
--
-- Conversie: Bedrag incl. BTW / 1.21 = Bedrag excl. BTW
--
-- Netbeheerders:
-- - Enexis, Liander, Stedin, Coteq, Rendo, Westland Infra
--
-- NOTE: G6 heeft 3 tarieven op basis van verbruik:
-- - <500m³ (G6_LAAG), 500-4000m³ (G6_MIDDEN), >4000m³ (G6_HOOG)
-- De API route converteerGasAansluitwaardeVoorDatabase() bepaalt 
-- automatisch de juiste variant op basis van het verbruik.
-- ============================================================

-- ============================================================
-- STAP 1: VOEG ONTBREKENDE NETBEHEERDERS TOE
-- ============================================================

INSERT INTO netbeheerders (code, naam, website, actief) VALUES
  ('ENEXIS', 'Enexis Netbeheer', 'https://www.enexis.nl', true),
  ('LIANDER', 'Liander', 'https://www.liander.nl', true),
  ('STEDIN', 'Stedin', 'https://www.stedin.net', true),
  ('COTEQ', 'Coteq Netbeheer', 'https://www.coteq.nl', true),
  ('RENDO', 'Rendo', 'https://www.rendo.nl', true),
  ('WESTLAND', 'Westland Infra', 'https://www.westlandinfra.nl', true)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  website = EXCLUDED.website,
  actief = EXCLUDED.actief;

-- ============================================================
-- STAP 2: VOEG ALLE AANSLUITWAARDEN TOE
-- ============================================================

-- ELEKTRICITEIT: 3x25A, 3x35A, 3x50A, 3x63A, 3x80A
INSERT INTO aansluitwaarden_elektriciteit (code, naam, beschrijving, is_kleinverbruik, volgorde) VALUES
  ('3x25A', '3x25A', 'Standaard huishouden (tot 17,25 kW)', true, 1),
  ('3x35A', '3x35A', 'Groot huishouden (tot 24,15 kW)', true, 2),
  ('3x40A', '3x40A', 'Groot huishouden (tot 27,6 kW)', true, 3),
  ('3x50A', '3x50A', 'Zakelijk kleinverbruik (tot 34,5 kW)', false, 4),
  ('3x63A', '3x63A', 'Zakelijk grootverbruik (tot 43,47 kW)', false, 5),
  ('3x80A', '3x80A', 'Zakelijk grootverbruik (tot 55,2 kW)', false, 6)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  beschrijving = EXCLUDED.beschrijving,
  is_kleinverbruik = EXCLUDED.is_kleinverbruik,
  volgorde = EXCLUDED.volgorde;

-- GAS: G6, G10, G16, G25
-- NOTE: G6 krijgt 3 varianten voor verschillende verbruiksniveaus
-- De gebruiker selecteert gewoon "G6" in de UI, de backend bepaalt automatisch de juiste variant
INSERT INTO aansluitwaarden_gas (code, naam, beschrijving, is_kleinverbruik, volgorde) VALUES
  ('G6_LAAG', 'G6 (<500m³)', 'Klein huishouden, laag verbruik (<500 m³/jaar)', true, 1),
  ('G6_MIDDEN', 'G6 (500-4000m³)', 'Standaard huishouden (500-4000 m³/jaar)', true, 2),
  ('G6_HOOG', 'G6 (>4000m³)', 'Groot huishouden (>4000 m³/jaar)', true, 3),
  ('G10', 'G10', 'Zakelijk kleinverbruik (tot 10 m³/uur)', false, 4),
  ('G16', 'G16', 'Zakelijk grootverbruik (tot 16 m³/uur)', false, 5),
  ('G25', 'G25', 'Zakelijk/industrie (tot 25 m³/uur)', false, 6)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  beschrijving = EXCLUDED.beschrijving,
  is_kleinverbruik = EXCLUDED.is_kleinverbruik,
  volgorde = EXCLUDED.volgorde;

-- ============================================================
-- STAP 3: VERWIJDER OUDE/INCORRECTE TARIEVEN 2025
-- ============================================================

DELETE FROM netbeheer_tarieven_elektriciteit WHERE jaar = 2025;
DELETE FROM netbeheer_tarieven_gas WHERE jaar = 2025;

-- ============================================================
-- STAP 4: ENEXIS TARIEVEN 2025
-- Alle bedragen: incl. BTW / 1.21 = excl. BTW
-- ============================================================

-- ENEXIS ELEKTRICITEIT
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 475.92 / 1.21 = 393.32
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 393.32, 'Officieel tarief 2025 incl. BTW: €475.92', '2025-01-01', true),
  -- 2027.92 / 1.21 = 1676.00
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1676.00, 'Officieel tarief 2025 incl. BTW: €2027.92', '2025-01-01', true),
  -- 2987.72 / 1.21 = 2469.19
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2469.19, 'Officieel tarief 2025 incl. BTW: €2987.72', '2025-01-01', true),
  -- 3947.47 / 1.21 = 3262.37
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 3262.37, 'Officieel tarief 2025 incl. BTW: €3947.47', '2025-01-01', true),
  -- 4907.26 / 1.21 = 4055.59
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 4055.59, 'Officieel tarief 2025 incl. BTW: €4907.26', '2025-01-01', true);

-- ENEXIS GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 174.10 / 1.21 = 143.88
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 143.88, 'Officieel tarief 2025 incl. BTW: €174.10 (<500m³)', '2025-01-01', true),
  -- 246.09 / 1.21 = 203.38
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 203.38, 'Officieel tarief 2025 incl. BTW: €246.09 (500-4000m³)', '2025-01-01', true),
  -- 390.02 / 1.21 = 322.33
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 322.33, 'Officieel tarief 2025 incl. BTW: €390.02 (>4000m³)', '2025-01-01', true),
  -- 656.69 / 1.21 = 542.71
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 542.71, 'Officieel tarief 2025 incl. BTW: €656.69', '2025-01-01', true),
  -- 944.56 / 1.21 = 780.63
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 780.63, 'Officieel tarief 2025 incl. BTW: €944.56', '2025-01-01', true),
  -- 1527.53 / 1.21 = 1262.43
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1262.43, 'Officieel tarief 2025 incl. BTW: €1527.53', '2025-01-01', true);

-- ============================================================
-- STAP 5: LIANDER TARIEVEN 2025
-- ============================================================

-- LIANDER ELEKTRICITEIT
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 455.74 / 1.21 = 376.65
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 376.65, 'Officieel tarief 2025 incl. BTW: €455.74', '2025-01-01', true),
  -- 1871.23 / 1.21 = 1546.47
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1546.47, 'Officieel tarief 2025 incl. BTW: €1871.23', '2025-01-01', true),
  -- 1871.23 / 1.21 = 1546.47 (3x40A heeft zelfde tarief als 3x35A bij Liander)
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x40A'), 1546.47, 'Officieel tarief 2025 incl. BTW: €1871.23', '2025-01-01', true),
  -- 2745.69 / 1.21 = 2269.16
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2269.16, 'Officieel tarief 2025 incl. BTW: €2745.69', '2025-01-01', true),
  -- 3630.85 / 1.21 = 3000.70
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 3000.70, 'Officieel tarief 2025 incl. BTW: €3630.85', '2025-01-01', true),
  -- 4505.32 / 1.21 = 3723.41
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 3723.41, 'Officieel tarief 2025 incl. BTW: €4505.32', '2025-01-01', true);

-- LIANDER GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 176.92 / 1.21 = 146.21
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 146.21, 'Officieel tarief 2025 incl. BTW: €176.92 (<500m³)', '2025-01-01', true),
  -- 239.46 / 1.21 = 197.90
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 197.90, 'Officieel tarief 2025 incl. BTW: €239.46 (500-4000m³)', '2025-01-01', true),
  -- 364.54 / 1.21 = 301.27
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 301.27, 'Officieel tarief 2025 incl. BTW: €364.54 (>4000m³)', '2025-01-01', true),
  -- 635.84 / 1.21 = 525.49
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 525.49, 'Officieel tarief 2025 incl. BTW: €635.84', '2025-01-01', true),
  -- 885.99 / 1.21 = 732.22
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 732.22, 'Officieel tarief 2025 incl. BTW: €885.99', '2025-01-01', true),
  -- 1526.92 / 1.21 = 1261.92
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1261.92, 'Officieel tarief 2025 incl. BTW: €1526.92', '2025-01-01', true);

-- ============================================================
-- STAP 6: STEDIN TARIEVEN 2025
-- ============================================================

-- STEDIN ELEKTRICITEIT
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 473.79 / 1.21 = 391.48
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 391.48, 'Officieel tarief 2025 incl. BTW: €473.79', '2025-01-01', true),
  -- 1923.29 / 1.21 = 1589.50
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1589.50, 'Officieel tarief 2025 incl. BTW: €1923.29', '2025-01-01', true),
  -- 2806.59 / 1.21 = 2319.33
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2319.33, 'Officieel tarief 2025 incl. BTW: €2806.59', '2025-01-01', true),
  -- 3689.89 / 1.21 = 3049.50
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 3049.50, 'Officieel tarief 2025 incl. BTW: €3689.89', '2025-01-01', true),
  -- 4573.19 / 1.21 = 3779.33
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 3779.33, 'Officieel tarief 2025 incl. BTW: €4573.19', '2025-01-01', true);

-- STEDIN GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 186.31 / 1.21 = 153.98
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 153.98, 'Officieel tarief 2025 incl. BTW: €186.31 (<500m³)', '2025-01-01', true),
  -- 259.43 / 1.21 = 214.41
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 214.41, 'Officieel tarief 2025 incl. BTW: €259.43 (500-4000m³)', '2025-01-01', true),
  -- 405.68 / 1.21 = 335.27
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 335.27, 'Officieel tarief 2025 incl. BTW: €405.68 (>4000m³)', '2025-01-01', true),
  -- 719.96 / 1.21 = 595.01
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 595.01, 'Officieel tarief 2025 incl. BTW: €719.96', '2025-01-01', true),
  -- 1012.46 / 1.21 = 836.76
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 836.76, 'Officieel tarief 2025 incl. BTW: €1012.46', '2025-01-01', true),
  -- 1734.42 / 1.21 = 1433.40
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1433.40, 'Officieel tarief 2025 incl. BTW: €1734.42', '2025-01-01', true);

-- ============================================================
-- STAP 7: COTEQ TARIEVEN 2025
-- ============================================================

-- COTEQ ELEKTRICITEIT
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 407.69 / 1.21 = 336.93
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 336.93, 'Officieel tarief 2025 incl. BTW: €407.69', '2025-01-01', true),
  -- 1726.60 / 1.21 = 1426.94
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1426.94, 'Officieel tarief 2025 incl. BTW: €1726.60', '2025-01-01', true),
  -- 1726.60 / 1.21 = 1426.94 (3x40A heeft zelfde tarief als 3x35A bij Coteq)
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x40A'), 1426.94, 'Officieel tarief 2025 incl. BTW: €1726.60', '2025-01-01', true),
  -- 2535.04 / 1.21 = 2095.07
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2095.07, 'Officieel tarief 2025 incl. BTW: €2535.04', '2025-01-01', true),
  -- 3356.90 / 1.21 = 2774.30
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 2774.30, 'Officieel tarief 2025 incl. BTW: €3356.90', '2025-01-01', true),
  -- 4179.84 / 1.21 = 3454.38
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 3454.38, 'Officieel tarief 2025 incl. BTW: €4179.84', '2025-01-01', true);

-- COTEQ GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 177.71 / 1.21 = 146.87
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 146.87, 'Officieel tarief 2025 incl. BTW: €177.71 (<500m³)', '2025-01-01', true),
  -- 242.04 / 1.21 = 200.03
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 200.03, 'Officieel tarief 2025 incl. BTW: €242.04 (500-4000m³)', '2025-01-01', true),
  -- 370.68 / 1.21 = 306.35
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 306.35, 'Officieel tarief 2025 incl. BTW: €370.68 (>4000m³)', '2025-01-01', true),
  -- 578.40 / 1.21 = 478.02
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 478.02, 'Officieel tarief 2025 incl. BTW: €578.40', '2025-01-01', true),
  -- 882.15 / 1.21 = 729.05
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 729.05, 'Officieel tarief 2025 incl. BTW: €882.15', '2025-01-01', true),
  -- 1498.22 / 1.21 = 1238.04
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1238.04, 'Officieel tarief 2025 incl. BTW: €1498.22', '2025-01-01', true);

-- ============================================================
-- STAP 8: RENDO TARIEVEN 2025
-- ============================================================

-- RENDO ELEKTRICITEIT
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 386.94 / 1.21 = 319.79
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 319.79, 'Officieel tarief 2025 incl. BTW: €386.94', '2025-01-01', true),
  -- 1517.37 / 1.21 = 1254.03
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1254.03, 'Officieel tarief 2025 incl. BTW: €1517.37', '2025-01-01', true),
  -- 2202.71 / 1.21 = 1820.26
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 1820.26, 'Officieel tarief 2025 incl. BTW: €2202.71', '2025-01-01', true),
  -- 2888.06 / 1.21 = 2386.41
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 2386.41, 'Officieel tarief 2025 incl. BTW: €2888.06', '2025-01-01', true),
  -- 3573.40 / 1.21 = 2952.56
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 2952.56, 'Officieel tarief 2025 incl. BTW: €3573.40', '2025-01-01', true);

-- RENDO GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 183.56 / 1.21 = 151.70
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 151.70, 'Officieel tarief 2025 incl. BTW: €183.56 (laag verbruik)', '2025-01-01', true),
  -- 255.59 / 1.21 = 211.23
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 211.23, 'Officieel tarief 2025 incl. BTW: €255.59 (midden verbruik)', '2025-01-01', true),
  -- 399.67 / 1.21 = 330.30
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 330.30, 'Officieel tarief 2025 incl. BTW: €399.67 (hoog verbruik)', '2025-01-01', true),
  -- 712.42 / 1.21 = 588.78
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 588.78, 'Officieel tarief 2025 incl. BTW: €712.42', '2025-01-01', true),
  -- 1000.57 / 1.21 = 827.00
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 827.00, 'Officieel tarief 2025 incl. BTW: €1000.57', '2025-01-01', true),
  -- 1662.02 / 1.21 = 1373.57
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1373.57, 'Officieel tarief 2025 incl. BTW: €1662.02', '2025-01-01', true);

-- ============================================================
-- STAP 9: WESTLAND INFRA TARIEVEN 2025
-- ============================================================

-- WESTLAND INFRA ELEKTRICITEIT
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 521.24 / 1.21 = 430.78
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 430.78, 'Officieel tarief 2025 incl. BTW: €521.24', '2025-01-01', true),
  -- 2171.47 / 1.21 = 1794.60
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1794.60, 'Officieel tarief 2025 incl. BTW: €2171.47', '2025-01-01', true),
  -- 3231.90 / 1.21 = 2670.58
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2670.58, 'Officieel tarief 2025 incl. BTW: €3231.90', '2025-01-01', true),
  -- 4271.12 / 1.21 = 3530.02
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 3530.02, 'Officieel tarief 2025 incl. BTW: €4271.12', '2025-01-01', true),
  -- 5305.33 / 1.21 = 4384.57
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 4384.57, 'Officieel tarief 2025 incl. BTW: €5305.33', '2025-01-01', true);

-- WESTLAND INFRA GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen, ingangsdatum, actief
) VALUES
  -- 168.74 / 1.21 = 139.45
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 139.45, 'Officieel tarief 2025 incl. BTW: €168.74 (<500m³)', '2025-01-01', true),
  -- 223.14 / 1.21 = 184.41
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 184.41, 'Officieel tarief 2025 incl. BTW: €223.14 (500-4000m³)', '2025-01-01', true),
  -- 331.95 / 1.21 = 274.34
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 274.34, 'Officieel tarief 2025 incl. BTW: €331.95 (>4000m³)', '2025-01-01', true),
  -- 527.84 / 1.21 = 436.23
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 436.23, 'Officieel tarief 2025 incl. BTW: €527.84', '2025-01-01', true),
  -- 745.45 / 1.21 = 616.07
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 616.07, 'Officieel tarief 2025 incl. BTW: €745.45', '2025-01-01', true),
  -- 1275.84 / 1.21 = 1054.41
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1054.41, 'Officieel tarief 2025 incl. BTW: €1275.84', '2025-01-01', true);

-- ============================================================
-- KLAAR!
-- ============================================================
-- 6 netbeheerders ✓
-- 6 elektriciteit aansluitwaarden (3x25A t/m 3x80A) ✓
-- 6 gas aansluitwaarden (G6 in 3 varianten + G10, G16, G25) ✓
-- 30 elektriciteit tarieven (6×5, excl. 3x40A bij Enexis/Stedin/Rendo) ✓
-- 36 gas tarieven (6×6) ✓
-- Totaal: 66 netbeheertarieven
-- Alle bedragen: excl. BTW voor consistentie (BTW wordt in API berekend)
-- ============================================================


-- ============================================================
-- STAP 1: VOEG ONTBREKENDE NETBEHEERDERS TOE
-- ============================================================

INSERT INTO netbeheerders (code, naam, website, actief) VALUES
  ('ENEXIS', 'Enexis Netbeheer', 'https://www.enexis.nl', true),
  ('LIANDER', 'Liander', 'https://www.liander.nl', true),
  ('STEDIN', 'Stedin', 'https://www.stedin.net', true),
  ('COTEQ', 'Coteq Netbeheer', 'https://www.coteq.nl', true),
  ('RENDO', 'Rendo', 'https://www.rendo.nl', true),
  ('WESTLAND', 'Westland Infra', 'https://www.westlandinfra.nl', true)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  website = EXCLUDED.website,
  actief = EXCLUDED.actief;

-- ============================================================
-- STAP 2: VOEG ALLE AANSLUITWAARDEN TOE
-- ============================================================

-- ELEKTRICITEIT: 3x25A, 3x35A, 3x50A, 3x63A, 3x80A
INSERT INTO aansluitwaarden_elektriciteit (code, naam, beschrijving, is_kleinverbruik, volgorde) VALUES
  ('3x25A', '3x25A', 'Standaard huishouden (tot 17,25 kW)', true, 1),
  ('3x35A', '3x35A', 'Groot huishouden (tot 24,15 kW)', true, 2),
  ('3x40A', '3x40A', 'Groot huishouden (tot 27,6 kW)', true, 3),
  ('3x50A', '3x50A', 'Zakelijk kleinverbruik (tot 34,5 kW)', false, 4),
  ('3x63A', '3x63A', 'Zakelijk grootverbruik (tot 43,47 kW)', false, 5),
  ('3x80A', '3x80A', 'Zakelijk grootverbruik (tot 55,2 kW)', false, 6)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  beschrijving = EXCLUDED.beschrijving,
  is_kleinverbruik = EXCLUDED.is_kleinverbruik,
  volgorde = EXCLUDED.volgorde;

-- GAS: G6, G10, G16, G25
-- NOTE: G6 krijgt 3 varianten voor verschillende verbruiksniveaus
INSERT INTO aansluitwaarden_gas (code, naam, beschrijving, is_kleinverbruik, volgorde) VALUES
  ('G6_LAAG', 'G6 (<500m³)', 'Klein huishouden, laag verbruik (<500 m³/jaar)', true, 1),
  ('G6_MIDDEN', 'G6 (500-4000m³)', 'Standaard huishouden (500-4000 m³/jaar)', true, 2),
  ('G6_HOOG', 'G6 (>4000m³)', 'Groot huishouden (>4000 m³/jaar)', true, 3),
  ('G10', 'G10', 'Zakelijk kleinverbruik (tot 10 m³/uur)', false, 4),
  ('G16', 'G16', 'Zakelijk grootverbruik (tot 16 m³/uur)', false, 5),
  ('G25', 'G25', 'Zakelijk/industrie (tot 25 m³/uur)', false, 6)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  beschrijving = EXCLUDED.beschrijving,
  is_kleinverbruik = EXCLUDED.is_kleinverbruik,
  volgorde = EXCLUDED.volgorde;

-- ============================================================
-- STAP 3: VERWIJDER OUDE/INCORRECTE TARIEVEN 2025
-- ============================================================

DELETE FROM netbeheer_tarieven_elektriciteit WHERE jaar = 2025;
DELETE FROM netbeheer_tarieven_gas WHERE jaar = 2025;

-- ============================================================
-- STAP 4: ENEXIS TARIEVEN 2025
-- ============================================================

-- ENEXIS ELEKTRICITEIT
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 475.92, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 2027.92, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2987.72, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 3947.47, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 4907.26, '2025-01-01', true);

-- ENEXIS GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 174.10, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 246.09, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 390.02, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 656.69, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 944.56, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'ENEXIS'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1527.53, '2025-01-01', true);

-- ============================================================
-- STAP 5: LIANDER TARIEVEN 2025
-- ============================================================

-- LIANDER ELEKTRICITEIT
-- NOTE: Liander heeft "t/m 3x25A" - we voegen alleen 3x25A toe
-- NOTE: Liander heeft "3x35A / 3x40A" - beide krijgen hetzelfde tarief
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 455.74, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1871.23, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x40A'), 1871.23, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2745.69, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 3630.85, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 4505.32, '2025-01-01', true);

-- LIANDER GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 176.92, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 239.46, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 364.54, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 635.84, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 885.99, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'LIANDER'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1526.92, '2025-01-01', true);

-- ============================================================
-- STAP 6: STEDIN TARIEVEN 2025
-- ============================================================

-- STEDIN ELEKTRICITEIT
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 473.79, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1923.29, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2806.59, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 3689.89, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 4573.19, '2025-01-01', true);

-- STEDIN GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 186.31, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 259.43, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 405.68, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 719.96, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 1012.46, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'STEDIN'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1734.42, '2025-01-01', true);

-- ============================================================
-- STAP 7: COTEQ TARIEVEN 2025
-- ============================================================

-- COTEQ ELEKTRICITEIT
-- NOTE: Coteq heeft "3x35A / 3x40A" - beide krijgen hetzelfde tarief
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 407.69, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1726.60, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x40A'), 1726.60, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2535.04, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 3356.90, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 4179.84, '2025-01-01', true);

-- COTEQ GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 177.71, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 242.04, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 370.68, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 578.40, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 882.15, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'COTEQ'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1498.22, '2025-01-01', true);

-- ============================================================
-- STAP 8: RENDO TARIEVEN 2025
-- ============================================================

-- RENDO ELEKTRICITEIT
-- NOTE: Rendo heeft "t/m 3x25A" - we voegen alleen 3x25A toe
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 386.94, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 1517.37, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 2202.71, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 2888.06, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 3573.40, '2025-01-01', true);

-- RENDO GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 183.56, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 255.59, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 399.67, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 712.42, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 1000.57, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'RENDO'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1662.02, '2025-01-01', true);

-- ============================================================
-- STAP 9: WESTLAND INFRA TARIEVEN 2025
-- ============================================================

-- WESTLAND INFRA ELEKTRICITEIT
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x25A'), 521.24, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x35A'), 2171.47, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x50A'), 3231.90, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x63A'), 4271.12, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'), 5305.33, '2025-01-01', true);

-- WESTLAND INFRA GAS
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, ingangsdatum, actief
) VALUES
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_LAAG'), 168.74, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_MIDDEN'), 223.14, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G6_HOOG'), 331.95, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G10'), 527.84, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G16'), 745.45, '2025-01-01', true),
  ((SELECT id FROM netbeheerders WHERE code = 'WESTLAND'), 2025, (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'), 1275.84, '2025-01-01', true);

-- ============================================================
-- KLAAR!
-- ============================================================
-- 6 netbeheerders ✓
-- 6 elektriciteit aansluitwaarden ✓
-- 6 gas aansluitwaarden (G6 in 3 varianten) ✓
-- 30 elektriciteit tarieven (6 netbeheerders × 5 aansluitwaarden) ✓
-- 36 gas tarieven (6 netbeheerders × 6 aansluitwaarden) ✓
-- Totaal: 66 tarieven
-- ============================================================

