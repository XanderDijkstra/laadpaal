// Public POST endpoint — receives a form submission from OfferteForm and
// stores it in the leads table. Schema is auto-created on first request.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, ensureSchema } from "./_lib/db";

function s(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t.slice(0, 1000) : null;
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v.slice(0, 50) : [];
}

function clientIp(req: VercelRequest): string | null {
  const xff = (req.headers["x-forwarded-for"] ?? "") as string;
  const first = xff.split(",")[0]?.trim();
  return first || (req.socket as { remoteAddress?: string })?.remoteAddress || null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  const email = s(body.email);
  const consent = body.consent === true;
  if (!email || !consent) {
    return res
      .status(400)
      .json({ error: "missing_required", detail: "email and consent are required" });
  }

  try {
    await ensureSchema();
    const sql = db();

    const ua = (req.headers["user-agent"] as string | undefined) ?? null;
    const ip = clientIp(req);

    const result = await sql.query(
      `INSERT INTO leads (
        postcode, gemeente, property, ev_status, urgency, age_house,
        charger_location, meterkast_distance, electrical_phase, has_solar,
        digital_meter, vehicle_brand, desired_kw, brand_pref,
        voornaam, achternaam, email, telefoon, call_pref,
        score, tier, reasons,
        utm_source, utm_medium, utm_campaign, user_agent, ip
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14::jsonb,$15,$16,$17,$18,$19,
        $20,$21,$22::jsonb,$23,$24,$25,$26,$27
      ) RETURNING id, created_at, tier`,
      [
        s(body.postcode),
        s(body.gemeente),
        s(body.property),
        s(body.ev_status),
        s(body.urgency),
        s(body.age_house),
        s(body.charger_location),
        s(body.meterkast_distance),
        s(body.electrical_phase),
        s(body.has_solar),
        s(body.digital_meter),
        s(body.vehicle_brand),
        s(body.desired_kw),
        JSON.stringify(arr(body.brand_pref)),
        s(body.voornaam),
        s(body.achternaam),
        email,
        s(body.telefoon),
        body.call_pref !== false,
        typeof body.score === "number" ? body.score : null,
        s(body.tier),
        JSON.stringify(arr(body.reasons)),
        s(body.utm_source),
        s(body.utm_medium),
        s(body.utm_campaign),
        ua,
        ip,
      ],
    );

    const row = result[0] as { id: number; created_at: string; tier: string | null };
    return res.status(201).json({
      ok: true,
      id: row.id,
      tier: row.tier,
      created_at: row.created_at,
    });
  } catch (err) {
    console.error("[/api/leads] error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}
