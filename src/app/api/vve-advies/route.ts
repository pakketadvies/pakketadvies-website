import { Resend } from 'resend'
import { z } from 'zod'
import { apiError, apiSuccess } from '@/lib/api/response'
import { parseJsonBody } from '@/lib/api/validation'
import { appendLeadToSheet } from '@/lib/google-sheets'

const vveAdviceSchema = z.object({
  naam: z.string().trim().min(2, 'Naam is verplicht'),
  locatieVve: z.string().trim().min(2, 'Locatie VvE is verplicht'),
  telefoon: z.string().trim().min(8, 'Telefoonnummer is verplicht'),
  website: z.string().optional(),
})

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  const parsedBody = await parseJsonBody(request, vveAdviceSchema)
  if (!parsedBody.success) {
    return apiError(parsedBody.error, 400)
  }

  const body = parsedBody.data

  if (body.website && body.website.trim() !== '') {
    return apiSuccess({
      message: 'Je aanvraag is ontvangen. We nemen zo snel mogelijk contact op.',
    })
  }

  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const recipientEmail = process.env.CONTACT_FORM_RECIPIENT_EMAIL || 'info@pakketadvies.nl'

      let fromEmail = (process.env.RESEND_FROM_EMAIL || 'PakketAdvies <noreply@pakketadvies.nl>')
        .trim()
        .replace(/\n/g, '')
        .replace(/\r/g, '')
      if ((fromEmail.startsWith('"') && fromEmail.endsWith('"')) || (fromEmail.startsWith("'") && fromEmail.endsWith("'"))) {
        fromEmail = fromEmail.slice(1, -1)
      }

      const emailHtml = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#102a43;">
          <h2 style="margin-bottom:12px;">Nieuwe VvE adviesaanvraag</h2>
          <p style="margin:0 0 12px 0;">Er is een nieuwe aanvraag via de VvE-pagina binnengekomen.</p>
          <table style="border-collapse:collapse;width:100%;max-width:640px;">
            <tr>
              <td style="padding:8px 0;font-weight:700;width:180px;">Naam</td>
              <td style="padding:8px 0;">${escapeHtml(body.naam)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-weight:700;">Locatie VvE</td>
              <td style="padding:8px 0;">${escapeHtml(body.locatieVve)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-weight:700;">Telefoonnummer</td>
              <td style="padding:8px 0;">${escapeHtml(body.telefoon)}</td>
            </tr>
          </table>
        </div>
      `.trim()

      const { error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: 'Nieuwe VvE adviesaanvraag | PakketAdvies',
        html: emailHtml,
      })

      if (emailError) {
        console.error('❌ [vve-advies] Email send failed:', emailError)
      }
    }
  } catch (error) {
    console.error('❌ [vve-advies] Unexpected error sending email:', error)
  }

  try {
    await appendLeadToSheet({
      datumLeadBinnen: new Date().toISOString(),
      huidigeLeveranciers: '',
      postcode: body.locatieVve,
      huisnummer: '',
      stroom: '',
      gas: '',
      naam: body.naam,
      telefoonnummer: body.telefoon,
      emailadres: '',
      opmerkingen: `VvE adviesaanvraag via sectorpagina. Locatie VvE: ${body.locatieVve}`,
    })
  } catch (error) {
    console.error('❌ [vve-advies] Error writing to Google Sheets (non-blocking):', error)
  }

  return apiSuccess({
    message: 'Je aanvraag is ontvangen. We nemen zo snel mogelijk contact op.',
  })
}
