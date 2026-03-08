# ANQR Ops Autopilot

This repository runs autonomous operational checks via user-level systemd timers.

## Services

- `anqr-linear-guardian.timer`
  - cadence: every 15 minutes
  - action: enforce required labels across ANQ projects; enforce `Codex` as project lead **only when Codex credits are available** (checked via Symphony dashboard)
  - command: `node scripts/ops/linear-guardian.mjs --apply`

- `anqr-ops-continuous.timer`
  - cadence: every 1 hour
  - action: run continuous ops profile (including Groq + Gemini + Hugging Face + Ollama free-tier audits); results saved to `reports/nightly/`
  - command: `node scripts/ops/nightly-ops-pass.mjs --profile=continuous`

- `anqr-ops-nightly.timer`
  - cadence: daily at 02:30
  - action: run deep ops profile (includes unit tests + all free-tier audits); results saved to `reports/nightly/`
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
| **Symphony ticket work (GitHub Models fallback)**    | **Continuous** | **Free**  | **7th fallback; requires `GITHUB_MODELS_TOKEN`; GPT-4.1-mini (1M context)** |
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

## Codex Credit Gate (Codex → Groq → Mistral Codestral → Gemini → OpenRouter FREE → SambaNova → Cerebras → GitHub Models (GPT-4.1-mini) → Ollama Fallback)

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
9. **Credits exhausted + GitHub Models reachable** → `github-gpt41-mini` via LiteLLM (free tier, GPT-4.1-mini, 1M input / 32K output).
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
- GitHub Models uses `openai/` prefix with `api_base: https://models.github.ai/inference` in LiteLLM config (not `github/` prefix) because LiteLLM's built-in GitHub provider doesn't recognise GPT-4.1-mini yet. LiteLLM strips `openai/` and sends `gpt-4.1-mini` to the GitHub API.

| Provider            | API           | Endpoint                                           | Requirement                     | Free Tier Limits      | Context (in/out) |
| ------------------- | ------------- | -------------------------------------------------- | ------------------------------- | --------------------- | ---------------- |
| OpenAI (Codex)      | Responses     | `api.openai.com/v1`                                | Codex credits                   | Paid                  | 1M / 32K |
| Groq                | OpenAI-compat | `api.groq.com/openai/v1`                           | `GROQ_TOKEN` env var            | 12K TPM               | 128K / 32K |
| Cerebras            | OpenAI-compat | `api.cerebras.ai/v1`                               | `CEREBRAS_TOKEN` env var        | 1M tokens/day         | 8K / 8K (⚠️) |
| Gemini              | Native gemini/ | `generativelanguage.googleapis.com/v1beta` (via LiteLLM) | `GEMINI_TOKEN` env var          | ~10 RPM, ~1,500 RPD  | 1M / 65K |
| OpenRouter (FREE)   | OpenAI-compat | `openrouter.ai/api/v1`                             | `OPENROUTER_TOKEN` env var      | 20 req/min (:free)    | 128K / 32K |
| SambaNova           | OpenAI-compat | `api.sambanova.ai/v1`                              | `SAMBANOVA_TOKEN` env var       | 20 req/day            | 128K / 32K |
| Mistral (Codestral) | OpenAI-compat | `api.mistral.ai/v1`                                | `MISTRAL_TOKEN` env var         | Free experimental     | 128K / 32K |
| GitHub Models       | OpenAI-compat | `models.github.ai`                                 | `GITHUB_MODELS_TOKEN` env var   | FREE tier (GPT-4.1-mini); `/chat` only, no `/responses` | 1M / 32K |
| Ollama              | Responses     | `localhost:11434/v1`                               | Ollama running locally          | Unlimited (local)     | 32K / 32K |

> **Context window requirement:** All providers must support ≥32K input context for reliable long agent sessions. Cerebras (8K) is deprioritised to position 6 in the cascade. See [`docs/harness/provider-operations.md`](harness/provider-operations.md) for the full verified provider matrix and operational procedures.

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
| `GITHUB_MODELS_MODEL`    | `gpt-4.1-mini`                                     | Model to use via GitHub Models (1M input, 32K output, FREE tier)                            |
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
3. `llama3.1:8b` — general-purpose with tool support (4.7 GB)

