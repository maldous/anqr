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
- `scripts/ops/integrations/model/ollama-local-audit.mjs`
- `scripts/ops/integrations/model/codebuff-sdk-runner.mjs` (DEPRECATED, exports shared constants only)
- `scripts/ops/linear-all.mjs` — Fetches all backlog issues from Linear
- `scripts/ops/linear-issue-review.mjs` — One-time issue review and correction
- `scripts/ops/integrations/linear/linear-client.mjs` — Linear API helper library
- `scripts/ops/harness-doctor.mjs` — Runtime diagnostics and health checks
- `scripts/ops/integrations/sonar/sonar-linear-audit.mjs` — Nightly SonarQube to Linear sync
- `scripts/ops/notifications/notify-impl.mjs` — Notification implementation details (path constants)

Restructured copies under subdirectories may exist. The root entrypoints remain the stable operator contract until a deliberate cleanup replaces them.

## Systemd units

Scheduled automation:

- `anqr-symphony-runner.service` / `.timer`
- `anqr-queue-feeder.service` / `.timer`
- `anqr-nightly.service` / `.timer`
- `anqr-email-ingest.service` / `.timer`

Long-running services:

- `anqr-codebuff-bridge.service` — OpenAI-compatible HTTP gateway for Codebuff SDK
- `anqr-symphony-bridge.service` — OpenAI-compatible HTTP gateway for Symphony with AI SDK and tool execution (NEW)

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
- `4319` — Symphony bridge (AI SDK-based with tool execution) [NEW]
- `18789` — OpenClaw gateway (local AI agent, /v1/chat/completions)

Additional port truth must be documented in follow-up runbooks instead of inferred.
