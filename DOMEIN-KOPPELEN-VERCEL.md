# Domein koppelen aan Vercel - pakketadvies.nl

Deze handleiding legt stap voor stap uit hoe je pakketadvies.nl en www.pakketadvies.nl koppelt aan je Vercel deployment.

## 📋 Vereisten

- Je hebt toegang tot je Vercel account
- Je hebt toegang tot je domeinregistrar (waar je pakketadvies.nl hebt geregistreerd)
- Je domein is actief en niet gelocked

## 🚀 Stap 1: Domein toevoegen in Vercel Dashboard

1. **Ga naar Vercel Dashboard**
   - Open https://vercel.com/dashboard
   - Log in met je account

2. **Selecteer je project**
   - Klik op het project "pakketadvies-website" (of hoe je project ook heet)

3. **Ga naar Settings → Domains**
   - In het menu links, klik op "Settings"
   - Klik op "Domains" in het submenu

4. **Voeg domeinen toe**
   - Klik op "Add" of "Add Domain"
   - Voer in: `pakketadvies.nl`
   - Klik op "Add"
   - Voeg ook toe: `www.pakketadvies.nl`
   - Klik op "Add"

## 🔧 Stap 2: DNS Records configureren

Vercel geeft je nu DNS records die je moet toevoegen bij je domeinregistrar. Er zijn twee opties:

### Optie A: Apex Domain (pakketadvies.nl) - Aanbevolen

Vercel gebruikt **ALIAS** of **ANAME** records voor apex domains. Dit is afhankelijk van je DNS provider:

**Voor providers die ALIAS/ANAME ondersteunen (zoals Cloudflare, DNSimple):**
```
Type: ALIAS (of ANAME)
Name: @ (of pakketadvies.nl)
Value: cname.vercel-dns.com
TTL: Auto (of 3600)
```

**Voor providers die GEEN ALIAS/ANAME ondersteunen (zoals veel standaard registrars):**
Vercel geeft je **A records** met IP adressen. Gebruik deze:
```
Type: A
Name: @ (of pakketadvies.nl)
Value: [IP adres van Vercel - wordt getoond in dashboard]
TTL: Auto (of 3600)
```

**Voor www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto (of 3600)
```

### Optie B: Alleen CNAME (als je provider het ondersteunt)

Sommige providers (zoals Cloudflare) ondersteunen CNAME flattening voor apex domains:
```
Type: CNAME
Name: @ (of pakketadvies.nl)
Value: cname.vercel-dns.com
TTL: Auto
```

## 📝 Stap 3: DNS Records toevoegen bij je Registrar

**Voorbeelden per provider:**

### TransIP
1. Log in op TransIP Control Panel
2. Ga naar "Domeinnamen" → "pakketadvies.nl"
3. Klik op "DNS"
4. Voeg records toe zoals hierboven beschreven

### Hostnet
1. Log in op Hostnet Control Panel
2. Ga naar "Domeinnamen" → "pakketadvies.nl"
3. Klik op "DNS beheer"
4. Voeg records toe

### Cloudflare (aanbevolen - gratis)
1. Log in op Cloudflare Dashboard
2. Selecteer je domein "pakketadvies.nl"
3. Ga naar "DNS" → "Records"
4. Voeg records toe:
   - Type: CNAME, Name: @, Target: cname.vercel-dns.com, Proxy: Off (grijs wolkje)
   - Type: CNAME, Name: www, Target: cname.vercel-dns.com, Proxy: Off

### Andere providers
- Zoek in je control panel naar "DNS Management", "DNS Records", of "DNS Settings"
- Voeg de records toe zoals Vercel aangeeft

## ⏱️ Stap 4: Wachten op DNS Propagatie

- DNS wijzigingen kunnen 5 minuten tot 48 uur duren (meestal 1-2 uur)
- Je kunt de status checken in Vercel Dashboard → Settings → Domains
- Vercel toont of het domein correct is gekoppeld

**Check DNS propagatie:**
```bash
# Check of DNS records correct zijn
dig pakketadvies.nl
dig www.pakketadvies.nl

