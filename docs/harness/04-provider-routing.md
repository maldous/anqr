# Provider Routing

This document defines the current provider posture for harness and AI-assisted workflows.

## Principle

Use the cheapest truthful route that satisfies the task while preserving evidence quality.

## Current provider cascade

The harness uses a credit-gate to select providers in priority order. Providers are tried sequentially until one succeeds:

| # | Provider | Type | Model | Env Key(s) | SDK |
|---|----------|------|-------|------------|-----|
| 1 | codex | HTTP | gpt-4.1 | `OPENAI_API_KEY` | No |
| 2 | groq | HTTP | llama-3.3-70b | `GROQ_TOKEN` | No |
| 3 | mistral | HTTP | mistral-large-latest | `MISTRAL_TOKEN` | No |
| 4 | gemini | HTTP | gemini-2.0-flash | `GEMINI_TOKEN` | No |
| 5 | gemini-lite | HTTP | gemini-2.0-flash-lite | `GOOGLE_GEMINI_API_KEY` | No |
| 6 | openrouter-free | HTTP | openrouter/auto | `OPENROUTER_TOKEN` | No |
| 7 | sambanova | HTTP | Samba-3.1-Euphoria | `SAMBANOVA_TOKEN` | No |
| 8 | cerebras | HTTP | amber-3 | `CEREBRAS_TOKEN` | No |
| 9 | github-models | HTTP | gpt-4.1-mini | `GITHUB_MODELS_TOKEN` | No |
| 10 | **codebuff** | SDK | codebuff/base@latest | `CODEBUFF_API_KEY`, `CODEBUFF_API_KEY2`, ... | **Yes** |
| 11 | ollama-local | HTTP | qwen3.5:35b-a3b-32t | `OLLAMA_API_BASE` | No |

### Provider notes

- **codex** (position 1): Primary provider, uses OpenAI credits
- **codebuff** (position 10): Autonomous agent via @codebuff/sdk, supports multi-account rotation for rate-limit fallback
- **ollama-local** (position 11): Local fallback when all remote providers fail

## SDK-based providers

Codebuff uses the @codebuff/sdk for programmatic AI agent execution. Unlike HTTP providers that return JSON responses, Codebuff runs autonomously as an agent and completes tasks in a single run.

### Multi-account rotation

Codebuff supports multiple API keys from different accounts for rate-limit rotation:

- `CODEBUFF_API_KEY` - Primary account (tried first in paid mode, then free mode)
- `CODEBUFF_API_KEY2` - Secondary account fallback (free mode only)
- `CODEBUFF_API_KEY3` - Additional accounts as needed

## Failure cooldown mechanism

The credit-gate tracks provider failures to avoid repeatedly trying broken providers:

### How it works

1. **Failure recording**: When a provider call fails (quota, rate limit, timeout), `recordProviderFailure()` records the failure with a timestamp in `reports/symphony/provider-failures.json`

2. **Cooldown window**: Providers that recently failed are skipped for a period (default: 360 seconds / 6 minutes, defined by `RUNNER_PROVIDER_FAILURE_WINDOW_SECS` in symphony-config.mjs)

3. **Automatic recovery**: After the cooldown expires, the provider is retried on the next selection cycle

4. **Success clearing**: When a provider succeeds, `clearProviderFailure()` removes its failure record

### Failure classification

The runner classifies failures to determine cooldown behavior:

| Failure type | Classification | Action |
|--------------|----------------|--------|
| 429 (rate limit) | quota | Record failure, cooldown applied |
| insufficient_quota | quota | Record failure, cooldown applied |
| rate_limit | quota | Record failure, cooldown applied |
| accounts exhausted (Codebuff) | quota | Record failure, cooldown applied |
| LLM call failed | provider | Record failure, cooldown applied |
| Other errors | other | May retry immediately |

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
