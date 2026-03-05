-- Migration: Add recommended segment targeting for contracts
-- Date: 2026-02-16

ALTER TABLE contracten
ADD COLUMN IF NOT EXISTS aanbevolen_segment TEXT
  CHECK (
    aanbevolen_segment IN (
      'particulier_kleinverbruik',
      'particulier_grootverbruik',
      'zakelijk_kleinverbruik',
      'zakelijk_grootverbruik'
    )
    OR aanbevolen_segment IS NULL
  );

CREATE INDEX IF NOT EXISTS idx_contracten_aanbevolen_segment
  ON contracten (aanbevolen_segment);

COMMENT ON COLUMN contracten.aanbevolen_segment IS
'Segment waarvoor een aanbevolen contract bovenaan wordt gepind in resultaten.';
