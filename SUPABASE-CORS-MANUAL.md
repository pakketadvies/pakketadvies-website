# Supabase CORS Instellen - Handmatig

## ⚠️ Management API Werkt Niet

De Supabase Management API ondersteunt CORS settings niet direct. CORS moet via de Dashboard worden ingesteld.

## ✅ OPLOSSING: Via Supabase Dashboard

### Stap 1: Ga naar Supabase Dashboard

1. **Ga naar:** https://supabase.com/dashboard
2. **Selecteer project:** "PakketAdvies Project" (dxztyhwiwgrxjnlohapm)
3. **Klik:** Settings (tandwiel icoon linksonder)
4. **Klik:** API (in het linker menu)

### Stap 2: Voeg CORS Origins Toe

1. **Scroll naar:** "CORS" sectie
2. **In het veld "Allowed CORS origins":**
   - Voeg toe: `https://pakketadvies.nl`
   - Voeg toe: `https://www.pakketadvies.nl`
   - Voeg toe: `https://pakketadvies-website-*.vercel.app` (voor preview deployments)
3. **Klik:** "Save" of "Update"

### Stap 3: Verificatie

Na het opslaan:
- ✅ CORS origins zijn toegevoegd
- ✅ Supabase accepteert nu requests van pakketadvies.nl
- ✅ Data zou nu moeten werken

## 🔧 Als Het Nog Steeds Niet Werkt

Check ook:
1. **Vercel Environment Variables** - Zijn Supabase credentials correct?
2. **Redeploy** - Na CORS aanpassen, redeploy in Vercel
3. **Browser Console** - Check voor CORS errors

## 📞 Alternatief: Via SQL (Als Dashboard Niet Werkt)

Als de Dashboard niet werkt, kan je proberen via SQL:

```sql
-- Check huidige CORS settings
SELECT * FROM pg_settings WHERE name LIKE '%cors%';

-- CORS wordt meestal via project settings beheerd, niet via SQL
-- Maar je kunt proberen:
ALTER SYSTEM SET cors_allowed_origins = 'https://pakketadvies.nl,https://www.pakketadvies.nl';
```

**LET OP:** Dit werkt meestal niet omdat CORS via Supabase project settings wordt beheerd, niet via database settings.