> **Note:** `qwen2.5-coder:3b` and `llama3.1:8b-32k` were removed from the
> preferred lists and LiteLLM config — they are not installed on the current
> system and caused 404 errors on every selection attempt.

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
- **Split timeouts**: 60s connect timeout, 600s read timeout
- **Thread-safe cooldown writes**: atomic temp+mv with PID+thread-ID uniqueness
- **Connection refused → 502**: immediate upstream-unavailable response
- **Generic exception → 500**: catch-all for unexpected proxy errors
- **Gemini free-tier 24hr cooldown**: detects `free_tier` quota exhaustion and writes 86400s cooldown (vs 120s for normal 429s)
- **Deduplicated logging**: HTTP status cooldowns suppress redundant stream-body scanning for the same request

#### In-Session Provider Failover (ANQ-194)

The model-injector implements **transparent mid-session provider failover**.
When a provider fails during a `POST /v1/responses` request, the proxy
automatically switches to the next healthy provider without Codex knowing:

**Failover points:**

- **Point A (pre-request):** Provider is already in cooldown or was already
  tried this request → select next provider from the fallback chain, update
  `current-model`, and retry immediately
- **Point B (HTTP error):** Upstream returned 4xx/5xx → write cooldown for
  the failed provider, drain the error response, select next provider, retry

**Constraints:**
- `MAX_FAILOVER_ATTEMPTS = 3` — at most 3 provider switches per request
- Stream-embedded errors (Point C) **cannot** fail over — response headers
  already sent to Codex; cooldowns are written for the next request
- Non-`/responses` requests (GET /models, etc.) skip the failover loop

**Fallback chain** (matches credit-gate priority):

```
groq → mistral → gemini → gemini-lite → openrouter-free → sambanova → cerebras → github (gpt-4.1-mini) → ollama
```

When all providers in the chain are cooled down or tried, returns 503 with
a 2s throttle (same as the old circuit breaker behavior).

**Impact:** A single Codex session can survive multiple provider failures
without Symphony needing to restart the session. Prevents the death spiral
where rapid session cycling burns through all provider quotas in minutes.

```
[model-injector] Failover A: groq cooled/tried → switching to mistral
[model-injector] Failover B: mistral returned 429 → switching to gemini
```

#### Configuration

| Parameter | Value | Location |
| --------- | ----- | -------- |
| `CONNECT_TIMEOUT` | 60s | `model-injector-proxy.py` |
| `READ_TIMEOUT` | 600s | `model-injector-proxy.py` |
| `RATELIMIT_WINDOW` | 60s | `model-injector-proxy.py` |
| `RATELIMIT_THRESHOLD` | 1 | `model-injector-proxy.py` |
| `MAX_FAILOVER_ATTEMPTS` | 3 | `model-injector-proxy.py` |

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
| `OLLAMA_NUM_PARALLEL`      | `1`     | Single slot — guarantees full 32K context per request on 4GB VRAM |
| `OLLAMA_MAX_LOADED_MODELS` | `1`     | Keep one model in memory to avoid RAM thrashing               |
| `OLLAMA_KEEP_ALIVE`        | `30m`   | Keep model warm between agent turns                           |
| `OLLAMA_CONTEXT_LENGTH`    | `32768` | 32K context for long agent sessions                             |
| `OLLAMA_KV_CACHE_TYPE`     | `q8_0`  | Quantised KV cache to save VRAM                               |
| `OLLAMA_FLASH_ATTENTION`   | `1`     | Enable flash attention for faster inference                   |
| `OLLAMA_GPU_OVERHEAD`      | `0`     | Maximise VRAM allocated to model layers                       |

With a GTX 1650 (4 GB VRAM), the `qwen2.5-coder:7b-32t` model runs at roughly **51% CPU / 49% GPU** split (~2.5 GB VRAM used, GPU at 100%). `OLLAMA_NUM_PARALLEL=1` ensures each request gets the full 32K KV cache — with `NUM_PARALLEL=2` the doubled KV allocation (2×32K=64K tokens) starves VRAM. The tradeoff is sequential request processing, but a slow result is better than no result.

**Important:** Do not set `CUDA_VISIBLE_DEVICES=-1` or `OLLAMA_LLM_LIBRARY=cpu_avx2` — these disable GPU offload entirely and were removed to enable hybrid inference.

## Provider Operations Knowledge Base

Comprehensive provider configuration, verified capabilities, LiteLLM routing workarounds, VRAM tuning rationale, error handling architecture, and continuous evolution procedures are documented in:

→ **[`docs/harness/provider-operations.md`](harness/provider-operations.md)**

This includes the verified provider context window matrix, operational lessons learned, known gaps / risk register, and step-by-step procedures for adding, upgrading, or removing providers.

