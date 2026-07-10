import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Сессия — подписанная строка `payload.signature`, которая живёт в httpOnly-cookie.
 *
 * В полезной нагрузке только `tgId` и срок. Роли здесь нет намеренно: если
 * положить роль в cookie, её придётся инвалидировать при каждом изменении прав,
 * а до тех пор разжалованный модератор остаётся модератором. Роль читается из
 * базы по `tgId` на каждом запросе — это один индексный поиск.
 */

export const SESSION_COOKIE = "dp_session";
export const SESSION_TTL_SEC = 24 * 60 * 60;

export type SessionPayload = { tgId: number; exp: number };

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return timingSafeEqual(bufA, bufB);
}

export function createSession(
  tgId: number,
  secret: string,
  now: Date = new Date(),
): { value: string; maxAge: number } {
  const exp = Math.floor(now.getTime() / 1000) + SESSION_TTL_SEC;
  const payload = b64url(JSON.stringify({ tgId, exp } satisfies SessionPayload));
  return { value: `${payload}.${sign(payload, secret)}`, maxAge: SESSION_TTL_SEC };
}

export function readSession(
  cookie: string | undefined,
  secret: string,
  now: Date = new Date(),
): SessionPayload | null {
  if (!cookie) return null;

  const dot = cookie.indexOf(".");
  if (dot <= 0 || dot === cookie.length - 1) return null;

  const payload = cookie.slice(0, dot);
  const signature = cookie.slice(dot + 1);
  if (!safeEqual(signature, sign(payload, secret))) return null;

  let parsed: SessionPayload;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof parsed?.tgId !== "number" || typeof parsed?.exp !== "number") return null;
  if (parsed.exp <= Math.floor(now.getTime() / 1000)) return null;

  return parsed;
}
