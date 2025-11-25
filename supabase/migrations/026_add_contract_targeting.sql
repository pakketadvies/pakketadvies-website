-- Migration: Add contract targeting for particulier/zakelijk/both
-- Date: 2025-01-28

-- Voeg target_audience kolom toe aan contracten tabel
ALTER TABLE contracten ADD COLUMN target_audience TEXT DEFAULT 'both'
  CHECK (target_audience IN ('particulier', 'zakelijk', 'both'));

-- Update bestaande contracten (indien nodig)
UPDATE contracten SET target_audience = 'both' WHERE target_audience IS NULL;

-- Index voor performance
CREATE INDEX idx_contracten_target_audience ON contracten(target_audience);

-- Comment voor documentatie
COMMENT ON COLUMN contracten.target_audience IS 'Bepaalt voor welke doelgroep het contract wordt getoond: particulier (alleen woonfunctie adressen), zakelijk (alleen zakelijke adressen), both (alle adressen)';
