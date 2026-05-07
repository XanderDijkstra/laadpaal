// One-shot schema migration — idempotent, run with:
//   DATABASE_URL=$(vercel env pull --yes && cat .env.local | grep DATABASE_URL | cut -d= -f2-) \
//     npm run db:migrate
//
// Or after `vercel env pull`:
//   node --env-file=.env.local scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";

const url =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL_UNPOOLED;

if (!url) {
  console.error(
    "[migrate] no DATABASE_URL / POSTGRES_URL env var. Run `vercel env pull` first.",
  );
  process.exit(1);
}

const sql = neon(url);

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'new',
    -- form fields
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
    -- scoring (computed server-side, sent by client)
    score INT,
    tier TEXT,
    reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- meta
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    user_agent TEXT,
    ip TEXT,
    notes TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status)`,
  `CREATE INDEX IF NOT EXISTS leads_tier_idx ON leads (tier)`,
  `CREATE INDEX IF NOT EXISTS leads_postcode_idx ON leads (postcode)`,
];

async function main() {
  for (const stmt of STATEMENTS) {
    await sql.query(stmt);
    const first = stmt.replace(/\s+/g, " ").slice(0, 70);
    console.log(`[migrate] OK · ${first}…`);
  }

  const [{ count }] =
    /** @type {{count: string}[]} */ (
      await sql.query(`SELECT COUNT(*)::text as count FROM leads`)
    );
  console.log(`[migrate] leads-tabel klaar — huidig record-count: ${count}`);
}

main().catch((err) => {
  console.error("[migrate] failed:", err?.message ?? err);
  process.exit(1);
});
