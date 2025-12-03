# Deploy Hook Troubleshooting

## 🚨 Probleem: Webhook werkt maar deployment verschijnt niet

De webhook geeft status 201 (OK), maar er verschijnt geen nieuwe deployment in Vercel.

## 🔍 Mogelijke Oorzaken

### 1. Deploy Hook URL is niet correct
De Deploy Hook URL moet exact zijn zoals Vercel die heeft gegeven. Check:
- Is de URL volledig gekopieerd?
- Zijn er geen extra spaties of tekens?

### 2. Deploy Hook is gedeactiveerd
Check in Vercel Dashboard:
- Settings → Git → Deploy Hooks
- Is de hook nog actief?

### 3. Branch mismatch
Check of:
- Deploy Hook is voor branch `main`
- Je pusht naar branch `main`

### 4. Vercel heeft de deployment niet getriggerd
Soms duurt het even, of er is een probleem met de Deploy Hook configuratie.

## ✅ Oplossingen

### Oplossing 1: Test Deploy Hook Direct

1. **Kopieer de Deploy Hook URL** uit Vercel Dashboard
2. **Open de URL in je browser** (of gebruik curl):
   ```bash
   curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_6Az3CNttFoykSbJO283LukPcOSOF/Pwq0AbeAEg"
   ```
3. **Check Vercel Dashboard** - zou direct een deployment moeten triggeren

### Oplossing 2: Check Deploy Hook Status

1. **Vercel Dashboard → Settings → Git → Deploy Hooks**
2. **Check of de hook actief is**
3. **Check de branch** (moet `main` zijn)
4. **Verwijder en maak opnieuw aan** als nodig

### Oplossing 3: Reconnect Repository (Alternatief)

Als Deploy Hook niet werkt, reconnect de repository:
1. **Vercel Dashboard → Settings → Git**
2. **Disconnect** → **Connect Git Repository**
3. **Selecteer:** `pakketadvies/pakketadvies-website`
4. **Branch:** `main`
5. **Connect**

Dit maakt automatisch een webhook aan (geen Deploy Hook nodig).

### Oplossing 4: Handmatig Redeploy

Voor nu, handmatig redeployen:
1. **Vercel Dashboard → Deployments**
2. **... → Redeploy**
3. **Selecteer:** "Use latest commit"
4. **Redeploy**

## 🧪 Test Opnieuw

Na het fixen, test opnieuw:

```bash
git commit --allow-empty -m "Test webhook opnieuw"
git push origin main
```

Check Vercel Dashboard binnen 30 seconden.

