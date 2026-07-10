import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Проверка `initData`, которую Telegram отдаёт Mini App.
 *
 * Клиент присылает эту строку сам, поэтому доверять ей нельзя, пока не сошлась
 * подпись. Схема из документации Telegram:
 *
 *   secret = HMAC_SHA256(key = "WebAppData", message = BOT_TOKEN)
 *   hash   = HMAC_SHA256(key = secret,      message = data_check_string)
 *
 * где `data_check_string` — все пары `key=value`, кроме `hash`, отсортированные
 * по ключу и склеенные через `\n`.
 *
 * Отдельно проверяется `auth_date`: без него однажды перехваченный `initData`
 * работает вечно.
 */

/** Окно жизни `initData`. Рекомендация Telegram — не больше суток. */
export const MAX_AUTH_AGE_SEC = 24 * 60 * 60;

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type InitDataResult =
  | { ok: true; user: TelegramUser; authDate: Date }
  | { ok: false; reason: InitDataError };

export type InitDataError =
  "empty" | "no_hash" | "bad_signature" | "no_auth_date" | "expired" | "no_user";

/**
 * Собирает `data_check_string`. Отдельная чистая функция, потому что именно её
 * проще всего написать неправильно: забыть исключить `hash`, не отсортировать
 * ключи или взять уже раскодированные значения.
 */
export function buildDataCheckString(params: URLSearchParams): string {
  return [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function hmac(key: string | Buffer, message: string): Buffer {
  return createHmac("sha256", key).update(message).digest();
}

/** Сравнение в постоянном времени. `===` на подписях протекает по таймингу. */
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyInitData(
  initData: string,
  botToken: string,
  now: Date = new Date(),
): InitDataResult {
  if (!initData) return { ok: false, reason: "empty" };

  const params = new URLSearchParams(initData);

  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "no_hash" };

  const secret = hmac("WebAppData", botToken);
  const expected = hmac(secret, buildDataCheckString(params)).toString("hex");
  if (!safeEqualHex(hash, expected)) return { ok: false, reason: "bad_signature" };

  const authDateRaw = params.get("auth_date");
  if (!authDateRaw) return { ok: false, reason: "no_auth_date" };

  const authDateSec = Number(authDateRaw);
  if (!Number.isFinite(authDateSec)) return { ok: false, reason: "no_auth_date" };

  const ageSec = Math.floor(now.getTime() / 1000) - authDateSec;
  if (ageSec > MAX_AUTH_AGE_SEC || ageSec < -60) {
    return { ok: false, reason: "expired" };
  }

  const userRaw = params.get("user");
  if (!userRaw) return { ok: false, reason: "no_user" };

  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw) as TelegramUser;
  } catch {
    return { ok: false, reason: "no_user" };
  }
  if (typeof user?.id !== "number") return { ok: false, reason: "no_user" };

  return { ok: true, user, authDate: new Date(authDateSec * 1000) };
}
