# 🚀 FINALE SETUP: Alles fixen in 1 keer

## Probleem
- ❌ `documents` bucket bestaat niet
- ❌ `logos` bucket blokkeert PDF's via MIME type restricties
- ❌ Storage policies moeten gefixt worden

## Oplossing: 1 SQL Script

Ik heb een script gemaakt dat **alles in één keer oplost**. Volg deze stappen:

### Stap 1: Run het setup script

1. **Ga naar Supabase SQL Editor:**
   - https://supabase.com/dashboard/project/dxztyhwiwgrxjnlohapm/sql/new

2. **Open het bestand `setup-all-sql.sql`** in je code editor

3. **Kopieer de HELE inhoud** van `setup-all-sql.sql`

4. **Plak het in de SQL Editor** in Supabase

5. **Klik op "Run"** (of druk Cmd/Ctrl + Enter)

6. **Check de output:**
   - Je zou moeten zien: "✅✅✅ SETUP COMPLETE! ✅✅✅"
   - Check of de buckets zijn aangemaakt
   - Check of de policies zijn aangemaakt

### Stap 2: Verifieer dat alles werkt

1. **Ga naar Storage in Supabase Dashboard:**
   - https://supabase.com/dashboard/project/dxztyhwiwgrxjnlohapm/storage/buckets

2. **Check of de `documents` bucket bestaat:**
   - ✅ Naam: `documents`
   - ✅ Public: AAN
   - ✅ MIME types: Leeg (alle types toegestaan)

3. **Check de `logos` bucket:**
   - ✅ MIME types: Leeg (geen restricties meer)

### Stap 3: Test de upload

1. **Ga naar je admin panel:**
   - http://localhost:3000/admin/contracten (lokaal)
   - Of: https://pakketadvies.vercel.app/admin/contracten (production)

2. **Bewerk een contract** of maak een nieuw contract aan

3. **Probeer een PDF of DOC bestand te uploaden**

4. **Het zou nu moeten werken!** 🎉

## Wat het script doet:

1. ✅ Maakt de `documents` bucket aan (als die nog niet bestaat)
2. ✅ Verwijdert MIME type restricties van de `logos` bucket
3. ✅ Verwijdert alle oude storage policies
4. ✅ Maakt nieuwe storage policies aan voor beide buckets
5. ✅ Toont een verificatie overzicht aan het einde

## Troubleshooting

Als er nog steeds een error is:
- Check de browser console (F12) voor specifieke error messages
- Check of je ingelogd bent in het admin panel
- Refresh de pagina na het runnen van het SQL script

