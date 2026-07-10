import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildDataCheckString, verifyInitData } from "./init-data";

/** Фикстура, не настоящий токен. Формат совпадает с форматом BotFather. */
const BOT_TOKEN = "123456:TEST-TOKEN-NOT-REAL";

const NOW = new Date("2026-07-10T12:00:00Z");

function sign(params: Record<string, string>, token = BOT_TOKEN): string {
  const search = new URLSearchParams(params);
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  const hash = createHmac("sha256", secret)
    .update(buildDataCheckString(search))
    .digest("hex");
  search.set("hash", hash);
  return search.toString();
}

function validParams(overrides: Record<string, string> = {}) {
  return {
    auth_date: String(Math.floor(NOW.getTime() / 1000) - 60),
    query_id: "AAF0deadbeef",
    user: JSON.stringify({ id: 777, first_name: "Пётр-Иван", username: "petr" }),
    ...overrides,
  };
}

describe("verifyInitData", () => {
  it("принимает корректно подписанные данные", () => {
    const result = verifyInitData(sign(validParams()), BOT_TOKEN, NOW);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.user.id).toBe(777);
    expect(result.user.first_name).toBe("Пётр-Иван");
  });

  it("отклоняет подделанный hash", () => {
    const initData = sign(validParams()).replace(
      /hash=[0-9a-f]+/,
      `hash=${"0".repeat(64)}`,
    );

    const result = verifyInitData(initData, BOT_TOKEN, NOW);

    expect(result).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("отклоняет подменённый user.id при валидной в остальном строке", () => {
    // Атака: подписали своим id, подменили на чужой — подпись перестаёт сходиться.
    const signed = new URLSearchParams(sign(validParams()));
    signed.set("user", JSON.stringify({ id: 1, first_name: "Злоумышленник" }));

    const result = verifyInitData(signed.toString(), BOT_TOKEN, NOW);

    expect(result).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("отклоняет данные, подписанные чужим токеном", () => {
    const initData = sign(validParams(), "999999:ANOTHER-BOT-TOKEN");

    const result = verifyInitData(initData, BOT_TOKEN, NOW);

    expect(result).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("отклоняет протухший auth_date даже при верной подписи", () => {
    const yesterday = String(Math.floor(NOW.getTime() / 1000) - 25 * 60 * 60);
    const initData = sign(validParams({ auth_date: yesterday }));

    const result = verifyInitData(initData, BOT_TOKEN, NOW);

    expect(result).toEqual({ ok: false, reason: "expired" });
  });

  it("отклоняет auth_date из будущего", () => {
    const future = String(Math.floor(NOW.getTime() / 1000) + 3600);
    const initData = sign(validParams({ auth_date: future }));

    const result = verifyInitData(initData, BOT_TOKEN, NOW);

    expect(result).toEqual({ ok: false, reason: "expired" });
  });

  it("отклоняет строку без hash", () => {
    const params = new URLSearchParams(validParams());

    const result = verifyInitData(params.toString(), BOT_TOKEN, NOW);

    expect(result).toEqual({ ok: false, reason: "no_hash" });
  });

  it("отклоняет пустую строку", () => {
    expect(verifyInitData("", BOT_TOKEN, NOW)).toEqual({ ok: false, reason: "empty" });
  });

  it("отклоняет подписанные данные без user", () => {
    const params = validParams();
    delete (params as Partial<typeof params>).user;

    const result = verifyInitData(sign(params), BOT_TOKEN, NOW);

    expect(result).toEqual({ ok: false, reason: "no_user" });
  });
});

describe("buildDataCheckString", () => {
  it("сортирует ключи и исключает hash", () => {
    const params = new URLSearchParams({ b: "2", hash: "ff", a: "1" });

    expect(buildDataCheckString(params)).toBe("a=1\nb=2");
  });

  it("берёт раскодированные значения, а не сырые из query", () => {
    const params = new URLSearchParams("user=%7B%22id%22%3A1%7D");

    expect(buildDataCheckString(params)).toBe('user={"id":1}');
  });
});
