-- ============================================
-- HOURLY ENERGY PRICES TABLE
-- ============================================
-- Stores hourly and quarter-hourly electricity prices
-- Used ONLY for detailed price graphs on energieprijzen page
-- 
-- IMPORTANT: This table is SEPARATE from dynamic_prices table
-- - dynamic_prices: Daily averages used for calculator calculations
-- - hourly_prices: Hourly/quarter-hourly data ONLY for graph visualization
-- 
-- These tables do NOT conflict - they serve different purposes
-- ============================================

CREATE TABLE IF NOT EXISTS hourly_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  datum DATE NOT NULL,
  uur INTEGER NOT NULL CHECK (uur >= 0 AND uur <= 23),
  kwartier INTEGER NOT NULL CHECK (kwartier >= 0 AND kwartier <= 3),
  
  -- Prijs (excl BTW, excl EB, in €/kWh)
  prijs DECIMAL(10, 5) NOT NULL,
  
  -- Timestamp voor exacte tijd
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata
  bron VARCHAR(50) NOT NULL DEFAULT 'ENERGYZERO',
  laatst_geupdate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: één record per datum/uur/kwartier
  CONSTRAINT unique_hourly_price UNIQUE (datum, uur, kwartier)
);

-- Index voor snelle queries
CREATE INDEX IF NOT EXISTS idx_hourly_prices_datum 
  ON hourly_prices(datum DESC, uur, kwartier);

CREATE INDEX IF NOT EXISTS idx_hourly_prices_timestamp 
  ON hourly_prices(timestamp DESC);

-- Comments voor documentatie
COMMENT ON TABLE hourly_prices IS 
  'Uurlijkse en kwartierprijzen voor elektriciteit, gebruikt voor gedetailleerde grafieken';

COMMENT ON COLUMN hourly_prices.prijs IS 
  'Elektriciteit prijs in €/kWh excl BTW en EB';

COMMENT ON COLUMN hourly_prices.kwartier IS 
  'Kwartier binnen het uur: 0 (00-15), 1 (15-30), 2 (30-45), 3 (45-60)';

-- Trigger voor updated_at
CREATE OR REPLACE FUNCTION update_hourly_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS trigger_update_hourly_prices_timestamp ON hourly_prices;

CREATE TRIGGER trigger_update_hourly_prices_timestamp
  BEFORE UPDATE ON hourly_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_hourly_prices_updated_at();

-- Verificatie
DO $$
DECLARE
  record_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO record_count FROM hourly_prices;
  RAISE NOTICE 'Hourly prices table created with % initial record(s)', record_count;
END $$;

