# Provider Routing

This document defines the current provider posture for harness and AI-assisted workflows.

## Principle

Use the cheapest truthful route that satisfies the task while preserving evidence quality.

## Operating Model

The harness uses a **layered failover model** where each layer handles its own internal fallback:

### Layer 1: OpenClaw (user-facing gateway)

OpenClaw is configured with the following failover chain:

| Priority | Model                                     | Fallback behavior                                        |
| -------- | ----------------------------------------- | -------------------------------------------------------- |
| Primary  | `symphony-bridge/symphony/main`           | Symphony autoselects the best healthy provider           |
| 2        | `symphony-bridge/symphony/codex`          | Direct pinned Codex route                                |
| 3        | `symphony-bridge/symphony/codebuff`       | Direct pinned Codebuff SDK route                         |
| 4+       | Other `symphony-bridge/symphony/*` routes | Direct pinned routes matching Symphony inventory         |
| Final    | `codebuff-bridge/codebuff/base`           | Local Codebuff bridge fallback with paid → free rotation |

**Key insight**: OpenClaw should prefer Symphony first, but its fallback inventory should mirror Symphony's provider surface so interactive work keeps going even if the Symphony bridge itself is unavailable.

### Layer 2: Symphony Bridge (credit-gate)

Symphony Bridge uses the credit-gate provider cascade with **tier-based dynamic scoring** based on actual performance metrics:

| Tier               | Provider set                                                                                   | Selection method                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `paid`             | `codex`, `codebuff`                                                                            | Probed first; uses paid API credits                              |
| `free-cloud`       | `groq`, `mistral`, `gemini*`, OpenRouter (27 models), `sambanova`, `cerebras`, `github-models` | Dynamic scoring with cooldown and re-entry (default tier)        |
| `local-proxy`      | `openclaw`, `codebuff-bridge`                                                                  | Local HTTP gateways to other services                            |
| `local-safety-net` | `ollama-local`, `ollama-qwen2.5-coder-3b`, `ollama-qwen2.5-coder-0.5b`                         | Score-capped at 0.25; always rank last in `getRankedProviders()` |

The credit-gate selects providers based on dynamic scoring, but `codex` is always retried and Codebuff paid availability is re-probed every 5 hours. Temporary failures enter cooldown, then are retried so Symphony continues learning the best route over time.

#### Tier-based ranking guarantee

The `getRankedProviders()` function partitions providers into two groups:

1. **Normal providers** — `paid`, `free-cloud`, and `local-proxy` tiers, sorted by dynamic score descending.
2. **Safety-net providers** — `local-safety-net` tier, sorted by dynamic score descending but always appended after all normal providers.

Safety-net providers have their scores capped by `SAFETY_NET_SCORE_CEILING = 0.25` in `computeProviderScore()`. This prevents local Ollama models from accumulating high scores through local-only usage and outranking cloud providers. The ceiling ensures safety nets only activate when all cloud providers are unavailable or in cooldown.

#### Dynamic tool-capability probing

The Symphony Bridge dynamically discovers which providers support structured tool calling at startup, replacing the former static deny list (`PROVIDERS_WITHOUT_TOOL_SUPPORT`). This ensures the bridge always has an accurate view of tool support across all 40+ providers without manual maintenance.

##### How it works

1. **Known-capable shortcut**: `codex`, `codebuff`, and `codebuff-bridge` are pre-classified as tool-capable (skip probing).
2. **Live probe**: For each available provider, the bridge sends a minimal `generateText` call with `toolChoice: "auto"` and a simple `add(2, 2)` tool. If the response contains a structured `toolCalls` array, the provider is classified as **capable**. If the response contains raw JSON tool output (e.g. `{"name":"add","arguments":{...}}`) in the text, the provider is classified as **non-capable** and excluded from future selection.
3. **OpenRouter deduplication**: All OpenRouter models share the same API and tool protocol. Once any single OpenRouter provider is probed, the result is inferred for all 27 others — saving 26 API calls.
4. **Inconclusive results**: Rate-limited (`429`), timed-out, or errored providers are left unclassified and remain in the pool. The runtime safety net (below) catches any that slip through.

##### Delayed retry

60 seconds after the initial startup probe, the bridge automatically retries all providers that were rate-limited, timed out, or returned probe errors. This picks up providers that were temporarily unavailable during the initial burst.

##### Runtime safety net

During actual request handling, `invokeWithAI()` inspects responses for raw JSON tool output patterns (`{"name":"...","arguments":{...}}`):

