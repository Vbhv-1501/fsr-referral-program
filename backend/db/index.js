// backend/db/index.js
const { Pool } = require('pg');

// Supabase and most hosted Postgres providers require SSL in production.
// rejectUnauthorized: false handles self-signed certs (safe for Supabase/Render PG).
const sslConfig = () => {
  if (process.env.NODE_ENV !== 'production') return false;
  // If DATABASE_URL already includes ?sslmode=disable, skip SSL
  if (process.env.DATABASE_URL?.includes('sslmode=disable')) return false;
  return { rejectUnauthorized: false };
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig(),
  max: 10,                   // Keep low — Supabase free tier caps at 20 connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err.message);
});

pool.on('connect', () => {
  console.log('[DB] New client connected to pool');
});

/** Execute a single query */
const query = (text, params) => pool.query(text, params);

/** Get a client from the pool (remember to .release()) */
const getClient = () => pool.connect();

/** Run a function inside a transaction — auto commits or rolls back */
const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/** Health check — used by /health endpoint and startup check */
const healthCheck = async () => {
  const res = await pool.query('SELECT NOW() as time, current_database() as db');
  return res.rows[0];
};

module.exports = { query, getClient, withTransaction, healthCheck, pool };
