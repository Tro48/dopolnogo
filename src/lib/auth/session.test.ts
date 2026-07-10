import { describe, expect, it } from "vitest";
import { createSession, readSession, SESSION_TTL_SEC } from "./session";

const SECRET = "test-session-secret-at-least-32-bytes-long";
const NOW = new Date("2026-07-10T12:00:00Z");

describe("сессия", () => {
  it("читает то, что записала", () => {
    const { value } = createSession(777, SECRET, NOW);

    expect(readSession(value, SECRET, NOW)).toMatchObject({ tgId: 777 });
  });

  it("отклоняет подменённый payload", () => {
    const { value } = createSession(777, SECRET, NOW);
    const forged = Buffer.from(JSON.stringify({ tgId: 1, exp: 2 ** 31 }), "utf8")
      .toString("base64url")
      .concat(".", value.split(".")[1]!);

    expect(readSession(forged, SECRET, NOW)).toBeNull();
  });

  it("отклоняет подпись чужим секретом", () => {
    const { value } = createSession(777, "another-secret-also-32-bytes-long-x", NOW);

    expect(readSession(value, SECRET, NOW)).toBeNull();
  });

  it("отклоняет протухшую сессию", () => {
    const { value } = createSession(777, SECRET, NOW);
    const later = new Date(NOW.getTime() + (SESSION_TTL_SEC + 1) * 1000);

    expect(readSession(value, SECRET, later)).toBeNull();
  });

  it("отклоняет мусор и пустоту", () => {
    expect(readSession(undefined, SECRET, NOW)).toBeNull();
    expect(readSession("", SECRET, NOW)).toBeNull();
    expect(readSession("no-dot", SECRET, NOW)).toBeNull();
    expect(readSession(".sig", SECRET, NOW)).toBeNull();
    expect(readSession("payload.", SECRET, NOW)).toBeNull();
  });
});
