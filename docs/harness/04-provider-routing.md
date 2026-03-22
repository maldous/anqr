# Provider Routing

This document defines the current provider posture for harness and AI-assisted workflows.

## Principle

Use the cheapest truthful route that satisfies the task while preserving evidence quality.

## Current provider cascade

The harness uses a credit-gate to select providers in priority order. Providers are tried sequentially until one succeeds:

| #   | Provider        | Type | Model                                  | Env Key(s)                                   | SDK     |
| --- | --------------- | ---- | -------------------------------------- | -------------------------------------------- | ------- |
| 1   | codex           | HTTP | gpt-5.4                                | `OPENAI_API_KEY`                             | No      |
| 2   | groq            | HTTP | llama-3.3-70b-versatile                | `GROQ_TOKEN`                                 | No      |
| 3   | mistral         | HTTP | devstral-small-2507                    | `MISTRAL_TOKEN`                              | No      |
| 4   | gemini          | HTTP | gemini-2.5-flash                       | `GEMINI_TOKEN`                               | No      |
| 5   | gemini-lite     | HTTP | gemini-2.5-flash-lite                  | `GEMINI_TOKEN`                               | No      |
| 6   | openrouter-free | HTTP | meta-llama/llama-3.3-70b-instruct:free | `OPENROUTER_TOKEN`                           | No      |
| 7   | sambanova       | HTTP | Meta-Llama-3.3-70B-Instruct            | `SAMBANOVA_TOKEN`                            | No      |
| 8   | cerebras        | HTTP | llama3.1-8b                            | `CEREBRAS_TOKEN`                             | No      |
| 9   | github-models   | HTTP | gpt-4.1-mini                           | `GITHUB_MODELS_TOKEN`                        | No      |
| 10  | **codebuff**    | SDK  | codebuff/base@latest                   | `CODEBUFF_API_KEY`, `CODEBUFF_API_KEY2`, ... | **Yes** |
| 11  | codebuff-bridge | HTTP | codebuff/base@latest                   | `CODEBUFF_BRIDGE_API_KEY`                    | No      |
| 12  | ollama-local    | HTTP | qwen3.5:35b-a3b-32t                    | `OLLAMA_API_BASE`                            | No      |

### Provider notes

- **codex** (position 1): Primary provider, uses OpenAI credits
- **codebuff** (position 10): Autonomous agent via @codebuff/sdk, supports multi-account rotation for rate-limit fallback
- **codebuff-bridge** (position 11): OpenAI-compatible HTTP gateway for Codebuff SDK, enables OpenClaw integration
- **ollama-local** (position 12): Local fallback when all remote providers fail

## SDK-based providers

Codebuff uses the @codebuff/sdk for programmatic AI agent execution. Unlike HTTP providers that return JSON responses, Codebuff runs autonomously as an agent and completes tasks in a single run.

## Codebuff bridge

The Codebuff bridge (`scripts/ops/integrations/model/codebuff-openai-bridge.mjs`) exposes the Codebuff SDK as an OpenAI-compatible HTTP server for OpenClaw integration.

### Configuration

- **Base URL**: `http://127.0.0.1:4318`
- **Auth**: Bearer token (default: `local-bridge`)
- **Model ID**: `codebuff/base@latest`
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

Configure OpenClaw to use the bridge via `.openclaw/models.json`:

```json
{
  "providers": {
    "codebuff-bridge": {
      "baseUrl": "http://127.0.0.1:4318",
      "apiKey": "local-bridge",
      "api": "openai-completions",
      "models": [
        {
          "id": "codebuff/base@latest",
          "name": "Codebuff Base (via bridge)"
        }
      ]
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "codebuff-bridge/codebuff/base@latest"
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

The bridge validates that keys belong to different accounts at startup and warns if multiple keys resolve to the same account (which defeats rate-limit rotation).

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

## Non-goals

- provider routing is not a substitute for product auth
- provider routing must not become hidden doctrine inside scripts alone

Use [README.md](/home/user/src/anqr/README.md) and [MCP-MIGRATION.md](/home/user/src/anqr/MCP-MIGRATION.md) for the broader launch and migration backlog around external AI services.
