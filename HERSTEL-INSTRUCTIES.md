# HERSTEL INSTRUCTIES - Supabase & Afbeeldingen

## 🚨 Probleem

Na domeinwissel werken Supabase en afbeeldingen niet meer.

## ✅ Oplossing: Check Environment Variables in Vercel

### Stap 1: Check Vercel Environment Variables

1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer project:** "pakketadvies-website"
3. **Ga naar:** Settings → Environment Variables
4. **Check of deze variabelen er zijn:**

**VERPLICHT:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL` (moet `https://pakketadvies.nl` zijn)

**OPTIONEEL (maar belangrijk):**
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_FORM_RECIPIENT_EMAIL`
- `POSTCODE_API_KEY`
- `KVK_API_KEY`
- `CRON_SECRET`

### Stap 2: Check of Variabelen Correct Zijn

**BELANGRIJK:** Check of `NEXT_PUBLIC_BASE_URL` op `https://pakketadvies.nl` staat (niet `pakketadvies.vercel.app`)

### Stap 3: Redeploy Na Aanpassen

Na het aanpassen van environment variables:
1. **Ga naar:** Deployments
2. **Klik:** "..." → "Redeploy"
3. **Selecteer:** "Use latest commit"
4. **Redeploy**

## 🔧 Als Supabase Nog Steeds Niet Werkt

Check Supabase CORS settings:
1. **Ga naar:** Supabase Dashboard
2. **Settings → API**
3. **Check "Allowed CORS origins"**
4. **Zorg dat `https://pakketadvies.nl` en `https://www.pakketadvies.nl` erin staan**

## 🖼️ Als Afbeeldingen Niet Werken

Afbeeldingen gebruiken `/images/` (relatief pad), dus die zouden moeten werken.
Als ze niet werken:
1. Check of bestanden in `public/images/` staan
2. Check browser console voor 404 errors
3. Check of deployment correct is gebouwd

## 📞 Als Niets Helpt

Check deployment logs in Vercel:
1. **Deployments → Klik op deployment → Logs**
2. Kijk naar errors bij build of runtime

