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

Symphony Bridge uses the credit-gate provider cascade with **dynamic scoring** based on actual performance metrics:

| Priority class | Provider set                                                                                  | Selection method                                   |
| -------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Policy first   | `codex`                                                                                       | Always re-probed first when configured and healthy |
| Ranked auto    | `codebuff`, `groq`, `mistral`, `gemini*`, OpenRouter, `sambanova`, `cerebras`, `ollama-local` | Dynamic scoring with cooldown and re-entry         |
| Local HTTP     | `codebuff-bridge`                                                                             | OpenAI-compatible local bridge fallback            |

The credit-gate selects providers based on dynamic scoring, but `codex` is always retried and Codebuff paid availability is re-probed every 5 hours. Temporary failures enter cooldown, then are retried so Symphony continues learning the best route over time.

### Layer 3: Codebuff Bridge (multi-account rotation)

When Codebuff is selected, the bridge uses paid account first, then free accounts as runtime fallback:

1. **Paid account** is always preferred when available.
2. **Free accounts** are used immediately if paid is unavailable or rate-limited.
3. **Paid availability is re-probed every 5 hours** so the bridge returns to paid automatically.

## Current provider cascade

The credit-gate (`symphony-credit-gate.mjs`) owns the shared provider inventory. The harness reaches it only through Symphony Bridge. OpenClaw uses the same inventory as pinned `symphony/*` routes, then falls back to the direct Codebuff bridge only if Symphony itself is unavailable.

| #    | Provider                    | Type | Model                                  | Env Key(s) / Source                          | SDK     |
| ---- | --------------------------- | ---- | -------------------------------------- | -------------------------------------------- | ------- |
| 1    | codex                       | HTTP | gpt-5.4                                | `OPENAI_API_KEY`                             | No      |
| 2    | codebuff                    | SDK  | codebuff/base@latest                   | `CODEBUFF_API_KEY`, `CODEBUFF_API_KEY2`, ... | **Yes** |
| 3    | groq                        | HTTP | llama-3.3-70b-versatile                | `GROQ_TOKEN`                                 | No      |
| 4    | mistral                     | HTTP | devstral-small-2507                    | `MISTRAL_TOKEN`                              | No      |
| 5    | gemini                      | HTTP | gemini-2.5-flash                       | `GEMINI_TOKEN`                               | No      |
| 6    | gemini-lite                 | HTTP | gemini-2.5-flash-lite                  | `GEMINI_TOKEN`                               | No      |
| 8    | openrouter-nemotron-super   | HTTP | nvidia/nemotron-3-super-120b-a12b:free | `OPENROUTER_TOKEN`                           | No      |
| 9-35 | openrouter-free (27 models) | HTTP | Various free tier models               | `OPENROUTER_TOKEN`                           | No      |
| 35   | sambanova                   | HTTP | Meta-Llama-3.3-70B-Instruct            | `SAMBANOVA_TOKEN`                            | No      |
| 36   | cerebras                    | HTTP | llama3.1-8b                            | `CEREBRAS_TOKEN`                             | No      |
| 37   | codebuff-bridge             | HTTP | codebuff/base                          | `CODEBUFF_BRIDGE_API_KEY`                    | No      |
| 38   | ollama-local                | HTTP | qwen3.5:35b-a3b-32t                    | `OLLAMA_API_BASE`                            | No      |

### Provider notes

- **codex** (position 1): Primary provider, uses OpenAI credits
- **codebuff** (position 2): Autonomous agent via @codebuff/sdk, supports multi-account rotation for rate-limit fallback
- **openrouter-free** (positions 8-35): 27 free tier models ranked by quality score (nemotron-3-super-120b-a12b is best at 0.655)
- **codebuff-bridge** (position 37): OpenAI-compatible HTTP gateway for Codebuff SDK, enables OpenClaw integration and HTTP parity
- **ollama-local** (position 38): Local fallback when all remote providers fail

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
- `CODEBUFF_API_KEY` — Required: Codebuff API key for SDK calls
- `CODEBUFF_API_KEY2` — Optional: fallback key
- `CODEBUFF_API_KEY3` — Optional: additional key

### Usage

Start the bridge:

```bash
make codebuff-bridge
# or
node scripts/ops/integrations/model/codebuff-openai-bridge.mjs
```

The bridge supports:

- **Streaming responses** via Server-Sent Events (SSE)
- **Multi-account rotation** for rate-limit fallback
- **Account validation** to ensure different accounts for effective rotation
- **Automatic retry logic** with cooldown for rate-limited accounts

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

### Multi-account rotation

Codebuff (both SDK and bridge) supports multiple API keys from different accounts for rate-limit rotation:

- `CODEBUFF_API_KEY` - Primary account (tried first in paid mode, then free mode)
- `CODEBUFF_API_KEY2` - Secondary account fallback (free mode only)
- `CODEBUFF_API_KEY3` - Additional accounts as needed

The bridge validates that keys belong to different accounts at startup and warns if multiple keys resolve to the same account (which defeats rate-limit rotation). It also re-probes paid availability every 5 hours so the preferred account can recover automatically.

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

Core module for provider selection and auto-fallback. See earlier sections for detailed documentation.

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
