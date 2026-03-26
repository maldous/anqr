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
| 3        | `symphony-bridge/symphony/codebuff`       | Direct pinned Codebuff route (via codebuff-bridge)       |
| 4+       | Other `symphony-bridge/symphony/*` routes | Direct pinned routes matching Symphony inventory         |
| Final    | `codebuff-bridge/codebuff/base`           | Local Codebuff bridge fallback with paid → free rotation |

**Key insight**: OpenClaw should prefer Symphony first, but its fallback inventory should mirror Symphony's provider surface so interactive work keeps going even if the Symphony bridge itself is unavailable.

### Layer 2: Symphony Bridge (credit-gate)

Symphony Bridge uses the credit-gate provider cascade with **tier-based dynamic scoring** based on actual performance metrics:

| Tier               | Provider set                                                                                   | Selection method                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `paid`             | `codex`, `codebuff`                                                                            | Probed first; uses paid API credits                              |
| `free-cloud`       | `groq`, `mistral`, `gemini*`, OpenRouter (27 models), `sambanova`, `cerebras`, `github-models` | Dynamic scoring with cooldown and re-entry (default tier)        |
| `local-proxy`      | `openclaw`                                                                                     | Local HTTP gateways to other services                            |
| `local-safety-net` | `ollama-local`, `ollama-qwen2.5-coder-3b`, `ollama-qwen2.5-coder-0.5b`                         | Score-capped at 0.25; always rank last in `getRankedProviders()` |

The credit-gate selects providers based on dynamic scoring, but `codex` is always retried first. Codebuff routes through the codebuff-bridge (port 4318) which handles paid → free mode fallback internally, with paid availability re-probed every 5 hours. The exploration mechanism clears old failures every 5 hours to re-discover providers whose rate-limit windows (e.g. Codex/Codebuff 5-hour session limits) may have reset. Temporary failures enter cooldown (2 min for paid providers, 6 min for others), then are retried so Symphony continuously learns the best route.

#### Continuous Provider Probing

The Symphony Bridge runs a repeatable provider probe cycle with the following sequential phases:

1. **Filter**: Exclude failed providers (in cooldown), blocklisted providers, and providers without credentials
2. **Reachability Check**: Probe all eligible providers in parallel for network reachability and API key validation
3. **Tool Capability Check**: Test all reachable providers in parallel for structured tool calling support
4. **Ranking** (after 3 completions): Log all providers ranked by dynamic performance score to metrics cache

The probe cycle repeats:

- **Every 30 minutes** (time-based), OR
- **Every 200 turns** of the current provider (usage-based)

This ensures the metrics heuristics always have fresh data without overwhelming provider APIs.

#### Tier-based ranking guarantee

The `getRankedProviders()` function partitions providers into two groups:

1. **Normal providers** — `paid`, `free-cloud`, and `local-proxy` tiers, sorted by dynamic score descending.
2. **Safety-net providers** — `local-safety-net` tier, sorted by dynamic score descending but always appended after all normal providers.

Safety-net providers have their scores capped by `SAFETY_NET_SCORE_CEILING = 0.25` in `computeProviderScore()`. This prevents local Ollama models from accumulating high scores through local-only usage and outranking cloud providers. The ceiling ensures safety nets only activate when all cloud providers are unavailable or in cooldown.

#### Dynamic tool-capability probing

The Symphony Bridge dynamically discovers which providers support structured tool calling at startup, replacing the former static deny list (`PROVIDERS_WITHOUT_TOOL_SUPPORT`). This ensures the bridge always has an accurate view of tool support across all 40+ providers without manual maintenance.

##### How it works

1. **Known-capable shortcut**: `codex` and `codebuff` are pre-classified as tool-capable (skip probing).
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

