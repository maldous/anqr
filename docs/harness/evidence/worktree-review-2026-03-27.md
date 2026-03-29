# Worktree Implementation Review

**Date:** 2026-03-27  
**Reviewer:** AI Agent  
**Scope:** Complete worktree feature implementation for concurrent Symphony execution

## Executive Summary

Identified **15 issues** requiring attention, ranging from blocking (Priority 1) to operational improvements (Priority 3).

**Status:** 3 critical blocking issues must be fixed before Phase 2 validation can proceed.

## Critical Issues (Priority 1 - Blocking)

### Issue #1: Missing `npm install` in Worktree Creation

**Severity:** CRITICAL - Blocking  
**Location:** `scripts/ops/orchestration/symphony-worktree-pool.mjs:createWorktree()`

**Problem:** Worktrees are created without installing dependencies. Each worktree needs its own `node_modules` to function independently. Without this, validation commands (typecheck, lint, tests) will fail immediately.

**Impact:** Worktrees cannot execute issues — feature is non-functional.

**Fix Required:**
```javascript
// After git worktree add, run:
execFileSync("npm", ["install"], { cwd: worktreePath, stdio: "inherit" });
```

**Estimated Time:** 5 minutes per worktree (first install), ~30 seconds for subsequent installs with cache.

---

### Issue #2: Hard-coded User Path in Systemd Services

**Severity:** CRITICAL - Blocking  
**Location:** `services/systemd/anqr-symphony-runner@.service`

**Problem:**
```ini
WorkingDirectory=/home/user/src/anqr-wt%i
Environment=ANQR_WORKTREE_PATH=/home/user/src/anqr-wt%i
```

Hard-coded `/home/user/` won't work for other users or deployment environments.

**Impact:** Feature only works for single user — not portable.

**Fix Required:**
```ini
WorkingDirectory=%h/src/anqr-wt%i
Environment=ANQR_WORKTREE_PATH=%h/src/anqr-wt%i
```

Use systemd's `%h` variable for home directory.

---

### Issue #3: Lock Directory Not Created in Worktree Mode

**Severity:** CRITICAL - Blocking  
**Location:** `scripts/ops/orchestration/symphony-runner.mjs:79`

**Problem:** 
```javascript
const LOCK_FILE = resolve(STATE_DIR, `lock-${WORKTREE_ID}`);
```

`STATE_DIR` is `/run/user/${UID}/symphony-runner/`, but worktree runner doesn't ensure this directory exists before trying to create lock files.

**Impact:** Runner crashes on first lock acquisition attempt.

**Fix Required:** Add directory creation before lock operations:
```javascript
if (!existsSync(STATE_DIR)) {
  mkdirSync(STATE_DIR, { recursive: true });
}
```

---

## High Risk Issues (Priority 2)

### Issue #4: No Heartbeat During Validation

**Severity:** HIGH - Data corruption risk  
**Location:** `scripts/ops/orchestration/symphony-runner.mjs` (validation execution)

**Problem:** Validation commands (typecheck, lint, tests) can run 5-15 minutes. During this time, no heartbeat is sent. If validation exceeds `HEARTBEAT_INTERVAL_MS` (5 min), lease could expire and another runner could pick up the same issue.

**Impact:** Duplicate work, potential git conflicts, wasted provider credits.

**Fix Required:** Add heartbeat calls during long-running validation steps.

---

### Issue #5: Worktree Existence Check Doesn't Validate Registration

**Severity:** HIGH - Corruption risk  
**Location:** `symphony-worktree-pool.mjs:47`

**Problem:**
```javascript
if (existsSync(worktreePath)) {
  logInfo(`Worktree already exists: ${worktreePath}`);
  return worktreePath;
}
```

Returns existing path without verifying it's actually a valid worktree registered with git. Could return a corrupted directory.

**Impact:** Silent corruption — runner attempts to use invalid worktree.

**Fix Required:** Check `git worktree list` to confirm registration before returning.

