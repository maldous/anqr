# Model

## Purpose

Directory for Discord ingress, delivery, or notification support; immediate files include `codebuff-cwd-isolation.spec.ts`, `codebuff-direct.mjs`, `codebuff-sdk-runner.mjs`, `discord-request-router.mjs`, and others, with child directories `codebuff-direct/`, `discord-request-router/`, `linear-webhook-receiver/`, `ollama-local-audit/`, and others.

## Contents

- 25 immediate files
- 11 child directories

## Key Files

- `codebuff-cwd-isolation.spec.ts` - \*
- `codebuff-direct.mjs` - JavaScript/TypeScript module used by this directory.
- `codebuff-sdk-runner.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `discord-request-router.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-webhook-receiver.mjs` - JavaScript/TypeScript module used by this directory.
- `litellm-config.yaml` - Support file used by this directory.
- `model-injector-proxy.py` - Python script used by this directory.
- `ollama-local-audit.mjs` - JavaScript/TypeScript module used by this directory.
- `set-max-listeners.mjs` - Must be the first import in bridge entry points.
- `startup-probe-bootstrap-mode.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-adaptive-context.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-adaptive-context.spec.ts` - \*
- `symphony-agent-router.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-bridge-truncation.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-bridge-truncation.spec.ts` - @ts-ignore - No type declarations for .mjs module
- `symphony-credit-gate.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-credit-gate.spec.ts` - \*
- `symphony-openai-bridge-fallback.spec.ts` - \*
- `symphony-openai-bridge-normalization.spec.ts` - \*
- `symphony-openai-bridge-routing-edge-cases.spec.ts` - Virtual file system for node:fs mock — tracks writes so reads return stored data
- `symphony-openai-bridge.d.ts` - Type declaration file for the sibling module surface.
- `symphony-openai-bridge.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-provider-health.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-session-state.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-session-state.spec.ts` - \*

## Subdirectories

- `codebuff-direct/` - Directory for operator tooling and diagnostics; immediate files include `build-prompt.mjs`, `codebuff-max-continuations.mjs`, `codebuff-max-steps.mjs`, `codebuff-model-id.mjs`, and others.
- `discord-request-router/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `evict-expired-sessions.mjs`, `generate-thread-name.mjs`, `get-least-loaded-worktree.mjs`, `get-session-thread-name.mjs`, and others.
- `linear-webhook-receiver/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `active-issues.mjs`, `dedup-window-ms.mjs`, `handle-health.mjs`, `handle-webhook.mjs`, and others.
- `ollama-local-audit/` - Directory for runtime service bootstrap or environment support; immediate files include `check-model-available.mjs`, `check-model-responds.mjs`, `check-reachable.mjs`, `index.mjs`, and others.
- `symphony-adaptive-context/` - Directory for operator tooling and diagnostics; immediate files include `classify-error.mjs`, `context-expand-factor.mjs`, `context-expand-threshold.mjs`, `context-initial-buffer.mjs`, and others.
- `symphony-agent-router/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `dispatch-linear-execution.mjs`, `global-active-requests.mjs`, `handle-linear-queue.mjs`, `handle-linear-trigger.mjs`, and others, with child directories `select-linear-worktree/`.
- `symphony-bridge-truncation/` - Directory for operator tooling and diagnostics; immediate files include `build-dynamic-catalog-limits.mjs`, `build-provider-max-input-tokens.mjs`, `chars-per-token.mjs`, `default-max-input-tokens.mjs`, and others.
- `symphony-credit-gate/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `acquire-provider-lease.mjs`, `build-dynamic-catalog-providers.mjs`, `build-provider-probe-failure-breakdown.mjs`, `build-provider-probe-markdown.mjs`, and others, with child directories `calculate-provider-score/`, `enrich-provider-context-sizes/`, `get-provider-bootstrap-score/`.
- `symphony-openai-bridge/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `active-requests.mjs`, `add-message-tool.mjs`, `add-subgoal-tool.mjs`, `additional-tokens.mjs`, and others, with child directories `build-selection-options/`, `handle-responses-api/`.
- `symphony-provider-health/` - Directory for harness support logic; immediate files include `get-provider-health-state.mjs`, `health-state-file.mjs`, `health-states.mjs`, `index.mjs`, and others.
- `symphony-session-state/` - Directory for harness support logic; immediate files include `adaptive-params-file.mjs`, `cleanup-expired-sessions.mjs`, `clear-session-messages.mjs`, `clear-session-provider.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 25 immediate files and 11 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
