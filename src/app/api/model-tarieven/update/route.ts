import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT /api/model-tarieven/update
 * 
 * Updates Eneco modeltarieven in Supabase
 * Requires admin authentication
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Geen admin rechten' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      tarief_elektriciteit_normaal,
      tarief_elektriciteit_dal,
      tarief_elektriciteit_enkel,
      tarief_gas,
      vastrecht_stroom_maand,
      vastrecht_gas_maand,
      opmerkingen,
    } = body

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
    const { data: currentTarieven } = await supabase
      .from('model_tarieven')
      .select('id')
      .eq('actief', true)
      .single()

    if (currentTarieven) {
      // Update existing active tarieven
      const { error: updateError } = await supabase
        .from('model_tarieven')
        .update({
          tarief_elektriciteit_normaal,
          tarief_elektriciteit_dal,
          tarief_elektriciteit_enkel,
          tarief_gas,
          vastrecht_stroom_maand,
          vastrecht_gas_maand,
          opmerkingen: opmerkingen || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentTarieven.id)

      if (updateError) {
        throw updateError
      }

      // Fetch updated record
      const { data: updatedData, error: fetchError } = await supabase
        .from('model_tarieven')
        .select('*')
        .eq('id', currentTarieven.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

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
    console.error('Error updating model tarieven:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij updaten modeltarieven' },
      { status: 500 }
    )
  }
}

