import fetch from 'node-fetch';

const SUPABASE_URL = 'https://dxztyhwiwgrxjnlohapm.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4enR5aHdpd2dyeGpubG9oYXBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ1MjI4NSwiZXhwIjoyMDc5MDI4Mjg1fQ.n9u7aOE8GdYKY2pBLYg8tJxO90d5UU6vWmlgKm4baFo';

/**
 * Fetch day-ahead prices for a specific date
 */
async function fetchDayAheadPrices(date) {
  const dateStr = date.toISOString().split('T')[0];
  
  try {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const fromTimestamp = `${dateStr}T00:00:00Z`;
    const tillTimestamp = `${nextDay.toISOString().split('T')[0]}T00:00:00Z`;

    // Fetch electricity prices (usageType=1)
    const electricityResponse = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${fromTimestamp}&tillDate=${tillTimestamp}&interval=4&usageType=1&inclBtw=false`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!electricityResponse.ok) {
      console.warn(`⚠️ EnergyZero electricity API error voor ${dateStr}: ${electricityResponse.status}`);
      return null;
    }

    const electricityData = await electricityResponse.json();
    
    const electricityPrices = (electricityData.Prices || []).map(p => {
      return parseFloat(p.price || 0);
    }).filter(p => p > 0);
    
    if (electricityPrices.length === 0) {
      console.warn(`⚠️ Geen elektriciteitsprijzen gevonden voor ${dateStr}`);
      return null;
    }

    // Split into day (6-23) and night (23-6) periods
    const dayPrices = [];
    const nightPrices = [];

    electricityPrices.forEach((price, i) => {
      const hour = i % 24;
      if (hour >= 6 && hour < 23) {
        dayPrices.push(price);
      } else {
        nightPrices.push(price);
      }
    });

    // Calculate averages
    const avgElectricity = electricityPrices.reduce((a, b) => a + b, 0) / electricityPrices.length;
    const electricityDay = dayPrices.length > 0 
      ? dayPrices.reduce((a, b) => a + b, 0) / dayPrices.length 
      : avgElectricity;
    const electricityNight = nightPrices.length > 0 
      ? nightPrices.reduce((a, b) => a + b, 0) / nightPrices.length 
      : avgElectricity;
    const minElectricity = Math.min(...electricityPrices);
    const maxElectricity = Math.max(...electricityPrices);

    // Fetch gas prices (usageType=3)
    const gasResponse = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${fromTimestamp}&tillDate=${tillTimestamp}&interval=4&usageType=3&inclBtw=false`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    let gasAverage = 0.80; // Fallback
    let minGas = 0.70;
    let maxGas = 0.90;
    
    if (gasResponse.ok) {
      const gasData = await gasResponse.json();
      const gasPrices = (gasData.Prices || []).map(p => {
        return parseFloat(p.price || 0);
      }).filter(p => p > 0);
      
      if (gasPrices.length > 0) {
        gasAverage = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length;
        minGas = Math.min(...gasPrices);
        maxGas = Math.max(...gasPrices);
      }
    } else {
      console.warn(`⚠️ EnergyZero gas API error voor ${dateStr}: ${gasResponse.status}`);
    }

    return {
      datum: dateStr,
      elektriciteit_gemiddeld_dag: electricityDay,
      elektriciteit_gemiddeld_nacht: electricityNight,
      elektriciteit_min_dag: minElectricity,
      elektriciteit_max_dag: maxElectricity,
      gas_gemiddeld: gasAverage,
      gas_min: minGas,
      gas_max: maxGas,
      bron: 'ENERGYZERO',
      is_voorspelling: false,
    };
    
  } catch (error) {
    console.error(`❌ Fout bij ophalen prijzen voor ${dateStr}: ${error.message}`);
    return null;
  }
}

/**
 * Save prices to Supabase
 */
async function savePrices(prices) {
  if (!prices) return false;
  
  try {
    const upsertData = {
      ...prices,
      laatst_geupdate: new Date().toISOString(),
    };
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/dynamic_prices`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(upsertData),
    });

    if (response.ok || response.status === 201) {
      return true;
    } else {
      // Try PATCH if POST fails (record exists)
      const patchResponse = await fetch(`${SUPABASE_URL}/rest/v1/dynamic_prices?datum=eq.${prices.datum}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(upsertData),
      });
      
      return patchResponse.ok;
    }
  } catch (error) {
    console.error(`❌ Fout bij opslaan voor ${prices.datum}: ${error.message}`);
    return false;
  }
}

/**
 * Get existing dates from database
 */
async function getExistingDates() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/dynamic_prices?select=datum&order=datum.desc`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return new Set(data.map(d => d.datum));
    }
    return new Set();
  } catch (error) {
    console.error(`❌ Fout bij ophalen bestaande datums: ${error.message}`);
    return new Set();
  }
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main backfill function
 */
async function backfill30Days() {
  console.log('🔄 START: Backfill 30 dagen historische prijzen\n');
  console.log('='.repeat(60));
  
  // Get existing dates
  console.log('\n📋 Controleren welke datums al in de database staan...');
  const existingDates = await getExistingDates();
  console.log(`✅ ${existingDates.size} datums gevonden in database\n`);
  
  // Calculate date range (last 30 days, excluding today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const datesToFetch = [];
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    datesToFetch.push(date);
  }
  
  console.log(`📅 Datum range: ${datesToFetch[datesToFetch.length - 1].toISOString().split('T')[0]} tot ${datesToFetch[0].toISOString().split('T')[0]}`);
  console.log(`📊 ${datesToFetch.length} dagen te verwerken\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  // Process each date
  for (let i = 0; i < datesToFetch.length; i++) {
    const date = datesToFetch[i];
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if date already exists
    if (existingDates.has(dateStr)) {
      console.log(`⏭️  [${i + 1}/${datesToFetch.length}] ${dateStr} - al aanwezig, overslaan`);
      skipCount++;
      continue;
    }
    
    console.log(`📡 [${i + 1}/${datesToFetch.length}] Ophalen prijzen voor ${dateStr}...`);
    
    // Fetch prices
    const prices = await fetchDayAheadPrices(date);
    
    if (prices) {
      // Save to database
      const saved = await savePrices(prices);
      
      if (saved) {
        console.log(`   ✅ Opgeslagen: ⚡ Dag: €${prices.elektriciteit_gemiddeld_dag.toFixed(5)}, Nacht: €${prices.elektriciteit_gemiddeld_nacht.toFixed(5)}, 🔥 Gas: €${prices.gas_gemiddeld.toFixed(5)}`);
        successCount++;
      } else {
        console.log(`   ❌ Kon niet opslaan`);
        errorCount++;
      }
    } else {
      console.log(`   ⚠️  Geen prijzen beschikbaar voor ${dateStr}`);
      errorCount++;
    }
    
    // Rate limiting: wait 500ms between requests to avoid overwhelming the API
    if (i < datesToFetch.length - 1) {
      await sleep(500);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTAAT:');
  console.log(`   ✅ Succesvol opgeslagen: ${successCount}`);
  console.log(`   ⏭️  Overgeslagen (al aanwezig): ${skipCount}`);
  console.log(`   ❌ Fouten: ${errorCount}`);
  console.log(`   📊 Totaal verwerkt: ${successCount + skipCount + errorCount} van ${datesToFetch.length}`);
  console.log('='.repeat(60));
  console.log('✅ KLAAR!\n');
}

// Run the backfill
backfill30Days().catch(error => {
  console.error('\n❌ FATALE FOUT:', error);
  process.exit(1);
});

