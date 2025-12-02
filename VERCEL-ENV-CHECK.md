# Vercel Environment Variables Check

## 📋 Environment Variables die moeten worden ingesteld

Ga naar **Vercel Dashboard → Your Project → Settings → Environment Variables**

### ✅ Verplicht voor Production:

1. **NEXT_PUBLIC_BASE_URL**
   - **Waarde**: `https://pakketadvies.nl`
   - **Environment**: Production, Preview, Development
   - **Belangrijk**: Deze wordt gebruikt voor:
     - Email links (contract viewer, contact bevestigingen)
     - SEO metadata
     - Sitemap generatie
     - Alle interne links

### 🔍 Andere Environment Variables om te checken:

Controleer of deze correct zijn ingesteld:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `RESEND_API_KEY` - Resend API key voor emails
- `RESEND_FROM_EMAIL` - Email adres voor verzenden (bijv. `PakketAdvies <noreply@pakketadvies.nl>`)
- `CONTACT_FORM_RECIPIENT_EMAIL` - Email waar contact formulier naar wordt gestuurd
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (voor server-side)

## 🔧 Hoe te checken via Vercel CLI:

```bash
# Check alle environment variables
vercel env ls

# Check specifieke variable
vercel env pull .env.local

# Of via Vercel Dashboard
# Ga naar: Project → Settings → Environment Variables
```

## ✅ Verificatie:

Na het instellen van `NEXT_PUBLIC_BASE_URL`:

1. **Herdeploy** de applicatie:
   - Ga naar Vercel Dashboard → Deployments
   - Klik op "..." → "Redeploy"

2. **Test emails**:
   - Verstuur een test contact formulier
   - Check of links in emails naar `pakketadvies.nl wijzen

3. **Check sitemap**:
   - Ga naar `https://pakketadvies.nl/sitemap.xml`
   - Check of alle URLs naar `pakketadvies.nl` wijzen

4. **Check metadata**:
   - Inspecteer de HTML source van een pagina
   - Check of OpenGraph en canonical URLs naar `pakketadvies.nl` wijzen

## 🚨 Belangrijk:

- **Preview deployments** gebruiken automatisch de preview URL (bijv. `pakketadvies-website-xxx.vercel.app`)
- De code heeft fallbacks die preview URLs automatisch omzetten naar `pakketadvies.nl`
- Zorg dat `NEXT_PUBLIC_BASE_URL` is ingesteld voor **alle environments** (Production, Preview, Development)

