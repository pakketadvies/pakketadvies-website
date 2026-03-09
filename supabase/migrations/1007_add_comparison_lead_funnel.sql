-- Automatische e-mailfunnel voor vergelijker leads

ALTER TABLE comparison_leads
ADD COLUMN IF NOT EXISTS funnel_access_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS funnel_status TEXT NOT NULL DEFAULT 'pending_profile'
  CHECK (funnel_status IN ('pending_profile', 'profile_completed', 'proposal_sent', 'converted', 'unsubscribed')),
ADD COLUMN IF NOT EXISTS funnel_step SMALLINT NOT NULL DEFAULT 0
  CHECK (funnel_step >= 0 AND funnel_step <= 10),
ADD COLUMN IF NOT EXISTS funnel_last_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS funnel_next_email_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS funnel_profile_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS funnel_recommended_contract_id UUID REFERENCES contracten(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS funnel_fallback_contract_id UUID REFERENCES contracten(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS funnel_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_comparison_leads_funnel_status
  ON comparison_leads (funnel_status);

CREATE INDEX IF NOT EXISTS idx_comparison_leads_funnel_next_email_at
  ON comparison_leads (funnel_next_email_at)
  WHERE funnel_next_email_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comparison_leads_funnel_token
  ON comparison_leads (funnel_access_token)
  WHERE funnel_access_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS comparison_lead_funnel_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 100,
  flow TEXT CHECK (flow IN ('business', 'consumer', 'unknown')),
  location_type TEXT CHECK (location_type IN ('woning', 'zakelijk_pand', 'zakelijk_aan_huis', 'onbekend')),
  electricity_usage_range TEXT CHECK (electricity_usage_range IN ('lt_2500', '2500_5000', '5000_10000', 'gt_10000', 'unknown')),
  gas_usage_range TEXT CHECK (gas_usage_range IN ('none', 'lt_1000', '1000_2000', '2000_4000', 'gt_4000', 'unknown')),
  switch_moment TEXT CHECK (switch_moment IN ('direct', 'within_3_months', 'orienting')),
  contract_id UUID NOT NULL REFERENCES contracten(id) ON DELETE CASCADE,
  fallback_contract_id UUID REFERENCES contracten(id) ON DELETE SET NULL,
  email_subject TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comparison_lead_funnel_rules_active_priority
  ON comparison_lead_funnel_rules (is_active, priority, created_at);

CREATE INDEX IF NOT EXISTS idx_comparison_lead_funnel_rules_flow
  ON comparison_lead_funnel_rules (flow)
  WHERE flow IS NOT NULL;

DROP TRIGGER IF EXISTS trigger_update_comparison_lead_funnel_rules_updated_at ON comparison_lead_funnel_rules;
CREATE TRIGGER trigger_update_comparison_lead_funnel_rules_updated_at
  BEFORE UPDATE ON comparison_lead_funnel_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_comparison_leads_updated_at();

ALTER TABLE comparison_lead_funnel_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view comparison lead funnel rules" ON comparison_lead_funnel_rules;
CREATE POLICY "Admins can view comparison lead funnel rules"
  ON comparison_lead_funnel_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert comparison lead funnel rules" ON comparison_lead_funnel_rules;
CREATE POLICY "Admins can insert comparison lead funnel rules"
  ON comparison_lead_funnel_rules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update comparison lead funnel rules" ON comparison_lead_funnel_rules;
CREATE POLICY "Admins can update comparison lead funnel rules"
  ON comparison_lead_funnel_rules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete comparison lead funnel rules" ON comparison_lead_funnel_rules;
CREATE POLICY "Admins can delete comparison lead funnel rules"
  ON comparison_lead_funnel_rules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

COMMENT ON TABLE comparison_lead_funnel_rules IS
'Regels waarmee per lead-segment automatisch een aanbevolen contract wordt gekozen voor de e-mailfunnel.';
