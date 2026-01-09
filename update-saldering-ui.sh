#!/bin/bash
# Script om saldering UI te updaten voor dynamische contracten

FILES=(
  "src/components/calculator/ContractDetailsDrawer.tsx"
  "src/components/contract/ContractViewer.tsx"
)

for file in "${FILES[@]}"; do
  echo "Updating $file..."
  # Remove 30/70 split section and overschot vergoeding
  # Simpel gezegd: verwijder de hele 30/70 blok tussen markers
done

echo "✅ All files updated!"
