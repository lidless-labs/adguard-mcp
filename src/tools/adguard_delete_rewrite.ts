import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertConfirmedWrite } from "../gates.ts";

const Schema = Type.Object({
  instance: InstanceArg,
  domain: Type.String({ description: "Domain name of the rewrite to delete." }),
  answer: Type.String({ description: "Answer value of the rewrite to delete." }),
  enabled: Type.Optional(Type.Boolean({ description: "Enabled state, when needed to identify the exact rewrite." })),
  confirm: Type.Boolean({ description: "Must be true. Tier-2 safe-write gate." }),
}, { additionalProperties: false });

const NAME = "adguard_delete_rewrite";

export function createAdguardDeleteRewriteTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: delete rewrite",
    description: "Delete a DNS rewrite rule via POST /control/rewrite/delete. Tier-2 write; requires confirm:true.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertConfirmedWrite(raw, NAME);
      const args = raw as { instance?: string; domain: string; answer: string; enabled?: boolean };
      const body: Record<string, unknown> = { domain: args.domain, answer: args.answer };
      if (args.enabled !== undefined) body.enabled = args.enabled;
      const client = getClient(args.instance);
      await client.post("/control/rewrite/delete", body);
      return jsonToolResult({ deleted: true, domain: args.domain, answer: args.answer });
    },
  };
}
