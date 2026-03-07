# ANQR Ops Autopilot

This repository runs autonomous operational checks via user-level systemd timers.

## Services

- `anqr-linear-guardian.timer`
  - cadence: every 15 minutes
  - action: enforce required labels across ANQ projects; enforce `Codex` as project lead **only when Codex credits are available** (checked via Symphony dashboard)
  - command: `node scripts/ops/linear-guardian.mjs --apply`

- `anqr-ops-continuous.timer`
  - cadence: every 1 hour
  - action: run continuous ops profile (including Groq + Gemini + Hugging Face + Ollama free-tier audits) and post summary to `ANQ-39`
  - command: `node scripts/ops/nightly-ops-pass.mjs --profile=continuous`

- `anqr-ops-nightly.timer`
  - cadence: daily at 02:30
  - action: run deep ops profile (includes unit tests + all free-tier audits) and post summary to `ANQ-39`
  - command: `node scripts/ops/nightly-ops-pass.mjs --profile=full`

## Credit-Aware Lead Enforcement

The Linear guardian checks the Symphony dashboard (`http://127.0.0.1:4040`) for Codex credit status before enforcing project lead assignment:

- **Credits available** → enforce Codex as project lead (normal behavior)
- **Credits exhausted** → skip lead enforcement, labels still enforced
- **Dashboard unreachable** → proceed with lead enforcement (fail-open)
- **`GUARDIAN_SKIP_LEAD=1`** → unconditionally skip lead enforcement

This prevents the review-loop problem where Symphony spawns Codex sessions for tickets in `Human Review` / `In Review` but Codex cannot work due to exhausted credits.

> **Note:** The workflow is fully autonomous — issues advance directly from execution to `Merging` → `Done` without stopping for human review. The only exception is payment/billing issues (labels: `payment`, `billing`, `paid`), which still require human approval via `Human Review`.

The `creditStatus` and `leadSkipReason` fields in `reports/linear-guardian/latest.json` report the decision made each run.

## Free-Tier Fallback Chain

When Codex credits are exhausted, the following services continue running at zero or near-zero cost:

| Service                                              | Cadence        | Cost      | Status                                                  |
| ---------------------------------------------------- | -------------- | --------- | ------------------------------------------------------- |
| **Symphony ticket work (Groq fallback)**             | **Continuous** | **Free**  | **1st fallback; requires `GROQ_TOKEN`**                 |
| **Symphony ticket work (Mistral Codestral fallback)** | **Continuous** | **Free**  | **2nd fallback; requires `MISTRAL_TOKEN`; Codestral code model (~600ms)** |
| **Symphony ticket work (Gemini fallback)**           | **Continuous** | **Free**  | **3rd fallback; requires `GEMINI_TOKEN`; gemini-2.5-flash (~1,500 RPD)** |
| **Symphony ticket work (OpenRouter FREE fallback)**  | **Continuous** | **Free**  | **4th fallback; requires `OPENROUTER_TOKEN`; :free models** |
| **Symphony ticket work (SambaNova fallback)**        | **Continuous** | **Free**  | **5th fallback; requires `SAMBANOVA_TOKEN`; 20 req/day** |
| **Symphony ticket work (Cerebras fallback)**         | **Continuous** | **Free**  | **6th fallback; requires `CEREBRAS_TOKEN`; 1M tok/day, 8K context** |
| **Symphony ticket work (GitHub Models fallback)**    | **Continuous** | **Free**  | **7th fallback; requires `GITHUB_MODELS_TOKEN`** |
| **Symphony ticket work (Ollama fallback)**           | **Continuous** | **Free**  | **8th fallback; requires Ollama on `localhost:11434`**  |
| Linear guardian (labels only)                  | 15 min         | Free      | Always runs                                             |
| TypeScript typecheck                           | Hourly         | Free      | Always runs                                             |
| Sentry regression check                        | Hourly         | Free      | Always runs                                             |
| External services validation                   | Hourly         | Free      | Always runs                                             |
| Groq free-tier audit                           | Hourly         | Free      | Requires `GROQ_TOKEN`                                   |
| Gemini free-tier audit                         | Hourly         | Free      | Requires `GEMINI_TOKEN`; auto-skips on quota exhaustion |
| Hugging Face free-tier audit                   | Hourly         | Free      | Requires `HUGGING_TOKEN`                                |
| Ollama local GPU audit                         | Hourly         | Free      | Requires Ollama running on `localhost:11434`            |
| Unit test suite                                | Daily 02:30    | Free      | Always runs                                             |

