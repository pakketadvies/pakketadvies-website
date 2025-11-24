-- ============================================
-- DYNAMIC ENERGY PRICES TABLE
-- ============================================
-- Stores daily electricity and gas market prices
-- Updated via Vercel Cron job (daily at 14:00)
-- Sources: EnergyZero API, ENTSOE (fallback)
-- ============================================

CREATE TABLE IF NOT EXISTS dynamic_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  datum DATE NOT NULL UNIQUE,
  
  -- Elektriciteit prijzen (excl BTW, excl EB, in €/kWh)
  elektriciteit_gemiddeld_dag DECIMAL(10, 5) NOT NULL,
  elektriciteit_gemiddeld_nacht DECIMAL(10, 5),
  elektriciteit_min_dag DECIMAL(10, 5),
  elektriciteit_max_dag DECIMAL(10, 5),
  
  -- Gas prijzen (excl BTW, excl EB, in €/m³)
  gas_gemiddeld DECIMAL(10, 5) NOT NULL,
  gas_min DECIMAL(10, 5),
  gas_max DECIMAL(10, 5),
  
  -- Metadata
  bron VARCHAR(50) NOT NULL, -- 'ENERGYZERO', 'ENTSOE', 'MANUAL'
  laatst_geupdate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_voorspelling BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle queries (meest recente eerst)
CREATE INDEX IF NOT EXISTS idx_dynamic_prices_datum 
  ON dynamic_prices(datum DESC);

-- Index voor bron filtering
CREATE INDEX IF NOT EXISTS idx_dynamic_prices_bron 
  ON dynamic_prices(bron);

-- Comments voor documentatie
COMMENT ON TABLE dynamic_prices IS 
  'Dagelijkse marktprijzen voor elektriciteit en gas, gebruikt voor dynamische contracten';

COMMENT ON COLUMN dynamic_prices.elektriciteit_gemiddeld_dag IS 
  'Gemiddelde elektriciteit prijs overdag (06:00-23:00) in €/kWh excl BTW en EB';

COMMENT ON COLUMN dynamic_prices.elektriciteit_gemiddeld_nacht IS 
  'Gemiddelde elektriciteit prijs s nachts (23:00-06:00) in €/kWh excl BTW en EB';

COMMENT ON COLUMN dynamic_prices.gas_gemiddeld IS 
  'Gemiddelde gas prijs in €/m³ excl BTW en EB';

COMMENT ON COLUMN dynamic_prices.bron IS 
  'Bron van de prijsdata: ENERGYZERO (primair), ENTSOE (fallback), MANUAL (handmatig)';

-- Trigger voor updated_at
CREATE OR REPLACE FUNCTION update_dynamic_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dynamic_prices_timestamp
  BEFORE UPDATE ON dynamic_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_dynamic_prices_updated_at();

-- Seed met huidige marktprijzen (placeholder)
INSERT INTO dynamic_prices (
  datum,
  elektriciteit_gemiddeld_dag,
  elektriciteit_gemiddeld_nacht,
  elektriciteit_min_dag,
  elektriciteit_max_dag,
  gas_gemiddeld,
  gas_min,
  gas_max,
  bron,
  is_voorspelling
) VALUES (
  CURRENT_DATE,
  0.20000, -- €0.20/kWh elektriciteit dag
  0.15000, -- €0.15/kWh elektriciteit nacht
  0.12000, -- min
  0.35000, -- max
  0.80000, -- €0.80/m³ gas
  0.70000, -- min
  0.90000, -- max
  'MANUAL',
  FALSE
) ON CONFLICT (datum) DO NOTHING;

-- Verificatie
DO $$
DECLARE
  record_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO record_count FROM dynamic_prices;
  RAISE NOTICE 'Dynamic prices table created with % initial record(s)', record_count;
END $$;

