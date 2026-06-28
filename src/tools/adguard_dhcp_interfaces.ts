import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";

const Schema = Type.Object({ instance: InstanceArg }, { additionalProperties: false });

const NAME = "adguard_dhcp_interfaces";

export function createAdguardDhcpInterfacesTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: dhcp interfaces",
    description: "List network interfaces available to the DHCP server via GET /control/dhcp/interfaces.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      const args = raw as { instance?: string };
      const client = getClient(args.instance);
      const interfaces = await client.get("/control/dhcp/interfaces");
      return jsonToolResult(interfaces);
    },
  };
}
