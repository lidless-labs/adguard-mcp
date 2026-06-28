import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";

const Schema = Type.Object({ instance: InstanceArg }, { additionalProperties: false });

const NAME = "adguard_get_stats_config";

export function createAdguardGetStatsConfigTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: get stats config",
    description: "Get statistics settings via GET /control/stats/config.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      const args = raw as { instance?: string };
      const client = getClient(args.instance);
      const config = await client.get("/control/stats/config");
      return jsonToolResult(config);
    },
  };
}
