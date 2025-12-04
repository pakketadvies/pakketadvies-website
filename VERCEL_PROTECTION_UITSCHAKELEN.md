# 🛡️ Vercel Browser Verification Uitschakelen

## 🔍 Het Probleem

Je ziet een "We're verifying browser" melding van Vercel. Dit is Vercel's DDoS Protection/Bot Protection die automatisch is ingeschakeld.

## ✅ OPLOSSING: Uitschakelen via Vercel Dashboard

### Stap-voor-stap:

1. **Ga naar Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Log in met je account

2. **Selecteer je project**:
   - Klik op "pakketadvies-website"

3. **Ga naar Settings**:
   - Klik op "Settings" tab (bovenaan)

4. **Security Settings**:
   - Scroll naar beneden naar "Security"
   - Of zoek naar "DDoS Protection" / "Bot Protection"

5. **Uitschakelen**:
   - Zoek de optie "Browser Verification" of "DDoS Protection"
   - Zet deze UIT (disabled)
   - Klik "Save"

6. **Of via Project Settings**:
   - Settings → Security
   - Disable "Browser Verification"
   - Disable "DDoS Protection" (als je dat wilt)

## 🎯 Alternatief: Via Vercel CLI

Als je via CLI wilt controleren:

```bash
vercel project ls
vercel project inspect pakketadvies-website
```

Maar uitschakelen kan alleen via het dashboard.

## ✅ Na het uitschakelen

- De verificatie melding zou weg moeten zijn
- Je website laadt direct zonder vertraging
- Alle functionaliteit werkt normaal

**Let op:** Vercel Protection kan nuttig zijn tegen bots/DDoS. Overweeg het alleen uit te schakelen als het problemen veroorzaakt voor echte gebruikers.

