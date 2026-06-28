import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";

const Schema = Type.Object({ instance: InstanceArg }, { additionalProperties: false });

const NAME = "adguard_get_rewrite_settings";

export function createAdguardGetRewriteSettingsTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: get rewrite settings",
    description: "Get DNS rewrite enabled state via GET /control/rewrite/settings.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      const args = raw as { instance?: string };
      const client = getClient(args.instance);
      const settings = await client.get("/control/rewrite/settings");
      return jsonToolResult(settings);
    },
  };
}
