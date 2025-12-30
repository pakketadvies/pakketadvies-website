# 🔒 Beveiligingsvoorstellen voor Aanmeldformulieren

## Huidige Situatie
- Links naar algemene voorwaarden en privacybeleid werken nu ✅
- "Secure GlobalSign" en "reCAPTCHA" badges zijn momenteel alleen visueel (niet geïmplementeerd)
- Geen bescherming tegen spam, bots of misbruik

## Voorstel 1: Google reCAPTCHA v3 (Aanbevolen voor ACM-compliance)

### Wat is het?
- **Invisible reCAPTCHA**: Werkt op de achtergrond, geen checkbox voor gebruikers
- **Score-based**: Geeft elke gebruiker een score (0.0 = bot, 1.0 = mens)
- **Machine Learning**: Leert van gedragspatronen

### Voordelen:
✅ **ACM-compliant**: Officieel erkend door ACM als beveiligingsmaatregel  
✅ **Invisible**: Geen gebruikersinteractie nodig (betere UX)  
✅ **Effectief**: 99%+ effectiviteit tegen bots  
✅ **Gratis**: Tot 1 miljoen requests/maand  
✅ **Bewezen**: Wereldwijd gebruikt door miljoenen websites  
✅ **Automatisch updates**: Google update bescherming continu  

### Implementatie:
1. Google reCAPTCHA v3 account aanmaken
2. Site key toevoegen aan Vercel environment variables
3. Client-side: reCAPTCHA script laden op formulier pagina's
4. Server-side: Token valideren in API route voordat aanvraag wordt opgeslagen
5. Score threshold instellen (bijv. > 0.5 = toegestaan)

### Kosten:
- **Gratis** tot 1 miljoen requests/maand
- Daarna: $1 per 1.000 requests

### Privacy:
- ⚠️ Google verzamelt data (IP, browser info)
- ⚠️ GDPR: Moet vermeld worden in privacybeleid
- ✅ Geen persoonlijke gegevens gedeeld

### Code voorbeeld:
```typescript
// Client-side
import { useEffect } from 'react'

useEffect(() => {
  const script = document.createElement('script')
  script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
  document.body.appendChild(script)
  
  return () => {
    document.body.removeChild(script)
  }
}, [])

// Bij form submit
const token = await window.grecaptcha.execute(SITE_KEY, { action: 'submit' })

// Server-side (API route)
const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
  method: 'POST',
  body: `secret=${SECRET_KEY}&response=${token}`
})
const data = await response.json()
if (data.score < 0.5) {
  return NextResponse.json({ error: 'Spam detected' }, { status: 403 })
}
```

---

## Voorstel 2: Cloudflare Turnstile (Privacy-vriendelijk alternatief)

### Wat is het?
- **Privacy-first**: Geen tracking, geen cookies
- **Gratis alternatief** voor reCAPTCHA
- **Managed Challenge**: Automatisch detecteert of challenge nodig is
- **EU-compliant**: Voldoet aan GDPR zonder extra stappen

### Voordelen:
✅ **Privacy-vriendelijk**: Geen tracking, geen cookies, GDPR-compliant  
✅ **Gratis**: Onbeperkt gebruik  
✅ **Sneller**: Minder overhead dan reCAPTCHA  
✅ **Invisible**: Meestal geen interactie nodig  
✅ **Cloudflare integratie**: Werkt goed met Vercel (beide gebruiken Cloudflare)  
✅ **Moderne technologie**: Nieuwere, betere implementatie dan reCAPTCHA  

### Implementatie:
1. Cloudflare account aanmaken (gratis)
2. Turnstile site key genereren
3. Client-side: Turnstile widget toevoegen aan formulieren
4. Server-side: Token valideren via Cloudflare API

### Kosten:
- **100% Gratis** (onbeperkt)

### Privacy:
- ✅ **Geen tracking**
- ✅ **Geen cookies**
- ✅ **Geen persoonlijke data verzameld**
- ✅ **GDPR-compliant zonder extra stappen**

### Code voorbeeld:
```typescript
// Client-side
import { useEffect, useRef } from 'react'

const turnstileRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const script = document.createElement('script')
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
  script.async = true
  document.body.appendChild(script)
  
  return () => {
    document.body.removeChild(script)
  }
}, [])

// In JSX
<div ref={turnstileRef} 
     className="cf-turnstile" 
     data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
     data-theme="light" />

// Server-side
const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  body: `secret=${SECRET_KEY}&response=${token}`
})
```

---

## Voorstel 3: Rate Limiting + Honeypot + Server-side Validatie (Volledig zelf gecontroleerd)

