const pg = require('pg');

const connectionString = 'postgresql://postgres.okxjysjwkzjufatmnnss:N%24undar%40%21998@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function testConnection() {
  console.log('Testing direct connection to Supabase pooler...');
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const res = await pool.query('SELECT NOW(), current_database(), current_user');
    console.log('✅ Connection SUCCESSFUL!');
    console.log('Result:', res.rows[0]);

    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Existing tables count in public schema:', tables.rows.length);
    console.log('Table names:', tables.rows.map(r => r.table_name).join(', '));

    const userTableExists = tables.rows.some(r => r.table_name.toLowerCase() === 'user');
    if (userTableExists) {
      const users = await pool.query('SELECT "id", "email", "name", "role", "isActive", "passwordHash" FROM "User"');
      console.log('Existing Users count:', users.rows.length);
      const bcrypt = require('bcryptjs');
      for (const u of users.rows) {
        const matchAdmin = await bcrypt.compare('Admin@12345', u.passwordHash);
        const matchManager = await bcrypt.compare('Manager@12345', u.passwordHash);
        const matchStaff = await bcrypt.compare('Staff@12345', u.passwordHash);
        console.log(`User: ${u.email} (${u.role}) -> Admin@12345: ${matchAdmin}, Manager@12345: ${matchManager}, Staff@12345: ${matchStaff}`);
      }
    } else {
      console.log('⚠️ "User" table does NOT exist yet!');
    }
  } catch (err) {
    console.error('❌ Error during check:', err.message, err);
  } finally {
    await pool.end();
  }
}

testConnection();

