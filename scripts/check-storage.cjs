const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.okxjysjwkzjufatmnnss:N%24undar%40%21998@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  const res = await client.query(`
    SELECT polname, polcmd, polroles::text, polqual, polwithcheck 
    FROM pg_policy 
    WHERE polrelid = 'storage.objects'::regclass;
  `);
  console.log('Policies on storage.objects:', JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
