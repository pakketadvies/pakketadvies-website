-- Combined migration for easier execution
-- This combines schema + seed into one file

-- ============================================================
-- SCHEMA
-- ============================================================

-- NETBEHEERDERS
CREATE TABLE IF NOT EXISTS netbeheerders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  naam VARCHAR(100) NOT NULL,
  website VARCHAR(255),
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AANSLUITWAARDEN ELEKTRICITEIT
CREATE TABLE IF NOT EXISTS aansluitwaarden_elektriciteit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  naam VARCHAR(100) NOT NULL,
  beschrijving TEXT,
  is_kleinverbruik BOOLEAN DEFAULT true,
  volgorde INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AANSLUITWAARDEN GAS
CREATE TABLE IF NOT EXISTS aansluitwaarden_gas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  naam VARCHAR(100) NOT NULL,
  beschrijving TEXT,
  is_kleinverbruik BOOLEAN DEFAULT true,
  volgorde INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POSTCODE MAPPING
CREATE TABLE IF NOT EXISTS postcode_netbeheerders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postcode_van VARCHAR(6) NOT NULL,
  postcode_tot VARCHAR(6) NOT NULL,
  netbeheerder_id UUID NOT NULL REFERENCES netbeheerders(id) ON DELETE CASCADE,
  regio_naam VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_postcode_format CHECK (
    postcode_van ~ '^[0-9]{4}[A-Z]{2}$' AND 
    postcode_tot ~ '^[0-9]{4}[A-Z]{2}$'
  )
);

-- OVERHEIDSTARIEVEN
CREATE TABLE IF NOT EXISTS tarieven_overheid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jaar INTEGER NOT NULL,
  
  eb_elektriciteit_kv_schijf1_max INTEGER,
  eb_elektriciteit_kv_schijf1 DECIMAL(10, 5),
  eb_elektriciteit_kv_schijf2 DECIMAL(10, 5),
  
  eb_elektriciteit_gv_schijf1_max INTEGER,
  eb_elektriciteit_gv_schijf1 DECIMAL(10, 5),
  eb_elektriciteit_gv_schijf2_max INTEGER,
  eb_elektriciteit_gv_schijf2 DECIMAL(10, 5),
  eb_elektriciteit_gv_schijf3_max INTEGER,
  eb_elektriciteit_gv_schijf3 DECIMAL(10, 5),
  eb_elektriciteit_gv_schijf4 DECIMAL(10, 5),
  
  eb_gas_schijf1_max INTEGER,
  eb_gas_schijf1 DECIMAL(10, 5),
  eb_gas_schijf2 DECIMAL(10, 5),
  
  ode_elektriciteit DECIMAL(10, 5),
  ode_gas DECIMAL(10, 5),
  
  btw_percentage DECIMAL(5, 2),
  
  vermindering_eb_elektriciteit DECIMAL(10, 2),
  vermindering_eb_gas DECIMAL(10, 2),
  
  gas_omrekenfactor DECIMAL(10, 4) DEFAULT 10.3158,
  
  ingangsdatum DATE NOT NULL,
  einddatum DATE,
  actief BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_jaar_tarieven UNIQUE (jaar)
);

-- NETBEHEERTARIEVEN ELEKTRICITEIT
CREATE TABLE IF NOT EXISTS netbeheer_tarieven_elektriciteit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  netbeheerder_id UUID NOT NULL REFERENCES netbeheerders(id) ON DELETE CASCADE,
  jaar INTEGER NOT NULL,
  aansluitwaarde_id UUID NOT NULL REFERENCES aansluitwaarden_elektriciteit(id) ON DELETE CASCADE,
  
  all_in_tarief_jaar DECIMAL(10, 2),
  
  vastrecht_jaar DECIMAL(10, 2),
  transport_normaal_kwh DECIMAL(10, 5),
  transport_dal_kwh DECIMAL(10, 5),
  systeemdiensten_jaar DECIMAL(10, 2),
  capaciteitstarief_kwh DECIMAL(10, 5),
  capaciteitstarief_drempel_kwh INTEGER,
  congestietarief_kwh DECIMAL(10, 5),
  meetkosten_slim_jaar DECIMAL(10, 2),
  meetkosten_traditioneel_jaar DECIMAL(10, 2),
  
  opmerkingen TEXT,
  ingangsdatum DATE NOT NULL,
  einddatum DATE,
  actief BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_netbeheer_elektriciteit UNIQUE (netbeheerder_id, jaar, aansluitwaarde_id)
);

