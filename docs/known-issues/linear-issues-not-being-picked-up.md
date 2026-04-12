# Linear Issues Not Being Picked Up

> **Status: RESOLVED** — The `anqr-linear-reconciler` service now provides level-triggered
> backlog reconciliation every 90 seconds, ensuring pre-existing Todo issues are always
> picked up even without webhook events. See `make linear-status` for operator visibility.

**Status:** RESOLVED  
**Date:** 2026-03-30  
**Impact:** CRITICAL — Symphony runner idle, no work being processed

## Symptom

Symphony runners were reporting:

```
ℹ️ info: No feed-eligible backlog issues
[runner] No eligible issues found for execution
```

Even though there were 25+ issues in Linear Backlog state.

## Root Cause

All Backlog issues were marked as `retry_exhausted` in the Symphony state file (`/run/user/${UID}/anqr-symphony-state/state.json`), which permanently blocks them from being fed to the queue.

The `canFeedIssue()` and `canExecuteIssue()` filters check the following conditions:

- `human_only`: Issue requires human intervention
- `retry_exhausted`: Max retries exceeded, blocked from auto-retry
- `blocked_reason`: Explicit block reason
- `cooldown_until`: Temporary cooldown period
- Active lease: Already being worked on

When an issue exhausts retries (default: 2 attempts), it's moved to Backlog and marked `retry_exhausted`, which prevents the queue feeder from picking it up again.

## Solution

Created `harness/ops/tools/reset-retry-exhausted.mjs` to reset retry state for blocked issues:

```bash
# Dry-run to see what would be reset
node harness/ops/tools/reset-retry-exhausted.mjs --dry-run

# Reset all retry_exhausted issues in Backlog
node harness/ops/tools/reset-retry-exhausted.mjs --all

# Reset specific issue
node harness/ops/tools/reset-retry-exhausted.mjs --id=ANQ-1234
```

After resetting:

1. Issues can be fed from Backlog → Todo
2. Queue feeder will automatically promote them (target: 3-8 issues in queue)
3. Symphony runners will pick them up on next cycle

## Verification

```bash
# Check queue status
node harness/ops/symphony-queue-control.mjs --check

# Manually feed queue (also runs automatically every 2 minutes)
node harness/ops/symphony-queue-control.mjs --feed

# Check for retry_exhausted issues
node -e "
import('./harness/ops/integrations/linear/linear-client.mjs').then(async (m) => {
  const { getIssueState } = await import('./harness/ops/core/symphony-state.mjs');
  const issues = await m.listIssuesByState(['Backlog']);
  const blocked = issues.filter(i => getIssueState(i.identifier).retry_exhausted);
  console.log('Retry-exhausted issues:', blocked.length);
})
"
```

## Prevention

Consider:

1. **Higher retry limit**: Increase `RUNNER_MAX_RETRIES` in `symphony-config.mjs` (currently 2)
2. **Selective quarantine**: Only quarantine issues that fail with the same signature repeatedly
3. **Auto-reset cooldown**: Add time-based auto-reset for retry_exhausted issues (e.g., 24 hours)
4. **Better diagnostics**: Log why issues are being quarantined to help identify systemic problems

## Related Files

- `harness/ops/core/symphony-state.mjs` - State management and filter logic
- `harness/ops/orchestration/symphony-queue-control.mjs` - Queue feeding logic
- `harness/ops/orchestration/symphony-runner.mjs` - Issue execution and retry logic
- `harness/ops/core/symphony-config.mjs` - Configuration (TARGET_MIN, RUNNER_MAX_RETRIES)
- `harness/ops/tools/reset-retry-exhausted.mjs` - Utility to reset blocked issues

## Resolution

1. ✅ Created reset utility script
2. ✅ Reset 25 retry_exhausted issues
3. ✅ Verified queue feeding works (3 issues promoted to Todo)
4. ✅ Documented problem and solution
5. ⏳ Monitor next runner cycle to confirm issues are being picked up
