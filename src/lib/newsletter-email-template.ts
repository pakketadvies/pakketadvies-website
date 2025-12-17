/**
 * Newsletter email template - Modern design matching website theme
 * Uses inline CSS for maximum email client compatibility
 */

export interface NewsletterEmailData {
  baseUrl: string
  subject?: string
  // Optional: recipient name for personalization
  recipientName?: string
  // Offer data
  offers: {
    particulier?: {
      title: string
      stroomtariefPiek: string
      stroomtariefDal: string
      stroomtariefEnkel: string
      gastarief: string
      details: string
      link: string
    }
    mkb?: {
      title: string
      stroomtariefPiek: string
      stroomtariefDal: string
      gastarief: string
      details: string
      link: string
    }
    grootzakelijk?: {
      title: string
      minVerbruik: string
      stroomtariefPiek: string
      stroomtariefDal: string
      gastarief: string
      details: string
      extraInfo?: string
      link: string
    }
    dynamisch?: {
      title: string
      description: string
      link: string
    }
  }
  // Intro text
  introText?: string
  // Contact info
  contactEmail?: string
  contactPhone?: string
  // Footer
  address?: string
  unsubscribeUrl?: string
}

/**
 * Generate modern newsletter email HTML
 */
export function generateNewsletterEmail(data: NewsletterEmailData): string {
  const {
    baseUrl,
    recipientName,
    offers,
    introText,
    contactEmail = 'info@pakketadvies.nl',
    contactPhone = '085-0477065',
    address = 'PakketAdvies, Stavangerweg 21-1, 9723JC, Groningen',
    unsubscribeUrl,
  } = data

  // Brand colors
  const navy = '#1A3756' // brand-navy-500
  const navyLight = '#E1E9F1' // brand-navy-100
  const teal = '#00AF9B' // brand-teal-500
  const tealLight = '#E6F9F7' // brand-teal-50
  const tealDark = '#008C7C' // brand-teal-600
  const gray100 = '#F3F4F6'
  const gray200 = '#E5E7EB'
  const gray600 = '#4B5563'
  const gray700 = '#374151'
  const gray900 = '#111827'

  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  // Helper to generate offer card HTML
  const generateOfferCard = (
    title: string,
    content: string,
    buttonText: string,
    buttonLink: string,
    imageIcon?: string
  ): string => {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; margin-bottom: 24px; border: 1px solid ${gray200};">
        <tr>
          <td style="padding: 32px 24px;">
            ${imageIcon ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="width: 80px; height: 80px; border-radius: 50%; background: ${tealLight}; display: inline-flex; align-items: center; justify-content: center;">
                ${imageIcon}
              </div>
            </div>
            ` : ''}
            
            <h3 style="color: ${navy}; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; text-align: center; font-family: 'Space Grotesk', system-ui, sans-serif;">
              ${title}
            </h3>
            
            <div style="background: ${tealLight}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              ${content}
            </div>
            
            <div style="text-align: center;">
              <a href="${buttonLink}" style="display: inline-block; background-color: ${teal}; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
                ${buttonText}
              </a>
            </div>
          </td>
        </tr>
      </table>
    `
  }

  // Generate particulier offer card
  const particulierCard = offers.particulier ? generateOfferCard(
    offers.particulier.title,
    `
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: ${gray700};">
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Stroomtarief piek:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.particulier.stroomtariefPiek}</span> per kWh
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Stroomtarief dal:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.particulier.stroomtariefDal}</span> per kWh
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Stroomtarief enkel:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.particulier.stroomtariefEnkel}</span> per kWh
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Gastarief:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.particulier.gastarief}</span> per m³
          </td>
        </tr>
      </table>
      <p style="margin: 16px 0 0 0; font-size: 12px; color: ${gray600}; line-height: 1.6;">
        ${offers.particulier.details}
      </p>
    `,
    'Bekijk dit aanbod',
    offers.particulier.link,
    '🏠'
  ) : ''

  // Generate MKB offer card
  const mkbCard = offers.mkb ? generateOfferCard(
    offers.mkb.title,
    `
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: ${gray700};">
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Stroomtarief piek:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.mkb.stroomtariefPiek}</span> per kWh
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Stroomtarief dal:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.mkb.stroomtariefDal}</span> per kWh
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Gastarief:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.mkb.gastarief}</span> per m³
          </td>
        </tr>
      </table>
      <p style="margin: 16px 0 0 0; font-size: 12px; color: ${gray600}; line-height: 1.6;">
        ${offers.mkb.details}
      </p>
    `,
    'Bekijk dit aanbod',
    offers.mkb.link,
    '🏢'
  ) : ''

  // Generate Grootzakelijk offer card
  const grootzakelijkCard = offers.grootzakelijk ? generateOfferCard(
    offers.grootzakelijk.title,
    `
      <p style="margin: 0 0 16px 0; font-size: 14px; color: ${gray700};">
        <strong style="color: ${navy};">${offers.grootzakelijk.minVerbruik}</strong>
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: ${gray700};">
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Stroomtarief piek:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.grootzakelijk.stroomtariefPiek}</span> per kWh
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Stroomtarief dal:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.grootzakelijk.stroomtariefDal}</span> per kWh
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: ${navy};">Gastarief:</strong> <span style="color: ${teal}; font-weight: 600;">${offers.grootzakelijk.gastarief}</span> per m³
          </td>
        </tr>
      </table>
      ${offers.grootzakelijk.extraInfo ? `
      <p style="margin: 16px 0 0 0; font-size: 12px; color: ${gray600}; line-height: 1.6;">
        ${offers.grootzakelijk.extraInfo}
      </p>
      ` : ''}
      <p style="margin: 16px 0 0 0; font-size: 12px; color: ${gray600}; line-height: 1.6;">
        ${offers.grootzakelijk.details}
      </p>
    `,
    'Bekijk dit aanbod',
    offers.grootzakelijk.link,
    '💼'
  ) : ''

  // Generate Dynamisch offer card
  const dynamischCard = offers.dynamisch ? generateOfferCard(
    offers.dynamisch.title,
    `
      <p style="margin: 0; font-size: 14px; color: ${gray700}; line-height: 1.8;">
        ${offers.dynamisch.description}
      </p>
    `,
    'Bekijk dynamische tarieven',
    offers.dynamisch.link,
    '⚡'
  ) : ''

  // Default intro text if not provided
  const defaultIntroText = `
    Beste ${recipientName ? recipientName : 'klant'},<br><br>
    
    We hebben uw gegevens verzameld via onze social media campagnes voor particulier en/of zakelijke energie. 
    Via deze email willen we u graag op de hoogte brengen van onze nieuwe aanbiedingen voor deze maand.<br><br>
    
    <strong style="color: ${navy};">Let op:</strong> momenteel hebben wij voor groot MKB en grootverbruikers met een verbruik boven de 75.000kWh een heel scherp tarief voor lange looptijd.<br><br>
    
    Daarnaast hebben wij aantrekkelijke opties voor eigenaren van zonnepanelen via dynamische contracten. 
    Voor grote zakelijke klanten bieden wij strategische inkoop aan. 
    Vergelijk direct alle aanbiedingen via <a href="${baseUrl}/calculator" style="color: ${teal}; text-decoration: underline;">${baseUrl}/calculator</a> 
    of neem contact met ons op voor persoonlijk advies.
  `

  return `
<!DOCTYPE html>
<html lang="nl" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Energietarieven - PakketAdvies</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style type="text/css">
    table {border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
    img {border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;}
    body, table, td, p, a, li, blockquote {-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;}
    table, td {mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
    img {-ms-interpolation-mode: bicubic;}
    * {line-height: inherit;}
    a[x-apple-data-detectors] {color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important;}
  </style>
  <![endif]-->
  <!--[if !mso]><!-->
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .email-container {width: 100% !important; max-width: 100% !important;}
      .email-padding {padding: 20px !important;}
      .email-text-center {text-align: center !important;}
      .email-mobile-hide {display: none !important;}
      .email-mobile-full-width {width: 100% !important; display: block !important;}
      .email-mobile-padding {padding: 16px !important;}
      .email-hero-text {font-size: 24px !important;}
      .email-hero-subtext {font-size: 14px !important;}
    }
  </style>
  <!--<![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: ${gray100};">
  <!--[if mso | IE]>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${gray100};">
    <tr>
      <td>
  <![endif]-->
  
  <!-- Main Container -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${gray100}; padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 0;">
        <!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width: 600px;">
          <tr>
            <td style="line-height: 0px; font-size: 0px; mso-line-height-rule: exactly;">
        <![endif]-->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; width: 100%;">
          
          <!-- Header with Navy Background -->
          <tr>
            <td style="background: ${navy}; padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto 12px auto;">
              <p style="color: ${teal}; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                ONAFHANKELIJK ENERGIE VERGELIJKEN
              </p>
            </td>
          </tr>

          <!-- Hero Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, ${navy} 0%, #2A4A6F 100%); padding: 48px 32px; text-align: center;">
              <h1 style="color: #FFFFFF; font-size: 32px; font-weight: 700; margin: 0 0 12px 0; font-family: 'Space Grotesk', system-ui, sans-serif; line-height: 1.2;">
                Uw exclusieve energie aanbod
              </h1>
              <p style="color: ${tealLight}; font-size: 16px; margin: 0; font-weight: 500;">
                Claim deze eindejaar aanbiedingen
              </p>
            </td>
          </tr>

          <!-- Intro Text -->
          <tr>
            <td style="background: #FFFFFF; padding: 40px 32px;">
              <div style="color: ${gray700}; font-size: 16px; line-height: 1.8;">
                ${introText || defaultIntroText}
              </div>
            </td>
          </tr>

          <!-- Offers Section -->
          <tr>
            <td style="background: ${gray100}; padding: 40px 32px;">
              
              ${particulierCard}
              
              ${mkbCard}
              
              ${grootzakelijkCard}
              
              ${dynamischCard}
              
            </td>
          </tr>

          <!-- Contact Section -->
          <tr>
            <td style="background: #FFFFFF; padding: 40px 32px; text-align: center;">
              <h2 style="color: ${navy}; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; font-family: 'Space Grotesk', system-ui, sans-serif;">
                Vragen of persoonlijk advies?
              </h2>
              <p style="color: ${gray700}; font-size: 16px; margin: 0 0 24px 0; line-height: 1.8;">
                Geïnteresseerd in een van onze aantrekkelijke aanbiedingen of wilt u meer informatie over onze producten en diensten? 
                Aarzel dan niet om contact met ons op te nemen.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 auto; max-width: 400px;">
                <tr>
                  <td align="center" style="padding: 12px 0;">
                    <a href="mailto:${contactEmail}" style="color: ${teal}; text-decoration: none; font-weight: 600; font-size: 16px;">
                      📧 ${contactEmail}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 12px 0;">
                    <a href="tel:${contactPhone.replace(/\s/g, '')}" style="color: ${teal}; text-decoration: none; font-weight: 600; font-size: 16px;">
                      📞 ${contactPhone}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: ${gray600}; font-size: 14px; margin: 32px 0 0 0; font-style: italic;">
                Met energieke groet,<br>
                <strong style="color: ${navy};">Team PakketAdvies</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: ${navy}; padding: 40px 32px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 200px; width: 100%; height: auto; display: block; margin: 0 auto 24px auto; opacity: 0.9;">
              
              <!-- Social Media Icons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px auto; max-width: 200px;">
                <tr>
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.facebook.com/pakketadvies" style="display: inline-block; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: #FFFFFF; font-size: 20px;">f</span>
                    </a>
                  </td>
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.instagram.com/pakketadvies" style="display: inline-block; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: #FFFFFF; font-size: 20px;">📷</span>
                    </a>
                  </td>
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.linkedin.com/company/pakketadvies" style="display: inline-block; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: #FFFFFF; font-size: 20px;">in</span>
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: ${tealLight}; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">
                ${address}
              </p>
              
              ${unsubscribeUrl ? `
              <p style="margin: 24px 0 0 0;">
                <a href="${unsubscribeUrl}" style="color: ${tealLight}; text-decoration: underline; font-size: 12px;">
                  Uitschrijven voor deze e-mails? Gebruik onderstaande link. Unsubscribe
                </a>
              </p>
              ` : ''}
              
            </td>
          </tr>

        </table>
        <!--[if mso | IE]>
            </td>
          </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso | IE]>
      </td>
    </tr>
  </table>
  <![endif]-->

</body>
</html>
  `.trim()
}

