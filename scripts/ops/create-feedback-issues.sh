#!/usr/bin/env bash
# One-shot script: create 4 feedback-backlog Linear issues.
# Run once the Linear API rate limit resets:
#   bash scripts/ops/create-feedback-issues.sh
#
# Requires: LINEAR_API_KEY in environment or ~/.config/symphony/anqr.env

set -euo pipefail

[ -f "$HOME/.config/symphony/anqr.env" ] && source "$HOME/.config/symphony/anqr.env"

if [ -z "${LINEAR_API_KEY:-}" ]; then
  echo "ERROR: LINEAR_API_KEY not set" >&2
  exit 1
fi

created=0
failed=0

create_issue() {
  local title="$1" desc="$2" priority="$3"
  echo "Creating: $title"
  if node scripts/ops/create-issue.mjs \
    --title "$title" \
    --description "$desc" \
    --priority "$priority" \
    --label reliability \
    --state Backlog; then
    created=$((created + 1))
  else
    echo "  FAILED — rate limit may still be active" >&2
    failed=$((failed + 1))
  fi
  echo ""
}

# 1. Retry-loop design gap (feedback items 3+4) — P1
create_issue \
  'fix(ops): close retry-loop design gap — cooldown/re-feed suppression' \
  '## Problem

When provider pressure is high (credits exhausted + cloud providers rate-limited), Symphony drains issues that cannot complete. The guardian then re-feeds them on the next cycle (5 min), creating a tight retry loop that generates email storms and wastes cycles.

## Requirements

- Track per-issue last-drained-at and times-drained-in-6h state (via Linear issue metadata or comments)
- Do NOT re-feed a recently drained issue (cooldown: >=30 min since last drain)
- Do NOT count slot contention as a real retry — only count actual execution failures
- Only feed Symphony up to free-slot capacity plus a small buffer (no overfilling)
- Add a drain-count circuit breaker: if an issue is drained 3+ times in 6 hours, move it to Pending with an AI Hint explaining the pattern

## Source

feedback.txt items 3+4 — observed during provider exhaustion event where all 7 cloud providers were simultaneously rate-limited.' \
  1

# 2. Notification storm dedup (feedback item 5) — P2
create_issue \
  'fix(ops): deduplicate notification storm behaviour' \
  '## Problem

During extended provider outages, the guardian and Symphony generate repeated email notifications for the same event type (retry-overflow, retry-escalation, symphony-unhealthy). This produces 10+ notifications over 8 hours for what is effectively one ongoing event.

## Requirements

- Deduplicate notifications by event key (not exact subject match)
- Aggregate repeated events into a rolling summary instead of individual emails
- Send state-changed emails, not state-observed-again emails
- Add escalation levels: first occurrence = email, repeated = suppress + append to existing, recovery = one resolution email
- Track notification state in a local file (e.g. /tmp/credit-gate/notification-dedup.json)

## Source

feedback.txt item 5 — observed 10+ retry-escalation emails during overnight provider exhaustion.' \
  2

# 3. HTML scraping replacement (feedback item 6) — P2
create_issue \
  'refactor(ops): replace HTML scraping with machine-readable Symphony status' \
  '## Problem

The guardian Symphony liveness check currently scrapes the Cline dashboard HTML to detect running state. This is brittle — any UI change can break the check.

## Requirements

- Add a machine-readable status endpoint or file that Symphony writes (e.g. JSON file at a known path with timestamp, current task, slot count, provider info)
- Update the guardian to read this status file instead of parsing HTML
- Include: last-heartbeat timestamp, active issue identifier, provider in use, slot availability
- Fail gracefully if the status file is missing or stale (>10 min old)

## Source

feedback.txt item 6 — the HTML scraping approach has broken multiple times during UI updates.' \
  2

# 4. Provider-health harness check (feedback item 9) — P2
create_issue \
  'feat(ops): add provider-health harness check' \
  '## Problem

There is no automated harness check that verifies provider health. When all providers are rate-limited or the LiteLLM proxy is down, this is only discovered reactively (via retry loops and email storms).

## Requirements

- Add a harness check that verifies at least one AI provider is reachable and responding
- Check LiteLLM proxy liveness (HTTP health endpoint on port 4011)
- Check rate-limit file status: WARN if >4 providers rate-limited, FAIL if all 7 blocked
- Check Ollama local model availability as last-resort fallback
- Report results in the standard harness format (PASS/WARN/FAIL) so the guardian can auto-create [HARNESS] issues
- Include in the nightly and continuous ops passes

## Source

feedback.txt item 9 — provider exhaustion event was not detected until manual investigation.' \
  2

echo "=== Done: $created created, $failed failed ==="
[ "$failed" -eq 0 ] || exit 1
