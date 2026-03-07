#!/usr/bin/env bash
# ============================================================================
# Codex Credit Gate — credit-aware wrapper for Symphony
# ============================================================================
#
# Symphony calls this script instead of codex directly.
#
# Behavior:
#   1. Check the Symphony dashboard for Codex credit status.
#   2. If credits available → exec codex with the full cloud model.
#   3. If credits exhausted → probe fallback providers best-to-worst:
#        a) Groq            (requires GROQ_TOKEN) — free cloud, fast, via LiteLLM
#        b) Mistral         (requires MISTRAL_TOKEN) — free experimental tier, Codestral code model (~600ms), via LiteLLM
#        c) Gemini          (requires GEMINI_TOKEN) — free cloud tier, gemini-2.5-flash, via LiteLLM
#        d) OpenRouter FREE (requires OPENROUTER_TOKEN) — free :free models, via LiteLLM
#        e) SambaNova       (requires SAMBANOVA_TOKEN) — free cloud, 20 req/day, via LiteLLM
#        f) Cerebras        (requires CEREBRAS_TOKEN) — free cloud, 1M tok/day, 8K context limit, via LiteLLM
#        g) GitHub Models   (requires GITHUB_MODELS_TOKEN) — free, via LiteLLM
#        h) LiteLLM proxy → Ollama (port 4010) — local, via LiteLLM
#        i) Ollama direct (localhost:11434) — local, broken tool calling (opt-in)
#      On each invocation the cascade always starts from (a). Providers that
#      failed within the last 30s are skipped; after the window expires the
#      full list is retried from the top.
#   4. exec codex with the first available provider.
#   5. If ALL providers unavailable → exit 1 (Symphony handles retry/backoff).
#
# IMPORTANT: This script uses `exec` to replace itself with codex. This is
# required because Symphony communicates with Codex via JSON-RPC over the
# spawned port's stdin/stdout. Running codex as a background child would
# break this stdio pipe.
#
# All fallback providers are routed through the LiteLLM proxy (port 4010)
# because Codex CLI v0.110.0's native providers (groq, gemini, openrouter)
# use the Responses API format which these providers don't support.
# LiteLLM translates Responses API → Chat Completions with proper structured
# tool_calls. Provider probes still hit the real APIs directly to check
# availability/quota before selecting.
#
# All paths are configurable via environment variables (see defaults below).
# ============================================================================

set -euo pipefail

# Source symphony env file to ensure all API tokens are available.
SYMPHONY_ENV="${SYMPHONY_ENV:-$HOME/.config/symphony/anqr.env}"
if [ -f "$SYMPHONY_ENV" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$SYMPHONY_ENV"
  set +a
fi

CODEX_BIN="${CODEX_BIN:-/home/user/.nvm/versions/node/v22.18.0/bin/codex}"
CODEX_MODEL="${CODEX_MODEL:-gpt-5.3-codex}"
CODEX_REASONING_EFFORT_CLOUD="${CODEX_REASONING_EFFORT_CLOUD:-medium}"
CODEX_REASONING_EFFORT_LOCAL="${CODEX_REASONING_EFFORT_LOCAL:-low}"
SYMPHONY_DASHBOARD_URL="${SYMPHONY_DASHBOARD_URL:-http://127.0.0.1:4040}"
OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-}"
ENABLE_OLLAMA_DIRECT_FALLBACK="${ENABLE_OLLAMA_DIRECT_FALLBACK:-0}"
# Real provider model names (used only for availability probes)
GROQ_MODEL="${GROQ_MODEL:-llama-3.3-70b-versatile}"
GEMINI_MODEL="${GEMINI_MODEL:-gemini-2.5-flash}"
CEREBRAS_MODEL="${CEREBRAS_MODEL:-llama3.1-8b}"
SAMBANOVA_MODEL="${SAMBANOVA_MODEL:-Meta-Llama-3.3-70B-Instruct}"
OPENROUTER_FREE_MODEL="${OPENROUTER_FREE_MODEL:-meta-llama/llama-3.3-70b-instruct:free}"
MISTRAL_MODEL="${MISTRAL_MODEL:-devstral-small-2507}"
GITHUB_MODELS_MODEL="${GITHUB_MODELS_MODEL:-Meta-Llama-3.1-8B-Instruct}"

