# Vercel Redirect Fix - Omkeren van Redirect

## 🚨 Het Probleem

In Vercel Dashboard staat nu:
- ❌ `pakketadvies.nl` → redirect naar `www.pakketadvies.nl`

Maar we willen:
- ✅ `www.pakketadvies.nl` → redirect naar `pakketadvies.nl`

Dit veroorzaakt een redirect loop en CORS errors!

## ✅ Oplossing: Redirect Omkeren

### Stap 1: Verwijder redirect van pakketadvies.nl

1. Ga naar Vercel Dashboard → Settings → Domains
2. Klik op `pakketadvies.nl`
3. Klik op "Edit"
4. Selecteer "Serve this domain" (in plaats van "Redirect to Another Domain")
5. Klik "Save"

### Stap 2: Stel redirect in voor www.pakketadvies.nl

1. Klik op `www.pakketadvies.nl`
2. Klik op "Edit"
3. Selecteer "Redirect to Another Domain"
4. Kies "307 Temporary Redirect" (of "308 Permanent Redirect" voor SEO)
5. Voer in: `pakketadvies.nl`
6. Klik "Save"

## ✅ Resultaat

Na deze wijzigingen:
- ✅ `pakketadvies.nl` = primair domein (serveert de website)
- ✅ `www.pakketadvies.nl` = redirect naar `pakketadvies.nl`

Dit lost de redirect loop en CORS errors op!

