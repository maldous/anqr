#!/usr/bin/env bash
# ============================================================================
# Codex Credit Gate — resilient credit-aware wrapper for Symphony
# ============================================================================
#
# Symphony calls this script instead of codex directly.
#
# Behavior:
#   1. Check the Symphony dashboard for Codex credit status.
#   2. If credits available → run codex with the full cloud model.
#   3. If credits exhausted → cascade through free/cheap providers:
#        a) Gemini   (requires GEMINI_TOKEN env var)
#        b) Groq     (requires GROQ_TOKEN env var)
#        c) OpenRouter (requires OPENROUTER_TOKEN env var)
#        d) Ollama local (requires Ollama on localhost:11434)
#   4. If a provider fails (rate limit, crash, etc) → try the next one.
#   5. If ALL providers fail in a cycle → exponential backoff, then retry
#      from the top. Credits are re-checked each cycle.
#   6. Runs indefinitely. Symphony manages the lifecycle via SIGTERM.
#
# Rate-limit resilience:
#   - Probes pass but session fails quickly (<30s) → treated as rate limit,
#     move to next provider immediately.
#   - All providers fast-fail → backoff (30s → 60s → 120s → 300s cap).
#   - Any provider runs ≥30s → backoff resets (something was working).
#   - Credits re-checked every cycle, so cloud model resumes automatically.
#
# All paths are configurable via environment variables (see defaults below).
# ============================================================================

set -uo pipefail
# NOTE: -e intentionally omitted — we capture exit codes from child processes.

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

# Preferred Ollama models in descending quality order (tool-calling capable only).
PREFERRED_OLLAMA_MODELS="qwen2.5-coder:7b qwen2.5-coder:3b llama3.1:8b"
DEFAULT_OLLAMA_MODEL="qwen2.5-coder:7b"

# Resilience tuning
FAST_FAIL_THRESHOLD=30    # seconds — exits faster than this are "rate limit"
BACKOFF_INITIAL=30        # seconds — first backoff sleep
BACKOFF_MAX=300           # seconds — cap (5 minutes)
BACKOFF_MULTIPLIER=2      # exponential multiplier

# Provider cascade order
PROVIDERS="cloud gemini groq openrouter ollama"

codex_pid=""
backoff=$BACKOFF_INITIAL

log() {
  echo "[credit-gate $(date -Iseconds)] $*" >&2
}

# ---------------------------------------------------------------------------
# Signal handling — forward SIGTERM/SIGINT to child codex process
# ---------------------------------------------------------------------------
cleanup() {
  log "Signal received — forwarding to codex (pid=${codex_pid:-none})"
  if [ -n "${codex_pid:-}" ]; then
    kill "$codex_pid" 2>/dev/null || true
    wait "$codex_pid" 2>/dev/null || true
  fi
  exit 130
}
trap cleanup SIGTERM SIGINT

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

  if echo "$html" | grep -q '&quot;has_credits&quot; =&gt; true'; then
    return 0
  fi

  log "Credits not confirmed available (dashboard up but has_credits != true)"
  return 1
}

# ---------------------------------------------------------------------------
# Provider availability probes
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

gemini_available() {
  if [ -z "${GEMINI_TOKEN:-}" ] && [ -z "${GEMINI_API_KEY:-}" ]; then
    return 1
  fi
  export GEMINI_API_KEY="${GEMINI_API_KEY:-$GEMINI_TOKEN}"
  curl -sf --max-time 5 \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    "https://generativelanguage.googleapis.com/v1beta/models" >/dev/null 2>&1
}

openrouter_available() {
  if [ -z "${OPENROUTER_TOKEN:-}" ] && [ -z "${OPENROUTER_API_KEY:-}" ]; then
    return 1
  fi
  export OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-$OPENROUTER_TOKEN}"
  curl -sf --max-time 5 \
    -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    "https://openrouter.ai/api/v1/models" >/dev/null 2>&1
}

ollama_available() {
  curl -sf --max-time 3 "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1
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
# Probe a provider's availability.
# Returns 0 if the provider can be tried, 1 if it should be skipped.
# $1 = provider name, $2 = credit_rc (for cloud check)
# ---------------------------------------------------------------------------
probe_provider() {
  local provider="$1"
  local credit_rc="${2:-1}"

  case "$provider" in
    cloud)
      [ "$credit_rc" -eq 0 ] && return 0
      return 1
      ;;
    groq)       groq_available ;;
    gemini)     gemini_available ;;
    openrouter) openrouter_available ;;
    ollama)     ollama_available ;;
    *)          return 1 ;;
  esac
}

