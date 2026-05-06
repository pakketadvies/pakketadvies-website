-- ============================================
-- AANBIEDING TARIEVEN TABEL
-- ============================================
-- Slaat de bewerkbare tarieven (en bijbehorende
-- hero badges) op voor de losse aanbieding pagina's
-- onder /aanbieding/<slug>.
--
-- Per slug één rij. Inhoud wordt opgeslagen als
-- JSONB zodat we eenvoudig items kunnen toevoegen
-- of verwijderen vanuit de admin.
-- ============================================

CREATE TABLE IF NOT EXISTS aanbieding_tarieven (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificatie van de aanbieding pagina (bv. 'clean-energy-ets2')
  slug VARCHAR(100) UNIQUE NOT NULL,

  -- Display titel (alleen voor gebruik in admin)
  titel VARCHAR(255) NOT NULL,

  -- Tariefkaart items: array met objecten { label, waarde }
  -- Wordt 1-op-1 gerenderd in de tariefkaart op de pagina.
  tariefkaart_items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Hero trust badges: array met objecten { label, waarde }
  -- Maximaal 3 worden getoond in de hero.
  hero_badges JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aanbieding_tarieven_slug
  ON aanbieding_tarieven(slug);

COMMENT ON TABLE aanbieding_tarieven IS
  'Bewerkbare tarieven en hero badges voor de aanbieding pagina''s onder /aanbieding/<slug>. Per slug één rij.';

COMMENT ON COLUMN aanbieding_tarieven.tariefkaart_items IS
  'JSON array van { label, waarde } objecten die in de tariefkaart op de aanbiedingspagina worden getoond.';

COMMENT ON COLUMN aanbieding_tarieven.hero_badges IS
  'JSON array van { label, waarde } objecten die als trust badges in de hero worden getoond. Maximaal 3 worden gerenderd.';

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_aanbieding_tarieven_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_aanbieding_tarieven_updated_at ON aanbieding_tarieven;

CREATE TRIGGER trigger_update_aanbieding_tarieven_updated_at
  BEFORE UPDATE ON aanbieding_tarieven
  FOR EACH ROW
  EXECUTE FUNCTION update_aanbieding_tarieven_updated_at();

-- RLS
ALTER TABLE aanbieding_tarieven ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read aanbieding tarieven" ON aanbieding_tarieven;
DROP POLICY IF EXISTS "Admins can update aanbieding_tarieven" ON aanbieding_tarieven;
DROP POLICY IF EXISTS "Admins can insert aanbieding_tarieven" ON aanbieding_tarieven;

-- Iedereen mag lezen (publieke pagina's tonen deze data).
CREATE POLICY "Public read aanbieding tarieven"
  ON aanbieding_tarieven
  FOR SELECT
  USING (true);

-- Alleen admins mogen wijzigen.
CREATE POLICY "Admins can update aanbieding_tarieven" ON aanbieding_tarieven
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can insert aanbieding_tarieven" ON aanbieding_tarieven
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- Initiële seed: clean-energy-ets2
-- ============================================
-- Spiegelt de huidige hardcoded waarden op
-- /aanbieding/clean-energy-ets2 zodat de pagina
-- direct na deployment exact hetzelfde toont.
-- ============================================
INSERT INTO aanbieding_tarieven (slug, titel, tariefkaart_items, hero_badges)
VALUES (
  'clean-energy-ets2',
  'Clean Energy ETS-2 (5 jaar vast gas)',
  '[
    {"label": "Unieke kans", "waarde": "ETS-2 risico vastgelegd"},
    {"label": "Elektra normaal", "waarde": "€ 0,120 per kWh"},
    {"label": "Elektra dal", "waarde": "€ 0,116 per kWh"},
    {"label": "Gastarief", "waarde": "€ 0,494 per m3"},
    {"label": "Doelgroep", "waarde": "KvK (ook woonhuis)"},
    {"label": "Looptijd", "waarde": "t/m 01-01-2031"}
  ]'::jsonb,
  '[
    {"label": "5 jaar vast", "waarde": "t/m 01-01-2031"},
    {"label": "ETS-2 risico", "waarde": "Volledig afgedekt"},
    {"label": "Alleen voor", "waarde": "KvK-klanten"}
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
