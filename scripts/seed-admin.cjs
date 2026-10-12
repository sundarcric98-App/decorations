const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.okxjysjwkzjufatmnnss:N%24undar%40%21998@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function seedAdmin() {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const sql = `
    DO $$
    DECLARE
      new_admin_id UUID := gen_random_uuid();
      admin_email TEXT := 'admin@sathuragiridecoration.com';
      admin_pass TEXT := 'Admin@12345';
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          new_admin_id,
          '00000000-0000-0000-0000-000000000000',
          'authenticated',
          'authenticated',
          admin_email,
          crypt(admin_pass, gen_salt('bf')),
          NOW(),
          '{"provider":"email","providers":["email"]}',
          '{"display_name":"Sathuragiri Admin"}',
          NOW(),
          NOW()
        );
        
        INSERT INTO public.admins (id, display_name, role, is_active)
        VALUES (new_admin_id, 'Sathuragiri Admin', 'OWNER', TRUE)
        ON CONFLICT (id) DO NOTHING;
      ELSE
        INSERT INTO public.admins (id, display_name, role, is_active)
        SELECT id, 'Sathuragiri Admin', 'OWNER', TRUE
        FROM auth.users
        WHERE email = admin_email
        ON CONFLICT (id) DO NOTHING;
      END IF;
    END $$;
  `;

  try {
    await pool.query(sql);
    console.log('✅ Admin user created/verified in auth.users and public.admins');
    const res = await pool.query(`
      SELECT a.id, a.display_name, a.role, a.is_active, u.email
      FROM public.admins a
      JOIN auth.users u ON a.id = u.id
    `);
    console.log('Admins in DB:', res.rows);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  } finally {
    await pool.end();
  }
}

seedAdmin();
