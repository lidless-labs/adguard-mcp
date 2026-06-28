import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertConfirmedWrite } from "../gates.ts";

const Schema = Type.Object({
  instance: InstanceArg,
  allowed_clients: Type.Array(Type.String(), { description: "Allowlist of clients: IP addresses, CIDRs, or ClientIDs. Empty array disables the allowlist." }),
  disallowed_clients: Type.Array(Type.String(), { description: "Blocklist of clients: IP addresses, CIDRs, or ClientIDs." }),
  blocked_hosts: Type.Array(Type.String(), { description: "Blocklist of hostnames." }),
  confirm: Type.Boolean({ description: "Must be true. Tier-2 safe-write gate." }),
}, { additionalProperties: false });

const NAME = "adguard_set_access_list";

export function createAdguardSetAccessListTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: set access list",
    description: "Replace allowed clients, disallowed clients, and blocked hosts via POST /control/access/set. Tier-2 write; requires confirm:true.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertConfirmedWrite(raw, NAME);
      const args = raw as { instance?: string; allowed_clients: string[]; disallowed_clients: string[]; blocked_hosts: string[] };
      const body = {
        allowed_clients: args.allowed_clients,
        disallowed_clients: args.disallowed_clients,
        blocked_hosts: args.blocked_hosts,
      };
      const client = getClient(args.instance);
      await client.post("/control/access/set", body);
      return jsonToolResult({ updated: true, ...body });
    },
  };
}
