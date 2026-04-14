# Ops

## Purpose

Canonical operational runtime tree for the ANQR harness, covering shared state, ingress, orchestration, execution, recovery, notifications, evidence, and operator tooling.

## Contents

- 26 immediate files
- 13 child directories

<<<<<<< ours — heading `Key Files` (S+F, confidence: low)
// hint: Structural and logic conflict. Both design and behavior differ.

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
- `sonar-group-issues.mjs` - JavaScript/TypeScript module used by this directory.
- `sonar-linear-audit.mjs` - JavaScript/TypeScript module used by this directory.
- `sonar-linear-mail.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-agent.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-config.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-credit-gate.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-queue-control.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-scheduler.mjs` - Re-export facade that assembles the public surface for this directory.
- `symphony-state.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-validation.mjs` - JavaScript/TypeScript module used by this directory.
- `sync-worktrees.mjs` - JavaScript/TypeScript module used by this directory.

=======

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

> > > > > > > theirs — heading `Key Files` (S+F, confidence: low)

## Subdirectories

- `core/` - Core scope; immediate files include `bridge-result.mjs`, `bridge-result.spec.ts`, `discord-source.mjs`, `linear-worktree-health-states.mjs`, and others; child directories include `bridge-result/`, `discord-source/`, `symphony-state/`, `symphony-validation/`, and others.
- `governance/` - Governance scope; immediate files include `linear-guardian.mjs`; child directories include `linear-guardian/`.
- `harness-doctor/` - Harness Doctor scope; immediate files include `check-credit-gate.mjs`, `check-env-vars.mjs`, `check-harness-config.mjs`, `check-node-modules.mjs`, and others.
- `integrations/` - Integrations scope; child directories include `email/`, `linear/`, `model/`, `notifications/`, and others.
- `lib/` - Lib scope; immediate files include `correlation-id.mjs`, `durable-kv.mjs`, `logger.mjs`, `logger.spec.ts`, and others; child directories include `correlation-id/`, `durable-kv/`, `logger/`, `notify/`, and others.
- `linear-all/` - Linear All scope; immediate files include `api-key.mjs`, `fetch-page.mjs`, `index.mjs`, `is-main.mjs`, and others.
- `notifications/` - Notifications scope; immediate files include `notify.mjs`; child directories include `notify/`.
- `orchestration/` - Orchestration scope; immediate files include `analyze-worktree-benchmark.mjs`, `latency-report.mjs`, `nightly-ops-pass.mjs`, `reset-queue.mjs`, and others; child directories include `analyze-worktree-benchmark/`, `latency-report/`, `linear-reconciler/`, `nightly-ops-pass/`, and others.
- `reporting/` - Reporting scope; immediate files include `harness-report.mjs`; child directories include `harness-report/`.
- `runtime/` - Runtime scope; child directories include `discord/`, `mcp/`, `openclaw-config/`, `symphony/`, and others.
- `symphony/` - Symphony scope; immediate files include `WORKFLOW.md`.
- `tools/` - Tools scope; immediate files include `recover-stale-in-progress.mjs`, `reset-retry-exhausted.mjs`, `startup-recovery.mjs`, `verify-webhook-system.mjs`; child directories include `linear-status/`, `recover-stale-in-progress/`, `startup-recovery/`, `verify-webhook-system/`.
- `types/` - Types scope; immediate files include `mjs-shim.d.ts`.

## Operational Notes

- This is the main maintained implementation surface for the harness.
- The current architecture depends on this tree for scheduler authority, worktree execution, provider routing, integration, and recovery behavior.

## Review Focus

Trace whether scheduler authority, execution ownership, state persistence, integration, and recovery are cleanly separated across the subtrees here.
