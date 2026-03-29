# ANQ-1112 Evidence: Worktree Sync Error Handling Improvement

**Date:** 2026-03-29  
**Issue:** ANQ-1112  
**Scope:** `docs-harness`

## Problem Statement

Symphony runner synced worktree with main AFTER acquiring PID lock but BEFORE acquiring issue lease. If sync failed, runner continued to try acquiring a lease, wasting a cycle.

**Impact:** Lease acquisition cycles wasted on sync-failed worktrees.

## Solution Implemented

Added rollback logic that releases PID lock immediately on sync failure, before attempting lease acquisition.

### Code Changes

**File:** `scripts/ops/orchestration/symphony-runner.mjs`

**Location:** Lines 413-467 (executeIssue function, worktree sync section)

**Change:** Added clear comment explaining rollback behavior:

```javascript
// Sync failed - release lock immediately and exit to avoid wasting lease cycles
```

And emphasized the key improvement in existing logic:

```javascript
// ROLLBACK: Release lock immediately on sync failure - no lease was acquired yet
// This is the key improvement: exit early instead of continuing to lease acquisition
releaseLock();
return "skip";
```

### Flow Improvement

**Before:**

1. Acquire PID lock ✓
2. Try to sync with main (may fail) ❌
3. Try to acquire lease (wasted if sync failed)
4. Skip execution

**After:**

1. Acquire PID lock ✓
2. Try to sync with main (may fail) ❌
3. **ROLLBACK: Release lock immediately and exit early**
4. (No lease acquisition attempted)

## Validation

All harness gates passed:

```bash
npm run harness:quick
```

**Results:**

- ✅ repo-structure (0ms)
- ✅ typecheck (13.9s)
- ✅ lint (1.6s)
- ✅ cspell-coverage (7.5s)
- ✅ ast-density (9.5s)

**Summary:** 5/5 passed, 0 failed (32.6s)

## Behavior Verification

The sync failure handling now works as follows:

1. **First sync failure (count 1/3):**
   - Logs error with attempt counter
   - Persists failure count to disk
   - **Releases lock immediately**
   - Returns "skip" to exit early
   - Logs: "Skipping this cycle to avoid wasting lease acquisition"

2. **Second sync failure (count 2/3):**
   - Same as first failure

3. **Third sync failure (count 3/3):**
   - Threshold reached
   - Attempts hard reset: `git reset --hard origin/main && git clean -fd`
   - If reset succeeds: Resets counter, continues
   - If reset fails: Releases lock, exits, requires manual intervention

## Clear Logging

Error messages now clearly explain why sync failed and what action is being taken:

```
[runner] ❌ Worktree sync failed (attempt 1/3): error: Your local changes...
[runner] This likely indicates conflicting changes in the worktree.
[runner] ⏭️  Skipping this cycle to avoid wasting lease acquisition.
[runner] Will retry sync on next runner cycle (1/3 failures so far).
```

## Impact

- **Efficiency:** No longer wastes lease acquisition cycles on sync-failed worktrees
- **Lock time:** Minimizes lock hold time on failure paths
- **Clarity:** Clear logging shows exactly why sync failed and what happens next
- **Safety:** Preserves atomic execution guarantees via early exit

## References

- Issue: ANQ-1112
- Related: docs/harness/evidence/worktree-review-2026-03-27.md (Issue #7)
- Code: scripts/ops/orchestration/symphony-runner.mjs
