// GET  /api/admin/leads          → list leads (auth-gated)
// PATCH /api/admin/leads?id=N    → update status / notes
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, ensureSchema } from "../_lib/db.js";
import { isAuthenticated } from "../_lib/auth.js";

const VALID_STATUSES = new Set(["new", "contacted", "matched", "won", "lost", "junk"]);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // Auto-bootstrap on first admin visit too — no manual migration needed
  try {
    await ensureSchema();
  } catch (err) {
    console.error("[/api/admin/leads] schema bootstrap failed:", err);
    return res.status(500).json({ error: "db_unreachable" });
  }

  if (req.method === "GET") return list(req, res);
  if (req.method === "PATCH") return update(req, res);

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "method_not_allowed" });
}

async function list(req: VercelRequest, res: VercelResponse) {
  const status = typeof req.query.status === "string" ? req.query.status : null;
  const tier = typeof req.query.tier === "string" ? req.query.tier : null;
  const limit = Math.min(
    500,
    Math.max(1, Number(req.query.limit) || 200),
  );

  try {
    const sql = db();
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (tier) {
      params.push(tier);
      conditions.push(`tier = $${params.length}`);
    }
    params.push(limit);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await sql(
      `SELECT id, created_at, status, tier, score,
              postcode, gemeente, voornaam, achternaam, email, telefoon,
              property, ev_status, urgency, vehicle_brand, brand_pref,
              age_house, electrical_phase, has_solar, digital_meter,
              charger_location, meterkast_distance, desired_kw,
              call_pref, notes
       FROM leads
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length}`,
      params,
    );

    const summary = await sql(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'new')::int AS new,
         COUNT(*) FILTER (WHERE tier = 'tier-3')::int AS tier3,
         COUNT(*) FILTER (WHERE tier = 'tier-2')::int AS tier2,
         COUNT(*) FILTER (WHERE tier = 'tier-1')::int AS tier1,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS last24h,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')::int AS last7d
       FROM leads`,
    );

    return res.status(200).json({
      leads: rows,
      summary: summary[0] ?? null,
    });
  } catch (err) {
    console.error("[/api/admin/leads GET] error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}

async function update(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const body = (req.body ?? {}) as { status?: string; notes?: string };
  const sets: string[] = [];
  const params: unknown[] = [];

  if (typeof body.status === "string") {
    if (!VALID_STATUSES.has(body.status)) {
      return res.status(400).json({ error: "invalid_status" });
    }
    params.push(body.status);
    sets.push(`status = $${params.length}`);
  }
  if (typeof body.notes === "string") {
    params.push(body.notes.slice(0, 5000));
    sets.push(`notes = $${params.length}`);
  }
  if (sets.length === 0) {
    return res.status(400).json({ error: "nothing_to_update" });
  }
  params.push(id);

  try {
    const sql = db();
    const rows = await sql(
      `UPDATE leads SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING id, status, notes`,
      params,
    );
    if (rows.length === 0) return res.status(404).json({ error: "not_found" });
    return res.status(200).json({ ok: true, lead: rows[0] });
  } catch (err) {
    console.error("[/api/admin/leads PATCH] error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}