# LiteLLM proxy translates Codex Responses API → provider Chat Completions
# with proper structured tool_calls. Codex CLI v0.110.0's native providers
# are broken: they use Responses API format which third-party APIs reject.
# All fallback providers are routed through LiteLLM as model_provider=openai.
# Model injector proxy sits on 4011, forwards to LiteLLM on 4010.
# It injects the default model name into requests where Codex sends model=None
# (Codex CLI v0.110.0 bug: model name not forwarded to Responses API).
LITELLM_HOST="${LITELLM_HOST:-http://127.0.0.1:4011}"
LITELLM_API_KEY="${LITELLM_API_KEY:-}"  # empty — no auth needed for local proxy

# LiteLLM model aliases (must match model_name entries in litellm-config.yaml)
LITELLM_GROQ_MODEL="groq-llama-70b"
LITELLM_GEMINI_MODEL="gemini-flash"
LITELLM_GEMINI_LITE_MODEL="gemini-flash-lite"
LITELLM_CEREBRAS_MODEL="cerebras-llama-8b"
LITELLM_OPENROUTER_FREE_MODEL="openrouter-free"
LITELLM_SAMBANOVA_MODEL="sambanova-llama-70b"
LITELLM_MISTRAL_MODEL="mistral-codestral"
LITELLM_GITHUB_MODEL="github-llama-8b"
LITELLM_OLLAMA_MODEL="${LITELLM_OLLAMA_MODEL:-}"

# Preferred Ollama models in descending quality order (tool-calling capable only).
PREFERRED_OLLAMA_MODELS="qwen2.5-coder:7b-32t qwen2.5-coder:7b qwen2.5-coder:3b llama3.1:8b-32k llama3.1:8b"
DEFAULT_OLLAMA_MODEL="qwen2.5-coder:7b-32t"

# LiteLLM aliases (must exist in litellm-config.yaml)
PREFERRED_LITELLM_OLLAMA_MODELS="qwen2.5-coder-7b-32t qwen2.5-coder-7b qwen2.5-coder-3b llama3.1-8b llama3.1-8b-base"
DEFAULT_LITELLM_OLLAMA_MODEL="qwen2.5-coder-7b-32t"

# Provider failure memory: skip providers that failed recently.
# When the credit-gate selects a provider and the process exits quickly
# (Symphony retries), the next invocation skips that provider.
# NOTE: With max_concurrent_agents > 1, concurrent invocations share the
# same state dir. A slow-starting provider for Agent A could be mistaken
# for a failure by Agent B. Worst case: Agent B skips to Ollama early.
# State files live in a user-private directory (mode 700) to avoid /tmp
# symlink attacks. Writes use atomic temp+mv to prevent corruption under
# concurrent invocations.
STATE_DIR="${XDG_RUNTIME_DIR:-/tmp}/credit-gate"
if mkdir -p "$STATE_DIR" 2>/dev/null; then chmod 700 "$STATE_DIR" 2>/dev/null; fi
STATE_FILE="$STATE_DIR/state"
SKIP_FILE="$STATE_DIR/skip"
FAILURE_WINDOW_SECS=30  # typical rate-limit crashes exit in <10s

# Rate-limit cooldown: model-injector-proxy writes expiry files when a
# provider returns too many 429s. The credit-gate reads these to skip
# rate-limited providers and fall through to the next one.

log() {
  echo "[credit-gate $(date -Iseconds)] $*" >&2
}