- **Streaming**: Detects raw JSON after the stream completes; marks the provider as non-capable for future exclusion (stream already delivered, so no throw).
- **Non-streaming**: Detects raw JSON in the response text; marks the provider as non-capable **and** throws to cascade to the next provider.

##### Provider exclusion

`buildSelectionOptions()` in the credit-gate selection path automatically spreads `nonToolCapableProviders` into the `excludeNames` set, so excluded providers are never selected for tool-bearing requests.

##### Health endpoint (`GET /health`)

The `toolProbe` object in the health response exposes the current classification state:

| Field          | Type       | Description                                                                |
| -------------- | ---------- | -------------------------------------------------------------------------- |
| `capable`      | `string[]` | Providers confirmed to support structured tool calls                       |
| `excluded`     | `string[]` | Providers confirmed to emit raw JSON tool output (excluded from selection) |
| `unclassified` | `string[]` | Available providers not yet classified (rate-limited, errored, timed out)  |
| `blocked`      | `object[]` | Providers blocked from the bridge entirely, with `{ name, reason }` detail |

Example:

```json
{
  "toolProbe": {
    "capable": ["codex", "codebuff", "groq", "openrouter-free", "...27 more"],
    "excluded": ["ollama-qwen2.5-coder-3b", "ollama-qwen2.5-coder-0.5b"],
    "unclassified": ["mistral", "gemini", "sambanova"],
    "blocked": [{ "name": "openclaw", "reason": "routing loop prevention" }]
  }
}
```

### Layer 3: Codebuff Bridge (paid → free fallback)

When Codebuff is selected, the bridge uses a single API key with automatic mode selection:

1. **Paid mode** is always tried first when available.
2. **Free mode** is used if paid mode is unavailable or rate-limited.
3. **Mode is re-validated every 5 hours** so the bridge returns to paid automatically.

## Current provider cascade

The credit-gate (`symphony-credit-gate.mjs`) owns the shared provider inventory. The harness reaches it only through Symphony Bridge. OpenClaw uses the same inventory as pinned `symphony/*` routes, then falls back to the direct Codebuff bridge only if Symphony itself is unavailable.

| #    | Provider                    | Tier               | Type | Model                                  | Env Key(s) / Source       | SDK     |
| ---- | --------------------------- | ------------------ | ---- | -------------------------------------- | ------------------------- | ------- |
| 1    | codex                       | `paid`             | HTTP | gpt-5.4                                | `OPENAI_API_KEY`          | No      |
| 2    | codebuff                    | `paid`             | SDK  | codebuff/base@latest                   | `CODEBUFF_API_KEY`        | **Yes** |
| 3    | openclaw                    | `local-proxy`      | HTTP | openclaw:main                          | `OPENCLAW_TOKEN`          | No      |
| 4    | groq                        | `free-cloud`       | HTTP | llama-3.3-70b-versatile                | `GROQ_TOKEN`              | No      |
| 5    | mistral                     | `free-cloud`       | HTTP | mistral-small-latest                   | `MISTRAL_TOKEN`           | No      |
| 6    | gemini                      | `free-cloud`       | HTTP | gemini-2.5-flash                       | `GEMINI_TOKEN`            | No      |
| 7    | gemini-lite                 | `free-cloud`       | HTTP | gemini-2.5-flash-lite                  | `GEMINI_TOKEN`            | No      |
| 8    | openrouter-nemotron-super   | `free-cloud`       | HTTP | nvidia/nemotron-3-super-120b-a12b:free | `OPENROUTER_TOKEN`        | No      |
| 9-35 | openrouter-free (27 models) | `free-cloud`       | HTTP | Various free tier models               | `OPENROUTER_TOKEN`        | No      |
| 36   | sambanova                   | `free-cloud`       | HTTP | Meta-Llama-3.3-70B-Instruct            | `SAMBANOVA_TOKEN`         | No      |
| 37   | cerebras                    | `free-cloud`       | HTTP | llama3.1-8b                            | `CEREBRAS_TOKEN`          | No      |
| 38   | github-models               | `free-cloud`       | HTTP | gpt-4.1-mini                           | `GITHUB_MODELS_TOKEN`     | No      |
| 39   | codebuff-bridge             | `local-proxy`      | HTTP | codebuff/base                          | `CODEBUFF_BRIDGE_API_KEY` | No      |
| 40   | ollama-local                | `local-safety-net` | HTTP | qwen3-coder-next:latest                | `OLLAMA_API_BASE`         | No      |
| 41   | ollama-qwen2.5-coder-3b     | `local-safety-net` | HTTP | qwen2.5-coder:3b-instruct              | `OLLAMA_API_BASE`         | No      |
| 42   | ollama-qwen2.5-coder-0.5b   | `local-safety-net` | HTTP | qwen2.5-coder:0.5b                     | `OLLAMA_API_BASE`         | No      |

