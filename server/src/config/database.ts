import pg, { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ Warning: DATABASE_URL is not set in environment variables. Defaulting to local connection.');
    }

    _pool = new pg.Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    _pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err.message);
    });
  }

  return _pool;
}

export const pool = new Proxy({} as Pool, {
  get(target, prop, receiver) {
    const actualPool = getPool();
    const value = Reflect.get(actualPool, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(actualPool);
    }
    return value;
  },
});

/**
 * Execute a query and return all matching rows
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const p = getPool();
  const start = Date.now();
  const res = await p.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development' && duration > 500) {
    console.warn(`⚠️ Slow query (${duration}ms):`, text);
  }
  return res.rows as T[];
}

/**
 * Execute a query and return the first row (or null if not found)
 */
export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

/**
 * Run a callback function inside an atomic database transaction
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export const db = {
  query,
  queryOne,
  transaction,
  pool,
  getPool,
};

export default db;