# ---------------------------------------------------------------------------
# Check whether Codex credits are available via the Symphony dashboard.
# Returns 0 if credits are available.
# Returns 1 if credits are definitively exhausted.
# Returns 2 if credit status is unknown (dashboard unreachable or no credit signal).
# ---------------------------------------------------------------------------
credits_available() {
  local html attempt
  for attempt in 1 2 3; do
    html=$(curl -sf --max-time 3 "$SYMPHONY_DASHBOARD_URL" 2>/dev/null) && break
    html=""
    if [ "$attempt" -lt 3 ]; then
      sleep 2
    fi
  done

  if [ -z "$html" ]; then
    log "Dashboard unreachable after 3 attempts — treating as credits unknown"
    return 2
  fi

  # Positive match: only return "credits available" if we can confirm has_credits=true.
  if echo "$html" | grep -q '&quot;has_credits&quot; =&gt; true'; then
    return 0
  fi

  # Negative match: explicitly exhausted.
  if echo "$html" | grep -q '&quot;has_credits&quot; =&gt; false'; then
    log "Dashboard confirms Codex credits exhausted (has_credits=false)"
    return 1
  fi

  # Legacy/alternate dashboard shape can expose raw credits without has_credits.
  if echo "$html" | grep -q '&quot;credits&quot; =&gt; 0'; then
    log "Dashboard reports credits=0"
    return 1
  fi

  log "Credit status unknown (dashboard reachable but no explicit credit signal)"
  return 2
}

# ---------------------------------------------------------------------------
# Provider availability probes — lightweight /v1/models listings (not generation requests)
# This preserves free-tier quotas by never burning a generation request on a mere probe.
# ---------------------------------------------------------------------------
groq_available() {
  if [ -z "${GROQ_TOKEN:-}" ] && [ -z "${GROQ_API_KEY:-}" ]; then
    return 1
  fi
  export GROQ_API_KEY="${GROQ_API_KEY:-$GROQ_TOKEN}"
  # Use /v1/models listing instead of a generation request to avoid
  # burning free-tier quota on mere availability probes.
  local resp
  resp=$(curl -sf --max-time 5 \
    -H "Authorization: Bearer $GROQ_API_KEY" \
    "https://api.groq.com/openai/v1/models" 2>/dev/null) || return 1
  echo "$resp" | grep -q "$GROQ_MODEL" 2>/dev/null
}

gemini_available() {
  if [ -z "${GEMINI_TOKEN:-}" ] && [ -z "${GEMINI_API_KEY:-}" ]; then
    return 1
  fi
  export GEMINI_API_KEY="${GEMINI_API_KEY:-$GEMINI_TOKEN}"
  # Use /v1beta/models listing instead of a generation request to avoid
  # burning daily free-tier quota (~1,500 RPD) on mere availability probes.
  local resp
  resp=$(curl -sf --max-time 5 \
    "https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}" 2>/dev/null) || return 1
  echo "$resp" | grep -q "$GEMINI_MODEL" 2>/dev/null
}

cerebras_available() {
  if [ -z "${CEREBRAS_TOKEN:-}" ] && [ -z "${CEREBRAS_API_KEY:-}" ]; then
    return 1
  fi
  export CEREBRAS_API_KEY="${CEREBRAS_API_KEY:-$CEREBRAS_TOKEN}"
  # Use /v1/models listing instead of a generation request to avoid
  # burning free-tier quota on mere availability probes.
  local resp
  resp=$(curl -sf --max-time 5 \
    -H "Authorization: Bearer $CEREBRAS_API_KEY" \
    "https://api.cerebras.ai/v1/models" 2>/dev/null) || return 1
  echo "$resp" | grep -q "$CEREBRAS_MODEL" 2>/dev/null
}