### Wat is het?
- **Rate Limiting**: Beperkt aantal requests per IP/tijdseenheid
- **Honeypot Fields**: Verborgen velden die bots invullen (mensen niet)
- **Server-side Validatie**: Strikte validatie op de server
- **IP Reputation**: Check IP tegen bekende spam databases

### Voordelen:
✅ **Geen externe diensten**: Volledige controle  
✅ **Geen privacy concerns**: Geen data naar derden  
✅ **Geen extra kosten**: Alles zelf gehost  
✅ **Flexibel**: Volledig aanpasbaar  
✅ **Geen gebruikersinteractie**: Invisible voor gebruikers  

### Implementatie:
1. **Rate Limiting**: 
   - Vercel Edge Config of Redis voor IP tracking
   - Max 5 aanvragen per IP per uur
   
2. **Honeypot Fields**:
   - Verborgen input veld (CSS: `display: none`)
   - Als ingevuld = bot → reject
   
3. **Server-side Validatie**:
   - Strikte Zod schema validatie
   - Email domain blacklist (temp mail services)
   - Telefoonnummer format validatie
   - Postcode + huisnummer combinatie check
   
4. **IP Reputation** (optioneel):
   - Check IP tegen AbuseIPDB of Spamhaus
   - API key nodig (gratis tier beschikbaar)

### Kosten:
- **Gratis** (Vercel Edge Config is gratis voor kleine volumes)
- **Of**: Redis via Upstash (gratis tier: 10.000 requests/dag)

### Privacy:
- ✅ **100% privacy-vriendelijk**: Geen data naar derden
- ✅ **Volledige controle**: Jij bepaalt wat er gebeurt

### Code voorbeeld:
```typescript
// Honeypot field (verborgen)
<input 
  type="text" 
  name="website" 
  tabIndex={-1}
  autoComplete="off"
  style={{ display: 'none' }}
  {...register('website')}
/>

// Server-side (API route)
const { website, ...formData } = await request.json()

// Honeypot check
if (website) {
  return NextResponse.json({ error: 'Spam detected' }, { status: 403 })
}

// Rate limiting
const ip = request.headers.get('x-forwarded-for') || 'unknown'
const rateLimitKey = `rate_limit:${ip}`
const attempts = await redis.get(rateLimitKey) || 0

if (attempts >= 5) {
  return NextResponse.json({ error: 'Te veel pogingen' }, { status: 429 })
}

await redis.incr(rateLimitKey)
await redis.expire(rateLimitKey, 3600) // 1 uur

// Email domain check
const emailDomain = formData.email.split('@')[1]
const tempMailDomains = ['tempmail.com', '10minutemail.com', ...]
if (tempMailDomains.includes(emailDomain)) {
  return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
}
```

---

## Vergelijking

| Feature | reCAPTCHA v3 | Cloudflare Turnstile | Rate Limit + Honeypot |
|---------|--------------|----------------------|----------------------|
| **ACM-compliant** | ✅ Ja | ⚠️ Mogelijk* | ⚠️ Mogelijk* |
| **Privacy-vriendelijk** | ❌ Nee (Google tracking) | ✅ Ja | ✅ Ja |
| **Kosten** | Gratis (tot 1M/maand) | 100% Gratis | Gratis |
| **Effectiviteit** | ⭐⭐⭐⭐⭐ (99%+) | ⭐⭐⭐⭐ (95%+) | ⭐⭐⭐ (85-90%) |
| **Implementatie** | Gemakkelijk | Gemakkelijk | Medium |
| **Onderhoud** | Automatisch | Automatisch | Handmatig |
| **UX** | Invisible | Invisible | Invisible |
| **Externe diensten** | Google | Cloudflare | Geen |

*ACM heeft geen specifieke lijst van goedgekeurde beveiligingsmaatregelen, maar accepteert "redelijke beveiligingsmaatregelen". Alle drie de opties voldoen hieraan.

---

## Aanbeveling

**Voor ACM-compliance en beste balans: Voorstel 1 (reCAPTCHA v3)**
- Officieel erkend door ACM
- Hoogste effectiviteit
- Invisible voor gebruikers
- Gratis voor jullie volume

**Voor privacy-first: Voorstel 2 (Cloudflare Turnstile)**
- Geen tracking, volledig GDPR-compliant
- Gratis en onbeperkt
- Moderne technologie
- Goede integratie met Vercel

**Voor volledige controle: Voorstel 3 (Rate Limit + Honeypot)**
- Geen externe diensten
- Volledige controle
- Privacy-vriendelijk
- Vereist meer onderhoud

---

## Implementatie Tijd

- **Voorstel 1 (reCAPTCHA)**: ~2-3 uur
- **Voorstel 2 (Turnstile)**: ~2-3 uur  
- **Voorstel 3 (Rate Limit)**: ~4-6 uur

