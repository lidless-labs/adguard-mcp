import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";

const Schema = Type.Object({ instance: InstanceArg }, { additionalProperties: false });

const NAME = "adguard_get_querylog_config";

export function createAdguardGetQuerylogConfigTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: get query log config",
    description: "Get query log settings via GET /control/querylog/config.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      const args = raw as { instance?: string };
      const client = getClient(args.instance);
      const config = await client.get("/control/querylog/config");
      return jsonToolResult(config);
    },
  };
}