When Codex credits reset (5-hour primary window, weekly secondary window), the credit gate automatically switches back to the full cloud model and the guardian resumes lead enforcement.

## Codex Credit Gate (Codex → Groq → Mistral Codestral → Gemini → OpenRouter FREE → SambaNova → Cerebras → GitHub Models → Ollama Fallback)

Symphony's `codex.command` in `WORKFLOW.md` points to `scripts/ops/codex-credit-gate.sh` — a wrapper that cascades through providers to ensure ticket work continues even when Codex cloud credits are exhausted.

**Flow:**

> **Probe strategy:** All provider availability probes use lightweight `GET /v1/models` listings instead of generation requests. This preserves free-tier quotas by never burning a generation request on a mere availability check.

1. Check Symphony dashboard (`http://127.0.0.1:4040`) for credit status.
2. **Credits available** → `exec codex --model gpt-5.3-codex app-server` (full cloud model).
3. **Credits exhausted + Groq reachable** → `groq-llama-70b` via LiteLLM (free tier, 12K TPM, fastest cloud).
4. **Credits exhausted + Mistral reachable** → `mistral-codestral` via LiteLLM (free experimental tier, Codestral code-optimised, ~600ms).
5. **Credits exhausted + Gemini reachable** → `gemini-flash` via LiteLLM (free tier, gemini-2.5-flash, ~1,500 RPD).
6. **Credits exhausted + OpenRouter FREE reachable** → `openrouter-free` via LiteLLM (free `:free` models, intermittent availability).
7. **Credits exhausted + SambaNova reachable** → `sambanova-llama-70b` via LiteLLM (free tier, 70B model, 20 req/day).
8. **Credits exhausted + Cerebras reachable** → `cerebras-llama-8b` via LiteLLM (free tier, 1M tok/day, 8K context limit — deprioritised for longer sessions).
9. **Credits exhausted + GitHub Models reachable** → `github-llama-8b` via LiteLLM (free tier, rate-limited per model).
10. **Credits exhausted + Ollama reachable** → `<litellm-ollama-alias>` via model-injector + LiteLLM (free local model).
11. **Optional last resort** (`ENABLE_OLLAMA_DIRECT_FALLBACK=1`) → direct Ollama (tool calling may break).
12. **All providers exhausted** → exit 1 (Symphony will retry with backoff).
13. **Dashboard unreachable** → fall through to free providers (fail-closed).

**Provider requirements:**

All fallback providers are configured in `~/.codex/config.toml` via `[model_providers.*]` sections. The credit gate uses `--config model_provider=X` to select the active provider at runtime.

### Injector Proxy Topology

- `litellm-proxy.service` listens on `127.0.0.1:4010`.
- `model-injector-proxy.service` listens on `127.0.0.1:4011` and forwards to `4010`.
- Credit gate points Codex to `http://127.0.0.1:4011`.
- `model-injector-proxy.service` reads `/run/user/<uid>/credit-gate/current-model`, written by `codex-credit-gate.sh`.
- `model-injector-proxy.service` strips `supports_function_calling` and `web_search_options` from `/v1/responses` payloads for provider compatibility.
- `model-injector-proxy.service` transforms `/v1/models` GET responses: adds a `"models"` key mirroring LiteLLM's `"data"` array so Codex CLI's `models_manager` can parse the model list (Codex expects `{"models": [...]}`, LiteLLM returns `{"data": [...]}`).
- `litellm-config.yaml` sets `additional_drop_params: ["web_search_options", "supports_function_calling"]` on all cloud models (Groq, Cerebras, Gemini, Mistral, OpenRouter, SambaNova, GitHub) as defense-in-depth — if the model-injector fails to strip these fields (e.g. body decompression failure), LiteLLM itself drops them before forwarding to the provider.

Do not run `litellm-model-injector.service` at the same time as `model-injector-proxy.service` — both bind `4011` and will flap/restart.