| #    | Provider                    | Tier               | Type | Model                                  | Env Key(s) / Source       |
| ---- | --------------------------- | ------------------ | ---- | -------------------------------------- | ------------------------- |
| 1    | codex                       | `paid`             | SDK  | gpt-5-codex                            | `OPENAI_API_KEY`          |
| 2    | codebuff                    | `paid`             | HTTP | codebuff/base                          | `CODEBUFF_BRIDGE_API_KEY` |
| 3    | openclaw                    | `local-proxy`      | HTTP | openclaw:main                          | `OPENCLAW_TOKEN`          |
| 4    | groq                        | `free-cloud`       | HTTP | llama-3.3-70b-versatile                | `GROQ_TOKEN`              |
| 5    | mistral                     | `free-cloud`       | HTTP | mistral-small-latest                   | `MISTRAL_TOKEN`           |
| 6    | gemini                      | `free-cloud`       | HTTP | gemini-2.5-flash                       | `GEMINI_TOKEN`            |
| 7    | gemini-lite                 | `free-cloud`       | HTTP | gemini-2.5-flash-lite                  | `GEMINI_TOKEN`            |
| 8    | openrouter-nemotron-super   | `free-cloud`       | HTTP | nvidia/nemotron-3-super-120b-a12b:free | `OPENROUTER_TOKEN`        |
| 9-35 | openrouter-free (27 models) | `free-cloud`       | HTTP | Various free tier models               | `OPENROUTER_TOKEN`        |
| 36   | sambanova                   | `free-cloud`       | HTTP | Meta-Llama-3.3-70B-Instruct            | `SAMBANOVA_TOKEN`         |
| 37   | cerebras                    | `free-cloud`       | HTTP | llama3.1-8b                            | `CEREBRAS_TOKEN`          |
| 38   | github-models               | `free-cloud`       | HTTP | gpt-4.1-mini                           | `GITHUB_MODELS_TOKEN`     |
| 39   | ollama-local                | `local-safety-net` | HTTP | qwen3-coder-next:latest                | `OLLAMA_API_BASE`         |
| 40   | ollama-qwen2.5-coder-3b     | `local-safety-net` | HTTP | qwen2.5-coder:3b-instruct              | `OLLAMA_API_BASE`         |
| 41   | ollama-qwen2.5-coder-0.5b   | `local-safety-net` | HTTP | qwen2.5-coder:0.5b                     | `OLLAMA_API_BASE`         |

### Provider notes

- **codex** (`paid`): Primary provider (Codex SDK), uses OpenAI credits, always re-probed first via `PREFERRED_PROVIDER_ORDER`
- **codebuff** (`paid`): Routes through codebuff-bridge (port 4318) which handles paid → free mode fallback internally; paid availability re-validated every 5 hours by the bridge
- **openclaw** (`local-proxy`): Local OpenClaw gateway, probed for port reachability; blocked from Symphony Bridge to prevent routing loop (bridge → openclaw → bridge)
- **openrouter-free** (`free-cloud`, positions 8-35): 27 free tier models ranked by quality score
- **github-models** (`free-cloud`): GitHub Models API with gpt-4.1-mini
- **ollama-\*** (`local-safety-net`): Local fallback models, score-capped at 0.25 — only activate when all cloud providers are unavailable

## Codebuff bridge

The Codebuff bridge (`scripts/ops/integrations/model/codebuff-openai-bridge.mjs`) exposes the Codebuff SDK as an OpenAI-compatible HTTP server. It is the **sole entry point** for all Codebuff usage — both the Symphony Bridge and OpenClaw route through it.

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

### Real-time streaming

The Codebuff bridge supports real-time streaming with activity markers:

**User-facing tool activity** (streamed to client):

- File operations: `📖 Reading:`, `✏️ Editing:`, `🔍 Searching:`
- Shell commands: `💻 Running:`
- Pattern matching: `🔧 glob:`
- Completions: `✅ <tool> done` (only for user-facing tools)

**Internal SDK activity** (filtered from client, logged server-side only):

- `set_messages`, `spawn_agent_inline`, `context-pruner`, `end_turn`
- All `run_terminal_command` completion markers

**Formatting rules**:

- Tool execution markers appear on new lines for readability
- No completion markers clutter the client stream
- Server logs retain full activity for debugging

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

## Adaptive Context and Rate Management

The Symphony Bridge includes a fully dynamic adaptive context system (`symphony-adaptive-context.mjs`) that adjusts per-provider context limits and rate budgets at runtime based on observed errors and successes.

### What it does

