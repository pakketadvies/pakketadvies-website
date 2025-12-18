/**
 * Newsletter email template - 5 FUNDAMENTALLY different design variants
 * Each variant has different headers, hero sections, layouts, and styling
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
  const navy = '#1A3756'
  const navyDark = '#102238'
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
  const defaultIntroText = `Beste ${recipientName || 'klant'},<br><br>We hebben uw gegevens verzameld via onze social media campagnes voor particulier en/of zakelijke energie. Via deze email willen we u graag op de hoogte brengen van onze nieuwe aanbiedingen voor deze maand.<br><br><strong style="color: ${navy};">Let op:</strong> momenteel hebben wij voor groot MKB en grootverbruikers met een verbruik boven de 75.000kWh een heel scherp tarief voor lange looptijd.<br><br>Daarnaast hebben wij aantrekkelijke opties voor eigenaren van zonnepanelen via dynamische contracten. Voor grote zakelijke klanten bieden wij strategische inkoop aan. Vergelijk direct alle aanbiedingen via <a href="${baseUrl}/calculator" style="color: ${teal}; text-decoration: underline; font-weight: 600;">${baseUrl}/calculator</a> of neem contact met ons op voor persoonlijk advies.`

  // Icon SVGs - Teal versions for regular cards
  const icons = {
    lightning: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M143 36 47 128l56 20-16 72 96-92-56-20 16-72Z" fill="${teal}"/></svg>`,
    buildings: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="64" y="96" width="128" height="128" rx="8" fill="none" stroke="${teal}" stroke-width="16"/><path d="M128 96v128M96 128h64M96 160h64M96 192h64" stroke="${teal}" stroke-width="12" stroke-linecap="round"/></svg>`,
    briefcase: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="32" y="72" width="192" height="144" rx="8" fill="none" stroke="${teal}" stroke-width="16"/><path d="M88 72V56a24 24 0 0 1 24-24h32a24 24 0 0 1 24 24v16" stroke="${teal}" stroke-width="16" stroke-linecap="round"/></svg>`,
    lightningSlash: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M143 36 47 128l56 20-16 72 49-47" stroke="${teal}" stroke-width="16" stroke-linecap="round"/><line x1="56" y1="56" x2="200" y2="200" stroke="${teal}" stroke-width="16" stroke-linecap="round"/></svg>`,
  }
  
  // Icon SVGs - White versions for gradient headers (optimized for email compatibility with perfect centering)
  const iconsWhite = {
    lightning: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;"><path d="M13 3L3 14h8l-2 8 10-11h-8l2-8z" fill="#FFFFFF"/></svg>`,
    buildings: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;"><rect x="4" y="4" width="16" height="16" rx="1" fill="none" stroke="#FFFFFF" stroke-width="1.5"/><path d="M12 4v16M8 8h8M8 12h8M8 16h8" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    briefcase: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;"><rect x="2" y="7" width="20" height="14" rx="1" fill="none" stroke="#FFFFFF" stroke-width="1.5"/><path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    lightningSlash: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;"><path d="M13 3L3 14h6l-2 8 7-8" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="4" y1="4" x2="20" y2="20" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  }

  // Pricing table helper
  const pricingTable = (p: any, spacious = false) => {
    const pad = spacious ? '14px' : '10px'
    const size = spacious ? '19px' : '16px'
    let rows = ''
    if (p.stroomtariefPiek) rows += `<tr><td style="padding: ${pad} 0; border-bottom: 1px solid ${gray200};"><table width="100%"><tr><td style="color: ${navy}; font-weight: 600; font-size: 14px;">Stroomtarief piek:</td><td align="right" style="color: ${teal}; font-weight: 700; font-size: ${size};">${p.stroomtariefPiek}</td><td style="color: ${gray600}; padding-left: 8px; font-size: 13px;">per kWh</td></tr></table></td></tr>`
    if (p.stroomtariefDal) rows += `<tr><td style="padding: ${pad} 0; border-bottom: 1px solid ${gray200};"><table width="100%"><tr><td style="color: ${navy}; font-weight: 600; font-size: 14px;">Stroomtarief dal:</td><td align="right" style="color: ${teal}; font-weight: 700; font-size: ${size};">${p.stroomtariefDal}</td><td style="color: ${gray600}; padding-left: 8px; font-size: 13px;">per kWh</td></tr></table></td></tr>`
    if (p.stroomtariefEnkel) rows += `<tr><td style="padding: ${pad} 0; border-bottom: 1px solid ${gray200};"><table width="100%"><tr><td style="color: ${navy}; font-weight: 600; font-size: 14px;">Stroomtarief enkel:</td><td align="right" style="color: ${teal}; font-weight: 700; font-size: ${size};">${p.stroomtariefEnkel}</td><td style="color: ${gray600}; padding-left: 8px; font-size: 13px;">per kWh</td></tr></table></td></tr>`
    if (p.gastarief) rows += `<tr><td style="padding: ${pad} 0;"><table width="100%"><tr><td style="color: ${navy}; font-weight: 600; font-size: 14px;">Gastarief:</td><td align="right" style="color: ${teal}; font-weight: 700; font-size: ${size};">${p.gastarief}</td><td style="color: ${gray600}; padding-left: 8px; font-size: 13px;">per m³</td></tr></table></td></tr>`
    return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: ${gray700}; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">${rows}</table>`
  }

  // Button helper
  const button = (text: string, link: string, style = '') => {
    const btnStyle = style || `background-color: ${teal}; color: ${white}; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;`
    return `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${link}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="8%" stroke="f" fillcolor="${teal}"><w:anchorlock/><center style="color:#FFFFFF;font-family:Arial;font-size:15px;font-weight:600;">${text}</center></v:roundrect><![endif]--><a href="${link}" style="display: inline-block; ${btnStyle} text-decoration: none; font-family: 'Plus Jakarta Sans', Arial, sans-serif; mso-hide: all;">${text}</a>`
  }

  // Single active variant: Bold Cards (voorheen variant 5)
  const emailHTML = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Energietarieven</title></head><body style="margin:0;padding:0;background:${gray100};font-family:'Plus Jakarta Sans',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:${gray100};padding:20px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:${white};max-width:600px;width:100%;border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);">
      <tr><td style="background:linear-gradient(135deg,${navy} 0%,${teal} 100%);padding:50px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="text-align:center;"><img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="display:block;max-width:250px;width:100%;height:auto;margin:0 auto;"></td></tr></table></td></tr>
      <tr><td style="background:${white};padding:50px 32px;text-align:center;"><h1 style="color:${navy};font-size:36px;font-weight:700;margin:0 0 16px 0;font-family:'Space Grotesk',Arial,sans-serif;line-height:1.2;"><span style="color:${teal};">Uw exclusieve</span><br>energie aanbod</h1><p style="color:${gray600};font-size:16px;margin:0;font-weight:500;">Claim deze eindejaar aanbiedingen</p></td></tr>
      <tr><td style="padding:40px 32px;background:${gray50};"><div style="color:${gray700};font-size:16px;line-height:1.85;background:${white};padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">${introText || defaultIntroText}</div></td></tr>
      <tr><td style="background:${gray100};padding:40px 32px;">${[
        offers.particulier && `<table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:16px;margin-bottom:28px;box-shadow:0 8px 20px rgba(0,0,0,0.1);overflow:hidden;"><tr><td style="padding:0;"><div style="background:linear-gradient(135deg,${teal} 0%,${tealDark} 100%);padding:28px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="56" valign="middle" style="padding:0;"><table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="width:56px;height:56px;background:rgba(255,255,255,0.25);border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><tr><td align="center" valign="middle" style="width:56px;height:56px;text-align:center;vertical-align:middle;padding:0;line-height:56px;font-size:0;">${iconsWhite.lightning}</td></tr></table></td><td valign="middle" style="padding-left:20px;"><h3 style="color:${white};font-size:24px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.particulier.title}</h3></td></tr></table></div></td></tr><tr><td style="padding:36px 32px;"><div style="background:${tealLight};border-radius:12px;padding:28px;margin-bottom:24px;border:2px solid ${gray200};"><div>${pricingTable(offers.particulier, true)}</div></div><p style="margin:0 0 30px 0;font-size:13px;color:${gray600};line-height:1.7;">${offers.particulier.details}</p><div style="text-align:center;">${button('Bekijk dit aanbod', offers.particulier.link, `background-color:${teal};color:${white};padding:16px 40px;border-radius:10px;font-weight:600;font-size:16px;box-shadow:0 4px 14px rgba(0,175,155,0.35);`)}</div></td></tr></table>`,
        offers.mkb && `<table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:16px;margin-bottom:28px;box-shadow:0 8px 20px rgba(0,0,0,0.1);overflow:hidden;"><tr><td style="padding:0;"><div style="background:linear-gradient(135deg,${teal} 0%,${tealDark} 100%);padding:28px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="56" valign="middle" style="padding:0;"><table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="width:56px;height:56px;background:rgba(255,255,255,0.25);border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><tr><td align="center" valign="middle" style="width:56px;height:56px;text-align:center;vertical-align:middle;padding:0;line-height:56px;font-size:0;">${iconsWhite.buildings}</td></tr></table></td><td valign="middle" style="padding-left:20px;"><h3 style="color:${white};font-size:24px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.mkb.title}</h3></td></tr></table></div></td></tr><tr><td style="padding:36px 32px;"><div style="background:${tealLight};border-radius:12px;padding:28px;margin-bottom:24px;border:2px solid ${gray200};"><div>${pricingTable(offers.mkb, true)}</div></div><p style="margin:0 0 30px 0;font-size:13px;color:${gray600};line-height:1.7;">${offers.mkb.details}</p><div style="text-align:center;">${button('Bekijk dit aanbod', offers.mkb.link, `background-color:${teal};color:${white};padding:16px 40px;border-radius:10px;font-weight:600;font-size:16px;box-shadow:0 4px 14px rgba(0,175,155,0.35);`)}</div></td></tr></table>`,
        offers.grootzakelijk && `<table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:16px;margin-bottom:28px;box-shadow:0 8px 20px rgba(0,0,0,0.1);overflow:hidden;"><tr><td style="padding:0;"><div style="background:linear-gradient(135deg,${teal} 0%,${tealDark} 100%);padding:28px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="56" valign="middle" style="padding:0;"><table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="width:56px;height:56px;background:rgba(255,255,255,0.25);border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><tr><td align="center" valign="middle" style="width:56px;height:56px;text-align:center;vertical-align:middle;padding:0;line-height:56px;font-size:0;">${iconsWhite.briefcase}</td></tr></table></td><td valign="middle" style="padding-left:20px;"><h3 style="color:${white};font-size:24px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.grootzakelijk.title}</h3></td></tr></table></div></td></tr><tr><td style="padding:36px 32px;"><p style="margin:0 0 22px 0;font-size:15px;color:${gray700};font-weight:600;">${offers.grootzakelijk.minVerbruik}</p><div style="background:${tealLight};border-radius:12px;padding:28px;margin-bottom:24px;border:2px solid ${gray200};"><div>${pricingTable(offers.grootzakelijk, true)}</div></div>${offers.grootzakelijk.extraInfo ? `<p style="margin:0 0 22px 0;font-size:12px;color:${gray600};line-height:1.65;">${offers.grootzakelijk.extraInfo}</p>` : ''}<p style="margin:0 0 30px 0;font-size:13px;color:${gray600};line-height:1.7;">${offers.grootzakelijk.details}</p><div style="text-align:center;">${button('Bekijk dit aanbod', offers.grootzakelijk.link, `background-color:${teal};color:${white};padding:16px 40px;border-radius:10px;font-weight:600;font-size:16px;box-shadow:0 4px 14px rgba(0,175,155,0.35);`)}</div></td></tr></table>`,
        offers.dynamisch && `<table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.1);overflow:hidden;"><tr><td style="padding:0;"><div style="background:linear-gradient(135deg,${teal} 0%,${tealDark} 100%);padding:28px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="56" valign="middle" style="padding:0;"><table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="width:56px;height:56px;background:rgba(255,255,255,0.25);border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><tr><td align="center" valign="middle" style="width:56px;height:56px;text-align:center;vertical-align:middle;padding:0;line-height:56px;font-size:0;">${iconsWhite.lightningSlash}</td></tr></table></td><td valign="middle" style="padding-left:20px;"><h3 style="color:${white};font-size:24px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.dynamisch.title}</h3></td></tr></table></div></td></tr><tr><td style="padding:36px 32px;"><p style="margin:0 0 30px 0;font-size:15px;color:${gray700};line-height:1.85;">${offers.dynamisch.description}</p><div style="text-align:center;">${button('Bekijk dynamische tarieven', offers.dynamisch.link, `background-color:${teal};color:${white};padding:16px 40px;border-radius:10px;font-weight:600;font-size:16px;box-shadow:0 4px 14px rgba(0,175,155,0.35);`)}</div></td></tr></table>`,
      ].filter(Boolean).join('')}</td></tr>
      <tr><td style="padding:44px 32px;text-align:center;background:${white};"><h2 style="color:${navy};font-size:26px;font-weight:700;margin:0 0 22px 0;">Vragen of persoonlijk advies?</h2><p style="color:${gray700};font-size:16px;margin:0 0 28px 0;line-height:1.8;">Geïnteresseerd? Neem contact op.</p><div style="margin:18px 0;"><a href="mailto:${contactEmail}" style="color:${teal};text-decoration:none;font-weight:600;font-size:17px;">${contactEmail}</a></div><div><a href="tel:${contactPhone.replace(/\s/g, '')}" style="color:${teal};text-decoration:none;font-weight:600;font-size:17px;">${contactPhone}</a></div></td></tr>
      <tr><td style="background:${navy};padding:44px 32px;border-radius:0 0 16px 16px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="text-align:center;"><img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="display:block;max-width:210px;width:100%;height:auto;margin:0 auto 24px auto;opacity:0.9;"></td></tr><tr><td align="center" style="text-align:center;"><p style="color:${white};font-size:14px;margin:0 0 18px 0;">${address}</p></td></tr>${unsubscribeUrl ? `<tr><td align="center" style="text-align:center;"><p style="margin:22px 0 0 0;"><a href="${unsubscribeUrl}" style="color:${white};text-decoration:underline;font-size:12px;">Uitschrijven | Unsubscribe</a></p></td></tr>` : ''}</table></td></tr>
      </table></td></tr></table></body></html>`

  return emailHTML
}
