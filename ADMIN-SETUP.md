# 🚀 PakketAdvies Admin Setup Guide

## Stap 1: Supabase Project Setup

### 1.1 Project aanmaken (als je dit nog niet hebt gedaan)
1. Ga naar [supabase.com](https://supabase.com)
2. Log in of maak een account aan
3. Klik op "New Project"
4. Vul in:
   - **Name**: `pakketadvies`
   - **Database Password**: (bewaar dit goed!)
   - **Region**: `West EU (Ireland)` (dichtsbij NL)
5. Klik op "Create new project"
6. ⏳ Wacht 1-2 minuten tot het project klaar is

### 1.2 Database Migration uitvoeren
1. In je Supabase dashboard, ga naar **SQL Editor** (linkermenu)
2. Klik op "New Query"
3. Open het bestand `supabase/migrations/001_admin_schema.sql` in je code editor
4. Kopieer de HELE inhoud
5. Plak het in de SQL editor in Supabase
6. Klik op **"Run"** (of druk Cmd/Ctrl + Enter)
7. ✅ Check dat je groene success messages ziet

### 1.3 Storage Bucket aanmaken (voor logo's)
1. Ga naar **Storage** in het linkermenu
2. Klik op "Create a new bucket"
3. Vul in:
   - **Name**: `logos`
   - **Public bucket**: ✅ **AAN** (belangrijk!)
4. Klik op "Create bucket"

---

## Stap 2: Environment Variables

### 2.1 Credentials ophalen
1. Ga naar **Settings** → **API** in het linkermenu
2. Kopieer de volgende waardes:
   - **Project URL** (bijvoorbeeld: `https://abcxyz.supabase.co`)
   - **anon public** key (lange string die begint met `eyJ...`)
   - **service_role** key (geheim! begint ook met `eyJ...`)

### 2.2 .env.local bestand maken
1. Maak een bestand `.env.local` in de project root (als die er nog niet is)
2. Plak deze inhoud erin (vervang de placeholders met je echte waardes):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jouwproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...

# Postcode API (als je die hebt)
POSTCODE_API_KEY=your-postcode-tech-api-key
```

3. Sla het bestand op
4. **BELANGRIJK**: `.env.local` staat al in `.gitignore`, dus wordt niet gecommit

---

## Stap 3: Admin User Aanmaken

### 3.1 User aanmaken via Supabase Dashboard
1. Ga naar **Authentication** → **Users** in Supabase
2. Klik op "Add User" (groene knop rechtsboven)
3. Vul in:
   - **Email**: `info@pakketadvies.nl`
   - **Password**: `Ab49n805!`
   - **Auto Confirm User**: ✅ **AANVINKEN** (belangrijk!)
4. Klik op "Create user"
5. ✅ Je zou nu een user moeten zien in de lijst

### 3.2 Role naar Admin wijzigen
**Optie A - Via Table Editor (visueel):**
1. Ga naar **Table Editor** → selecteer tabel **user_profiles**
2. Je zou een rij moeten zien met `info@pakketadvies.nl`
3. Klik op de rij
4. Verander de `role` kolom van `user` naar `admin`
5. Klik op "Save"

**Optie B - Via SQL Editor (copy-paste):**
1. Ga naar **SQL Editor**
2. Klik op "New Query"
3. Plak deze query:
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'info@pakketadvies.nl';
```
4. Klik op "Run"

### 3.3 Verificatie
Run deze query in SQL Editor:
```sql
SELECT id, email, role, created_at 
FROM user_profiles 
WHERE email = 'info@pakketadvies.nl';
```

Je zou moeten zien:
- **email**: `info@pakketadvies.nl`
- **role**: `admin` ✅

---

## Stap 4: Development Server Starten

1. Open je terminal in de project root
2. Herstart de dev server (zodat .env.local wordt geladen):
```bash
npm run dev
```

---

## Stap 5: Inloggen! 🎉

1. Open je browser en ga naar: `http://localhost:3000/admin/login`
2. Vul in:
   - **E-mailadres**: `info@pakketadvies.nl`
   - **Wachtwoord**: `Ab49n805!`
3. Klik op "Inloggen"
4. ✅ Je wordt doorgestuurd naar het admin dashboard!

---

## 🎯 Wat kun je nu doen?

### Leveranciers toevoegen
1. Ga naar "Leveranciers" in de sidebar
2. Klik op "Nieuwe leverancier"
3. Vul naam, website, upload een logo
4. Klik op "Leverancier toevoegen"

### Contracten toevoegen
1. Ga naar "Contracten" in de sidebar
2. Klik op "Nieuw contract"
3. Kies type: **Vast**, **Dynamisch** of **Maatwerk**
4. Vul alle velden in
5. Klik op "Contract toevoegen"

### Testen op de website
1. Ga naar `http://localhost:3000`
2. Vul de calculator in (Quick Calculator of normale flow)
3. Bekijk de resultaten → **je ziet nu de echte contracten uit de database!** 🚀

---

## ⚠️ Troubleshooting

### "Invalid login credentials"
- Check of je de juiste email en password gebruikt
- Zorg dat "Auto Confirm User" was aangevinkt bij het aanmaken
- Check of de role daadwerkelijk op 'admin' staat in user_profiles

### "Je hebt geen toegang tot het admin panel"
- Check in user_profiles of role = 'admin' (niet 'user')
- Refresh de pagina en probeer opnieuw in te loggen

### "Failed to fetch contracts"
- Check of .env.local correct is ingevuld
- Herstart de dev server (npm run dev)
- Check of de migration succesvol was uitgevoerd

### "Cannot find module '@supabase/ssr'"
- Run: `npm install`
- Herstart de dev server

---

## 📝 Extra Info

### Meer admin users toevoegen
1. Herhaal Stap 3 met een ander e-mailadres
2. Of: nodig mensen uit via Authentication → "Invite User"

### Storage Policies (voor logo uploads)
Als je problemen hebt met logo uploads, voer deze SQL query uit:

```sql
-- Allow public uploads to logos bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Allow public reads
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');
```

---

## ✅ Checklist

- [ ] Supabase project aangemaakt
- [ ] Database migration uitgevoerd (001_admin_schema.sql)
- [ ] Storage bucket 'logos' aangemaakt (public)
- [ ] .env.local bestand aangemaakt met credentials
- [ ] Admin user aangemaakt (info@pakketadvies.nl)
- [ ] Role naar 'admin' gewijzigd
- [ ] Dev server gestart (npm run dev)
- [ ] Ingelogd op /admin/login
- [ ] Eerste leverancier toegevoegd
- [ ] Eerste contract toegevoegd
- [ ] Getest op resultaten pagina

---

**Succes! 🚀** Bij vragen, laat het me weten!

