-- Script om alle test contractaanvragen te verwijderen
-- Let op: Dit verwijdert ALLE aanvragen uit de database!
-- Gebruik dit alleen als je zeker weet dat alle aanvragen testdata zijn.

-- Optioneel: Bekijk eerst hoeveel aanvragen er zijn
-- SELECT COUNT(*) FROM contractaanvragen;

-- Verwijder alle contractaanvragen (CASCADE verwijdert ook gerelateerde records in email_logs en contract_viewer_access)
DELETE FROM contractaanvragen;

-- Reset de sequence (optioneel, maar handig als je wilt dat nieuwe nummers vanaf 000001 beginnen)
-- Dit kan niet direct, maar de functie zal automatisch het hoogste nummer vinden en +1 doen

-- Optioneel: Verwijder ook alle email logs (als die ook testdata zijn)
-- DELETE FROM email_logs;

-- Optioneel: Verwijder ook alle contract viewer access records
-- DELETE FROM contract_viewer_access;

-- Bevestiging
SELECT 'Alle contractaanvragen zijn verwijderd' AS resultaat;