openrouter_free_available() {
  if [ -z "${OPENROUTER_TOKEN:-}" ] && [ -z "${OPENROUTER_API_KEY:-}" ]; then
    return 1
  fi
  export OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-$OPENROUTER_TOKEN}"
  # Use /v1/models listing instead of a generation request to avoid
  # burning free-tier quota on mere availability probes.
  local resp
  resp=$(curl -sf --max-time 5 \
    -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    "https://openrouter.ai/api/v1/models" 2>/dev/null) || return 1
  echo "$resp" | grep -q "$OPENROUTER_FREE_MODEL" 2>/dev/null
}

sambanova_available() {
  if [ -z "${SAMBANOVA_TOKEN:-}" ] && [ -z "${SAMBANOVA_API_KEY:-}" ]; then
    return 1
  fi
  export SAMBANOVA_API_KEY="${SAMBANOVA_API_KEY:-$SAMBANOVA_TOKEN}"
  # Use /v1/models instead of a generation request to avoid burning one of
  # the 20 daily free-tier requests on a mere availability probe.
  local resp
  resp=$(curl -sf --max-time 5 \
    -H "Authorization: Bearer $SAMBANOVA_API_KEY" \
    "https://api.sambanova.ai/v1/models" 2>/dev/null) || return 1
  echo "$resp" | grep -q "$SAMBANOVA_MODEL" 2>/dev/null
}

mistral_available() {
  if [ -z "${MISTRAL_TOKEN:-}" ] && [ -z "${MISTRAL_API_KEY:-}" ]; then
    return 1
  fi
  export MISTRAL_API_KEY="${MISTRAL_API_KEY:-$MISTRAL_TOKEN}"
  # Use /v1/models listing instead of a generation request to avoid
  # burning free-tier quota on mere availability probes.
  local resp
  resp=$(curl -sf --max-time 5 \
    -H "Authorization: Bearer $MISTRAL_API_KEY" \
    "https://api.mistral.ai/v1/models" 2>/dev/null) || return 1
  echo "$resp" | grep -q "$MISTRAL_MODEL" 2>/dev/null
}

github_models_available() {
  if [ -z "${GITHUB_MODELS_TOKEN:-}" ]; then
    return 1
  fi
  # Use /models listing instead of a generation request to avoid
  # burning free-tier quota on mere availability probes.
  local resp
  resp=$(curl -sf --max-time 5 \
    -H "Authorization: Bearer $GITHUB_MODELS_TOKEN" \
    "https://models.inference.ai.azure.com/models" 2>/dev/null) || return 1
  echo "$resp" | grep -q "$GITHUB_MODELS_MODEL" 2>/dev/null
}

ollama_available() {
  local probe_model
  probe_model="${OLLAMA_MODEL:-$(select_ollama_model)}"
  local resp
  resp=$(curl -sf --max-time 10 \
    -H "Content-Type: application/json" \
    -X POST "${OLLAMA_HOST}/v1/chat/completions" \
    -d '{"model":"'"$probe_model"'","messages":[{"role":"user","content":"hi"}],"max_tokens":1}' 2>/dev/null) || return 1
  echo "$resp" | grep -q '"choices"' 2>/dev/null
}

# Check if LiteLLM proxy is reachable (required for all non-Codex fallbacks).
# This is a lightweight health check — individual provider probes still hit
# the real APIs to verify tokens/quotas.
litellm_reachable() {
  # Probe /v1/models instead of /health — the model-injector proxy
  # forwards GET requests but may not handle /health specially.
  curl -sf --max-time 3 "${LITELLM_HOST}/v1/models" >/dev/null 2>&1
}

# ---------------------------------------------------------------------------
# Auto-select the best available Ollama model.
# ---------------------------------------------------------------------------
select_ollama_model() {
  local tags_json available_models model
  tags_json=$(curl -sf --max-time 3 "${OLLAMA_HOST}/api/tags" 2>/dev/null) || {
    echo "$DEFAULT_OLLAMA_MODEL"
    return
  }

  available_models=$(echo "$tags_json" | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
    for m in d.get("models", []):
        print(m["name"])
except Exception:
    pass
' 2>/dev/null) || {
    echo "$DEFAULT_OLLAMA_MODEL"
    return
  }

  for model in $PREFERRED_OLLAMA_MODELS; do
    if echo "$available_models" | grep -qF "$model"; then
      echo "$model"
      return
    fi
  done

  echo "$DEFAULT_OLLAMA_MODEL"
}

