# Runtime And Services

This document defines the maintained harness/runtime surfaces.

## Canonical runtime roots

- `scripts/ops/*`
- `services/systemd/*`

## Maintained scripts

Control loop:

- `scripts/ops/harness-report.mjs`
- `scripts/ops/linear-guardian.mjs`
- `scripts/ops/symphony-queue-control.mjs`
- `scripts/ops/symphony-runner.mjs`
- `scripts/ops/symphony-agent.mjs`
- `scripts/ops/nightly-ops-pass.mjs`

Integrations and support:

- `scripts/ops/email-ingest.mjs`
- `scripts/ops/lib/notify.mjs`
- `scripts/ops/sonar-linear-mail.mjs`
- `scripts/ops/symphony-credit-gate.mjs`
- `scripts/ops/integrations/model/codebuff-openai-bridge.mjs`
- `scripts/ops/integrations/model/symphony-openai-bridge.mjs` — AI SDK-based bridge with tool execution
- `scripts/ops/integrations/model/symphony-adaptive-context.mjs` — dynamic per-provider token ceilings and rate management
- `scripts/ops/integrations/model/symphony-bridge-truncation.mjs` — static token limits and message truncation
- `scripts/ops/integrations/model/ollama-local-audit.mjs`
- `scripts/ops/integrations/model/codebuff-sdk-runner.mjs` (DEPRECATED, exports shared constants only)
- `scripts/ops/linear-all.mjs` — Fetches all backlog issues from Linear
- `scripts/ops/linear-issue-review.mjs` — One-time issue review and correction
- `scripts/ops/integrations/linear/linear-client.mjs` — Linear API helper library
- `scripts/ops/harness-doctor.mjs` — Runtime diagnostics and health checks
- `scripts/ops/integrations/sonar/sonar-linear-audit.mjs` — Nightly SonarQube to Linear sync
- `scripts/ops/notifications/notify-impl.mjs` — Notification implementation details (path constants)

RAG pipeline and search:

- `scripts/ops/lib/rag/chunker.mjs` — Semantic code/document chunker (function/class/heading boundaries)
- `scripts/ops/lib/rag/embeddings.mjs` — Ollama embedding generation (`qwen2.5-coder:3b-instruct`)
- `scripts/ops/lib/rag/vector-store.mjs` — File-based vector store in `reports/rag-index/` with incremental indexing
- `scripts/ops/lib/rag/build-index.mjs` — Full-repo RAG index builder using `git ls-files` (respects .gitignore)
- `scripts/ops/lib/search/hybrid-search.mjs` — BM25 + semantic search with Reciprocal Rank Fusion (RRF)

MCP runtime:

- `scripts/ops/runtime/mcp/context7-server.mjs` — Local Context7 MCP server wrapper (JSON-RPC over stdio)
- `scripts/ops/runtime/mcp/context7-http-service.mjs` — HTTP service wrapping Context7 MCP (port 4320)

Restructured copies under subdirectories may exist. The root entrypoints remain the stable operator contract until a deliberate cleanup replaces them.

## Systemd units

Scheduled automation:

- `anqr-symphony-runner.service` / `.timer`
- `anqr-queue-feeder.service` / `.timer`
- `anqr-nightly.service` / `.timer` — 02:00 daily
- `anqr-rag-rebuild.service` / `.timer` — 03:00 daily, full-repo RAG vector index rebuild via Ollama embeddings
- `anqr-email-ingest.service` / `.timer`

Long-running services:

- `anqr-codebuff-bridge.service` — OpenAI-compatible HTTP gateway for Codebuff SDK
- `anqr-symphony-bridge.service` — OpenAI-compatible HTTP gateway for Symphony with AI SDK and tool execution
- `anqr-context7-mcp.service` — Context7 MCP documentation service (HTTP on port 4320)

**CRITICAL: Before restarting any bridge service:**

1. **STOP task execution**: `node scripts/ops/orchestration/symphony-control.mjs --stop`
2. **Wait for zero concurrency**: Check `symphony-runner.mjs --status` and Discord for "(0 concurrent)"
3. **Restart service**: `systemctl --user restart <service-name>`
4. **RESTART task execution**: `node scripts/ops/orchestration/symphony-control.mjs --start`

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

- `4318` — Codebuff bridge (OpenAI-compatible HTTP gateway)
- `4319` — Symphony bridge (AI SDK-based with tool execution)
- `4320` — Context7 MCP documentation service (POST /v1/resolve-docs, GET /health)
- `18789` — OpenClaw gateway (local AI agent, /v1/chat/completions)

Additional port truth must be documented in follow-up runbooks instead of inferred.
