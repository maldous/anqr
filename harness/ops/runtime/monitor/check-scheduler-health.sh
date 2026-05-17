#!/usr/bin/env bash
# check-scheduler-health.sh — Verify scheduler is cycling regularly
#
# Checks that the symphony state file has been modified within the last
# MATURITY_WINDOW minutes.  Exits 0 if healthy, 1 if stale/frozen.
#
# Usage: check-scheduler-health.sh [maturity_window_minutes]
#   Default maturity window: 5 minutes
#
# Combine with a systemd timer for regular monitoring.

set -o errexit -o nounset -o pipefail

MATURITY_WINDOW="${1:-5}"
STATE_FILE="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/anqr-symphony-state/state.json"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "CRITICAL: State file not found at $STATE_FILE" >&2
  exit 1
fi

NOW=$(date +%s)
MTIME=$(stat -c %Y "$STATE_FILE" 2>/dev/null || stat -f %m "$STATE_FILE" 2>/dev/null)
AGE=$(( NOW - MTIME ))
AGE_MIN=$(( AGE / 60 ))
WINDOW_SEC=$(( MATURITY_WINDOW * 60 ))

if [[ $AGE -gt $WINDOW_SEC ]]; then
  echo "CRITICAL: Scheduler state file stale — last modified ${AGE_MIN}min ago (threshold: ${MATURITY_WINDOW}min)" >&2
  exit 1
fi

# Check which worktrees are executing and report count
ISSUES=$(python3 -c "
import json,sys
with open('$STATE_FILE') as f:
    s = json.load(f)
wts = s.get('worktreeStates',{})
avail = sum(1 for k,v in wts.items() if k.startswith('wt') and v.get('state')=='available')
executing = sum(1 for k,v in wts.items() if k.startswith('wt') and v.get('state')=='executing')
print(f'worktrees executing={executing} available={avail}')
" 2>/dev/null)

echo "OK: Scheduler state file is ${AGE_MIN}min old | ${ISSUES}"
exit 0
