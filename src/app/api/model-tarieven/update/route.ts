import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT /api/model-tarieven/update
 * 
 * Updates Eneco modeltarieven in Supabase
 * Requires admin authentication
 */
export async function PUT(request: Request) {
  console.log('🔵 [MODEL-TARIEVEN-UPDATE] Request ontvangen')
  
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('❌ [MODEL-TARIEVEN-UPDATE] Auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }
    console.log('✅ [MODEL-TARIEVEN-UPDATE] User geauthenticeerd:', user.id)

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.error('❌ [MODEL-TARIEVEN-UPDATE] Geen admin rechten')
      return NextResponse.json(
        { success: false, error: 'Geen admin rechten' },
        { status: 403 }
      )
    }
    console.log('✅ [MODEL-TARIEVEN-UPDATE] Admin rechten bevestigd')

    const body = await request.json()
    console.log('📥 [MODEL-TARIEVEN-UPDATE] Body ontvangen:', JSON.stringify(body, null, 2))
    
    const {
      tarief_elektriciteit_normaal,
      tarief_elektriciteit_dal,
      tarief_elektriciteit_enkel,
      tarief_gas,
      vastrecht_stroom_maand,
      vastrecht_gas_maand,
      opmerkingen,
    } = body
    
    console.log('📊 [MODEL-TARIEVEN-UPDATE] Geparsed tarieven:', {
      tarief_elektriciteit_normaal,
      tarief_elektriciteit_dal,
      tarief_elektriciteit_enkel,
      tarief_gas,
      vastrecht_stroom_maand,
      vastrecht_gas_maand,
      opmerkingen,
    })

    // Validate required fields
    if (
      typeof tarief_elektriciteit_normaal !== 'number' ||
      typeof tarief_elektriciteit_dal !== 'number' ||
      typeof tarief_elektriciteit_enkel !== 'number' ||
      typeof tarief_gas !== 'number' ||
      typeof vastrecht_stroom_maand !== 'number' ||
      typeof vastrecht_gas_maand !== 'number'
    ) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige tarieven' },
        { status: 400 }
      )
    }

    // Get current active modeltarieven
    console.log('🔍 [MODEL-TARIEVEN-UPDATE] Zoeken naar actieve modeltarieven...')
    const { data: currentTarieven, error: currentError } = await supabase
      .from('model_tarieven')
      .select('id, vastrecht_stroom_maand, vastrecht_gas_maand')
      .eq('actief', true)
      .single()

    if (currentError) {
      console.error('❌ [MODEL-TARIEVEN-UPDATE] Fout bij ophalen huidige tarieven:', currentError)
    }

    if (currentTarieven) {
      console.log('📝 [MODEL-TARIEVEN-UPDATE] Huidige tarieven gevonden:', {
        id: currentTarieven.id,
        huidig_vastrecht_stroom: currentTarieven.vastrecht_stroom_maand,
        huidig_vastrecht_gas: currentTarieven.vastrecht_gas_maand,
      })
      
      // Update existing active tarieven
      const updateData = {
        tarief_elektriciteit_normaal,
        tarief_elektriciteit_dal,
        tarief_elektriciteit_enkel,
        tarief_gas,
        vastrecht_stroom_maand,
        vastrecht_gas_maand,
        opmerkingen: opmerkingen || null,
        updated_at: new Date().toISOString(),
      }
      
      console.log('💾 [MODEL-TARIEVEN-UPDATE] Update data:', JSON.stringify(updateData, null, 2))
      console.log('🔧 [MODEL-TARIEVEN-UPDATE] Updating record met id:', currentTarieven.id)
      
      const { data: updateResult, error: updateError } = await supabase
        .from('model_tarieven')
        .update(updateData)
        .eq('id', currentTarieven.id)
        .select()

      if (updateError) {
        console.error('❌ [MODEL-TARIEVEN-UPDATE] Update error:', updateError)
        console.error('❌ [MODEL-TARIEVEN-UPDATE] Update error details:', JSON.stringify(updateError, null, 2))
        throw updateError
      }
      
      console.log('✅ [MODEL-TARIEVEN-UPDATE] Update succesvol, resultaat:', JSON.stringify(updateResult, null, 2))

      // Fetch updated record to verify
      console.log('🔍 [MODEL-TARIEVEN-UPDATE] Verifiëren update door record opnieuw op te halen...')
      const { data: updatedData, error: fetchError } = await supabase
        .from('model_tarieven')
        .select('*')
        .eq('id', currentTarieven.id)
        .single()

      if (fetchError) {
        console.error('❌ [MODEL-TARIEVEN-UPDATE] Fetch error na update:', fetchError)
        throw fetchError
      }
      
      console.log('✅ [MODEL-TARIEVEN-UPDATE] Geverifieerde data uit Supabase:', {
        id: updatedData.id,
        vastrecht_stroom_maand: updatedData.vastrecht_stroom_maand,
        vastrecht_gas_maand: updatedData.vastrecht_gas_maand,
        tarief_elektriciteit_normaal: updatedData.tarief_elektriciteit_normaal,
        tarief_gas: updatedData.tarief_gas,
        updated_at: updatedData.updated_at,
      })

      return NextResponse.json({
        success: true,
        tarieven: updatedData,
      })
    } else {
      // Create new active tarieven
      const { data: insertedData, error: insertError } = await supabase
        .from('model_tarieven')
        .insert({
          leverancier_naam: 'Eneco',
          tarief_elektriciteit_normaal,
          tarief_elektriciteit_dal,
          tarief_elektriciteit_enkel,
          tarief_gas,
          vastrecht_stroom_maand,
          vastrecht_gas_maand,
          ingangsdatum: new Date().toISOString().split('T')[0], // Required field, set to today
          actief: true,
          opmerkingen: opmerkingen || null,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return NextResponse.json({
        success: true,
        tarieven: insertedData,
      })
    }
  } catch (error: any) {
    console.error('❌ [MODEL-TARIEVEN-UPDATE] Fout in catch block:', error)
    console.error('❌ [MODEL-TARIEVEN-UPDATE] Error message:', error.message)
    console.error('❌ [MODEL-TARIEVEN-UPDATE] Error stack:', error.stack)
    console.error('❌ [MODEL-TARIEVEN-UPDATE] Full error:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij updaten modeltarieven' },
      { status: 500 }
    )
  }
}

