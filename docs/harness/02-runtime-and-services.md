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

Restructured copies under subdirectories may exist. The root entrypoints remain the stable operator contract until a deliberate cleanup replaces them.

## Systemd units

Scheduled automation:

- `anqr-symphony-runner.service` / `.timer`
- `anqr-queue-feeder.service` / `.timer`
- `anqr-nightly.service` / `.timer`
- `anqr-email-ingest.service` / `.timer`

Long-running services:

- `anqr-codebuff-bridge.service` — OpenAI-compatible HTTP gateway for Codebuff SDK

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
- `18789` — OpenClaw gateway (local AI agent, /v1/chat/completions)

Additional port truth must be documented in follow-up runbooks instead of inferred.
