#!/bin/bash

# Supabase credentials
SUPABASE_URL="https://dxztyhwiwgrxjnlohapm.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4enR5aHdpd2dyeGpubG9oYXBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ1MjI4NSwiZXhwIjoyMDc5MDI4Mjg1fQ.n9u7aOE8GdYKY2pBLYg8tJxO90d5UU6vWmlgKm4baFo"

echo "🔧 Fixing RLS policies for leveranciers and contracten tables..."

# Read the SQL file
SQL_CONTENT=$(cat supabase/migrations/004_fix_leveranciers_rls.sql)

# Execute SQL via Supabase REST API (query endpoint)
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/query" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(jq -Rs . <<< "$SQL_CONTENT")}"

echo ""
echo "✅ Done! If you see errors above, please run the SQL manually in Supabase Dashboard > SQL Editor"

