-- Migration: Add admin-managed "why recommended" content fields
-- Date: 2026-02-16

ALTER TABLE contracten
ADD COLUMN IF NOT EXISTS aanbevolen_waarom_titel TEXT;

ALTER TABLE contracten
ADD COLUMN IF NOT EXISTS aanbevolen_waarom_intro TEXT;

ALTER TABLE contracten
ADD COLUMN IF NOT EXISTS aanbevolen_waarom_punt_1 TEXT;

ALTER TABLE contracten
ADD COLUMN IF NOT EXISTS aanbevolen_waarom_punt_2 TEXT;

ALTER TABLE contracten
ADD COLUMN IF NOT EXISTS aanbevolen_waarom_punt_3 TEXT;

ALTER TABLE contracten
ADD COLUMN IF NOT EXISTS aanbevolen_waarom_disclaimer TEXT;

COMMENT ON COLUMN contracten.aanbevolen_waarom_titel IS
'Korte titel voor de uitleg waarom een contract is aanbevolen.';

COMMENT ON COLUMN contracten.aanbevolen_waarom_intro IS
'Introductietekst voor de aanbevolen-uitleg in resultaten.';
