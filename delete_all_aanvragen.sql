-- Script om alle contractaanvragen te verwijderen
-- Let op: Dit verwijdert ALLE aanvragen permanent!
-- Gerelateerde records in email_logs en contract_viewer_access worden automatisch verwijderd (CASCADE)

-- Eerst verwijderen we alle gerelateerde records expliciet (voor de zekerheid)
DELETE FROM contract_viewer_access;
DELETE FROM email_logs;

-- Dan verwijderen we alle contractaanvragen
DELETE FROM contractaanvragen;

-- Reset de sequence voor aanvraagnummers (optioneel, maar handig)
-- Dit zorgt ervoor dat nieuwe aanvragen weer bij PA-2025-000001 beginnen
-- Let op: Dit werkt alleen als de generate_aanvraagnummer functie op volgnummer gebaseerd is

-- Verifieer dat alles verwijderd is
SELECT COUNT(*) as remaining_aanvragen FROM contractaanvragen;
SELECT COUNT(*) as remaining_email_logs FROM email_logs;
SELECT COUNT(*) as remaining_viewer_access FROM contract_viewer_access;

