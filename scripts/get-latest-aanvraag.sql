-- Get latest contract application for testing
SELECT 
  id,
  aanvraagnummer,
  contract_naam,
  leverancier_naam,
  aanvraag_type,
  status,
  email_bevestiging_verzonden,
  created_at
FROM contractaanvragen
ORDER BY created_at DESC
LIMIT 1;

