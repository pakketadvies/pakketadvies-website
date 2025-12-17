/**
 * Newsletter email template - 5 different design variants
 * Uses inline CSS for maximum email client compatibility
 * Uses Phosphor Icons (SVG) - properly sized and positioned
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

/**
 * Generate modern newsletter email HTML - Multiple variants
 * @param variant - Design variant: 1-5
 */
export function generateNewsletterEmail(data: NewsletterEmailData, variant: 1 | 2 | 3 | 4 | 5 = 1): string {
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

  // Brand colors matching website EXACTLY
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
  const white = '#FFFFFF'

  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`

  // Simple icon SVGs - clean and email-compatible
  const iconSVGs = {
    lightning: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M143 36 47 128l56 20-16 72 96-92-56-20 16-72Z" fill="${teal}"/></svg>`,
    buildings: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="64" y="96" width="128" height="128" rx="8" fill="none" stroke="${teal}" stroke-width="16"/><path d="M128 96v128M96 128h64M96 160h64M96 192h64" stroke="${teal}" stroke-width="12" stroke-linecap="round"/></svg>`,
    briefcase: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="32" y="72" width="192" height="144" rx="8" fill="none" stroke="${teal}" stroke-width="16"/><path d="M88 72V56a24 24 0 0 1 24-24h32a24 24 0 0 1 24 24v16" stroke="${teal}" stroke-width="16" stroke-linecap="round"/></svg>`,
    lightningSlash: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M143 36 47 128l56 20-16 72 49-47" stroke="${teal}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><line x1="56" y1="56" x2="200" y2="200" stroke="${teal}" stroke-width="16" stroke-linecap="round"/></svg>`,
  }

  // Default intro text
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

  // Helper to generate pricing table
  const generatePricingTable = (
    stroomtariefPiek?: string,
    stroomtariefDal?: string,
    stroomtariefEnkel?: string,
    gastarief?: string,
    style: 'compact' | 'spacious' = 'compact'
  ): string => {
    const rowStyle = style === 'compact' ? 'padding: 10px 0;' : 'padding: 12px 0;'
    const priceStyle = style === 'compact' ? 'font-size: 17px;' : 'font-size: 20px;'
    
    let rows = ''
    if (stroomtariefPiek) {
      rows += `
        <tr>
          <td style="${rowStyle} border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600; font-size: 14px;">Stroomtarief piek:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; ${priceStyle}">${stroomtariefPiek}</td>
                <td style="color: ${gray600}; padding-left: 8px; font-size: 13px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
      `
    }
    if (stroomtariefDal) {
      rows += `
        <tr>
          <td style="${rowStyle} border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600; font-size: 14px;">Stroomtarief dal:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; ${priceStyle}">${stroomtariefDal}</td>
                <td style="color: ${gray600}; padding-left: 8px; font-size: 13px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
      `
    }
    if (stroomtariefEnkel) {
      rows += `
        <tr>
          <td style="${rowStyle} border-bottom: 1px solid ${gray200};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600; font-size: 14px;">Stroomtarief enkel:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; ${priceStyle}">${stroomtariefEnkel}</td>
                <td style="color: ${gray600}; padding-left: 8px; font-size: 13px;">per kWh</td>
              </tr>
            </table>
          </td>
        </tr>
      `
    }
    if (gastarief) {
      rows += `
        <tr>
          <td style="${rowStyle}">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="color: ${navy}; font-weight: 600; font-size: 14px;">Gastarief:</td>
                <td align="right" style="color: ${teal}; font-weight: 700; ${priceStyle}">${gastarief}</td>
                <td style="color: ${gray600}; padding-left: 8px; font-size: 13px;">per m³</td>
              </tr>
            </table>
          </td>
        </tr>
      `
    }
    return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: ${gray700}; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif; line-height: 1.6;">${rows}</table>`
  }

  // VARIANT 1: Compact with icon next to title (horizontal layout)
  const generateVariant1Card = (title: string, pricingTable: string, details: string, buttonText: string, buttonLink: string, icon: string) => {
    return `
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${white}; border: 1px solid ${gray200}; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding: 28px;" class="email-padding email-mobile-padding">
                <!-- Header with icon and title side by side -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                  <tr>
                    <td style="width: 40px; vertical-align: middle;">
                      <div style="width: 40px; height: 40px; background: ${tealLight}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        ${icon}
                      </div>
                    </td>
                    <td style="padding-left: 16px; vertical-align: middle;">
                      <h3 style="color: ${navy}; font-size: 20px; font-weight: 700; margin: 0; padding: 0; font-family: 'Space Grotesk', 'Arial', sans-serif; line-height: 1.3;">
                        ${title}
                      </h3>
                    </td>
                  </tr>
                </table>
                
                <!-- Pricing Table -->
                <div style="background: ${tealLight}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  ${pricingTable}
                </div>
                
                <p style="margin: 0 0 24px 0; padding: 0; font-size: 12px; color: ${gray600}; line-height: 1.6; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                  ${details}
                </p>
                
                <!-- Button -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonLink}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="8%" stroke="f" fillcolor="${teal}">
                        <w:anchorlock/><center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:15px;font-weight:600;">${buttonText}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${buttonLink}" style="display: inline-block; background-color: ${teal}; color: ${white}; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                        ${buttonText}
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
    `
  }

  // VARIANT 2: Minimalist with left border accent
  const generateVariant2Card = (title: string, pricingTable: string, details: string, buttonText: string, buttonLink: string, icon: string) => {
    return `
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${white}; border-left: 4px solid ${teal}; border-top: 1px solid ${gray200}; border-right: 1px solid ${gray200}; border-bottom: 1px solid ${gray200}; border-radius: 8px; margin-bottom: 24px;">
            <tr>
              <td style="padding: 32px;" class="email-padding email-mobile-padding">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center">
                      <div style="width: 48px; height: 48px; background: ${tealLight}; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        ${icon}
                      </div>
                      <h3 style="color: ${navy}; font-size: 22px; font-weight: 700; margin: 0; padding: 0; text-align: center; font-family: 'Space Grotesk', 'Arial', sans-serif; line-height: 1.3;">
                        ${title}
                      </h3>
                    </td>
                  </tr>
                </table>
                
                <div style="background: ${gray50}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  ${pricingTable}
                </div>
                
                <p style="margin: 0 0 24px 0; padding: 0; font-size: 13px; color: ${gray600}; line-height: 1.6; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                  ${details}
                </p>
                
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonLink}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="8%" stroke="f" fillcolor="${teal}">
                        <w:anchorlock/><center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:15px;font-weight:600;">${buttonText}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${buttonLink}" style="display: inline-block; background-color: ${teal}; color: ${white}; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                        ${buttonText}
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
    `
  }

  // VARIANT 3: Cards with gradient header
  const generateVariant3Card = (title: string, pricingTable: string, details: string, buttonText: string, buttonLink: string, icon: string) => {
    return `
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${white}; border: 1px solid ${gray200}; border-radius: 12px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Gradient Header -->
            <tr>
              <td style="background: linear-gradient(135deg, ${teal} 0%, ${tealDark} 100%); padding: 24px 28px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="width: 40px; vertical-align: middle;">
                      <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        ${icon.replace(`fill="${teal}"`, 'fill="white"').replace(`stroke="${teal}"`, 'stroke="white"')}
                      </div>
                    </td>
                    <td style="padding-left: 16px; vertical-align: middle;">
                      <h3 style="color: ${white}; font-size: 20px; font-weight: 700; margin: 0; padding: 0; font-family: 'Space Grotesk', 'Arial', sans-serif; line-height: 1.3;">
                        ${title}
                      </h3>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 28px;" class="email-padding email-mobile-padding">
                <div style="background: ${tealLight}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  ${pricingTable}
                </div>
                
                <p style="margin: 0 0 24px 0; padding: 0; font-size: 12px; color: ${gray600}; line-height: 1.6; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                  ${details}
                </p>
                
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonLink}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="8%" stroke="f" fillcolor="${teal}">
                        <w:anchorlock/><center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:15px;font-weight:600;">${buttonText}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${buttonLink}" style="display: inline-block; background-color: ${teal}; color: ${white}; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                        ${buttonText}
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
    `
  }

  // VARIANT 4: Large pricing focus with clean design
  const generateVariant4Card = (title: string, pricingTable: string, details: string, buttonText: string, buttonLink: string, icon: string) => {
    return `
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${white}; border: 2px solid ${gray200}; border-radius: 16px; margin-bottom: 28px; box-shadow: 0 8px 16px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding: 36px 32px;" class="email-padding email-mobile-padding">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                  <tr>
                    <td align="center">
                      <div style="width: 56px; height: 56px; background: linear-gradient(135deg, ${teal} 0%, ${tealDark} 100%); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,175,155,0.3);">
                        ${icon.replace(`fill="${teal}"`, 'fill="white"').replace(`stroke="${teal}"`, 'stroke="white"')}
                      </div>
                      <h3 style="color: ${navy}; font-size: 24px; font-weight: 700; margin: 0; padding: 0; text-align: center; font-family: 'Space Grotesk', 'Arial', sans-serif; line-height: 1.3;">
                        ${title}
                      </h3>
                    </td>
                  </tr>
                </table>
                
                <div style="background: ${tealLight}; border: 1px solid ${gray200}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  ${pricingTable}
                </div>
                
                <p style="margin: 0 0 28px 0; padding: 0; font-size: 13px; color: ${gray600}; line-height: 1.7; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif; text-align: center;">
                  ${details}
                </p>
                
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonLink}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="8%" stroke="f" fillcolor="${teal}">
                        <w:anchorlock/><center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:16px;font-weight:600;">${buttonText}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${buttonLink}" style="display: inline-block; background-color: ${teal}; color: ${white}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif; box-shadow: 0 4px 12px rgba(0,175,155,0.3);">
                        ${buttonText}
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
    `
  }

  // VARIANT 5: Modern card with shadow and spacing
  const generateVariant5Card = (title: string, pricingTable: string, details: string, buttonText: string, buttonLink: string, icon: string) => {
    return `
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${white}; border: 1px solid ${gray200}; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 32px 28px;" class="email-padding email-mobile-padding">
                <!-- Icon and Title -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center">
                      <div style="width: 52px; height: 52px; background: ${tealLight}; border-radius: 13px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 18px;">
                        ${icon}
                      </div>
                      <h3 style="color: ${navy}; font-size: 22px; font-weight: 700; margin: 0; padding: 0; text-align: center; font-family: 'Space Grotesk', 'Arial', sans-serif; line-height: 1.3;">
                        ${title}
                      </h3>
                    </td>
                  </tr>
                </table>
                
                <!-- Pricing -->
                <div style="background: ${tealLight}; border-radius: 10px; padding: 22px; margin-bottom: 22px;">
                  ${pricingTable}
                </div>
                
                <p style="margin: 0 0 26px 0; padding: 0; font-size: 13px; color: ${gray600}; line-height: 1.65; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                  ${details}
                </p>
                
                <!-- Button -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonLink}" style="height:46px;v-text-anchor:middle;width:230px;" arcsize="8%" stroke="f" fillcolor="${teal}">
                        <w:anchorlock/><center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:16px;font-weight:600;">${buttonText}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${buttonLink}" style="display: inline-block; background-color: ${teal}; color: ${white}; text-decoration: none; padding: 13px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">
                        ${buttonText}
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
    `
  }

  // Select card generator based on variant
  const generateCard = (title: string, pricingTable: string, details: string, buttonText: string, buttonLink: string, icon: string) => {
    switch (variant) {
      case 1: return generateVariant1Card(title, pricingTable, details, buttonText, buttonLink, icon)
      case 2: return generateVariant2Card(title, pricingTable, details, buttonText, buttonLink, icon)
      case 3: return generateVariant3Card(title, pricingTable, details, buttonText, buttonLink, icon)
      case 4: return generateVariant4Card(title, pricingTable, details, buttonText, buttonLink, icon)
      case 5: return generateVariant5Card(title, pricingTable, details, buttonText, buttonLink, icon)
      default: return generateVariant1Card(title, pricingTable, details, buttonText, buttonLink, icon)
    }
  }

  // Generate cards for each offer
  const particulierCard = offers.particulier ? generateCard(
    offers.particulier.title,
    generatePricingTable(offers.particulier.stroomtariefPiek, offers.particulier.stroomtariefDal, offers.particulier.stroomtariefEnkel, offers.particulier.gastarief, variant === 4 ? 'spacious' : 'compact'),
    offers.particulier.details,
    'Bekijk dit aanbod',
    offers.particulier.link,
    iconSVGs.lightning
  ) : ''

  const mkbCard = offers.mkb ? generateCard(
    offers.mkb.title,
    generatePricingTable(offers.mkb.stroomtariefPiek, offers.mkb.stroomtariefDal, undefined, offers.mkb.gastarief, variant === 4 ? 'spacious' : 'compact'),
    offers.mkb.details,
    'Bekijk dit aanbod',
    offers.mkb.link,
    iconSVGs.buildings
  ) : ''

  const grootzakelijkCard = offers.grootzakelijk ? generateCard(
    offers.grootzakelijk.title,
    (offers.grootzakelijk.minVerbruik ? `<p style="margin: 0 0 16px 0; padding: 0; font-size: 14px; color: ${gray700}; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif; font-weight: 600;">${offers.grootzakelijk.minVerbruik}</p>` : '') +
    generatePricingTable(offers.grootzakelijk.stroomtariefPiek, offers.grootzakelijk.stroomtariefDal, undefined, offers.grootzakelijk.gastarief, variant === 4 ? 'spacious' : 'compact') +
    (offers.grootzakelijk.extraInfo ? `<p style="margin: 16px 0 0 0; padding: 0; font-size: 12px; color: ${gray600}; line-height: 1.6; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">${offers.grootzakelijk.extraInfo}</p>` : ''),
    offers.grootzakelijk.details,
    'Bekijk dit aanbod',
    offers.grootzakelijk.link,
    iconSVGs.briefcase
  ) : ''

  const dynamischCard = offers.dynamisch ? generateCard(
    offers.dynamisch.title,
    `<p style="margin: 0; padding: 0; font-size: 14px; color: ${gray700}; line-height: 1.8; font-family: 'Plus Jakarta Sans', 'Arial', sans-serif;">${offers.dynamisch.description}</p>`,
    '',
    'Bekijk dynamische tarieven',
    offers.dynamisch.link,
    iconSVGs.lightningSlash
  ) : ''

  // Common header/footer structure
  const headerHTML = `
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
                      <span style="color: ${white}; font-size: 16px; font-weight: 600; font-family: 'Arial', sans-serif;">f</span>
                    </a>
                  </td>
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.instagram.com/pakketadvies" style="display: inline-block; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: ${white}; font-size: 16px; font-weight: 600; font-family: 'Arial', sans-serif;">ig</span>
                    </a>
                  </td>
                  <td align="center" style="padding: 0 8px;">
                    <a href="https://www.linkedin.com/company/pakketadvies" style="display: inline-block; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: ${white}; font-size: 16px; font-weight: 600; font-family: 'Arial', sans-serif;">in</span>
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
      .email-padding {padding: 24px 20px !important;}
      .email-mobile-padding {padding: 20px 16px !important;}
      .email-hero-text {font-size: 28px !important;}
      .email-hero-subtext {font-size: 15px !important;}
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
          ${headerHTML}
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
