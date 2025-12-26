# Contract Viewer Token Probleem Analyse

## Probleem Beschrijving
Klanten kunnen het contract in de online viewer direct na ontvangst van de email openen, maar na een paar uur of een dag werkt de link niet meer ("verlopen").

## Grondige Analyse

### 1. Token Generatie (send-email-internal.ts)

**Locatie**: `src/lib/send-email-internal.ts` regel 332-346

```typescript
// Generate access token for contract viewer
const accessToken = crypto.randomUUID()

// Store access token in database (valid for 7 days)
const expiresAt = new Date()
expiresAt.setDate(expiresAt.getDate() + 7)

console.log('📧 [sendBevestigingEmail] Storing access token...')
await supabase
  .from('contract_viewer_access')
  .insert({
    aanvraag_id: aanvraagId,
    access_token: accessToken,
    expires_at: expiresAt.toISOString(),  // ⚠️ PROBLEEM: Kolom bestaat mogelijk niet!
  })
```

**Probleem**: Code probeert `expires_at` in te voegen, maar...

### 2. Database Schema (Migration 031)

**Locatie**: `supabase/migrations/031_add_email_logs.sql` regel 28-36

```sql
CREATE TABLE IF NOT EXISTS contract_viewer_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aanvraag_id UUID REFERENCES contractaanvragen(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE,
  accessed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- ⚠️ GEEN expires_at KOLOM!
);
```

**KRITIEK PROBLEEM**: De originele migration heeft GEEN `expires_at` kolom!

### 3. Token Verificatie (contract/[aanvraagnummer]/page.tsx)

**Locatie**: `src/app/contract/[aanvraagnummer]/page.tsx` regel 40-57

```typescript
if (token) {
  const { data: accessData, error: tokenError } = await supabase
    .from('contract_viewer_access')
    .select('aanvraag_id, accessed_at, expires_at')  // ⚠️ Probeert expires_at te lezen
    .eq('access_token', token)
    .eq('aanvraag_id', aanvraag.id)
    .single()

  // Check if token is valid and not expired
  if (!accessData || tokenError) {
    redirect('/contract/niet-gevonden')
  }

  // Check if token is expired
  if (accessData.expires_at && new Date(accessData.expires_at) < new Date()) {
    redirect('/contract/niet-gevonden')  // ⚠️ Als expires_at null is, wordt dit overgeslagen
  }
}
```

**Probleem**: 
- Als `expires_at` kolom niet bestaat, geeft Supabase waarschijnlijk `null` terug
- De check `if (accessData.expires_at && ...)` wordt dan overgeslagen (null is falsy)
- Token wordt als "geldig" beschouwd, MAAR...

### 4. Fallback Token Lookup (zonder token in URL)

**Locatie**: `src/app/contract/[aanvraagnummer]/page.tsx` regel 66-80

```typescript
else {
  // No token provided - check if there's a valid token in database
  const { data: accessData } = await supabase
    .from('contract_viewer_access')
    .select('access_token, expires_at')
    .eq('aanvraag_id', aanvraag.id)
    .gt('expires_at', new Date().toISOString())  // ⚠️ SQL query met expires_at filter
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // If no valid token found, redirect to error page
  if (!accessData) {
    redirect('/contract/niet-gevonden')
  }
}
```

**KRITIEK PROBLEEM**: 
- Query gebruikt `.gt('expires_at', ...)` als filter
- Als `expires_at` kolom niet bestaat, kan dit:
  1. Een SQL error geven (kolom bestaat niet)
  2. Geen resultaten teruggeven (kolom is null voor alle records)
  3. Stil falen en redirect naar error page

### 5. Redirect Route (bekijk-contract/[aanvraagnummer]/page.tsx)

**Locatie**: `src/app/bekijk-contract/[aanvraagnummer]/page.tsx` regel 34-45

```typescript
const { data: accessData } = await supabase
  .from('contract_viewer_access')
  .select('access_token')
  .eq('aanvraag_id', aanvraag.id)
  .gt('expires_at', new Date().toISOString())  // ⚠️ Zelfde probleem
  .order('created_at', { ascending: false })
  .limit(1)
  .single()
```

**Zelfde probleem**: Query filtert op `expires_at` die mogelijk niet bestaat.

## Root Cause Analyse

