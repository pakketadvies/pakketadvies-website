-- Script om ALLE contractaanvragen te verwijderen
-- ⚠️ WAARSCHUWING: Dit verwijdert ALLE aanvragen uit de database!
-- Gebruik dit alleen als je zeker weet dat je alle aanvragen wilt verwijderen.

-- Stap 1: Bekijk eerst hoeveel aanvragen er zijn
SELECT COUNT(*) AS totaal_aantal_aanvragen FROM contractaanvragen;

-- Stap 2: Bekijk hoeveel email logs er zijn
SELECT COUNT(*) AS totaal_email_logs FROM email_logs;

-- Stap 3: Bekijk hoeveel contract viewer access records er zijn
SELECT COUNT(*) AS totaal_access_records FROM contract_viewer_access;

-- Stap 4: Verwijder alle gerelateerde records (in de juiste volgorde vanwege foreign keys)
-- Eerst email_logs (heeft foreign key naar contractaanvragen)
DELETE FROM email_logs;

-- Dan contract_viewer_access (heeft foreign key naar contractaanvragen)
DELETE FROM contract_viewer_access;

-- Tot slot contractaanvragen zelf
DELETE FROM contractaanvragen;

-- Stap 5: Bevestiging - controleer dat alles verwijderd is
SELECT 
  (SELECT COUNT(*) FROM contractaanvragen) AS resterende_aanvragen,
  (SELECT COUNT(*) FROM email_logs) AS resterende_email_logs,
  (SELECT COUNT(*) FROM contract_viewer_access) AS resterende_access_records;

-- Als alles goed is gegaan, zou je moeten zien:
-- resterende_aanvragen: 0
-- resterende_email_logs: 0
-- resterende_access_records: 0

