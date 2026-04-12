# Runtime And Services

This document defines the maintained harness/runtime surfaces.

## Canonical runtime roots

- `harness/ops/*`
- `services/systemd/*`

## Maintained scripts

Control loop:

- `harness/ops/harness-report.mjs`
- `harness/ops/linear-guardian.mjs`
- `harness/ops/symphony-queue-control.mjs`
- `harness/ops/symphony-runner.mjs` — compatibility shim to `harness/ops/orchestration/symphony-runner.mjs`
- `harness/ops/symphony-agent.mjs`
- `harness/ops/nightly-ops-pass.mjs`

Integrations and support:

- `harness/ops/email-ingest.mjs`
- `harness/ops/lib/notify.mjs`
- `harness/ops/sonar-linear-mail.mjs`
- `harness/ops/symphony-credit-gate.mjs`
- `harness/ops/integrations/model/symphony-openai-bridge.mjs` — AI SDK-based bridge with tool execution
- `harness/ops/integrations/model/codebuff-direct.mjs` — Codebuff SDK execution (runs inside each worktree-local bridge)
- `harness/ops/integrations/model/symphony-agent-router.mjs` — Control-plane router for worktree-local bridges
- `harness/ops/integrations/model/symphony-adaptive-context.mjs` — dynamic per-provider token ceilings and rate management
- `harness/ops/integrations/model/symphony-bridge-truncation.mjs` — static token limits and message truncation
- `harness/ops/integrations/model/ollama-local-audit.mjs`
- `harness/ops/integrations/model/codebuff-sdk-runner.mjs` (DEPRECATED, exports shared constants only)
- `harness/ops/linear-all.mjs` — Fetches all backlog issues from Linear
- `harness/ops/linear-issue-review.mjs` — One-time issue review and correction
- `harness/ops/integrations/linear/linear-client.mjs` — Linear API helper library
- `harness/ops/harness-doctor.mjs` — Runtime diagnostics and health checks
- `harness/ops/integrations/sonar/sonar-linear-audit.mjs` — Nightly SonarQube to Linear sync
- `harness/ops/notifications/notify-impl.mjs` — Notification implementation details (path constants)

RAG pipeline and search:

- `harness/ops/lib/rag/chunker.mjs` — Semantic code/document chunker (function/class/heading boundaries)
- `harness/ops/lib/rag/embeddings.mjs` — Ollama embedding generation (`qwen2.5-coder:3b-instruct`)
- `harness/ops/lib/rag/vector-store.mjs` — File-based vector store in `reports/rag-index/` with incremental indexing
- `harness/ops/lib/rag/build-index.mjs` — Full-repo RAG index builder using `git ls-files` (respects .gitignore)
- `harness/ops/lib/search/hybrid-search.mjs` — BM25 + semantic search with Reciprocal Rank Fusion (RRF)

MCP runtime:

- `harness/ops/runtime/mcp/context7-server.mjs` — Local Context7 MCP server wrapper (JSON-RPC over stdio)
- `harness/ops/runtime/mcp/context7-http-service.mjs` — HTTP service wrapping Context7 MCP (port 4320)

Restructured copies under subdirectories may exist. The root entrypoints remain the stable operator contract until a deliberate cleanup replaces them.

## Systemd units

Scheduled automation:

- `anqr-linear-webhook.service` — Linear webhook receiver (event-driven ingress)
- `anqr-linear-reconciler.service` — Level-triggered Linear backlog reconciliation
- `anqr-nightly.service` / `.timer` — 02:00 daily
- `anqr-rag-rebuild.service` / `.timer` — 03:00 daily, full-repo RAG vector index rebuild via Ollama embeddings
- `anqr-email-ingest.service` / `.timer`

Long-running services:

- `anqr-symphony-router.service` — Global Symphony orchestration (control plane, port 4319)
- `anqr-symphony-executor@.service` — Worktree-local Symphony executors (ports 4321-4328)
- `anqr-discord-router.service` — Discord request load balancer (port 18790)
- `anqr-context7-mcp.service` — Context7 MCP documentation service (HTTP on port 4320)
- `anqr-watchdog.service` — Health monitoring

Note: Codebuff is a provider used by executors, not a standalone service (per ADR-0003).

**CRITICAL: Before restarting any bridge service:**

1. **STOP task execution**: `node harness/ops/orchestration/symphony-control.mjs --stop`
2. **Wait for zero concurrency**: Check `symphony-runner.mjs --status` and Discord for "(0 concurrent)"
3. **Restart service**: `systemctl --user restart <service-name>`
4. **RESTART task execution**: `node harness/ops/orchestration/symphony-control.mjs --start`

Skipping steps 1 or 4 will cause data loss or leave the system permanently disabled.

Shared environment:

- `services/systemd/anqr-ops.env`
- `~/.config/systemd/user/anqr-ops.env` after bootstrap install

## Local bootstrap expectations

Required local locations:

- project `.env`
- `~/.config/symphony/anqr.env`
- `~/.config/systemd/user/anqr-ops.env`
- `~/.ssh/*` keys and config when repository access requires them

Optional local support:

- mail configs in the user home directory
- mobile signing material

## Port expectations

- product runtime ports belong to `apps/web`, Netlify, and mobile if later claimed
- harness runtime ports are operator-only and may be absent on reduced developer machines

Documented harness ports:

- `4319` — Symphony agent router (control-plane entrypoint)
- `4320` — Context7 MCP documentation service (POST /v1/resolve-docs, GET /health)
- `4321`-`4328` — Worktree-local Symphony execution bridges (wt1-wt8)
- `18789` — OpenClaw gateway (local AI agent, /v1/chat/completions)
- `18790` — Discord router (load-balances Discord requests to worktree bridges)

Additional port truth must be documented in follow-up runbooks instead of inferred.

## Current runtime notes

- Queue maintenance is split deliberately:
  - runner instances self-feed after issue completion
  - `anqr-linear-reconciler.service` runs every 90 seconds as the level-triggered safety net
- Queue feed and drain decisions use `readyDepth` (Todo-only depth), not aggregate queue depth including `In Progress`
- The orchestration runner now requires worktree context; the main repository is control-plane and service-host territory, not the canonical execution working tree
