#!/usr/bin/env node

/**
 * Test script for cron job endpoint
 * 
 * Usage: node scripts/test-cron-job.mjs
 * 
 * This script tests the cron job endpoint with the correct Authorization header
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local manually
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not load .env.local:', error.message);
  }
}

loadEnv();

const CRON_SECRET = process.env.CRON_SECRET;
const ENDPOINT = 'https://pakketadvies.vercel.app/api/cron/update-dynamic-prices';

console.log('🧪 Testing cron job endpoint...\n');

if (!CRON_SECRET) {
  console.error('❌ CRON_SECRET not found in .env.local');
  console.error('   Run: vercel env pull .env.local');
  process.exit(1);
}

console.log('📡 Calling endpoint:', ENDPOINT);
console.log('   With Authorization: Bearer <CRON_SECRET>');
console.log('');

try {
  const response = await fetch(ENDPOINT, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CRON_SECRET}`,
      'Accept': 'application/json',
    },
  });

  const data = await response.json();
  
  console.log('📊 Response:');
  console.log('   Status:', response.status, response.statusText);
  console.log('   Body:', JSON.stringify(data, null, 2));
  console.log('');

  if (response.ok && data.success) {
    console.log('✅ SUCCESS! Cron job executed successfully');
    console.log('   Date:', data.date);
    console.log('   Electricity:', data.prices?.electricity, '€/kWh');
    console.log('   Gas:', data.prices?.gas, '€/m³');
    console.log('   Source:', data.source);
    console.log('');
    console.log('💾 Checking Supabase in 3 seconds...');
    
    // Wait a bit for database write
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: record, error } = await supabase
        .from('dynamic_prices')
        .select('*')
        .eq('datum', data.date)
        .single();
      
      if (error) {
        console.log('⚠️  Error checking Supabase:', error.message);
      } else if (record) {
        console.log('✅ Data confirmed in Supabase:');
        console.log('   Date:', record.datum);
        console.log('   Electricity:', record.elektriciteit_gemiddeld_dag, '€/kWh');
        console.log('   Gas:', record.gas_gemiddeld, '€/m³');
        console.log('   Source:', record.bron);
      } else {
        console.log('⚠️  Data not found in Supabase yet (may take a few seconds)');
      }
    }
  } else {
    console.error('❌ FAILED! Cron job returned error');
    console.error('   Error:', data.error);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error calling endpoint:', error.message);
  process.exit(1);
}