| Provider            | API           | Endpoint                                           | Requirement                     | Free Tier Limits      |
| ------------------- | ------------- | -------------------------------------------------- | ------------------------------- | --------------------- |
| OpenAI (Codex)      | Responses     | `api.openai.com/v1`                                | Codex credits                   | Paid                  |
| Groq                | OpenAI-compat | `api.groq.com/openai/v1`                           | `GROQ_TOKEN` env var            | 12K TPM               |
| Cerebras            | OpenAI-compat | `api.cerebras.ai/v1`                               | `CEREBRAS_TOKEN` env var        | 1M tokens/day         |
| Gemini              | Native gemini/ | `generativelanguage.googleapis.com/v1beta` (via LiteLLM) | `GEMINI_TOKEN` env var          | ~10 RPM, ~1,500 RPD  |
| OpenRouter (FREE)   | OpenAI-compat | `openrouter.ai/api/v1`                             | `OPENROUTER_TOKEN` env var      | 20 req/min (:free)    |
| SambaNova           | OpenAI-compat | `api.sambanova.ai/v1`                              | `SAMBANOVA_TOKEN` env var       | 20 req/day            |
| Mistral (Codestral) | OpenAI-compat | `api.mistral.ai/v1`                                | `MISTRAL_TOKEN` env var         | Free experimental     |
| GitHub Models       | OpenAI-compat | `models.inference.ai.azure.com`                    | `GITHUB_MODELS_TOKEN` env var   | ~150 req/day          |
| Ollama              | Responses     | `localhost:11434/v1`                               | Ollama running locally          | Unlimited (local)     |

**Environment variables:**

| Variable                 | Default                                            | Purpose                                                                                     |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `CODEX_BIN`              | `/home/user/.nvm/versions/node/v22.18.0/bin/codex` | Path to the codex CLI binary                                                                |
| `CODEX_MODEL`            | `gpt-5.3-codex`                                    | Cloud model to use when credits are available                                               |
| `SYMPHONY_DASHBOARD_URL` | `http://127.0.0.1:4040`                            | Symphony observability dashboard                                                            |
| `GROQ_TOKEN`             | _(from symphony env)_                              | Groq API key; exported as `GROQ_API_KEY` for Codex                                          |
| `GROQ_MODEL`             | `llama-3.3-70b-versatile`                          | Model to use via Groq                                                                       |
| `GEMINI_TOKEN`           | _(from symphony env)_                              | Gemini API key; exported as `GEMINI_API_KEY` for Codex                                      |
| `GEMINI_MODEL`           | `gemini-2.5-flash`                                 | Model to use via Gemini (upgraded from deprecated 2.0-flash; lite variant also registered)   |
| `OPENROUTER_TOKEN`       | _(from symphony env)_                              | OpenRouter API key; exported as `OPENROUTER_API_KEY` for Codex                              |
| `OPENROUTER_FREE_MODEL`  | `meta-llama/llama-3.3-70b-instruct:free`           | Free model to use via OpenRouter `:free` tier                                               |
| `MISTRAL_TOKEN`          | _(from symphony env)_                              | Mistral API key; exported as `MISTRAL_API_KEY`                                              |
| `MISTRAL_MODEL`          | `devstral-small-2507`                              | Model to use via Mistral (Codestral code model; fallback: `mistral-small-latest`)           |
| `GITHUB_MODELS_TOKEN`    | _(from symphony env)_                              | GitHub personal access token with `models` permission (separate from `GITHUB_TOKEN`)        |
| `GITHUB_MODELS_MODEL`    | `Meta-Llama-3.1-8B-Instruct`                      | Model to use via GitHub Models                                                              |
| `CEREBRAS_TOKEN`         | _(from symphony env)_                              | Cerebras API key; exported as `CEREBRAS_API_KEY`                                            |
| `CEREBRAS_MODEL`         | `llama3.1-8b`                                      | Model to use via Cerebras                                                                   |
| `SAMBANOVA_TOKEN`        | _(from symphony env)_                              | SambaNova API key; exported as `SAMBANOVA_API_KEY`                                          |
| `SAMBANOVA_MODEL`        | `Meta-Llama-3.3-70B-Instruct`                     | Model to use via SambaNova                                                                  |
| `OLLAMA_HOST`            | `http://127.0.0.1:11434`                           | Ollama API base URL                                                                         |
| `OLLAMA_MODEL`           | _(auto-selected)_                                  | Model to use in Ollama fallback; if unset, the best available model is chosen automatically |
| `ENABLE_OLLAMA_DIRECT_FALLBACK` | `0`                                       | Set to `1` only to allow direct `model_provider=ollama` fallback (known tool-calling risk) |

