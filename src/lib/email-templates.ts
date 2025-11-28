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
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo.png`

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
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 30px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 180px; height: auto; margin-bottom: 8px;">
              <p style="color: #14B8A6; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">ONAFHANKELIJK ENERGIE VERGELIJKEN</p>
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
              <p style="color: white; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Uw maandbedrag</p>
              <p style="color: white; font-size: 48px; font-weight: bold; margin: 0 0 5px 0;">${formatCurrency(maandbedrag)}</p>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0 0 30px 0;">per maand (${formatCurrency(jaarbedrag)} per jaar)</p>
              ${besparing && besparing > 0 ? `<p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 20px 0;">U bespaart ${formatCurrency(besparing)} per jaar ten opzichte van het gemiddelde tarief</p>` : ''}
              <a href="${contractViewerUrl}" style="background: white; color: #14B8A6; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
                📊 Bekijk volledige berekening
              </a>
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
              <a href="${contractViewerUrl}" style="background: #14B8A6; color: white; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px 5px; font-size: 16px;">
                📄 Bekijk contract online
              </a>
              <br style="display: none;">
              <a href="${baseUrl}/contact" style="background: white; color: #14B8A6; padding: 18px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px 5px; border: 2px solid #14B8A6; font-size: 16px;">
                📞 Neem contact op
              </a>
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
            <td style="background: #0F4C75; padding: 20px; text-align: center;">
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

