# ANQR Model Integrations

## 1. Directory Overview

This directory contains model and provider routing, proxy services, and local model health management for the ANQR (Agentic Number Query Runner) harness. It serves as the integration layer between the Symphony orchestration system and various AI providers (OpenAI, Ollama, Groq, Mistral, etc.), handling provider selection, fallback logic, session state management, and adaptive context handling.

The directory follows a decomposition pattern where original monolithic files have been split into sibling modules, with facade files (ending in `.mjs`) re-exporting from matching directories containing `index.mjs` and `runtime.mjs` modules.

## 2. File Summaries

### Facade Modules (Auto-Generated)

These are auto-generated facade files that re-export from sibling modules under matching directories:

- **symphony-openai-bridge.mjs** - Main entry point for the OpenAI-compatible Symphony bridge. Provides tools for file operations (read_files, str_replace, write_file, read_file, list_directory, read_subtree), code search (codeSearchTool, globTool), execution (execTool), memory management, workflow tools (thinkDeeplyTool, updateSubgoalTool, addSubgoalTool, spawnAgentsTool), proposal tools, meta tools, and external APIs (webSearchTool, readDocsTool).

- **symphony-adaptive-context.mjs** - Exports from `./symphony-adaptive-context/index.mjs`. Provides dynamic context limit adjustment, error classification (CONTEXT_TOO_LARGE, RATE_LIMITED, AUTH_ERROR, TIMEOUT, SERVER_ERROR, TOOL_HALLUCINATION, UNKNOWN), TPM/RPM sliding-window tracking, rate-limit throttling with backoff, and proactive TPM checks.

- **symphony-agent-router.mjs** - Exports from `./symphony-agent-router/index.mjs` and `./symphony-agent-router/runtime.mjs`. Handles agent routing logic within the Symphony system.

- **symphony-credit-gate.mjs** - Exports from `./symphony-credit-gate/index.mjs`. Implements provider selection with credit gate logic, including provider probing, scoring, ranking, cooldown management, and P0 safety-net fallback to local providers (Ollama).

- **discord-request-router.mjs** - Exports from `./discord-request-router/index.mjs` and `./discord-request-router/runtime.mjs`. Routes Discord requests to appropriate handlers.

- **codebuff-sdk-runner.mjs** - DEPRECATED: The direct SDK runner is deprecated. All Codebuff calls now go through the HTTP bridge at http://127.0.0.1:4318. This module now only exports shared path constants (PROJECT_ROOT, REPORTS_DIR).

- **symphony-provider-health.mjs** - Exports from `./symphony-provider-health/index.mjs`. Manages provider health states (HEALTHY, DEGRADED, COOLING_DOWN, DISABLED, BLOCKED, UNKNOWN), timeouts, health checks, and cooling-down logic.

- **ollama-local-audit.mjs** - Exports from `./ollama-local-audit/index.mjs` and `./ollama-local-audit/runtime.mjs`. Validates local Ollama deployment health.

- **linear-webhook-receiver.mjs** - Exports from `./linear-webhook-receiver/index.mjs` and `./linear-webhook-receiver/runtime.mjs`. Receives and processes Linear webhook events.

- **symphony-session-state.mjs** - Exports from `./symphony-session-state/index.mjs`. Manages session-aware provider tracking, adaptive turn limit tuning, periodic evaluation cycles, codebuff mode detection, and server-side message storage with hash verification.

- **symphony-bridge-truncation.mjs** - Exports from `./symphony-bridge-truncation/index.mjs`. Provides context truncation with `validateContextCoherence` function that checks for system messages, role alternation, and truncation markers.

- **codebuff-direct.mjs** - Exports from `./codebuff-direct/index.mjs`. Provides direct Codebuff SDK integration with shared client caching keyed by costMode AND cwd for worktree isolation.

### Utility Scripts

- **model-injector-proxy.py** - Python script that acts as a request normalization proxy between LiteLLM aliases and the Symphony runner. Enforces single-agent execution, provides health check endpoint at /health, and logs all routed requests. Usage: `python3 model-injector-proxy.py [--port 8400]`

- **set-max-listeners.mjs** - Must be the first import in bridge entry points. Sets `process.setMaxListeners(0)` to prevent warnings from AI SDK signal listeners.

