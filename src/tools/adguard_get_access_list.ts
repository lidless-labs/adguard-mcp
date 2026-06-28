import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";

const Schema = Type.Object({ instance: InstanceArg }, { additionalProperties: false });

const NAME = "adguard_get_access_list";

export function createAdguardGetAccessListTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: get access list",
    description: "Get allowed clients, disallowed clients, and blocked hosts via GET /control/access/list.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      const args = raw as { instance?: string };
      const client = getClient(args.instance);
      const list = await client.get("/control/access/list");
      return jsonToolResult(list);
    },
  };
}
