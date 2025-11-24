import fetch from 'node-fetch';

const SUPABASE_URL = 'https://dxztyhwiwgrxjnlohapm.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4enR5aHdpd2dyeGpubG9oYXBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ1MjI4NSwiZXhwIjoyMDc5MDI4Mjg1fQ.n9u7aOE8GdYKY2pBLYg8tJxO90d5UU6vWmlgKm4baFo';

async function checkDatabase() {
  try {
    // Create a SQL query function to inspect the schema
    const query = `
      SELECT 
        column_name, 
        data_type,
        numeric_precision,
        numeric_scale,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'contract_details_dynamisch' 
      ORDER BY ordinal_position;
    `;

    // Execute raw SQL via PostgREST
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.log('RPC not available, trying alternative method...\n');
      
      // Alternative: Check if there are any contracts and inspect the response
      const contractsResponse = await fetch(`${SUPABASE_URL}/rest/v1/contract_details_dynamisch?select=*&limit=1`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      });
      
      console.log('=== CONTRACT_DETAILS_DYNAMISCH ===');
      console.log('Table exists: YES');
      console.log('Count:', (await contractsResponse.json()).length);
      
      // Check contract_details_vast instead (we know it has data)
      const vastResponse = await fetch(`${SUPABASE_URL}/rest/v1/contract_details_vast?select=*&limit=1`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      });
      
      const vastData = await vastResponse.json();
      console.log('\n=== CONTRACT_DETAILS_VAST (for comparison) ===');
      if (vastData.length > 0) {
        console.log('Columns:', Object.keys(vastData[0]));
        console.log('\nSample data:');
        console.log(JSON.stringify(vastData[0], null, 2));
      }
      
      // Check dynamic_prices table
      const pricesResponse = await fetch(`${SUPABASE_URL}/rest/v1/dynamic_prices?select=*&limit=1`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        }
      });
      
      console.log('\n=== DYNAMIC_PRICES TABLE ===');
      if (pricesResponse.ok) {
        const pricesData = await pricesResponse.json();
        console.log('Table exists: YES');
        console.log('Record count:', pricesData.length);
        if (pricesData.length > 0) {
          console.log('Columns:', Object.keys(pricesData[0]));
          console.log('\nSample data:');
          console.log(JSON.stringify(pricesData[0], null, 2));
        }
      } else {
        console.log('Table exists: NO');
      }
      
      return;
    }

    const data = await response.json();
    console.log('Schema:');
    console.table(data);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkDatabase();

