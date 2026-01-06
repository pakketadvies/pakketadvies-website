import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGridHubClientForLeverancier } from '@/lib/integrations/gridhub/client'

/**
 * POST /api/admin/energiek/sync-tarieven
 * 
 * Attempts to sync tariff information from GridHub API
 * Falls back to manual configuration if API doesn't support it
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Authenticate admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Energiek.nl leverancier
    const { data: leverancier, error: leverancierError } = await supabase
      .from('leveranciers')
      .select('id, naam')
      .eq('naam', 'Energiek.nl')
      .single()

    if (leverancierError || !leverancier) {
      return NextResponse.json({ error: 'Energiek.nl leverancier niet gevonden' }, { status: 404 })
    }

    // Get GridHub config
    const { data: apiConfig, error: configError } = await supabase
      .from('leverancier_api_config')
      .select('*')
      .eq('leverancier_id', leverancier.id)
      .eq('provider', 'GRIDHUB')
      .eq('actief', true)
      .single()

    if (configError || !apiConfig) {
      return NextResponse.json({ 
        error: 'Geen actieve GridHub configuratie gevonden',
        message: 'Configureer eerst de GridHub API credentials in de database'
      }, { status: 404 })
    }

    const gridhubClient = await getGridHubClientForLeverancier(leverancier.id)
    if (!gridhubClient) {
      return NextResponse.json({ 
        error: 'Kon GridHub client niet initialiseren',
        message: 'Check API credentials en GRIDHUB_ENCRYPTION_KEY'
      }, { status: 500 })
    }

    const productIds = apiConfig.product_ids as { particulier: string; zakelijk: string }
    const tariefIds = apiConfig.tarief_ids as { test: string; production: string }
    const environment = apiConfig.environment as 'test' | 'production'
    const tariffId = tariefIds[environment]

    // Try to fetch tariff info from GridHub
    let tariffInfo: any = null
    try {
      // Try particulier product
      tariffInfo = await gridhubClient.getProductTariffInfo(productIds.particulier, tariffId)
      
      if (!tariffInfo) {
        // Try zakelijk product
        tariffInfo = await gridhubClient.getProductTariffInfo(productIds.zakelijk, tariffId)
      }
    } catch (error: any) {
      console.warn('⚠️ [Sync Tarieven] GridHub API endpoint niet beschikbaar:', error.message)
    }

    if (tariffInfo) {
      // Update contracts with tariff info from GridHub
      // This would parse the response and update the database
      // For now, we'll return the info so admin can manually configure
      return NextResponse.json({
        success: true,
        message: 'Tarief informatie opgehaald van GridHub',
        tariffInfo,
        note: 'GridHub API ondersteunt mogelijk geen directe tarief ophaling. Configureer tarieven handmatig in admin panel of vraag Energiek.nl om de exacte tarieven.'
      })
    } else {
      // GridHub doesn't support tariff info endpoint
      return NextResponse.json({
        success: false,
        message: 'GridHub API ondersteunt geen directe tarief ophaling',
        instructions: [
          '1. Vraag Energiek.nl om de exacte tarieven:',
          '   - Opslag elektriciteit (€/kWh bovenop marktprijs)',
          '   - Opslag gas (€/m³ bovenop marktprijs)',
          '   - Vastrecht stroom (€/maand)',
          '   - Vastrecht gas (€/maand)',
          '2. Configureer deze handmatig in /admin/contracten',
          '3. Of wacht tot een order response met tarief info (als GridHub dat teruggeeft)'
        ]
      })
    }
  } catch (error: any) {
    console.error('❌ [Sync Tarieven] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Onbekende fout bij synchroniseren tarieven' },
      { status: 500 }
    )
  }
}

