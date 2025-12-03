# GitHub Actions - Finale Stap

## ✅ Wat Al Gedaan Is

- ✅ VERCEL_TOKEN secret toegevoegd
- ✅ GitHub Actions workflow aangemaakt (`.github/workflows/deploy.yml`)
- ✅ Workflow is gecommit (lokaal)

## 🔧 Wat Nog Moet

### Stap 1: Voeg VERCEL_ORG_ID Secret Toe

1. **Ga naar:** https://github.com/pakketadvies/pakketadvies-website/settings/secrets/actions
2. **Klik:** "New repository secret"
3. **Vul in:**
   - **Name:** `VERCEL_ORG_ID`
   - **Value:** `team_ngxvcy0uY4agKh6L1RsH5SrJ`
4. **Klik:** "Add secret"

### Stap 2: Push Workflow naar GitHub

De workflow is lokaal gecommit maar kan niet automatisch gepusht worden. Push handmatig:

```bash
git push origin main
```

**OF** als dat niet werkt, voeg de workflow handmatig toe via GitHub:
1. Ga naar: https://github.com/pakketadvies/pakketadvies-website
2. Klik "Add file" → "Create new file"
3. Pad: `.github/workflows/deploy.yml`
4. Plak de inhoud van `.github/workflows/deploy.yml`
5. Commit

## ✅ Test

Na het toevoegen van de secret en pushen van de workflow:

1. **Check GitHub Actions:**
   - Ga naar: https://github.com/pakketadvies/pakketadvies-website/actions
   - Je zou een workflow run moeten zien

2. **Check Vercel:**
   - Binnen 1-2 minuten zou er een nieuwe deployment moeten zijn

## 🎉 Dit Werkt Altijd!

GitHub Actions is veel betrouwbaarder dan webhooks en werkt altijd!

