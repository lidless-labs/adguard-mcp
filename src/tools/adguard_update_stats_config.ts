import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertConfirmedWrite } from "../gates.ts";

const Schema = Type.Object({
  instance: InstanceArg,
  config: Type.Object({}, { additionalProperties: true, description: "Stats config body for PUT /control/stats/config/update." }),
  confirm: Type.Boolean({ description: "Must be true. Tier-2 safe-write gate." }),
}, { additionalProperties: false });

const NAME = "adguard_update_stats_config";

export function createAdguardUpdateStatsConfigTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: update stats config",
    description: "Update statistics settings via PUT /control/stats/config/update. Pass the AGH config fields inside `config`. Tier-2 write; requires confirm:true.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertConfirmedWrite(raw, NAME);
      const args = raw as { instance?: string; config: Record<string, unknown> };
      const client = getClient(args.instance);
      await client.put("/control/stats/config/update", args.config);
      return jsonToolResult({ updated: true, config: args.config });
    },
  };
}
