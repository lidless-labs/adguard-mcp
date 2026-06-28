import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertConfirmedWrite } from "../gates.ts";

const Schema = Type.Object({
  instance: InstanceArg,
  domain: Type.String({ description: "Domain name to rewrite, e.g. router.home.arpa." }),
  answer: Type.String({ description: "A, AAAA, or CNAME answer value." }),
  enabled: Type.Optional(Type.Boolean({ description: "Whether the rewrite is enabled. Defaults to AGH's default true when omitted." })),
  confirm: Type.Boolean({ description: "Must be true. Tier-2 safe-write gate." }),
}, { additionalProperties: false });

const NAME = "adguard_add_rewrite";

export function createAdguardAddRewriteTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: add rewrite",
    description: "Add a DNS rewrite rule via POST /control/rewrite/add. Tier-2 write; requires confirm:true.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertConfirmedWrite(raw, NAME);
      const args = raw as { instance?: string; domain: string; answer: string; enabled?: boolean };
      const body: Record<string, unknown> = { domain: args.domain, answer: args.answer };
      if (args.enabled !== undefined) body.enabled = args.enabled;
      const client = getClient(args.instance);
      await client.post("/control/rewrite/add", body);
      return jsonToolResult({ added: true, domain: args.domain, answer: args.answer });
    },
  };
}
