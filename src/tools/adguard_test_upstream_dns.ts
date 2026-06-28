import { Type } from "@sinclair/typebox";
import type { ClientFactory } from "./_util.ts";
import { InstanceArg, jsonToolResult } from "./_util.ts";
import { assertConfirmedWrite } from "../gates.ts";

const Schema = Type.Object({
  instance: InstanceArg,
  bootstrap_dns: Type.Array(Type.String(), { description: "Bootstrap DNS servers, port optional." }),
  upstream_dns: Type.Array(Type.String(), { description: "Upstream DNS servers to test, port optional." }),
  fallback_dns: Type.Optional(Type.Array(Type.String(), { description: "Fallback DNS servers to test, port optional." })),
  private_upstream: Type.Optional(Type.Array(Type.String(), { description: "Local PTR resolvers to test, port optional." })),
  confirm: Type.Boolean({ description: "Must be true. Tier-2 gate because the AGH server will probe the provided upstreams." }),
}, { additionalProperties: false });

const NAME = "adguard_test_upstream_dns";

export function createAdguardTestUpstreamDnsTool(getClient: ClientFactory) {
  return {
    name: NAME,
    label: "adguard: test upstream dns",
    description: "Test upstream DNS server configuration via POST /control/test_upstream_dns. Tier-2 gated because it causes the AGH server to probe the provided upstreams.",
    parameters: Schema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      assertConfirmedWrite(raw, NAME);
      const args = raw as {
        instance?: string;
        bootstrap_dns: string[];
        upstream_dns: string[];
        fallback_dns?: string[];
        private_upstream?: string[];
      };
      const body: Record<string, unknown> = {
        bootstrap_dns: args.bootstrap_dns,
        upstream_dns: args.upstream_dns,
      };
      if (args.fallback_dns !== undefined) body.fallback_dns = args.fallback_dns;
      if (args.private_upstream !== undefined) body.private_upstream = args.private_upstream;
      const client = getClient(args.instance);
      const result = await client.post("/control/test_upstream_dns", body);
      return jsonToolResult(result);
    },
  };
}
