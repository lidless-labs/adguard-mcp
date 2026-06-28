import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertConfirmedWrite } from "../gates.ts";

const Schema = Type.Object({
  instance: InstanceArg,
  enabled: Type.Boolean({ description: "Target DNS rewrite enabled state." }),
  confirm: Type.Boolean({ description: "Must be true. Tier-2 safe-write gate." }),
}, { additionalProperties: false });

const NAME = "adguard_toggle_rewrites";

export function createAdguardToggleRewritesTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: toggle rewrites",
    description: "Enable or disable DNS rewrites via PUT /control/rewrite/settings/update. Tier-2 write; requires confirm:true.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertConfirmedWrite(raw, NAME);
      const args = raw as { instance?: string; enabled: boolean };
      const client = getClient(args.instance);
      await client.put("/control/rewrite/settings/update", { enabled: args.enabled });
      return jsonToolResult({ updated: true, enabled: args.enabled });
    },
  };
}