select_litellm_ollama_model() {
  local model tags_json
  # Explicit override wins.
  if [ -n "${LITELLM_OLLAMA_MODEL:-}" ]; then
    echo "$LITELLM_OLLAMA_MODEL"
    return
  fi

  tags_json=$(curl -sf --max-time 3 "${OLLAMA_HOST}/api/tags" 2>/dev/null || true)

  # Map available local Ollama tags to LiteLLM aliases.
  for model in $PREFERRED_LITELLM_OLLAMA_MODELS; do
    case "$model" in
      qwen2.5-coder-7b-32t)
        if echo "$tags_json" | grep -q '"name":"qwen2.5-coder:7b-32t"' ; then
          echo "$model"; return
        fi
        ;;
      qwen2.5-coder-7b)
        if echo "$tags_json" | grep -q '"name":"qwen2.5-coder:7b"' ; then
          echo "$model"; return
        fi
        ;;
      qwen2.5-coder-3b)
        if echo "$tags_json" | grep -q '"name":"qwen2.5-coder:3b"' ; then
          echo "$model"; return
        fi
        ;;
      llama3.1-8b)
        if echo "$tags_json" | grep -q '"name":"llama3.1:8b-32k"' ; then
          echo "$model"; return
        fi
        ;;
      llama3.1-8b-base)
        if echo "$tags_json" | grep -q '"name":"llama3.1:8b"' ; then
          echo "$model"; return
        fi
        ;;
    esac
  done

  echo "$DEFAULT_LITELLM_OLLAMA_MODEL"
}

# ---------------------------------------------------------------------------
# Provider failure memory — skip providers that failed on recent invocations
# ---------------------------------------------------------------------------
load_skip_list() {
  SKIP_PROVIDERS=""
  if [ -f "$STATE_FILE" ]; then
    local last_ts last_provider now age
    last_ts=$(head -1 "$STATE_FILE" 2>/dev/null) || return
    last_provider=$(sed -n '2p' "$STATE_FILE" 2>/dev/null) || return
    now=$(date +%s)
    age=$((now - last_ts))
    if [ "$age" -lt "$FAILURE_WINDOW_SECS" ]; then
      # Previous invocation exited quickly — that provider likely failed.
      # Load accumulated skip list and add this provider.
      if [ -f "$SKIP_FILE" ]; then
        SKIP_PROVIDERS=$(cat "$SKIP_FILE")
      fi
      if ! echo "$SKIP_PROVIDERS" | grep -qw "$last_provider"; then
        SKIP_PROVIDERS="${SKIP_PROVIDERS:+$SKIP_PROVIDERS }$last_provider"
      fi
      local skip_tmp="${SKIP_FILE}.$$"
      if echo "$SKIP_PROVIDERS" > "$skip_tmp"; then mv -f "$skip_tmp" "$SKIP_FILE" 2>/dev/null; fi
      log "Recent failure detected (${age}s ago): skipping providers: $SKIP_PROVIDERS"
    else
      # Previous invocation ran long enough — reset skip list.
      rm -f "$SKIP_FILE"
    fi
  fi
}

is_skipped() {
  echo "$SKIP_PROVIDERS" | grep -qw "$1" 2>/dev/null
}

