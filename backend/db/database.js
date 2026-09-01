// NaamMala — Postgres database setup
// Works with: local Postgres (dev/testing), Vercel Postgres, Neon, or any
// standard Postgres connection string — all via the same `pg` driver.

import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error(
    "⚠️  POSTGRES_URL is not set. Add it to your .env file (see .env.example)."
  );
}

const pool = new Pool({
  connectionString,
  // Local Postgres (dev/testing) has no TLS; hosted Postgres (Vercel/Neon) requires it.
  ssl: connectionString?.includes("localhost") ? false : { rejectUnauthorized: false },
});

// A tagged-template helper that mirrors the @vercel/postgres `sql` API,
// so route files can write sql`SELECT * FROM users WHERE id = ${id}`
// with automatic parameterization (safe from SQL injection) on plain `pg`.
export function sql(strings, ...values) {
  let text = strings[0];
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}${strings[i + 1]}`;
  }
  return pool.query(text, values);
}

// Idempotent — safe to call on every cold start. Uses IF NOT EXISTS so it
// never wipes existing data.
export async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      typed_naam TEXT NOT NULL,
      language TEXT NOT NULL,
      religion TEXT,
      written_sample TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // date stored as TEXT ('YYYY-MM-DD') rather than a native DATE column —
  // avoids timezone-shift surprises when reading rows back in Node.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS jaap_counts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      UNIQUE(user_id, date)
    );
  `);
}

export default pool;