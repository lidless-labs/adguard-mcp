import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertDestructive } from "../gates.ts";

const Schema = Type.Object({
  instance: InstanceArg,
  enabled: Type.Boolean({ description: "Target global filtering state (false disables ALL blocking on this instance)." }),
  confirm: Type.Boolean({ description: "Must be true. Tier-3 destructive gate." }),
  destructive: Type.Boolean({ description: "Must be true. Tier-3 destructive gate (toggling off removes all blocking)." }),
}, { additionalProperties: false });

const NAME = "adguard_toggle_protection";

export function createAdguardToggleProtectionTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: toggle protection",
    description: "Enable or disable global AdGuard filtering via POST /control/protection. Tier-3 destructive (disabling stops ALL blocking); requires confirm:true and destructive:true.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertDestructive(raw, NAME);
      const args = raw as { instance?: string; enabled: boolean };
      const client = getClient(args.instance);
      await client.post("/control/protection", { enabled: args.enabled });
      return jsonToolResult({ enabled: args.enabled });
    },
  };
}