### Provider notes

- **codex** (`paid`): Primary provider, uses OpenAI credits, always re-probed first
- **codebuff** (`paid`): Autonomous agent via @codebuff/sdk, supports paid → free mode fallback, re-probed every 5 hours
- **openclaw** (`local-proxy`): Local OpenClaw gateway, probed for port reachability
- **openrouter-free** (`free-cloud`, positions 8-35): 27 free tier models ranked by quality score
- **github-models** (`free-cloud`): GitHub Models API with gpt-4.1-mini
- **codebuff-bridge** (`local-proxy`): OpenAI-compatible HTTP gateway for Codebuff SDK, enables OpenClaw integration and HTTP parity
- **ollama-\*** (`local-safety-net`): Local fallback models, score-capped at 0.25 — only activate when all cloud providers are unavailable
- **openclaw** (`local-proxy`): Blocked from Symphony Bridge to prevent routing loop (bridge → openclaw → bridge)

## SDK-based providers

Codebuff uses the @codebuff/sdk for programmatic AI agent execution. Unlike HTTP providers that return JSON responses, Codebuff runs autonomously as an agent and completes tasks in a single run.

## Codebuff bridge

The Codebuff bridge (`scripts/ops/integrations/model/codebuff-openai-bridge.mjs`) exposes the Codebuff SDK as an OpenAI-compatible HTTP server for OpenClaw integration.

### Configuration

- **Base URL**: `http://127.0.0.1:4318/v1`
- **Auth**: Bearer token (default: `local-bridge`)
- **Model ID**: `codebuff/base`
- **Working directory**: Project root (configurable via `CODEBUFF_BRIDGE_CWD`)

### Endpoints

- `GET /v1/models` — List available models
- `POST /v1/chat/completions` — Chat completion (streaming & non-streaming)
- `POST /chat/completions` — Alternative endpoint for OpenClaw compatibility
- `GET /health` — Health check (no auth required)

### Environment variables

- `CODEBUFF_BRIDGE_PORT` — Port to listen on (default: 4318)
- `CODEBUFF_BRIDGE_API_KEY` — Bearer token for auth (default: local-bridge)
- `CODEBUFF_MODEL_ID` — Model ID to advertise (default: codebuff/base)
- `CODEBUFF_BRIDGE_CWD` — Working directory for Codebuff (default: project root)
- `CODEBUFF_API_KEY` — Required: Codebuff API key (uses paid mode first, then free mode)

### Usage

Start the bridge:

```bash
make codebuff-bridge
# or
node scripts/ops/integrations/model/codebuff-openai-bridge.mjs
```

The bridge supports:

- **Streaming responses** via Server-Sent Events (SSE)
- **Automatic paid → free mode fallback** with periodic re-validation
- **Automatic retry logic** with cooldown for rate-limited modes

### OpenClaw integration

Configure OpenClaw to use the bridge by adding the following to your `~/.openclaw/openclaw.json` configuration:

```json
{
  "providers": {
    "codebuff-bridge": {
      "baseUrl": "http://127.0.0.1:4318/v1",
      "apiKey": "local-bridge",
      "api": "openai-completions",
      "models": [
        {
          "id": "codebuff/base",
          "name": "Codebuff Base (via bridge)"
        }
      ]
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "codebuff-bridge/codebuff/base"
      }
    }
  }
}
```

### Paid → free mode fallback

Codebuff uses a single API key (`CODEBUFF_API_KEY`) with automatic mode selection:

- **Paid mode** is tried first at startup and on each re-validation
- **Free mode** is used automatically if paid is unavailable (e.g. out of credits)
- **Re-validation** runs every 5 hours so the bridge returns to paid mode automatically when credits are available

## Failure cooldown mechanism

The credit-gate tracks provider failures to avoid repeatedly trying broken providers:

### How it works

1. **Failure recording**: When a provider call fails (quota, rate limit, timeout), `recordProviderFailure()` records the failure with a timestamp in `reports/symphony/provider-failures.json`

2. **Cooldown window**: Providers that recently failed are skipped for a period (default: 360 seconds / 6 minutes, defined by `RUNNER_PROVIDER_FAILURE_WINDOW_SECS` in symphony-config.mjs)

3. **Automatic recovery**: After the cooldown expires, the provider is retried on the next selection cycle

4. **Success clearing**: When a provider succeeds, `clearProviderFailure()` removes its failure record

