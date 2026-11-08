import { createHash, createHmac, timingSafeEqual } from "crypto";

/**
 * Minimal stateless admin auth — HMAC-signed expiring token in an
 * HttpOnly cookie. No third-party auth dependency, constant-time
 * signature + password comparison, 7-day sessions.
 *
 * Production: set ADMIN_PASSWORD (login is refused without it) and,
 * ideally, ADMIN_SECRET. Development: sensible local defaults.
 */

export const ADMIN_COOKIE = "btc_admin";
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/** Empty string in production means "not configured — refuse login". */
export function adminPassword(): string {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production"
    ? ""
    : "cutroom-admin";
}

function secret(): string {
  return process.env.ADMIN_SECRET || `${adminPassword()}::btc-signing`;
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function createToken(): string {
  const body = Buffer.from(
    JSON.stringify({ exp: Date.now() + TTL_MS })
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as {
      exp?: number;
    };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

/** Constant-time password check (compares SHA-256 digests). */
export function checkPassword(input: string | undefined | null): boolean {
  const expected = adminPassword();
  if (!expected || !input) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/* ---- Naive in-memory rate limit for the login endpoint ---- */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || rec.resetAt < now) return false;
  return rec.count >= 8;
}

export function recordAttempt(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || rec.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
  } else {
    rec.count += 1;
  }
}

export function clearAttempts(key: string) {
  attempts.delete(key);
}
