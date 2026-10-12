const pg = require('pg');

const connectionString = 'postgresql://postgres.okxjysjwkzjufatmnnss:N%24undar%40%21998@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function updateSettings() {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const addressVal = 'Usilai Road, Peraiyur - 625703, Madurai District, Tamil Nadu';
    const settings = [
      { key: 'address', val: addressVal },
      { key: 'city', val: 'Peraiyur' },
      { key: 'pincode', val: '625703' },
    ];

    for (const item of settings) {
      await pool.query(
        `INSERT INTO public.site_settings (setting_key, setting_value)
         VALUES ($1, $2)
         ON CONFLICT (setting_key) DO UPDATE
         SET setting_value = EXCLUDED.setting_value,
             updated_at = CURRENT_TIMESTAMP`,
        [item.key, item.val]
      );
      console.log(`Updated setting ${item.key} = ${item.val}`);
    }

    console.log('✅ Address updated in Supabase successfully!');
  } catch (err) {
    console.error('❌ Error updating settings:', err.message);
  } finally {
    await pool.end();
  }
}

updateSettings();