# Check if a provider is rate-limited (429 cooldown written by model-injector).
is_rate_limited() {
  local rl_file="$STATE_DIR/ratelimit-$1"
  [ -f "$rl_file" ] || return 1
  local expiry now
  expiry=$(cat "$rl_file" 2>/dev/null) || return 1
  now=$(date +%s)
  if [ "$now" -lt "$expiry" ]; then
    local remaining=$((expiry - now))
    log "Provider $1 rate-limited (cooldown ${remaining}s remaining)"
    return 0
  fi
  # Cooldown expired — clean up and allow retry.
  rm -f "$rl_file"
  return 1
}

# Record which provider we're about to use. If the process exits quickly,
# the next invocation will see this and skip it.
# Uses atomic temp+mv to avoid corruption under concurrent agents.
# Best-effort: failure here must not prevent exec codex from running.
record_provider() {
  local tmp="${STATE_FILE}.$$"
  if printf '%s\n%s\n' "$(date +%s)" "$1" > "$tmp"; then mv -f "$tmp" "$STATE_FILE" 2>/dev/null; fi
}

load_skip_list

# ---------------------------------------------------------------------------
# Main — probe providers in order, exec the first available one
# ---------------------------------------------------------------------------

credits_available && credit_rc=0 || credit_rc=$?

# --- Cloud model (if credits available) ---
if [ "$credit_rc" -eq 0 ]; then
  log "Codex credits available — using cloud model (${CODEX_MODEL})"
  export ANQR_CONTEXT_MODE="cloud-full"
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c "model_reasoning_effort=$CODEX_REASONING_EFFORT_CLOUD" \
    -c "model=$CODEX_MODEL" \
    app-server
fi

if [ "$credit_rc" -eq 2 ]; then
  # Prefer best model first when status is unknown, but avoid retry loops:
  # if Codex failed quickly on the previous invocation, it will be in SKIP_PROVIDERS.
  if is_skipped codex; then
    log "Credit status unknown and Codex recently failed — using fallback providers"
  else
    log "Credit status unknown — trying cloud model (${CODEX_MODEL}) before fallbacks"
    record_provider codex
    export ANQR_CONTEXT_MODE="cloud-full"
    exec "$CODEX_BIN" \
      --dangerously-bypass-approvals-and-sandbox \
      -c shell_environment_policy.inherit=all \
      -c "model_reasoning_effort=$CODEX_REASONING_EFFORT_CLOUD" \
      -c "model=$CODEX_MODEL" \
      app-server
  fi
else
  log "Codex credits exhausted — probing fallback providers"
fi

# --- Helper: exec codex through LiteLLM proxy ---
# All non-Codex-credits providers are routed through LiteLLM because Codex
# CLI's native providers use Responses API format which third-party APIs reject.
# Codex CLI v0.110.0 has a bug where -c model=X isn't forwarded to the
# /v1/responses request (sends model=None). The model-injector proxy on
# port 4011 reads the model from a state file and injects it into the request.
exec_via_litellm() {
  local model="$1"
  # Write desired model to state file for the model-injector proxy to read.
  local model_file="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/credit-gate/current-model"
  local model_tmp="${model_file}.$$"
  if printf '%s\n' "$model" > "$model_tmp"; then mv -f "$model_tmp" "$model_file" 2>/dev/null; fi
  log "Wrote model=$model to state file for model-injector proxy"
  export ANQR_CONTEXT_MODE="local-small"
  export OPENAI_BASE_URL="$LITELLM_HOST"
  export OPENAI_API_KEY="${LITELLM_API_KEY:-sk-unused}"
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c "model_reasoning_effort=$CODEX_REASONING_EFFORT_LOCAL" \
    -c model_provider=openai \
    -c "model=$model" \
    app-server
}

# --- Pre-check: LiteLLM proxy must be up for all fallback providers ---
if ! litellm_reachable; then
  log "WARNING: LiteLLM proxy not reachable at ${LITELLM_HOST} — cloud fallbacks will be skipped"
  LITELLM_UP=false
else
  LITELLM_UP=true
fi