## Harness Report (FACE-BPH)

The harness report is a unified health check across 22 domains — see [`docs/harness/autonomous-framework.md`](harness/autonomous-framework.md) for full details.

- **Quick** (4 checks, ~30s): `make harness:quick`
- **Continuous** (8 checks, ~3min): runs hourly via `nightly-ops-pass.mjs --profile=continuous`
- **Full** (22 checks, ~15min): runs nightly via `nightly-ops-pass.mjs --profile=full`

The sentinel (ANQ-105) reads `reports/harness/latest.json` and creates corrective PARENT/CHILD issues for failures and regressions. This closes the autonomous feedback loop: checks detect problems → sentinel creates issues → agents fix them → next check confirms the fix.

## Email Notification System (Bidirectional)

ANQR has a bidirectional email interface for operator communication:

### Outbound Notifications (ANQR → Operator)

Ops scripts send email notifications via `msmtp` to `matthew.aldous@gmail.com` on notable events:

| Source | Event | Severity |
| ------ | ----- | -------- |
| `nightly-ops-pass.mjs` | Critical step failure (any profile) | critical |
| `nightly-ops-pass.mjs` | All checks passed (full profile, daily) | info |
| `linear-guardian.mjs` | Sentinel dead man's switch triggered | critical |
| `email-ingest.mjs` | Issues created from inbound emails | info |

**Rate limiting** (per `reports/notify/state.json`):
- Max 10 emails per hour
- Max 30 emails per day
- Same-subject deduplication within 1 hour

Library: `scripts/ops/lib/notify.mjs` — import `sendNotification({ subject, body, severity })`.

### Inbound Issue Creation (Operator → ANQR)

Emails sent from/to `email@anqr.link` (arriving in the Gmail inbox) are ingested and turned into actionable Linear issues:

1. `anqr-email-ingest.timer` runs every 5 minutes
2. `mbsync gmail` syncs mail, `notmuch new` indexes
3. Searches: `(from:email@anqr.link OR to:email@anqr.link) AND tag:inbox AND NOT tag:anqr-processed`
4. For each match: creates a raw `[EMAIL]` Linear issue for initial capture
5. Tags processed emails with `anqr-processed`, removes `inbox` tag
6. Sends confirmation notification listing created `[EMAIL]` issues
7. Symphony reads the `[EMAIL]` issue, interprets the request, and creates a NEW properly-titled actionable issue that **quotes the original email** in the description

> **Critical convention:** Symphony NEVER sends emails autonomously. Outbound email is operator-only. When an email requests a response (e.g. "send me a summary"), Symphony generates the content and posts it to the Linear issue. A human operator can then forward it via email if needed.

**Setup:**
```bash
make ops:email:install   # Install and enable systemd timer
make notify:test         # Test outbound email delivery
make email:ingest        # Run ingest manually
```

**To create an issue via email:** Send an email from an allowed address to `email@anqr.link`. The email is ingested as a raw `[EMAIL]` issue, then Symphony interprets it into a properly-scoped actionable issue quoting the original email.

**Sender whitelist:** Only emails from addresses in the `ALLOWED_SENDERS` list (currently `matthew.aldous@gmail.com`, `alexander.emmalyn.thomas@gmail.com`) are processed. Emails from unauthorized senders are tagged as processed and silently skipped to prevent spam or arbitrary issue creation.

- `anqr-email-ingest.timer`
  - cadence: every 5 minutes
  - action: sync mail via mbsync, process inbound emails from email@anqr.link → Linear issues
  - command: `node scripts/ops/email-ingest.mjs`

## Reports

- Harness report: `reports/harness/latest.json` (+ timestamped history)
- Continuous/nightly reports: `reports/nightly/<timestamp>/summary.{json,md}`
- Latest run summary: `reports/nightly/latest.json`
- Email ingest report: `reports/email-ingest/latest.json`
- Notification state: `reports/notify/state.json`
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
- `make notify:test` — test outbound email delivery
- `make email:ingest` — process inbound emails → Linear issues
- `make ops:email:install` — install email ingest systemd timer

## Timer Administration

```bash
systemctl --user list-timers --all | rg 'anqr-(linear-guardian|ops-continuous|ops-nightly)'
systemctl --user status anqr-linear-guardian.service
systemctl --user status anqr-ops-continuous.service
systemctl --user status anqr-ops-nightly.service
systemctl --user status anqr-email-ingest.service
```
