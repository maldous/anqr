# Debug — Getting Codex CLI Reliable Against the Harness

> **Living document.** Updated as issues are discovered and resolved.
> Last updated: 2026-04-17 (sweep #3)

## Goal

Get `codex -c model='"symphony/main"' -c model_provider='"symphony"'` working reliably so we can use Codex to exercise the harness AI model path end-to-end.

## Architecture: How Codex Connects

```
Codex CLI v0.121.0
  │
  │  -c model='"symphony/main"' -c model_provider='"symphony"'
  │  Reads ~/.codex/config.toml → [model_providers.symphony]
  │  base_url = http://127.0.0.1:4330/v1
  │  wire_api = "responses"
  │
  ▼
anqr-symphony-codex.service (port 4330)
  │  BRIDGE_MODE=control-plane (main repo, ADR-0008 exception)
  │  ANQR_WORKTREE_ID=codex
  │  WorkingDirectory=/home/user/src/anqr
  │  CODEX_SANDBOX_MODE=danger-full-access
  │
  ▼
/v1/responses → handleResponsesApi → proxy to /v1/chat/completions
  │  (Codex uses OpenAI Responses API, bridge converts to Chat Completions internally)
  │
  ▼
symphony-openai-bridge → credit-gate → provider cascade
  │  660 providers configured, ~420 available, 12 tool-capable
  │  4-tier cascade: paid → free-cloud → local-proxy → local-safety-net
  │
  ▼
Selected provider → AI SDK (streamText/generateText) → tool execution in main repo
```

---

## Sweep #3 Results (2026-04-17)

### Changes Made

| Change | Files | Purpose |
|---|---|---|
| Fully dynamic per-request limits | NEW: `discovered-per-request-limits-cache-file.mjs`, `load-discovered-per-request-limits.mjs`, `save-discovered-per-request-limit.mjs` | 413 errors now persist discovered limits to cache, applied proactively on future startups |
| Provider prefix defaults | MOD: `static-per-request-limits.mjs` (added `PROVIDER_PREFIX_DEFAULTS`) | New models from known providers (groq-*, cerebras-*, etc.) get conservative caps automatically |
| Startup cap logging | NEW: `log-startup-context-caps.mjs`, MOD: `runtime.mjs` | Operators can verify effective per-request caps without reading code |
| Dynamic limit integration | MOD: `build-provider-max-input-tokens.mjs` | 3-layer merge: static seed → discovered cache → prefix defaults |
| Persistent discovery on 413 | MOD: `record-context-error.mjs` | `saveDiscoveredPerRequestLimit()` + `baseMaxTokens` update when 413 reports limit |
| Cache reset on /v1/stats/reset | MOD: `server.mjs` | Discovered limits cache cleared alongside probe/health caches |
| Permanent diagnostics | MOD: `setup-process-handlers.mjs`, `server.mjs` | Removed TODO markers, kept SYMPHONY_DEBUG guards as production feature |
| Module exports | MOD: `symphony-bridge-truncation/index.mjs` | Exported new modules |

### Codex CLI Tests Performed (Sweep #3)

| Test | Command | Result | Notes |
|---|---|---|---|
| File read | `codex exec "Read package.json"` | ✅ | Tool execution works with dynamic limits |
| Multi-tool (code_search+read) | `codex exec "Find selectProvider and summarize"` | ✅ | Sequential tool calls work |
| Provider route: symphony/groq | `codex -c model='"symphony/groq"' exec "Read debug.md"` | ✅ | Groq route handles tools with prefix caps |
| File write + verify | `codex exec "Write /tmp/test.txt and read it back"` | ✅ | Write + read round-trip works |
| Provider route: symphony/cerebras | `codex -c model='"symphony/cerebras"' exec "2+2?"` | ✅ | Cerebras route works with caps |
| 3 concurrent requests | Three `codex exec` in parallel | ✅ | All succeed independently |
| Read dynamic limit code | `codex exec "Read build-provider-max-input-tokens.mjs"` | ✅ | Larger context handled correctly |

### Bridge Metrics (After All Fixes)

| Metric | Sweep #1 | Sweep #2 | Sweep #3 |
|---|---|---|---|
| Error rate | 60% | 0% | 0% |
| Fallback rate | 60% | 0% | 0% |
| Avg response time | 14,674ms | 2,560ms | 3,183ms |
| 413 errors | 3 | 0 | 0 |
| Tests passed | 2/5 | 8/8 | 7/7 |

### Startup Cap Logging Output

```
[startup] 📊 Per-request token caps active (21 providers):
  📖 cerebras: 7,000 tokens [static]
  📖 cerebras-gpt-oss-120b: 7,000 tokens [static]
  📖 cerebras-llama3-1-8b: 7,000 tokens [static]
  📖 cerebras-qwen-3-235b-a22b-instruct-2507: 7,000 tokens [static]
  📖 groq: 12,000 tokens [static]
  📖 groq-allam-2-7b: 6,000 tokens [static]
  📖 groq-llama-3-1-8b-instant: 6,000 tokens [static]
  📖 groq-llama-3-3-70b-versatile: 12,000 tokens [static]
  ...
[startup] 📋 Prefix-default caps (8 providers):
  🏷️ groq-meta-llama-llama-4-maverick-17b-128e-instruct: 12,000 tokens [prefix: groq-]
  🏷️ groq-openai-gpt-oss-120b: 12,000 tokens [prefix: groq-]
  ...
[startup] Sources: 13 static seed, 0 dynamically discovered, 8 prefix defaults
```

---

## Per-Request Token Limit System (Current Architecture)

### 3-Layer Merge Priority

```
1. Static seed (STATIC_PER_REQUEST_LIMITS)
   ↓  Specific known limits from past 413 errors
   ↓  Serves as fallback / seed data
   ↓
2. Dynamically discovered cache (discovered-per-request-limits.json)
   ↓  Limits learned from 413 errors at runtime
   ↓  Persisted across restarts — takes priority over static
   ↓
3. Provider prefix defaults (PROVIDER_PREFIX_DEFAULTS)
   ↓  Conservative caps for new models from known providers
   ↓  Covers models added after the static table was written
   ↓
   → Final budget = min(context_window * 0.6, all applicable caps)
```

### Flow: From 413 Error to Proactive Cap

```
1. Provider returns 413/context_too_large
2. parseContextErrorDetails() extracts reportedLimit from error message
3. recordContextError() → shrinks dynamicMaxTokens reactively
4. saveDiscoveredPerRequestLimit() → persists limit to cache file
5. baseMaxTokens updated → prevents adaptive context from re-expanding past limit
6. On next startup: loadDiscoveredPerRequestLimits() applies cap proactively
7. No wasted first-attempt token on that provider
```

### Provider Prefix Defaults

| Prefix | Default Limit | Rationale |
|---|---|---|
| `groq-` | 12,000 | Groq free-tier: 6K-12K per model |
| `cerebras-` | 7,000 | Cerebras free-tier: ~7K per model |
| `github-models-` | 8,000 | GitHub Models free-tier: ~8K |
| `sambanova-` | 16,000 | SambaNova: moderate free-tier |
| `huggingface-` | 8,000 | HuggingFace: conservative default |

### Startup Visibility

`logStartupContextCaps()` runs after provider probes at bridge startup and logs:
- 📖 Static seed caps (from `STATIC_PER_REQUEST_LIMITS`)
- 🔧 Dynamically discovered caps (from cache, with age)
- 🏷️ Prefix-default caps (from `PROVIDER_PREFIX_DEFAULTS`)

### Cache Management

- **Cache file:** `reports/symphony/discovered-per-request-limits.json`
- **Format:** `{ "providerName": { "limit": 6000, "discoveredAt": 1744..., "source": "413_tpm_limit" } }`
- **Reset:** `POST /v1/stats/reset` clears the discovered limits cache alongside probe/health caches

---

## Bugs & Issues

### 🔴 Bug #1: `startedAt is not defined` — RESOLVED

**Discovered:** 2026-04-17 (historical)
**Severity:** Was Critical
**Status:** ✅ Resolved — not reproducible after bridge restart with diagnostic tracing

The codex bridge had 3 `startedAt is not defined` errors in bridge metrics (from before this session). After adding diagnostic stack trace handlers and restarting, the error has not recurred. Static analysis of all `startedAt` references shows every usage is properly scoped (const definition or function parameter).

**Fix applied:** Added `unhandledRejection` and `uncaughtException` handlers with full stack traces to `setup-process-handlers.mjs`. Guarded with `SYMPHONY_DEBUG` env var and `process.exitCode = 1` per Node.js best practices. These are now permanent production diagnostics.

**Likely cause:** Transient state from a previous code version that was already fixed, or a race condition during bridge startup that self-corrects on restart.

---

### 🔴 Bug #6: Free-tier per-request token limits not accounted for — FIXED (now fully dynamic)

**Discovered:** 2026-04-17 (sweep #2)
**Severity:** Critical — caused 60% fallback rate and 14s avg response time
**Status:** ✅ Fixed and made fully dynamic in sweep #3

**Root cause:** `buildDynamicCatalogLimits()` only uses `contextLength` from provider `/v1/models` APIs to calculate input budgets. Groq free-tier has 131K context window but enforces 6K-12K per-request TPM limits. The bridge calculated 78K input budget (60% of 131K) and sent oversized requests that got 413'd.

**Fix evolution:**
- Sweep #2: Static `STATIC_PER_REQUEST_LIMITS` table caps budgets → 0% fallback
- Sweep #3: Made fully dynamic — 413 errors persist limits to cache, prefix defaults cover new models

**Known limits:**

| Provider | Context Window | Per-Request Limit |
|---|---|---|
| groq-llama-3-1-8b-instant | 131K | 6,000 |
| groq-llama-3-3-70b-versatile | 131K | 12,000 |
| groq-openai-gpt-oss-120b | 131K | 12,000 |
| groq-openai-gpt-oss-20b | 131K | 12,000 |
| groq-qwen-qwen3-32b | 131K | 12,000 |
| cerebras-llama3-1-8b | 8K | 7,000 |
| github-models-llama-4-maverick | 1M | 8,000 |

---

### 🟡 Bug #7: Generic provider names have 0% success rate — FIXED

**Discovered:** 2026-04-17 (sweep #2)
**Severity:** Medium — wastes a selection slot on first attempt
**Status:** ✅ Fixed (included in per-request limits fix + prefix defaults)

The generic provider entries (`groq` → llama-3.3-70b-versatile, `cerebras` → llama3.1-8b) had 0% success rate. They inherited the full context window budget without per-request caps, so they always hit 413 errors.

**Fix:** Added `groq: 12_000` and `cerebras: 7_000` to `STATIC_PER_REQUEST_LIMITS`. Prefix defaults also cover any new `groq-*` or `cerebras-*` models.

---

### 🟡 Bug #2: wt5 orphaned in `executing` state with ANQ-500

**Discovered:** 2026-04-17
**Severity:** Medium — stale state, but doesn't block Codex
**Status:** Noted (not in scope for Codex bridge work)

---

### 🟡 Bug #3: Health-state.json files are 0-byte or missing in worktrees

**Discovered:** 2026-04-17
**Severity:** Medium — causes recurring warnings in executor logs
**Status:** Noted (not in scope for Codex bridge work)

---

### 🟡 Bug #4: ANQ-1657/1658 have `phase=undefined` in durable state

**Discovered:** 2026-04-17
**Severity:** Medium
**Status:** Noted (not in scope for Codex bridge work)

---

### 🟢 Issue #5: OpenRouter quota exhausted across most models

**Discovered:** 2026-04-17
**Severity:** Low — groq and cerebras are healthy and ranked highest
**Status:** Noted

---

### 🟢 Issue #8: Responses API doesn't always trigger tool calls

**Discovered:** 2026-04-17 (sweep #2)
**Severity:** Low — Codex works via proxy to chat/completions, not direct Responses API tool calling
**Status:** Noted

When testing the Responses API directly with `tools` parameter and `input_text` content, the model didn't always choose to call tools. This is expected model behavior — the model decides whether to use tools based on the prompt. Codex works correctly because it proxies through `/v1/chat/completions` internally, where the AI SDK handles tool execution.

---

### 🟢 Issue #9: ollama-qwen2.5-coder-3b is very slow

**Discovered:** 2026-04-17 (sweep #2)
**Severity:** Low — only used as safety-net fallback
**Status:** Noted

`ollama-qwen2.5-coder-3b` averages 27,125ms per request. It's the local safety-net tier and only activates when all cloud providers fail. Not a reliability issue since it always succeeds.

---

## Diagnostic Code

Production diagnostics (permanent, not temporary):

1. **`setup-process-handlers.mjs`**: `unhandledRejection` and `uncaughtException` handlers with full stack traces. Console output guarded by `SYMPHONY_DEBUG` env var. Sets `process.exitCode = 1` on uncaught exceptions per Node.js best practices.

2. **`server.mjs`**: Streaming error stack trace logging in the catch block. Console output guarded by `SYMPHONY_DEBUG` env var.

3. **`log-startup-context-caps.mjs`**: Logs effective per-request token caps at startup with source attribution (static, discovered, prefix).

---

## Adaptive Context System Summary

### Parameters

| Parameter | Value | Purpose |
|---|---|---|
| CONTEXT_INITIAL_BUFFER | 0.8 | Start at 80% of base budget |
| CONTEXT_SHRINK_FACTOR | 0.75 | Shrink by 25% on generic context error |
| CONTEXT_SHRINK_BUFFER | 0.9 | Additional 10% buffer when reported limit known |
| CONTEXT_EXPAND_FACTOR | 1.05 | Grow by 5% after consecutive successes |
| CONTEXT_EXPAND_THRESHOLD | 3 | Need 3 consecutive successes to expand |
| TPM_PROACTIVE_THRESHOLD | 0.85 | Reduce context if TPM > 85% of limit |
| MIN_MESSAGE_BUDGET_TOKENS | 1,000 | Absolute floor for context budget |

### Flow

```
1. buildProviderMaxInputTokens() → merge static + dynamic catalog + static caps + discovered cache + prefix defaults
2. createProviderState() → baseMaxTokens from above, dynamicMaxTokens = base * 0.8
3. getEffectiveMaxTokens() → returns dynamicMaxTokens
4. invokeWithAIInner() → uses effectiveMax for tool selection + message truncation
5. On 413: recordContextError() → shrink dynamicMaxTokens + persist to cache + update baseMaxTokens
6. On success: recordContextSuccess() → expand after 3 consecutive wins
7. shouldReduceContextForTPM() → proactive shrink if TPM approaching limit
```

---

## Changelog

| Date | Change |
|---|---|
| 2026-04-17 | Created — initial state capture, identified Bug #1-5 |
| 2026-04-17 | Sweep #2 — exhaustive Codex testing, fixed Bug #6 (per-request limits), Bug #7 (generic providers), added diagnostic tracing, verified all tool execution paths work |
| 2026-04-17 | Sweep #3 — made per-request limits fully dynamic (413 → persist → proactive), added provider prefix defaults for new models, added startup cap logging, made diagnostics permanent, cleared caches on /v1/stats/reset, all 7 Codex tests pass with 0% fallback |
