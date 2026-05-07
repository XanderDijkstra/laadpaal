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
