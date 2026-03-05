#!/usr/bin/env bash
# ============================================================================
# Codex Credit Gate — credit-aware wrapper for Symphony
# ============================================================================
#
# Symphony calls this script instead of codex directly.
#
# Behavior:
#   1. Check the Symphony dashboard for Codex credit status.
#   2. If credits available → exec codex with the full cloud model (gpt-5.3-codex).
#   3. If credits exhausted → cascade through free/cheap providers:
#        a) Groq    (requires GROQ_TOKEN env var)
#        b) Gemini  (requires GEMINI_TOKEN env var)
#        c) OpenRouter (requires OPENROUTER_TOKEN env var)
#        d) Ollama local (requires Ollama on localhost:11434)
#   4. If no provider is reachable → log error and exit 1.
#
# All paths are configurable via environment variables (see defaults below).
# The script uses exec so Symphony's process tree stays clean — the wrapper
# replaces itself with the actual codex process.
# ============================================================================

set -euo pipefail

# Source symphony env file to ensure all API tokens are available.
# Systemd EnvironmentFile vars may not propagate to Symphony child processes.
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

# Preferred Ollama models in descending quality order (tool-calling capable only).
PREFERRED_OLLAMA_MODELS="qwen2.5-coder:7b qwen2.5-coder:3b llama3.1:8b"
DEFAULT_OLLAMA_MODEL="qwen2.5-coder:7b"

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
      log "Dashboard probe attempt ${attempt}/3 failed — retrying in 2s"
      sleep 2
    fi
  done

  if [ -z "$html" ]; then
    log "Dashboard unreachable after 3 attempts — treating as credits unknown"
    return 2
  fi

  if echo "$html" | grep -q '&quot;has_credits&quot; =&gt; false'; then
    return 1
  fi
  return 0
}

# ---------------------------------------------------------------------------
# Check whether Groq is reachable and the API key is valid.
# Exports GROQ_API_KEY from GROQ_TOKEN if needed.
# Returns 0 if reachable and authenticated, 1 otherwise.
# ---------------------------------------------------------------------------
groq_available() {
  if [ -z "${GROQ_TOKEN:-}" ] && [ -z "${GROQ_API_KEY:-}" ]; then
    return 1
  fi
  export GROQ_API_KEY="${GROQ_API_KEY:-$GROQ_TOKEN}"
  curl -sf --max-time 5 \
    -H "Authorization: Bearer $GROQ_API_KEY" \
    "https://api.groq.com/openai/v1/models" >/dev/null 2>&1
}

# ---------------------------------------------------------------------------
# Check whether Gemini is reachable and the API key is valid.
# Exports GEMINI_API_KEY from GEMINI_TOKEN if needed.
# Returns 0 if reachable and authenticated, 1 otherwise.
# ---------------------------------------------------------------------------
gemini_available() {
  if [ -z "${GEMINI_TOKEN:-}" ] && [ -z "${GEMINI_API_KEY:-}" ]; then
    return 1
  fi
  export GEMINI_API_KEY="${GEMINI_API_KEY:-$GEMINI_TOKEN}"
  curl -sf --max-time 5 \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    "https://generativelanguage.googleapis.com/v1beta/models" >/dev/null 2>&1
}

# ---------------------------------------------------------------------------
# Check whether OpenRouter is reachable and the API key is valid.
# Exports OPENROUTER_API_KEY from OPENROUTER_TOKEN if needed.
# Returns 0 if reachable and authenticated, 1 otherwise.
# ---------------------------------------------------------------------------
openrouter_available() {
  if [ -z "${OPENROUTER_TOKEN:-}" ] && [ -z "${OPENROUTER_API_KEY:-}" ]; then
    return 1
  fi
  export OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-$OPENROUTER_TOKEN}"
  curl -sf --max-time 5 \
    -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    "https://openrouter.ai/api/v1/models" >/dev/null 2>&1
}

# ---------------------------------------------------------------------------
# Check whether Ollama is reachable by hitting its /api/tags endpoint.
# Returns 0 if reachable, 1 otherwise.
# ---------------------------------------------------------------------------
ollama_available() {
  curl -sf --max-time 3 "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1
}

# ---------------------------------------------------------------------------
# Auto-select the best available Ollama model (tool-calling capable only).
# Queries /api/tags and picks the highest-ranked model from the preferred list.
# Falls back to DEFAULT_OLLAMA_MODEL if none of the preferred models are found.
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
# Main
# ---------------------------------------------------------------------------

credits_available && credit_rc=0 || credit_rc=$?

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

# Fallback 1: Groq (free tier, fast inference)
if groq_available; then
  log "Groq reachable — using model ${GROQ_MODEL}"
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_provider=groq \
    -c "model=$GROQ_MODEL" \
    app-server
fi
log "Groq unavailable (no token or API unreachable)"

# Fallback 2: Gemini (free tier, Google cloud)
if gemini_available; then
  log "Gemini reachable — using model ${GEMINI_MODEL}"
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_provider=gemini \
    -c "model=$GEMINI_MODEL" \
    app-server
fi
log "Gemini unavailable (no token or API unreachable)"

# Fallback 3: OpenRouter (cheap, cloud-hosted, supports /responses API)
if openrouter_available; then
  log "OpenRouter reachable — using model ${OPENROUTER_MODEL}"
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_provider=openrouter \
    -c "model=$OPENROUTER_MODEL" \
    app-server
fi
log "OpenRouter unavailable (no token or API unreachable)"

# Fallback 4: Ollama local (free, runs on local GPU/CPU)
if ollama_available; then
  if [ -z "$OLLAMA_MODEL" ]; then
    OLLAMA_MODEL=$(select_ollama_model)
    log "Auto-selected Ollama model: ${OLLAMA_MODEL}"
  fi
  log "Ollama reachable — using model ${OLLAMA_MODEL}"
  exec "$CODEX_BIN" \
    --dangerously-bypass-approvals-and-sandbox \
    -c shell_environment_policy.inherit=all \
    -c model_provider=ollama \
    -c "model=$OLLAMA_MODEL" \
    app-server
fi
log "Ollama unavailable at ${OLLAMA_HOST}"

log "ERROR: all providers exhausted (credits, Groq, Gemini, OpenRouter, Ollama)"
exit 1
