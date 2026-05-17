import { describe, it, expect, afterEach } from "vitest";
import { startFakeAdGuard, FakeAdGuard } from "./fake-adguard.ts";
import { AdGuardClient } from "../src/adguard-client.ts";
import * as toolFactories from "../src/tools/index.ts";

let fake: FakeAdGuard | null = null;
afterEach(async () => { if (fake) await fake.close(); fake = null; });

describe("integration", () => {
  it("all 15 tools register with unique names", () => {
    const dummy = () => new AdGuardClient({ url: "http://x", username: "u", password: "p" });
    const created = [
      toolFactories.createAdguardStatusTool(dummy),
      toolFactories.createAdguardStatsTool(dummy),
      toolFactories.createAdguardQueryLogTool(dummy),
      toolFactories.createAdguardListFilterListsTool(dummy),
      toolFactories.createAdguardListUserRulesTool(dummy),
      toolFactories.createAdguardListClientsTool(dummy),
      toolFactories.createAdguardListBlockedServicesCatalogTool(dummy),
      toolFactories.createAdguardAddUserRuleTool(dummy),
      toolFactories.createAdguardRemoveUserRuleTool(dummy),
      toolFactories.createAdguardAddFilterListTool(dummy),
      toolFactories.createAdguardRemoveFilterListTool(dummy),
      toolFactories.createAdguardToggleFilterListTool(dummy),
      toolFactories.createAdguardSetClientBlockedServicesTool(dummy),
      toolFactories.createAdguardReplaceUserRulesTool(dummy),
      toolFactories.createAdguardToggleProtectionTool(dummy),
    ];
    expect(created).toHaveLength(15);
    const names = created.map((t) => t.name);
    expect(new Set(names).size).toBe(15);
    for (const n of names) expect(n).toMatch(/^adguard_/);
  });

  it("end-to-end: status read + user rule add via the fake server", async () => {
    fake = await startFakeAdGuard([
      { method: "GET", path: "/control/status", status: 200, body: { version: "v0.107.50", protection_enabled: true } },
      { method: "GET", path: "/control/filtering/status", status: 200, body: { user_rules: [] } },
      { method: "POST", path: "/control/filtering/set_rules", status: 200, body: {} },
    ]);
    const mkClient = () => new AdGuardClient({ url: fake!.baseUrl, username: "u", password: "p" });
    const status = toolFactories.createAdguardStatusTool(mkClient);
    const addRule = toolFactories.createAdguardAddUserRuleTool(mkClient);

    const sr = await status.execute("id", {});
    expect(JSON.parse(sr.content[0].text).version).toBe("v0.107.50");

    const ar = await addRule.execute("id", { rule: "@@||t.co^", confirm: true });
    const payload = JSON.parse(ar.content[0].text);
    expect(payload.added).toBe("@@||t.co^");
  });
});
