# www Redirect Oplossing - CORS Errors Fixen

## 🚨 Het Probleem

De middleware redirect veroorzaakt CORS errors omdat:
1. Pagina wordt geladen vanaf `www.pakketadvies.nl`
2. Next.js RSC doet fetch requests naar `www.pakketadvies.nl`
3. Middleware redirect deze requests naar `pakketadvies.nl`
4. Browser blokkeert cross-origin redirects tijdens preflight requests
5. Resultaat: CORS errors en mislukte resource loads

## ✅ Oplossing: Redirect op Infrastructure Niveau

De redirect moet gebeuren op **DNS/Infrastructure niveau** (Vercel Dashboard), niet in middleware. Dit voorkomt dat RSC requests worden doorgestuurd.

## 🔧 Stap 1: Redirect instellen in Vercel Dashboard

1. **Ga naar Vercel Dashboard**
   - Open https://vercel.com/dashboard
   - Log in met je account

2. **Selecteer je project**
   - Klik op "pakketadvies-website"

3. **Ga naar Settings → Domains**
   - In het menu links, klik op "Settings"
   - Klik op "Domains" in het submenu

4. **Configureer www redirect**
   - Zoek `www.pakketadvies.nl` in de lijst
   - Klik op de drie puntjes (...) naast het domein
   - Selecteer "Redirect to pakketadvies.nl"
   - Of klik op het domein en stel in: "Redirect to pakketadvies.nl"

5. **Save**

## 🔧 Stap 2: Middleware Redirect Verwijderen

Na het instellen van de redirect in Vercel Dashboard, kunnen we de middleware redirect verwijderen (optioneel, maar aanbevolen):

```typescript
// middleware.ts - Verwijder de www redirect check
export async function middleware(request: NextRequest) {
  // Verwijder deze check:
  // const hostname = request.headers.get('host') || ''
  // if (hostname === 'www.pakketadvies.nl' || hostname.startsWith('www.pakketadvies.nl')) {
  //   const url = request.nextUrl.clone()
  //   url.host = 'pakketadvies.nl'
  //   url.protocol = 'https:'
  //   return NextResponse.redirect(url, 308)
  // }

  return await updateSession(request)
}
```

## ✅ Waarom Dit Werkt

- **Vercel redirect** gebeurt op infrastructure niveau, VOORDAT de request Next.js bereikt
- RSC requests worden nooit gemaakt naar `www.pakketadvies.nl` omdat de redirect al is gebeurd
- Geen CORS errors meer omdat er geen cross-origin redirects zijn tijdens fetch requests
- Browser krijgt direct een 308 redirect response, en laadt dan de pagina vanaf `pakketadvies.nl`

## 🧪 Testen

Na het instellen:
1. Ga naar `https://www.pakketadvies.nl`
2. Check of je wordt doorgestuurd naar `https://pakketadvies.nl`
3. Check browser console - geen CORS errors meer
4. Test navigatie - alle links moeten werken
5. Test RSC requests - geen mislukte fetches meer

## 📝 Alternatief: Alleen Vercel Redirect (Aanbevolen)

Als je de redirect in Vercel Dashboard instelt, hoef je **geen middleware redirect** meer nodig. De Vercel redirect is sneller en voorkomt alle CORS issues.

## ⚠️ Belangrijk

- De redirect in Vercel Dashboard is **permanent** (308 redirect)
- Dit is beter voor SEO dan middleware redirects
- Geen code changes nodig na het instellen in Vercel Dashboard

