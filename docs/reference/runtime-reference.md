# ANQR Runtime Reference

> Generated from code and systemd service file truth.
> Last verified: 2025-07-10

## Active Services

### Long-Running Daemons

| Service          | Unit                                      | Port      | Entrypoint                              | Role                                            |
| ---------------- | ----------------------------------------- | --------- | --------------------------------------- | ----------------------------------------------- |
| Symphony Router  | `anqr-symphony-router.service`            | 4319      | `symphony-agent-router.mjs`             | Central dispatch — routes work to executors     |
| Discord Router   | `anqr-discord-router.service`             | 18790     | `discord-request-router.mjs`            | Routes Discord/OpenClaw requests                |
| Linear Webhook   | `anqr-linear-webhook.service`             | 18795†    | `linear-webhook-receiver.mjs`           | Receives Linear webhook events                  |
| Executors (×8)   | `anqr-symphony-executor@{1..8}.service`   | 4321-4328 | `symphony-openai-bridge.mjs`            | AI execution in isolated worktrees              |
| Integrator       | `anqr-symphony-integrator.service`        | —         | `symphony-integrator.mjs daemon`        | Serial promotion to origin/main                 |
| Recovery Daemon  | `anqr-symphony-worktree-recovery.service` | —         | `symphony-worktree-recovery.mjs daemon` | Repairs broken worktree state                   |
| Watchdog         | `anqr-watchdog.service`                   | —         | `bridge-watchdog.mjs`                   | Monitors critical services, restarts on failure |
| Context7 MCP     | `anqr-context7-mcp.service`               | 4320      | `context7-http-service.mjs`             | Library documentation resolution                |
| OpenClaw Gateway | `openclaw-gateway.service`                | 18789     | `openclaw gateway`                      | Discord bot gateway                             |
| LiteLLM Proxy    | `litellm-proxy.service`                   | 4010      | `litellm`                               | Ollama tool-call translator                     |
| Model Injector   | `model-injector-proxy.service`            | 4011      | `model-injector-proxy.py`               | Fixes Codex CLI model=None bug                  |

> † Port overridden via `LINEAR_WEBHOOK_PORT` in the systemd service. Default is `18791` when not overridden.

### Timer-Driven Oneshots

| Service         | Timer                        | Schedule    | Mutating?            | Entrypoint                  |
| --------------- | ---------------------------- | ----------- | -------------------- | --------------------------- |
| Nightly Ops     | `anqr-nightly.timer`         | 02:00 daily | Yes                  | `nightly-ops-pass.mjs`      |
| Linear Export   | `anqr-linear-export.timer`   | 02:30 daily | Yes (writes files)   | `export-issues.mjs`         |
| RAG Rebuild     | `anqr-rag-rebuild.timer`     | 03:00 daily | Yes (writes index)   | `build-index.mjs`           |
| Email Ingest    | `anqr-email-ingest.timer`    | Every 5 min | Yes (creates issues) | `email-ingest.mjs`          |
| Worktree Health | `anqr-worktree-health.timer` | Every 5 min | No (diagnostic)      | `worktree-health.mjs write` |

## Ingress Flows

### Linear Flow

```
Linear (webhook) → linear-webhook-receiver (18795)
  → Symphony Router (4319)
    → Executor wt1-wt4 (4321-4324)
      → AI execution + git commit + push to symphony/wtN
        → Integration Queue
          → Symphony Integrator → origin/main
```

### Discord Flow

```
Discord → OpenClaw Gateway (18789)
  → Discord Router (18790)
    → Symphony Router (4319)
      → Executor wt5-wt8 (4325-4328)
        → AI execution + streaming response
```

## State Management

### Shared State

- **Location:** `$XDG_RUNTIME_DIR/anqr-symphony-state/state.json`
- **Access:** File-level locking with exponential backoff
- **Contains:** Issue records, worktree states, integration queue, leases

### Task Evidence

- **Location:** `$XDG_RUNTIME_DIR/anqr-task-evidence/`
- **Format:** One JSON file per correlation ID
- **Contains:** Full audit trail from ingress to integration

### Durable Control State

- **Location:** `$XDG_RUNTIME_DIR/anqr-durable-state/`
- **Contains:** Webhook dedupe records, session routing, queue entries

## Secret Management

All secrets loaded via `EnvironmentFile=` directives:

- `~/.config/systemd/user/anqr-ops.env` (primary)
- `~/.config/symphony/anqr.env` (secondary/override)

See `docs/secrets-loading.md` for details.

## Watchdog Behavior

The watchdog monitors critical services and takes safe actions:

- **Restart:** Stops and restarts unhealthy services
- **Quarantine:** Records evidence of intervention
- **Report:** Sends Discord alerts and creates Linear incidents
- **No rollback:** Watchdog never performs `git reset --hard`

## Worktree Layout

| Worktree | Path             | Port | Pool    |
| -------- | ---------------- | ---- | ------- |
| wt1      | `~/src/anqr-wt1` | 4321 | Linear  |
| wt2      | `~/src/anqr-wt2` | 4322 | Linear  |
| wt3      | `~/src/anqr-wt3` | 4323 | Linear  |
| wt4      | `~/src/anqr-wt4` | 4324 | Linear  |
| wt5      | `~/src/anqr-wt5` | 4325 | Discord |
| wt6      | `~/src/anqr-wt6` | 4326 | Discord |
| wt7      | `~/src/anqr-wt7` | 4327 | Discord |
| wt8      | `~/src/anqr-wt8` | 4328 | Discord |

Executors push to `origin/symphony/wtN` branches.
Only the integrator pushes to `origin/main`.
