async function testLiveAPI(query, testName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testName}`);
  console.log(`Query: "${query}"`);
  console.log('='.repeat(60));
  
  try {
    const url = `https://pakketadvies.vercel.app/api/kvk/search?query=${encodeURIComponent(query)}`;
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`Status: ${response.status}`);
    
    const data = await response.json();
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (response.ok && data.results && data.results.length > 0) {
      console.log(`✅ SUCCESS! Found ${data.results.length} results`);
      data.results.slice(0, 3).forEach((r, i) => {
        console.log(`  ${i+1}. ${r.bedrijfsnaam} (KvK: ${r.kvkNummer})`);
      });
      return true;
    } else if (response.ok && data.results && data.results.length === 0) {
      console.log(`⚠️ SUCCESS maar 0 results (query matcht niks)`);
      return true;
    } else {
      console.log(`❌ FAILED: ${data.message || data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 EXCEPTION: ${error.message}`);
    return false;
  }
}

(async () => {
  console.log('🧪 LIVE API TEST SUITE - pakketadvies.vercel.app');
  
  const tests = [
    { query: 'coolblue', name: 'Bedrijfsnaam: Coolblue' },
    { query: 'pakketadvies', name: 'Bedrijfsnaam: PakketAdvies' },
    { query: '88929', name: 'Gedeeltelijk KvK: 88929' },
    { query: '88929280', name: 'Volledig KvK: 88929280 (PakketAdvies)' },
    { query: '80929288', name: 'Foutief KvK: 80929288' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testLiveAPI(test.query, test.name);
    if (result) passed++;
    else failed++;
    await new Promise(r => setTimeout(r, 1000)); // 1s tussen tests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`🏁 TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log('❌ SOME TESTS FAILED');
  }
})();
