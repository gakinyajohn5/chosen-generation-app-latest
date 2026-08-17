// db/pool.js
// Shared Postgres connection pool, backed by Supabase.
// Reads the connection string from process.env.DATABASE_URL, which is set
// in Render's Environment tab — never hardcode it here.

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn(
    '[DB] WARNING: DATABASE_URL is not set. Set it in your .env file locally, ' +
    'or in Render\'s Environment tab in production.'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase's pooler requires SSL; this accepts its cert chain.
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
});

module.exports = pool;
