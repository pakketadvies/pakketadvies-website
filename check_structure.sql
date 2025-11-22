-- Check current structure of contract_details_vast
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contract_details_vast'
ORDER BY ordinal_position;