# --- Fallback 1: Groq via LiteLLM (free cloud, fast, working tool calls) ---
if [ "$LITELLM_UP" = true ]; then
  if is_rate_limited groq; then
    log "Groq skipped (rate-limited — falling back)"
  elif is_skipped groq; then
    log "Groq skipped (recently failed)"
  elif groq_available; then
    log "Groq reachable — using ${LITELLM_GROQ_MODEL} via LiteLLM"
    record_provider groq
    exec_via_litellm "$LITELLM_GROQ_MODEL"
  else
    log "Groq unavailable (no token or API unreachable)"
  fi
fi

# --- Fallback 2: Mistral Codestral via LiteLLM (free experimental tier, code-optimised, ~600ms) ---
if [ "$LITELLM_UP" = true ]; then
  if is_rate_limited mistral; then
    log "Mistral skipped (rate-limited — falling back)"
  elif is_skipped mistral; then
    log "Mistral skipped (recently failed)"
  elif mistral_available; then
    log "Mistral Codestral reachable — using ${LITELLM_MISTRAL_MODEL} via LiteLLM"
    record_provider mistral
    exec_via_litellm "$LITELLM_MISTRAL_MODEL"
  else
    log "Mistral unavailable (no token or API unreachable)"
  fi
fi

# --- Fallback 3: Gemini via LiteLLM (free cloud tier, gemini-2.5-flash, lightweight probe) ---
if [ "$LITELLM_UP" = true ]; then
  if is_rate_limited gemini; then
    log "Gemini skipped (rate-limited — falling back)"
  elif is_skipped gemini; then
    log "Gemini skipped (recently failed)"
  elif gemini_available; then
    log "Gemini reachable — using ${LITELLM_GEMINI_MODEL} via LiteLLM"
    record_provider gemini
    exec_via_litellm "$LITELLM_GEMINI_MODEL"
  else
    log "Gemini unavailable (no token, quota exhausted, or API unreachable)"
  fi
fi

# --- Fallback 3b: Gemini Lite via LiteLLM (separate per-model quota from 2.5-flash) ---
if [ "$LITELLM_UP" = true ]; then
  if is_rate_limited gemini-lite; then
    log "Gemini Lite skipped (rate-limited — falling back)"
  elif is_skipped gemini-lite; then
    log "Gemini Lite skipped (recently failed)"
  elif gemini_available; then
    log "Gemini Lite reachable — using ${LITELLM_GEMINI_LITE_MODEL} via LiteLLM"
    record_provider gemini-lite
    exec_via_litellm "$LITELLM_GEMINI_LITE_MODEL"
  else
    log "Gemini Lite unavailable"
  fi
fi

# --- Fallback 4: OpenRouter FREE via LiteLLM (free :free models, intermittent) ---
if [ "$LITELLM_UP" = true ]; then
  if is_rate_limited openrouter-free; then
    log "OpenRouter FREE skipped (rate-limited — falling back)"
  elif is_skipped openrouter-free; then
    log "OpenRouter FREE skipped (recently failed)"
  elif openrouter_free_available; then
    log "OpenRouter FREE reachable — using ${LITELLM_OPENROUTER_FREE_MODEL} via LiteLLM"
    record_provider openrouter-free
    exec_via_litellm "$LITELLM_OPENROUTER_FREE_MODEL"
  else
    log "OpenRouter FREE unavailable (no token or model unreachable)"
  fi
fi

# --- Fallback 5: SambaNova via LiteLLM (free cloud, 70B model, 20 req/day) ---
if [ "$LITELLM_UP" = true ]; then
  if is_rate_limited sambanova; then
    log "SambaNova skipped (rate-limited — falling back)"
  elif is_skipped sambanova; then
    log "SambaNova skipped (recently failed)"
  elif sambanova_available; then
    log "SambaNova reachable — using ${LITELLM_SAMBANOVA_MODEL} via LiteLLM"
    record_provider sambanova
    exec_via_litellm "$LITELLM_SAMBANOVA_MODEL"
  else
    log "SambaNova unavailable (no token or API unreachable)"
  fi
