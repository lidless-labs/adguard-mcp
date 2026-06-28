import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";

const Schema = Type.Object({ instance: InstanceArg }, { additionalProperties: false });

const NAME = "adguard_dhcp_status";

export function createAdguardDhcpStatusTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: dhcp status",
    description: "Get DHCP server settings, leases, and status via GET /control/dhcp/status.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      const args = raw as { instance?: string };
      const client = getClient(args.instance);
      const status = await client.get("/control/dhcp/status");
      return jsonToolResult(status);
    },
  };
}
