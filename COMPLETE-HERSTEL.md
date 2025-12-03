# COMPLETE HERSTEL - Alles Fixen

## 🚨 Probleem

Na domeinwissel werken Supabase en afbeeldingen niet meer.

## ✅ OPLOSSING: Environment Variables in Vercel

### STAP 1: Ga naar Vercel Environment Variables

1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer:** "pakketadvies-website"
3. **Klik:** Settings → Environment Variables

### STAP 2: Check/Add Deze Variabelen

**VERPLICHT (voor Supabase):**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://dxztyhwiwgrxjnlohapm.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (je anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = (je service role key)

**VERPLICHT (voor domein):**
- `NEXT_PUBLIC_BASE_URL` = `https://pakketadvies.nl`

**BELANGRIJK:**
- Zet deze voor **Production, Preview, EN Development**
- Klik "Save" na elke toevoeging

### STAP 3: Check Supabase CORS

1. **Ga naar:** https://supabase.com/dashboard
2. **Selecteer project**
3. **Settings → API**
4. **Scroll naar "CORS"**
5. **Zorg dat deze origins erin staan:**
   - `https://pakketadvies.nl`
   - `https://www.pakketadvies.nl`
   - `https://pakketadvies-website-*.vercel.app` (voor previews)

### STAP 4: Redeploy

1. **Vercel Dashboard → Deployments**
2. **Klik:** "..." → "Redeploy"
3. **Selecteer:** "Use latest commit"
4. **Redeploy**

## 🔧 Als Het Nog Steeds Niet Werkt

Check deployment logs:
1. **Deployments → Klik op deployment → Logs**
2. Kijk naar errors

## 📞 Supabase Credentials Ophalen

Als je de Supabase credentials niet meer weet:
1. **Supabase Dashboard → Settings → API**
2. **Kopieer:**
   - Project URL
   - anon public key
   - service_role key (geheim!)

