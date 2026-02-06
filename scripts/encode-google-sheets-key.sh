#!/bin/bash

# Google Sheets Private Key Encoder
# This script helps encode the private key from your service account JSON file to base64

echo "🔐 Google Sheets Private Key Encoder"
echo "===================================="
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "⚠️  'jq' is not installed. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install jq
        else
            echo "❌ Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    else
        # Linux
        sudo apt-get update && sudo apt-get install -y jq
    fi
fi

# Ask for JSON file path
echo "📁 Drag and drop your service account JSON file here, then press Enter:"
read -r json_file_path

# Remove quotes if user dragged and dropped
json_file_path=$(echo "$json_file_path" | tr -d "'\"")

# Check if file exists
if [ ! -f "$json_file_path" ]; then
    echo "❌ File not found: $json_file_path"
    exit 1
fi

echo ""
echo "📊 Extracting information from JSON file..."
echo ""

# Extract spreadsheet ID
echo "1️⃣  GOOGLE_SHEETS_SPREADSHEET_ID:"
echo "   Use this from your spreadsheet URL:"
echo "   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
echo ""
echo "   For your spreadsheet:"
echo "   1cll6o1QL_o_7QBUPEE5lBseqJY82U0reNSgo4WkES3U"
echo ""

# Extract service account email
echo "2️⃣  GOOGLE_SERVICE_ACCOUNT_EMAIL:"
service_account_email=$(jq -r '.client_email' "$json_file_path")
echo "   $service_account_email"
echo ""

# Extract and encode private key
echo "3️⃣  GOOGLE_PRIVATE_KEY (base64 encoded):"
private_key=$(jq -r '.private_key' "$json_file_path" | base64)
echo "   $private_key"
echo ""

# Save to file
output_file="google-sheets-env-vars.txt"
cat > "$output_file" << EOF
# Copy these to Vercel Environment Variables
# Settings → Environment Variables

GOOGLE_SHEETS_SPREADSHEET_ID=1cll6o1QL_o_7QBUPEE5lBseqJY82U0reNSgo4WkES3U
GOOGLE_SERVICE_ACCOUNT_EMAIL=$service_account_email
GOOGLE_PRIVATE_KEY=$private_key
EOF

echo "✅ Environment variables saved to: $output_file"
echo ""
echo "📋 Next steps:"
echo "   1. Copy the values from $output_file"
echo "   2. Go to Vercel → Your Project → Settings → Environment Variables"
echo "   3. Add all 3 variables (Production, Preview, Development)"
echo "   4. Deploy your project"
echo ""
echo "🔒 Security note:"
echo "   - NEVER commit $output_file to git"
echo "   - Delete $output_file after copying to Vercel"
echo "   - Keep your JSON file safe"
echo ""