---

### Issue #6: No Disk Space Checks Before Creating Worktrees

**Severity:** HIGH - Resource exhaustion  
**Location:** `symphony-worktree-pool.mjs:initWorktreePool()`

**Problem:** Creates N worktrees without checking available disk space. Each worktree is ~200MB. Creating 10 worktrees on a system with 1GB free would fail midway.

**Impact:** Partial worktree pool creation, wasted resources, unclear error state.

**Fix Required:** Check available disk space before creating worktrees:
```javascript
const { availableGB } = checkDiskSpace();
const requiredGB = count * 0.2;
if (availableGB < requiredGB) {
  throw new Error(`Insufficient disk space: need ${requiredGB}GB, have ${availableGB}GB`);
}
```

---

### Issue #7: Race Condition in Worktree Sync Timing

**Severity:** MEDIUM - Efficiency issue  
**Location:** `symphony-runner.mjs:413-422`

**Problem:** Worktree sync happens AFTER acquiring PID lock but BEFORE acquiring issue lease. If main branch has conflicting changes, merge fails, but runner continues to try acquiring a lease, wasting a cycle.

**Impact:** Lease acquisition cycles wasted on sync-failed worktrees.

**Fix Required:** Move conflict detection earlier or add rollback logic.

---

## Operational Issues (Priority 3)

### Issue #8: MAX_CONCURRENT_AGENTS Not Validated

**Severity:** MEDIUM - Operational confusion  
**Location:** `symphony-config.mjs:17`

**Problem:**
```javascript
export const MAX_CONCURRENT_AGENTS = 1;
```

Documentation says to update this when enabling worktrees, but there's no validation that matches enabled systemd services. Operators could enable 4 timers but leave this at 1, causing 3 runners to starve.

**Impact:** Reduced throughput, operator confusion.

**Fix Required:** Add runtime warning if detected worktree count > MAX_CONCURRENT_AGENTS.

---

### Issue #9: No Worktree Cleanup in Nightly Ops Pass

**Severity:** MEDIUM - Maintenance gap  
**Location:** `scripts/ops/nightly-ops-pass.mjs` (compatibility shim only)

**Problem:** Documentation mentions "git worktree prune" in nightly maintenance, but there's no evidence this is actually implemented.

**Impact:** Stale worktree metadata accumulates.

**Fix Required:** Add worktree maintenance to nightly ops pass:
```javascript
execFileSync("git", ["worktree", "prune"], { cwd: PROJECT_ROOT });
execFileSync("git", ["worktree", "repair"], { cwd: PROJECT_ROOT });
```

---

### Issue #10: Worktree Branch Deletion Silently Fails

**Severity:** LOW - Debugging difficulty  
**Location:** `symphony-worktree-pool.mjs:68-76`

**Problem:**
```javascript
try {
  execFileSync("git", ["branch", "-D", branchName], { ... });
} catch {
  // Branch might not exist, that's okay
}
```

Catch block swallows errors without logging which branch failed to delete.

**Impact:** Hard to debug branch accumulation issues.

**Fix Required:** Log the specific branch that failed to delete.

---

### Issue #11: Discord Notification Missing Concurrency Context

**Severity:** LOW - Operational visibility  
**Location:** `symphony-runner.mjs:1222`

**Problem:** Adds `Worktree: wt1` to notification, but doesn't show total concurrent runners or queue depth.

**Impact:** Operators can't tell if concurrency is helping.

**Fix Required:** Add "(2/4 active)" or similar to show utilization.

---

### Issue #12: Worktree Path Calculation Inconsistency

**Severity:** MEDIUM - Configuration drift risk  
**Location:** Multiple files

**Problem:**
- `symphony-runner.mjs:73`: Uses `process.env.ANQR_WORKTREE_PATH`
- `symphony-worktree-pool.mjs:34`: Calculates as `resolve(PROJECT_ROOT, "..", "anqr-wt${id}")`
- `systemd service`: Hard-codes `/home/user/src/anqr-wt%i`

