// Neon HTTP-pooled SQL client. Vercel's Neon integration sets DATABASE_URL.
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function db(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED;
  if (!url) {
    throw new Error(
      "DATABASE_URL not set — connect Neon via the Vercel integration",
    );
  }
  _sql = neon(url);
  return _sql;
}

let schemaPromise: Promise<void> | null = null;

// Idempotent schema bootstrap. Runs once per cold start (re-uses an in-flight
// promise so concurrent requests don't race). CREATE TABLE/INDEX IF NOT EXISTS
// is a no-op once the table is in place — safe to call from every endpoint.
export function ensureSchema(): Promise<void> {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    const sql = db();
    await sql.query(`CREATE TABLE IF NOT EXISTS leads (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'new',
      postcode TEXT,
      gemeente TEXT,
      property TEXT,
      ev_status TEXT,
      urgency TEXT,
      age_house TEXT,
      charger_location TEXT,
      meterkast_distance TEXT,
      electrical_phase TEXT,
      has_solar TEXT,
      digital_meter TEXT,
      vehicle_brand TEXT,
      desired_kw TEXT,
      brand_pref JSONB NOT NULL DEFAULT '[]'::jsonb,
      voornaam TEXT,
      achternaam TEXT,
      email TEXT,
      telefoon TEXT,
      call_pref BOOLEAN DEFAULT TRUE,
      score INT,
      tier TEXT,
      reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      user_agent TEXT,
      ip TEXT,
      notes TEXT
    )`);
    await sql.query(
      `CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC)`,
    );
    await sql.query(
      `CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status)`,
    );
    await sql.query(
      `CREATE INDEX IF NOT EXISTS leads_tier_idx ON leads (tier)`,
    );
    await sql.query(
      `CREATE INDEX IF NOT EXISTS leads_postcode_idx ON leads (postcode)`,
    );
  })().catch((err) => {
    // If the bootstrap fails, clear the cached promise so a later call can retry
    schemaPromise = null;
    throw err;
  });
  return schemaPromise;
}
