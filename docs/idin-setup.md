# iDIN / “Verbruik ophalen bij netbeheerder” – Setup

Deze repo bevat een **placeholder flow** voor iDIN (knop + start/callback routes). De integratie werkt pas volledig zodra je:

- een **iDIN service provider** contracteert (bijv. Signicat of CM.com)
- de benodigde **credentials** toevoegt als environment variables

## Aanbevolen aanpak

- **Provider**: `signicat` (meest gangbaar voor OIDC/OAuth integraties in enterprise setups)
- **Flow**: OIDC/OAuth redirect met PKCE + state
- **Callback**: `/api/idin/callback`

## Environment variables

Kopieer `docs/env.example` naar je eigen `.env.local` en vul in:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_IDIN_ENABLED=true` *(pas zetten als server-config ook rond is)*
- `IDIN_ENABLED=true`
- `IDIN_PROVIDER=signicat`
- `IDIN_CLIENT_ID=...`
- `IDIN_CLIENT_SECRET=...`
- `IDIN_REDIRECT_URI=https://<jouw-domain>/api/idin/callback`

## Wat er al in code zit

- Start route: `src/app/api/idin/start/route.ts`
  - Als niet geconfigureerd: redirect terug naar de wizard met een nette melding.
- Callback route: `src/app/api/idin/callback/route.ts`
  - Placeholder: redirect terug met melding.
- UI: `src/components/particulier/ConsumerCompareWizard.tsx`
  - Toont optie “Verbruik ophalen bij netbeheerder (iDIN)” en toont foutmelding uit query params.

## Nog te implementeren (provider-specifiek)

- PKCE + state opslag (bijv. signed cookies)
- authorize redirect naar provider endpoint
- code exchange in callback
- ophalen van (toegestane) attributen + consumptiedata via de bijbehorende energiedata/consent dienst


