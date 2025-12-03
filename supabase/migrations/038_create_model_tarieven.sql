-- ============================================
-- MODEL TARIEVEN TABEL (Eneco Modelcontract)
-- ============================================
-- Stores Eneco modelcontract tariffs for savings calculation
-- These tariffs are used as the baseline to calculate savings
-- compared to other energy contracts
-- ============================================

CREATE TABLE IF NOT EXISTS model_tarieven (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Leverancier (always Eneco for modelcontract)
  leverancier_naam VARCHAR(100) NOT NULL DEFAULT 'Eneco',
  
  -- Elektriciteit tarieven (inclusief EB en BTW, in €/kWh)
  tarief_elektriciteit_normaal DECIMAL(10, 5) NOT NULL, -- Bijv. 0.30112
  tarief_elektriciteit_dal DECIMAL(10, 5) NOT NULL,     -- Bijv. 0.28402
  tarief_elektriciteit_enkel DECIMAL(10, 5) NOT NULL,    -- Bijv. 0.29284
  
  -- Gas tarief (inclusief EB en BTW, in €/m³)
  tarief_gas DECIMAL(10, 5) NOT NULL,                    -- Bijv. 1.30055
  
  -- Vastrecht (inclusief BTW, in €/maand)
  vastrecht_stroom_maand DECIMAL(10, 2) NOT NULL,       -- Bijv. 47.99
  vastrecht_gas_maand DECIMAL(10, 2) NOT NULL,           -- Bijv. 7.99
  
  -- Metadata
  ingangsdatum DATE NOT NULL,
  einddatum DATE,
  actief BOOLEAN DEFAULT true,
  
  -- Notities
  opmerkingen TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle queries
CREATE INDEX IF NOT EXISTS idx_model_tarieven_actief 
  ON model_tarieven(actief) 
  WHERE actief = true;

CREATE INDEX IF NOT EXISTS idx_model_tarieven_datum 
  ON model_tarieven(ingangsdatum DESC, einddatum DESC);

-- Partial unique index: alleen één actieve modeltarief tegelijk
CREATE UNIQUE INDEX IF NOT EXISTS idx_model_tarieven_actief_unique 
  ON model_tarieven(actief) 
  WHERE actief = true;

-- Comments voor documentatie
COMMENT ON TABLE model_tarieven IS 
  'Eneco modelcontract tarieven gebruikt als baseline voor besparingsberekening. Tarieven zijn inclusief Energiebelasting en BTW.';

COMMENT ON COLUMN model_tarieven.tarief_elektriciteit_normaal IS 
  'Normaal tarief elektriciteit inclusief EB (€0.12286/kWh) en BTW (21%), in €/kWh';

COMMENT ON COLUMN model_tarieven.tarief_elektriciteit_dal IS 
  'Dal tarief elektriciteit inclusief EB (€0.12286/kWh) en BTW (21%), in €/kWh';

COMMENT ON COLUMN model_tarieven.tarief_elektriciteit_enkel IS 
  'Enkeltarief elektriciteit inclusief EB (€0.12286/kWh) en BTW (21%), in €/kWh';

COMMENT ON COLUMN model_tarieven.tarief_gas IS 
  'Gas tarief inclusief EB (€0.69957/m³) en BTW (21%), in €/m³';

COMMENT ON COLUMN model_tarieven.vastrecht_stroom_maand IS 
  'Vastrecht stroom per maand inclusief BTW (21%), in €/maand';

COMMENT ON COLUMN model_tarieven.vastrecht_gas_maand IS 
  'Vastrecht gas per maand inclusief BTW (21%), in €/maand';

-- Trigger voor updated_at
CREATE OR REPLACE FUNCTION update_model_tarieven_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_model_tarieven_updated_at
  BEFORE UPDATE ON model_tarieven
  FOR EACH ROW
  EXECUTE FUNCTION update_model_tarieven_updated_at();

-- RLS Policies (alleen lezen voor anon users)
ALTER TABLE model_tarieven ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active model tariffs
CREATE POLICY "Allow public read access to active model tariffs"
  ON model_tarieven
  FOR SELECT
  USING (actief = true);

-- Insert initial Eneco modeltarieven (2025)
-- Tarieven zijn inclusief Energiebelasting en BTW
INSERT INTO model_tarieven (
  leverancier_naam,
  tarief_elektriciteit_normaal,
  tarief_elektriciteit_dal,
  tarief_elektriciteit_enkel,
  tarief_gas,
  vastrecht_stroom_maand,
  vastrecht_gas_maand,
  ingangsdatum,
  actief,
  opmerkingen
) VALUES (
  'Eneco',
  0.30112,  -- Normaal tarief inclusief EB (€0.12286/kWh) en BTW (21%)
  0.28402,  -- Daltarief inclusief EB (€0.12286/kWh) en BTW (21%)
  0.29284,  -- Enkeltarief inclusief EB (€0.12286/kWh) en BTW (21%)
  1.30055,  -- Gas tarief inclusief EB (€0.69957/m³) en BTW (21%)
  47.99,    -- Vastrecht stroom per maand inclusief BTW (21%)
  7.99,     -- Vastrecht gas per maand inclusief BTW (21%)
  '2025-01-01',
  true,
  'Eneco modelcontract tarieven 2025. Tarieven zijn inclusief Energiebelasting (€0.12286/kWh voor elektriciteit, €0.69957/m³ voor gas) en BTW (21%). Geldig voor aansluitingen t/m 3x80A en verbruik tot 10.000 kWh/jaar elektriciteit en minder dan 5.000 m³/jaar gas met G6 gasmeter of kleiner.'
)
ON CONFLICT DO NOTHING;

