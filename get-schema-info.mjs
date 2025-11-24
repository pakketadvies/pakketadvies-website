import fetch from 'node-fetch';

const SUPABASE_URL = 'https://dxztyhwiwgrxjnlohapm.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4enR5aHdpd2dyeGpubG9oYXBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ1MjI4NSwiZXhwIjoyMDc5MDI4Mjg1fQ.n9u7aOE8GdYKY2pBLYg8tJxO90d5UU6vWmlgKm4baFo';

async function getTableInfo() {
  // Get the OpenAPI spec which includes table schemas
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Accept': 'application/openapi+json'
    }
  });

  const spec = await response.json();
  
  console.log('=== CONTRACT_DETAILS_DYNAMISCH SCHEMA ===\n');
  const dynamischSchema = spec.definitions?.contract_details_dynamisch;
  if (dynamischSchema) {
    console.log('Properties:');
    Object.entries(dynamischSchema.properties).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.type} ${value.format || ''}`);
    });
  }
  
  console.log('\n=== CONTRACT_DETAILS_VAST SCHEMA (for comparison) ===\n');
  const vastSchema = spec.definitions?.contract_details_vast;
  if (vastSchema) {
    console.log('Properties:');
    Object.entries(vastSchema.properties).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.type} ${value.format || ''}`);
    });
  }
}

getTableInfo();

