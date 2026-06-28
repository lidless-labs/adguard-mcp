import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";

const Schema = Type.Object({ instance: InstanceArg }, { additionalProperties: false });

const NAME = "adguard_tls_status";

export function createAdguardTlsStatusTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: tls status",
    description: "Get TLS configuration and validation status via GET /control/tls/status. Private key values are redacted from tool output.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      const args = raw as { instance?: string };
      const client = getClient(args.instance);
      const status = await client.get("/control/tls/status");
      return jsonToolResult(redactTlsSecrets(status));
    },
  };
}

export function redactTlsSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactTlsSecrets);
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    out[key] = key === "private_key" ? "[REDACTED]" : redactTlsSecrets(entry);
  }
  return out;
}
