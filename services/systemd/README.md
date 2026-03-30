# Systemd contract

Keep operator entrypoints stable. Prefer top-level harness shims until the final cleanup phase so service files do not churn unnecessarily.

All services run as **user services** (`systemctl --user`), not system services.

## Install

```bash
cp services/systemd/*.service ~/.config/systemd/user/
cp services/systemd/*.timer ~/.config/systemd/user/
cp services/systemd/anqr-ops.env ~/.config/systemd/user/
systemctl --user daemon-reload
```

## Long-running services

| Service                        | Port | Purpose                                                                 |
| ------------------------------ | ---- | ----------------------------------------------------------------------- |
| `anqr-symphony-bridge.service` | 4319 | OpenAI-compatible HTTP gateway with AI SDK and tool execution           |
| `anqr-codebuff-bridge.service` | 4318 | OpenAI-compatible HTTP gateway for Codebuff SDK                         |
| `anqr-context7-mcp.service`    | 4320 | Context7 MCP documentation service (HTTP wrapper over local MCP server) |
| `anqr-discord-router.service`  | 18790 | Discord/OpenClaw request router for worktrees `wt5`-`wt8`              |
| `anqr-watchdog.service`        | —    | Symphony/Codebuff bridge health monitoring                              |

## Scheduled automation (timers)

| Timer                        | Schedule    | Service                        | Purpose                              |
| ---------------------------- | ----------- | ------------------------------ | ------------------------------------ |
| `anqr-symphony-runner@.timer` | Periodic   | `anqr-symphony-runner@.service` | Canonical concurrent Symphony runners in worktrees |
| `anqr-symphony-runner.timer` | Periodic    | `anqr-symphony-runner.service` | Legacy single-runner fallback        |
| `anqr-queue-feeder.timer`    | Periodic    | `anqr-queue-feeder.service`    | Queue maintenance and backup feed    |
| `anqr-nightly.timer`         | 02:00 daily | `anqr-nightly.service`         | Full nightly operations pass         |
| `anqr-rag-rebuild.timer`     | 03:00 daily | `anqr-rag-rebuild.service`     | Rebuild RAG vector index (full repo) |
| `anqr-rag-rebuild-linear.timer` | 02:45 daily | `anqr-rag-rebuild-linear.service` | Rebuild Linear RAG index after export |
| `anqr-email-ingest.timer`    | Periodic    | `anqr-email-ingest.service`    | Process inbound operational emails   |

## Shared environment

- `services/systemd/anqr-ops.env` — template with all env vars
- `~/.config/systemd/user/anqr-ops.env` — installed copy with real secrets

Important bridge/runtime defaults now carried in env:

- `CODEX_SANDBOX_MODE=danger-full-access`
- `ANQR_RETRIEVAL_WARMUP=true`

## Useful commands

```bash
# List all ANQR timers
systemctl --user list-timers | grep anqr

# Check service status
systemctl --user status anqr-symphony-bridge

# View logs
journalctl --user -u anqr-rag-rebuild -f

# Manual RAG rebuild
systemctl --user start anqr-rag-rebuild

# Canonical runner status
node scripts/ops/orchestration/symphony-control.mjs --status
```

## CRITICAL: Service restart procedure

**Before restarting any bridge service (`symphony-bridge`, `codebuff-bridge`):**

1. **STOP task execution FIRST:**
   ```bash
   node scripts/ops/orchestration/symphony-control.mjs --stop
   ```

2. **Wait for zero concurrency:**
   ```bash
   node scripts/ops/orchestration/symphony-runner.mjs --status
   ```
   Check Discord for "(0 concurrent)" confirmation

3. **Commit and push:**
   ```bash
   git add -A && git commit -m "..." && git push
   ```

4. **Restart service:**
   ```bash
   systemctl --user restart anqr-symphony-bridge
   # OR
   systemctl --user restart anqr-codebuff-bridge
   ```

5. **RESTART task execution:**
   ```bash
   node scripts/ops/orchestration/symphony-control.mjs --start
   ```

6. **Update MEMORY.md** and commit

**Skipping steps 1 or 5 will cause data loss or leave the system permanently disabled.**

## Runtime posture

- `anqr-symphony-runner@.service` / `@.timer` is the canonical execution path.
- `anqr-symphony-runner.service` / `.timer` remains only as a legacy single-runner fallback.
- `anqr-queue-feeder.timer` is not the primary feeder; it is a maintenance and backup-feed loop.
- `anqr-context7-mcp.service` and the RAG rebuild timers are part of the native local-context fast path for Codex, OpenClaw, and Symphony-routed agents.
