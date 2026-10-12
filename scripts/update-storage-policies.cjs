const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.okxjysjwkzjufatmnnss:N%24undar%40%21998@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();

  console.log('Updating storage policies for decoration-images...');

  await client.query(`
    -- Drop old restrictive policies that relied on auth.uid()
    DROP POLICY IF EXISTS "Admins upload storage images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins update storage images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins delete storage images" ON storage.objects;
    DROP POLICY IF EXISTS "Public read storage images" ON storage.objects;

    -- Allow public read on decoration-images
    CREATE POLICY "Public read storage images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'decoration-images');

    -- Allow server / admin uploads into decoration-images bucket
    CREATE POLICY "Allow decoration-images uploads"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'decoration-images');

    -- Allow update on decoration-images
    CREATE POLICY "Allow decoration-images updates"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'decoration-images');

    -- Allow delete on decoration-images
    CREATE POLICY "Allow decoration-images deletes"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'decoration-images');
  `);

  console.log('✅ Storage policies successfully updated!');
  await client.end();
}

main().catch(console.error);
