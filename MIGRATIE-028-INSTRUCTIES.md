# 🗄️ Migratie 028: verbruik_type toevoegen aan vast en dynamisch contracten

## ⚠️ BELANGRIJK: Deze migratie moet handmatig worden uitgevoerd

De code is al gedeployed, maar de database migratie moet nog worden uitgevoerd.

## Stap 1: Open Supabase SQL Editor

1. Ga naar: https://supabase.com/dashboard/project/dxztyhwiwgrxjnlohapm/sql/new
2. Klik op "New query"

## Stap 2: Kopieer en plak de migratie SQL

Kopieer de VOLLEDIGE inhoud van het bestand:
```
supabase/migrations/028_add_verbruik_type_to_vast_dynamisch.sql
```

## Stap 3: Voer de migratie uit

1. Plak de SQL in de editor
2. Klik op "Run" (of druk Cmd+Enter)
3. Wacht tot de migratie compleet is
4. Controleer de output op eventuele errors

## Wat doet deze migratie?

✅ Voegt `verbruik_type` kolom toe aan `contract_details_vast` tabel
✅ Voegt `verbruik_type` kolom toe aan `contract_details_dynamisch` tabel
✅ Zet default waarde op 'beide' voor alle bestaande contracten
✅ Voegt CHECK constraint toe (kleinverbruik, grootverbruik, beide)
✅ Voegt index toe voor performance
✅ Voegt comment toe voor documentatie

## Verificatie

Na het uitvoeren van de migratie, run deze query om te controleren:

```sql
-- Check vast contracts
SELECT 
  c.naam as contract_naam,
  cdv.verbruik_type
FROM contracten c
LEFT JOIN contract_details_vast cdv ON c.id = cdv.contract_id
WHERE c.type = 'vast' AND c.actief = true
LIMIT 5;

-- Check dynamisch contracts
SELECT 
  c.naam as contract_naam,
  cdd.verbruik_type
FROM contracten c
LEFT JOIN contract_details_dynamisch cdd ON c.id = cdd.contract_id
WHERE c.type = 'dynamisch' AND c.actief = true
LIMIT 5;
```

Je zou moeten zien dat alle contracten nu `verbruik_type = 'beide'` hebben.

## Na de Migratie

1. ✅ Refresh de admin panel pagina
2. ✅ Probeer het contract opnieuw te bewerken
3. ✅ De error zou nu weg moeten zijn
4. ✅ Je kunt nu "Verbruik Type" instellen voor vast en dynamisch contracten