**Ollama auto-model selection** (when `OLLAMA_MODEL` is not set):

The credit gate queries Ollama's `/api/tags` endpoint and picks the best available model that supports tool calling, in this priority order:

1. `qwen2.5-coder:7b-32t` — custom variant with `num_thread 32` for max CPU utilisation (created via `Modelfile`)
2. `qwen2.5-coder:7b` — base 7B quality for tool-calling tasks (4.7 GB)
3. `qwen2.5-coder:3b` — faster, lighter (2 GB)
4. `llama3.1:8b` — general-purpose with tool support (4.7 GB)

Models without tool-calling support (e.g. `deepseek-coder:*`) are excluded because Codex requires function/tool calling.

To override the auto-selection:

```bash
export OLLAMA_MODEL=qwen2.5-coder:7b-32t
```

### Comprehensive Error-Aware Provider Fallback

The model-injector proxy detects **all 13 HTTP error classes** (400–504)
plus **15+ stream-embedded error patterns** per provider. When an error is
detected, the proxy writes a cooldown file (`$STATE_DIR/ratelimit-<provider>`)
with an expiry timestamp. The credit-gate reads these to skip failing
providers and cascade to the next one.

#### HTTP Status Code Handling

| Code | Error | Cooldown | Rationale |
| ---- | ----- | -------- | --------- |
| 400 | Bad Request | 300s | Provider rejects message format — persistent for conversation |
| 401 | Unauthorized | 1800s | API key invalid/expired — won't self-heal |
| 402 | Payment Required | 3600s | Credits exhausted — very persistent |
| 403 | Forbidden | 600s | Moderation/access denied — persistent for content |
| 404 | Not Found | 300s | Model config broken — needs manual fix |
| 408 | Request Timeout | 60s | Transient — brief skip |
| 413 | Payload Too Large | 600s | Conversation won't shrink — skip longer |
| 422 | Unprocessable Entity | 300s | Request format rejected — same as 400 |
| 429 | Too Many Requests | 120s+ | Rate limit — respects Retry-After header |
| 500 | Internal Server Error | 180s | LiteLLM translation bugs |
| 502 | Bad Gateway | 120s | Transient upstream failure |
| 503 | Service Unavailable | 180s | Service down — moderate |
| 504 | Gateway Timeout | 120s | Upstream timeout — transient |

#### Stream-Embedded Error Detection

LiteLLM may return HTTP 200 for SSE streams, then embed errors in the
stream body. The proxy scans stream chunks (with a 256-byte sliding tail
buffer for cross-chunk detection) for:

- **Status-code-anchored patterns**: `429`+rate/quota, `401`+unauthorized,
  `402`+payment/credits, `403`+forbidden/moderation, `413`+too large,
  `404`+not found, `500`+internal error, `400`+bad request/openrouterexception,
  `502`+bad gateway, `503`+service unavailable, `504`+gateway timeout
- **Keyword-only patterns** (no status code needed): `context_length_exceeded`,
  `maximum context length`, `token limit exceeded`, `insufficient_quota`,
  `quota_exceeded`, `content_policy_violation`, `content_filter`,
  `model_not_found`, `model does not exist`, `model not available`,
  `high demand`, `overloaded`, `at capacity`
- **Short stream heuristic**: streams < 5s and < 2000 bytes treated as failures

#### Additional Robustness Features

- **Retry-After header parsing**: 429 responses use `max(Retry-After, 120s)` as cooldown
- **Split timeouts**: 30s connect timeout, 600s read timeout
- **Thread-safe cooldown writes**: atomic temp+mv with PID+thread-ID uniqueness
- **Connection refused → 502**: immediate upstream-unavailable response
- **Generic exception → 500**: catch-all for unexpected proxy errors

#### Configuration

| Parameter | Value | Location |
| --------- | ----- | -------- |
| `CONNECT_TIMEOUT` | 60s | `model-injector-proxy.py` |
| `READ_TIMEOUT` | 600s | `model-injector-proxy.py` |
| `RATELIMIT_WINDOW` | 60s | `model-injector-proxy.py` |
| `RATELIMIT_THRESHOLD` | 1 | `model-injector-proxy.py` |