# ---------------------------------------------------------------------------
# Run codex with a specific provider. Runs as a foreground child process
# (NOT exec) so we can capture the exit code and fall back.
# ---------------------------------------------------------------------------
run_codex_for_provider() {
  local provider="$1"

  case "$provider" in
    cloud)
      "$CODEX_BIN" \
        --dangerously-bypass-approvals-and-sandbox \
        -c shell_environment_policy.inherit=all \
        -c model_reasoning_effort=medium \
        -c "model=$CODEX_MODEL" \
        app-server
      ;;
    groq)
      "$CODEX_BIN" \
        --dangerously-bypass-approvals-and-sandbox \
        -c shell_environment_policy.inherit=all \
        -c model_provider=groq \
        -c "model=$GROQ_MODEL" \
        app-server
      ;;
    gemini)
      "$CODEX_BIN" \
        --dangerously-bypass-approvals-and-sandbox \
        -c shell_environment_policy.inherit=all \
        -c model_provider=gemini \
        -c "model=$GEMINI_MODEL" \
        app-server
      ;;
    openrouter)
      "$CODEX_BIN" \
        --dangerously-bypass-approvals-and-sandbox \
        -c shell_environment_policy.inherit=all \
        -c model_provider=openrouter \
        -c "model=$OPENROUTER_MODEL" \
        app-server
      ;;
    ollama)
      if [ -z "$OLLAMA_MODEL" ]; then
        OLLAMA_MODEL=$(select_ollama_model)
        log "Auto-selected Ollama model: ${OLLAMA_MODEL}"
      fi
      "$CODEX_BIN" \
        --dangerously-bypass-approvals-and-sandbox \
        -c shell_environment_policy.inherit=all \
        -c model_provider=ollama \
        -c "model=$OLLAMA_MODEL" \
        app-server
      ;;
  esac
}

# ---------------------------------------------------------------------------
# Main loop — cascade through providers, backoff, retry indefinitely
# ---------------------------------------------------------------------------
cycle=0

while true; do
  cycle=$((cycle + 1))
  any_ran_long=false

  log "=== Provider cycle ${cycle} (backoff=${backoff}s) ==="

  # Re-check credits every cycle — they may have reset
  credits_available && credit_rc=0 || credit_rc=$?

  if [ "$credit_rc" -eq 0 ]; then
    log "Credits available"
  elif [ "$credit_rc" -eq 2 ]; then
    log "Credit status unknown — will try free providers"
  else
    log "Credits exhausted — will try free providers"
  fi

  for provider in $PROVIDERS; do
    # Probe availability
    if ! probe_provider "$provider" "$credit_rc"; then
      log "Skipping ${provider} (unavailable or no credentials)"
      continue
    fi

    log "Starting codex via ${provider}"
    start_time=$(date +%s)

    # Run codex as a background child so we can trap signals
    run_codex_for_provider "$provider" &
    codex_pid=$!
    wait "$codex_pid" 2>/dev/null
    exit_code=$?
    codex_pid=""

    end_time=$(date +%s)
    elapsed=$((end_time - start_time))

    # Exit 0 = turn completed successfully
    if [ "$exit_code" -eq 0 ]; then
      log "Turn completed successfully via ${provider} (${elapsed}s)"
      exit 0
    fi

    # Determine if this was a fast-fail (rate limit) or slow-fail (did work)
    if [ "$elapsed" -ge "$FAST_FAIL_THRESHOLD" ]; then
      log "Provider ${provider} exited ${exit_code} after ${elapsed}s (did work — will reset backoff)"
      any_ran_long=true
    else
      log "Provider ${provider} exited ${exit_code} after ${elapsed}s (fast-fail — likely rate limited)"
    fi
  done

  # All providers exhausted for this cycle
  if $any_ran_long; then
    # At least one provider did real work — reset backoff and retry quickly
    backoff=$BACKOFF_INITIAL
    log "Provider(s) did work this cycle — resetting backoff, retrying in 5s"
    sleep 5
  else
    log "All providers fast-failed — backing off ${backoff}s before next cycle"
    sleep "$backoff"
    backoff=$((backoff * BACKOFF_MULTIPLIER))
    if [ "$backoff" -gt "$BACKOFF_MAX" ]; then
      backoff=$BACKOFF_MAX
    fi
  fi
done
