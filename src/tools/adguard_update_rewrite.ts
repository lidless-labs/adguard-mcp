import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertConfirmedWrite } from "../gates.ts";

const RewriteEntrySchema = Type.Object({
  domain: Type.String({ description: "Domain name." }),
  answer: Type.String({ description: "A, AAAA, or CNAME answer value." }),
  enabled: Type.Optional(Type.Boolean({ description: "Whether this rewrite is enabled." })),
}, { additionalProperties: false });

const Schema = Type.Object({
  instance: InstanceArg,
  target: RewriteEntrySchema,
  update: RewriteEntrySchema,
  confirm: Type.Boolean({ description: "Must be true. Tier-2 safe-write gate." }),
}, { additionalProperties: false });

const NAME = "adguard_update_rewrite";

export function createAdguardUpdateRewriteTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: update rewrite",
    description: "Update a DNS rewrite rule via PUT /control/rewrite/update with {target, update}. Tier-2 write; requires confirm:true.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertConfirmedWrite(raw, NAME);
      const args = raw as { instance?: string; target: Record<string, unknown>; update: Record<string, unknown> };
      const client = getClient(args.instance);
      await client.put("/control/rewrite/update", { target: args.target, update: args.update });
      return jsonToolResult({ updated: true, target: args.target, update: args.update });
    },
  };
}
