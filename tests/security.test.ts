import { describe, it, expect } from "vitest";
import { redact, registerSecret } from "../src/security.ts";

describe("redact", () => {
  it("masks registered secrets in strings", () => {
    registerSecret("super-secret-password");
    expect(redact("authorization: Basic dXNlcjpzdXBlci1zZWNyZXQtcGFzc3dvcmQ=")).toContain("REDACTED");
    expect(redact("super-secret-password")).toBe("REDACTED");
  });

  it("walks objects deeply", () => {
    registerSecret("hidden-token");
    const result = redact({ headers: { authorization: "Bearer hidden-token" }, ok: true });
    expect(JSON.stringify(result)).not.toContain("hidden-token");
  });

  it("walks arrays", () => {
    registerSecret("array-secret");
    const result = redact([{ token: "array-secret" }, "ok"]);
    expect(JSON.stringify(result)).not.toContain("array-secret");
  });

  it("passes non-strings through unchanged", () => {
    expect(redact(42)).toBe(42);
    expect(redact(null)).toBe(null);
    expect(redact(undefined)).toBe(undefined);
  });

  it("does not mask the empty string", () => {
    registerSecret("");
    expect(redact("anything")).toBe("anything");
  });
});
