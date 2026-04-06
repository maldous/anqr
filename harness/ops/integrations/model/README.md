# ANQR Model Integrations

## 1. Directory Overview

This directory contains model and provider routing, proxy services, and local model health
management for the ANQR (Agentic Number Query Runner) harness. It serves as the integration layer
between the Symphony orchestration system and various AI providers (OpenAI, Ollama, Groq, Mistral,
etc.), handling provider selection, fallback logic, session state management, and adaptive context
handling. It currently contains 24 files and 11 subdirectories.

## 2. File Summaries

### Files

- **codebuff-cwd-isolation.spec.ts** - Regression test validating that `getSharedClient()` keys the shared client by BOTH `costMode` AND `cwd`, preventing cross-worktree isolation leaks.
- **codebuff-direct.mjs** - Exports from `./codebuff-direct/index.mjs`. Provides direct Codebuff SDK integration with shared client caching keyed by costMode AND cwd for worktree isolation.
- **codebuff-sdk-runner.mjs** - DEPRECATED: The direct SDK runner is deprecated. All Codebuff calls now go through the HTTP bridge at http://127.0.0.1:4318. This module now only exports shared path constants (PROJECT_ROOT, REPORTS_DIR).
- **discord-request-router.mjs** - Exports from `./discord-request-router/index.mjs` and `./discord-request-router/runtime.mjs`. Routes Discord requests to appropriate handlers.
- **linear-webhook-receiver.mjs** - Exports from `./linear-webhook-receiver/index.mjs` and `./linear-webhook-receiver/runtime.mjs`. Receives and processes Linear webhook events.
- **litellm-config.yaml** - Local-only LiteLLM alias configuration. Defines model aliases for local Ollama execution path. Routing chain: Ollama -> LiteLLM alias -> model injector -> Symphony runner. Legacy lessons: Ollama must be the default route, max_concurrent_agents: 1, num_thread: 1.
- **model-injector-proxy.py** - Python script that acts as a request normalization proxy between LiteLLM aliases and the Symphony runner. Enforces single-agent execution, provides health check endpoint at /health, and logs all routed requests. Usage: `python3 model-injector-proxy.py [--port 8400]`
- **ollama-local-audit.mjs** - Exports from `./ollama-local-audit/index.mjs` and `./ollama-local-audit/runtime.mjs`. Validates local Ollama deployment health.
- **set-max-listeners.mjs** - Must be the first import in bridge entry points. Sets `process.setMaxListeners(0)` to prevent warnings from AI SDK signal listeners.
- **symphony-adaptive-context.mjs** - Exports from `./symphony-adaptive-context/index.mjs`. Provides dynamic context limit adjustment, error classification (CONTEXT_TOO_LARGE, RATE_LIMITED, AUTH_ERROR, TIMEOUT, SERVER_ERROR, TOOL_HALLUCINATION, UNKNOWN), TPM/RPM sliding-window tracking, rate-limit throttling with backoff, and proactive TPM checks.
- **symphony-adaptive-context.spec.ts** - Comprehensive tests covering dynamic context limits, error classification, rate-limit throttling, token/request tracking, and end-to-end Groq TPM overflow scenario.
- **symphony-agent-router.mjs** - Exports from `./symphony-agent-router/index.mjs` and `./symphony-agent-router/runtime.mjs`. Handles agent routing logic within the Symphony system.
- **symphony-bridge-truncation.mjs** - Exports from `./symphony-bridge-truncation/index.mjs`. Provides context truncation with `validateContextCoherence` function that checks for system messages, role alternation, and truncation markers.
- **symphony-bridge-truncation.spec.ts** - Tests for context coherence validation including system message presence, role alternation, truncation marker detection, and handling of empty messages and array content.
- **symphony-credit-gate.mjs** - Exports from `./symphony-credit-gate/index.mjs`. Implements provider selection with credit gate logic, including provider probing, scoring, ranking, cooldown management, and P0 safety-net fallback to local providers (Ollama).
- **symphony-credit-gate.spec.ts** - Integration tests for credit gate provider selection, metrics, cooldown, probe metrics, P0 safety-net behavior, and the full probe->score->ranking pipeline.
- **symphony-openai-bridge-fallback.spec.ts** - Integration tests for Symphony bridge fallback behavior, error detection, provider fallback configuration, and credit gate integration.
- **symphony-openai-bridge-normalization.spec.ts** - Tests for robust parameter normalization allowing tools to accept arrays, strings, JSON-encoded strings, and objects with path/paths properties.
- **symphony-openai-bridge-routing-edge-cases.spec.ts** - Tests for provider routing edge cases including preferred provider priority, filtering options, failure memory, safety-net activation, and probe response handling.
- **symphony-openai-bridge.d.ts** - TypeScript declaration file providing type definitions for all bridge tools and functions.
- **symphony-openai-bridge.mjs** - Main entry point for the OpenAI-compatible Symphony bridge. Provides tools for file operations (read_files, str_replace, write_file, read_file, list_directory, read_subtree), code search (codeSearchTool, globTool), execution (execTool), memory management, workflow tools (thinkDeeplyTool, updateSubgoalTool, addSubgoalTool, spawnAgentsTool), proposal tools, meta tools, and external APIs (webSearchTool, readDocsTool).
- **symphony-provider-health.mjs** - Exports from `./symphony-provider-health/index.mjs`. Manages provider health states (HEALTHY, DEGRADED, COOLING_DOWN, DISABLED, BLOCKED, UNKNOWN), timeouts, health checks, and cooling-down logic.
- **symphony-session-state.mjs** - Exports from `./symphony-session-state/index.mjs`. Manages session-aware provider tracking, adaptive turn limit tuning, periodic evaluation cycles, codebuff mode detection, and server-side message storage with hash verification.
- **symphony-session-state.spec.ts** - Tests for session provider tracking, cleanup, codebuff mode detection, adaptive turn limits, parameter tuning, evaluation cycle triggering, and message storage.

