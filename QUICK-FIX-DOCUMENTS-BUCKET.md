# 🚨 QUICK FIX: Documents Bucket Aanmaken

## Probleem
- ❌ `documents` bucket bestaat niet → "Bucket not found"
- ❌ `logos` bucket blokkeert PDF's → "mime type application/pdf is not supported"

## Oplossing (5 minuten)

### Stap 1: Policies fixen (als nog niet gedaan)
Run dit script in Supabase SQL Editor:
- `fix-storage-policies-complete.sql`

### Stap 2: Documents bucket aanmaken

1. **Ga naar Supabase Dashboard:**
   - https://supabase.com/dashboard/project/dxztyhwiwgrxjnlohapm

2. **Ga naar Storage:**
   - Klik op **"Storage"** in het linkermenu

3. **Klik op "Create a new bucket"** (of "+ New bucket")

4. **Vul in:**
   - **Name**: `documents` (precies zo, zonder quotes)
   - **Public bucket**: ✅ **AAN** (dit is belangrijk!)
   - **File size limit**: Laat leeg of zet op `10485760` (10MB)
   - **Allowed MIME types**: **LEEG LATEN** (dit staat alle types toe: PDF, DOC, DOCX)
   - **Encryption**: Laat standaard staan

5. **Klik op "Create bucket"**

### Stap 3: Logos bucket MIME types fixen (optioneel, voor fallback)

Als je ook PDF's naar de `logos` bucket wilt kunnen uploaden (fallback):

1. **Klik op de `logos` bucket in Storage**
2. **Klik op "Edit bucket"** of het potlood icoon
3. **Check "Allowed MIME types":**
   - Als hier iets staat (bijv. `image/*`), verwijder het of voeg toe:
     - `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - OF: Laat het veld **compleet leeg** (dan zijn alle types toegestaan)
4. **Klik op "Update bucket"**

### Stap 4: Test!

Probeer nu opnieuw een PDF/DOC te uploaden via de admin panel. Het zou nu moeten werken! 🎉

