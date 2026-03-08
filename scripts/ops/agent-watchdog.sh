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

MAX_AGE_SECONDS="${WATCHDOG_MAX_AGE:-1800}"         # 30 minutes default
MAX_ACTIVE_AGE_SECONDS="${WATCHDOG_MAX_ACTIVE_AGE:-3600}" # 60 minutes hard cap when progress is observed
MIN_CPU_TICKS_DELTA="${WATCHDOG_MIN_CPU_TICKS_DELTA:-10}"
MIN_IO_BYTES_DELTA="${WATCHDOG_MIN_IO_BYTES_DELTA:-4096}"
GRACE_SECONDS=10
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

REPORTS_DIR="${HOME}/src/anqr/reports/agent-watchdog"
mkdir -p "$REPORTS_DIR"
STATE_DIR="/run/user/$(id -u)/agent-watchdog"
mkdir -p "$STATE_DIR"

log() { echo "[agent-watchdog] $(date -Iseconds) $*" >&2; }

killed_count=0
checked_count=0
active_deferred_count=0

cleanup_stale_state() {
  for f in "$STATE_DIR"/pid-*.state; do
    [ -f "$f" ] || continue
    pid="$(basename "$f" | sed -E 's/^pid-([0-9]+)\.state$/\1/')"
    if ! kill -0 "$pid" 2>/dev/null; then
      rm -f "$f"
    fi
  done
}

get_start_ticks() {
  local pid="$1"
  awk '{print $22}' "/proc/$pid/stat" 2>/dev/null || echo ""
}

get_cpu_ticks() {
  local pid="$1"
  awk '{print ($14 + $15)}' "/proc/$pid/stat" 2>/dev/null || echo "0"
}

get_io_bytes() {
  local pid="$1"
  awk '/^(rchar|wchar|read_bytes|write_bytes):/ {sum += $2} END {print sum + 0}' "/proc/$pid/io" 2>/dev/null || echo "0"
}

observe_activity() {
  local pid="$1"
  local elapsed="$2"
  local state_file="$STATE_DIR/pid-${pid}.state"
  local start_ticks cpu_ticks io_bytes prev_start prev_cpu prev_io

  start_ticks="$(get_start_ticks "$pid")"
  cpu_ticks="$(get_cpu_ticks "$pid")"
  io_bytes="$(get_io_bytes "$pid")"

  if [ -z "$start_ticks" ]; then
    return 1
  fi

  prev_start=""
  prev_cpu=""
  prev_io=""
  if [ -f "$state_file" ]; then
    # shellcheck disable=SC1090
    . "$state_file" || true
    prev_start="${start_ticks_saved:-}"
    prev_cpu="${cpu_ticks_saved:-}"
    prev_io="${io_bytes_saved:-}"
  fi

  cat > "$state_file" <<EOF
start_ticks_saved=$start_ticks
cpu_ticks_saved=$cpu_ticks
io_bytes_saved=$io_bytes
observed_at=$(date +%s)
elapsed_saved=$elapsed
EOF

  # If this PID/start-time hasn't been observed before, defer one cycle.
  if [ -z "$prev_start" ] || [ "$prev_start" != "$start_ticks" ]; then
    return 0
  fi

  local cpu_delta io_delta
  cpu_delta=$((cpu_ticks - prev_cpu))
  io_delta=$((io_bytes - prev_io))

  if [ "$cpu_delta" -ge "$MIN_CPU_TICKS_DELTA" ] || [ "$io_delta" -ge "$MIN_IO_BYTES_DELTA" ]; then
    return 0
  fi

  return 1
}

cleanup_stale_state

while IFS= read -r line; do
  pid=$(echo "$line" | awk '{print $1}')
  elapsed=$(echo "$line" | awk '{print $2}')
  etime=$(echo "$line" | awk '{print $3}')
  cmd=$(echo "$line" | awk '{for(i=4;i<=NF;i++) printf "%s ", $i; print ""}')

  checked_count=$((checked_count + 1))

  if [ "$elapsed" -gt "$MAX_AGE_SECONDS" ]; then
    log "  CMD: ${cmd:0:200}"

    if [ "$elapsed" -le "$MAX_ACTIVE_AGE_SECONDS" ] && observe_activity "$pid" "$elapsed"; then
      log "ACTIVE: PID=$pid elapsed=${etime} exceeded base threshold but is still progressing (deferring kill)"
      active_deferred_count=$((active_deferred_count + 1))
      continue
    fi

    log "STUCK: PID=$pid elapsed=${etime} (${elapsed}s > ${MAX_AGE_SECONDS}s, no progress or beyond ${MAX_ACTIVE_AGE_SECONDS}s cap)"

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
  "deferredActive": $active_deferred_count,
  "killed": $killed_count,
  "maxAgeSeconds": $MAX_AGE_SECONDS,
  "maxActiveAgeSeconds": $MAX_ACTIVE_AGE_SECONDS,
  "dryRun": $DRY_RUN
}
EOF

if [ "$killed_count" -gt 0 ]; then
  log "Killed $killed_count stuck agent(s)"
elif [ "$active_deferred_count" -gt 0 ]; then
  log "Deferred $active_deferred_count active agent(s) still making progress"
elif [ "$checked_count" -gt 0 ]; then
  log "Checked $checked_count agent(s), all within time limit"
fi
