#!/usr/bin/env bash
# ANQR Stuck-Agent Watchdog
#
# Detects Codex CLI agent processes that have exceeded the maximum allowed
# runtime and terminates them. This frees the single Symphony orchestrator
# slot so queued issues can proceed.
#
# Designed to run every 3 minutes via systemd timer.
#
# Usage:
#   bash scripts/ops/agent-watchdog.sh           # Kill stuck agents
#   bash scripts/ops/agent-watchdog.sh --dry-run # Preview without killing
#
set -euo pipefail

MAX_AGE_SECONDS="${WATCHDOG_MAX_AGE:-1200}"   # 20 minutes default
GRACE_SECONDS=10
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

REPORTS_DIR="${HOME}/src/anqr/reports/agent-watchdog"
mkdir -p "$REPORTS_DIR"

log() { echo "[agent-watchdog] $(date -Iseconds) $*" >&2; }

killed_count=0
checked_count=0

while IFS= read -r line; do
  pid=$(echo "$line" | awk '{print $1}')
  elapsed=$(echo "$line" | awk '{print $2}')
  etime=$(echo "$line" | awk '{print $3}')
  cmd=$(echo "$line" | awk '{for(i=4;i<=NF;i++) printf "%s ", $i; print ""}')

  checked_count=$((checked_count + 1))

  if [ "$elapsed" -gt "$MAX_AGE_SECONDS" ]; then
    log "STUCK: PID=$pid elapsed=${etime} (${elapsed}s > ${MAX_AGE_SECONDS}s threshold)"
    log "  CMD: ${cmd:0:200}"

    if $DRY_RUN; then
      log "  DRY-RUN: would kill PID $pid"
    else
      log "  Sending SIGTERM to PID $pid..."
      kill "$pid" 2>/dev/null || true

      # Wait for graceful shutdown, then force-kill if needed.
      for i in $(seq 1 "$GRACE_SECONDS"); do
        if ! kill -0 "$pid" 2>/dev/null; then
          log "  PID $pid exited after ${i}s"
          break
        fi
        sleep 1
      done

      if kill -0 "$pid" 2>/dev/null; then
        log "  PID $pid still alive, sending SIGKILL..."
        kill -9 "$pid" 2>/dev/null || true
      fi

      killed_count=$((killed_count + 1))
    fi
  fi
done < <(ps -eo pid,etimes,etime,args 2>/dev/null \
  | grep -E 'codex.*app-server' \
  | grep -v grep \
  | grep -v "$BASHPID" \
  || true)

# Also check for orphaned credit-gate wrappers without a live codex child.
while IFS= read -r line; do
  pid=$(echo "$line" | awk '{print $1}')
  elapsed=$(echo "$line" | awk '{print $2}')

  # credit-gate processes that have been running >MAX_AGE with no codex child
  if [ "$elapsed" -gt "$MAX_AGE_SECONDS" ]; then
    children=$(pgrep -P "$pid" 2>/dev/null || true)
    if [ -z "$children" ]; then
      log "ORPHAN credit-gate: PID=$pid elapsed=${elapsed}s (no children)"
      if ! $DRY_RUN; then
        kill "$pid" 2>/dev/null || true
        killed_count=$((killed_count + 1))
      fi
    fi
  fi
done < <(ps -eo pid,etimes,args 2>/dev/null \
  | grep 'codex-credit-gate' \
  | grep -v grep \
  | grep -v "$BASHPID" \
  || true)

# Clean up expired cooldown files while we're here.
now=$(date +%s)
for f in /run/user/"$(id -u)"/credit-gate/ratelimit-*; do
  [ -f "$f" ] || continue
  expiry=$(cat "$f" 2>/dev/null || echo 0)
  if [ "$now" -ge "$expiry" ] 2>/dev/null; then
    rm -f "$f"
    provider=$(basename "$f" | sed 's/ratelimit-//')
    log "Cleaned expired cooldown: $provider"
  fi
done

# Write report.
cat > "$REPORTS_DIR/latest.json" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "checked": $checked_count,
  "killed": $killed_count,
  "maxAgeSeconds": $MAX_AGE_SECONDS,
  "dryRun": $DRY_RUN
}
EOF

if [ "$killed_count" -gt 0 ]; then
  log "Killed $killed_count stuck agent(s)"
elif [ "$checked_count" -gt 0 ]; then
  log "Checked $checked_count agent(s), all within time limit"
fi
