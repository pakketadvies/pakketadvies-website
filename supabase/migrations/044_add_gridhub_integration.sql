-- Migration: Add GridHub API integration support
-- Date: 2026-01-05
-- Description: Adds fields to contractaanvragen for GridHub integration and creates leverancier_api_config table

-- =====================================================
-- CONTRACTAANVRAGEN: Add GridHub fields
-- =====================================================
ALTER TABLE contractaanvragen 
  ADD COLUMN IF NOT EXISTS external_api_provider VARCHAR(50), -- 'GRIDHUB', 'MANUAL', null
  ADD COLUMN IF NOT EXISTS external_order_id VARCHAR(100), -- GridHub orderRequestId or orderId
  ADD COLUMN IF NOT EXISTS external_order_request_id VARCHAR(100), -- GridHub orderRequestId (explicit)
  ADD COLUMN IF NOT EXISTS external_status VARCHAR(50), -- GridHub status (NEW, CREATED, CANCELLED, etc.)
  ADD COLUMN IF NOT EXISTS external_sub_status_id VARCHAR(50), -- GridHub subStatusID
  ADD COLUMN IF NOT EXISTS external_status_reason TEXT, -- GridHub statusReason
  ADD COLUMN IF NOT EXISTS external_response JSONB, -- Volledige GridHub API response
  ADD COLUMN IF NOT EXISTS external_errors JSONB, -- Eventuele API errors
  ADD COLUMN IF NOT EXISTS external_last_sync TIMESTAMP WITH TIME ZONE; -- Laatste status sync

-- Indexes voor snelle queries
CREATE INDEX IF NOT EXISTS idx_contractaanvragen_external_order_id 
  ON contractaanvragen(external_order_id) 
  WHERE external_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contractaanvragen_external_status 
  ON contractaanvragen(external_status) 
  WHERE external_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contractaanvragen_external_api_provider 
  ON contractaanvragen(external_api_provider) 
  WHERE external_api_provider IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contractaanvragen_external_order_request_id 
  ON contractaanvragen(external_order_request_id) 
  WHERE external_order_request_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN contractaanvragen.external_api_provider IS 'External API provider: GRIDHUB, MANUAL, or null';
COMMENT ON COLUMN contractaanvragen.external_order_id IS 'GridHub order ID or orderRequest ID';
COMMENT ON COLUMN contractaanvragen.external_order_request_id IS 'GridHub orderRequest ID (explicit)';
COMMENT ON COLUMN contractaanvragen.external_status IS 'GridHub status: NEW, CREATED, CANCELLED, NEEDSATTENTION, etc.';
COMMENT ON COLUMN contractaanvragen.external_sub_status_id IS 'GridHub subStatusID';
COMMENT ON COLUMN contractaanvragen.external_status_reason IS 'GridHub statusReason (optional reason for status change)';
COMMENT ON COLUMN contractaanvragen.external_response IS 'Full GridHub API response (JSONB)';
COMMENT ON COLUMN contractaanvragen.external_errors IS 'API errors if any (JSONB)';
COMMENT ON COLUMN contractaanvragen.external_last_sync IS 'Last status sync timestamp';

-- =====================================================
-- LEVERANCIER API CONFIGURATIE
-- =====================================================
CREATE TABLE IF NOT EXISTS leverancier_api_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leverancier_id UUID NOT NULL REFERENCES leveranciers(id) ON DELETE CASCADE,
  
  -- Provider info
  provider VARCHAR(50) NOT NULL, -- 'GRIDHUB'
  environment VARCHAR(20) NOT NULL CHECK (environment IN ('test', 'production')),
  
  -- API credentials
  api_url TEXT NOT NULL, -- https://energiek.gridhub.cloud/api/external/v1
  api_username TEXT NOT NULL, -- API gebruiker van GridHub
  api_password_encrypted TEXT NOT NULL, -- Encrypted wachtwoord
  
  -- Product & Tariff IDs
  product_ids JSONB NOT NULL, -- {"particulier": "1", "zakelijk": "5"}
  tarief_ids JSONB NOT NULL, -- {"test": "11", "production": "37"}
  
  -- Customer approvals
  customer_approval_ids INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3], -- [1,2,3]
  
  -- Startdatum regels
  min_startdatum_dagen INTEGER NOT NULL DEFAULT 20, -- Minimaal 20 dagen
  min_startdatum_inhuizing_dagen INTEGER NOT NULL DEFAULT 3, -- Minimaal 3 dagen bij inhuizing
  
  -- Automatische incasso
  automatische_incasso_verplicht BOOLEAN NOT NULL DEFAULT true,
  
  -- Webhook config
  webhook_enabled BOOLEAN NOT NULL DEFAULT true,
  webhook_url TEXT, -- URL waar GridHub status updates naartoe stuurt
  
  -- Actief
  actief BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: één config per leverancier per environment
  CONSTRAINT unique_leverancier_api_config UNIQUE (leverancier_id, provider, environment)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leverancier_api_config_leverancier 
  ON leverancier_api_config(leverancier_id);
  
CREATE INDEX IF NOT EXISTS idx_leverancier_api_config_actief 
  ON leverancier_api_config(actief) 
  WHERE actief = true;

CREATE INDEX IF NOT EXISTS idx_leverancier_api_config_provider 
  ON leverancier_api_config(provider, environment, actief);

-- Function om automatisch updated_at te updaten
CREATE OR REPLACE FUNCTION update_leverancier_api_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leverancier_api_config_updated_at
  BEFORE UPDATE ON leverancier_api_config
  FOR EACH ROW
  EXECUTE FUNCTION update_leverancier_api_config_updated_at();

-- RLS Policies
ALTER TABLE leverancier_api_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access leverancier_api_config" 
  ON leverancier_api_config FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Comments
COMMENT ON TABLE leverancier_api_config IS 'API configuratie per leverancier voor externe integraties (GridHub, etc.)';
COMMENT ON COLUMN leverancier_api_config.api_password_encrypted IS 'Encrypted API wachtwoord - gebruik encryption library';
COMMENT ON COLUMN leverancier_api_config.product_ids IS 'JSONB: {"particulier": "1", "zakelijk": "5"}';
COMMENT ON COLUMN leverancier_api_config.tarief_ids IS 'JSONB: {"test": "11", "production": "37"}';
COMMENT ON COLUMN leverancier_api_config.customer_approval_ids IS 'Array van customer approval IDs: [1,2,3]';
COMMENT ON COLUMN leverancier_api_config.webhook_url IS 'URL waar GridHub status updates naartoe stuurt (bijv. https://pakketadvies.nl/api/webhooks/gridhub)';

