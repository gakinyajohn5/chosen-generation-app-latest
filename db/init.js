// db/init.js
// Run once (locally or as a one-off) to create all tables in Supabase:
//   node db/init.js
// Safe to re-run — every statement uses CREATE TABLE IF NOT EXISTS.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  console.log('[DB] Running schema.sql against', maskUrl(process.env.DATABASE_URL));
  await pool.query(sql);
  console.log('[DB] ✅ Schema is up to date.');
  await pool.end();
}

function maskUrl(url) {
  if (!url) return '(no DATABASE_URL set)';
  return url.replace(/:([^:@/]+)@/, ':****@');
}

main().catch((err) => {
  console.error('[DB] ❌ Failed to run schema:', err.message);
  process.exit(1);
});