Cooldown files auto-expire: the credit-gate deletes them once the expiry
timestamp has passed, so providers are automatically retried after the
cooldown window.

To manually clear a cooldown:
```bash
rm -f /run/user/$(id -u)/credit-gate/ratelimit-groq
```

To clear all cooldowns:
```bash
rm -f /run/user/$(id -u)/credit-gate/ratelimit-*
```

### Ollama GPU Configuration

Ollama is configured for hybrid CPU/GPU inference via `/etc/systemd/system/ollama.service.d/override.conf`:

| Setting                    | Value   | Purpose                                                       |
| -------------------------- | ------- | ------------------------------------------------------------- |
| `OLLAMA_NUM_PARALLEL`      | `2`     | Allow two concurrent requests (matches `max_concurrent_agents`)|
| `OLLAMA_MAX_LOADED_MODELS` | `1`     | Keep one model in memory to avoid RAM thrashing               |
| `OLLAMA_KEEP_ALIVE`        | `30m`   | Keep model warm between agent turns                           |
| `OLLAMA_CONTEXT_LENGTH`    | `8192`  | 8K context (32K was too large for 4GB VRAM — starved GPU layers)|
| `OLLAMA_KV_CACHE_TYPE`     | `q8_0`  | Quantised KV cache to save VRAM                               |
| `OLLAMA_FLASH_ATTENTION`   | `1`     | Enable flash attention for faster inference                   |
| `OLLAMA_GPU_OVERHEAD`      | `0`     | Maximise VRAM allocated to model layers                       |

With a GTX 1650 (4 GB VRAM), the `qwen2.5-coder:7b-32t` model runs at roughly **51% CPU / 49% GPU** split (~2.5 GB VRAM used, GPU at 100%). Warm inference completes in ~2–4 seconds per turn vs 2+ minutes on CPU-only.

**Important:** Do not set `CUDA_VISIBLE_DEVICES=-1` or `OLLAMA_LLM_LIBRARY=cpu_avx2` — these disable GPU offload entirely and were removed to enable hybrid inference.

## Harness Report (FACE-BPH)

The harness report is a unified health check across 22 domains — see [`docs/harness/autonomous-framework.md`](harness/autonomous-framework.md) for full details.

- **Quick** (4 checks, ~30s): `make harness:quick`
- **Continuous** (8 checks, ~3min): runs hourly via `nightly-ops-pass.mjs --profile=continuous`
- **Full** (22 checks, ~15min): runs nightly via `nightly-ops-pass.mjs --profile=full`

The sentinel (ANQ-105) reads `reports/harness/latest.json` and creates corrective PARENT/CHILD issues for failures and regressions. This closes the autonomous feedback loop: checks detect problems → sentinel creates issues → agents fix them → next check confirms the fix.

## Reports

- Harness report: `reports/harness/latest.json` (+ timestamped history)
- Continuous/nightly reports: `reports/nightly/<timestamp>/summary.{json,md}`
- Latest run summary: `reports/nightly/latest.json`
- Linear guardian snapshot: `reports/linear-guardian/latest.json`
- Groq free audit output: `reports/groq-free/latest.md`
- Gemini free audit output: `reports/gemini-free/latest.md`
- Hugging free audit output: `reports/hugging-free/latest.md`
- Ollama local audit output: `reports/ollama-local/latest.md`

## Cost Guardrails

By default, cost/external-release commands are blocked:

- `make deploy`
- `make indexnow`
- `make android:upload`

To explicitly allow one of these (human-approved only):

```bash
ALLOW_PAID_ACTIONS=1 make deploy
```

## Manual Commands

- `make ops:guardian`
- `make ops:continuous`
- `make ops:nightly`
- `make ops:groq`
- `make ops:gemini`
- `make ops:hugging`

## Timer Administration

```bash
systemctl --user list-timers --all | rg 'anqr-(linear-guardian|ops-continuous|ops-nightly)'
systemctl --user status anqr-linear-guardian.service
systemctl --user status anqr-ops-continuous.service
systemctl --user status anqr-ops-nightly.service
```
