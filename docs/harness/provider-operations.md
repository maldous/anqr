# Provider Operations & AI Pipeline Knowledge

Canonical reference for the AI inference pipeline: provider configuration, verified capabilities, operational lessons, and continuous evolution procedures.

## Pipeline Architecture

```
Symphony orchestrator
  → codex-credit-gate.sh (provider selection + cascade)
    → model-injector-proxy.py (:4011, failover + error detection)
      → litellm-proxy (:4010, API translation)
        → provider API (cloud) / Ollama (:11434, local)
```

**Key files:**

| File                                                 | Purpose                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `scripts/ops/codex-credit-gate.sh`                   | Provider cascade, availability probes, rate-limit backoff          |
| `scripts/ops/model-injector-proxy.py`                | Request injection, in-session failover, error detection, cooldowns |
| `scripts/ops/litellm-config.yaml`                    | LiteLLM model aliases, provider routing, API keys                  |
| `Modelfile`                                          | Custom Ollama model definition (qwen3.5:35b-a3b-32t)               |
| `/etc/systemd/system/ollama.service.d/override.conf` | Ollama GPU/VRAM/context tuning                                     |

## Verified Provider Matrix

Context windows verified where provider API catalog is available; remainder based on published documentation. Providers marked ⚠️ have unverified limits.

| #   | Provider      | LiteLLM Alias         | Model                         | Context (input) | Context (output) | Free Tier Limits  | Status                        |
| --- | ------------- | --------------------- | ----------------------------- | --------------- | ---------------- | ----------------- | ----------------------------- |
| 1   | Groq          | `groq-llama-70b`      | `llama-3.3-70b-versatile`     | 128K            | 32K              | 12K TPM           | ✅ Active                     |
| 2   | Mistral       | `mistral-codestral`   | `devstral-small-2507`         | 128K            | 32K              | Free experimental | ✅ Active                     |
| 3   | Gemini        | `gemini-flash`        | `gemini-2.5-flash`            | 1M              | 65K              | ~1,500 RPD        | ✅ Active                     |
| 3b  | Gemini Lite   | `gemini-flash-lite`   | `gemini-2.5-flash-lite`       | 1M              | 65K              | Separate quota    | ✅ Active                     |
| 4   | OpenRouter    | `openrouter-free`     | `llama-3.3-70b-instruct:free` | 128K            | 32K              | 20 req/min        | ✅ Token SET                  |
| 5   | SambaNova     | `sambanova-llama-70b` | `Meta-Llama-3.3-70B-Instruct` | 128K            | 32K              | 20 req/day        | ✅ Active                     |
| 6   | Cerebras      | `cerebras-llama-8b`   | `llama3.1-8b`                 | 8K (unverified) | 8K               | 1M tok/day        | ⚠️ Low context                |
| 7   | GitHub Models | `github-gpt41-mini`   | `gpt-4.1-mini`                | **1M**          | **32K**          | FREE tier         | ⚠️ /chat only (no /responses) |
| 8   | Ollama        | `qwen3.5-35b-a3b-32t` | `qwen3.5:35b-a3b-32t`         | 32K             | 32K              | Unlimited (local) | ✅ Active                     |

### Context Window Requirements

All providers must support **≥32K input context** to handle long agent sessions. Providers below this threshold (Cerebras at 8K) are deprioritised in the cascade — placed after providers with adequate context.

### Provider Verification Procedure

Before adding, removing, or changing any provider:

1. **Query the provider's model catalog** to verify actual context limits:

   ```bash
   # GitHub Models
   curl -sL -H 'Accept: application/vnd.github+json' \
     -H "Authorization: Bearer $GITHUB_MODELS_TOKEN" \
     -H 'X-GitHub-Api-Version: 2022-11-28' \
     https://models.github.ai/catalog/models | python3 -c '
   import json,sys; [print(f\'\'{m["name"]}: in={m["limits"]["max_input_tokens"]}, out={m["limits"]["max_output_tokens"]}\'\') for m in json.load(sys.stdin) if "MODELNAME" in m["name"]]'

   # Groq
   curl -sf -H "Authorization: Bearer $GROQ_TOKEN" https://api.groq.com/openai/v1/models

   # General OpenAI-compat
   curl -sf -H "Authorization: Bearer $TOKEN" https://api.PROVIDER.com/v1/models
   ```