### Child Directories

- **codebuff-direct/** - This directory contains the direct Codebuff SDK integration for the ANQR (Agentic Number Query Runner) harness.
- **discord-request-router/** - This directory contains the Discord request routing system for the ANQR (Agentic Number Query Runner) harness.
- **linear-webhook-receiver/** - This directory contains the Linear Webhook Receiver for the ANQR (Agentic Number Query Runner) harness.
- **ollama-local-audit/** - This directory contains the Ollama local audit functionality for the ANQR (Agentic Number Query Runner) harness.
- **symphony-adaptive-context/** - This directory contains adaptive context management utilities for the ANQR (Agentic Number Query Runner) Symphony model integrations.
- **symphony-agent-router/** - This directory contains the Symphony Agent Router, which serves as the central routing layer for the ANQR (Agentic Number Query Runner) harness.
- **symphony-bridge-truncation/** - This directory contains message truncation and context management utilities for the ANQR (Agentic Number Query Runner) Symphony bridge.
- **symphony-credit-gate/** - This directory contains the provider credit gate functionality for the ANQR (Agentic Number Query Runner) Symphony orchestration system.
- **symphony-openai-bridge/** - This directory contains the OpenAI bridge implementation for the ANQR (Agentic Number Query Runner) Symphony orchestration system.
- **symphony-provider-health/** - This directory contains provider health monitoring functionality for the ANQR (Agentic Number Query Runner) Symphony orchestration system.
- **symphony-session-state/** - This directory contains the session state management functionality for the ANQR (Agentic Number Query Runner) Symphony orchestration system.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
python3 ops/integrations/model/model-injector-proxy.py
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.
- **Imported packages** - Representative external dependencies referenced here include `vitest`.
- **Python 3** - Required for the Python scripts in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
