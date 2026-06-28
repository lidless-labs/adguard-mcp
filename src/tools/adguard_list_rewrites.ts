import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";

const Schema = Type.Object({ instance: InstanceArg }, { additionalProperties: false });

const NAME = "adguard_list_rewrites";

export function createAdguardListRewritesTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: list rewrites",
    description: "List DNS rewrite rules via GET /control/rewrite/list.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      const args = raw as { instance?: string };
      const client = getClient(args.instance);
      const rewrites = await client.get("/control/rewrite/list");
      return jsonToolResult(rewrites);
    },
  };
}
