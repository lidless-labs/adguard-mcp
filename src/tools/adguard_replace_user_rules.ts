import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertDestructive } from "../gates.ts";

const Schema = Type.Object({
  instance: InstanceArg,
  rules: Type.Array(Type.String(), { description: "Complete replacement set of user rules. Overwrites the existing block." }),
  confirm: Type.Boolean({ description: "Must be true. Tier-3 destructive gate." }),
  destructive: Type.Boolean({ description: "Must be true. Tier-3 destructive gate (overwrites existing rules)." }),
}, { additionalProperties: false });

const NAME = "adguard_replace_user_rules";

export function createAdguardReplaceUserRulesTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: replace user rules",
    description: "Overwrite the entire user-rules block via POST /control/filtering/set_rules. Destroys any rule not in the new set. Tier-3 destructive; requires confirm:true and destructive:true.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertDestructive(raw, NAME);
      const args = raw as { instance?: string; rules: string[] };
      const client = getClient(args.instance);
      await client.post("/control/filtering/set_rules", { rules: args.rules });
      return jsonToolResult({ rules_count: args.rules.length });
    },
  };
}
