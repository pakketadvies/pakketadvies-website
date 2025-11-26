-- Migration: Create contractaanvragen table
-- Date: 2025-01-27
-- Description: Stores all contract applications (aanvragen) with complete form data

-- =====================================================
-- CONTRACTAANVRAGEN (Contract Applications)
-- =====================================================
CREATE TABLE contractaanvragen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Uniek aanvraagnummer (format: PA-YYYY-XXXXXX)
  aanvraagnummer VARCHAR(20) NOT NULL UNIQUE,
  
  -- Contract informatie
  contract_id UUID NOT NULL REFERENCES contracten(id) ON DELETE RESTRICT,
  contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('vast', 'dynamisch', 'maatwerk')),
  contract_naam TEXT NOT NULL,
  leverancier_id UUID NOT NULL REFERENCES leveranciers(id) ON DELETE RESTRICT,
  leverancier_naam TEXT NOT NULL,
  
  -- Type aanvraag (particulier of zakelijk)
  aanvraag_type VARCHAR(20) NOT NULL CHECK (aanvraag_type IN ('particulier', 'zakelijk')),
  
  -- Status workflow
  status VARCHAR(20) NOT NULL DEFAULT 'nieuw' CHECK (status IN ('nieuw', 'in_behandeling', 'afgehandeld', 'geannuleerd')),
  
  -- Verbruik data (JSONB voor flexibiliteit)
  verbruik_data JSONB NOT NULL,
  -- Bevat: elektriciteitNormaal, elektriciteitDal, gasJaar, terugleveringJaar, 
  --        aansluitwaardeElektriciteit, aansluitwaardeGas, leveringsadressen, addressType, etc.
  
  -- Persoonlijke/Bedrijfsgegevens (JSONB voor flexibiliteit)
  -- Voor particulier: aanhef, voornaam, voorletters, tussenvoegsel, achternaam, geboortedatum, etc.
  -- Voor zakelijk: bedrijfsnaam, kvkNummer, contactpersoon, typeBedrijf, etc.
  gegevens_data JSONB NOT NULL,
  
  -- Betalingsgegevens
  iban TEXT,
  rekening_op_andere_naam BOOLEAN DEFAULT false,
  rekeninghouder_naam TEXT,
  
  -- Levering opties
  heeft_verblijfsfunctie BOOLEAN,
  gaat_verhuizen BOOLEAN DEFAULT false,
  wanneer_overstappen VARCHAR(50), -- 'zo_snel_mogelijk' | 'na_contract_verlopen'
  contract_einddatum DATE,
  ingangsdatum DATE, -- Als gaat_verhuizen = true
  
  -- Opties
  is_klant_bij_leverancier BOOLEAN DEFAULT false,
  herinnering_contract BOOLEAN DEFAULT false,
  nieuwsbrief BOOLEAN DEFAULT false,
  
  -- Correspondentie adres (als anders dan leveringsadres)
  heeft_andere_correspondentie_adres BOOLEAN DEFAULT false,
  correspondentie_adres JSONB, -- {straat, huisnummer, toevoeging, postcode, plaats}
  
  -- Notities (voor admin)
  admin_notities TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  afgehandeld_op TIMESTAMP WITH TIME ZONE,
  afgehandeld_door UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes voor snelle queries
CREATE INDEX idx_contractaanvragen_aanvraagnummer ON contractaanvragen(aanvraagnummer);
CREATE INDEX idx_contractaanvragen_status ON contractaanvragen(status);
CREATE INDEX idx_contractaanvragen_contract_id ON contractaanvragen(contract_id);
CREATE INDEX idx_contractaanvragen_leverancier_id ON contractaanvragen(leverancier_id);
CREATE INDEX idx_contractaanvragen_aanvraag_type ON contractaanvragen(aanvraag_type);
CREATE INDEX idx_contractaanvragen_created_at ON contractaanvragen(created_at DESC);
CREATE INDEX idx_contractaanvragen_verbruik_data ON contractaanvragen USING GIN(verbruik_data);
CREATE INDEX idx_contractaanvragen_gegevens_data ON contractaanvragen USING GIN(gegevens_data);

-- Function om automatisch updated_at te updaten
CREATE OR REPLACE FUNCTION update_contractaanvragen_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contractaanvragen_updated_at
  BEFORE UPDATE ON contractaanvragen
  FOR EACH ROW
  EXECUTE FUNCTION update_contractaanvragen_updated_at();

-- Function om uniek aanvraagnummer te genereren
CREATE OR REPLACE FUNCTION generate_aanvraagnummer()
RETURNS TEXT AS $$
DECLARE
  jaar INTEGER;
  volgnummer INTEGER;
  nieuw_nummer TEXT;
BEGIN
  jaar := EXTRACT(YEAR FROM NOW());
  
  -- Vind het hoogste volgnummer voor dit jaar
  SELECT COALESCE(MAX(CAST(SUBSTRING(aanvraagnummer FROM 8) AS INTEGER)), 0) + 1
  INTO volgnummer
  FROM contractaanvragen
  WHERE aanvraagnummer LIKE 'PA-' || jaar || '-%';
  
  -- Format: PA-YYYY-XXXXXX (6 cijfers)
  nieuw_nummer := 'PA-' || jaar || '-' || LPAD(volgnummer::TEXT, 6, '0');
  
  RETURN nieuw_nummer;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE contractaanvragen ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access contractaanvragen" ON contractaanvragen
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Public insert (voor form submissions)
CREATE POLICY "Public can insert contractaanvragen" ON contractaanvragen
  FOR INSERT
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE contractaanvragen IS 'Stores all contract applications (aanvragen) submitted through the website';
COMMENT ON COLUMN contractaanvragen.aanvraagnummer IS 'Unique application number in format PA-YYYY-XXXXXX';
COMMENT ON COLUMN contractaanvragen.verbruik_data IS 'JSONB containing all verbruik (consumption) data from the form';
COMMENT ON COLUMN contractaanvragen.gegevens_data IS 'JSONB containing personal/business details from the form';
COMMENT ON COLUMN contractaanvragen.status IS 'Workflow status: nieuw, in_behandeling, afgehandeld, geannuleerd';

