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
#        a) OpenRouter (requires OPENROUTER_TOKEN env var) — paid budget, most reliable
#        b) Gemini     (requires GEMINI_TOKEN env var) — free cloud tier, daily quota
#        c) Groq       (requires GROQ_TOKEN env var) — free cloud tier, known issues
#        d) LiteLLM proxy → Ollama (port 4010) — local, proper tool calling
#        e) Ollama direct (localhost:11434) — local, broken tool calling
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
# Provider probes do real lightweight generation tests (not just model listing)
# to detect rate-limited or quota-exhausted providers before selecting them.
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
SYMPHONY_DASHBOARD_URL="${SYMPHONY_DASHBOARD_URL:-http://127.0.0.1:4040}"
OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-}"
GROQ_MODEL="${GROQ_MODEL:-llama-3.3-70b-versatile}"
GEMINI_MODEL="${GEMINI_MODEL:-gemini-2.0-flash}"
OPENROUTER_MODEL="${OPENROUTER_MODEL:-google/gemini-2.0-flash-001}"

# LiteLLM proxy translates Codex Responses API → Ollama Chat Completions
# with proper structured tool_calls. Codex's native Ollama provider is broken
# for tool calling (Responses API ↔ Chat Completions mismatch).
LITELLM_HOST="${LITELLM_HOST:-http://127.0.0.1:4010}"
LITELLM_API_KEY="${LITELLM_API_KEY:-}"  # empty — no auth needed for local proxy
LITELLM_MODEL="${LITELLM_MODEL:-qwen2.5-coder-3b}"

# Preferred Ollama models in descending quality order (tool-calling capable only).
PREFERRED_OLLAMA_MODELS="llama3.1:8b-32k llama3.1:8b qwen2.5-coder:7b"
DEFAULT_OLLAMA_MODEL="llama3.1:8b-32k"

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

log() {
  echo "[credit-gate $(date -Iseconds)] $*" >&2
}

# ---------------------------------------------------------------------------
# Check whether Codex credits are available via the Symphony dashboard.
# Returns 0 if credits are available.
# Returns 1 if credits are definitively exhausted.
# Returns 2 if dashboard is unreachable after retries (unknown → fail-closed).
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
  # This avoids a race where the dashboard is up but hasn't loaded credit info yet.
  if echo "$html" | grep -q '&quot;has_credits&quot; =&gt; true'; then
    return 0
  fi

  log "Credits not confirmed available (dashboard up but has_credits != true)"
  return 1
}

# ---------------------------------------------------------------------------
# Provider availability probes — real generation tests, not just model listing
# ---------------------------------------------------------------------------
groq_available() {
  if [ -z "${GROQ_TOKEN:-}" ] && [ -z "${GROQ_API_KEY:-}" ]; then
    return 1
  fi
  export GROQ_API_KEY="${GROQ_API_KEY:-$GROQ_TOKEN}"
  local resp
  resp=$(curl -sf --max-time 8 \
    -H "Authorization: Bearer $GROQ_API_KEY" \
    -H "Content-Type: application/json" \
    -X POST "https://api.groq.com/openai/v1/chat/completions" \
    -d '{"model":"'"$GROQ_MODEL"'","messages":[{"role":"user","content":"hi"}],"max_tokens":1}' 2>/dev/null) || return 1
  echo "$resp" | grep -q '"choices"' 2>/dev/null
}

gemini_available() {
  if [ -z "${GEMINI_TOKEN:-}" ] && [ -z "${GEMINI_API_KEY:-}" ]; then
    return 1
  fi
  export GEMINI_API_KEY="${GEMINI_API_KEY:-$GEMINI_TOKEN}"
  local resp
  resp=$(curl -sf --max-time 8 \
    -H "Content-Type: application/json" \
    -X POST "https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}" \
    -d '{"contents":[{"parts":[{"text":"hi"}]}],"generationConfig":{"maxOutputTokens":1}}' 2>/dev/null) || return 1
  echo "$resp" | grep -q '"candidates"' 2>/dev/null
}

openrouter_available() {
  if [ -z "${OPENROUTER_TOKEN:-}" ] && [ -z "${OPENROUTER_API_KEY:-}" ]; then
    return 1
  fi
  export OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-$OPENROUTER_TOKEN}"
  local resp
  resp=$(curl -sf --max-time 8 \
    -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    -H "Content-Type: application/json" \
    -X POST "https://openrouter.ai/api/v1/chat/completions" \
    -d '{"model":"'"$OPENROUTER_MODEL"'","messages":[{"role":"user","content":"hi"}],"max_tokens":1}' 2>/dev/null) || return 1
  echo "$resp" | grep -q '"choices"' 2>/dev/null
}