fi

# --- Fallback 6: Cerebras via LiteLLM (free cloud, 1M tok/day, 8K context limit) ---
if [ "$LITELLM_UP" = true ]; then
  if is_rate_limited cerebras; then
    log "Cerebras skipped (rate-limited — falling back)"
  elif is_skipped cerebras; then
    log "Cerebras skipped (recently failed)"
  elif cerebras_available; then
    log "Cerebras reachable — using ${LITELLM_CEREBRAS_MODEL} via LiteLLM"
    record_provider cerebras
    exec_via_litellm "$LITELLM_CEREBRAS_MODEL"
  else
    log "Cerebras unavailable (no token or API unreachable)"
  fi
fi

# --- Fallback 7: GitHub Models via LiteLLM (free, rate-limited per model) ---
if [ "$LITELLM_UP" = true ]; then
  if is_rate_limited github; then
    log "GitHub Models skipped (rate-limited — falling back)"
  elif is_skipped github; then
    log "GitHub Models skipped (recently failed)"
  elif github_models_available; then
    log "GitHub Models reachable — using ${LITELLM_GITHUB_MODEL} via LiteLLM"
    record_provider github
    exec_via_litellm "$LITELLM_GITHUB_MODEL"
  else
    log "GitHub Models unavailable (no token, missing permissions, or API unreachable)"
  fi
fi

# --- Fallback 8: Ollama via LiteLLM (local, proper tool-calling) ---
if [ "$LITELLM_UP" = true ]; then
  if is_skipped litellm-ollama; then
    log "LiteLLM/Ollama skipped (recently failed)"
  elif ollama_available; then
    litellm_ollama_model="$(select_litellm_ollama_model)"
    log "Ollama reachable — using ${litellm_ollama_model} via LiteLLM"
    record_provider litellm-ollama
    exec_via_litellm "$litellm_ollama_model"
  else
    log "Ollama unavailable at ${OLLAMA_HOST}"
  fi
fi

# --- Fallback 9: Ollama direct (broken tool calling — disabled by default) ---
if [ "$ENABLE_OLLAMA_DIRECT_FALLBACK" = "1" ]; then
  if is_skipped ollama-direct; then
    log "Ollama direct skipped (recently failed)"
  elif ollama_available; then
    if [ -z "$OLLAMA_MODEL" ]; then
      OLLAMA_MODEL=$(select_ollama_model)
      log "Auto-selected Ollama model: ${OLLAMA_MODEL}"
    fi
    log "Ollama direct — using model ${OLLAMA_MODEL} (tool calling may not work)"
    record_provider ollama-direct
    export ANQR_CONTEXT_MODE="local-small"
    exec "$CODEX_BIN" \
      --dangerously-bypass-approvals-and-sandbox \
      -c shell_environment_policy.inherit=all \
      -c "model_reasoning_effort=$CODEX_REASONING_EFFORT_LOCAL" \
      -c model_provider=ollama \
      -c "model=$OLLAMA_MODEL" \
      app-server
  else
    log "Ollama direct unavailable at ${OLLAMA_HOST}"
  fi
else
  log "Ollama direct fallback disabled (set ENABLE_OLLAMA_DIRECT_FALLBACK=1 to enable)"
fi

if [ "$ENABLE_OLLAMA_DIRECT_FALLBACK" = "1" ]; then
  log "ERROR: all providers exhausted (credits, Groq, Mistral, Gemini, OpenRouter FREE, SambaNova, Cerebras, GitHub Models, LiteLLM/Ollama, Ollama direct)"
else
  log "ERROR: all providers exhausted (credits, Groq, Mistral, Gemini, OpenRouter FREE, SambaNova, Cerebras, GitHub Models, LiteLLM/Ollama)"
fi
exit 1