### Scenario 1: Kolom bestaat niet (waarschijnlijk)
- **INSERT**: `expires_at` wordt genegeerd of geeft error (silently)
- **SELECT met filter**: `.gt('expires_at', ...)` geeft mogelijk geen resultaten
- **Resultaat**: Token wordt niet gevonden, redirect naar error page

### Scenario 2: Kolom bestaat maar is NULL voor oude records
- **Oude tokens**: Hebben `expires_at = NULL`
- **Nieuwe tokens**: Hebben `expires_at = datum + 7 dagen`
- **Query**: `.gt('expires_at', ...)` filtert NULL records eruit
- **Resultaat**: Oude tokens (zonder expires_at) worden niet gevonden

### Scenario 3: Timezone/Date parsing probleem
- **INSERT**: `expiresAt.toISOString()` geeft UTC tijd
- **SELECT**: `new Date().toISOString()` geeft huidige UTC tijd
- **Probleem**: Als er timezone verschil is, kan expiration check verkeerd zijn

### Scenario 4: Meerdere tokens per aanvraag
- Elke keer dat email wordt verstuurd, wordt nieuwe token aangemaakt
- Oude tokens blijven in database
- Query haalt nieuwste token op, maar die kan al verlopen zijn

## Gevonden Problemen

### ❌ PROBLEEM 1: Database Schema Mismatch
- **Migration 031**: Tabel heeft GEEN `expires_at` kolom
- **Code**: Probeert `expires_at` te gebruiken
- **Impact**: INSERT faalt mogelijk silently, SELECT geeft geen resultaten

### ❌ PROBLEEM 2: Geen Error Handling
- INSERT heeft geen error check
- Als `expires_at` kolom niet bestaat, wordt dit niet gedetecteerd
- Code gaat door alsof alles goed is

### ❌ PROBLEEM 3: Inconsistente Token Lookup
- Met token: Checkt expiration maar accepteert null
- Zonder token: Filtert op `expires_at > now`, wat faalt als kolom niet bestaat

### ❌ PROBLEEM 4: Geen Token Refresh Mechanisme
- Als token verlopen is, wordt er geen nieuwe token gegenereerd
- Klant moet nieuwe email aanvragen

### ❌ PROBLEEM 5: Meerdere Tokens per Aanvraag
- Elke email genereert nieuwe token
- Oude tokens blijven in database
- Query haalt mogelijk verkeerde (verlopen) token op

## Mogelijke Oorzaken van "Verlopen" Gedrag

1. **Kolom bestaat niet**: INSERT faalt, token heeft geen expiration, maar query filtert op `expires_at` en vindt niets
2. **NULL expiration**: Oude tokens hebben `expires_at = NULL`, worden gefilterd door `.gt()` query
3. **Query faalt**: `.gt('expires_at', ...)` geeft error als kolom niet bestaat
4. **Timezone mismatch**: Expiration check gebruikt verkeerde tijdzone
5. **Meerdere tokens**: Nieuwste token is verlopen, oude tokens worden niet gevonden

## Aanbevolen Fixes (voor later)

1. ✅ **Migration toevoegen**: Voeg `expires_at` kolom toe aan bestaande tabel
2. ✅ **Error handling**: Check INSERT result en log errors
3. ✅ **Backward compatibility**: Handle NULL `expires_at` voor oude tokens
4. ✅ **Token refresh**: Genereer nieuwe token als oude verlopen is
5. ✅ **Cleanup**: Verwijder oude/verlopen tokens periodiek
6. ✅ **Logging**: Log alle token access attempts voor debugging

## Verificatie Stappen

1. Check database schema: Heeft `contract_viewer_access` tabel `expires_at` kolom?
2. Check bestaande records: Hebben tokens `expires_at` waarde of NULL?
3. Check error logs: Zijn er INSERT errors voor `expires_at`?
4. Check query logs: Falen queries met `.gt('expires_at', ...)`?

## Gevonden Problemen (Volledig Overzicht)

### ❌ PROBLEEM 1: Database Schema Mismatch (KRITIEK)
- **Migration 031**: Tabel `contract_viewer_access` heeft GEEN `expires_at` kolom
- **Code**: Probeert `expires_at` in te voegen en te lezen
- **Impact**: 
  - INSERT faalt mogelijk (silently) - geen error check
  - SELECT queries met `.gt('expires_at', ...)` geven geen resultaten
  - Tokens worden als "verlopen" beschouwd, ook al zijn ze dat niet

### ❌ PROBLEEM 2: Geen Error Handling bij INSERT
**Locatie**: `src/lib/send-email-internal.ts` regel 340-346

