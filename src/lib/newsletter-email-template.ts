/**
 * Newsletter email template - variant 5 (Bold Cards)
 * Dit is de enige (en definitieve) variant die we gebruiken.
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
  const purple = '#7C3AED'
  const purpleLight = '#EEF2FF'
  const gray50 = '#F9FAFB'
  const gray100 = '#F3F4F6'
  const gray200 = '#E5E7EB'
  const gray600 = '#4B5563'
  const gray700 = '#374151'
  const white = '#FFFFFF'

  const pakketAdviesLogoUrl = `${baseUrl}/images/logo-wit.png`
  const heroImageUrl = `${baseUrl}/images/hero-main.jpg`
  const particulierImageUrl = `${baseUrl}/images/solar-roof.jpg`
  const mkbImageUrl = `${baseUrl}/images/kantoren-office.jpg`
  const grootzakelijkImageUrl = `${baseUrl}/images/industrie-factory.jpg`
  const dynamischImageUrl = `${baseUrl}/images/features-dashboard.jpg`
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

  // Definitieve variant: Bold Cards (variant 5), opgefrist met extra kleur en afbeeldingen
  const emailHTML = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Energietarieven</title></head><body style="margin:0;padding:0;background:${gray100};font-family:'Plus Jakarta Sans',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:${gray100};padding:20px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:${white};max-width:600px;width:100%;border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);">
    <tr><td style="background:linear-gradient(135deg,${navy} 0%,${teal} 50%,${purple} 100%);padding:18px 32px 46px 32px;border-bottom:3px solid ${purpleLight};"><table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="text-align:center;padding-bottom:14px;">
          <span style="display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,0.12);color:${white};font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Energie deals december</span>
        </td>
      </tr>
      <tr>
        <td align="center" style="text-align:center;">
          <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="display:block;max-width:230px;width:100%;height:auto;margin:0 auto;">
        </td>
      </tr>
    </table></td></tr>
    <tr><td style="background:${white};padding:32px 32px 12px 32px;text-align:center;border-bottom:1px solid ${gray200};">
      <h1 style="color:${navy};font-size:32px;font-weight:700;margin:0 0 10px 0;font-family:'Space Grotesk',Arial,sans-serif;line-height:1.25;">
        <span style="color:${teal};">Uw exclusieve</span><br><span style="color:${purple};">energie aanbod</span>
      </h1>
      <p style="color:${gray600};font-size:15px;margin:0 0 18px 0;font-weight:500;">Scherpe eindejaarsaanbiedingen voor particulier, MKB en grootzakelijk.</p>
    </td></tr>
    <tr><td style="padding:0 32px 36px 32px;background:${white};">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:0 0 18px 0;">
            <img src="${heroImageUrl}" alt="Energieadvies en vergelijking" style="display:block;width:100%;height:auto;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,0.12);">
          </td>
        </tr>
        <tr>
          <td style="padding-top:10px;">
            <div style="color:${gray700};font-size:15px;line-height:1.85;background:${gray50};padding:20px 22px;border-radius:12px;border:1px solid ${gray200};">
              ${introText || defaultIntroText}
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="background:${gray100};padding:32px 24px 40px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 18px;">
        <tr>
          <td colspan="3" style="padding:0 8px 10px 8px;">
            <p style="margin:0;font-size:13px;color:${gray600};text-align:center;">
              Bekijk hieronder de aanbiedingen die wij op dit moment voor u geselecteerd hebben.
            </p>
          </td>
        </tr>
        ${[
          offers.particulier && `<tr><td colspan="3" style="padding:0 8px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:18px;box-shadow:0 8px 22px rgba(0,0,0,0.12);overflow:hidden;border:1px solid ${purpleLight};">
            <tr>
              <td style="padding:0;">
                <div style="background:linear-gradient(135deg,${teal} 0%,${tealDark} 45%,${purple} 100%);padding:24px 26px 22px 26px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="56" valign="middle" style="padding:0;">
                        <table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="width:56px;height:56px;background:rgba(255,255,255,0.20);border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.18);">
                          <tr>
                            <td align="center" valign="middle" style="width:56px;height:56px;text-align:center;vertical-align:middle;padding:0;line-height:56px;font-size:0;">
                              ${iconsWhite.lightning}
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td valign="middle" style="padding-left:18px;">
                        <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.85);font-weight:600;">Particulier</p>
                        <h3 style="color:${white};font-size:22px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.particulier.title}</h3>
                      </td>
                      <td align="right" valign="middle" style="padding-left:8px;">
                        <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.20);color:${white};font-size:11px;font-weight:600;">
                          3 jaar vast
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px;">
                  <tr>
                    <td width="46%" valign="top" style="padding-right:10px;">
                      <div style="background:${tealLight};border-radius:12px;padding:16px 14px;border:1px solid ${gray200};">
                        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:${tealDark};margin-bottom:6px;">Tarieven</div>
                        <div>${pricingTable(offers.particulier, true)}</div>
                      </div>
                    </td>
                    <td width="54%" valign="top" style="padding-left:6px;">
                      <div style="background:${gray50};border-radius:12px;padding:14px 14px;border:1px solid ${gray200};">
                        <p style="margin:0;font-size:12px;color:${gray600};line-height:1.7;">${offers.particulier.details}</p>
                      </div>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px;">
                  <tr>
                    <td valign="middle" style="padding-right:10px;">
                      <img src="${particulierImageUrl}" alt="Particulier energieaanbod" style="display:block;width:100%;max-height:120px;height:auto;border-radius:12px;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,0.12);">
                    </td>
                    <td valign="middle" style="padding-left:4px;">
                      <p style="margin:0;font-size:11px;color:${gray600};line-height:1.6;">
                        Ideaal voor huishoudens die langere zekerheid willen over hun energietarieven en geen verrassingen op de jaarafrekening willen.
                      </p>
                    </td>
                  </tr>
                </table>
                <div style="text-align:center;">
                  ${button('Bekijk dit aanbod', offers.particulier.link, `background-color:${teal};color:${white};padding:14px 36px;border-radius:999px;font-weight:600;font-size:15px;box-shadow:0 4px 14px rgba(0,175,155,0.35);`)}
                </div>
              </td>
            </tr>
          </table></td></tr>`,
          offers.mkb && `<tr><td colspan="3" style="padding:0 8px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:18px;box-shadow:0 8px 22px rgba(0,0,0,0.12);overflow:hidden;border:1px solid ${gray200};">
            <tr>
              <td style="padding:0;">
                <div style="background:linear-gradient(135deg,${navyDark} 0%,${navy} 40%,${purple} 100%);padding:24px 26px 22px 26px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="56" valign="middle" style="padding:0;">
                        <table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="width:56px;height:56px;background:rgba(255,255,255,0.20);border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.18);">
                          <tr>
                            <td align="center" valign="middle" style="width:56px;height:56px;text-align:center;vertical-align:middle;padding:0;line-height:56px;font-size:0;">
                              ${iconsWhite.buildings}
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td valign="middle" style="padding-left:18px;">
                        <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.85);font-weight:600;">MKB</p>
                        <h3 style="color:${white};font-size:22px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.mkb.title}</h3>
                      </td>
                      <td align="right" valign="middle" style="padding-left:8px;">
                        <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.18);color:${white};font-size:11px;font-weight:600;">
                          Inclusief advies
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px;">
                  <tr>
                    <td width="46%" valign="top" style="padding-right:10px;">
                      <div style="background:${gray50};border-radius:12px;padding:16px 14px;border:1px solid ${gray200};">
                        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:${navy};margin-bottom:6px;">Tarieven</div>
                        <div>${pricingTable(offers.mkb, true)}</div>
                      </div>
                    </td>
                    <td width="54%" valign="top" style="padding-left:6px;">
                      <div style="background:${purpleLight};border-radius:12px;padding:14px 14px;border:1px solid ${gray200};">
                        <p style="margin:0;font-size:12px;color:${gray600};line-height:1.7;">${offers.mkb.details}</p>
                      </div>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px;">
                  <tr>
                    <td valign="middle" style="padding-right:10px;">
                      <img src="${mkbImageUrl}" alt="MKB energieaanbod" style="display:block;width:100%;max-height:120px;height:auto;border-radius:12px;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,0.12);">
                    </td>
                    <td valign="middle" style="padding-left:4px;">
                      <p style="margin:0;font-size:11px;color:${gray600};line-height:1.6;">
                        Geschikt voor kantoren, horeca en andere MKB-bedrijven die hun energiekosten voor meerdere jaren willen vastzetten.
                      </p>
                    </td>
                  </tr>
                </table>
                <div style="text-align:center;">
                  ${button('Bekijk MKB-aanbod', offers.mkb.link, `background-color:${navy};color:${white};padding:14px 36px;border-radius:999px;font-weight:600;font-size:15px;box-shadow:0 4px 14px rgba(26,55,86,0.4);`)}
                </div>
              </td>
            </tr>
          </table></td></tr>`,
          offers.grootzakelijk && `<tr><td colspan="3" style="padding:0 8px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:18px;box-shadow:0 8px 22px rgba(0,0,0,0.12);overflow:hidden;border:1px solid ${gray200};">
            <tr>
              <td style="padding:0;">
                <div style="background:linear-gradient(135deg,${navyDark} 0%,${tealDark} 40%,${purple} 95%);padding:24px 26px 22px 26px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="56" valign="middle" style="padding:0;">
                        <table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="width:56px;height:56px;background:rgba(255,255,255,0.22);border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.18);">
                          <tr>
                            <td align="center" valign="middle" style="width:56px;height:56px;text-align:center;vertical-align:middle;padding:0;line-height:56px;font-size:0;">
                              ${iconsWhite.briefcase}
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td valign="middle" style="padding-left:18px;">
                        <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.85);font-weight:600;">Grootzakelijk</p>
                        <h3 style="color:${white};font-size:22px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.grootzakelijk.title}</h3>
                      </td>
                      <td align="right" valign="middle" style="padding-left:8px;">
                        <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.18);color:${white};font-size:11px;font-weight:600;">
                          Vanaf 75.000 kWh
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px;">
                  <tr>
                    <td width="46%" valign="top" style="padding-right:10px;">
                      <div style="background:${gray50};border-radius:12px;padding:16px 14px;border:1px solid ${gray200};">
                        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:${navy};margin-bottom:6px;">Tarieven</div>
                        <p style="margin:0 0 6px 0;font-size:12px;color:${gray700};font-weight:600;">${offers.grootzakelijk.minVerbruik}</p>
                        <div>${pricingTable(offers.grootzakelijk, true)}</div>
                      </div>
                    </td>
                    <td width="54%" valign="top" style="padding-left:6px;">
                      <div style="background:${purpleLight};border-radius:12px;padding:14px 14px;border:1px solid ${gray200};">
                        ${offers.grootzakelijk.extraInfo ? `<p style="margin:0 0 6px 0;font-size:12px;color:${gray600};line-height:1.6;">${offers.grootzakelijk.extraInfo}</p>` : ''}
                        <p style="margin:0;font-size:12px;color:${gray600};line-height:1.7;">${offers.grootzakelijk.details}</p>
                      </div>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px;">
                  <tr>
                    <td valign="middle" style="padding-right:10px;">
                      <img src="${grootzakelijkImageUrl}" alt="Grootzakelijk energieaanbod" style="display:block;width:100%;max-height:120px;height:auto;border-radius:12px;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,0.12);">
                    </td>
                    <td valign="middle" style="padding-left:4px;">
                      <p style="margin:0;font-size:11px;color:${gray600};line-height:1.6;">
                        Voor grotere verbruikers met behoefte aan strategische inkoop, langjarige zekerheid en professionele begeleiding.
                      </p>
                    </td>
                  </tr>
                </table>
                <div style="text-align:center;">
                  ${button('Plan een grootzakelijk gesprek', offers.grootzakelijk.link, `background-color:${purple};color:${white};padding:14px 36px;border-radius:999px;font-weight:600;font-size:15px;box-shadow:0 4px 16px rgba(124,58,237,0.45);`)}
                </div>
              </td>
            </tr>
          </table></td></tr>`,
          offers.dynamisch && `<tr><td colspan="3" style="padding:0 8px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:${white};border-radius:18px;box-shadow:0 8px 22px rgba(0,0,0,0.12);overflow:hidden;border:1px solid ${gray200};">
            <tr>
              <td style="padding:0;">
                <div style="background:linear-gradient(135deg,${purple} 0%,${teal} 55%,${tealDark} 100%);padding:24px 26px 22px 26px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="56" valign="middle" style="padding:0;">
                        <table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="width:56px;height:56px;background:rgba(255,255,255,0.20);border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.18);">
                          <tr>
                            <td align="center" valign="middle" style="width:56px;height:56px;text-align:center;vertical-align:middle;padding:0;line-height:56px;font-size:0;">
                              ${iconsWhite.lightningSlash}
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td valign="middle" style="padding-left:18px;">
                        <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.85);font-weight:600;">Dynamisch</p>
                        <h3 style="color:${white};font-size:22px;font-weight:700;margin:0;font-family:'Space Grotesk',Arial,sans-serif;">${offers.dynamisch.title}</h3>
                      </td>
                      <td align="right" valign="middle" style="padding-left:8px;">
                        <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.18);color:${white};font-size:11px;font-weight:600;">
                          Ideaal met zonnepanelen
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 24px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px;">
                  <tr>
                    <td valign="top" style="padding-right:10px;">
                      <p style="margin:0 0 10px 0;font-size:12px;color:${gray700};line-height:1.75;">${offers.dynamisch.description}</p>
                      <p style="margin:0;font-size:11px;color:${gray600};line-height:1.7;">
                        Perfect voor klanten met zonnepanelen, laadpaal of batterij die hun verbruik slim kunnen sturen op basis van uurtarieven.
                      </p>
                    </td>
                    <td valign="top" style="padding-left:4px;">
                      <img src="${dynamischImageUrl}" alt="Dynamische energietarieven" style="display:block;width:100%;max-height:120px;height:auto;border-radius:12px;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,0.12);">
                    </td>
                  </tr>
                </table>
                <div style="text-align:center;">
                  ${button('Bekijk dynamische tarieven', offers.dynamisch.link, `background-color:${teal};color:${white};padding:14px 36px;border-radius:999px;font-weight:600;font-size:15px;box-shadow:0 4px 16px rgba(0,175,155,0.4);`)}
                </div>
              </td>
            </tr>
          </table></td></tr>`,
        ].filter(Boolean).join('')}
      </table>
    </td></tr>
    <tr><td style="padding:38px 30px 14px 30px;text-align:center;background:${white};border-top:1px solid ${gray200};">
      <h2 style="color:${navy};font-size:22px;font-weight:700;margin:0 0 10px 0;">Vragen of persoonlijk advies?</h2>
      <p style="color:${gray700};font-size:14px;margin:0 0 18px 0;line-height:1.7;">We helpen u graag met het kiezen van het beste pakket voor uw situatie.</p>
      <div style="margin:10px 0;">
        <a href="mailto:${contactEmail}" style="color:${teal};text-decoration:none;font-weight:600;font-size:15px;">${contactEmail}</a>
      </div>
      <div style="margin:4px 0 0 0;">
        <a href="tel:${contactPhone.replace(/\s/g, '')}" style="color:${purple};text-decoration:none;font-weight:600;font-size:15px;">${contactPhone}</a>
      </div>
    </td></tr>
    <tr><td style="background:${navy};padding:32px 28px;border-radius:0 0 16px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="text-align:center;">
            <img src="${pakketAdviesLogoUrl}" alt="PakketAdvies" style="display:block;max-width:190px;width:100%;height:auto;margin:0 auto 18px auto;opacity:0.95;">
          </td>
        </tr>
        <tr>
          <td align="center" style="text-align:center;">
            <p style="color:${white};font-size:13px;margin:0 0 10px 0;">${address}</p>
          </td>
        </tr>
        ${unsubscribeUrl ? `<tr><td align="center" style="text-align:center;"><p style="margin:10px 0 0 0;"><a href="${unsubscribeUrl}" style="color:${white};text-decoration:underline;font-size:11px;">Uitschrijven | Unsubscribe</a></p></td></tr>` : ''}
      </table>
    </td></tr>
  </table></td></tr></table></body></html>`

  return emailHTML
}
