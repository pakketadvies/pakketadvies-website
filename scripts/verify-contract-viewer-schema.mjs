import { createClient } from '@supabase/supabase-js'

// Supabase credentials
const supabaseUrl = 'https://dxztyhwiwgrxjnlohapm.supabase.co'
const supabaseKey = 'sbp_c83911ed6bc5742cd764bc8041fcd657f154f6bf'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySchema() {
  console.log('🔍 Verifying contract_viewer_access table schema...\n')
  
  try {
    // Try to fetch a sample record to see structure
    const { data: sample, error: sampleError } = await supabase
      .from('contract_viewer_access')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    if (sampleError) {
      console.error('❌ Error accessing table:', sampleError.message)
      console.error('   Code:', sampleError.code)
      console.error('   Details:', sampleError.details)
      return
    }
    
    if (sample) {
      console.log('✅ Table exists and is accessible')
      console.log('\n📋 Columns found in table:')
      Object.keys(sample).forEach(key => {
        const value = sample[key]
        const type = value === null ? 'NULL' : typeof value
        console.log(`   - ${key}: ${type}${value !== null ? ` (${value})` : ''}`)
      })
      
      if ('expires_at' in sample) {
        console.log('\n✅ expires_at column EXISTS')
        if (sample.expires_at) {
          console.log(`   Value: ${sample.expires_at}`)
          const expiresDate = new Date(sample.expires_at)
          const now = new Date()
          if (expiresDate < now) {
            console.log('   ⚠️  This token is EXPIRED')
          } else {
            console.log('   ✅ This token is VALID')
          }
        } else {
          console.log('   ⚠️  Value is NULL')
        }
      } else {
        console.log('\n❌ expires_at column MISSING - NEEDS MIGRATION')
      }
    } else {
      console.log('⚠️  Table exists but no records found')
      console.log('   Cannot determine schema from records')
    }
    
    // Check total count
    const { count, error: countError } = await supabase
      .from('contract_viewer_access')
      .select('*', { count: 'exact', head: true })
    
    if (!countError) {
      console.log(`\n📊 Total tokens in database: ${count}`)
    }
    
    // Check recent tokens
    if (count > 0) {
      const { data: recent, error: recentError } = await supabase
        .from('contract_viewer_access')
        .select('id, access_token, expires_at, created_at, accessed_at')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (!recentError && recent && recent.length > 0) {
        console.log('\n📋 Recent tokens:')
        recent.forEach((token, idx) => {
          console.log(`\n   Token ${idx + 1}:`)
          console.log(`   - Created: ${token.created_at}`)
          console.log(`   - Expires: ${token.expires_at || 'NULL (no expiration)'}`)
          console.log(`   - Accessed: ${token.accessed_at || 'Never'}`)
          if (token.expires_at) {
            const expiresDate = new Date(token.expires_at)
            const now = new Date()
            if (expiresDate < now) {
              console.log(`   - Status: ❌ EXPIRED`)
            } else {
              console.log(`   - Status: ✅ VALID`)
            }
          } else {
            console.log(`   - Status: ⚠️  NO EXPIRATION SET`)
          }
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error(error.stack)
  }
}

verifySchema()