### Failure classification

The runner classifies failures to determine cooldown behavior:

| Failure type                  | Classification | Action                           |
| ----------------------------- | -------------- | -------------------------------- |
| 429 (rate limit)              | quota          | Record failure, cooldown applied |
| insufficient_quota            | quota          | Record failure, cooldown applied |
| rate_limit                    | quota          | Record failure, cooldown applied |
| accounts exhausted (Codebuff) | quota          | Record failure, cooldown applied |
| LLM call failed               | provider       | Record failure, cooldown applied |
| Other errors                  | other          | May retry immediately            |

### State file

Provider failure state is persisted to:

```
reports/symphony/provider-failures.json
```

Format:

```json
{
  "groq": 1774140700,
  "gemini": 1774140800
}
```

Where values are Unix timestamps. The credit-gate automatically cleans up old entries when checking for recent failures.

## Provider Metrics and Dynamic Scoring

The credit-gate tracks comprehensive provider metrics to enable dynamic provider ranking based on actual performance:

### Metrics tracked

**Basic metrics:**

- Selections (count), successes, failures, success rate (%)

**Timing metrics:**

- Average, min, max duration (ms)

**Token metrics:**

- Total/average input and output tokens

**Validation metrics:**

- Validation passes/failures, validation rate (%)

**Linear issue metrics (by priority):**

- Completed/failed issues, high/medium/low priority success rates

**Estimate-based complexity (story points):**

- Total/completed/average estimate points
- Small (1-2 pts), medium (3-5 pts), large (8+ pts) issue completion rates

### Scoring algorithm

| Weight | Metric Category                              |
| ------ | -------------------------------------------- |
| 15%    | Success rate (general)                       |
| 8%     | Average duration (faster = better)           |
| 12%    | Validation rate                              |
| 5%     | Volume (usage count)                         |
| 5%     | Recency (recent = better)                    |
| 15%    | Linear issue completion rate                 |
| 10%    | High priority issue success                  |
| 5%     | Low priority issue success                   |
| 10%    | Large estimate issue (8+) success            |
| 10%    | Estimate efficiency (completed/attempted)    |
| 5%     | Estimate throughput (total completed points) |

**Minimum 3 selections required before a provider is ranked.**

### State file

```
reports/symphony/provider-stats.json
```

### Usage

```javascript
import {
  recordLinearCompletion,
  getProviderStats,
  getRankedProviders,
} from "./symphony-credit-gate.mjs";

// Record issue completion with complexity metrics
recordLinearCompletion(providerName, {
  completed: true,
  priority: issue.priority,
  estimate: issue.estimate,
});

// Get providers sorted by dynamic score
const ranked = getRankedProviders();
```

### Legacy issue fallback

For issues without estimates, the system auto-assigns based on priority: P0=5, P1=4, P2=3, P3=2, P4=1 (minimum 1 point).

## Core Modules

### symphony-credit-gate.mjs

Core module for provider selection and auto-fallback. Exports:

- `getRankedProviders()` — Tier-partitioned provider ranking
- `getConfiguredProviders()` — Provider summaries for health/monitoring
- `getProviderDefinitions()` — Full provider objects (with `envVar`, `baseUrl`, `loadToken`) for tool-capability probing
- `recordProviderFailure()` / `clearProviderFailure()` — Failure cooldown management
- `probeAllProviders()` — Availability probing (network reachability)

See earlier sections for detailed documentation.

### symphony-state.mjs

Core module for managing symphony state. Provides:

- State file management (`reports/symphony/state.json`)
- Issue queue tracking
- Execution history
- Provider usage metrics

### symphony-validation.mjs

Core module for validation. Defines a `VALIDATION_MANIFEST` for operations like:

- Type checking (`typecheck:all`)
- Linting (`lint:all`)
- Dependency cruiser checks
- Unit and E2E tests

Used by the runner to validate changes before completion.

### codebuff-sdk-runner.mjs (DEPRECATED)

**Status**: Deprecated. All Codebuff calls now go through the HTTP bridge at `http://127.0.0.1:4318`.

This module now only exports shared path constants:

- `PROJECT_ROOT` — Project root directory
- `REPORTS_DIR` — Codebuff reports directory

Use `codebuff-openai-bridge.mjs` instead for Codebuff integration.

## Symphony Bridge

The Symphony Bridge (`scripts/ops/integrations/model/symphony-openai-bridge.mjs`) is an OpenAI-compatible HTTP gateway that uses the AI SDK for provider communication and tool execution.

### Overview