- **Dynamic context limits**: Shrinks a provider's token ceiling when 413/`context_length_exceeded` errors are observed; slowly expands back toward the base value after consecutive successes
- **Rate-limit throttling**: Parses `Retry-After` and `X-RateLimit-*` headers from 429 responses; applies per-provider backoff timers that exclude the provider from selection until the timer expires
- **TPM/RPM tracking**: Maintains 60-second sliding windows of token and request counts per provider
- **Proactive TPM reduction**: Before sending a request, checks if the provider is approaching 85% of its known TPM limit and halves the context budget proactively
- **Error classification**: Classifies every error into one of 6 types (context, rate-limit, auth, timeout, server, unknown), enabling type-specific feedback loops

### Relationship to failure cooldown

The adaptive context system runs **in parallel** with the credit-gate's failure cooldown mechanism (above). The credit-gate provides a blunt 6-minute cooldown for any failure. The adaptive system provides finer-grained feedback:

| Error type              | Credit-gate response | Adaptive system response                                                 |
| ----------------------- | -------------------- | ------------------------------------------------------------------------ |
| 413 / context too large | 6-min cooldown       | Shrink context limit; next request uses reduced ceiling                  |
| 429 / rate limit        | 6-min cooldown       | Precise backoff from headers; exclude from selection until timer expires |
| Success                 | Clear failure record | Increment success counter; expand ceiling after 3 consecutive successes  |

### Integration

The adaptive system integrates into the bridge at 6 points: pre-request truncation override, provider selection filtering, success recording, error classification and recording, and the `/v1/stats` observability endpoint.

See [11-adaptive-context.md](./11-adaptive-context.md) for full technical documentation including all exported functions, constants, data structures, and integration details.

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
4. **Transparent SSE relay** for Codebuff to preserve real-time streaming

### Streaming Improvements

**Transparent SSE relay for Codebuff** (2026-03-25):

- When Codebuff is selected, Symphony acts as a transparent SSE relay instead of consuming the response through AI SDK
- Raw SSE chunks from Codebuff bridge (port 4318) are forwarded directly to OpenClaw without parsing or buffering
- Preserves real-time streaming of activity messages (✅ done, 🔧 read:, 💻 Running:, etc.)
- Internal provider errors filtered from client stream (rate limits, quota exhausted)
- Internal SDK activity filtered from client stream (set_messages, spawn_agent_inline, context-pruner, end_turn)

**Streaming behavior by provider**:

| Provider | Streaming Method      | Notes                                      |
| -------- | --------------------- | ------------------------------------------ |
| codebuff | Transparent SSE relay | Direct proxy, no AI SDK buffering          |
| Other    | AI SDK streaming      | Uses `streamText()` with text-delta events |

### Supported Providers

| Provider   | AI SDK Integration            | Notes                                        |
| ---------- | ----------------------------- | -------------------------------------------- |
| codebuff   | OpenAI-compatible             | Routes through codebuff-bridge at `:4318`    |
| groq       | `@ai-sdk/groq`                | Free, fast                                   |
| openrouter | `@openrouter/ai-sdk-provider` | Multiple models via OpenRouter API           |
| openclaw   | OpenAI-compatible             | Local gateway at `http://127.0.0.1:18789/v1` |
| mistral    | OpenAI-compatible             | `https://api.mistral.ai/v1`                  |
| gemini     | `@ai-sdk/google`              | Gemini 2.5 Flash models                      |
| codex      | Codex SDK                     | Uses `@openai/codex-sdk` directly            |

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

### Health Monitoring

**Health endpoint** (`GET /health`):

```json
{
  "status": "ok",
  "uptime": 12345,
  "providers": {
    "available": 42,
    "configured": 42
  },
  "toolProbe": {
    "capable": ["codex", "codebuff", "groq", "openrouter-free", "..."],
    "excluded": ["ollama-qwen2.5-coder-3b", "ollama-qwen2.5-coder-0.5b"],
    "unclassified": ["mistral", "gemini"],
    "blocked": [{ "name": "openclaw", "reason": "routing loop prevention" }]
  },
  "streaming": {
    "codebuff": "transparent-sse-relay",
    "default": "ai-sdk-streaming"
  }
}
```

### Systemd Service

```bash
# Start
systemctl --user start anqr-symphony-bridge.service

# Stop
systemctl --user stop anqr-symphony-bridge.service

# Restart
systemctl --user restart anqr-symphony-bridge.service

# View logs
journalctl --user -u anqr-symphony-bridge.service -f

# Check status
systemctl --user status anqr-symphony-bridge.service
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

_Last updated: 2026-03-26_
