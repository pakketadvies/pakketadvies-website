# Finale Webhook Oplossing

## 🎯 Het Probleem

Ik heb geprobeerd een webhook aan te maken met de project ID (`prj_6Az3CNttFoykSbJO283LukPcOSOF`), maar Vercel gebruikt een **integration ID** voor webhooks, niet een project ID. Daarom geeft de webhook een 404 error.

## ✅ DE OPLOSSING

**Reconnect de repository in Vercel Dashboard** - dit is de ENIGE manier om de juiste webhook URL te krijgen:

### Stap voor Stap:

1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer project:** "pakketadvies-website"
3. **Ga naar:** Settings → Git
4. **Klik op:** "Disconnect" (als er al een koppeling is)
5. **Wacht:** 5 seconden
6. **Klik op:** "Connect Git Repository"
7. **Selecteer:** `pakketadvies/pakketadvies-website`
8. **Selecteer branch:** `main`
9. **Klik:** "Connect"

**Vercel maakt nu automatisch de JUISTE webhook aan met de correcte integration ID!**

## 🧪 Test Na Reconnect

Na reconnect, test in terminal:

```bash
export PATH="$HOME/.local/bin:$PATH"
gh api repos/pakketadvies/pakketadvies-website/hooks
```

Je zou nu een webhook moeten zien met een URL zoals:
- `https://api.vercel.com/v1/integrations/deploy/{integration-id}` (niet project-id!)

## 🚀 Direct Deployment (Zonder Webhook)

Als je NU een deployment wilt zonder te wachten op de webhook:

1. **Vercel Dashboard → Deployments**
2. **Klik:** "..." naast laatste deployment
3. **Klik:** "Redeploy"
4. **Selecteer:** "Use latest commit"
5. **Klik:** "Redeploy"

**Dit werkt altijd en triggert direct een deployment!**

## 📊 Status

- ✅ Project ID bekend: `prj_6Az3CNttFoykSbJO283LukPcOSOF`
- ❌ Project ID werkt niet voor webhook URL (Vercel gebruikt integration ID)
- ✅ Verkeerde webhook verwijderd
- ⏳ Wacht op reconnect in Vercel Dashboard voor juiste webhook

## 💡 Waarom Reconnect?

Wanneer je reconnect, maakt Vercel automatisch:
1. Een nieuwe integration tussen Vercel en GitHub
2. Een webhook in GitHub met de JUISTE integration ID
3. Automatische deployments bij elke push

Dit is de officiële en betrouwbare manier!

