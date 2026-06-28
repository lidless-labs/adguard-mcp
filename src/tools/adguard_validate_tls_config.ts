import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertConfirmedWrite } from "../gates.ts";
import { redactTlsSecrets } from "./adguard_tls_status.ts";

const Schema = Type.Object({
  instance: InstanceArg,
  config: Type.Object({}, { additionalProperties: true, description: "TLS config body for POST /control/tls/validate. May include certificate_chain/private_key or file paths." }),
  confirm: Type.Boolean({ description: "Must be true. Tier-2 gate because TLS validation may include sensitive key material." }),
}, { additionalProperties: false });

const NAME = "adguard_validate_tls_config";

export function createAdguardValidateTlsConfigTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: validate tls config",
    description: "Validate a TLS config via POST /control/tls/validate without applying it. Tier-2 gated because the request can carry certificate/key material; private key values are redacted from tool output.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertConfirmedWrite(raw, NAME);
      const args = raw as { instance?: string; config: Record<string, unknown> };
      const client = getClient(args.instance);
      const result = await client.post("/control/tls/validate", args.config);
      return jsonToolResult(redactTlsSecrets(result));
    },
  };
}
