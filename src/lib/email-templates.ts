/**
 * Email templates for contract application workflow
 * Uses inline CSS for maximum email client compatibility
 */

export interface EmailBevestigingData {
  aanvraagnummer: string
  contractNaam: string
  leverancierNaam: string
  leverancierLogoUrl?: string | null
  klantNaam: string
  email: string
  adres: {
    straat: string
    huisnummer: string
    toevoeging?: string
    postcode: string
    plaats: string
  }
  verbruik: {
    elektriciteitNormaal?: number
    elektriciteitDal?: number | null
    elektriciteitTotaal: number
    heeftEnkeleMeter?: boolean
    gas: number
  }
  aansluitwaarden: {
    elektriciteit: string
    gas: string
  }
  maandbedrag: number
  jaarbedrag: number
  besparing?: number
  isZakelijk?: boolean // NIEUW: voor BTW label in email template
  contractViewerUrl: string
  baseUrl: string
}

/**
 * Generate the HTML email template for contract confirmation
 */
export function generateBevestigingEmail(data: EmailBevestigingData): string {
  const {
    aanvraagnummer,
    contractNaam,
    leverancierNaam,
    leverancierLogoUrl,
    klantNaam,
    adres,
    verbruik,
    aansluitwaarden,
    maandbedrag,
    jaarbedrag,
    besparing,
    contractViewerUrl,
    baseUrl,
    isZakelijk = false, // Default naar particulier (incl BTW)
  } = data

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const logoUrl = leverancierLogoUrl || `${baseUrl}/logo-placeholder.png`
  // Use white logo for perfect email client compatibility
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bevestiging van uw aanvraag - PakketAdvies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>

          <!-- Success Header -->
          <tr>
            <td style="background: #F0FDFA; padding: 30px 20px; text-align: center; border-top: 4px solid #14B8A6;">
              <h1 style="color: #0F4C75; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">🎉 Bedankt voor uw aanvraag!</h1>
              <p style="color: #64748B; font-size: 16px; margin: 0;">Uw aanvraag is succesvol ontvangen en wordt nu verwerkt</p>
            </td>
          </tr>

          <!-- Leverancier & Contract Section -->
          <tr>
            <td style="background: white; padding: 30px 20px; text-align: center; border-bottom: 1px solid #E2E8F0;">
              ${leverancierLogoUrl ? `<img src="${logoUrl}" alt="${leverancierNaam}" style="max-width: 150px; height: auto; margin-bottom: 20px; max-height: 80px;">` : ''}
              <h2 style="color: #0F4C75; font-size: 22px; margin: 0 0 10px 0; font-weight: bold;">${contractNaam}</h2>
              <p style="color: #64748B; font-size: 16px; margin: 0 0 20px 0;">bij ${leverancierNaam}</p>
              <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; display: inline-block;">
                <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Aanvraagnummer</p>
                <p style="color: #0F4C75; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; margin: 0;">${aanvraagnummer}</p>
              </div>
            </td>
          </tr>

          <!-- Maandbedrag Box (Groot & Opvallend) -->
          <tr>
            <td style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); padding: 40px 20px; text-align: center; margin: 0;">
              <p style="color: white; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Uw maandbedrag ${isZakelijk ? '(excl. btw)' : '(incl. btw)'}</p>
              <p style="color: white; font-size: 48px; font-weight: bold; margin: 0 0 5px 0;">${formatCurrency(maandbedrag)}</p>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0 0 30px 0;">per maand (${formatCurrency(jaarbedrag)} per jaar ${isZakelijk ? 'excl. btw' : 'incl. btw'})</p>
              ${besparing && besparing > 0 ? `<p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 20px 0;">U bespaart ${formatCurrency(besparing)} per jaar ten opzichte van het gemiddelde tarief</p>` : ''}
              <a href="${contractViewerUrl}" target="_blank" rel="noopener noreferrer" style="background: white; color: #14B8A6; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px; cursor: pointer;">
                📊 Bekijk volledige berekening
              </a>
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 15px 0 0 0; word-break: break-all;">
                Of kopieer deze link: <a href="${contractViewerUrl}" target="_blank" rel="noopener noreferrer" style="color: rgba(255,255,255,0.9); text-decoration: underline;">${contractViewerUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Overzicht Sectie -->
          <tr>
            <td style="background: white; padding: 30px 20px; border: 1px solid #E2E8F0; border-radius: 0; margin: 0;">
              <h3 style="color: #0F4C75; font-size: 20px; margin: 0 0 20px 0; font-weight: bold;">📋 Overzicht van uw aanvraag</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Naam</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">${klantNaam}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Leveringsadres</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">${adres.straat} ${adres.huisnummer}${adres.toevoeging ? ` ${adres.toevoeging}` : ''}</p>
                    <p style="color: #64748B; font-size: 14px; margin: 5px 0 0 0;">${adres.postcode} ${adres.plaats}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Verbruik</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">
                      ${verbruik.heeftEnkeleMeter 
                        ? `Elektriciteit: ${verbruik.elektriciteitTotaal.toLocaleString('nl-NL')} kWh/jaar (enkele meter)`
                        : `Elektriciteit: ${verbruik.elektriciteitNormaal?.toLocaleString('nl-NL') || 0} kWh normaal + ${verbruik.elektriciteitDal?.toLocaleString('nl-NL') || 0} kWh dal = ${verbruik.elektriciteitTotaal.toLocaleString('nl-NL')} kWh/jaar`
                      }
                    </p>
                    ${verbruik.gas > 0 ? `<p style="color: #0F4C75; font-size: 16px; margin: 5px 0 0 0; font-weight: 500;">Gas: ${verbruik.gas.toLocaleString('nl-NL')} m³/jaar</p>` : '<p style="color: #64748B; font-size: 14px; margin: 5px 0 0 0;">Geen gasaansluiting</p>'}
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Aansluitwaarden</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">
                      Elektriciteit: ${aansluitwaarden.elektriciteit} | Gas: ${aansluitwaarden.gas}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Timeline Sectie -->
          <tr>
            <td style="background: #F8FAFC; padding: 30px 20px; margin: 0;">
              <h3 style="color: #0F4C75; font-size: 20px; margin: 0 0 25px 0; text-align: center; font-weight: bold;">⏱️ Wat gebeurt er nu?</h3>
              
              <!-- Stap 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="50" valign="top" style="padding-right: 15px;">
                    <div style="background: #14B8A6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center;">
                      <span style="color: white; font-size: 20px; font-weight: bold;">1</span>
                    </div>
                  </td>
                  <td valign="top">
                    <p style="color: #0F4C75; font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">Binnen 1 uur</p>
                    <p style="color: #64748B; font-size: 14px; margin: 0;">U ontvangt een bevestigingsmail met alle details van uw aanvraag en uw persoonlijke contactpersoon.</p>
                  </td>
                </tr>
              </table>

              <!-- Stap 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="50" valign="top" style="padding-right: 15px;">
                    <div style="background: #0F4C75; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center;">
                      <span style="color: white; font-size: 20px; font-weight: bold;">2</span>
                    </div>
                  </td>
                  <td valign="top">
                    <p style="color: #0F4C75; font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">Binnen 1 werkdag</p>
                    <p style="color: #64748B; font-size: 14px; margin: 0;">Een energiespecialist neemt contact met u op om uw aanvraag door te nemen en eventuele vragen te beantwoorden.</p>
                  </td>
                </tr>
              </table>

              <!-- Stap 3 -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50" valign="top" style="padding-right: 15px;">
                    <div style="background: #14B8A6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center;">
                      <span style="color: white; font-size: 20px; font-weight: bold;">3</span>
                    </div>
                  </td>
                  <td valign="top">
                    <p style="color: #0F4C75; font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">Binnen 2-3 weken</p>
                    <p style="color: #64748B; font-size: 14px; margin: 0;">Na akkoord regelen wij de overstap. Uw nieuwe contract gaat in en u begint te besparen!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Buttons -->
          <tr>
            <td style="text-align: center; padding: 30px 20px; background: white;">
              <a href="${contractViewerUrl}" target="_blank" rel="noopener noreferrer" style="background: #14B8A6; color: white; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px 5px; font-size: 16px; cursor: pointer;">
                📄 Bekijk contract online
              </a>
              <br style="display: none;">
              <a href="${baseUrl}/contact" style="background: white; color: #14B8A6; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px 5px; border: 2px solid #14B8A6; font-size: 16px;">
                📞 Neem contact op
              </a>
            </td>
          </tr>

          <!-- Subtiele Review Vermelding -->
          <tr>
            <td style="background: #F8FAFC; padding: 30px 20px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #64748B; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                💬 Tevreden met onze service?<br>
                Als je tevreden bent met hoe we je hebben geholpen, zouden we het enorm waarderen als je een korte review achterlaat op Google. Dit helpt andere bedrijven om ook de beste energiecontracten te vinden.
              </p>
            </td>
          </tr>

          <!-- Contact Sectie -->
          <tr>
            <td style="background: #F8FAFC; padding: 30px 20px; text-align: center;">
              <h3 style="color: #0F4C75; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">📞 Heeft u vragen?</h3>
              <p style="color: #64748B; font-size: 14px; margin: 0 0 10px 0;">Ons team staat voor u klaar</p>
              <p style="color: #0F4C75; font-size: 14px; margin: 5px 0;">
                <a href="mailto:info@pakketadvies.nl" style="color: #14B8A6; text-decoration: none;">info@pakketadvies.nl</a>
              </p>
              <p style="color: #0F4C75; font-size: 14px; margin: 5px 0;">
                <a href="tel:0850477065" style="color: #14B8A6; text-decoration: none;">085 047 7065</a>
              </p>
              <p style="color: #64748B; font-size: 12px; margin: 10px 0 0 0;">Ma-Vr: 09:00 - 17:00</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0F4C75; padding: 30px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 200px; width: 100%; height: auto; display: block; margin: 0 auto 20px auto;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                Met vriendelijke groet,<br>
                <strong style="color: white;">Het PakketAdvies team</strong>
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 10px 0 0 0;">
                <a href="${baseUrl}/privacy" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Privacybeleid</a> | 
                <a href="${baseUrl}/contact" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Contact</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

export interface ContactFormulierData {
  naam: string
  bedrijfsnaam?: string
  email: string
  telefoon?: string
  onderwerp: string
  bericht: string
  baseUrl: string
}

export interface ContactBevestigingData {
  naam: string
  bedrijfsnaam?: string
  email: string
  onderwerp: string
  baseUrl: string
}

export interface AanbiedingInteresseData {
  aanbiedingType: 'particulier-3-jaar' | 'mkb-3-jaar' | 'grootzakelijk' | 'dynamisch' | 'clean-energy-ets2'
  naam: string
  email: string
  telefoon: string
  opmerking?: string
  baseUrl: string
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function toAbsoluteUrl(url: string | null | undefined, baseUrl: string): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${baseUrl}${url}`
  return null
}

/**
 * Generate HTML email for contact form notification (to PakketAdvies team)
 */
export function generateContactFormulierEmail(data: ContactFormulierData): string {
  const { naam, bedrijfsnaam, email, telefoon, onderwerp, bericht, baseUrl } = data
  
  // Escape user input to prevent XSS
  const safeNaam = escapeHtml(naam)
  const safeBedrijfsnaam = escapeHtml(bedrijfsnaam)
  const safeEmail = escapeHtml(email)
  const safeTelefoon = escapeHtml(telefoon)
  const safeOnderwerp = escapeHtml(onderwerp)
  const safeBericht = escapeHtml(bericht).replace(/\n/g, '<br>')
  
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nieuw contactformulier bericht - PakketAdvies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="background: #F0FDFA; padding: 30px 20px; text-align: center; border-top: 4px solid #14B8A6;">
              <h1 style="color: #0F4C75; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">📧 Nieuw contactformulier bericht</h1>
              <p style="color: #64748B; font-size: 16px; margin: 0;">Er is een nieuw bericht ontvangen via het contactformulier</p>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="background: white; padding: 30px 20px;">
              <h2 style="color: #0F4C75; font-size: 20px; margin: 0 0 20px 0; font-weight: bold;">Contactgegevens</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Naam</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">${safeNaam}</p>
                  </td>
                </tr>
              </table>

              ${safeBedrijfsnaam ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Bedrijfsnaam</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">${safeBedrijfsnaam}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">E-mail</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">
                      <a href="mailto:${safeEmail}" style="color: #14B8A6; text-decoration: none;">${safeEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>

              ${safeTelefoon ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Telefoon</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">
                      <a href="tel:${safeTelefoon.replace(/\s/g, '')}" style="color: #14B8A6; text-decoration: none;">${safeTelefoon}</a>
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Onderwerp</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">${safeOnderwerp}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Bericht</p>
                    <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; border-left: 4px solid #14B8A6;">
                      <p style="color: #0F4C75; font-size: 16px; margin: 0; white-space: pre-wrap;">${safeBericht}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0F4C75; padding: 30px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 200px; width: 100%; height: auto; display: block; margin: 0 auto 20px auto;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                <strong style="color: white;">PakketAdvies</strong>
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 10px 0 0 0;">
                <a href="${baseUrl}/privacy" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Privacybeleid</a> | 
                <a href="${baseUrl}/contact" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Contact</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

/**
 * Generate HTML email for contact form confirmation (to customer)
 */
export function generateContactBevestigingEmail(data: ContactBevestigingData): string {
  const { naam, bedrijfsnaam, email, onderwerp, baseUrl } = data
  
  // Escape user input to prevent XSS
  const safeNaam = escapeHtml(naam)
  const safeBedrijfsnaam = escapeHtml(bedrijfsnaam)
  const safeOnderwerp = escapeHtml(onderwerp)
  
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bedankt voor je bericht - PakketAdvies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>

          <!-- Success Header -->
          <tr>
            <td style="background: #F0FDFA; padding: 30px 20px; text-align: center; border-top: 4px solid #14B8A6;">
              <h1 style="color: #0F4C75; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">✅ Bedankt voor je bericht!</h1>
              <p style="color: #64748B; font-size: 16px; margin: 0;">We hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op</p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="background: white; padding: 30px 20px;">
              <p style="color: #0F4C75; font-size: 16px; margin: 0 0 20px 0;">
                Beste ${safeNaam}${safeBedrijfsnaam ? ` van ${safeBedrijfsnaam}` : ''},
              </p>
              <p style="color: #64748B; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
                Bedankt voor je bericht over <strong>${safeOnderwerp}</strong>. We hebben je bericht ontvangen en een van onze energiespecialisten neemt binnen 24 uur contact met je op.
              </p>
              <p style="color: #64748B; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
                Heb je dringende vragen? Je kunt ons ook direct bellen op <a href="tel:0850477065" style="color: #14B8A6; text-decoration: none; font-weight: bold;">085 047 7065</a> (ma-vr: 09:00 - 17:00).
              </p>
            </td>
          </tr>

          <!-- Timeline -->
          <tr>
            <td style="background: #F8FAFC; padding: 30px 20px;">
              <h3 style="color: #0F4C75; font-size: 20px; margin: 0 0 25px 0; text-align: center; font-weight: bold;">⏱️ Wat gebeurt er nu?</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="50" valign="top" style="padding-right: 15px;">
                    <div style="background: #14B8A6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center;">
                      <span style="color: white; font-size: 20px; font-weight: bold;">1</span>
                    </div>
                  </td>
                  <td valign="top">
                    <p style="color: #0F4C75; font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">Binnen 24 uur</p>
                    <p style="color: #64748B; font-size: 14px; margin: 0;">Een energiespecialist neemt contact met je op om je vraag te beantwoorden.</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50" valign="top" style="padding-right: 15px;">
                    <div style="background: #0F4C75; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center;">
                      <span style="color: white; font-size: 20px; font-weight: bold;">2</span>
                    </div>
                  </td>
                  <td valign="top">
                    <p style="color: #0F4C75; font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">Samen verder</p>
                    <p style="color: #64748B; font-size: 14px; margin: 0;">We bekijken je situatie en stellen een passende oplossing voor. Vrijblijvend en transparant.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="text-align: center; padding: 30px 20px; background: white;">
              <a href="${baseUrl}/calculator" style="background: #14B8A6; color: white; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px 5px; font-size: 16px; cursor: pointer;">
                💡 Bereken je besparing
              </a>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="background: #F8FAFC; padding: 30px 20px; text-align: center;">
              <h3 style="color: #0F4C75; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">📞 Vragen?</h3>
              <p style="color: #64748B; font-size: 14px; margin: 0 0 10px 0;">Ons team staat voor je klaar</p>
              <p style="color: #0F4C75; font-size: 14px; margin: 5px 0;">
                <a href="mailto:info@pakketadvies.nl" style="color: #14B8A6; text-decoration: none;">info@pakketadvies.nl</a>
              </p>
              <p style="color: #0F4C75; font-size: 14px; margin: 5px 0;">
                <a href="tel:0850477065" style="color: #14B8A6; text-decoration: none;">085 047 7065</a>
              </p>
              <p style="color: #64748B; font-size: 12px; margin: 10px 0 0 0;">Ma-Vr: 09:00 - 17:00</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0F4C75; padding: 30px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 200px; width: 100%; height: auto; display: block; margin: 0 auto 20px auto;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                Met vriendelijke groet,<br>
                <strong style="color: white;">Het PakketAdvies team</strong>
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 10px 0 0 0;">
                <a href="${baseUrl}/privacy" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Privacybeleid</a> | 
                <a href="${baseUrl}/contact" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Contact</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

export interface LeadWelkomEmailData {
  klantNaam: string
  email: string
  baseUrl: string
}

/**
 * Generate a simple welcome/info email after lead capture.
 * Uses same brand styling as other customer emails.
 */
export function generateLeadWelkomEmail(data: LeadWelkomEmailData): string {
  const { klantNaam, email, baseUrl } = data
  const safeKlantNaam = escapeHtml(klantNaam)
  const salutationName = safeKlantNaam.trim().length > 0 ? safeKlantNaam : 'klant'
  const safeEmail = escapeHtml(email)
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welkom bij PakketAdvies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>

          <tr>
            <td style="background: #F0FDFA; padding: 30px 20px; text-align: center; border-top: 4px solid #14B8A6;">
              <h1 style="color: #0F4C75; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">Welkom bij PakketAdvies</h1>
              <p style="color: #64748B; font-size: 16px; margin: 0;">Bedankt, we hebben je gegevens goed ontvangen.</p>
            </td>
          </tr>

          <tr>
            <td style="background: white; padding: 30px 20px;">
              <p style="color: #0F4C75; font-size: 16px; margin: 0 0 16px 0;">
                Beste ${salutationName},
              </p>
              <p style="color: #64748B; font-size: 16px; margin: 0 0 14px 0; line-height: 1.6;">
                Bedankt voor je interesse. Het kan zijn dat een specialist of adviseur van ons contact met je opneemt om je situatie kort te bespreken.
              </p>
              <p style="color: #64748B; font-size: 16px; margin: 0 0 14px 0; line-height: 1.6;">
                Daarnaast houden we je per e-mail op de hoogte van relevante ontwikkelingen rondom je aanvraag.
              </p>
              <p style="color: #64748B; font-size: 16px; margin: 0; line-height: 1.6;">
                Staat er iets niet goed of wil je iets aanvullen? Reageer dan gerust op deze e-mail.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background: #F8FAFC; padding: 24px 20px; border-top: 1px solid #E2E8F0;">
              <p style="color: #64748B; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Geregistreerd e-mailadres</p>
              <p style="color: #0F4C75; font-size: 14px; margin: 0; font-weight: 600;">${safeEmail}</p>
            </td>
          </tr>

          <tr>
            <td style="background: #0F4C75; padding: 30px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 200px; width: 100%; height: auto; display: block; margin: 0 auto 20px auto;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                Met vriendelijke groet,<br>
                <strong style="color: white;">Het PakketAdvies team</strong>
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 10px 0 0 0;">
                <a href="${baseUrl}/privacy" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Privacybeleid</a> |
                <a href="${baseUrl}/contact" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Contact</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export interface LeadWaaromAdviesEmailData {
  klantNaam: string
  email: string
  baseUrl: string
  contractId?: string | null
  contractName: string
  supplierName: string
  supplierLogoUrl?: string | null
  contractType: string
  monthlyPrice?: number | null
  yearlyPrice?: number | null
  whyTitle?: string | null
  whyIntro?: string | null
  whyPoints?: string[]
  whyDisclaimer?: string | null
  pagePath?: string | null
}

export function generateLeadWaaromAdviesEmail(data: LeadWaaromAdviesEmailData): string {
  const {
    klantNaam,
    email,
    baseUrl,
    contractId,
    contractName,
    supplierName,
    supplierLogoUrl,
    contractType,
    monthlyPrice,
    yearlyPrice,
    whyTitle,
    whyIntro,
    whyPoints = [],
    whyDisclaimer,
    pagePath,
  } = data

  const safeKlantNaam = escapeHtml(klantNaam)
  const salutationName = safeKlantNaam.trim().length > 0 ? safeKlantNaam : 'klant'
  const safeEmail = escapeHtml(email)
  const safeContractName = escapeHtml(contractName)
  const safeSupplierName = escapeHtml(supplierName)
  const safeContractType = escapeHtml(contractType)
  const safeWhyTitle = escapeHtml(whyTitle || 'Waarom dit advies goed past')
  const safeWhyIntro = escapeHtml(whyIntro || '')
  const safeWhyDisclaimer = escapeHtml(whyDisclaimer || '')
  const safePagePath = escapeHtml(pagePath || '/calculator/resultaten')
  const supplierLogo = toAbsoluteUrl(supplierLogoUrl || null, baseUrl)
  const applyUrl = contractId
    ? `${baseUrl}/calculator?stap=2&contract=${encodeURIComponent(contractId)}&direct=true`
    : `${baseUrl}/calculator/resultaten`
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  const formatCurrency = (amount?: number | null) => {
    if (typeof amount !== 'number' || Number.isNaN(amount)) return null
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const monthlyText = formatCurrency(monthlyPrice)
  const yearlyText = formatCurrency(yearlyPrice)

  const advicePoints = (whyPoints || []).filter((point) => point && point.trim().length > 0).slice(0, 5)
  const pointsHtml = advicePoints
    .map(
      (point) =>
        `<tr><td style="padding: 0 0 10px 0; color: #334155; font-size: 15px; line-height: 1.55;">✅ ${escapeHtml(point)}</td></tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jouw advies van PakketAdvies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>

          <tr>
            <td style="background: #F0FDFA; padding: 30px 20px; text-align: center; border-top: 4px solid #14B8A6;">
              <h1 style="color: #0F4C75; font-size: 28px; margin: 0 0 8px 0; font-weight: bold;">Jouw advies staat klaar</h1>
              <p style="color: #64748B; font-size: 16px; margin: 0;">Hier is precies het advies dat je net hebt opgevraagd.</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 22px; background: white;">
              <p style="color: #0F4C75; font-size: 16px; margin: 0 0 14px 0;">Beste ${salutationName},</p>
              <p style="color: #64748B; font-size: 15px; margin: 0 0 16px 0;">
                Op basis van je selectie adviseren we:
              </p>
              <div style="border: 1px solid #A7F3D0; border-radius: 10px; padding: 16px; background: #F0FDFA;">
                ${supplierLogo ? `<img src="${supplierLogo}" alt="${safeSupplierName}" style="height: 34px; width: auto; max-width: 160px; margin-bottom: 10px;" />` : ''}
                <p style="margin: 0; color: #0F4C75; font-size: 22px; font-weight: 700;">${safeSupplierName}</p>
                <p style="margin: 4px 0 0 0; color: #334155; font-size: 15px;">${safeContractName} - ${safeContractType}</p>
                ${monthlyText ? `<p style="margin: 14px 0 0 0; color: #0F4C75; font-size: 18px; font-weight: 700;">${monthlyText} / maand</p>` : ''}
                ${yearlyText ? `<p style="margin: 2px 0 0 0; color: #64748B; font-size: 14px;">${yearlyText} per jaar</p>` : ''}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 22px 8px 22px;">
              <h2 style="margin: 0 0 8px 0; color: #0F4C75; font-size: 20px; font-weight: 700;">${safeWhyTitle}</h2>
              ${safeWhyIntro ? `<p style="margin: 0 0 12px 0; color: #475569; font-size: 15px; line-height: 1.6;">${safeWhyIntro}</p>` : ''}
              <table width="100%" cellpadding="0" cellspacing="0">
                ${pointsHtml}
              </table>
              ${safeWhyDisclaimer ? `
                <div style="margin-top: 8px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
                  <p style="margin: 0; color: #64748B; font-size: 13px; line-height: 1.55;">${safeWhyDisclaimer}</p>
                </div>
              ` : ''}
            </td>
          </tr>

          <tr>
            <td style="text-align: center; padding: 26px 20px 30px 20px; background: white;">
              <a href="${applyUrl}" style="background: #14B8A6; color: #FFFFFF; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
                Ja, ik wil dit contract bekijken
              </a>
              <p style="margin: 12px 0 0 0;">
                <a href="${baseUrl}/calculator/resultaten" style="color: #0F4C75; text-decoration: underline; font-size: 13px;">
                  Liever eerst terug naar het overzicht
                </a>
              </p>
              <p style="color: #94A3B8; font-size: 12px; margin: 12px 0 0 0;">Opgevraagd vanaf: ${safePagePath}</p>
            </td>
          </tr>

          <tr>
            <td style="background: #F8FAFC; padding: 20px 22px; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; color: #64748B; font-size: 13px;">
                We hebben dit advies gestuurd naar: <strong style="color: #0F4C75;">${safeEmail}</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background: #0F4C75; padding: 30px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 200px; width: 100%; height: auto; display: block; margin: 0 auto 20px auto;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                Met vriendelijke groet,<br>
                <strong style="color: white;">Het PakketAdvies team</strong>
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 10px 0 0 0;">
                <a href="${baseUrl}/privacy" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Privacybeleid</a> |
                <a href="${baseUrl}/contact" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Contact</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export interface LeadFunnelCompleteProfileEmailData {
  klantNaam: string
  email: string
  baseUrl: string
  completeProfileUrl: string
  recommendedContract?: {
    id: string
    name: string
    type: string
    supplierName: string
    supplierLogoUrl?: string | null
  } | null
  fallbackContract?: {
    id: string
    name: string
    type: string
    supplierName: string
    supplierLogoUrl?: string | null
  } | null
}

export function generateLeadFunnelCompleteProfileEmail(data: LeadFunnelCompleteProfileEmailData): string {
  const { klantNaam, email, baseUrl, completeProfileUrl, recommendedContract, fallbackContract } = data
  const safeKlantNaam = escapeHtml(klantNaam)
  const salutationName = safeKlantNaam.trim().length > 0 ? safeKlantNaam : 'klant'
  const safeEmail = escapeHtml(email)
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`
  const recommendedLogo = toAbsoluteUrl(recommendedContract?.supplierLogoUrl || null, baseUrl)

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maak je voorstel compleet</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#F8FAFC;line-height:1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.1);">
        <tr><td style="background:linear-gradient(135deg,#0F4C75 0%,#1A5F8A 100%);padding:36px 20px;text-align:center;">
          <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width:260px;width:100%;height:auto;display:block;margin:0 auto;">
        </td></tr>
        <tr><td style="padding:30px 24px;background:#F0FDFA;border-top:4px solid #14B8A6;text-align:center;">
          <h1 style="margin:0;color:#0F4C75;font-size:28px;">Je voorstel staat bijna klaar</h1>
          <p style="margin:10px 0 0 0;color:#64748B;font-size:16px;">Nog 60 seconden voor je persoonlijke contractadvies.</p>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          <p style="margin:0 0 12px 0;color:#0F4C75;">Beste ${salutationName},</p>
          <p style="margin:0 0 14px 0;color:#475569;">Je hebt al een aanvraag gestart met <strong>${safeEmail}</strong>. Vul kort je situatie aan en je ziet direct het beste contractvoorstel op onze website.</p>
          ${
            recommendedContract
              ? `
              <div style="border:1px solid #A7F3D0;background:#F0FDFA;border-radius:10px;padding:14px;margin:0 0 14px 0;">
                <p style="margin:0 0 6px 0;color:#0F4C75;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;">Waarschijnlijke beste match</p>
                ${recommendedLogo ? `<img src="${recommendedLogo}" alt="${escapeHtml(recommendedContract.supplierName)}" style="height:30px;width:auto;max-width:150px;margin-bottom:8px;">` : ''}
                <p style="margin:0;color:#0F4C75;font-size:18px;font-weight:700;">${escapeHtml(recommendedContract.supplierName)}</p>
                <p style="margin:3px 0 0 0;color:#334155;font-size:14px;">${escapeHtml(recommendedContract.name)} - ${escapeHtml(recommendedContract.type)}</p>
                ${fallbackContract ? `<p style="margin:8px 0 0 0;color:#64748B;font-size:13px;">Alternatief: ${escapeHtml(fallbackContract.supplierName)} - ${escapeHtml(fallbackContract.name)}</p>` : ''}
              </div>
            `
              : ''
          }
          <div style="text-align:center;margin:22px 0;">
            <a href="${completeProfileUrl}" style="background:#14B8A6;color:#fff;padding:14px 26px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Maak mijn voorstel compleet</a>
          </div>
          <p style="margin:0;color:#64748B;font-size:13px;">Geen account nodig. Je kunt direct daarna met 1 klik aanvragen.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()
}

export interface LeadFunnelProposalEmailData {
  klantNaam: string
  email: string
  baseUrl: string
  completeProfileUrl: string
  contractId: string
  contractName: string
  supplierName: string
  supplierLogoUrl?: string | null
  contractType: string
  fallbackSupplierName?: string | null
  fallbackSupplierLogoUrl?: string | null
  fallbackContractName?: string | null
}

export function generateLeadFunnelProposalEmail(data: LeadFunnelProposalEmailData): string {
  const {
    klantNaam,
    email,
    baseUrl,
    completeProfileUrl,
    contractId,
    contractName,
    supplierName,
    supplierLogoUrl,
    contractType,
    fallbackSupplierName,
    fallbackSupplierLogoUrl,
    fallbackContractName,
  } = data

  const safeKlantNaam = escapeHtml(klantNaam)
  const salutationName = safeKlantNaam.trim().length > 0 ? safeKlantNaam : 'klant'
  const safeEmail = escapeHtml(email)
  const safeContractName = escapeHtml(contractName)
  const safeSupplierName = escapeHtml(supplierName)
  const safeContractType = escapeHtml(contractType)
  const safeFallbackSupplier = fallbackSupplierName ? escapeHtml(fallbackSupplierName) : null
  const safeFallback = fallbackContractName ? escapeHtml(fallbackContractName) : null
  const supplierLogo = toAbsoluteUrl(supplierLogoUrl || null, baseUrl)
  const fallbackLogo = toAbsoluteUrl(fallbackSupplierLogoUrl || null, baseUrl)
  const applyUrl = `${baseUrl}/calculator?stap=2&contract=${encodeURIComponent(contractId)}&direct=true`
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jouw aanbevolen contract</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#F8FAFC;line-height:1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.1);">
        <tr><td style="background:linear-gradient(135deg,#0F4C75 0%,#1A5F8A 100%);padding:36px 20px;text-align:center;">
          <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width:260px;width:100%;height:auto;display:block;margin:0 auto;">
        </td></tr>
        <tr><td style="padding:30px 24px;background:#F0FDFA;border-top:4px solid #14B8A6;text-align:center;">
          <h1 style="margin:0;color:#0F4C75;font-size:28px;">Jouw aanbevolen contract</h1>
          <p style="margin:10px 0 0 0;color:#64748B;font-size:16px;">Automatisch geselecteerd op basis van je profiel.</p>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          <p style="margin:0 0 12px 0;color:#0F4C75;">Beste ${salutationName},</p>
          <p style="margin:0 0 12px 0;color:#475569;">Dit contract sluit het beste aan op jouw profiel en verbruik.</p>
          <div style="border:1px solid #A7F3D0;background:#F0FDFA;border-radius:10px;padding:16px;margin:0 0 14px 0;">
            ${supplierLogo ? `<img src="${supplierLogo}" alt="${safeSupplierName}" style="height:34px;width:auto;max-width:160px;margin-bottom:10px;" />` : ''}
            <p style="margin:0;color:#0F4C75;font-size:22px;font-weight:700;">${safeSupplierName}</p>
            <p style="margin:4px 0 0 0;color:#334155;font-size:15px;">${safeContractName} - ${safeContractType}</p>
          </div>
          ${
            safeFallback
              ? `<div style="border:1px solid #E2E8F0;background:#F8FAFC;border-radius:10px;padding:12px;margin:0 0 12px 0;">
                  <p style="margin:0;color:#64748B;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;">Alternatief</p>
                  ${fallbackLogo ? `<img src="${fallbackLogo}" alt="${safeFallbackSupplier || safeFallback}" style="height:24px;width:auto;max-width:130px;margin:8px 0 6px 0;" />` : ''}
                  <p style="margin:0;color:#334155;font-size:14px;">${safeFallbackSupplier ? `${safeFallbackSupplier} - ` : ''}<strong>${safeFallback}</strong></p>
                </div>`
              : ''
          }
          <div style="text-align:center;margin:22px 0;">
            <a href="${applyUrl}" style="background:#14B8A6;color:#fff;padding:14px 26px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Ja, ik wil dit contract aanvragen</a>
          </div>
          <p style="margin:0 0 8px 0;color:#64748B;font-size:13px;">Deze mail is gestuurd naar ${safeEmail}.</p>
          <p style="margin:0;color:#64748B;font-size:13px;">Klopt je situatie niet helemaal? <a href="${completeProfileUrl}" style="color:#0F4C75;text-decoration:underline;">Werk je gegevens bij</a> en ontvang een nieuw advies.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate HTML email for aanbieding interesse notification (to PakketAdvies team)
 */
export function generateAanbiedingInteresseEmail(data: AanbiedingInteresseData): string {
  const { aanbiedingType, naam, email, telefoon, opmerking, baseUrl } = data
  
  // Escape user input to prevent XSS
  const safeNaam = escapeHtml(naam)
  const safeEmail = escapeHtml(email)
  const safeTelefoon = escapeHtml(telefoon)
  const safeOpmerking = escapeHtml(opmerking)?.replace(/\n/g, '<br>')
  
  // Map aanbieding type to display name
  const aanbiedingNamen: Record<string, string> = {
    'particulier-3-jaar': 'Particulier 3-jarig aanbod',
    'mkb-3-jaar': '3-jarig vast aanbod voor het MKB',
    'grootzakelijk': 'Groot Zakelijk Aanbod',
    'dynamisch': 'Dynamische energietarieven',
    'clean-energy-ets2': 'Clean Energy 5-jarig vast gas (ETS-2 beschermd)',
  }
  
  const aanbiedingNaam = aanbiedingNamen[aanbiedingType] || aanbiedingType
  
  // Map aanbieding type to landing page URL
  const aanbiedingUrls: Record<string, string> = {
    'particulier-3-jaar': `${baseUrl}/aanbieding/particulier-3-jaar`,
    'mkb-3-jaar': `${baseUrl}/aanbieding/mkb-3-jaar`,
    'grootzakelijk': `${baseUrl}/aanbieding/grootzakelijk`,
    'dynamisch': `${baseUrl}/aanbieding/dynamisch`,
    'clean-energy-ets2': `${baseUrl}/aanbieding/clean-energy-ets2`,
  }
  
  const aanbiedingUrl = aanbiedingUrls[aanbiedingType] || baseUrl
  
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nieuwe interesse in aanbieding - PakketAdvies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="background: #F0FDFA; padding: 30px 20px; text-align: center; border-top: 4px solid #14B8A6;">
              <h1 style="color: #0F4C75; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">🎯 Nieuwe interesse in aanbieding</h1>
              <p style="color: #64748B; font-size: 16px; margin: 0;">Iemand heeft interesse getoond in: <strong>${aanbiedingNaam}</strong></p>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="background: white; padding: 30px 20px;">
              <h2 style="color: #0F4C75; font-size: 20px; margin: 0 0 20px 0; font-weight: bold;">Contactgegevens</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Naam</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">${safeNaam}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">E-mail</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">
                      <a href="mailto:${safeEmail}" style="color: #14B8A6; text-decoration: none;">${safeEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>

              ${safeTelefoon ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Telefoon</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">
                      <a href="tel:${safeTelefoon.replace(/\s/g, '')}" style="color: #14B8A6; text-decoration: none;">${safeTelefoon}</a>
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Aanbieding</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">${aanbiedingNaam}</p>
                  </td>
                </tr>
              </table>

              ${safeOpmerking ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Opmerking</p>
                    <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; border-left: 4px solid #14B8A6;">
                      <p style="color: #0F4C75; font-size: 16px; margin: 0; white-space: pre-wrap;">${safeOpmerking}</p>
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="text-align: center; padding: 30px 20px; background: #F8FAFC;">
              <a href="${aanbiedingUrl}" target="_blank" rel="noopener noreferrer" style="background: #14B8A6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px 5px; font-size: 16px; cursor: pointer;">
                📄 Bekijk landingspagina
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0F4C75; padding: 30px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 200px; width: 100%; height: auto; display: block; margin: 0 auto 20px auto;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                <strong style="color: white;">PakketAdvies</strong>
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 10px 0 0 0;">
                <a href="${baseUrl}/privacy" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Privacybeleid</a> | 
                <a href="${baseUrl}/contact" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Contact</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

export interface ReviewRequestEmailData {
  klantNaam: string
  leverancierNaam: string
  contractNaam: string
  baseUrl: string
  googleReviewUrl: string
}

/**
 * Generate the HTML email template for review request
 * Sent 1 week after contract activation
 */
export function generateReviewRequestEmail(data: ReviewRequestEmailData): string {
  const {
    klantNaam,
    leverancierNaam,
    contractNaam,
    baseUrl,
    googleReviewUrl,
  } = data

  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hoe bevalt je nieuwe energiecontract? - PakketAdvies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; background: white;">
              <h1 style="color: #0F4C75; font-size: 28px; margin: 0 0 20px 0; font-weight: bold; line-height: 1.3;">
                Beste ${klantNaam},
              </h1>
              
              <p style="color: #64748B; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
                Een week geleden is je energiecontract bij <strong style="color: #0F4C75;">${leverancierNaam}</strong> actief geworden. 
                We hopen dat alles goed verloopt en dat je tevreden bent met je nieuwe contract <strong style="color: #0F4C75;">${contractNaam}</strong>.
              </p>

              <p style="color: #64748B; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
                💬 <strong style="color: #0F4C75;">Hoe bevalt het?</strong><br>
                We zouden het enorm waarderen als je een korte review achterlaat op Google. Dit helpt andere bedrijven om ook de beste energiecontracten te vinden.
              </p>

              <!-- Google Review Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${googleReviewUrl}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC04 100%); color: white; padding: 20px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 18px; cursor: pointer; box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3); transition: all 0.3s ease;">
                      ⭐ Laat een Google Review achter
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #64748B; font-size: 14px; margin: 20px 0 0 0; line-height: 1.6; text-align: center;">
                Het duurt maar een minuutje en helpt ons enorm! 🙏
              </p>
            </td>
          </tr>

          <!-- Contact Sectie -->
          <tr>
            <td style="background: #F8FAFC; padding: 30px 20px; text-align: center; border-top: 1px solid #E2E8F0;">
              <h3 style="color: #0F4C75; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">📞 Vragen of feedback?</h3>
              <p style="color: #64748B; font-size: 14px; margin: 0 0 10px 0;">Als je vragen hebt of feedback wilt delen, neem gerust contact met ons op. We staan altijd voor je klaar.</p>
              <p style="color: #0F4C75; font-size: 14px; margin: 5px 0;">
                <a href="mailto:info@pakketadvies.nl" style="color: #14B8A6; text-decoration: none;">info@pakketadvies.nl</a>
              </p>
              <p style="color: #0F4C75; font-size: 14px; margin: 5px 0;">
                <a href="tel:0850477065" style="color: #14B8A6; text-decoration: none;">085 047 7065</a>
              </p>
              <p style="color: #64748B; font-size: 12px; margin: 10px 0 0 0;">Ma-Vr: 09:00 - 17:00</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0F4C75; padding: 30px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 200px; width: 100%; height: auto; display: block; margin: 0 auto 20px auto;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                Met vriendelijke groet,<br>
                <strong style="color: white;">Het PakketAdvies team</strong>
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 10px 0 0 0;">
                <a href="${baseUrl}/privacy" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Privacybeleid</a> | 
                <a href="${baseUrl}/contact" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Contact</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

export interface EmailInterneNotificatieData {
  aanvraagnummer: string
  aanvraagType: 'particulier' | 'zakelijk'
  contractNaam: string
  leverancierNaam: string
  klantNaam: string
  klantEmail: string
  klantTelefoon?: string
  adres: {
    straat: string
    huisnummer: string
    toevoeging?: string
    postcode: string
    plaats: string
  }
  verbruik: {
    elektriciteitNormaal?: number
    elektriciteitDal?: number | null
    elektriciteitTotaal: number
    heeftEnkeleMeter?: boolean
    gas: number
  }
  aansluitwaarden: {
    elektriciteit: string
    gas: string
  }
  maandbedrag: number
  jaarbedrag: number
  isZakelijk?: boolean
  adminUrl: string
  baseUrl: string
}

/**
 * Generate the HTML email template for internal notification (to info@pakketadvies.nl)
 */
export function generateInterneNotificatieEmail(data: EmailInterneNotificatieData): string {
  const {
    aanvraagnummer,
    aanvraagType,
    contractNaam,
    leverancierNaam,
    klantNaam,
    klantEmail,
    klantTelefoon,
    adres,
    verbruik,
    aansluitwaarden,
    maandbedrag,
    jaarbedrag,
    isZakelijk = false,
    adminUrl,
    baseUrl,
  } = data

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`
  const btwLabel = isZakelijk ? 'excl. BTW' : 'incl. BTW'

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nieuwe contractaanvraag - ${aanvraagnummer}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>

          <!-- Alert Header -->
          <tr>
            <td style="background: #FEF3C7; padding: 20px; text-align: center; border-top: 4px solid #F59E0B;">
              <h1 style="color: #92400E; font-size: 24px; margin: 0; font-weight: bold;">🔔 Nieuwe Contractaanvraag</h1>
              <p style="color: #92400E; font-size: 16px; margin: 10px 0 0 0; font-weight: 600;">${aanvraagnummer}</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; background: white;">
              
              <!-- Contract Info -->
              <div style="background: #F0FDFA; border-left: 4px solid #14B8A6; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <h2 style="color: #0F4C75; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Contract Details</h2>
                <table width="100%" cellpadding="5" cellspacing="0" style="color: #64748B; font-size: 14px;">
                  <tr>
                    <td style="width: 40%; font-weight: 600; color: #0F4C75;">Contract:</td>
                    <td>${contractNaam}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #0F4C75;">Leverancier:</td>
                    <td>${leverancierNaam}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #0F4C75;">Type:</td>
                    <td><span style="text-transform: capitalize;">${aanvraagType}</span></td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #0F4C75;">Maandbedrag:</td>
                    <td><strong style="color: #0F4C75; font-size: 16px;">${formatCurrency(maandbedrag)} ${btwLabel}</strong></td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #0F4C75;">Jaarbedrag:</td>
                    <td><strong style="color: #0F4C75; font-size: 16px;">${formatCurrency(jaarbedrag)} ${btwLabel}</strong></td>
                  </tr>
                </table>
              </div>

              <!-- Klantgegevens -->
              <div style="background: #F8FAFC; border-left: 4px solid #0F4C75; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <h2 style="color: #0F4C75; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Klantgegevens</h2>
                <table width="100%" cellpadding="5" cellspacing="0" style="color: #64748B; font-size: 14px;">
                  <tr>
                    <td style="width: 40%; font-weight: 600; color: #0F4C75;">Naam:</td>
                    <td>${klantNaam}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #0F4C75;">Email:</td>
                    <td><a href="mailto:${klantEmail}" style="color: #14B8A6; text-decoration: none;">${klantEmail}</a></td>
                  </tr>
                  ${klantTelefoon ? `
                  <tr>
                    <td style="font-weight: 600; color: #0F4C75;">Telefoon:</td>
                    <td><a href="tel:${klantTelefoon}" style="color: #14B8A6; text-decoration: none;">${klantTelefoon}</a></td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="font-weight: 600; color: #0F4C75;">Adres:</td>
                    <td>${adres.straat} ${adres.huisnummer}${adres.toevoeging ? ' ' + adres.toevoeging : ''}<br>${adres.postcode} ${adres.plaats}</td>
                  </tr>
                </table>
              </div>

              <!-- Verbruik -->
              <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <h2 style="color: #0F4C75; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">Verbruik</h2>
                <table width="100%" cellpadding="5" cellspacing="0" style="color: #64748B; font-size: 14px;">
                  <tr>
                    <td style="width: 40%; font-weight: 600; color: #0F4C75;">Elektriciteit:</td>
                    <td>${verbruik.elektriciteitTotaal.toLocaleString('nl-NL')} kWh/jaar${verbruik.heeftEnkeleMeter ? ' (enkele meter)' : verbruik.elektriciteitDal ? ` (${verbruik.elektriciteitNormaal?.toLocaleString('nl-NL')} normaal / ${verbruik.elektriciteitDal?.toLocaleString('nl-NL')} dal)` : ''}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #0F4C75;">Gas:</td>
                    <td>${verbruik.gas.toLocaleString('nl-NL')} m³/jaar</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #0F4C75;">Aansluitwaarde:</td>
                    <td>${aansluitwaarden.elektriciteit} / ${aansluitwaarden.gas}</td>
                  </tr>
                </table>
              </div>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center;">
                      Bekijk Aanvraag in Admin
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #64748B; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
                Deze email is automatisch gegenereerd bij het aanmaken van een nieuwe contractaanvraag.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #F8FAFC; padding: 30px 20px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #94A3B8; font-size: 12px; margin: 0; line-height: 1.6;">
                PakketAdvies - Energieadvies op maat<br>
                <a href="${baseUrl}" style="color: #14B8A6; text-decoration: none;">${baseUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