These could diverge if not kept in sync.

**Impact:** Mismatch between systemd and script expectations.

**Fix Required:** Single source of truth for worktree path calculation (shared config module).

---

### Issue #13: Potential for Infinite Merge Loops

**Severity:** MEDIUM - Stuck worktree risk  
**Location:** `symphony-runner.mjs:415-418`

**Problem:**
```javascript
execFileSync("git", ["merge", "origin/main", "--ff-only"], { ... });
```

`--ff-only` fails if divergence exists. Error handling just logs and returns "skip". If main keeps advancing, worktree could perpetually skip without ever catching up.

**Impact:** Worktree becomes permanently out-of-sync.

**Fix Required:** Add rebase or hard reset fallback after N consecutive skip attempts.

---

### Issue #14: Missing Documentation for Total Corruption Recovery

**Severity:** LOW - Documentation gap  
**Location:** Documentation files

**Problem:** Docs explain how to repair one worktree, but not what to do if ALL worktrees are corrupted simultaneously (e.g., disk full scenario).

**Impact:** Operators don't know emergency recovery procedure.

**Fix Required:** Add "nuclear option" recovery procedure:
```bash
# Stop all runners
systemctl --user stop 'anqr-symphony-runner@*.timer'

# Remove all worktrees
node scripts/ops/orchestration/symphony-worktree-pool.mjs cleanup

# Recreate fresh pool
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2

# Restart runners
systemctl --user start 'anqr-symphony-runner@*.timer'
```

---

### Issue #15: .gitignore Completeness (Non-Issue)

**Severity:** NONE - False positive  
**Location:** `.gitignore`

**Finding:** Lock files in `/run/user/*/symphony-runner/` are already ignored by being outside the repository.

**Action:** None required — document for clarity.

---

## Summary Statistics

| Priority | Count | Status |
|----------|-------|--------|
| Priority 1 (Blocking) | 3 | Must fix before Phase 2 |
| Priority 2 (High Risk) | 4 | Should fix before production |
| Priority 3 (Operational) | 7 | Fix during stabilization |
| False Positives | 1 | Document only |

**Total Issues:** 15 (14 real, 1 false positive)

## Recommendations

**Immediate Actions (before Phase 2 validation):**

1. ✅ Fix Issue #1: Add `npm install` to worktree creation
2. ✅ Fix Issue #2: Replace hard-coded paths with `%h` in systemd service
3. ✅ Fix Issue #3: Ensure lock directory creation

**Before Production:**

4. Add heartbeat during validation (Issue #4)
5. Validate worktree registration (Issue #5)
6. Add disk space checks (Issue #6)
7. Improve sync error handling (Issue #7)

**During Stabilization:**

8. Add runtime validation for MAX_CONCURRENT_AGENTS (Issue #8)
9. Add worktree maintenance to nightly ops (Issue #9)
10. Improve logging and monitoring (Issues #10, #11)
11. Standardize worktree path calculation (Issue #12)
12. Add merge loop protection (Issue #13)
13. Document emergency recovery (Issue #14)

## Phase 2 Blockers

**Cannot proceed to Phase 2 validation until Priority 1 issues are resolved.**

Phase 2 requires functional worktrees to run 4-hour benchmark tests. Current implementation will fail immediately due to missing dependencies.

## Appendix: Test Plan for Fixes

After implementing Priority 1 fixes:

```bash
# Test worktree creation
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2

# Verify npm install completed
ls -la /home/user/src/anqr-wt1/node_modules
ls -la /home/user/src/anqr-wt2/node_modules

# Test systemd service with %h variable
systemctl --user start anqr-symphony-runner@1.service
journalctl --user -u anqr-symphony-runner@1.service -n 50

# Verify lock directory creation
ls -la /run/user/$(id -u)/symphony-runner/
```

Expected: All commands succeed, no errors in journal.
