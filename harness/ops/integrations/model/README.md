# ANQR Model Integrations

## 1. Directory Overview

This directory implements **ANQR Model Integrations** within the ANQR harness. Key immediate entries include `symphony-openai-bridge-routing-edge-cases.spec.ts`, `symphony-openai-bridge-normalization.spec.ts`, `symphony-adaptive-context.spec.ts`, `symphony-session-state.spec.ts`. Linear issue execution now routes through the worktree executor HTTP surface instead of spawning legacy runner entrypoints. The current inventory is 24 non-README files and 11 subdirectories.

## 2. File Summaries

### Files

- **codebuff-cwd-isolation.spec.ts** - Module that implements codebuff cwd isolation.spec.
- **codebuff-direct.mjs** - Facade module that re-exports public members from `./codebuff-direct/index.mjs`.
- **codebuff-sdk-runner.mjs** - Exports `PROJECT_ROOT`, `REPORTS_DIR`, providing the reusable API for this directory concern.
- **discord-request-router.mjs** - Facade module that re-exports public members from `./discord-request-router/index.mjs`, `./discord-request-router/runtime.mjs`.
- **linear-webhook-receiver.mjs** - Facade module that re-exports public members from `./linear-webhook-receiver/index.mjs`, `./linear-webhook-receiver/runtime.mjs`.
- **litellm-config.yaml** - YAML configuration file used by adjacent runtime or tooling modules.
- **model-injector-proxy.py** - Python script defining `log()`, `check_ollama_health()`, `log_message()`, `_send_json()`, `do_GET()`, `do_POST()`.
- **ollama-local-audit.mjs** - Facade module that re-exports public members from `./ollama-local-audit/index.mjs`, `./ollama-local-audit/runtime.mjs`.
- **set-max-listeners.mjs** - Module that implements set max listeners.
- **symphony-adaptive-context.mjs** - Facade module that re-exports public members from `./symphony-adaptive-context/index.mjs`.
- **symphony-adaptive-context.spec.ts** - Module that implements symphony adaptive context.spec.
- **symphony-agent-router.mjs** - Facade module that re-exports public members from `./symphony-agent-router/index.mjs`, `./symphony-agent-router/runtime.mjs`.
- **symphony-bridge-truncation.mjs** - Facade module that re-exports public members from `./symphony-bridge-truncation/index.mjs`.
- **symphony-bridge-truncation.spec.ts** - Module that implements symphony bridge truncation.spec.
- **symphony-credit-gate.mjs** - Facade module that re-exports public members from `./symphony-credit-gate/index.mjs`.
- **symphony-credit-gate.spec.ts** - Module that implements symphony credit gate.spec.
- **symphony-openai-bridge-fallback.spec.ts** - Module that implements symphony openai bridge fallback.spec.
- **symphony-openai-bridge-normalization.spec.ts** - Module that implements symphony openai bridge normalization.spec.
- **symphony-openai-bridge-routing-edge-cases.spec.ts** - Module that implements symphony openai bridge routing edge cases.spec.
- **symphony-openai-bridge.d.ts** - Module that implements symphony openai bridge.d.
- **symphony-openai-bridge.mjs** - Facade module that re-exports public members from `./symphony-openai-bridge/index.mjs`, `./symphony-openai-bridge/runtime.mjs`.
- **symphony-provider-health.mjs** - Facade module that re-exports public members from `./symphony-provider-health/index.mjs`.
- **symphony-session-state.mjs** - Facade module that re-exports public members from `./symphony-session-state/index.mjs`.
- **symphony-session-state.spec.ts** - Module that implements symphony session state.spec.

### Subdirectories

- **codebuff-direct/** - Contains **ANQR Codebuff Direct**; it contains 27 immediate files and has 0 child directories.
- **discord-request-router/** - Contains **ANQR Discord Request Router**; it contains 22 immediate files and has 0 child directories.
- **linear-webhook-receiver/** - Contains **ANQR Linear Webhook Receiver**; it contains 16 immediate files and has 0 child directories.
- **ollama-local-audit/** - Contains **ANQR Ollama Local Audit**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **symphony-adaptive-context/** - Contains **ANQR Symphony Adaptive Context**; it contains 48 immediate files and has 0 child directories.
- **symphony-agent-router/** - Contains **ANQR Symphony Agent Router**; it contains 24 immediate files and has 0 child directories.
- **symphony-bridge-truncation/** - Contains **ANQR Symphony Bridge Truncation**; it contains 19 immediate files and has 0 child directories.
- **symphony-credit-gate/** - Contains **ANQR Symphony Credit Gate**; it contains 154 immediate files and has 0 child directories.
- **symphony-openai-bridge/** - Contains **ANQR Symphony OpenAI Bridge**; it contains 185 immediate files and has 0 child directories.
- **symphony-provider-health/** - Contains **ANQR Symphony Provider Health**; it contains 13 immediate files and has 0 child directories.
- **symphony-session-state/** - Contains **ANQR Symphony Session State**; it contains 34 immediate files and has 0 child directories.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Discord integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
npx tsx ops/integrations/model/codebuff-cwd-isolation.spec.ts
python3 ops/integrations/model/model-injector-proxy.py
npx tsx ops/integrations/model/symphony-adaptive-context.spec.ts
npx tsx ops/integrations/model/symphony-bridge-truncation.spec.ts
npx tsx ops/integrations/model/symphony-credit-gate.spec.ts
npx tsx ops/integrations/model/symphony-openai-bridge-fallback.spec.ts
npx tsx ops/integrations/model/symphony-openai-bridge-normalization.spec.ts
npx tsx ops/integrations/model/symphony-openai-bridge-routing-edge-cases.spec.ts
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:path`, `node:url`
- **External packages/services referenced in immediate code** - `vitest`, `zod`
- **Internal relative modules** - `./codebuff-direct/index.mjs`, `./discord-request-router/index.mjs`, `./discord-request-router/runtime.mjs`, `./linear-webhook-receiver/index.mjs`, `./linear-webhook-receiver/runtime.mjs`, `./ollama-local-audit/index.mjs`, `./ollama-local-audit/runtime.mjs`, `./symphony-adaptive-context/index.mjs`, `./symphony-agent-router/index.mjs`, `./symphony-agent-router/runtime.mjs`, `./symphony-bridge-truncation.mjs`, `./symphony-bridge-truncation/index.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
