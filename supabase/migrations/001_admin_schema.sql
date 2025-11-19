-- PakketAdvies Admin System
-- Migration 001: Core schema voor leveranciers en contracten

-- Enable UUID extension (gen_random_uuid is built-in in Postgres 13+)
-- No need to create extension, we'll use gen_random_uuid() instead

-- =====================================================
-- USER PROFILES (voor admin role management)
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle role checks
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Trigger voor auto-create profile na signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- LEVERANCIERS
-- =====================================================
CREATE TABLE leveranciers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  actief BOOLEAN DEFAULT true,
  volgorde INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle queries
CREATE INDEX idx_leveranciers_actief ON leveranciers(actief);
CREATE INDEX idx_leveranciers_volgorde ON leveranciers(volgorde);

-- =====================================================
-- CONTRACTEN (basis tabel)
-- =====================================================
CREATE TABLE contracten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leverancier_id UUID NOT NULL REFERENCES leveranciers(id) ON DELETE CASCADE,
  naam VARCHAR(200) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('vast', 'dynamisch', 'maatwerk')),
  beschrijving TEXT,
  
  -- Display settings
  actief BOOLEAN DEFAULT true,
  aanbevolen BOOLEAN DEFAULT false,
  populair BOOLEAN DEFAULT false,
  volgorde INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contracten_leverancier ON contracten(leverancier_id);
CREATE INDEX idx_contracten_type ON contracten(type);
CREATE INDEX idx_contracten_actief ON contracten(actief);

-- =====================================================
-- CONTRACT DETAILS: VAST
-- =====================================================
CREATE TABLE contract_details_vast (
  contract_id UUID PRIMARY KEY REFERENCES contracten(id) ON DELETE CASCADE,
  looptijd INTEGER NOT NULL CHECK (looptijd IN (1, 2, 3, 5)),
  
  -- Tarieven (4 decimalen voor precisie)
  tarief_elektriciteit_normaal DECIMAL(6,4) NOT NULL,
  tarief_elektriciteit_dal DECIMAL(6,4),
  tarief_gas DECIMAL(6,4),
  vaste_kosten_maand DECIMAL(6,2),
  
  -- Eigenschappen
  groene_energie BOOLEAN DEFAULT false,
  prijsgarantie BOOLEAN DEFAULT false,
  opzegtermijn INTEGER DEFAULT 1,
  
  -- Display info
  voorwaarden TEXT[] DEFAULT '{}',
  bijzonderheden TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  aantal_reviews INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTRACT DETAILS: DYNAMISCH
-- =====================================================
CREATE TABLE contract_details_dynamisch (
  contract_id UUID PRIMARY KEY REFERENCES contracten(id) ON DELETE CASCADE,
  
  -- Opslagen bovenop marktprijs
  opslag_elektriciteit_normaal DECIMAL(6,4) NOT NULL,
  opslag_elektriciteit_dal DECIMAL(6,4),
  opslag_gas DECIMAL(6,4),
  vaste_kosten_maand DECIMAL(6,2),
  
  -- Index info
  index_naam VARCHAR(100) DEFAULT 'EPEX Day-Ahead',
  max_prijs_cap DECIMAL(6,4),
  
  -- Eigenschappen
  groene_energie BOOLEAN DEFAULT false,
  opzegtermijn INTEGER DEFAULT 1,
  
  -- Display info
  voorwaarden TEXT[] DEFAULT '{}',
  bijzonderheden TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  aantal_reviews INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTRACT DETAILS: MAATWERK
-- =====================================================
CREATE TABLE contract_details_maatwerk (
  contract_id UUID PRIMARY KEY REFERENCES contracten(id) ON DELETE CASCADE,
  
  -- Drempels
  min_verbruik_elektriciteit INTEGER,
  min_verbruik_gas INTEGER,
  
  -- Contact & info
  custom_tekst TEXT,
  contact_email TEXT,
  contact_telefoon TEXT,
  
  -- Display info
  voorwaarden TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  aantal_reviews INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE leveranciers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracten ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_details_vast ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_details_dynamisch ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_details_maatwerk ENABLE ROW LEVEL SECURITY;

-- Admin policies (full access for authenticated users with admin role)
CREATE POLICY "Admin full access leveranciers" ON leveranciers
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access contracten" ON contracten
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access contract_details_vast" ON contract_details_vast
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access contract_details_dynamisch" ON contract_details_dynamisch
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access contract_details_maatwerk" ON contract_details_maatwerk
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Public read policies (only active items)
CREATE POLICY "Public read active leveranciers" ON leveranciers
  FOR SELECT 
  USING (actief = true);

CREATE POLICY "Public read active contracten" ON contracten
  FOR SELECT 
  USING (actief = true);

CREATE POLICY "Public read contract_details_vast" ON contract_details_vast
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM contracten 
      WHERE contracten.id = contract_details_vast.contract_id 
      AND contracten.actief = true
    )
  );

CREATE POLICY "Public read contract_details_dynamisch" ON contract_details_dynamisch
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM contracten 
      WHERE contracten.id = contract_details_dynamisch.contract_id 
      AND contracten.actief = true
    )
  );

CREATE POLICY "Public read contract_details_maatwerk" ON contract_details_maatwerk
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM contracten 
      WHERE contracten.id = contract_details_maatwerk.contract_id 
      AND contracten.actief = true
    )
  );

-- =====================================================
-- TRIGGERS: Auto-update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leveranciers_updated_at BEFORE UPDATE ON leveranciers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracten_updated_at BEFORE UPDATE ON contracten
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_details_vast_updated_at BEFORE UPDATE ON contract_details_vast
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_details_dynamisch_updated_at BEFORE UPDATE ON contract_details_dynamisch
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_details_maatwerk_updated_at BEFORE UPDATE ON contract_details_maatwerk
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (voor testing)
-- =====================================================

-- Voeg een test leverancier toe
INSERT INTO leveranciers (naam, website, actief) VALUES
  ('Groene Stroom Test', 'https://groenestroom.nl', true);

COMMENT ON TABLE leveranciers IS 'Energieleveranciers met logo en contact info';
COMMENT ON TABLE contracten IS 'Basis contract informatie (type-agnostic)';
COMMENT ON TABLE contract_details_vast IS 'Specifieke details voor vaste contracten';
COMMENT ON TABLE contract_details_dynamisch IS 'Specifieke details voor dynamische contracten';
COMMENT ON TABLE contract_details_maatwerk IS 'Specifieke details voor maatwerk contracten';

