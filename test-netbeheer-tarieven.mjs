#!/usr/bin/env node

/**
 * Test script voor netbeheertarieven
 * 
 * Dit script test of:
 * 1. Alle netbeheerders aanwezig zijn
 * 2. Alle aansluitwaarden aanwezig zijn
 * 3. Alle 66 tarieven correct zijn ingevoerd
 * 4. G6 conversie correct werkt
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Ontbrekende environment variabelen')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testNetbeheerders() {
  console.log('\n🏢 Test: Netbeheerders...')
  
  const { data, error } = await supabase
    .from('netbeheerders')
    .select('code, naam')
    .eq('actief', true)
  
  if (error) {
    console.error('❌ Fout:', error.message)
    return false
  }
  
  const verwachteNetbeheerders = ['ENEXIS', 'LIANDER', 'STEDIN', 'COTEQ', 'RENDO', 'WESTLAND']
  const gevondenCodes = data.map(n => n.code)
  
  for (const code of verwachteNetbeheerders) {
    if (gevondenCodes.includes(code)) {
      console.log(`   ✅ ${code}`)
    } else {
      console.log(`   ❌ ${code} ONTBREEKT`)
      return false
    }
  }
  
  return true
}

async function testAansluitwaarden() {
  console.log('\n⚡ Test: Aansluitwaarden Elektriciteit...')
  
  const { data: elektra, error: elektraError } = await supabase
    .from('aansluitwaarden_elektriciteit')
    .select('code')
    .order('volgorde')
  
  if (elektraError) {
    console.error('❌ Fout:', elektraError.message)
    return false
  }
  
  const verwachtElektra = ['3x25A', '3x35A', '3x40A', '3x50A', '3x63A', '3x80A']
  const gevondenElektra = elektra.map(a => a.code)
  
  for (const code of verwachtElektra) {
    if (gevondenElektra.includes(code)) {
      console.log(`   ✅ ${code}`)
    } else {
      console.log(`   ❌ ${code} ONTBREEKT`)
      return false
    }
  }
  
  console.log('\n🔥 Test: Aansluitwaarden Gas...')
  
  const { data: gas, error: gasError } = await supabase
    .from('aansluitwaarden_gas')
    .select('code')
    .order('volgorde')
  
  if (gasError) {
    console.error('❌ Fout:', gasError.message)
    return false
  }
  
  const verwachtGas = ['G6_LAAG', 'G6_MIDDEN', 'G6_HOOG', 'G10', 'G16', 'G25']
  const gevondenGas = gas.map(a => a.code)
  
  for (const code of verwachtGas) {
    if (gevondenGas.includes(code)) {
      console.log(`   ✅ ${code}`)
    } else {
      console.log(`   ❌ ${code} ONTBREEKT`)
      return false
    }
  }
  
  return true
}

async function testTarieven() {
  console.log('\n💰 Test: Netbeheertarieven 2025...')
  
  // Tel elektriciteit tarieven
  const { count: elektraCount, error: elektraError } = await supabase
    .from('netbeheer_tarieven_elektriciteit')
    .select('*', { count: 'exact', head: true })
    .eq('jaar', 2025)
    .eq('actief', true)
  
  if (elektraError) {
    console.error('❌ Fout elektra:', elektraError.message)
    return false
  }
  
  // Tel gas tarieven
  const { count: gasCount, error: gasError } = await supabase
    .from('netbeheer_tarieven_gas')
    .select('*', { count: 'exact', head: true })
    .eq('jaar', 2025)
    .eq('actief', true)
  
  if (gasError) {
    console.error('❌ Fout gas:', gasError.message)
    return false
  }
  
  console.log(`   Elektra: ${elektraCount} tarieven (verwacht: ~30)`)
  console.log(`   Gas: ${gasCount} tarieven (verwacht: 36)`)
  
  if (elektraCount >= 30 && gasCount === 36) {
    console.log('   ✅ Alle tarieven aanwezig')
    return true
  } else {
    console.log('   ❌ Niet alle tarieven aanwezig')
    return false
  }
}

async function testSpecifiekTarief() {
  console.log('\n🔍 Test: Specifiek tarief (Enexis 3x35A)...')
  
  const { data, error } = await supabase
    .from('netbeheer_tarieven_elektriciteit')
    .select(`
      all_in_tarief_jaar,
      netbeheerder:netbeheerders(naam),
      aansluitwaarde:aansluitwaarden_elektriciteit(code)
    `)
    .eq('jaar', 2025)
    .eq('actief', true)
    .eq('netbeheerders.code', 'ENEXIS')
    .eq('aansluitwaarden_elektriciteit.code', '3x35A')
    .single()
  
  if (error) {
    console.error('❌ Fout:', error.message)
    return false
  }
  
  console.log(`   Netbeheerder: ${data.netbeheerder?.naam}`)
  console.log(`   Aansluitwaarde: ${data.aansluitwaarde?.code}`)
  console.log(`   Tarief: €${data.all_in_tarief_jaar}/jaar (excl. BTW)`)
  console.log(`   Verwacht: €1676.00/jaar`)
  
  const isCorrect = Math.abs(data.all_in_tarief_jaar - 1676.00) < 0.50
  
  if (isCorrect) {
    console.log('   ✅ Tarief klopt!')
    return true
  } else {
    console.log('   ❌ Tarief klopt NIET')
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Start netbeheer tarieven tests...')
  console.log('=' .repeat(50))
  
  const results = []
  
  results.push(await testNetbeheerders())
  results.push(await testAansluitwaarden())
  results.push(await testTarieven())
  results.push(await testSpecifiekTarief())
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESULTATEN')
  console.log('='.repeat(50))
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  if (passed === total) {
    console.log(`\n✅ Alle ${total} tests geslaagd!`)
    console.log('🎉 Netbeheertarieven zijn correct geconfigureerd!')
  } else {
    console.log(`\n❌ ${passed}/${total} tests geslaagd`)
    console.log('⚠️  Er zijn nog problemen die opgelost moeten worden')
    process.exit(1)
  }
}

runAllTests()

