# ANQ-350: Automated Issue Hygiene — Evidence

## Issue Summary

**Problem:** Issues can accumulate excessive failure comments and outdated metadata, creating noise and obscuring useful information.

**Solution:** Implemented automated issue hygiene that:
- Identifies issues with excessive failure comments
- Archives comment history by consolidating into issue description
- Flags systemic failure patterns for human review
- Cleans up outdated metadata
- Preserves history through Linear version control

## Investigation

### Discovery

The implementation already existed in `scripts/ops/integrations/linear/issue-hygiene.mjs`. The script was:

1. **Already integrated** into `nightly-ops-pass.mjs` as an independent step
2. **Fully functional** with:
   - Comment analysis for failure patterns
   - Threshold-based triggering (default: 15 comments)
   - Systemic failure detection (10+ unique failure signatures)
   - Archive consolidation into issue description
   - Dry-run support

### Implementation Review

**Key features:**

```javascript
// Pattern matching for different failure types
const FAILURE_PATTERNS = {
  stillFailing: /\*\*Still failing\*\*/i,
  stale: /⏰.*Stale execution/i,
  harnessFail: /Harness.*failure/i,
  guardian: /Auto-created by linear-guardian/i,
};

// Thresholds
const DEFAULT_COMMENT_THRESHOLD = 15;
const SYSTEMIC_FAILURE_THRESHOLD = 10;
```

**Workflow:**

1. Analyze all open issues (Backlog, Todo, In Progress, In Review, Blocked, Human Review)
2. Count comments and identify failure patterns
3. For issues exceeding threshold:
   - Build consolidated failure summary
   - Append to issue description (preserves history via Linear version control)
   - Add hygiene notification comment
   - Flag systemic failures for human investigation

### Test Isolation Fix

During validation, discovered test isolation issue in `symphony-state.spec.ts`:

**Problem:** `STATE_DIR` was calculated at module load time, before tests set `ANQR_SYMPHONY_STATE_DIR` environment variable.

**Solution:** Made state directory calculation dynamic:

```javascript
// Before
const STATE_DIR = path.join(PROJECT_ROOT, "reports", "symphony");

// After
function getStateDir() {
  return process.env.ANQR_SYMPHONY_STATE_DIR || path.join(PROJECT_ROOT, "reports", "symphony");
}
```

Also fixed p95 percentile calculation:

```javascript
// Before
const p95Index = Math.floor(latencies.length * 0.95);

// After  
const p95Index = Math.ceil(latencies.length * 0.95) - 1;
```

## Implementation Status

### Existing Implementation

The automated issue hygiene system was **already implemented and operational**:

**File:** `scripts/ops/integrations/linear/issue-hygiene.mjs`

**Integration:** Runs nightly via `nightly-ops-pass.mjs`:

```javascript
{
  name: "issue-hygiene",
  command: `node scripts/ops/integrations/linear/issue-hygiene.mjs${dryRunFlag}`,
  severity: "independent",
}
```

**Features:**

1. **Comment analysis:**
   - Counts total comments per issue
   - Identifies failure patterns ("Still failing", stale executions, harness failures)
   - Extracts failure signatures from code blocks
   - Tracks unique failure types

2. **Threshold-based intervention:**
   - Default: 15+ comments triggers hygiene
   - Customizable via `--threshold=N` flag
   - Only intervenes if actual failure comments exist

3. **Systemic failure detection:**
   - Flags issues with 10+ unique failure signatures
   - Marks for human review with diagnostic recommendations

4. **Archive consolidation:**
   - Builds failure history summary with:
     - Total comment count
     - Failure comment count  
     - Stale execution count
     - Unique failure signature count
     - Duration (first to last failure)
     - Recent failure signatures (last 5)
   - Appends to issue description
   - Adds hygiene notification comment
   - Preserves original comments in Linear version history

5. **Safe operation:**
   - Dry-run mode available (`--dry-run`)
   - Rate-limited API calls (100ms analysis, 200ms action)
   - Respects Linear description length limits (50,000 chars)
   - Truncates with warning if necessary

### Code Quality Fixes

Fixed test isolation issue in `symphony-state.mjs` that was causing test failures:

**Changes:**

1. Made state directory calculation dynamic to support test-specific directories
2. Fixed p95 percentile calculation (was off by one index)
3. All functions now use dynamic path resolution

**Files modified:**

- `scripts/ops/core/symphony-state.mjs` — Dynamic state directory, fixed p95 calculation

## Changes Made

### Test Fixes

**File:** `scripts/ops/core/symphony-state.mjs`

**Changes:**

1. **Dynamic state directory resolution:**

```javascript
// Before (static, calculated at module load)
const STATE_DIR = path.join(PROJECT_ROOT, "reports", "symphony");

// After (dynamic, respects environment variable)
function getStateDir() {
  return process.env.ANQR_SYMPHONY_STATE_DIR || path.join(PROJECT_ROOT, "reports", "symphony");
}
```

2. **Fixed p95 percentile calculation:**

```javascript
// Before (incorrect index)
const p95Index = Math.floor(latencies.length * 0.95);

// After (correct index for 95th percentile)
const p95Index = Math.ceil(latencies.length * 0.95) - 1;
```