# Of gebruik online tools:
# - https://dnschecker.org
# - https://www.whatsmydns.net
```

## ✅ Stap 5: SSL Certificaat (Automatisch)

- Vercel regelt automatisch SSL certificaten via Let's Encrypt
- Zodra DNS correct is, wordt het certificaat automatisch uitgegeven
- Dit kan 5-10 minuten duren
- Je ziet de status in Vercel Dashboard

## 🔄 Stap 6: Redirects configureren (Optioneel)

Je kunt kiezen om:
- **www → non-www**: Alle www.pakketadvies.nl bezoekers naar pakketadvies.nl sturen
- **non-www → www**: Alle pakketadvies.nl bezoekers naar www.pakketadvies.nl sturen

**Aanbevolen: www → non-www** (pakketadvies.nl als primair domein)

Dit kan in Vercel Dashboard → Settings → Domains:
- Klik op het www domein
- Stel in: "Redirect to pakketadvies.nl"

Of via `vercel.json` (zie hieronder).

## 📄 Stap 7: vercel.json updaten

Update `vercel.json` om de nieuwe domeinen toe te voegen:

```json
{
  "alias": ["pakketadvies.nl", "www.pakketadvies.nl"],
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "crons": [
    {
      "path": "/api/cron/update-dynamic-prices",
      "schedule": "0 14 * * *"
    }
  ],
  "redirects": [
    {
      "source": "https://www.pakketadvies.nl/:path*",
      "destination": "https://pakketadvies.nl/:path*",
      "permanent": true
    }
  ]
}
```

## 🔐 Stap 8: Environment Variables updaten

Update in Vercel Dashboard → Settings → Environment Variables:

1. **NEXT_PUBLIC_BASE_URL**
   - Verander van: `https://pakketadvies.vercel.app`
   - Naar: `https://pakketadvies.nl`

2. **Herdeploy**
   - Na het updaten van environment variables, trigger een nieuwe deployment
   - Ga naar Deployments → Klik op "..." → "Redeploy"

## ✅ Stap 9: Verificatie

Test of alles werkt:

1. **Check domeinen:**
   - https://pakketadvies.nl
   - https://www.pakketadvies.nl (moet redirecten naar pakketadvies.nl als je redirect hebt ingesteld)

2. **Check SSL:**
   - Beide domeinen moeten HTTPS gebruiken (groen slotje)

3. **Check functionaliteit:**
   - Test of alle pagina's werken
   - Test of formulieren werken
   - Test of emails correct worden verzonden (met nieuwe base URL)

## 🐛 Troubleshooting

### Domein wordt niet gekoppeld
- Check of DNS records correct zijn toegevoegd
- Wacht langer (tot 48 uur)
- Check of je domein niet gelocked is bij je registrar
- Verwijder oude DNS records die conflicteren

### SSL certificaat wordt niet uitgegeven
- Wacht 10-15 minuten na DNS propagatie
- Check of DNS records correct zijn
- Vercel support kan helpen als het langer duurt

### Redirect werkt niet
- Check vercel.json configuratie
- Zorg dat redirects correct zijn geconfigureerd
- Herdeploy na wijzigingen

### Emails gebruiken nog oude URL
- Update `NEXT_PUBLIC_BASE_URL` environment variable
- Herdeploy de applicatie
- Check of emails nu de nieuwe URL gebruiken

## 📞 Support

Als je problemen hebt:
- Vercel Support: https://vercel.com/support
- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- Check Vercel Dashboard voor specifieke error messages

## 🎉 Klaar!

Zodra alles werkt:
- ✅ pakketadvies.nl is live
- ✅ www.pakketadvies.nl redirect naar pakketadvies.nl
- ✅ SSL certificaten zijn actief
- ✅ Alle functionaliteit werkt met het nieuwe domein

