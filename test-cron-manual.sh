#!/bin/bash

# Manual test script for cron job
# Usage: ./test-cron-manual.sh

echo "🧪 Test Cron Job Endpoint"
echo "========================="
echo ""

# Get CRON_SECRET from environment or prompt
if [ -z "$CRON_SECRET" ]; then
  echo "⚠️  CRON_SECRET not set in environment"
  echo ""
  echo "💡 To test with authentication:"
  echo "   export CRON_SECRET='your-secret'"
  echo "   ./test-cron-manual.sh"
  echo ""
  echo "📡 Testing without authentication (will fail if CRON_SECRET is required)..."
  echo ""
  
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices" \
    -H "Accept: application/json" 2>&1)
else
  echo "✅ Using CRON_SECRET from environment"
  echo ""
  echo "📡 Testing with authentication..."
  echo ""
  
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices" \
    -H "Authorization: Bearer $CRON_SECRET" \
    -H "Accept: application/json" 2>&1)
fi

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "📊 Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ SUCCESS! Cron job executed successfully"
else
  echo "❌ FAILED! Status: $HTTP_CODE"
  echo ""
  echo "💡 Check:"
  echo "   1. Is CRON_SECRET correct?"
  echo "   2. Are there errors in the response?"
  echo "   3. Check Vercel deployment logs"
fi

