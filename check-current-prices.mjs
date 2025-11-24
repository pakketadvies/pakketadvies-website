import fetch from 'node-fetch';

const SUPABASE_URL = 'https://dxztyhwiwgrxjnlohapm.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4enR5aHdpd2dyeGpubG9oYXBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ1MjI4NSwiZXhwIjoyMDc5MDI4Mjg1fQ.n9u7aOE8GdYKY2pBLYg8tJxO90d5UU6vWmlgKm4baFo';

async function checkCurrentPrices() {
  try {
    // 1. Haal de laatste marktprijzen op
    console.log('📊 HUIDIGE MARKTPRIJZEN UIT SUPABASE\n');
    console.log('=' .repeat(60));
    
    const pricesResponse = await fetch(`${SUPABASE_URL}/rest/v1/dynamic_prices?select=*&order=datum.desc&limit=3`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });
    
    let latestPrices = null;
    if (pricesResponse.ok) {
      const prices = await pricesResponse.json();
      if (prices.length > 0) {
        latestPrices = prices[0];
        
        // Show all available dates
        if (prices.length > 1) {
          console.log('\n📅 Alle beschikbare datums:');
          prices.forEach(p => {
            console.log(`   - ${p.datum} (${p.bron}, updated: ${new Date(p.laatst_geupdate).toLocaleString('nl-NL')})`);
          });
          console.log('');
        }
        console.log(`📅 Datum: ${latestPrices.datum}`);
        console.log(`📡 Bron: ${latestPrices.bron}`);
        console.log(`🕐 Laatst geupdate: ${latestPrices.laatst_geupdate}`);
        console.log('\n⚡ ELEKTRICITEIT PRIJZEN (€/kWh excl. BTW):');
        console.log(`   - Gemiddeld dag (06:00-23:00): €${parseFloat(latestPrices.elektriciteit_gemiddeld_dag).toFixed(5)}`);
        console.log(`   - Gemiddeld nacht (23:00-06:00): €${parseFloat(latestPrices.elektriciteit_gemiddeld_nacht).toFixed(5)}`);
        console.log(`   - Min dag: €${parseFloat(latestPrices.elektriciteit_min_dag || 0).toFixed(5)}`);
        console.log(`   - Max dag: €${parseFloat(latestPrices.elektriciteit_max_dag || 0).toFixed(5)}`);
        console.log(`\n🔥 GAS PRIJZEN (€/m³ excl. BTW):`);
        console.log(`   - Gemiddeld: €${parseFloat(latestPrices.gas_gemiddeld).toFixed(5)}`);
        console.log(`   - Min: €${parseFloat(latestPrices.gas_min || 0).toFixed(5)}`);
        console.log(`   - Max: €${parseFloat(latestPrices.gas_max || 0).toFixed(5)}`);
        
        // Bereken enkel tarief gemiddelde
        const S_dag = parseFloat(latestPrices.elektriciteit_gemiddeld_dag);
        const S_nacht = parseFloat(latestPrices.elektriciteit_gemiddeld_nacht);
        const S_enkel = (S_dag + S_nacht) / 2;
        
        console.log(`\n📐 BEREKEND ENKELTARIEF GEMIDDELDE:`);
        console.log(`   - S_enkel = (€${S_dag.toFixed(5)} + €${S_nacht.toFixed(5)}) / 2 = €${S_enkel.toFixed(5)}`);
      } else {
        console.log('❌ Geen marktprijzen gevonden in database');
      }
    } else {
      console.log('❌ Kon marktprijzen niet ophalen');
    }
    
    // 2. Haal dynamische contracten op om opslagen te zien
    console.log('\n' + '='.repeat(60));
    console.log('📋 DYNAMISCHE CONTRACTEN MET OPSLAGEN\n');
    
    const contractsResponse = await fetch(`${SUPABASE_URL}/rest/v1/contract_details_dynamisch?select=*,contracten(id,naam,type)`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });
    
    if (contractsResponse.ok) {
      const contracts = await contractsResponse.json();
      if (contracts.length > 0) {
        contracts.forEach((contract, index) => {
          console.log(`\n📄 Contract ${index + 1}:`);
          console.log(`   Naam: ${contract.contracten?.naam || 'N/A'}`);
          console.log(`   Opslag elektriciteit: €${parseFloat(contract.opslag_elektriciteit || 0).toFixed(5)}/kWh`);
          console.log(`   Opslag gas: €${parseFloat(contract.opslag_gas || 0).toFixed(5)}/m³`);
          console.log(`   Opslag teruglevering: €${parseFloat(contract.opslag_teruglevering || 0).toFixed(5)}/kWh`);
          
          // Bereken totale tarieven
          if (latestPrices) {
            const latest = latestPrices;
            const S_dag = parseFloat(latest.elektriciteit_gemiddeld_dag);
            const S_nacht = parseFloat(latest.elektriciteit_gemiddeld_nacht);
            const S_enkel = (S_dag + S_nacht) / 2;
            const S_gas = parseFloat(latest.gas_gemiddeld);
            const opslag_elektriciteit = parseFloat(contract.opslag_elektriciteit || 0);
            const opslag_gas = parseFloat(contract.opslag_gas || 0);
            const opslag_teruglevering = parseFloat(contract.opslag_teruglevering || 0);
            
            console.log(`\n   💰 TOTALE TARIEVEN (marktprijs + opslag):`);
            console.log(`      - Stroom dag: €${S_dag.toFixed(5)} + €${opslag_elektriciteit.toFixed(5)} = €${(S_dag + opslag_elektriciteit).toFixed(5)}/kWh`);
            console.log(`      - Stroom nacht: €${S_nacht.toFixed(5)} + €${opslag_elektriciteit.toFixed(5)} = €${(S_nacht + opslag_elektriciteit).toFixed(5)}/kWh`);
            console.log(`      - Stroom enkel: €${S_enkel.toFixed(5)} + €${opslag_elektriciteit.toFixed(5)} = €${(S_enkel + opslag_elektriciteit).toFixed(5)}/kWh`);
            console.log(`      - Gas: €${S_gas.toFixed(5)} + €${opslag_gas.toFixed(5)} = €${(S_gas + opslag_gas).toFixed(5)}/m³`);
            console.log(`      - Teruglevering: €${S_enkel.toFixed(5)} + €${opslag_teruglevering.toFixed(5)} = €${(S_enkel + opslag_teruglevering).toFixed(5)}/kWh`);
          }
        });
      } else {
        console.log('ℹ️ Geen dynamische contracten gevonden in database');
      }
    } else {
      console.log('❌ Kon contracten niet ophalen');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Klaar!\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkCurrentPrices();

