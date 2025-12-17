#!/bin/bash
# Script to check all required environment variables in Vercel

echo "🔍 Checking Vercel environment variables..."
echo ""

# Get all env vars
ENV_LIST=$(vercel env ls 2>&1 | grep -v "Retrieving\|Environment Variables\|Common next\|vercel env")

# Required environment variables
REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "RESEND_API_KEY"
  "RESEND_FROM_EMAIL"
  "CRON_SECRET"
  "NEXT_PUBLIC_BASE_URL"
  "NEXT_PUBLIC_FACEBOOK_PIXEL_ID"
  "KVK_API_KEY"
  "POSTCODE_API_KEY"
)

# Environments to check
ENVIRONMENTS=("Production" "Preview" "Development")

# Check each required variable
for var in "${REQUIRED_VARS[@]}"; do
  echo "📋 Checking: $var"
  
  for env in "${ENVIRONMENTS[@]}"; do
    if echo "$ENV_LIST" | grep -q "$var.*$env"; then
      echo "  ✅ $env: Present"
    else
      echo "  ❌ $env: MISSING"
    fi
  done
  echo ""
done

echo "✅ Check complete!"

