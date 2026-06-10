# Repository Guidance

## Definition of Done
Before reporting any code change as complete, run:
```
./scripts/verify
```
It runs `npm run typecheck`, `npm test`, and `npm run build`. Report the actual
results, paste failures verbatim, and never claim success you did not observe.

## Project Shape
- TypeScript MCP server for AdGuard Home and AdGuardHome Sync. It exposes 33 tools across read, safe-write, and destructive tiers.
- `mcp-server.ts` is the stdio MCP entry point. `index.ts` is the OpenClaw plugin entry point. Both must register tools through `buildAllTools()` in `src/tools/index.ts`.
- Tool implementations live one per file under `src/tools/`. When adding or removing a tool, update the explicit import/export list in `src/tools/index.ts`; it is the canonical registration list.

## Hard Prohibitions
- A pre-push hook exists (`hooks/pre-push`, wired via `core.hooksPath`). Never push with `--no-verify`. If the hook blocks, fix the flagged content or add the documented inline allow tag, then push normally.
- Never weaken, skip, or delete failing tests, and never weaken or remove the tier gates (`assertConfirmedWrite`, `assertDestructive`) to make something pass. Fix the code instead.
- Never invent npm scripts, tool names, endpoints, or API facts. Verify against `package.json`, `src/tools/index.ts`, and the code before citing them.
- When blocked, report the exact blocker (command, full error output) and stop. Do not work around it silently.

## Safety Rules: Tier Gates
- Adding or editing a Tier-2 write tool: it must call `assertConfirmedWrite(raw, NAME)` before any network request. Tier-3 destructive tools must call `assertDestructive(raw, NAME)` before any network request. Reads need no gate.
- Building a request body: never forward `instance`, `confirm`, `destructive`, or future gate-only fields to AdGuard Home request bodies. Strip them first.
- Touching credentials: keep credential handling in `src/security.ts` and register any derived secret forms, especially Basic auth header values, before serving tools.

## Safety Rules: Live Services
- Testing or reviewing any tool: never run it against a real AdGuard Home instance. Use the vitest suite with mocked fetch instead. Only run live operations when the user explicitly asks for one by name.
- `adguard_sync_run` pushes origin config to all replicas (Tier-2). `adguard_sync_clear_logs` deletes Sync logs (Tier-3). Never invoke either against a live Sync instance unless the user explicitly requests that exact operation.

## AdGuard API Gotchas
- `adguard_update_client` must send the nested body `{ name, data }`; it is not a flat merge.
- `adguard_set_blocked_services` uses `PUT /control/blocked_services/update`.
- `adguard_clear_query_log` uses `POST /control/querylog_clear`.
- `adguard_reset_stats` uses `POST /control/stats_reset`.
- Weekly blocked-service schedules use milliseconds from midnight. User-facing tools may accept `HH:MM` and convert with `hhmmToMs()`.

## AdGuardHome Sync API Gotchas
- Sync config uses `ADGUARDHOME_SYNC_URL` plus optional `ADGUARDHOME_SYNC_USERNAME/PASSWORD`. `ADGUARD_SYNC_URL/USERNAME/PASSWORD` is an accepted alias reserved for Sync, not for an AdGuard Home instance named `sync`.
- `/healthz` is unauthenticated upstream; check it with `HEAD`.
- Authenticated API routes are `/api/v1/status`, `/api/v1/logs`, `/api/v1/sync`, and `/api/v1/clear-logs` when Sync has API credentials configured.

## Verification Details
- `./scripts/verify` is the unconditional gate. Targeted iteration while developing:
  - `npm test -- tests/<specific>.test.ts` for one change.
  - `npm run typecheck` for API or type changes.
- Touching packaging or entry points: also run `npm pack --dry-run`. Expected payload is small and limited to `dist`, `openclaw.plugin.json`, `README.md`, `LICENSE`, and `package.json`.

## Documentation
- Changing tools: keep README tool counts and tier lists in sync with `buildAllTools()`.
- Docs in `docs/` are design context; when they drift, the code and tests are the source of truth.

## Memory Handoff
After any substantial task that produced durable knowledge, write a handoff to
`.claude/memory-handoffs/` using its `TEMPLATE.md`. If the template is missing,
run `brigade handoff-template` and write the output there first.