-- NETBEHEERTARIEVEN GAS
CREATE TABLE IF NOT EXISTS netbeheer_tarieven_gas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  netbeheerder_id UUID NOT NULL REFERENCES netbeheerders(id) ON DELETE CASCADE,
  jaar INTEGER NOT NULL,
  aansluitwaarde_id UUID NOT NULL REFERENCES aansluitwaarden_gas(id) ON DELETE CASCADE,
  
  all_in_tarief_jaar DECIMAL(10, 2),
  
  vastrecht_jaar DECIMAL(10, 2),
  transport_m3 DECIMAL(10, 5),
  systeemdiensten_jaar DECIMAL(10, 2),
  meetkosten_slim_jaar DECIMAL(10, 2),
  meetkosten_traditioneel_jaar DECIMAL(10, 2),
  
  opmerkingen TEXT,
  ingangsdatum DATE NOT NULL,
  einddatum DATE,
  actief BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_netbeheer_gas UNIQUE (netbeheerder_id, jaar, aansluitwaarde_id)
);

-- RLS POLICIES
ALTER TABLE netbeheerders ENABLE ROW LEVEL SECURITY;
ALTER TABLE aansluitwaarden_elektriciteit ENABLE ROW LEVEL SECURITY;
ALTER TABLE aansluitwaarden_gas ENABLE ROW LEVEL SECURITY;
ALTER TABLE postcode_netbeheerders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarieven_overheid ENABLE ROW LEVEL SECURITY;
ALTER TABLE netbeheer_tarieven_elektriciteit ENABLE ROW LEVEL SECURITY;
ALTER TABLE netbeheer_tarieven_gas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON netbeheerders;
DROP POLICY IF EXISTS "Enable read access for all users" ON aansluitwaarden_elektriciteit;
DROP POLICY IF EXISTS "Enable read access for all users" ON aansluitwaarden_gas;
DROP POLICY IF EXISTS "Enable read access for all users" ON postcode_netbeheerders;
DROP POLICY IF EXISTS "Enable read access for all users" ON tarieven_overheid;
DROP POLICY IF EXISTS "Enable read access for all users" ON netbeheer_tarieven_elektriciteit;
DROP POLICY IF EXISTS "Enable read access for all users" ON netbeheer_tarieven_gas;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON netbeheerders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON aansluitwaarden_elektriciteit FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON aansluitwaarden_gas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON postcode_netbeheerders FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tarieven_overheid FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON netbeheer_tarieven_elektriciteit FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON netbeheer_tarieven_gas FOR SELECT USING (true);

-- ============================================================
-- SEED DATA 2025 (100% OFFICIEEL UIT SEPA OFFERTE)
-- ============================================================

-- Netbeheerders
INSERT INTO netbeheerders (code, naam, website, actief) VALUES
  ('ENEXIS', 'Enexis Netbeheer', 'https://www.enexis.nl', true),
  ('LIANDER', 'Liander', 'https://www.liander.nl', true),
  ('STEDIN', 'Stedin', 'https://www.stedin.net', true)
ON CONFLICT (code) DO UPDATE SET
  naam = EXCLUDED.naam,
  website = EXCLUDED.website;

-- Aansluitwaarden Elektriciteit
INSERT INTO aansluitwaarden_elektriciteit (code, naam, beschrijving, is_kleinverbruik, volgorde) VALUES
  ('3x25A', '3x25A', 'Standaard huishouden (tot 17,25 kW)', true, 1),
  ('3x80A', '3x80A', 'Zakelijk grootverbruik (tot 55,2 kW)', false, 2)
