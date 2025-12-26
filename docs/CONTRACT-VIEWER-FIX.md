# Contract Viewer Token Expiration Fix

## Probleem
Contract viewer links in bevestigingsemails stopten met werken na een paar uur/dagen. Tokens werden als "verlopen" beschouwd, ook al waren ze nog geldig.

## Root Cause
De `contract_viewer_access` tabel werd aangemaakt in migratie `031_add_email_logs.sql` **zonder** de `expires_at` kolom. De code probeerde wel `expires_at` te gebruiken, wat leidde tot:

1. **INSERT errors**: `expires_at` werd genegeerd of gaf een error
2. **SELECT failures**: Queries met `.gt('expires_at', ...)` vonden geen resultaten
3. **Token expiration**: Tokens zonder `expires_at` werden niet correct gevonden

## Oplossing

### 1. Database Migratie
**Bestand**: `supabase/migrations/041_add_expires_at_to_contract_viewer.sql`

Deze migratie:
- Voegt `expires_at` kolom toe aan `contract_viewer_access` tabel
- Zet default expiration (7 dagen) voor bestaande tokens zonder expiration
- Maakt index aan voor snellere queries

### 2. Code Updates

#### Backward Compatibility
De code is aangepast om ook tokens zonder `expires_at` te accepteren (oude tokens):

**`src/app/contract/[aanvraagnummer]/page.tsx`**:
- Token verification accepteert tokens met `expires_at = NULL` (oude tokens)
- Query gebruikt `.or()` om zowel NULL als geldige tokens te vinden

**`src/app/bekijk-contract/[aanvraagnummer]/page.tsx`**:
- Zelfde backward compatibility logica

**`src/lib/send-email-internal.ts`**:
- Error handling toegevoegd voor token storage
- Logging voor debugging

## Uitvoeren

### Stap 1: Migratie uitvoeren
Voer de migratie uit in Supabase SQL Editor:

```sql
-- Kopieer en plak de inhoud van:
-- supabase/migrations/041_add_expires_at_to_contract_viewer.sql
```

Of via Supabase CLI:
```bash
supabase db push
```

### Stap 2: Verificatie
Check of de kolom bestaat:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contract_viewer_access' 
AND column_name = 'expires_at';
```

### Stap 3: Test
1. Maak een nieuwe contractaanvraag
2. Check of de email een werkende contract viewer link bevat
3. Test of de link na 7 dagen nog steeds werkt (of juist niet meer werkt als expired)

## Resultaat

✅ **Nieuwe tokens**: Hebben `expires_at` set op 7 dagen na creatie
✅ **Oude tokens**: Blijven werken (backward compatibility)
✅ **Expired tokens**: Worden correct afgewezen
✅ **Queries**: Werken correct met `expires_at` filter

## Monitoring

Check regelmatig:
- Aantal tokens zonder `expires_at` (zou moeten afnemen)
- Aantal expired tokens
- Error logs voor token storage failures

```sql
-- Check token status
SELECT 
  COUNT(*) as total,
  COUNT(expires_at) as with_expiration,
  COUNT(*) - COUNT(expires_at) as without_expiration,
  COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired
FROM contract_viewer_access;
```

