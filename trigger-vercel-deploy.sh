#!/bin/bash

# Script om handmatig een Vercel deployment te triggeren
# Dit werkt alleen als je een Vercel token hebt

echo "🚀 Vercel Deployment Trigger"
echo "============================"
echo ""

# Check of VERCEL_TOKEN environment variable is gezet
if [ -z "$VERCEL_TOKEN" ]; then
  echo "⚠️  VERCEL_TOKEN niet gevonden"
  echo ""
  echo "Om dit script te gebruiken:"
  echo "1. Ga naar: https://vercel.com/account/tokens"
  echo "2. Maak een nieuwe token aan"
  echo "3. Run: export VERCEL_TOKEN=je_token_hier"
  echo "4. Run dit script opnieuw"
  echo ""
  echo "OF gebruik de makkelijkere optie:"
  echo "👉 Ga naar Vercel Dashboard → Deployments → Redeploy"
  exit 1
fi

# Vercel project naam (kan aangepast worden)
PROJECT_NAME="pakketadvies-website"

echo "📦 Project: $PROJECT_NAME"
echo "🔑 Token: ${VERCEL_TOKEN:0:10}..."
echo ""

# Trigger deployment via Vercel API
echo "🔄 Triggering deployment..."
RESPONSE=$(curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"gitSource\": {
      \"type\": \"github\",
      \"repo\": \"pakketadvies/pakketadvies-website\",
      \"ref\": \"main\"
    }
  }")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Deployment getriggerd!"
echo "Check Vercel Dashboard voor status: https://vercel.com/dashboard"

