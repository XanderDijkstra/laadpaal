// Admin login — POST { password } → 200 + Set-Cookie on success.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { passwordCorrect, makeSessionCookie } from "../_lib/auth.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const body = (req.body ?? {}) as { password?: string };
  if (!body.password || typeof body.password !== "string") {
    return res.status(400).json({ error: "missing_password" });
  }

  if (!passwordCorrect(body.password)) {
    // Constant delay to slightly slow brute-force attempts
    await new Promise((r) => setTimeout(r, 600));
    return res.status(401).json({ error: "invalid_password" });
  }

  res.setHeader("Set-Cookie", makeSessionCookie());
  return res.status(200).json({ ok: true });
}
