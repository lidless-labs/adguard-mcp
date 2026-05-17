import { describe, it, expect, afterEach } from "vitest";
import { startFakeAdGuard, FakeAdGuard } from "../fake-adguard.ts";
import { AdGuardClient } from "../../src/adguard-client.ts";
import { createAdguardReplaceUserRulesTool } from "../../src/tools/adguard_replace_user_rules.ts";
import { createAdguardToggleProtectionTool } from "../../src/tools/adguard_toggle_protection.ts";
import { WriteGateError } from "../../src/gates.ts";

let fake: FakeAdGuard | null = null;
afterEach(async () => { if (fake) await fake.close(); fake = null; });
const mk = (f: FakeAdGuard) => () => new AdGuardClient({ url: f.baseUrl, username: "u", password: "p" });

describe("adguard_replace_user_rules", () => {
  it("refuses without confirm + destructive", async () => {
    const tool = createAdguardReplaceUserRulesTool(() => new AdGuardClient({ url: "http://x", username: "u", password: "p" }));
    await expect(tool.execute("id", { rules: [] })).rejects.toThrow(WriteGateError);
    await expect(tool.execute("id", { rules: [], confirm: true })).rejects.toThrow(WriteGateError);
    await expect(tool.execute("id", { rules: [], destructive: true })).rejects.toThrow(WriteGateError);
  });

  it("posts the new rule set when fully confirmed", async () => {
    fake = await startFakeAdGuard([{ method: "POST", path: "/control/filtering/set_rules", status: 200, body: {} }]);
    const tool = createAdguardReplaceUserRulesTool(mk(fake));
    const r = await tool.execute("id", { rules: ["@@||t.co^"], confirm: true, destructive: true });
    const payload = JSON.parse(r.content[0].text);
    expect(payload.rules_count).toBe(1);
    expect(JSON.parse(fake.requests[0].body)).toEqual({ rules: ["@@||t.co^"] });
  });
});

describe("adguard_toggle_protection", () => {
  it("refuses without confirm + destructive", async () => {
    const tool = createAdguardToggleProtectionTool(() => new AdGuardClient({ url: "http://x", username: "u", password: "p" }));
    await expect(tool.execute("id", { enabled: false })).rejects.toThrow(WriteGateError);
    await expect(tool.execute("id", { enabled: false, confirm: true })).rejects.toThrow(WriteGateError);
  });

  it("posts to /control/protection when fully confirmed", async () => {
    fake = await startFakeAdGuard([{ method: "POST", path: "/control/protection", status: 200, body: {} }]);
    const tool = createAdguardToggleProtectionTool(mk(fake));
    const r = await tool.execute("id", { enabled: false, confirm: true, destructive: true });
    const payload = JSON.parse(r.content[0].text);
    expect(payload.enabled).toBe(false);
    expect(JSON.parse(fake.requests[0].body)).toEqual({ enabled: false });
  });
});
