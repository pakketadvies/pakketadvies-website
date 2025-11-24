import fetch from 'node-fetch';

const SUPABASE_URL = 'https://dxztyhwiwgrxjnlohapm.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4enR5aHdpd2dyeGpubG9oYXBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ1MjI4NSwiZXhwIjoyMDc5MDI4Mjg1fQ.n9u7aOE8GdYKY2pBLYg8tJxO90d5UU6vWmlgKm4baFo';

async function fetchDayAheadPrices(date) {
  const dateStr = date.toISOString().split('T')[0];
  
  try {
    console.log(`\n📡 Ophalen prijzen voor ${dateStr} via EnergyZero API...`);
    
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
      console.warn(`⚠️ EnergyZero electricity API error: ${electricityResponse.status}`);
      return null;
    }

    const electricityData = await electricityResponse.json();
    
    // EnergyZero returns data in Prices array, prices are already in EUR/kWh
    const electricityPrices = (electricityData.Prices || []).map(p => {
      return parseFloat(p.price || 0);
    }).filter(p => p > 0); // Filter out invalid prices
    
    if (electricityPrices.length === 0) {
      console.warn('⚠️ Geen elektriciteitsprijzen gevonden');
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
    console.log(`📡 Ophalen gasprijzen voor ${dateStr}...`);
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
      // Gas prices from EnergyZero are typically already in EUR/m³
      const gasPrices = (gasData.Prices || []).map(p => {
        return parseFloat(p.price || 0);
      }).filter(p => p > 0);
      
      if (gasPrices.length > 0) {
        gasAverage = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length;
        minGas = Math.min(...gasPrices);
        maxGas = Math.max(...gasPrices);
      }
    } else {
      console.warn(`⚠️ EnergyZero gas API error: ${gasResponse.status}, gebruik fallback`);
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
    console.error(`❌ Fout bij ophalen prijzen: ${error.message}`);
    return null;
  }
}

async function savePrices(prices) {
  if (!prices) return false;
  
  console.log(`\n💾 Opslaan prijzen in database voor ${prices.datum}...`);
  
  try {
    // Try UPSERT (update if exists, insert if not)
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
      const result = await response.json();
      console.log(`✅ Prijzen opgeslagen!`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Fout bij opslaan (${response.status}): ${errorText}`);
      
      // Try PATCH if POST fails
      const patchResponse = await fetch(`${SUPABASE_URL}/rest/v1/dynamic_prices?datum=eq.${prices.datum}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(upsertData),
      });
      
      if (patchResponse.ok) {
        console.log(`✅ Prijzen bijgewerkt via PATCH!`);
        return true;
      } else {
        const patchError = await patchResponse.text();
        console.error(`❌ Ook PATCH faalde: ${patchError}`);
        return false;
      }
    }
  } catch (error) {
    console.error(`❌ Fout bij opslaan: ${error.message}`);
    return false;
  }
}

async function updatePrices() {
  console.log('🔄 START: Update dynamische energieprijzen\n');
  console.log('=' .repeat(60));
  
  // Haal prijzen op voor vandaag
  const today = new Date();
  const todayPrices = await fetchDayAheadPrices(today);
  
  if (todayPrices) {
    console.log(`\n📊 Opgehaalde prijzen voor ${todayPrices.datum}:`);
    console.log(`   ⚡ Elektriciteit dag: €${todayPrices.elektriciteit_gemiddeld_dag.toFixed(5)}/kWh`);
    console.log(`   ⚡ Elektriciteit nacht: €${todayPrices.elektriciteit_gemiddeld_nacht.toFixed(5)}/kWh`);
    console.log(`   ⚡ Elektriciteit gemiddeld: €${((todayPrices.elektriciteit_gemiddeld_dag + todayPrices.elektriciteit_gemiddeld_nacht) / 2).toFixed(5)}/kWh`);
    console.log(`   🔥 Gas: €${todayPrices.gas_gemiddeld.toFixed(5)}/m³`);
    console.log(`   📡 Bron: ${todayPrices.bron}`);
    
    await savePrices(todayPrices);
  } else {
    console.log('❌ Kon geen prijzen ophalen voor vandaag');
  }
  
  // Probeer ook morgen (als beschikbaar)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowPrices = await fetchDayAheadPrices(tomorrow);
  
  if (tomorrowPrices) {
    console.log(`\n📊 Opgehaalde prijzen voor ${tomorrowPrices.datum}:`);
    console.log(`   ⚡ Elektriciteit dag: €${tomorrowPrices.elektriciteit_gemiddeld_dag.toFixed(5)}/kWh`);
    console.log(`   ⚡ Elektriciteit nacht: €${tomorrowPrices.elektriciteit_gemiddeld_nacht.toFixed(5)}/kWh`);
    console.log(`   🔥 Gas: €${tomorrowPrices.gas_gemiddeld.toFixed(5)}/m³`);
    
    await savePrices(tomorrowPrices);
  } else {
    console.log('ℹ️ Morgen prijzen nog niet beschikbaar (normaal voor 12:00)');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ KLAAR!\n');
}

updatePrices();
