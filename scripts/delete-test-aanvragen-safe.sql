-- Veilige versie: Verwijder alleen aanvragen met specifieke criteria
-- Bijvoorbeeld: alleen aanvragen met test email adressen of ouder dan X dagen

-- Verwijder aanvragen met test email adressen
DELETE FROM contractaanvragen
WHERE 
  (gegevens_data->>'email' LIKE '%test%' OR gegevens_data->>'emailadres' LIKE '%test%')
  OR gegevens_data->>'email' = 'test@test.nl'
  OR gegevens_data->>'emailadres' = 'test@test.nl';

-- Of verwijder aanvragen ouder dan 7 dagen (aanpasbaar)
-- DELETE FROM contractaanvragen
-- WHERE created_at < NOW() - INTERVAL '7 days';

-- Bevestiging
SELECT COUNT(*) AS verwijderd FROM contractaanvragen;

