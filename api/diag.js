const pg = require('pg');

module.exports = async (req, res) => {
  const result = {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] : null,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    },
    dbStatus: null,
    dbError: null,
  };

  try {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    const queryRes = await pool.query('SELECT NOW(), current_database(), current_user');
    result.dbStatus = 'CONNECTED';
    result.dbResult = queryRes.rows[0];
    await pool.end();
  } catch (err) {
    result.dbStatus = 'ERROR';
    result.dbError = {
      message: err.message,
      code: err.code,
      stack: err.stack,
    };
  }

  res.status(200).json(result);
};