```typescript
await supabase
  .from('contract_viewer_access')
  .insert({
    aanvraag_id: aanvraagId,
    access_token: accessToken,
    expires_at: expiresAt.toISOString(),  // ⚠️ Geen error check!
  })
// ⚠️ Geen error handling - faalt silently als kolom niet bestaat
```

**Impact**: Als `expires_at` kolom niet bestaat, wordt INSERT genegeerd of faalt silently. Code gaat door alsof alles goed is.

### ❌ PROBLEEM 3: Inconsistente Token Verificatie
**Met token in URL** (regel 40-57):
- Checkt `expires_at` maar accepteert null: `if (accessData.expires_at && ...)`
- Als `expires_at` null is, wordt check overgeslagen
- Token wordt als geldig beschouwd

**Zonder token in URL** (regel 66-80):
- Filtert op `expires_at > now`: `.gt('expires_at', new Date().toISOString())`
- Als kolom niet bestaat of NULL is, geeft query geen resultaten
- Redirect naar error page

**Impact**: Inconsistente gedrag - soms werkt het, soms niet.

### ❌ PROBLEEM 4: Query Filter Probleem
**Locatie**: `src/app/contract/[aanvraagnummer]/page.tsx` regel 72

```typescript
.gt('expires_at', new Date().toISOString())
```

**Probleem**: 
- Als `expires_at` kolom niet bestaat → SQL error of geen resultaten
- Als `expires_at` is NULL → NULL wordt gefilterd (geen resultaten)
- Alleen tokens met `expires_at > now` worden gevonden

**Impact**: Tokens zonder `expires_at` (oude records) worden nooit gevonden.

### ❌ PROBLEEM 5: Meerdere Tokens per Aanvraag
- Elke email genereert nieuwe token
- Oude tokens blijven in database
- Query haalt nieuwste token op (`.order('created_at', { ascending: false })`)
- Als nieuwste token verlopen is, wordt er geen fallback naar oude token gedaan

**Impact**: Als klant meerdere emails krijgt, kan nieuwste token verlopen zijn terwijl oude nog geldig is.

### ❌ PROBLEEM 6: Geen Token Refresh
- Als token verlopen is, wordt er geen nieuwe token gegenereerd
- Klant moet nieuwe email aanvragen
- Geen automatische fallback naar nieuwe token

**Impact**: Slechte gebruikerservaring - klant moet contact opnemen.

## Waarom Werkt Het Eerst Wel?

**Direct na email**:
- Token wordt net aangemaakt
- `expires_at` wordt (mogelijk) opgeslagen
- Token lookup vindt token
- Werkt!

**Na paar uur/dag**:
- Als `expires_at` kolom niet bestaat:
  - Query `.gt('expires_at', ...)` geeft geen resultaten
  - Redirect naar error page
- Als `expires_at` NULL is:
  - Query filtert NULL records eruit
  - Geen resultaten
  - Redirect naar error page
- Als `expires_at` wel bestaat maar verlopen:
  - Check `new Date(accessData.expires_at) < new Date()` is true
  - Redirect naar error page

## Conclusie

**Hoofdprobleem**: Database schema (migration 031) heeft geen `expires_at` kolom, maar code probeert deze wel te gebruiken. Dit veroorzaakt:
- INSERT faalt mogelijk (silently) - geen error check
- SELECT queries met `expires_at` filter geven geen resultaten
- Tokens worden als "verlopen" beschouwd, ook al zijn ze dat niet
- Inconsistente gedrag tussen verschillende code paths

**Impact**: Klanten kunnen contract viewer niet openen na verloop van tijd, zelfs als token nog geldig zou moeten zijn.

**Waarschijnlijke oorzaak**: 
1. Tabel is aangemaakt zonder `expires_at` kolom (migration 031)
2. Code probeert `expires_at` te gebruiken
3. INSERT wordt genegeerd of faalt silently
4. SELECT queries met `expires_at` filter geven geen resultaten
5. Tokens worden niet gevonden → "verlopen" error

**Verificatie nodig**:
1. Check database: Heeft `contract_viewer_access` tabel `expires_at` kolom?
2. Check records: Hebben bestaande tokens `expires_at` waarde of NULL?
3. Check error logs: Zijn er INSERT errors voor `expires_at`?
4. Check query logs: Falen queries met `.gt('expires_at', ...)`?