2. **Test through LiteLLM** after config change:

   ```bash
   systemctl --user restart litellm-proxy.service && sleep 6
   curl -s http://localhost:4010/v1/chat/completions \
     -H 'Content-Type: application/json' \
     -d '{"model": "ALIAS", "messages": [{"role": "user", "content": "Say OK"}], "max_tokens": 3}'
   ```

3. **Verify tool-calling support** — Codex requires function/tool calling. Models without it (e.g. `deepseek-coder:*`) will silently fail.

4. **Document the change** in this file, `docs/operations/ops-autopilot.md`, and `litellm-config.yaml`.

> **Rule: Never remove a provider without first querying its actual API catalog.** The GitHub Models removal incident proved that assumptions about provider limits ("8K context") can be wrong — the actual limit was 131K.

## LiteLLM Routing Knowledge

### Provider Prefix Compatibility

LiteLLM uses provider prefixes to route requests. Not all prefixes work for all models:

| Provider      | Prefix                 | Works? | Notes                                                                                          |
| ------------- | ---------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Groq          | `groq/`                | ✅     | Standard                                                                                       |
| Gemini        | `gemini/`              | ✅     | Required for `/v1/responses` (not `openai/`)                                                   |
| Cerebras      | `cerebras/`            | ✅     | Standard                                                                                       |
| OpenRouter    | `openrouter/`          | ✅     | Standard                                                                                       |
| SambaNova     | `sambanova/`           | ✅     | Standard                                                                                       |
| Mistral       | `mistral/`             | ✅     | Standard                                                                                       |
| GitHub Models | `github/`              | ❌     | LiteLLM doesn't recognise GPT-4.1-mini                                                         |
| GitHub Models | `openai/` + `api_base` | ✅     | **Workaround**: use `openai/gpt-4.1-mini` with `api_base: https://models.github.ai/inference`  |
| Ollama        | `ollama/`              | ⚠️     | Drops `tool_calls` from responses (known upstream bug, verified LiteLLM 1.82.0)                |
| Ollama        | `ollama_chat/`         | ✅     | Tool calls work; supports `num_ctx` for context windowing                                      |
| Ollama        | `openai/` + `api_base` | ✅     | **Recommended**: treats Ollama as generic OpenAI-compat API; tool calls pass through correctly |

### GitHub Models Routing Workaround

LiteLLM's built-in `github/` provider has a hardcoded model registry that doesn't include newer models like GPT-4.1-mini. The workaround:

```yaml
- model_name: github-gpt41-mini
  litellm_params:
    model: openai/gpt-4.1-mini
    api_base: https://models.github.ai/inference
    api_key: os.environ/GITHUB_MODELS_TOKEN
```

LiteLLM strips the `openai/` prefix and sends `gpt-4.1-mini` to the GitHub API endpoint. This works because GitHub Models uses an OpenAI-compatible API format.

**Known limitation: `/v1/responses` endpoint returns 404.**

The `openai/` prefix + `api_base` workaround only works for `/v1/chat/completions`. When Codex uses `/v1/responses` (its default API), LiteLLM tries to call the OpenAI responses API directly on `models.github.ai/inference` — but GitHub's endpoint doesn't have a `/v1/responses` path, causing a 404.

The model-injector handles this by pre-excluding `github` from the failover chain for `/v1/responses` requests (see `_RESPONSES_INCOMPATIBLE_PROVIDERS` in `model-injector-proxy.py`). GitHub Models is still available for `/v1/chat/completions` testing.

### Ollama Tool-Call Fix: `openai/` Prefix

LiteLLM's `ollama/` provider handler (as of v1.82.0) silently drops `tool_calls` from Ollama responses. The model generates correct tool calls — Ollama's `/v1/chat/completions` endpoint returns them in standard OpenAI format — but LiteLLM's Ollama-specific response parser strips them.

