# 🧪 Email Testen - Instructies

## Optie 1: Via Test Endpoint (Aanbevolen)

### Stap 1: Haal laatste aanvraag ID op
Run deze query in Supabase SQL Editor:
```sql
SELECT id, aanvraagnummer 
FROM contractaanvragen 
ORDER BY created_at DESC 
LIMIT 1;
```

### Stap 2: Test email via API
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "aanvraagId": "PASTE_ID_HIER",
    "aanvraagnummer": "PASTE_NUMMER_HIER"
  }'
```

### Stap 3: Check terminal logs
Je zou moeten zien:
- `📧 [sendBevestigingEmail] Starting email send for:`
- `✅ [sendBevestigingEmail] Email address found:`
- `📧 [sendBevestigingEmail] Sending email via Resend to:`
- `✅ [sendBevestigingEmail] Email sent successfully`

## Optie 2: Via Browser Console

Open browser console en run:
```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    aanvraagId: 'PASTE_ID_HIER',
    aanvraagnummer: 'PASTE_NUMMER_HIER'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## Optie 3: Maak nieuwe test aanvraag

1. Ga naar `/calculator`
2. Vul formulier in
3. Submit aanvraag
4. Check terminal logs voor email logs
5. Check of email is verzonden

## Troubleshooting

### Geen logs zichtbaar?
- Check terminal waar `npm run dev` draait
- Logs zijn server-side, niet in browser console

### Email wordt niet verzonden?
- Check of `RESEND_API_KEY` is gezet in `.env.local`
- Check Vercel environment variables
- Check Resend dashboard voor errors

### "RESEND_API_KEY is not set"?
- Voeg toe aan `.env.local`:
  ```
  RESEND_API_KEY=re_...
  ```
- Herstart dev server

