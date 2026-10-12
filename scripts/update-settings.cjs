const pg = require('pg');

const connectionString = 'postgresql://postgres.okxjysjwkzjufatmnnss:N%24undar%40%21998@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function updateSettings() {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const settings = [
      { key: 'whatsapp_number', val: '918903575802' },
      { key: 'whatsapp_number_secondary', val: '919842322624' },
      { key: 'phone', val: '+91 89035 75802, +91 98423 22624' },
      { key: 'logo_url', val: '/Decoration_Logo.png' },
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

    console.log('✅ Settings updated in Supabase successfully!');
  } catch (err) {
    console.error('❌ Error updating settings:', err.message);
  } finally {
    await pool.end();
  }
}

updateSettings();
