import pg, { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let _pool: Pool | null = null;

function normalizeSupabaseUrl(connStr: string): string {
  if (!connStr) return connStr;

  // Detect IPv6-only direct Supabase host pattern: db.<project-ref>.supabase.co
  const dbMatch = connStr.match(/@db\.([a-zA-Z0-9]+)\.supabase\.co(?::\d+)?/);
  if (dbMatch) {
    const projectRef = dbMatch[1];
    const poolerHost = process.env.SUPABASE_POOLER_HOST || 'aws-0-ap-southeast-2.pooler.supabase.com';
    let updated = connStr.replace(dbMatch[0], `@${poolerHost}:6543`);

    // Ensure username is postgres.<projectRef> (required by Supabase Pooler)
    if (updated.includes('://postgres:') && !updated.includes(`://postgres.${projectRef}:`)) {
      updated = updated.replace('://postgres:', `://postgres.${projectRef}:`);
    }

    console.log(`[Database] Auto-normalized IPv6 direct Supabase host to IPv4 Pooler: ${poolerHost}:6543`);
    return updated;
  }

  return connStr;
}

export function getPool(): Pool {
  if (!_pool) {
    const defaultProdUrl =
      'postgresql://postgres.okxjysjwkzjufatmnnss:N%24undar%40%21998@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';
    const rawConnection =
      process.env.DATABASE_URL ||
      (process.env.NODE_ENV === 'production' || process.env.VERCEL
        ? defaultProdUrl
        : 'postgresql://postgres:postgres@localhost:5432/postgres');

    const connectionString = normalizeSupabaseUrl(rawConnection);
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ Warning: DATABASE_URL is not set in environment variables. Using fallback connection.');
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
