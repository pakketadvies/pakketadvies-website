#!/bin/bash

# Database connection
DB_HOST="aws-0-eu-central-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.emmbycvdwkmugepvgtfj"
DB_PASS="Ab49n805!"

# SQL to execute
SQL=$(cat <<'EOF'
-- Update tarieven_overheid 2025 met CORRECTE industrietarieven
UPDATE tarieven_overheid
SET
  eb_elektriciteit_kv_schijf1_max = 2900,
  eb_elektriciteit_kv_schijf1 = 0.10154,
  eb_elektriciteit_kv_schijf2 = 0.10154,
  eb_elektriciteit_gv_schijf1_max = 2900,
  eb_elektriciteit_gv_schijf1 = 0.10154,
  eb_elektriciteit_gv_schijf2_max = 10000,
  eb_elektriciteit_gv_schijf2 = 0.10154,
  eb_elektriciteit_gv_schijf3_max = 50000,
  eb_elektriciteit_gv_schijf3 = 0.10154,
  eb_elektriciteit_gv_schijf4 = 0.10154,
  eb_gas_schijf1_max = 1000,
  eb_gas_schijf1 = 0.57816,
  eb_gas_schijf2 = 0.57816,
  vermindering_eb_elektriciteit = 524.95,
  btw_percentage = 21,
  actief = true,
  updated_at = NOW()
WHERE jaar = 2025 AND actief = true;

INSERT INTO tarieven_overheid (
  jaar, btw_percentage, vermindering_eb_elektriciteit,
  eb_elektriciteit_kv_schijf1_max, eb_elektriciteit_kv_schijf1, eb_elektriciteit_kv_schijf2,
  eb_elektriciteit_gv_schijf1_max, eb_elektriciteit_gv_schijf1,
  eb_elektriciteit_gv_schijf2_max, eb_elektriciteit_gv_schijf2,
  eb_elektriciteit_gv_schijf3_max, eb_elektriciteit_gv_schijf3, eb_elektriciteit_gv_schijf4,
  eb_gas_schijf1_max, eb_gas_schijf1, eb_gas_schijf2,
  actief, ingangsdatum, einddatum
) SELECT
  2025, 21, 524.95,
  2900, 0.10154, 0.10154,
  2900, 0.10154,
  10000, 0.10154,
  50000, 0.10154, 0.10154,
  1000, 0.57816, 0.57816,
  true, '2025-01-01', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM tarieven_overheid WHERE jaar = 2025 AND actief = true
);
EOF
)

echo "🚀 Applying migration to Supabase database..."
echo "📝 Executing SQL..."
echo ""

# Use curl to execute via Supabase REST API
curl -X POST \
  "https://emmbycvdwkmugepvgtfj.supabase.co/rest/v1/rpc/sql" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbWJ5Y3Zkd2ttdWdlcHZndGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTk2NDcsImV4cCI6MjA0NTc3NTY0N30.qxK7LYl0m_QEAQ3G3-SdpY3LqNfZQZi1VfxZZbE4PeI" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbWJ5Y3Zkd2ttdWdlcHZndGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTk2NDcsImV4cCI6MjA0NTc3NTY0N30.qxK7LYl0m_QEAQ3G3-SdpY3LqNfZQZi1VfxZZbE4PeI" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | jq -Rs .)}"

echo ""
echo "✅ Migration complete!"
echo ""
echo "🔍 Verifying tarieven_overheid 2025..."

curl -X GET \
  "https://emmbycvdwkmugepvgtfj.supabase.co/rest/v1/tarieven_overheid?jaar=eq.2025&select=*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbWJ5Y3Zkd2ttdWdlcHZndGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTk2NDcsImV4cCI6MjA0NTc3NTY0N30.qxK7LYl0m_QEAQ3G3-SdpY3LqNfZQZi1VfxZZbE4PeI" | jq .

echo ""
echo "✅ Done!"