ollama_available() {
  local probe_model="${OLLAMA_MODEL:-$DEFAULT_OLLAMA_MODEL}"
  local resp
  resp=$(curl -sf --max-time 10 \
    -H "Content-Type: application/json" \
    -X POST "${OLLAMA_HOST}/v1/chat/completions" \
    -d '{"model":"'"$probe_model"'","messages":[{"role":"user","content":"hi"}],"max_tokens":1}' 2>/dev/null) || return 1
  echo "$resp" | grep -q '"choices"' 2>/dev/null
}

litellm_available() {
  local auth_header=""
  if [ -n "$LITELLM_API_KEY" ]; then
    auth_header="Authorization: Bearer $LITELLM_API_KEY"
  fi
  local resp
  resp=$(curl -sf --max-time 15 \
    -H "Content-Type: application/json" \
    ${auth_header:+-H "$auth_header"} \
    -X POST "${LITELLM_HOST}/v1/chat/completions" \
    -d '{"model":"'"$LITELLM_MODEL"'","messages":[{"role":"user","content":"hi"}],"max_tokens":1}' 2>/dev/null) || return 1
  echo "$resp" | grep -q '"choices"' 2>/dev/null
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
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_reasoning_effort=medium \
    -c "model=$CODEX_MODEL" \
    app-server
fi

if [ "$credit_rc" -eq 2 ]; then
  log "Credit status unknown — falling back to free providers"
else
  log "Codex credits exhausted — probing fallback providers"
fi

# --- Fallback 1: OpenRouter (paid budget, most reliable cloud) ---
if is_skipped openrouter; then
  log "OpenRouter skipped (recently failed)"
elif openrouter_available; then
  log "OpenRouter reachable — using model ${OPENROUTER_MODEL}"
  record_provider openrouter
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_provider=openrouter \
    -c "model=$OPENROUTER_MODEL" \
    app-server
else
  log "OpenRouter unavailable (no token or API unreachable)"
fi

# --- Fallback 2: Gemini (free cloud tier) ---
if is_skipped gemini; then
  log "Gemini skipped (recently failed)"
elif gemini_available; then
  log "Gemini reachable — using model ${GEMINI_MODEL}"
  record_provider gemini
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_provider=gemini \
    -c "model=$GEMINI_MODEL" \
    app-server
else
  log "Gemini unavailable (no token, quota exhausted, or API unreachable)"
fi

# --- Fallback 3: Groq (free cloud tier, 12K TPM — known Codex integration issues) ---
if is_skipped groq; then
  log "Groq skipped (recently failed)"
elif groq_available; then
  log "Groq reachable — using model ${GROQ_MODEL}"
  record_provider groq
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_provider=groq \
    -c "model=$GROQ_MODEL" \
    app-server
else
  log "Groq unavailable (no token or API unreachable)"
fi

# --- Fallback 4: LiteLLM proxy → Ollama (local, proper tool-calling) ---
if is_skipped litellm; then
  log "LiteLLM skipped (recently failed)"
elif litellm_available; then
  log "LiteLLM proxy reachable — using model ${LITELLM_MODEL} via ${LITELLM_HOST}"
  record_provider litellm
  export OPENAI_BASE_URL="$LITELLM_HOST"
  export OPENAI_API_KEY="${LITELLM_API_KEY:-sk-unused}"
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_provider=openai \
    -c "model=$LITELLM_MODEL" \
    app-server
else
  log "LiteLLM proxy unavailable at ${LITELLM_HOST}"
fi

# --- Fallback 5: Ollama direct (local, broken tool calling — last resort) ---
if is_skipped ollama; then
  log "Ollama skipped (recently failed)"
elif ollama_available; then
  if [ -z "$OLLAMA_MODEL" ]; then
    OLLAMA_MODEL=$(select_ollama_model)
    log "Auto-selected Ollama model: ${OLLAMA_MODEL}"
  fi
  log "Ollama direct — using model ${OLLAMA_MODEL} (tool calling may not work)"
  record_provider ollama
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_provider=ollama \
    -c "model=$OLLAMA_MODEL" \
    app-server
else
  log "Ollama unavailable at ${OLLAMA_HOST}"
fi

log "ERROR: all providers exhausted (credits, OpenRouter, Gemini, Groq, LiteLLM, Ollama)"
exit 1
