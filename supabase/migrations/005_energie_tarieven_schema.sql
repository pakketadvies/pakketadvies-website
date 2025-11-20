-- =====================================================
-- ENERGIE TARIEVEN & BEREKENING SCHEMA
-- Gebaseerd op Sepa Green offerte analyse
-- =====================================================

-- ============================================================
-- 1. NETBEHEERDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS netbeheerders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- ENEXIS, LIANDER, STEDIN, etc.
  naam VARCHAR(100) NOT NULL,
  website VARCHAR(255),
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. AANSLUITWAARDEN ELEKTRICITEIT
-- ============================================================
CREATE TABLE IF NOT EXISTS aansluitwaarden_elektriciteit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL, -- 1x25A, 3x25A, 3x35A, 3x80A, etc.
  naam VARCHAR(100) NOT NULL,
  beschrijving TEXT,
  is_kleinverbruik BOOLEAN DEFAULT true, -- false voor grootverbruik
  volgorde INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. AANSLUITWAARDEN GAS
-- ============================================================
CREATE TABLE IF NOT EXISTS aansluitwaarden_gas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL, -- G4, G6, G10, G16, G25, etc.
  naam VARCHAR(100) NOT NULL,
  beschrijving TEXT,
  is_kleinverbruik BOOLEAN DEFAULT true,
  volgorde INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. POSTCODE MAPPING (Postcode -> Netbeheerder)
-- ============================================================
CREATE TABLE IF NOT EXISTS postcode_netbeheerders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postcode_van VARCHAR(6) NOT NULL, -- Bijv. 9700AA
  postcode_tot VARCHAR(6) NOT NULL, -- Bijv. 9799ZZ
  netbeheerder_id UUID NOT NULL REFERENCES netbeheerders(id) ON DELETE CASCADE,
  regio_naam VARCHAR(100), -- Optioneel: Groningen, Amsterdam, Rotterdam
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT check_postcode_format CHECK (
    postcode_van ~ '^[0-9]{4}[A-Z]{2}$' AND 
    postcode_tot ~ '^[0-9]{4}[A-Z]{2}$'
  )
);

CREATE INDEX idx_postcode_netbeheerders_range ON postcode_netbeheerders(postcode_van, postcode_tot);

-- ============================================================
-- 5. OVERHEIDSTARIEVEN (Energiebelasting, ODE, BTW)
-- ============================================================
CREATE TABLE IF NOT EXISTS tarieven_overheid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jaar INTEGER NOT NULL,
  
  -- ENERGIEBELASTING ELEKTRICITEIT (Kleinverbruik)
  eb_elektriciteit_kv_schijf1_max INTEGER, -- Bijv. 10000 kWh
  eb_elektriciteit_kv_schijf1 DECIMAL(10, 5), -- EUR/kWh
  eb_elektriciteit_kv_schijf2 DECIMAL(10, 5), -- EUR/kWh (>schijf1_max)
  
  -- ENERGIEBELASTING ELEKTRICITEIT (Grootverbruik - 4 schijven zoals Sepa)
  eb_elektriciteit_gv_schijf1_max INTEGER, -- Bijv. 2900 kWh
  eb_elektriciteit_gv_schijf1 DECIMAL(10, 5),
  eb_elektriciteit_gv_schijf2_max INTEGER, -- Bijv. 10000 kWh
  eb_elektriciteit_gv_schijf2 DECIMAL(10, 5),
  eb_elektriciteit_gv_schijf3_max INTEGER, -- Bijv. 50000 kWh
  eb_elektriciteit_gv_schijf3 DECIMAL(10, 5),
  eb_elektriciteit_gv_schijf4 DECIMAL(10, 5), -- >schijf3_max
  
  -- ENERGIEBELASTING GAS
  eb_gas_schijf1_max INTEGER, -- Bijv. 170000 kWh (of m³ via omrekenfactor)
  eb_gas_schijf1 DECIMAL(10, 5), -- EUR/m³
  eb_gas_schijf2 DECIMAL(10, 5), -- EUR/m³ (>schijf1_max)
  
  -- ODE (Opslag Duurzame Energie)
  ode_elektriciteit DECIMAL(10, 5), -- EUR/kWh
  ode_gas DECIMAL(10, 5), -- EUR/m³
  
  -- BTW
  btw_percentage DECIMAL(5, 2), -- Bijv. 21.00
  
  -- VERMINDERING ENERGIEBELASTING
  vermindering_eb_elektriciteit DECIMAL(10, 2), -- Bijv. 524.95 EUR/jaar
  vermindering_eb_gas DECIMAL(10, 2), -- EUR/jaar
  
  -- GAS OMREKENFACTOR (m³ naar kWh, standaard ~10.3158)
  gas_omrekenfactor DECIMAL(10, 4) DEFAULT 10.3158,
  
  ingangsdatum DATE NOT NULL,
  einddatum DATE,
  actief BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_jaar_tarieven UNIQUE (jaar)
);

CREATE INDEX idx_tarieven_overheid_jaar ON tarieven_overheid(jaar);

