# Database Migratie: Split Vastrecht Stroom/Gas

## ⚠️ BELANGRIJK: Deze migratie moet handmatig worden uitgevoerd

De code is al gedeployed naar productie, maar de database migratie moet nog worden uitgevoerd.

## Stap 1: Open Supabase SQL Editor

1. Ga naar: https://app.supabase.com/project/dxztyhwiwgrxjnlohapm/sql
2. Klik op "New query"

## Stap 2: Kopieer en plak de migratie SQL

Kopieer de VOLLEDIGE inhoud van het bestand:
```
supabase/migrations/016_split_vastrecht_stroom_gas.sql
```

## Stap 3: Voer de migratie uit

1. Plak de SQL in de editor
2. Klik op "Run" (of druk Cmd+Enter)
3. Wacht tot de migratie compleet is
4. Controleer de output op eventuele errors

## Wat doet deze migratie?

✅ Voegt `vastrecht_stroom_maand` toe aan alle contract tabellen
✅ Voegt `vastrecht_gas_maand` toe aan alle contract tabellen  
✅ Migreert bestaande `vaste_kosten_maand` data (50/50 split)
✅ Zet defaults op €4.00 per aansluiting
✅ Behoudt `vaste_kosten_maand` voor backward compatibility

## Verificatie

Na het uitvoeren van de migratie, run deze query om te controleren:

```sql
SELECT 
  l.naam as leverancier,
  c.naam as contract,
  cdv.vastrecht_stroom_maand,
  cdv.vastrecht_gas_maand,
  cdv.vaste_kosten_maand as oud_vastrecht
FROM contracten c
JOIN leveranciers l ON c.leverancier_id = l.id
LEFT JOIN contract_details_vast cdv ON c.id = cdv.contract_id
WHERE c.type = 'vast' AND c.actief = true
LIMIT 5;
```

Je zou moeten zien dat alle contracten nu `vastrecht_stroom_maand` en `vastrecht_gas_maand` hebben.

## Na de Migratie

1. ✅ Ga naar Admin panel: `/admin/contracten`
2. ✅ Controleer een bestaand contract
3. ✅ Je ziet nu 2 aparte velden: "Vastrecht Stroom" en "Vastrecht Gas"
4. ✅ Pas de waardes aan waar nodig (huidige data is 50/50 gesplitst)

## Rollback (indien nodig)

Als er iets misgaat, kan je terug door:

```sql
-- Restore vaste_kosten_maand from new fields
UPDATE contract_details_vast
SET vaste_kosten_maand = vastrecht_stroom_maand + vastrecht_gas_maand;

-- Drop new columns (ALLEEN als je echt terug wilt)
ALTER TABLE contract_details_vast DROP COLUMN vastrecht_stroom_maand;
ALTER TABLE contract_details_vast DROP COLUMN vastrecht_gas_maand;
```

## Support

Als je problemen hebt, check de volledige SQL in:
`supabase/migrations/016_split_vastrecht_stroom_gas.sql`

