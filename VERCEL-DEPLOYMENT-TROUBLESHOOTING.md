# Vercel Deployment Troubleshooting

## 🔍 Probleem: Geen deployment verschijnt op Vercel na GitHub push

### Stap 1: Check GitHub-Vercel koppeling

1. **Ga naar Vercel Dashboard**
   - https://vercel.com/dashboard
   - Selecteer je project "pakketadvies-website"

2. **Check Git Integration**
   - Ga naar **Settings → Git**
   - Check of GitHub repository is gekoppeld
   - Check of de juiste branch is ingesteld (meestal `main`)

3. **Check Webhook**
   - Ga naar **Settings → Git → Connected Git Repository**
   - Check of de webhook actief is
   - Als er geen webhook is, klik op "Connect Git Repository" en koppel opnieuw

### Stap 2: Manual Deployment triggeren

**Optie A: Via Vercel Dashboard**
1. Ga naar **Deployments** tab
2. Klik op "..." (drie puntjes) naast de laatste deployment
3. Klik op **"Redeploy"**
4. Selecteer de laatste commit (of laat het op "Use existing Build Cache" staan)
5. Klik op **"Redeploy"**

**Optie B: Via Vercel CLI**
```bash
# Als je Vercel CLI hebt geïnstalleerd:
vercel --prod

# Of:
npx vercel --prod
```

**Optie C: Via GitHub (trigger webhook)**
1. Ga naar je GitHub repository
2. Maak een kleine wijziging (bijv. een lege commit of een comment in een bestand)
3. Commit en push
4. Dit zou de webhook moeten triggeren

### Stap 3: Check Deployment Logs

1. Ga naar **Vercel Dashboard → Deployments**
2. Check of er failed deployments zijn
3. Klik op een deployment om logs te zien
4. Check voor errors in de build logs

### Stap 4: Reconnect Git Repository (als laatste redmiddel)

1. Ga naar **Settings → Git**
2. Klik op **"Disconnect"** (als er al een koppeling is)
3. Klik op **"Connect Git Repository"**
4. Selecteer je GitHub repository
5. Selecteer de branch (`main`)
6. Klik op **"Connect"**

Dit zou automatisch een nieuwe deployment moeten triggeren.

### Stap 5: Check GitHub Repository Settings

1. Ga naar je GitHub repository
2. Ga naar **Settings → Webhooks**
3. Check of er een webhook is voor Vercel
4. Check of de webhook actief is (groen vinkje)
5. Check recent deliveries voor errors

## 🚨 Veelvoorkomende problemen:

### "No deployments found"
- Check of je in het juiste Vercel project bent
- Check of de GitHub repository correct is gekoppeld

### "Webhook failed"
- Check GitHub repository settings → Webhooks
- Check of de webhook URL correct is
- Probeer webhook opnieuw te configureren

### "Build failed"
- Check deployment logs voor specifieke errors
- Check of alle environment variables zijn ingesteld
- Check of er syntax errors zijn in de code

## ✅ Quick Fix: Manual Redeploy

De snelste manier om een deployment te triggeren:

1. **Via Vercel Dashboard:**
   - Ga naar Deployments
   - Klik op "..." → "Redeploy"
   - Selecteer de laatste commit
   - Klik "Redeploy"

2. **Of maak een lege commit:**
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push origin main
   ```

## 📞 Support

Als niets werkt:
- Vercel Support: https://vercel.com/support
- Check Vercel Status: https://www.vercel-status.com/
- GitHub Issues: Check of er bekende problemen zijn

