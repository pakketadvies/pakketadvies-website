import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateAanbiedingInteresseEmail } from '@/lib/email-templates'
import { appendLeadToDonSheet } from '@/lib/google-sheets'

interface GasVastzettenClaimData {
  naam: string
  telefoon: string
  bedrijfsnaam: string
  privacy_akkoord: boolean
}

const AANBIEDING_NAAM = 'Gastarief vastzetten (tot 4,5 jaar)'

/**
 * Format a Date in Europe/Amsterdam timezone as "YYYY-MM-DD HH:mm:ss".
 * Wordt gebruikt voor de Datum-kolom in de Don-spreadsheet zodat het past
 * bij de bestaande rijen.
 */
function formatDonDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}

/**
 * POST /api/aanbieding/gas-vastzetten
 *
 * Verwerkt het korte claim-formulier op de pagina
 * /aanbieding/gas-vastzetten. Geen e-mail nodig — alleen
 * naam, telefoon en bedrijfsnaam. Stuurt zowel een
 * notificatie-mail naar het PakketAdvies team als een
 * regel naar de "Don" sheet in de Rick & Don Spreadsheet.
 */
export async function POST(request: Request) {
  try {
    const body: GasVastzettenClaimData = await request.json()

    if (!body.naam || !body.telefoon || !body.bedrijfsnaam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Naam, telefoonnummer en bedrijfsnaam zijn verplicht.',
        },
        { status: 400 }
      )
    }

    if (!body.privacy_akkoord) {
      return NextResponse.json(
        {
          success: false,
          error: 'Je moet akkoord gaan met de privacyvoorwaarden.',
        },
        { status: 400 }
      )
    }

    // ----------------------------------------------
    // Notificatie-mail naar het PakketAdvies team
    // ----------------------------------------------
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('[gas-vastzetten] RESEND_API_KEY niet gezet, mail wordt overgeslagen')
      } else {
        let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'
        if (baseUrl.includes('-') && baseUrl.includes('.vercel.app')) {
          baseUrl = 'https://pakketadvies.nl'
        }

        const emailHtml = generateAanbiedingInteresseEmail({
          aanbiedingType: 'gas-vastzetten',
          naam: body.naam,
          telefoon: body.telefoon,
          bedrijfsnaam: body.bedrijfsnaam,
          baseUrl,
        })

        const resend = new Resend(process.env.RESEND_API_KEY)
        const recipientEmail =
          process.env.CONTACT_FORM_RECIPIENT_EMAIL || 'info@pakketadvies.nl'

        let fromEmail = (
          process.env.RESEND_FROM_EMAIL || 'PakketAdvies <noreply@pakketadvies.nl>'
        )
          .trim()
          .replace(/\n/g, '')
          .replace(/\r/g, '')
        if (
          (fromEmail.startsWith('"') && fromEmail.endsWith('"')) ||
          (fromEmail.startsWith("'") && fromEmail.endsWith("'"))
        ) {
          fromEmail = fromEmail.slice(1, -1)
        }

        console.log('📧 [gas-vastzetten] Notificatiemail sturen naar:', recipientEmail)
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          subject: `🔥 Nieuwe claim: ${AANBIEDING_NAAM} | PakketAdvies`,
          html: emailHtml,
        })

        if (emailError) {
          console.error('❌ [gas-vastzetten] Resend error:', emailError)
        } else {
          console.log('✅ [gas-vastzetten] Notificatiemail verstuurd, id:', emailResult?.id)
        }
      }
    } catch (emailError) {
      console.error('❌ [gas-vastzetten] Onverwachte mail-fout:', emailError)
      // non-blocking
    }

    // ----------------------------------------------
    // Google Sheets — "Don" tab in de Rick & Don Spreadsheet
    // Kolommen: Datum | Energieleverancier | Postcode | huisnummer |
    //           stroom | gas | naam klant | telefoonnummer |
    //           e-mailadres | belpogingen | opmerkingen
    // ----------------------------------------------
    try {
      console.log('📊 [gas-vastzetten] Schrijven naar Don-sheet...')
      await appendLeadToDonSheet({
        datum: formatDonDate(),
        energieleverancier: '',
        postcode: '',
        huisnummer: '',
        stroom: '',
        gas: '',
        naamKlant: body.naam,
        telefoonnummer: body.telefoon,
        emailadres: '',
        belpogingen: '',
        opmerkingen: `Bedrijfsnaam: ${body.bedrijfsnaam} — Bron: gas-vastzetten landingspage (${AANBIEDING_NAAM})`,
      })
      console.log('✅ [gas-vastzetten] Don-sheet bijgewerkt')
    } catch (sheetsError) {
      console.error(
        '❌ [gas-vastzetten] Don-sheet fout (non-blocking):',
        sheetsError
      )
      // non-blocking: formulier blijft werken
    }

    return NextResponse.json({
      success: true,
      message:
        'Bedankt — we hebben je gegevens ontvangen en bellen je zo snel mogelijk terug.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende fout'
    console.error('[gas-vastzetten] Onverwachte fout:', error)
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden. Probeer het later opnieuw.', details: message },
      { status: 500 }
    )
  }
}
