# 📧 Email Logs Controleren

## Waar zijn de logs?

**E-mail logs zijn server-side en verschijnen NIET in de browser console!**

Ze zijn alleen zichtbaar in:
1. **Vercel Deployment Logs** (aanbevolen voor productie)
2. **Local development server terminal** (als je lokaal test)

## Hoe Vercel logs bekijken:

### Optie 1: Via Vercel Dashboard
1. Ga naar [vercel.com](https://vercel.com)
2. Login en selecteer je project: **PakketAdvies**
3. Klik op **"Deployments"** in de sidebar
4. Klik op de nieuwste deployment
5. Klik op **"Functions"** tab
6. Klik op een functie (bijv. `/api/aanvragen/create`)
7. Scroll naar **"Logs"** sectie
8. Zoek naar logs met `📧` emoji of `sendBevestigingEmail`

### Optie 2: Via Vercel CLI
```bash
# Installeer Vercel CLI (als je dat nog niet hebt)
npm i -g vercel

# Login
vercel login

# Bekijk logs in real-time
vercel logs --follow

# Of filter op email logs
vercel logs --follow | grep "📧\|sendBevestigingEmail"
```

## Wat te zoeken in de logs:

### ✅ Succesvolle email:
```
📧 [create] Triggering email send for aanvraag: ...
📧 [sendBevestigingEmail] Starting email send for: ...
📧 [sendBevestigingEmail] Fetching aanvraag data...
✅ [sendBevestigingEmail] Email sent successfully, ID: ...
✅ [create] Email sent successfully for aanvraag: ...
```

### ❌ Foutmeldingen:
```
❌ [sendBevestigingEmail] RESEND_API_KEY is not set
❌ [sendBevestigingEmail] Error sending email via Resend: ...
❌ [create] Error sending confirmation email: ...
```

## Testen van email functionaliteit:

### 1. Maak een nieuwe aanvraag via de website
- Vul het formulier in en submit
- Check direct daarna de Vercel logs

### 2. Gebruik de test endpoint:
```bash
# Vervang REAL_ID en REAL_NUMBER met echte waarden
curl -X POST https://pakketadvies.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"aanvraagId":"REAL_ID","aanvraagnummer":"REAL_NUMBER"}'
```

### 3. Check de database:
```sql
-- Check of email_bevestiging_verzonden = true
SELECT 
  id,
  aanvraagnummer,
  email_bevestiging_verzonden,
  created_at
FROM contractaanvragen
ORDER BY created_at DESC
LIMIT 5;

-- Check email logs
SELECT 
  id,
  aanvraag_id,
  email_type,
  recipient_email,
  status,
  error_message,
  created_at
FROM email_logs
ORDER BY created_at DESC
LIMIT 10;
```

## Belangrijk:

- **Browser console logs** = Client-side (React component logs)
- **Vercel logs** = Server-side (API route logs, email logs)
- Email logs zijn **altijd server-side** omdat e-mails vanuit de server worden verstuurd

## Debugging tips:

1. **Check environment variables:**
   - `RESEND_API_KEY` moet zijn ingesteld in Vercel
   - `SUPABASE_SERVICE_ROLE_KEY` moet zijn ingesteld in Vercel

2. **Check Resend dashboard:**
   - Ga naar [resend.com](https://resend.com)
   - Login en check "Emails" sectie
   - Hier zie je alle verzonden e-mails en eventuele errors

3. **Check Supabase:**
   - Check `email_logs` tabel voor gedetailleerde logs
   - Check `contractaanvragen.email_bevestiging_verzonden` flag

