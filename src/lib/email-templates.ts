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
  aanbiedingType: 'particulier-3-jaar' | 'mkb-3-jaar' | 'grootzakelijk' | 'dynamisch'
  naam: string
  email: string
  telefoon?: string
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
  }
  
  const aanbiedingNaam = aanbiedingNamen[aanbiedingType] || aanbiedingType
  
  // Map aanbieding type to landing page URL
  const aanbiedingUrls: Record<string, string> = {
    'particulier-3-jaar': `${baseUrl}/aanbieding/particulier-3-jaar`,
    'mkb-3-jaar': `${baseUrl}/aanbieding/mkb-3-jaar`,
    'grootzakelijk': `${baseUrl}/aanbieding/grootzakelijk`,
    'dynamisch': `${baseUrl}/aanbieding/dynamisch`,
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
