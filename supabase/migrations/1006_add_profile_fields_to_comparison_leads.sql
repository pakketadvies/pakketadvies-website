ALTER TABLE comparison_leads
ADD COLUMN IF NOT EXISTS extra_context JSONB;

ALTER TABLE comparison_leads
ADD COLUMN IF NOT EXISTS profile_completion SMALLINT NOT NULL DEFAULT 0
  CHECK (profile_completion >= 0 AND profile_completion <= 100);

ALTER TABLE comparison_leads
ADD COLUMN IF NOT EXISTS followup_priority TEXT NOT NULL DEFAULT 'low'
  CHECK (followup_priority IN ('low', 'medium', 'high'));

CREATE INDEX IF NOT EXISTS idx_comparison_leads_followup_priority
  ON comparison_leads (followup_priority);

CREATE INDEX IF NOT EXISTS idx_comparison_leads_profile_completion
  ON comparison_leads (profile_completion DESC);

COMMENT ON COLUMN comparison_leads.extra_context IS
'Optionele extra context vanuit progressive profiling na de eerste lead capture.';
COMMENT ON COLUMN comparison_leads.profile_completion IS
'Compleetheidsscore (0-100) op basis van optionele contextvelden.';
COMMENT ON COLUMN comparison_leads.followup_priority IS
'Lead prioriteit voor sales opvolging: low, medium, high.';
