/**
 * Newsletter email template - Modern design matching website theme
 * Uses inline CSS for maximum email client compatibility
 * Uses Phosphor Icons (SVG) instead of emojis
 */

export interface NewsletterEmailData {
  baseUrl: string
  subject?: string
  recipientName?: string
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
  introText?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  unsubscribeUrl?: string
}

// Phosphor Icons as SVG (Lightning, Buildings, Briefcase, LightningSlash)
const LightningIcon = `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M208 128a80 80 0 1 1-80-80 80 80 0 0 1 80 80Z" fill="#00AF9B" opacity="0.2"/><path d="M143 36 47 128l56 20-16 72 96-92-56-20 16-72Z" fill="#00AF9B"/></svg>`
const BuildingsIcon = `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" rx="8" fill="#00AF9B" opacity="0.2"/><path d="M152 208h-48V48l32-16 32 16v160Zm-16-144v128M96 96h64M96 128h64M96 160h64" stroke="#00AF9B" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const BriefcaseIcon = `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" rx="8" fill="#00AF9B" opacity="0.2"/><rect x="32" y="72" width="192" height="144" rx="8" stroke="#00AF9B" stroke-width="16"/><path d="M88 72V56a24 24 0 0 1 24-24h32a24 24 0 0 1 24 24v16" stroke="#00AF9B" stroke-width="16"/></svg>`
const LightningSlashIcon = `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M208 128a80 80 0 1 1-80-80 80 80 0 0 1 80 80Z" fill="#00AF9B" opacity="0.2"/><line x1="56" y1="56" x2="200" y2="200" stroke="#00AF9B" stroke-width="16" stroke-linecap="round"/><path d="M143 36 47 128l56 20-16 72 49-47" stroke="#00AF9B" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></svg>`

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

  // Brand colors matching website
  const navy = '#1A3756'
  const navyDark = '#102238'
  const navyLight = '#E1E9F1'
  const teal = '#00AF9B'
  const tealLight = '#E6F9F7'
  const tealDark = '#008C7C'
  const gray50 = '#F9FAFB'
  const gray100 = '#F3F4F6'
  const gray200 = '#E5E7EB'
  const gray600 = '#4B5563'
  const gray700 = '#374151'
  const gray900 = '#111827'
  const white = '#FFFFFF'

  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  // Helper to generate offer card HTML with modern styling
  const generateOfferCard = (
    title: string,
    content: string,
    buttonText: string,
    buttonLink: string,
    icon: string
  ): string => {
    return `
          <!--[if mso | IE]>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
            <tr>
              <td>
          <![endif]-->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${white}; border: 1px solid ${gray200}; border-radius: 12px; margin-bottom: 32px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
            <tr>
              <td style="padding: 32px 24px;" class="email-padding email-mobile-padding">
                <!-- Icon and Title -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding-bottom: 20px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 64px; height: 64px; background-color: ${tealLight}; border-radius: 12px; display: inline-block;">
                        <tr>
                          <td align="center" valign="middle" style="height: 64px; padding: 12px;">
                            ${icon}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <h3 style="color: ${navy}; font-size: 22px; font-weight: 700; margin: 0; padding: 0; text-align: center; font-family: 'Space Grotesk', 'Arial', sans-serif; line-height: 1.3;">
                        ${title}
                      </h3>
                    </td>
                  </tr>
                </table>
                
                <!-- Content Box with Teal Background -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${tealLight}; border-radius: 8px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 24px;">
                      ${content}
                    </td>
                  </tr>
                </table>
                
                <!-- CTA Button -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding: 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonLink}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="8%" stroke="f" fillcolor="${teal}">
                        <w:anchorlock/>
                        <center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:16px;font-weight:600;">${buttonText}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${buttonLink}" style="display: inline-block; background-color: ${teal}; color: ${white}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif; text-align: center; mso-hide: all;">
                        ${buttonText}
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <!--[if mso | IE]>
              </td>
            </tr>
          </table>
          <![endif]-->
    `
  }

  // Generate particulier offer card
  const particulierCard = offers.particulier ? generateOfferCard(
    offers.particulier.title,
    `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: ${gray700}; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Stroomtarief piek:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.particulier.stroomtariefPiek}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Stroomtarief dal:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.particulier.stroomtariefDal}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Stroomtarief enkel:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.particulier.stroomtariefEnkel}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Gastarief:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.particulier.gastarief}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per m³</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin: 16px 0 0 0; padding: 0; font-size: 12px; color: ${gray600}; line-height: 1.6; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
        ${offers.particulier.details}
      </p>
    `,
    'Bekijk dit aanbod',
    offers.particulier.link,
    LightningIcon
  ) : ''

  // Generate MKB offer card
  const mkbCard = offers.mkb ? generateOfferCard(
    offers.mkb.title,
    `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: ${gray700}; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Stroomtarief piek:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.mkb.stroomtariefPiek}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Stroomtarief dal:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.mkb.stroomtariefDal}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Gastarief:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.mkb.gastarief}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per m³</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin: 16px 0 0 0; padding: 0; font-size: 12px; color: ${gray600}; line-height: 1.6; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
        ${offers.mkb.details}
      </p>
    `,
    'Bekijk dit aanbod',
    offers.mkb.link,
    BuildingsIcon
  ) : ''

  // Generate Grootzakelijk offer card
  const grootzakelijkCard = offers.grootzakelijk ? generateOfferCard(
    offers.grootzakelijk.title,
    `
      <p style="margin: 0 0 16px 0; padding: 0; font-size: 14px; color: ${gray700}; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif; font-weight: 600;">
        ${offers.grootzakelijk.minVerbruik}
      </p>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: ${gray700}; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Stroomtarief piek:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.grootzakelijk.stroomtariefPiek}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Stroomtarief dal:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.grootzakelijk.stroomtariefDal}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600;">Gastarief:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; font-size: 16px;">${offers.grootzakelijk.gastarief}</td>
                <td style="color: ${gray600}; padding-left: 8px;">per m³</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${offers.grootzakelijk.extraInfo ? `
      <p style="margin: 16px 0 0 0; padding: 0; font-size: 12px; color: ${gray600}; line-height: 1.6; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
        ${offers.grootzakelijk.extraInfo}
      </p>
      ` : ''}
      <p style="margin: 16px 0 0 0; padding: 0; font-size: 12px; color: ${gray600}; line-height: 1.6; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
        ${offers.grootzakelijk.details}
      </p>
    `,
    'Bekijk dit aanbod',
    offers.grootzakelijk.link,
    BriefcaseIcon
  ) : ''

  // Generate Dynamisch offer card
  const dynamischCard = offers.dynamisch ? generateOfferCard(
    offers.dynamisch.title,
    `
      <p style="margin: 0; padding: 0; font-size: 14px; color: ${gray700}; line-height: 1.8; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
        ${offers.dynamisch.description}
      </p>
    `,
    'Bekijk dynamische tarieven',
    offers.dynamisch.link,
    LightningSlashIcon
  ) : ''

  // Default intro text if not provided
  const defaultIntroText = `
    Beste ${recipientName ? recipientName : 'klant'},<br><br>
    
    We hebben uw gegevens verzameld via onze social media campagnes voor particulier en/of zakelijke energie. 
    Via deze email willen we u graag op de hoogte brengen van onze nieuwe aanbiedingen voor deze maand.<br><br>
    
    <strong style="color: ${navy};">Let op:</strong> momenteel hebben wij voor groot MKB en grootverbruikers met een verbruik boven de 75.000kWh een heel scherp tarief voor lange looptijd.<br><br>
    
    Daarnaast hebben wij aantrekkelijke opties voor eigenaren van zonnepanelen via dynamische contracten. 
    Voor grote zakelijke klanten bieden wij strategische inkoop aan. 
    Vergelijk direct alle aanbiedingen via <a href="${baseUrl}/calculator" style="color: ${teal}; text-decoration: underline; font-weight: 600;">${baseUrl}/calculator</a> 
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
      .email-mobile-padding {padding: 16px !important;}
      .email-hero-text {font-size: 28px !important;}
      .email-hero-subtext {font-size: 14px !important;}
    }
  </style>
  <!--<![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: ${gray100}; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
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
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: ${white}; max-width: 600px; margin: 0 auto; width: 100%;">
          
          <!-- Header with Navy Background -->
          <tr>
            <td style="background: ${navy}; padding: 40px 20px; text-align: center;">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto 12px auto;">
              <p style="color: ${teal}; font-size: 12px; margin: 0; padding: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                ONAFHANKELIJK ENERGIE VERGELIJKEN
              </p>
            </td>
          </tr>

          <!-- Hero Banner -->
          <tr>
            <td style="background: ${navyDark}; padding: 48px 32px; text-align: center;" class="email-padding email-mobile-padding">
              <h1 style="color: ${white}; font-size: 32px; font-weight: 700; margin: 0 0 12px 0; padding: 0; font-family: 'Space Grotesk', 'Arial', sans-serif; line-height: 1.2;" class="email-hero-text">
                Uw exclusieve energie aanbod
              </h1>
              <p style="color: ${teal}; font-size: 16px; margin: 0; padding: 0; font-weight: 500; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;" class="email-hero-subtext">
                Claim deze eindejaar aanbiedingen
              </p>
            </td>
          </tr>

          <!-- Intro Text -->
          <tr>
            <td style="background: ${white}; padding: 40px 32px;" class="email-padding email-mobile-padding">
              <div style="color: ${gray700}; font-size: 16px; line-height: 1.8; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                ${introText || defaultIntroText}
              </div>
            </td>
          </tr>

          <!-- Offers Section -->
          <tr>
            <td style="background: ${gray100}; padding: 40px 32px;" class="email-padding email-mobile-padding">
              
              ${particulierCard}
              
              ${mkbCard}
              
              ${grootzakelijkCard}
              
              ${dynamischCard}
              
            </td>
          </tr>

          <!-- Contact Section -->
          <tr>
            <td style="background: ${white}; padding: 40px 32px; text-align: center;" class="email-padding email-mobile-padding">
              <h2 style="color: ${navy}; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; padding: 0; font-family: 'Space Grotesk', 'Arial', sans-serif;">
                Vragen of persoonlijk advies?
              </h2>
              <p style="color: ${gray700}; font-size: 16px; margin: 0 0 24px 0; padding: 0; line-height: 1.8; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                Geïnteresseerd in een van onze aantrekkelijke aanbiedingen of wilt u meer informatie over onze producten en diensten? 
                Aarzel dan niet om contact met ons op te nemen.
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 auto; max-width: 400px;">
                <tr>
                  <td align="center" style="padding: 12px 0;">
                    <a href="mailto:${contactEmail}" style="color: ${teal}; text-decoration: none; font-weight: 600; font-size: 16px; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                      ${contactEmail}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 12px 0;">
                    <a href="tel:${contactPhone.replace(/\s/g, '')}" style="color: ${teal}; text-decoration: none; font-weight: 600; font-size: 16px; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                      ${contactPhone}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: ${gray600}; font-size: 14px; margin: 32px 0 0 0; padding: 0; font-style: italic; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                Met energieke groet,<br>
                <strong style="color: ${navy};">Team PakketAdvies</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: ${navy}; padding: 40px 32px; text-align: center;" class="email-padding email-mobile-padding">
              <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="max-width: 200px; width: 100%; height: auto; display: block; margin: 0 auto 24px auto; opacity: 0.9;">
              
              <!-- Social Media Icons -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 auto 24px auto; max-width: 200px;">
                <tr>
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.facebook.com/pakketadvies" style="display: inline-block; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: ${white}; font-size: 16px; font-weight: 600;">f</span>
                    </a>
                  </td>
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.instagram.com/pakketadvies" style="display: inline-block; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: ${white}; font-size: 16px; font-weight: 600;">ig</span>
                    </a>
                  </td>
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.linkedin.com/company/pakketadvies" style="display: inline-block; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: ${white}; font-size: 16px; font-weight: 600;">in</span>
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: ${teal}; font-size: 14px; margin: 0 0 16px 0; padding: 0; line-height: 1.6; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                ${address}
              </p>
              
              ${unsubscribeUrl ? `
              <p style="margin: 24px 0 0 0; padding: 0;">
                <a href="${unsubscribeUrl}" style="color: ${teal}; text-decoration: underline; font-size: 12px; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
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