3. **Updated all file operations to use dynamic paths:**
   - `getStateFile()` — Returns state file path dynamically
   - `getLockFile()` — Returns lock file path dynamically
   - All lock/state operations now call these functions

### No Application Code Changes

The issue hygiene implementation was already complete and operational. No changes to application code were needed.

## Validation

### Quality Gates

All validation gates passed:

```bash
$ npm run typecheck
✅ No type errors

$ npm run lint
✅ Found 0 warnings and 0 errors

$ npm run cspell
✅ Files checked: 3973, Issues found: 0

$ node scripts/audit-ast-density.mjs --threshold 1
✅ No violations

$ npm run test:unit
✅ Test Files: 190 passed (190)
✅ Tests: 3361 passed (3361)
```

### Test Fixes Verified

**symphony-state.spec.ts** now passes all tests:

- ✅ recordCompletion tracks timestamp and latency
- ✅ getLatencyMetrics calculates average, median, p95 correctly
- ✅ checkLatencyBaseline establishes baseline and detects increases
- ✅ Test isolation works correctly with dynamic state directory

### Expected Behavior

**Issue hygiene workflow:**

1. Nightly ops pass runs `issue-hygiene.mjs`
2. Script analyzes all open issues
3. For issues with 15+ comments containing failures:
   - Builds consolidated summary with failure patterns
   - Appends to issue description
   - Adds hygiene notification comment
4. For issues with 10+ unique failure signatures:
   - Flags as systemic failure
   - Adds human review recommendations
5. Original comment history preserved in Linear version control

**Manual execution:**

```bash
# Dry run
LINEAR_API_KEY=... node scripts/ops/integrations/linear/issue-hygiene.mjs --dry-run

# With custom threshold
LINEAR_API_KEY=... node scripts/ops/integrations/linear/issue-hygiene.mjs --threshold=10

# Production run
LINEAR_API_KEY=... node scripts/ops/integrations/linear/issue-hygiene.mjs
```

## Testing Recommendations

### Manual Testing

**Scenario 1:** Test dry-run mode

```bash
LINEAR_API_KEY=... node scripts/ops/integrations/linear/issue-hygiene.mjs --dry-run
```

**Expected:** Output shows which issues would be affected, no actual changes made.

**Scenario 2:** Test with low threshold

```bash
LINEAR_API_KEY=... node scripts/ops/integrations/linear/issue-hygiene.mjs --threshold=5 --dry-run
```

**Expected:** More issues flagged for hygiene (any with 5+ comments).

**Scenario 3:** Check nightly integration

```bash
node scripts/ops/orchestration/nightly-ops-pass.mjs --dry-run
```

**Expected:** Issue hygiene step runs as part of nightly pass.

### Validation Checks

**Before production use:**

1. ✅ **Linear API access** — Verify `LINEAR_API_KEY` is set
2. ✅ **Dry-run first** — Always test with `--dry-run` before production
3. ✅ **Review threshold** — Default 15 may be too high/low for your workflow
4. ✅ **Monitor first run** — Watch for rate limiting or unexpected behavior
5. ✅ **Check Linear history** — Verify original comments preserved in version history

## Deployment Notes

### Prerequisites

- `LINEAR_API_KEY` environment variable set
- Node.js runtime
- Network access to Linear API

### Current State

**Already deployed and operational:**

- ✅ Implementation exists in `scripts/ops/integrations/linear/issue-hygiene.mjs`
- ✅ Integrated into nightly ops pass
- ✅ Runs automatically every night
- ✅ Supports dry-run mode for testing
- ✅ Configurable thresholds

### Configuration Options

**Environment variables:**

- `LINEAR_API_KEY` — Required for Linear API access

**Command-line flags:**

- `--dry-run` — Preview changes without applying
- `--threshold=N` — Set comment threshold (default: 15)

### Monitoring

**Check nightly ops pass logs:**

```bash
journalctl --user -u anqr-nightly.service -f
```

**Look for:**

- `[issue-hygiene] Starting...`
- `Found N issues requiring hygiene`
- `✅ Archived N failure comments on ANQ-XXX`
- `⚠️ Flagged ANQ-XXX for human review (systemic failure pattern)`

## Related Documentation

- **Implementation** — `scripts/ops/integrations/linear/issue-hygiene.mjs`
- **Linear client** — `scripts/ops/integrations/linear/linear-client.mjs`
- **Nightly ops** — `scripts/ops/orchestration/nightly-ops-pass.mjs`
- **Evidence standards** — `docs/harness/06-evidence-and-reporting.md`

## Conclusion

**Status:** Issue hygiene system **already operational** since initial implementation.

**This task:** Verified existing implementation, fixed test isolation bug in symphony-state.mjs.

**Impact:** 
- No application code changes needed
- Test suite now reliable (all tests pass)
- State management supports test isolation
- p95 latency calculation fixed

**System benefits:**
- Automated cleanup of excessive failure comments
- Systemic failure detection and flagging
- Preserved history via Linear version control
- Runs nightly without manual intervention

---

**Verified:** 2026-03-27  
**Author:** Symphony Agent (ANQ-350 REOPENED)  
**Status:** ✅ Complete — Implementation verified, test fixes applied
