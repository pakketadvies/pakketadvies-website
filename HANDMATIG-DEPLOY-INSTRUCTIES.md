# Handmatig Deployen naar Vercel

## 🚀 Optie 1: Via Vercel Dashboard (AANBEVOLEN - 30 seconden)

1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer project:** "pakketadvies-website"
3. **Klik op:** "Deployments" tab
4. **Klik op:** "..." (drie puntjes) naast de laatste deployment
5. **Klik op:** "Redeploy"
6. **Selecteer:** "Use latest commit" (of "Use existing Build Cache")
7. **Klik op:** "Redeploy"

**KLAAR!** Dit triggert direct een nieuwe deployment.

## 🚀 Optie 2: Via Terminal Script (Met Vercel Token)

### Stap 1: Haal Vercel Token Op

1. **Ga naar:** https://vercel.com/account/tokens
2. **Klik op:** "Create Token"
3. **Geef naam:** "Deployment Script"
4. **Kopieer de token**

### Stap 2: Run Deployment Script

```bash
# Export de token
export VERCEL_TOKEN=je_token_hier

# Run het script
cd "/Users/irmastol/Desktop/PakketAdvies Website"
./deploy-vercel.sh
```

## 🚀 Optie 3: Via Vercel CLI (Als Geïnstalleerd)

```bash
cd "/Users/irmastol/Desktop/PakketAdvies Website"

# Laad Node.js via nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Deploy naar production
npx vercel --prod --yes
```

## 📊 Check Deployment Status

Na het triggeren:
- **Vercel Dashboard:** https://vercel.com/dashboard → Deployments
- **Binnen 1-2 minuten** zou de deployment klaar moeten zijn

## ⚠️ Belangrijk

**LET OP:** Als je nu redeployt, gebruikt Vercel alleen de commit die het ziet (`9ffd3ae`), niet de nieuwste commits op GitHub!

**Om alle nieuwe commits te deployen:**
1. **Reconnect repository** in Vercel (Settings → Git → Disconnect → Connect)
2. **Dan** redeploy - dan ziet Vercel alle 14 nieuwe commits!

