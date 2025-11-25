-- Migration: Voeg 4 jaar looptijd toe aan contracten
-- Date: 2025-01-27
-- Description: Voeg 4 jaar toe als mogelijke looptijd voor vaste en maatwerk contracten

-- ============================================
-- 1. Update contract_details_vast CHECK constraint
-- ============================================
ALTER TABLE contract_details_vast
DROP CONSTRAINT IF EXISTS contract_details_vast_looptijd_check;

ALTER TABLE contract_details_vast
ADD CONSTRAINT contract_details_vast_looptijd_check 
CHECK (looptijd IN (1, 2, 3, 4, 5));

-- ============================================
-- 2. Update contract_details_maatwerk CHECK constraint
-- ============================================
ALTER TABLE contract_details_maatwerk
DROP CONSTRAINT IF EXISTS contract_details_maatwerk_looptijd_check;

ALTER TABLE contract_details_maatwerk
ADD CONSTRAINT contract_details_maatwerk_looptijd_check 
CHECK (looptijd IN (1, 2, 3, 4, 5));

-- ============================================
-- 3. Update comments
-- ============================================
COMMENT ON COLUMN contract_details_vast.looptijd IS 'Contract looptijd in jaren (1, 2, 3, 4, of 5)';
COMMENT ON COLUMN contract_details_maatwerk.looptijd IS 'Contract looptijd in jaren (1, 2, 3, 4, of 5)';