ON CONFLICT (code) DO NOTHING;

-- Aansluitwaarden Gas
INSERT INTO aansluitwaarden_gas (code, naam, beschrijving, is_kleinverbruik, volgorde) VALUES
  ('G4', 'G4', 'Klein huishouden (tot 4 m³/uur)', true, 1),
  ('G25', 'G25', 'Zakelijk/industrie (tot 25 m³/uur)', false, 2)
ON CONFLICT (code) DO NOTHING;

-- Overheidstarieven 2025 (UIT SEPA OFFERTE)
INSERT INTO tarieven_overheid (
  jaar,
  eb_elektriciteit_kv_schijf1_max, eb_elektriciteit_kv_schijf1, eb_elektriciteit_kv_schijf2,
  eb_elektriciteit_gv_schijf1_max, eb_elektriciteit_gv_schijf1,
  eb_elektriciteit_gv_schijf2_max, eb_elektriciteit_gv_schijf2,
  eb_elektriciteit_gv_schijf3_max, eb_elektriciteit_gv_schijf3,
  eb_elektriciteit_gv_schijf4,
  eb_gas_schijf1_max, eb_gas_schijf1, eb_gas_schijf2,
  ode_elektriciteit, ode_gas,
  btw_percentage,
  vermindering_eb_elektriciteit, vermindering_eb_gas,
  ingangsdatum, einddatum, actief
) VALUES (
  2025,
  10000, 0.14271, 0.03868,
  2900, 0.10154, 10000, 0.10154, 50000, 0.06937, 0.03868,
  1000, 0.57816, 0.57816,
  0.00000, 0.00000,
  21.00,
  524.95, 0.00,
  '2025-01-01', '2025-12-31', true
)
ON CONFLICT (jaar) DO UPDATE SET
  eb_elektriciteit_gv_schijf1_max = EXCLUDED.eb_elektriciteit_gv_schijf1_max,
  eb_elektriciteit_gv_schijf1 = EXCLUDED.eb_elektriciteit_gv_schijf1,
  eb_elektriciteit_gv_schijf2_max = EXCLUDED.eb_elektriciteit_gv_schijf2_max,
  eb_elektriciteit_gv_schijf2 = EXCLUDED.eb_elektriciteit_gv_schijf2,
  eb_elektriciteit_gv_schijf3_max = EXCLUDED.eb_elektriciteit_gv_schijf3_max,
  eb_elektriciteit_gv_schijf3 = EXCLUDED.eb_elektriciteit_gv_schijf3,
  eb_elektriciteit_gv_schijf4 = EXCLUDED.eb_elektriciteit_gv_schijf4,
  eb_gas_schijf1 = EXCLUDED.eb_gas_schijf1,
  eb_gas_schijf2 = EXCLUDED.eb_gas_schijf2,
  btw_percentage = EXCLUDED.btw_percentage,
  vermindering_eb_elektriciteit = EXCLUDED.vermindering_eb_elektriciteit;

-- Netbeheertarieven Enexis 2025 (UIT SEPA OFFERTE)
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen,
  ingangsdatum, einddatum, actief
) VALUES (
  (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'),
  2025,
  (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'),
  4055.59,
  'Bron: Sepa Green offerte 20-11-2025',
  '2025-01-01', '2025-12-31', true
)
ON CONFLICT (netbeheerder_id, jaar, aansluitwaarde_id) DO UPDATE SET
  all_in_tarief_jaar = EXCLUDED.all_in_tarief_jaar;

INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id, jaar, aansluitwaarde_id,
  all_in_tarief_jaar, opmerkingen,
  ingangsdatum, einddatum, actief
) VALUES (
  (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'),
  2025,
  (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'),
  1262.43,
  'Bron: Sepa Green offerte 20-11-2025',
  '2025-01-01', '2025-12-31', true
)
ON CONFLICT (netbeheerder_id, jaar, aansluitwaarde_id) DO UPDATE SET
  all_in_tarief_jaar = EXCLUDED.all_in_tarief_jaar;

