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

  // Brand colors (aligned with tailwind brand palette)
  const navy = '#1A3756'
  const navyDark = '#102238'
  const teal = '#00AF9B'
  const tealLight = '#E6F9F7'
  const tealDark = '#008C7C'
  const purple = '#8B5CF6'
  const purpleDark = '#6D28D9'
  const purpleLight = '#F5F3FF'
  const gray50 = '#F9FAFB'
  const gray100 = '#F3F4F6'
  const gray200 = '#E5E7EB'
  const gray600 = '#4B5563'
  const gray700 = '#374151'
  const white = '#FFFFFF'

  // Brand assets
  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`
  const heroImageUrl = `${baseUrl}/images/hero-main.jpg`
  const officeTeamImageUrl = `${baseUrl}/images/gevel.jpg`
  const defaultIntroText = `Beste ${recipientName || 'klant'},<br><br>We hebben uw gegevens verzameld via onze social media campagnes voor particulier en/of zakelijke energie. Via deze email willen we u graag op de hoogte brengen van onze nieuwe aanbiedingen voor deze maand.<br><br><strong style="color: ${navy};">Let op:</strong> momenteel hebben wij voor groot MKB en grootverbruikers met een verbruik boven de 75.000kWh een heel scherp tarief voor lange looptijd.<br><br>Daarnaast hebben wij aantrekkelijke opties voor eigenaren van zonnepanelen via dynamische contracten. Voor grote zakelijke klanten bieden wij strategische inkoop aan. Vergelijk direct alle aanbiedingen via <a href="${baseUrl}/calculator" style="color: ${teal}; text-decoration: underline; font-weight: 600;">${baseUrl}/calculator</a> of neem contact met ons op voor persoonlijk advies.`

  // Icon SVGs - Teal versions for regular cards (kept for potential future variants)
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

  // Pricing table helper - tarieven rechts uitgelijnd
  const pricingTable = (p: any, spacious = false) => {
    const pad = spacious ? '14px' : '10px'
    const size = spacious ? '19px' : '16px'
    let rows = ''
    if (p.stroomtariefPiek) rows += `<tr><td style="padding: ${pad} 0; border-bottom: 1px solid ${gray200};"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="color: ${navy}; font-weight: 600; font-size: 14px; width: auto;">Stroomtarief piek:</td><td align="right" style="color: ${teal}; font-weight: 700; font-size: ${size}; white-space: nowrap; padding-left: 12px;">${p.stroomtariefPiek} <span style="color: ${gray600}; font-weight: 400; font-size: 13px;">per kWh</span></td></tr></table></td></tr>`
    if (p.stroomtariefDal) rows += `<tr><td style="padding: ${pad} 0; border-bottom: 1px solid ${gray200};"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="color: ${navy}; font-weight: 600; font-size: 14px; width: auto;">Stroomtarief dal:</td><td align="right" style="color: ${teal}; font-weight: 700; font-size: ${size}; white-space: nowrap; padding-left: 12px;">${p.stroomtariefDal} <span style="color: ${gray600}; font-weight: 400; font-size: 13px;">per kWh</span></td></tr></table></td></tr>`
    if (p.stroomtariefEnkel) rows += `<tr><td style="padding: ${pad} 0; border-bottom: 1px solid ${gray200};"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="color: ${navy}; font-weight: 600; font-size: 14px; width: auto;">Stroomtarief enkel:</td><td align="right" style="color: ${teal}; font-weight: 700; font-size: ${size}; white-space: nowrap; padding-left: 12px;">${p.stroomtariefEnkel} <span style="color: ${gray600}; font-weight: 400; font-size: 13px;">per kWh</span></td></tr></table></td></tr>`
    if (p.gastarief) rows += `<tr><td style="padding: ${pad} 0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="color: ${navy}; font-weight: 600; font-size: 14px; width: auto;">Gastarief:</td><td align="right" style="color: ${teal}; font-weight: 700; font-size: ${size}; white-space: nowrap; padding-left: 12px;">${p.gastarief} <span style="color: ${gray600}; font-weight: 400; font-size: 13px;">per m³</span></td></tr></table></td></tr>`
    return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: ${gray700}; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">${rows}</table>`
  }

  // Button helper
  const button = (text: string, link: string, style = '') => {
    const btnStyle = style || `background-color: ${teal}; color: ${white}; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;`
    return `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${link}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="8%" stroke="f" fillcolor="${teal}"><w:anchorlock/><center style="color:#FFFFFF;font-family:Arial;font-size:15px;font-weight:600;">${text}</center></v:roundrect><![endif]--><a href="${link}" style="display: inline-block; ${btnStyle} text-decoration: none; font-family: 'Plus Jakarta Sans', Arial, sans-serif; mso-hide: all;">${text}</a>`
  }

  // Single active variant: Premium Brand Layout
  const emailHTML = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Energietarieven</title></head><body style="margin:0;padding:0;background:${gray100};font-family:'Plus Jakarta Sans',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:${gray100};padding:24px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:${white};max-width:600px;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 14px 40px rgba(0,0,0,0.16);">
      <!-- Header with gradient and hero image -->
      <tr>
        <td style="padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="background:linear-gradient(135deg,${navy} 0%,${teal} 100%);padding:28px 28px 0 28px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="left" valign="middle" style="padding-bottom:18px;">
                      <table cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="padding:0 0 10px 0;">
                            <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="display:block;max-width:210px;width:100%;height:auto;margin:0;">
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <span style="display:inline-block;padding:4px 12px;border-radius:999px;background-color:rgba(255,255,255,0.14);color:${white};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Maandelijkse energie-update</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" valign="bottom" style="padding-left:8px;">
                      <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;border-spacing:0;">
                        <tr>
                          <td style="border-radius:18px;overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.2);">
                            <img src="${heroImageUrl}" alt="Energieadvies op maat" style="display:block;width:180px;height:120px;object-fit:cover;border-radius:18px;">
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:24px 0 32px 0;">
                      <h1 style="color:${white};font-size:30px;line-height:1.25;font-weight:700;margin:0 0 8px 0;font-family:'Space Grotesk',Arial,sans-serif;">
                        Slim inkopen, <span style="color:${purpleLight};">zeker zijn</span> van uw energietarieven
                      </h1>
                      <p style="color:rgba(255,255,255,0.86);font-size:14px;line-height:1.7;margin:0;max-width:460px;">
                        Actuele aanbiedingen voor particulieren, MKB en grootzakelijke verbruikers – zorgvuldig geselecteerd door de energie-experts van PakketAdvies.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Intro / personal message -->
      <tr>
        <td style="background:${white};padding:32px 32px 8px 32px;">
          <p style="color:${gray600};font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;margin:0 0 12px 0;">
            <span style="color:${navy};">Persoonlijk bericht</span> van uw energiepartner
          </p>
          <div style="color:${gray700};font-size:15px;line-height:1.8;background:${gray50};padding:22px 24px;border-radius:14px;border:1px solid ${gray200};">
            ${introText || defaultIntroText}
          </div>
        </td>
      </tr>

      <!-- Trust bar -->
      <tr>
        <td style="padding:4px 32px 24px 32px;background:${white};">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding:12px 14px;border-radius:14px;background:${gray50};border:1px solid ${gray200};border-left:3px solid ${teal};font-size:11px;color:${gray600};">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td valign="top" style="width:16px;padding:2px 6px 0 0;">
                      <span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${teal};"></span>
                    </td>
                    <td valign="top" style="padding:0;">
                      <p style="margin:0 0 2px 0;font-weight:600;color:${navy};font-size:11px;">
                        PakketAdvies
                      </p>
                      <p style="margin:0 0 4px 0;font-size:11px;color:${gray600};">
                        Onafhankelijk energieadvies voor particulieren, MKB en grootzakelijk
                      </p>
                      <p style="margin:0;font-size:11px;color:${tealDark};font-weight:600;">
                        ✓ Gratis &amp; vrijblijvend advies
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Offers -->
      <tr><td style="background:${gray100};padding:28px 32px 36px 32px;">${[
        offers.particulier && `<table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:18px;margin-bottom:24px;box-shadow:0 10px 26px rgba(0,0,0,0.08);overflow:hidden;"><tr><td style="padding:0;"><div style="background:linear-gradient(135deg,${teal} 0%,${tealDark} 60%,${navyDark} 100%);padding:22px 26px 18px 26px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td valign="middle" style="padding:0;"><p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:rgba(255,255,255,0.85);">Voor particulieren</p><h3 style="color:${white};font-size:22px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.particulier.title}</h3></td><td align="right" valign="middle" style="padding-left:14px;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,0.14);color:${white};font-size:11px;font-weight:600;">Vaste &amp; variabele tarieven</span></td></tr></table></div></td></tr><tr><td style="padding:20px 24px 24px 24px;"><div style="background:${tealLight};border-radius:14px;padding:18px 20px;margin-bottom:18px;border:1px solid ${gray200};"><div>${pricingTable(offers.particulier, true)}</div></div><p style="margin:0 0 20px 0;font-size:13px;color:${gray600};line-height:1.7;">${offers.particulier.details}</p><div style="text-align:center;">${button('Bekijk dit aanbod', offers.particulier.link, `background-color:${teal};color:${white};padding:14px 32px;border-radius:999px;font-weight:600;font-size:15px;box-shadow:0 4px 14px rgba(0,175,155,0.35);`)}</div></td></tr></table>`,
        offers.mkb && `<table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:18px;margin-bottom:24px;box-shadow:0 10px 26px rgba(0,0,0,0.08);overflow:hidden;"><tr><td style="padding:0;"><div style="background:linear-gradient(135deg,${purple} 0%,${purpleDark} 50%,${navyDark} 100%);padding:22px 26px 18px 26px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td valign="middle" style="padding:0;"><p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:rgba(255,255,255,0.85);">Voor MKB</p><h3 style="color:${white};font-size:22px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.mkb.title}</h3></td><td align="right" valign="middle" style="padding-left:14px;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,0.16);color:${white};font-size:11px;font-weight:600;">Zakelijk voordeel</span></td></tr></table></div></td></tr><tr><td style="padding:20px 24px 24px 24px;"><div style="background:${purpleLight};border-radius:14px;padding:18px 20px;margin-bottom:18px;border:1px solid ${gray200};"><div>${pricingTable(offers.mkb, true)}</div></div><p style="margin:0 0 20px 0;font-size:13px;color:${gray600};line-height:1.7;">${offers.mkb.details}</p><div style="text-align:center;">${button('Bekijk dit aanbod', offers.mkb.link, `background-color:${purple};color:${white};padding:14px 32px;border-radius:999px;font-weight:600;font-size:15px;box-shadow:0 4px 18px rgba(139,92,246,0.40);`)}</div></td></tr></table>`,
        offers.grootzakelijk && `<table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:18px;margin-bottom:24px;box-shadow:0 12px 30px rgba(0,0,0,0.10);overflow:hidden;"><tr><td style="padding:0;"><div style="background:linear-gradient(135deg,${navyDark} 0%,${purpleDark} 100%);padding:22px 26px 18px 26px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td valign="middle" style="padding:0;"><p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:rgba(255,255,255,0.85);">Grootzakelijk &amp; maatwerk</p><h3 style="color:${white};font-size:22px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.grootzakelijk.title}</h3></td><td align="right" valign="middle" style="padding-left:14px;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,0.20);color:${white};font-size:11px;font-weight:600;">Premium traject</span></td></tr></table></div></td></tr><tr><td style="padding:20px 24px 24px 24px;"><p style="margin:0 0 14px 0;font-size:13px;color:${gray600};font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Vanaf ${offers.grootzakelijk.minVerbruik}</p><div style="background:${gray50};border-radius:14px;padding:18px 20px;margin-bottom:18px;border:1px solid ${gray200};"><div>${pricingTable(offers.grootzakelijk, true)}</div></div>${offers.grootzakelijk.extraInfo ? `<p style="margin:0 0 16px 0;font-size:12px;color:${gray600};line-height:1.65;">${offers.grootzakelijk.extraInfo}</p>` : ''}<p style="margin:0 0 20px 0;font-size:13px;color:${gray600};line-height:1.7;">${offers.grootzakelijk.details}</p><div style="text-align:center;">${button('Plan een adviesgesprek', offers.grootzakelijk.link, `background-color:${navy};color:${white};padding:14px 32px;border-radius:999px;font-weight:600;font-size:15px;box-shadow:0 4px 18px rgba(16,34,56,0.45);`)}</div></td></tr></table>`,
        offers.dynamisch && `<table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:18px;box-shadow:0 10px 26px rgba(0,0,0,0.08);overflow:hidden;"><tr><td style="padding:0;"><div style="background:linear-gradient(135deg,${teal} 0%,${purple} 100%);padding:22px 26px 18px 26px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td valign="middle" style="padding:0;"><p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:rgba(255,255,255,0.85);">Dynamische tarieven</p><h3 style="color:${white};font-size:22px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.dynamisch.title}</h3></td><td align="right" valign="middle" style="padding-left:14px;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,0.16);color:${white};font-size:11px;font-weight:600;">Ideaal met zonnepanelen</span></td></tr></table></div></td></tr><tr><td style="padding:20px 24px 24px 24px;"><p style="margin:0 0 20px 0;font-size:14px;color:${gray700};line-height:1.8;">${offers.dynamisch.description}</p><div style="text-align:center;">${button('Bekijk dynamische tarieven', offers.dynamisch.link, `background-color:${teal};color:${white};padding:14px 32px;border-radius:999px;font-weight:600;font-size:15px;box-shadow:0 4px 18px rgba(0,175,155,0.40);`)}</div></td></tr></table>`,
      ].filter(Boolean).join('')}</td></tr>

      <!-- Contact / CTA section with image stacked below text -->
      <tr>
        <td style="padding:32px 32px 40px 32px;text-align:left;background:${white};">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding:0 0 18px 0;">
                <h2 style="color:${navy};font-size:24px;font-weight:700;margin:0 0 12px 0;font-family:'Space Grotesk',Arial,sans-serif;">Liever even sparren met een specialist?</h2>
                <p style="color:${gray700};font-size:14px;margin:0 0 18px 0;line-height:1.8;">
                  We helpen u graag met een vergelijking op maat, bijvoorbeeld bij meerdere locaties, zonnepanelen of complexe contracten.
                </p>
                <p style="margin:0 0 6px 0;font-size:14px;">
                  <a href="mailto:${contactEmail}" style="color:${teal};text-decoration:none;font-weight:600;">${contactEmail}</a>
                </p>
                <p style="margin:0;font-size:14px;">
                  <a href="tel:${contactPhone.replace(/\s/g, '')}" style="color:${teal};text-decoration:none;font-weight:600;">${contactPhone}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding-top:12px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;border-spacing:0;">
                  <tr>
                    <td style="border-radius:18px;overflow:hidden;background:${gray50};border:1px solid ${gray200};">
                      <img src="${officeTeamImageUrl}" alt="Team PakketAdvies" style="display:block;width:100%;max-width:100%;height:auto;border-radius:18px;">
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr><td style="background:${navy};padding:32px 32px 34px 32px;border-radius:0 0 24px 24px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="text-align:center;"><img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="display:block;max-width:190px;width:100%;height:auto;margin:0 auto 18px auto;opacity:0.92;"></td></tr><tr><td align="center" style="text-align:center;"><p style="color:${white};font-size:13px;margin:0 0 10px 0;">${address}</p></td></tr>${unsubscribeUrl ? `<tr><td align="center" style="text-align:center;"><p style="margin:14px 0 0 0;"><a href="${unsubscribeUrl}" style="color:${white};text-decoration:underline;font-size:11px;">Uitschrijven | Unsubscribe</a></p></td></tr>` : ''}</table></td></tr>
      </table></td></tr></table></body></html>`

  return emailHTML
}
