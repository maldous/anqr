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

The `creditStatus` and `leadSkipReason` fields in `reports/linear-guardian/latest.json` report the decision made each run.

## Free-Tier Fallback Chain

When Codex credits are exhausted, the following services continue running at zero or near-zero cost:

| Service                                        | Cadence        | Cost      | Status                                                  |
| ---------------------------------------------- | -------------- | --------- | ------------------------------------------------------- |
| **Symphony ticket work (OpenRouter fallback)** | **Continuous** | **~Free** | **1st fallback; requires `OPENROUTER_TOKEN`**           |
| **Symphony ticket work (Gemini fallback)**     | **Continuous** | **Free**  | **2nd fallback; requires `GEMINI_TOKEN`**               |
| **Symphony ticket work (Groq fallback)**       | **Continuous** | **Free**  | **3rd fallback; requires `GROQ_TOKEN`**                 |
| **Symphony ticket work (Ollama fallback)**     | **Continuous** | **Free**  | **4th fallback; requires Ollama on `localhost:11434`**  |
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

## Codex Credit Gate (Codex → OpenRouter → Gemini → Groq → Ollama Fallback)

Symphony's `codex.command` in `WORKFLOW.md` points to `scripts/ops/codex-credit-gate.sh` — a wrapper that cascades through providers to ensure ticket work continues even when Codex cloud credits are exhausted.

**Flow:**

1. Check Symphony dashboard (`http://127.0.0.1:4040`) for credit status.
2. **Credits available** → `exec codex --model gpt-5.3-codex app-server` (full cloud model).
3. **Credits exhausted + OpenRouter reachable** → `exec codex -c model_provider=openrouter -m google/gemini-2.0-flash-001 app-server` (has budget, most reliable fallback).
4. **Credits exhausted + Gemini reachable** → `exec codex -c model_provider=gemini -m gemini-2.0-flash app-server` (free tier, Google cloud).
5. **Credits exhausted + Groq reachable** → `exec codex -c model_provider=groq -m llama-3.3-70b-versatile app-server` (free tier, 12K TPM limit).
6. **Credits exhausted + Ollama reachable** → auto-select the best available local model, then `exec codex -c model_provider=ollama -m <best> app-server` (free local model).
7. **All providers exhausted** → exit 1 (Symphony will retry with backoff).
8. **Dashboard unreachable** → fall through to free providers (fail-closed).

**Provider requirements:**

All fallback providers are configured in `~/.codex/config.toml` via `[model_providers.*]` sections. The credit gate uses `--config model_provider=X` to select the active provider at runtime.

| Provider       | API           | Endpoint                                           | Requirement                |
| -------------- | ------------- | -------------------------------------------------- | -------------------------- |
| OpenAI (Codex) | Responses     | `api.openai.com/v1`                                | Codex credits              |
| OpenRouter     | Responses     | `openrouter.ai/api/v1`                             | `OPENROUTER_TOKEN` env var |
| Gemini         | OpenAI-compat | `generativelanguage.googleapis.com/v1beta/openai/` | `GEMINI_TOKEN` env var     |
| Groq           | OpenAI-compat | `api.groq.com/openai/v1`                           | `GROQ_TOKEN` env var       |
| Ollama         | Responses     | `localhost:11434/v1`                               | Ollama running locally     |

**Environment variables:**

| Variable                 | Default                                            | Purpose                                                                                     |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `CODEX_BIN`              | `/home/user/.nvm/versions/node/v22.18.0/bin/codex` | Path to the codex CLI binary                                                                |
| `CODEX_MODEL`            | `gpt-5.3-codex`                                    | Cloud model to use when credits are available                                               |
| `SYMPHONY_DASHBOARD_URL` | `http://127.0.0.1:4040`                            | Symphony observability dashboard                                                            |
| `GROQ_TOKEN`             | _(from symphony env)_                              | Groq API key; exported as `GROQ_API_KEY` for Codex                                          |
| `GROQ_MODEL`             | `llama-3.3-70b-versatile`                          | Model to use via Groq                                                                       |
| `GEMINI_TOKEN`           | _(from symphony env)_                              | Gemini API key; exported as `GEMINI_API_KEY` for Codex                                      |
| `GEMINI_MODEL`           | `gemini-2.0-flash`                                 | Model to use via Gemini                                                                     |
| `OPENROUTER_TOKEN`       | _(from symphony env)_                              | OpenRouter API key; exported as `OPENROUTER_API_KEY` for Codex                              |
| `OPENROUTER_MODEL`       | `google/gemini-2.0-flash-001`                      | Model to use via OpenRouter                                                                 |
| `OLLAMA_HOST`            | `http://127.0.0.1:11434`                           | Ollama API base URL                                                                         |
| `OLLAMA_MODEL`           | _(auto-selected)_                                  | Model to use in Ollama fallback; if unset, the best available model is chosen automatically |

**Ollama auto-model selection** (when `OLLAMA_MODEL` is not set):

The credit gate queries Ollama's `/api/tags` endpoint and picks the best available model that supports tool calling, in this priority order:

1. `qwen2.5-coder:7b` — best quality for tool-calling tasks (4.7 GB)
2. `qwen2.5-coder:3b` — faster, lighter (2 GB)
3. `llama3.1:8b` — general-purpose with tool support (4.7 GB)

Models without tool-calling support (e.g. `deepseek-coder:*`) are excluded because Codex requires function/tool calling.

To override the auto-selection:

```bash
export OLLAMA_MODEL=qwen2.5-coder:7b
```

## Reports

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
