# 📦 Instructies: Documents Bucket Aanmaken

## Probleem
De `documents` bucket bestaat niet in Supabase, waardoor PDF/DOC uploads falen.

## Oplossing

### Stap 1: Maak de `documents` bucket aan in Supabase Dashboard

1. **Ga naar Supabase Dashboard**
   - Open je project: https://supabase.com/dashboard/project/dxztyhwiwgrxjnlohapm

2. **Navigeer naar Storage**
   - Klik op **"Storage"** in het linkermenu

3. **Maak nieuwe bucket**
   - Klik op **"Create a new bucket"** button (of "+ New bucket")

4. **Configureer de bucket:**
   - **Name**: `documents`
   - **Public bucket**: ✅ **AAN** (belangrijk voor public access)
   - **File size limit**: Leeg laten (of max 10MB: `10485760`)
   - **Allowed MIME types**: **LEEG LATEN** (dit staat alle bestandstypen toe, inclusief PDF en DOC)
   - **Encryption**: Laat standaard staan

5. **Klik op "Create bucket"**

### Stap 2: Controleer `logos` bucket MIME type restricties

De `logos` bucket heeft waarschijnlijk MIME type restricties die PDF's blokkeren. 

1. **Ga naar Storage → Buckets**
2. **Klik op de `logos` bucket**
3. **Check de "Allowed MIME types" instelling:**
   - Als hier iets staat, voeg dan toe: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - OF: Laat het leeg om alle types toe te staan
4. **Klik op "Update bucket"**

### Stap 3: Test de upload

Na het aanmaken van de bucket, probeer opnieuw een PDF/DOC te uploaden via de admin panel.

## Alternative: Maak bucket via SQL (indien mogelijk)

Als je de bucket via SQL wilt aanmaken, probeer dit script (werkt mogelijk niet, bucket creation is meestal alleen via dashboard mogelijk):

```sql
-- Probeer bucket aan te maken (dit werkt mogelijk niet via SQL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10MB
  NULL -- NULL = alle MIME types toegestaan
)
ON CONFLICT (id) DO NOTHING;
```

**LET OP**: Bucket creation via SQL werkt vaak niet. Gebruik liever het Supabase Dashboard zoals hierboven beschreven.

