# Model

## Purpose

AI execution integration layer that handles ingress transport, bridge hosting, scheduler-aware dispatch, provider routing, context control, session state, and bridge-side health.

## Contents

- 25 immediate files
- 11 child directories

## Key Files

- `codebuff-cwd-isolation.spec.ts` - JavaScript/TypeScript module used by this directory.
- `codebuff-direct.mjs` - JavaScript/TypeScript module used by this directory.
- `codebuff-sdk-runner.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `discord-request-router.mjs` - JavaScript/TypeScript module used by this directory.
- `linear-webhook-receiver.mjs` - JavaScript/TypeScript module used by this directory.
- `litellm-config.yaml` - Support file used by this directory.
- `model-injector-proxy.py` - Python script used by this directory.
- `ollama-local-audit.mjs` - JavaScript/TypeScript module used by this directory.
- `set-max-listeners.mjs` - JavaScript/TypeScript module used by this directory.
- `startup-probe-bootstrap-mode.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-adaptive-context.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-adaptive-context.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-agent-router.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-bridge-truncation.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-bridge-truncation.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-credit-gate.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-credit-gate.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-openai-bridge-fallback.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-openai-bridge-normalization.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-openai-bridge-routing-edge-cases.spec.ts` - JavaScript/TypeScript module used by this directory.
- `symphony-openai-bridge.d.ts` - Type declaration file for the sibling module surface.
- `symphony-openai-bridge.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-provider-health.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-session-state.mjs` - JavaScript/TypeScript module used by this directory.
- `symphony-session-state.spec.ts` - JavaScript/TypeScript module used by this directory.

## Subdirectories

- `codebuff-direct/` - Codebuff Direct scope; immediate files include `build-prompt.mjs`, `codebuff-max-continuations.mjs`, `codebuff-max-steps.mjs`, `codebuff-model-id.mjs`, and others.
- `discord-request-router/` - Discord Request Router scope; immediate files include `evict-expired-sessions.mjs`, `generate-thread-name.mjs`, `get-least-loaded-worktree.mjs`, `get-session-thread-name.mjs`, and others.
- `linear-webhook-receiver/` - Linear Webhook Receiver scope; immediate files include `active-issues.mjs`, `dedup-window-ms.mjs`, `handle-health.mjs`, `handle-webhook.mjs`, and others.
- `ollama-local-audit/` - Ollama Local Audit scope; immediate files include `check-model-available.mjs`, `check-model-responds.mjs`, `check-reachable.mjs`, `index.mjs`, and others.
- `symphony-adaptive-context/` - Symphony Adaptive Context scope; immediate files include `classify-error.mjs`, `context-expand-factor.mjs`, `context-expand-threshold.mjs`, `context-initial-buffer.mjs`, and others.
- `symphony-agent-router/` - Symphony Agent Router scope; immediate files include `dispatch-linear-execution.mjs`, `global-active-requests.mjs`, `handle-linear-queue.mjs`, `handle-linear-trigger.mjs`, and others; child directories include `select-linear-worktree/`.
- `symphony-bridge-truncation/` - Symphony Bridge Truncation scope; immediate files include `build-dynamic-catalog-limits.mjs`, `build-provider-max-input-tokens.mjs`, `chars-per-token.mjs`, `default-max-input-tokens.mjs`, and others.
- `symphony-credit-gate/` - Symphony Credit Gate scope; immediate files include `acquire-provider-lease.mjs`, `build-dynamic-catalog-providers.mjs`, `build-provider-probe-failure-breakdown.mjs`, `build-provider-probe-markdown.mjs`, and others; child directories include `calculate-provider-score/`, `enrich-provider-context-sizes/`, `get-provider-bootstrap-score/`.
- `symphony-openai-bridge/` - Symphony Openai Bridge scope; immediate files include `active-requests.mjs`, `add-message-tool.mjs`, `add-subgoal-tool.mjs`, `additional-tokens.mjs`, and others; child directories include `build-selection-options/`, `handle-responses-api/`.
- `symphony-provider-health/` - Symphony Provider Health scope; immediate files include `get-provider-health-state.mjs`, `health-state-file.mjs`, `health-states.mjs`, `index.mjs`, and others.
- `symphony-session-state/` - Symphony Session State scope; immediate files include `adaptive-params-file.mjs`, `cleanup-expired-sessions.mjs`, `clear-session-messages.mjs`, `clear-session-provider.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 25 immediate file(s) and 11 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.
