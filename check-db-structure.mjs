import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.dxztyhwiwgrxjnlohapm',
  password: 'Ab49n805!',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Check contract_details_dynamisch structure
    console.log('=== CONTRACT_DETAILS_DYNAMISCH STRUCTURE ===');
    const structureQuery = `
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
    `;
    const structure = await client.query(structureQuery);
    console.table(structure.rows);

    // 2. Check if there are any dynamisch contracts
    console.log('\n=== DYNAMISCH CONTRACTS COUNT ===');
    const countQuery = 'SELECT COUNT(*) as total FROM contract_details_dynamisch;';
    const count = await client.query(countQuery);
    console.log(`Total dynamisch contracts: ${count.rows[0].total}\n`);

    // 3. Check sample data
    if (parseInt(count.rows[0].total) > 0) {
      console.log('=== SAMPLE DYNAMISCH CONTRACT DATA ===');
      const sampleQuery = `
        SELECT 
          cd.*,
          c.naam as contract_naam,
          c.type as contract_type
        FROM contract_details_dynamisch cd
        LEFT JOIN contracten c ON c.id = cd.contract_id
        LIMIT 2;
      `;
      const sample = await client.query(sampleQuery);
      console.table(sample.rows);
    }

    // 4. Check if dynamic_prices table exists
    console.log('\n=== DYNAMIC_PRICES TABLE ===');
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dynamic_prices'
      );
    `;
    const tableExists = await client.query(tableExistsQuery);
    console.log(`dynamic_prices table exists: ${tableExists.rows[0].exists}`);

    if (tableExists.rows[0].exists) {
      const pricesStructureQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'dynamic_prices' 
        ORDER BY ordinal_position;
      `;
      const pricesStructure = await client.query(pricesStructureQuery);
      console.table(pricesStructure.rows);

      // Check if there's data
      const pricesDataQuery = 'SELECT COUNT(*) as total FROM dynamic_prices;';
      const pricesData = await client.query(pricesDataQuery);
      console.log(`Total dynamic_prices records: ${pricesData.rows[0].total}`);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

checkDatabase();