**Root cause:** LiteLLM's `ollama/` prefix routes through a custom Ollama handler that doesn't properly map the `tool_calls` field from Ollama's response. The `openai/` prefix bypasses this handler entirely, treating Ollama as a generic OpenAI-compatible API.

**Fix (applied):**

```yaml
# Instead of:
- model_name: qwen3.5-35b-a3b-32t
  litellm_params:
    model: ollama/qwen3.5:35b-a3b-32t
    api_base: http://localhost:11434

# Use:
- model_name: qwen3.5-35b-a3b-32t
  litellm_params:
    model: openai/qwen3.5:35b-a3b-32t
    api_base: http://localhost:11434/v1
    api_key: ollama # required by openai/ prefix; value ignored by Ollama
```

Key differences:

- `api_base` must include `/v1` (Ollama's OpenAI-compat endpoint path)
- `api_key` is required by the `openai/` prefix but Ollama ignores the value
- `num_ctx` is not supported via `openai/` — context is set via `OLLAMA_CONTEXT_LENGTH` env or Modelfile instead

A fallback `ollama_chat/` entry (`qwen3.5-35b-a3b-32t-ollama`) is kept for workloads that need Ollama-native context windowing.

**Verified endpoints (all ✅):**

- `/v1/chat/completions` — tool calls with `finish_reason: "tool_calls"`
- `/v1/chat/completions` — basic chat with reasoning content
- `/v1/responses` — tool calls as `function_call` output items
- `/v1/responses` — basic text responses

### Gemini Routing Requirement

Gemini **must** use the `gemini/` prefix (not `openai/`) because Codex uses the `/v1/responses` endpoint, which is a separate LiteLLM code path that handles Gemini natively. Using `openai/` with a custom `api_base` causes 404 errors on `/v1/responses`.

## Ollama GPU/VRAM Tuning

### Hardware: GTX 1650 (4 GB VRAM) + i9-13900K

| Setting                    | Value | Rationale                                                                                                                            |
| -------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `OLLAMA_NUM_PARALLEL`      | **1** | Single slot guarantees full 32K KV cache. With `=2`, Ollama allocates 2×32K=64K tokens of KV cache, starving GPU layers on 4GB VRAM. |
| `OLLAMA_MAX_LOADED_MODELS` | 1     | Prevents RAM thrashing between models                                                                                                |
| `OLLAMA_KEEP_ALIVE`        | 30m   | Keeps model warm between agent turns                                                                                                 |
| `OLLAMA_CONTEXT_LENGTH`    | 32768 | Full 32K context for long sessions                                                                                                   |
| `OLLAMA_KV_CACHE_TYPE`     | q8_0  | Quantised KV cache — ~50% VRAM savings vs f16                                                                                        |
| `OLLAMA_FLASH_ATTENTION`   | 1     | Faster inference with reduced memory                                                                                                 |
| `OLLAMA_GPU_OVERHEAD`      | 0     | Maximise VRAM allocated to model layers                                                                                              |

### Critical VRAM Rule

**`OLLAMA_NUM_PARALLEL` must equal 1 on 4GB VRAM for reliable 32K context.**

With `NUM_PARALLEL=2`, Ollama allocates KV cache for **both slots simultaneously** (2×32K = 64K tokens). On 4GB VRAM this causes:

- GPU layer starvation (fewer layers offloaded)
- KV cache thrashing to system RAM
- Silent context truncation or OOM on long conversations
- The model appears to work but produces degraded results

Tradeoff: sequential request processing (one agent at a time). A slow result is better than no result.

### Custom Model: `qwen3.5:35b-a3b-32t`

Built from `Modelfile` in project root:

```
FROM qwen3.5:35b-a3b
PARAMETER num_thread 32
PARAMETER num_gpu 3
```

Qwen 3.5 35B-A3B is a Mixture-of-Experts model (35B total parameters, 3B active per token). Sets `num_thread=32` to maximise CPU utilisation on the 24-thread i9-13900K (hyperthreading gives 32 logical cores).

`num_gpu=3` pins exactly 3 of 41 model layers to the GPU (layers 37–39), matching the GTX 1650's 4 GB VRAM capacity at 32K context. Without this pin, Ollama's scheduler defaults to `num_gpu=99` ("try all layers"), which OOM-kills the runner when VRAM is insufficient. The 90%/10% CPU/GPU split is the stable equilibrium for this hardware.

To rebuild after changes:

```bash
ollama pull qwen3.5:35b-a3b
ollama create qwen3.5:35b-a3b-32t -f Modelfile
```

> The `Modelfile` is tracked in git at the project root. If `qwen3.5:35b-a3b-32t` needs recreating on a new machine, this file provides the complete definition.

## Error Handling Architecture

### Three-Layer Error Detection

1. **HTTP Status (model-injector):** 13 error codes (400–504) with graduated cooldowns (60s–86400s)
2. **Stream-Embedded Errors (model-injector):** 15+ patterns detected via 256-byte sliding tail buffer across chunk boundaries
3. **Short Stream Heuristic (model-injector):** Streams < 5s and < 2000 bytes treated as silent failures

### In-Session Failover (ANQ-194)

The model-injector implements transparent mid-session provider switching:

- **Point A:** Provider already cooled/tried → select next, retry immediately
- **Point B:** HTTP error from upstream → write cooldown, drain response, select next, retry
- **Max 3 failover attempts** per request
- Stream-embedded errors (Point C) cannot fail over (headers already sent) — cooldowns written for next request

### Cooldown Escalation

Cooldowns are proportional to error persistence:

| Duration | Errors                            | Rationale                                                                                |
| -------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| 60s      | 408 Timeout                       | Transient — brief skip                                                                   |
| 120s     | 429, 502, 504, service overload   | Rate limit / transient upstream                                                          |
| 180s     | 500, 503                          | LiteLLM bugs, service down                                                               |
| 300s     | 400, 404, 422                     | Config/format errors                                                                     |
| 600s     | 403, 413, context_length_exceeded | Content/size persistent                                                                  |
| 1800s    | 401, insufficient_quota           | Auth/quota — won't self-heal                                                             |
| 3600s    | 402 Payment Required              | Credits exhausted                                                                        |
| 14400s   | Gemini free_tier quota            | Daily limit — capped at 4hr (was 24hr; reduced to prevent prolonged provider starvation) |

## Rate-Limit Cooldown Cap

The credit-gate's `is_rate_limited()` enforces a **maximum cooldown cap of 4 hours** (`MAX_COOLDOWN_CAP_SECS=14400`). When a provider's cooldown expiry exceeds `now + 4hr`, the credit-gate rewrites the cooldown file to `now + 4hr` using atomic temp+mv writes.

This prevents stale or excessively long cooldowns (e.g. Gemini's original 24hr daily-limit cooldown) from blocking providers indefinitely. The cap was introduced after observing that all 7 cloud providers could become simultaneously rate-limited overnight, creating a death spiral where:

1. Aggressive cooldowns (especially Gemini at 24hr) blocked providers long after they recovered
2. LiteLLM proxy became unresponsive, blocking the local Ollama fallback
3. Every Symphony retry hit `exit 1` → guardian drained → re-fed → repeat
4. The retry loop generated email storms (10+ notifications over 8 hours)

## Ollama Short-Stream Exemption

The model-injector's short-stream heuristic (streams < 5s and < 2000 bytes treated as silent failures) now **exempts the local Ollama provider** (`litellm-ollama`). Local models may legitimately produce short responses (e.g. single-line fixes) without indicating a rate-limit or provider error. Without this exemption, successful Ollama completions were being falsely flagged as failures, writing cooldowns that blocked the last-resort fallback.

## Operational Lessons Learned

### 1. Always Verify Before Removing

The GitHub Models removal incident: `Meta-Llama-3.1-8B-Instruct` was removed assuming it had 8K context (based on 413 errors). The actual catalog showed **131K input tokens**. The 413 was a payload size issue, not a context limit.

**Prevention:** Always query `models.github.ai/catalog/models` (or equivalent) before changing provider config.

### 2. LiteLLM Provider Support Lags

LiteLLM's `github/` provider has a hardcoded model registry that doesn't update with new GitHub Models offerings. The `openai/` + `api_base` workaround is required for newer models.

**Prevention:** Test through LiteLLM after every config change. Don't assume prefix routing works for new models.

### 3. VRAM Arithmetic Matters

`OLLAMA_NUM_PARALLEL` multiplies KV cache allocation. On constrained VRAM (4GB), this invisible multiplier can halve effective context without any error message.

**Prevention:** After changing parallel settings, verify with a large-context prompt (~20K tokens) that the model processes it without truncation.

### 4. Probe Strategy Preserves Quota

All provider probes use lightweight `/v1/models` GET listings (not generation requests). This preserves free-tier quotas — burning a generation request on a probe wastes 1/20 of SambaNova's daily quota.

### 5. Systemd Services Need Explicit PATH for nvm

Systemd user services inherit a minimal default PATH that does **not** include nvm-managed Node.js binaries. If a service's `ExecStart` runs through `bash -lc`, the initial shell loads nvm, but child processes spawned via `spawnSync` inherit the systemd environment — not the shell's.

**Symptom:** `npm`/`npx` commands fail in 1–2ms with exit code -1 (ENOENT) while `node` commands succeed.

**Fix:** Every systemd service that needs npm/npx must include an explicit `Environment=PATH=` line pointing to the nvm bin directory:

```ini
[Service]
Environment=PATH=/home/user/.nvm/versions/node/v22.18.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

**Prevention:** When creating new systemd services, always copy the `PATH` environment from an existing working service (e.g. `anqr-ops-continuous.service`).

### 6. LiteLLM Proxy Liveness Is Critical for Ollama Fallback

The entire provider cascade depends on LiteLLM proxy (`:4010`) being reachable. When it becomes unresponsive, the credit-gate cannot route to the local Ollama model — even though Ollama itself is running fine. This turns a "cloud providers exhausted" situation into a "zero available providers" situation.

**Prevention:** Monitor LiteLLM proxy health as part of the harness. If the proxy is unreachable, restart it before attempting provider cascade.

### 7. Provider Exhaustion Death Spiral

When all cloud providers are rate-limited AND the local fallback path is broken (LiteLLM down), Symphony enters a death spiral:

1. Guardian feeds issue → Symphony picks up → credit-gate exhausts all providers → exit 1
2. Issue enters retry queue → guardian drains after overflow → re-feeds
3. Each cycle generates escalation/drain email notifications
4. 10+ emails over 8 hours with zero productive work

**Prevention:** The escalation threshold was increased from 30 min to 60 min, and rate-limit cooldowns are now capped at 4 hours to ensure providers recover faster.

### 8. Sonar Batch Issues Must Be Right-Sized for the Model

Large Sonar batches (e.g. S3776 with 182 findings, or hotspot batches with 136 findings) exceed the cognitive capacity of small/free-tier models. These issues repeatedly fail, enter retry, get escalated, and clog the pipeline.

**Prevention:** The guardian now extracts finding counts from issue titles (patterns like `N findings` or `total N`) and treats issues with >20 findings as oversized. Oversized issues are not fed into Symphony — they must be broken into file-scoped or rule-scoped child issues first.

### 9. Drain/Re-Feed Loop Is a Death Spiral Amplifier

Without per-issue drain tracking, the guardian creates a tight 5-minute drain/re-feed loop during provider exhaustion:

1. Guardian feeds issue into Symphony → provider fails → issue enters retry queue
2. Guardian drains issue from Symphony (overflow or retry-queue health)
3. Next guardian pass (5 min later) re-feeds the same issue → repeat
4. Each cycle generates escalation and drain email notifications

**Prevention:** Per-issue drain tracking (`drain-tracking-state.json`) records every drain event with timestamp and reason. A 30-minute re-feed cooldown (`GUARDIAN_REFEED_COOLDOWN_MS`) prevents recently-drained issues from being re-fed. A circuit breaker (`GUARDIAN_DRAIN_CIRCUIT_BREAKER=3`) parks issues in Pending after 3+ drains in 6 hours, with an AI Hint comment explaining the pattern.

### 10. Parent Issue Hygiene

Linear parent issues were marked Done with incomplete children. This masks remaining work and breaks the feedback loop.

**Prevention:** The guardian validates parent/child completion consistency on every cycle (child-parent linkage audit).

## Known Gaps & Risk Register

| #   | Gap                                             | Risk                                                                         | Mitigation                                                                        |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | No automated cascade integration test           | Provider failover regression invisible                                       | Create test that simulates provider failure                                       |
| 2   | Cerebras 8K context unverified                  | Long conversations silently fail on Cerebras                                 | Cerebras is position 6 (deprioritised); verify via API                            |
| 3   | No VRAM utilization health check                | KV cache overflow invisible                                                  | Add `nvidia-smi` VRAM check to harness report                                     |
| 4   | No provider routing smoke test                  | LiteLLM prefix breaks on upgrade                                             | Add startup test for all 9 provider aliases                                       |
| 5   | No cumulative quota tracking                    | Can't predict when providers will exhaust                                    | Read cooldown files in harness report (ANQ-198)                                   |
| 6   | `OPENROUTER_API_KEY` env var missing            | `OPENROUTER_TOKEN` is set but variable naming inconsistency                  | Credit-gate handles both; document the mapping                                    |
| 7   | GitHub Models incompatible with `/v1/responses` | Provider skipped on every Codex request, only usable for `/chat/completions` | Pre-excluded via `_RESPONSES_INCOMPATIBLE_PROVIDERS`; track upstream LiteLLM fix  |
| 8   | LiteLLM `ollama/` prefix drops tool_calls       | Ollama fallback silently fails function calling if using wrong prefix        | Fixed: use `openai/` prefix with `/v1` api_base (see Ollama Tool-Call Fix)        |
| 9   | Rate-limit cooldown staleness (RESOLVED)        | Providers blocked for 24hr+ after daily limits                               | Fixed: 4hr cap in credit-gate + reduced Gemini cooldown at source                 |
| 10  | Ollama false-positive rate-limiting (RESOLVED)  | Short Ollama responses triggered cooldowns on last-resort fallback           | Fixed: exempted `litellm-ollama` from short-stream heuristic                      |
| 11  | No LiteLLM proxy liveness check in harness      | Proxy death blocks all Ollama routing silently                               | Add LiteLLM health probe to continuous harness profile                            |
| 12  | Drain/re-feed loop amplification (RESOLVED)     | Issues drained and re-fed every 5 min during provider exhaustion             | Fixed: per-issue drain tracking, 30-min re-feed cooldown, 3-drain circuit breaker |

## Continuous Evolution Procedures

### Adding a New Provider

1. Verify model capabilities via API catalog (context window, tool-calling)
2. Add entry to `litellm-config.yaml` with `additional_drop_params`
3. Add probe function to `codex-credit-gate.sh`
4. Add fallback block to credit-gate cascade (position based on quality/speed)
5. Add to `_MODEL_PROVIDER_MAP` and `_PROVIDER_FALLBACK_CHAIN` in `model-injector-proxy.py`
6. Restart LiteLLM and test through the proxy
7. Update this doc, `docs/operations/ops-autopilot.md`, and provider matrix
8. Create Linear issue to track if needed

### Upgrading a Model

1. Query provider catalog for the new model's limits
2. Test through LiteLLM (`curl localhost:4010/v1/chat/completions`)
3. Update `litellm-config.yaml` model name
4. Update credit-gate probe model name
5. Update `model-injector-proxy.py` aliases if changed
6. Restart services and verify
7. Update docs

### Removing a Provider

> **STOP: Query the provider's model catalog first. Verify the removal reason is valid.**

1. Confirm removal reason with evidence (API response, not assumption)
2. Remove from `litellm-config.yaml`
3. Remove probe function and fallback block from `codex-credit-gate.sh`
4. Remove from `_MODEL_PROVIDER_MAP` and `_PROVIDER_FALLBACK_CHAIN`
5. Clean up env var references in docs
6. Restart and test cascade still works

### Monthly Health Check

1. Verify all provider tokens are still valid (probe each API)
2. Check for new free-tier models with better context/quality
3. Review cooldown frequency in logs (`journalctl --user -u model-injector-proxy`)
4. Verify VRAM utilization is stable (`nvidia-smi`)
5. Check Linear for unresolved pipeline issues
6. Run cascade end-to-end test
