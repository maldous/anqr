# Provider Routing

This document defines the current provider posture for harness and AI-assisted workflows.

## Principle

Use the cheapest truthful route that satisfies the task while preserving evidence quality.

## Provider Health States

The harness tracks explicit health states for each provider:

- **healthy**: Provider is functioning normally
- **degraded**: Provider is experiencing issues but still usable (1+ consecutive failures)
- **cooling-down**: Provider recently failed, in cooldown period (3+ consecutive failures)
- **disabled**: Provider manually disabled
- **blocked**: Provider blocked from use (e.g., routing loop prevention)
- **unknown**: Provider state not yet determined

Health state transitions are automatic based on consecutive failures/successes:

- 1 failure → degraded
- 3 failures → cooling-down
- 2 successes → healthy

## Timeout Configuration

Provider timeouts are differentiated based on infrastructure type:

- **Local models** (Ollama): 60 seconds
  - Longer timeout accounts for local GPU inference
  - Patterns: `ollama*`, `localhost`, `127.0.0.1`, `local-*`
- **Hosted models** (cloud APIs): 30 seconds
  - Faster timeout for cloud API responsiveness
  - All other providers

## Return to Preferred Provider

The system automatically returns to preferred providers (e.g., `codex`) when they become healthy again:

1. Preferred providers are checked first in selection
2. Cooling-down providers are re-probed after cooldown expires
3. Health state is reset to `unknown` after cooldown to allow re-discovery
4. Successful responses transition provider back to `healthy`

Cooldown periods:

- Paid providers (codex, codebuff): 2 minutes
- Free cloud providers: 6 minutes
- Local providers: 2 minutes

## Operating Model

The harness uses a **layered failover model** where each layer handles its own internal fallback:

### Layer 1: OpenClaw (user-facing gateway)

OpenClaw is configured with the following failover chain:

| Priority | Model                                     | Fallback behavior                                         |
| -------- | ----------------------------------------- | --------------------------------------------------------- |
| Primary  | `symphony-bridge/symphony/main`           | Symphony autoselects the best healthy provider            |
| 2        | `symphony-bridge/symphony/codex`          | Direct pinned Codex route                                 |
| 3        | `symphony-bridge/symphony/codebuff`       | Direct pinned Codebuff route (SDK inside worktree bridge) |
| 4+       | Other `symphony-bridge/symphony/*` routes | Direct pinned routes matching Symphony inventory          |
| Final    | `ollama/qwen2.5-coder:0.5b`               | Local Ollama fallback                                     |

**Key insight**: OpenClaw should prefer Symphony first, and its fallback inventory mirrors Symphony's provider surface so interactive work keeps going even if the Symphony agent router itself is unavailable.

### Layer 2: Symphony Bridge (credit-gate)

Symphony Bridge uses the credit-gate provider cascade with **tier-based dynamic scoring** based on actual performance metrics and **explicit health state tracking**:

| Tier               | Provider set                                                                                   | Selection method                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `paid`             | `codex`, `codebuff`                                                                            | Probed first; uses paid API credits; health-aware                |
| `free-cloud`       | `groq`, `mistral`, `gemini*`, OpenRouter (27 models), `sambanova`, `cerebras`, `github-models` | Dynamic scoring with cooldown and re-entry (default tier)        |
| `local-proxy`      | `openclaw`                                                                                     | Local HTTP gateways to other services                            |
| `local-safety-net` | `ollama-local`, `ollama-qwen2.5-coder-3b`, `ollama-qwen2.5-coder-0.5b`                         | Score-capped at 0.25; always rank last in `getRankedProviders()` |

The credit-gate selects providers based on dynamic scoring and health state, with `codex` always retried first when healthy. Provider rotation on failure uses health state tracking to skip cooling-down providers. The exploration mechanism clears old failures every 2-6 minutes (depending on tier) to re-discover providers whose rate-limit windows may have reset.

### Codebuff SDK execution (inside worktree bridges)

When Codebuff is selected by the credit-gate, it runs directly inside the worktree-local Symphony bridge via `codebuff-direct.mjs`:

1. **Paid mode** is always tried first when available.
2. **Free mode** is used if paid mode is unavailable or rate-limited.
3. There is no standalone Codebuff bridge service — the SDK is integrated into each worktree bridge (ADR-0003).

## Current provider cascade

The credit-gate (`symphony-credit-gate.mjs`) owns the shared provider inventory. The harness reaches it only through the Symphony agent router (port 4319), which proxies to worktree-local bridges (ports 4321-4328). OpenClaw uses the same inventory as pinned `symphony/*` routes.

See full provider list in original file section below...
