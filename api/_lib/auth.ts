// Lightweight HMAC-signed session cookie. No external deps — only node:crypto.
//
// Env vars required for the admin endpoints:
//   ADMIN_PASSWORD   — single password the operator types in the login form
//   SESSION_SECRET   — random hex (32+ chars) used to sign session cookies
//
// Cookie format:  <issuedAtMs>.<hmacHex>
// Signed value:   `${issuedAtMs}|${SESSION_SECRET}` → HMAC-SHA-256 hex
import { createHmac, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const COOKIE_NAME = "lt_admin";
const MAX_AGE_SEC = 60 * 60 * 12; // 12 hours

export function passwordCorrect(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET not set or too short (need 16+ chars)");
  }
  return s;
}

function sign(issuedAtMs: number): string {
  return createHmac("sha256", secret())
    .update(String(issuedAtMs))
    .digest("hex");
}

export function makeSessionCookie(): string {
  const issued = Date.now();
  const value = `${issued}.${sign(issued)}`;
  return [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE_SEC}`,
  ].join("; ");
}

export function clearSessionCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

export function isAuthenticated(req: VercelRequest): boolean {
  const cookieHeader = req.headers.cookie ?? "";
  const cookie = cookieHeader
    .split(/;\s*/)
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return false;

  const value = cookie.slice(COOKIE_NAME.length + 1);
  const [issuedStr, sig] = value.split(".");
  if (!issuedStr || !sig) return false;

  const issued = Number(issuedStr);
  if (!Number.isFinite(issued)) return false;
  if (Date.now() - issued > MAX_AGE_SEC * 1000) return false;

  const expectedSig = sign(issued);
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expectedSig, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

export function require401(
  req: VercelRequest,
  res: VercelResponse,
): boolean {
  if (isAuthenticated(req)) return true;
  res.status(401).json({ error: "unauthorized" });
  return false;
}