- **litellm-config.yaml** - Local-only LiteLLM alias configuration. Defines model aliases for local Ollama execution path. Routing chain: Ollama -> LiteLLM alias -> model injector -> Symphony runner. Legacy lessons: Ollama must be the default route, max_concurrent_agents: 1, num_thread: 1.

### Configuration Files

- **symphony-openai-bridge.d.ts** - TypeScript declaration file providing type definitions for all bridge tools and functions.

### Test Files

- **symphony-bridge-truncation.spec.ts** - Tests for context coherence validation including system message presence, role alternation, truncation marker detection, and handling of empty messages and array content.

- **symphony-adaptive-context.spec.ts** - Comprehensive tests covering dynamic context limits, error classification, rate-limit throttling, token/request tracking, and end-to-end Groq TPM overflow scenario.

- **symphony-openai-bridge-routing-edge-cases.spec.ts** - Tests for provider routing edge cases including preferred provider priority, filtering options, failure memory, safety-net activation, and probe response handling.

- **codebuff-cwd-isolation.spec.ts** - Regression test validating that `getSharedClient()` keys the shared client by BOTH `costMode` AND `cwd`, preventing cross-worktree isolation leaks.

- **symphony-openai-bridge-fallback.spec.ts** - Integration tests for Symphony bridge fallback behavior, error detection, provider fallback configuration, and credit gate integration.

- **ollama-local-audit.spec.ts** - Tests for Ollama local deployment validation.

- **symphony-session-state.spec.ts** - Tests for session provider tracking, cleanup, codebuff mode detection, adaptive turn limits, parameter tuning, evaluation cycle triggering, and message storage.

- **symphony-credit-gate.spec.ts** - Integration tests for credit gate provider selection, metrics, cooldown, probe metrics, P0 safety-net behavior, and the full probe->score->ranking pipeline.

- **symphony-openai-bridge-normalization.spec.ts** - Tests for robust parameter normalization allowing tools to accept arrays, strings, JSON-encoded strings, and objects with path/paths properties.

## 3. Overall Directory Function

This directory serves as the model integration layer for the ANQR harness. The files work together to provide:

- **Provider Routing**: symphony-credit-gate.mjs handles intelligent provider selection with probing, scoring, and P0 safety-net fallback to ensure `selectProvider` never causes total outage.

- **Context Management**: symphony-adaptive-context.mjs provides dynamic context limits that shrink on errors and expand on successes, along with TPM/RPM tracking and rate-limit throttling.

- **Bridge Execution**: symphony-openai-bridge.mjs provides the OpenAI-compatible API with all tools (file operations, code search, execution, memory, workflow, meta tools).

- **Session State**: symphony-session-state.mjs tracks provider stickiness per session, tunes adaptive turn limits, and manages server-side message storage.

- **Health Monitoring**: symphony-provider-health.mjs tracks provider health states and manages cooling-down periods after failures.

- **Local Fallback**: model-injector-proxy.py and litellm-config.yaml provide the local Ollama safety-net path.

- **Context Truncation**: symphony-bridge-truncation.mjs ensures context coherence before sending to providers.

Key architectural decisions:
- P0 Safety-Net: When all cloud providers fail or are excluded, the system falls back to local Ollama providers regardless of allowedNames/excludeNames filters
- Adaptive Context: Dynamic limits shrink on CONTEXT_TOO_LARGE errors and expand after consecutive successes
- Separation of Probe Metrics: Probe selections/successes/failures are tracked separately from runtime metrics
- Codebuff Isolation: Shared CodebuffClient is keyed by (costMode, cwd) to prevent cross-worktree contamination

## 4. Usage Instructions

### Running the Bridge

```bash
# Start the Symphony OpenAI bridge
node ops/integrations/model/symphony-openai-bridge.mjs

# Or via the runtime wrapper
node ops/integrations/model/symphony-openai-bridge/runtime.mjs
```

### Running Model Injector Proxy

```bash
# Start the proxy (default port 8400)
python3 ops/integrations/model/model-injector-proxy.py

# Custom port
python3 ops/integrations/model/model-injector-proxy.py --port 9000

# Set custom Ollama backend
OLLAMA_API_BASE=http://localhost:11434 python3 ops/integrations/model/model-injector-proxy.py
```