-- ============================================================
-- 6. NETBEHEERTARIEVEN ELEKTRICITEIT
-- ============================================================
CREATE TABLE IF NOT EXISTS netbeheer_tarieven_elektriciteit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  netbeheerder_id UUID NOT NULL REFERENCES netbeheerders(id) ON DELETE CASCADE,
  jaar INTEGER NOT NULL,
  aansluitwaarde_id UUID NOT NULL REFERENCES aansluitwaarden_elektriciteit(id) ON DELETE CASCADE,
  
  -- ALL-IN TARIEF (zoals Sepa: €4.055,59 voor 3x80A)
  all_in_tarief_jaar DECIMAL(10, 2), -- Indien netbeheerder 1 totaalbedrag geeft
  
  -- OF BREAKDOWN (indien beschikbaar)
  vastrecht_jaar DECIMAL(10, 2),
  transport_normaal_kwh DECIMAL(10, 5), -- EUR/kWh
  transport_dal_kwh DECIMAL(10, 5), -- EUR/kWh (indien dubbele meter)
  systeemdiensten_jaar DECIMAL(10, 2),
  capaciteitstarief_kwh DECIMAL(10, 5), -- Indien van toepassing
  capaciteitstarief_drempel_kwh INTEGER, -- Bijv. 50000 kWh
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

CREATE INDEX idx_netbeheer_elektriciteit_jaar ON netbeheer_tarieven_elektriciteit(jaar);
CREATE INDEX idx_netbeheer_elektriciteit_netbeheerder ON netbeheer_tarieven_elektriciteit(netbeheerder_id);

-- ============================================================
-- 7. NETBEHEERTARIEVEN GAS
-- ============================================================
CREATE TABLE IF NOT EXISTS netbeheer_tarieven_gas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  netbeheerder_id UUID NOT NULL REFERENCES netbeheerders(id) ON DELETE CASCADE,
  jaar INTEGER NOT NULL,
  aansluitwaarde_id UUID NOT NULL REFERENCES aansluitwaarden_gas(id) ON DELETE CASCADE,
  
  -- ALL-IN TARIEF (zoals Sepa: €1.262,43 voor G25)
  all_in_tarief_jaar DECIMAL(10, 2),
  
  -- OF BREAKDOWN
  vastrecht_jaar DECIMAL(10, 2),
  transport_m3 DECIMAL(10, 5), -- EUR/m³
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

CREATE INDEX idx_netbeheer_gas_jaar ON netbeheer_tarieven_gas(jaar);
CREATE INDEX idx_netbeheer_gas_netbeheerder ON netbeheer_tarieven_gas(netbeheerder_id);

-- ============================================================
-- 8. UPDATE VERBRUIKDATA TYPES (voor calculator)
-- ============================================================
-- We voegen aansluitwaarden toe aan de verbruikdata
-- Dit wordt niet in database opgeslagen, maar gebruikt in de calculator

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Netbeheerders
ALTER TABLE netbeheerders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON netbeheerders FOR SELECT USING (true);
CREATE POLICY "Admins can insert netbeheerders" ON netbeheerders FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update netbeheerders" ON netbeheerders FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete netbeheerders" ON netbeheerders FOR DELETE 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Aansluitwaarden Elektriciteit
ALTER TABLE aansluitwaarden_elektriciteit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON aansluitwaarden_elektriciteit FOR SELECT USING (true);
CREATE POLICY "Admins can manage aansluitwaarden_elektriciteit" ON aansluitwaarden_elektriciteit FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Aansluitwaarden Gas
ALTER TABLE aansluitwaarden_gas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON aansluitwaarden_gas FOR SELECT USING (true);
CREATE POLICY "Admins can manage aansluitwaarden_gas" ON aansluitwaarden_gas FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Postcode Netbeheerders
ALTER TABLE postcode_netbeheerders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON postcode_netbeheerders FOR SELECT USING (true);
CREATE POLICY "Admins can manage postcode_netbeheerders" ON postcode_netbeheerders FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tarieven Overheid
ALTER TABLE tarieven_overheid ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON tarieven_overheid FOR SELECT USING (true);
CREATE POLICY "Admins can manage tarieven_overheid" ON tarieven_overheid FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Netbeheer Tarieven Elektriciteit
ALTER TABLE netbeheer_tarieven_elektriciteit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON netbeheer_tarieven_elektriciteit FOR SELECT USING (true);
CREATE POLICY "Admins can manage netbeheer_tarieven_elektriciteit" ON netbeheer_tarieven_elektriciteit FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Netbeheer Tarieven Gas
ALTER TABLE netbeheer_tarieven_gas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON netbeheer_tarieven_gas FOR SELECT USING (true);
CREATE POLICY "Admins can manage netbeheer_tarieven_gas" ON netbeheer_tarieven_gas FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- TRIGGERS VOOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_netbeheerders_updated_at BEFORE UPDATE ON netbeheerders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aansluitwaarden_elektriciteit_updated_at BEFORE UPDATE ON aansluitwaarden_elektriciteit
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aansluitwaarden_gas_updated_at BEFORE UPDATE ON aansluitwaarden_gas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_postcode_netbeheerders_updated_at BEFORE UPDATE ON postcode_netbeheerders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarieven_overheid_updated_at BEFORE UPDATE ON tarieven_overheid
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_netbeheer_tarieven_elektriciteit_updated_at BEFORE UPDATE ON netbeheer_tarieven_elektriciteit
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_netbeheer_tarieven_gas_updated_at BEFORE UPDATE ON netbeheer_tarieven_gas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