- **Purpose**: Provides a unified OpenAI-compatible API surface while leveraging AI SDK for automatic tool execution
- **Port**: `4319` (configurable via `SYMPHONY_BRIDGE_PORT`)
- **Auth**: Bearer token (default: `local-symphony`)
- **Model ID**: `symphony/main` (configurable via `SYMPHONY_MODEL_ID`)

### Architecture

The bridge combines:

1. **AI SDK** (`createAI`, `generateText`, `streamText`) for provider communication
2. **Credit-gate** for provider selection and auto-fallback
3. **Tool execution** for actual file operations, shell commands, and glob patterns

### Supported Providers

| Provider   | AI SDK Integration            | Notes                                        |
| ---------- | ----------------------------- | -------------------------------------------- |
| codebuff   | `@codebuff/sdk`               | Uses local SDK directly                      |
| groq       | `@ai-sdk/groq`                | Free, fast                                   |
| openrouter | `@openrouter/ai-sdk-provider` | Multiple models via OpenRouter API           |
| openclaw   | OpenAI-compatible             | Local gateway at `http://127.0.0.1:18789/v1` |
| mistral    | OpenAI-compatible             | `https://api.mistral.ai/v1`                  |
| gemini     | `@ai-sdk/google`              | Gemini 2.5 Flash models                      |
| codex      | OpenAI-compatible             | Default: `https://api.openai.com/v1`         |

### Available Tools

The bridge exposes three tools for autonomous execution:

| Tool   | Description                 | Parameters                                               |
| ------ | --------------------------- | -------------------------------------------------------- |
| `exec` | Execute shell commands      | `command` (string), `cwd` (optional)                     |
| `read` | Read files from filesystem  | `path` (string), `offset` (optional), `lines` (optional) |
| `glob` | Find files matching pattern | `pattern` (string), `cwd` (optional)                     |

Tool execution is handled automatically by AI SDK via `maxSteps` parameter (default: 10 iterations). The bridge executes tools autonomously during the conversation loop.

### Endpoints

- `GET /v1/models` — List available models
- `POST /v1/chat/completions` — Chat completion (streaming & non-streaming)
- `GET /health` — Health check (no auth required, includes provider stats and available tools)
- `GET /v1/metrics` — Bridge + credit-gate metrics
- `GET /v1/stats` — Provider statistics

### Environment Variables

- `SYMPHONY_BRIDGE_PORT` — Port (default: 4319)
- `SYMPHONY_BRIDGE_API_KEY` — Bearer token (default: local-symphony)
- `SYMPHONY_BRIDGE_ACCEPTED_TOKENS` — Comma-separated additional tokens
- `SYMPHONY_MODEL_ID` — Model ID to advertise (default: symphony/main)

Plus all provider tokens required by credit-gate (`GROQ_TOKEN`, `GEMINI_TOKEN`, `MISTRAL_TOKEN`, `OPENROUTER_TOKEN`, etc.)

### Systemd Service

```bash
# Start
systemctl --user start anqr-symphony-bridge.service

# Stop
systemctl --user stop anqr-symphony-bridge.service

# View logs
journalctl --user -u anqr-symphony-bridge.service -f
```

### Usage with OpenClaw

Configure OpenClaw to use the bridge:

```json
{
  "providers": {
    "symphony-bridge": {
      "baseUrl": "http://127.0.0.1:4319/v1",
      "apiKey": "local-symphony",
      "api": "openai-completions",
      "models": [
        { "id": "symphony/main", "name": "Symphony Main" },
        { "id": "symphony/text", "name": "Symphony Text" },
        { "id": "symphony/codebuff-bridge", "name": "Symphony Codebuff Bridge" },
        { "id": "symphony/ollama-local", "name": "Symphony Ollama Local" }
      ]
    }
  }
}
```

## Required behavior

- prefer configured provider routing over ad hoc direct calls
- log degraded or fallback execution explicitly
- do not make spend-bearing routing changes silently
- keep launch-critical product behavior independent of harness-provider availability

## Inputs

Provider routing currently depends on:

- local env files
- systemd env files (anqr-ops.env)
- provider tokens present in the operator environment
- failure state file (reports/symphony/provider-failures.json)
- provider stats file (reports/symphony/provider-stats.json)

## Non-goals

- provider routing is not a substitute for product auth
- provider routing must not become hidden doctrine inside scripts alone

Use [README.md](/home/user/src/anqr/README.md) and [MCP-MIGRATION.md](/home/user/src/anqr/MCP-MIGRATION.md) for the broader launch and migration backlog around external AI services.

_Last updated: 2026-03-24_
