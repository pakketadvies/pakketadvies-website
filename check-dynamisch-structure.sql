-- Check structure of contract_details_dynamisch
SELECT 
    column_name, 
    data_type,
    numeric_precision,
    numeric_scale,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'contract_details_dynamisch' 
ORDER BY ordinal_position;

-- Check if there are any dynamisch contracts
SELECT COUNT(*) as total_dynamisch_contracts FROM contract_details_dynamisch;

-- Check sample data from dynamisch contracts
SELECT 
    cd.*,
    c.naam as contract_naam,
    c.type as contract_type
FROM contract_details_dynamisch cd
LEFT JOIN contracten c ON c.id = cd.contract_id
LIMIT 3;

-- Check if dynamic_prices table exists
SELECT 
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'dynamic_prices';

-- Check dynamic_prices structure if exists
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'dynamic_prices' 
ORDER BY ordinal_position;

