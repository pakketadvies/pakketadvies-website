#!/bin/bash

# Script om handmatig een Vercel deployment te triggeren
# Gebruik: export VERCEL_TOKEN=je_token && ./deploy-vercel.sh

PROJECT_ID="prj_6Az3CNttFoykSbJO283LukPcOSOF"
PROJECT_NAME="pakketadvies-website"

echo "🚀 Vercel Deployment Triggeren"
echo "=============================="
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN niet gevonden!"
  echo ""
  echo "📋 Stap 1: Haal je Vercel token op"
  echo "   1. Ga naar: https://vercel.com/account/tokens"
  echo "   2. Klik op 'Create Token'"
  echo "   3. Geef het een naam (bijv. 'Deployment Script')"
  echo "   4. Kopieer de token"
  echo ""
  echo "📋 Stap 2: Export de token"
  echo "   export VERCEL_TOKEN=je_token_hier"
  echo ""
  echo "📋 Stap 3: Run dit script opnieuw"
  echo "   ./deploy-vercel.sh"
  echo ""
  echo "---"
  echo ""
  echo "💡 ALTERNATIEF: Gebruik Vercel Dashboard (makkelijker!)"
  echo "   1. Ga naar: https://vercel.com/dashboard"
  echo "   2. Selecteer project: pakketadvies-website"
  echo "   3. Deployments → ... → Redeploy"
  exit 1
fi

echo "📦 Project: $PROJECT_NAME"
echo "🆔 Project ID: $PROJECT_ID"
echo "🔑 Token: ${VERCEL_TOKEN:0:10}..."
echo ""

echo "🔄 Triggering deployment..."
echo ""

# Trigger deployment via Vercel API
RESPONSE=$(curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"project\": \"$PROJECT_ID\",
    \"gitSource\": {
      \"type\": \"github\",
      \"repo\": \"pakketadvies/pakketadvies-website\",
      \"ref\": \"main\"
    }
  }")

# Check if jq is available for pretty printing
if command -v jq &> /dev/null; then
  echo "$RESPONSE" | jq '.'
  DEPLOYMENT_ID=$(echo "$RESPONSE" | jq -r '.id // empty')
  DEPLOYMENT_URL=$(echo "$RESPONSE" | jq -r '.url // empty')
else
  echo "$RESPONSE"
  DEPLOYMENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
  DEPLOYMENT_URL=$(echo "$RESPONSE" | grep -o '"url":"[^"]*' | cut -d'"' -f4 | head -1)
fi

echo ""
if [ -n "$DEPLOYMENT_ID" ] && [ "$DEPLOYMENT_ID" != "null" ]; then
  echo "✅ Deployment getriggerd!"
  echo "🆔 Deployment ID: $DEPLOYMENT_ID"
  if [ -n "$DEPLOYMENT_URL" ] && [ "$DEPLOYMENT_URL" != "null" ]; then
    echo "🔗 URL: $DEPLOYMENT_URL"
  fi
  echo ""
  echo "📊 Check status: https://vercel.com/dashboard"
else
  echo "❌ Deployment gefaald!"
  echo "Check de response hierboven voor error details"
  exit 1
fi