### Provider Selection

```javascript
import { selectProvider, recordProviderSuccess, recordProviderMetrics } from "./symphony-credit-gate.mjs";

// Select a provider
const provider = await selectProvider({ allowedNames: null, excludeNames: [] });

// Record success after using provider
if (provider) {
  recordProviderSuccess(provider.name);
  recordProviderMetrics(provider.name, {
    durationMs: 5000,
    inputTokens: 100,
    outputTokens: 50,
    validationPassed: true,
  });
}
```

### Adaptive Context

```javascript
import { getEffectiveMaxTokens, recordContextError, recordContextSuccess } from "./symphony-adaptive-context.mjs";

// Get dynamic max tokens (starts at 80% buffer)
const maxTokens = getEffectiveMaxTokens("groq");

// Record context error (shrinks limit)
recordContextError("groq", { requestedTokens: 13000, reportedLimit: 12000 });

// Record success (can expand limit after threshold)
for (let i = 0; i < 5; i++) {
  recordContextSuccess("groq");
}
```

### Running Tests

```bash
# Run all model integration tests
npx vitest run ops/integrations/model/

# Run specific test file
npx vitest run ops/integrations/model/symphony-credit-gate.spec.ts

# Run with coverage
npx vitest run ops/integrations/model/ --coverage
```

## 5. Dependencies

### Internal Dependencies

- **../../core/symphony-config.mjs** - Configuration constants
- **../../core/symphony-state.mjs** - State management
- **../../lib/logger.mjs** - Shared logger

### External Dependencies

- **Node.js** - ESM modules with .mjs extension
- **Python 3** - For model-injector-proxy.py
- **Vitest** - For test execution
- **Zod** - For parameter validation and normalization
- **AI SDK (Vercel)** - For OpenAI-compatible API
- **@codebuff/sdk** - For Codebuff integration (deprecated in favor of HTTP bridge)

### Environment Variables

- **GROQ_TOKEN**, **MISTRAL_TOKEN**, **GEMINI_TOKEN**, **OPENAI_API_KEY**, **OPENROUTER_TOKEN**, **SAMBANOVA_TOKEN**, **CEREBRAS_TOKEN**, **GITHUB_MODELS_TOKEN** - Provider API keys
- **OLLAMA_API_BASE** - Ollama backend URL (default: http://localhost:11434)

### External Services

- **Linear** - Issue tracking (via linear-webhook-receiver.mjs)
- **Ollama** - Local model runtime (safety-net provider)
- **Various AI Providers** - Groq, Mistral, Gemini, OpenAI, OpenRouter, SambaNova, Cerebras, GitHub Models

## 6. Additional Comments

- **Deprecation Notice**: codebuff-sdk-runner.mjs is deprecated. All Codebuff calls now go through the HTTP bridge at http://127.0.0.1:4318 (codebuff-openai-bridge.mjs).

- **P0 Safety-Net**: The credit gate implements a P0 safety-net that ensures `selectProvider` never causes total outage. When all cloud providers fail or are unreachable, the system falls back to local Ollama providers regardless of allowedNames/excludeNames filters. This uses cached probe results (<5min TTL) to avoid making live API calls during outage conditions.

- **Probe vs Runtime Separation**: Probe metrics (probeSelections, probeSuccesses, probeFailures, probeAvgDurationMs) are tracked separately from runtime metrics (selections, successes, failures, avgDurationMs). Providers need >= 3 successful probes before they get a score (not "pending").

- **Context Coherence**: The bridge validates context coherence before sending to providers, checking for: system message presence, role alternation (no consecutive user messages), and truncation markers in the last message.

- **Parameter Normalization**: The bridge uses z.preprocess() to normalize inputs BEFORE validation, allowing tools to accept arrays, strings, JSON-encoded strings, or objects with path/paths properties.

- **Legacy Lessons**: litellm-config.yaml encodes lessons from Ollama deployment: Ollama must be the default route (not an afterthought), max_concurrent_agents: 1, num_thread: 1 (protect against GPU contention).