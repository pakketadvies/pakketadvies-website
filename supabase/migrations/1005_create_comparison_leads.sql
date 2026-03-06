-- Lead capture tabel voor bezoekers die (nog) niet afronden
CREATE TABLE IF NOT EXISTS comparison_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT,
  flow TEXT NOT NULL DEFAULT 'unknown'
    CHECK (flow IN ('business', 'consumer', 'unknown')),
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('timed_popup', 'results_inline', 'why_modal', 'exit_intent', 'manual')),
  page_path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  gclid TEXT,
  session_id TEXT,
  consent_contact BOOLEAN NOT NULL DEFAULT true,
  consent_text TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'discarded')),
  converted_aanvraag_id UUID REFERENCES contractaanvragen(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comparison_leads_created_at
  ON comparison_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comparison_leads_email
  ON comparison_leads (email);

CREATE INDEX IF NOT EXISTS idx_comparison_leads_source
  ON comparison_leads (source);

CREATE INDEX IF NOT EXISTS idx_comparison_leads_flow
  ON comparison_leads (flow);

CREATE INDEX IF NOT EXISTS idx_comparison_leads_status
  ON comparison_leads (status);

CREATE OR REPLACE FUNCTION update_comparison_leads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_comparison_leads_updated_at ON comparison_leads;
CREATE TRIGGER trigger_update_comparison_leads_updated_at
  BEFORE UPDATE ON comparison_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_comparison_leads_updated_at();

ALTER TABLE comparison_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert comparison leads" ON comparison_leads;
CREATE POLICY "Public can insert comparison leads"
  ON comparison_leads
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view comparison leads" ON comparison_leads;
CREATE POLICY "Admins can view comparison leads"
  ON comparison_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update comparison leads" ON comparison_leads;
CREATE POLICY "Admins can update comparison leads"
  ON comparison_leads
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

COMMENT ON TABLE comparison_leads IS
'Lead capture voor bezoekers die nog geen contractaanvraag afronden.';
COMMENT ON COLUMN comparison_leads.source IS
'Bron van lead capture: timed_popup, results_inline, why_modal, exit_intent, manual.';
