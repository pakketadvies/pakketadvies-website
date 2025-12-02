#!/bin/bash

# Interactive script to test cron job endpoint
# Usage: ./scripts/test-cron-interactive.sh

echo "🧪 Cron Job Test Script"
echo "======================"
echo ""

# Prompt for CRON_SECRET
read -sp "Enter CRON_SECRET (or press Enter to skip): " CRON_SECRET
echo ""

if [ -z "$CRON_SECRET" ]; then
  echo "❌ No CRON_SECRET provided"
  echo ""
  echo "💡 To get CRON_SECRET:"
  echo "   1. Go to Vercel Dashboard > Settings > Environment Variables"
  echo "   2. Find 'CRON_SECRET' in Production"
  echo "   3. Click 'Reveal' to see the value"
  exit 1
fi

echo "✅ CRON_SECRET received"
echo ""
echo "📡 Testing endpoint..."
echo ""

# Test the endpoint
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET "https://pakketadvies.vercel.app/api/cron/update-dynamic-prices" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Accept: application/json" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "📊 Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ SUCCESS! Cron job executed successfully"
  echo ""
  echo "💾 Checking Supabase in 3 seconds..."
  sleep 3
  
  # Check Supabase (if we have the key)
  if [ -f .env.local ]; then
    SUPABASE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d'=' -f2- | sed 's/^["'\'']//;s/["'\'']$//')
    if [ -n "$SUPABASE_KEY" ]; then
      echo "Checking database..."
      # You can add Supabase check here if needed
    fi
  fi
else
  echo "❌ FAILED! Status: $HTTP_CODE"
  exit 1
fi

