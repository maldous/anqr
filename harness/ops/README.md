# Ops

## Purpose

Canonical operational runtime tree for the ANQR harness, covering state, orchestration, integrations, runtime services, notifications, tooling, and evidence generation.

## Contents

- 25 immediate files
- 13 child directories

## Key Files

- `email-ingest.mjs` - JavaScript/TypeScript module used by this directory.
- `harness-doctor.mjs` - JavaScript/TypeScript module used by this directory.
- `harness-report.mjs` - JavaScript/TypeScript module used by this directory.
- `issue_hygiene.py` - Python script used by this directory.
- `linear-all.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-client.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-guardian.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-reconciler.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-status.mjs` - JavaScript/TypeScript module used by this directory.
- `model-injector-proxy.py` - Python script used by this directory.
- `nightly-ops-pass.mjs` - JavaScript/TypeScript module used by this directory.
- `notify.mjs` - JavaScript/TypeScript module used by this directory.
- `ollama-local-audit.mjs` - JavaScript/TypeScript module used by this directory.
- `provider-probe-report.mjs` - JavaScript/TypeScript module used by this directory.
- `self-healing-automation.sh` - Shell script used by this directory.
- `sonar-group-issues.mjs` - Group by rule
- `sonar-linear-audit.mjs` - JavaScript/TypeScript module used by this directory.
- `sonar-linear-mail.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-agent.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-config.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-credit-gate.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-queue-control.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-state.mjs` - v2: also exports setFinalizationState, getFinalizationState, enqueueIntegrationCandidate,
- `symphony-validation.mjs` - JavaScript/TypeScript module used by this directory.
- `sync-worktrees.mjs` - \*

## Subdirectories

- `core/` - Directory for Discord ingress, delivery, or notification support; immediate files include `bridge-result.mjs`, `bridge-result.spec.ts`, `discord-source.mjs`, `linear-worktree-health-states.mjs`, and others, with child directories `bridge-result/`, `discord-source/`, `symphony-state/`, `symphony-validation/`, and others.
- `governance/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `linear-guardian.mjs`, with child directories `linear-guardian/`.
- `harness-doctor/` - Directory for systemd topology and host runtime configuration; immediate files include `check-credit-gate.mjs`, `check-env-vars.mjs`, `check-harness-config.mjs`, `check-node-modules.mjs`, and others.
- `integrations/` - Directory for harness support logic, with child directories `email/`, `linear/`, `model/`, `notifications/`, and others.
- `lib/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `correlation-id.mjs`, `durable-kv.mjs`, `logger.mjs`, `logger.spec.ts`, and others, with child directories `correlation-id/`, `durable-kv/`, `logger/`, `notify/`, and others.
- `linear-all/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `api-key.mjs`, `fetch-page.mjs`, `index.mjs`, `is-main.mjs`, and others.
- `notifications/` - Directory for notifications and operator feedback; immediate files include `notify.mjs`, with child directories `notify/`.
- `orchestration/` - Directory for serial integration back into the main repository; immediate files include `analyze-worktree-benchmark.mjs`, `latency-report.mjs`, `nightly-ops-pass.mjs`, `reset-queue.mjs`, and others, with child directories `analyze-worktree-benchmark/`, `latency-report/`, `linear-reconciler/`, `nightly-ops-pass/`, and others.
- `reporting/` - Directory for harness support logic; immediate files include `harness-report.mjs`, with child directories `harness-report/`.
- `runtime/` - Directory for runtime service bootstrap or environment support, with child directories `discord/`, `mcp/`, `openclaw-config/`, `symphony/`, and others.
- `symphony/` - Directory for harness support logic; immediate files include `WORKFLOW.md`.
- `tools/` - Directory for fleet recovery, quarantine, and health enforcement; immediate files include `recover-stale-in-progress.mjs`, `reset-retry-exhausted.mjs`, `startup-recovery.mjs`, `verify-webhook-system.mjs`, with child directories `linear-status/`, `recover-stale-in-progress/`, `startup-recovery/`, `verify-webhook-system/`.
- `types/` - Directory for harness support logic; immediate files include `mjs-shim.d.ts`.

## Operational Notes

- This directory is the main maintained implementation surface for the harness.
- The concurrency design depends on worktree isolation, state files, systemd service topology, and router-to-executor boundaries implemented under this tree.

## Review Focus

Trace whether scheduler authority, execution ownership, state persistence, and evidence publication are cleanly separated across `core/`, `integrations/`, `orchestration/`, and `runtime/`.
