# ANQ-321: Pipeline Task Latency Monitoring

## Summary

Implemented comprehensive task latency monitoring for Symphony runner with baseline tracking, alerting, and automated reporting.

## Scope

**Scope class:** harness

**Touched paths:**

- `scripts/ops/orchestration/latency-report.mjs` (new)
- `scripts/ops/orchestration/nightly-ops-pass.mjs` (modified)
- `scripts/ops/core/symphony-state.mjs` (leveraged existing infrastructure)
- `scripts/ops/orchestration/symphony-runner.mjs` (leveraged existing recordCompletion)
- `docs/harness/ANQ-321-evidence.md` (this file)

## Requirements Met

### Target Metrics

- ✅ **Target:** ≤10min per task
- ✅ **Acceptable:** ≤30min per task
- ✅ **Alert threshold:** >50% increase from baseline
- ✅ **Tracking:** Average latency per run with percentiles

### Implementation Details

1. **Latency Capture** (already implemented in symphony-state.mjs)
   - `recordCompletion(issueIdentifier, { latencyMs, completedAt })`
   - Captures wall-clock time from issue start to completion
   - Persisted in Symphony state store

2. **Metrics Calculation** (already implemented in symphony-state.mjs)
   - `getLatencyMetrics()` computes:
     - Average latency (ms)
     - Median latency (ms)
     - P95 latency (ms)
     - Min/Max latency (ms)
     - Completed task count

3. **Baseline Tracking** (already implemented in symphony-state.mjs)
   - `checkLatencyBaseline(currentAverageMs)` compares against baseline
   - Alerts when increase >50%
   - Auto-sets baseline on first run
   - Stored in global state: `latency.baseline_ms`, `latency.baseline_set_at`

4. **Reporting Script** (new: latency-report.mjs)
   - Generates JSON metrics report
   - Classifies performance: excellent/acceptable/degraded
   - Discord alerts on degradation or >50% baseline increase
   - Exit code 1 if alert triggered (for CI/CD integration)

5. **Automated Monitoring** (integrated into nightly-ops-pass.mjs)
   - Runs daily as part of nightly operations
   - Sends Discord alerts when thresholds exceeded
   - Advisory severity: doesn't block pipeline

## Decisions Made

1. **Reused existing infrastructure:** Latency tracking already existed in symphony-state.mjs (from previous work). Avoided reimplementing.

2. **Classification thresholds:**
   - Excellent: ≤10 min (target)
   - Acceptable: ≤30 min (acceptable threshold)
   - Degraded: >30 min (triggers alert)

3. **Alert channels:**
   - Discord webhook for real-time notifications
   - Exit code for CI/CD integration
   - JSON output for programmatic consumption

4. **Baseline strategy:**
   - Auto-set on first successful task
   - Alert on >50% increase (prevents noise from natural variance)
   - Stored in global state (survives restarts)

5. **Integration point:**
   - Added to nightly-ops-pass as advisory check
   - Doesn't block pipeline (severity: advisory)
   - Runs after all critical checks complete

## Commands Run

### Validation

```bash
npm run typecheck
npm run lint
npm run cspell
npm run audit:ast
npm run test:unit
```

All quality gates passed.

## Changed Files

```
scripts/ops/orchestration/latency-report.mjs (new, 173 lines)
scripts/ops/orchestration/nightly-ops-pass.mjs (+5 lines)
docs/harness/ANQ-321-evidence.md (this file)
```

## Artifacts

### Latency Report Example

```json
{
  "timestamp": "2026-03-27T12:00:00.000Z",
  "count": 15,
  "averageMs": 540000,
  "averageDuration": "9m 0s",
  "medianMs": 480000,
  "medianDuration": "8m 0s",
  "p95Ms": 720000,
  "p95Duration": "12m 0s",
  "minMs": 300000,
  "minDuration": "5m 0s",
  "maxMs": 900000,
  "maxDuration": "15m 0s",
  "classification": "excellent",
  "target": {
    "ms": 600000,
    "duration": "10m 0s",
    "met": true
  },
  "acceptable": {
    "ms": 1800000,
    "duration": "30m 0s",
    "met": true
  },
  "baseline": {
    "ms": 540000,
    "duration": "9m 0s",
    "increasePercent": 0,
    "alert": false
  }
}
```

### Discord Alert Format

**Title:** ⚠️ Pipeline Latency Alert: >50% Increase  
**Description:** Average task latency increased 52% from baseline (9m 0s → 13m 42s)

**Fields:**

- Tasks Completed: 20
- Average Latency: 13m 42s
- P95 Latency: 18m 30s
- Classification: ACCEPTABLE
- Target Met: ❌
- Acceptable: ✅
- Baseline Change: +52%

## Risk Assessment

**Risk level:** Low

**Rollback note:**

- Remove latency-report step from nightly-ops-pass.mjs
- Existing Symphony runner continues to record latency (no breaking changes)
- No external dependencies added

**Follow-up work:**

- Monitor baseline over 1-2 weeks to validate thresholds
- Consider per-priority latency tracking (P0 vs P1 vs P2)
- Add latency trend visualization (optional)
- Track cost per successful task (deferred - requires provider cost data)

## Observability

- Structured logging via `createLogger()` (observability-standards compliant)
- Discord webhooks for alerting
- JSON output for programmatic consumption
- Persisted metrics in Symphony state store

## Testing Strategy

**Unit tests:** Not required (simple metrics aggregation, already tested in symphony-state.spec.ts)

**Integration test:** Run nightly-ops-pass with latency-report step:

```bash
node scripts/ops/orchestration/nightly-ops-pass.mjs --dry-run
```

**Manual validation:** Run latency-report directly:

```bash
node scripts/ops/orchestration/latency-report.mjs --alert
```

## Acceptance Criteria

- ✅ Target ≤10min per task (configurable, tracked)
- ✅ Acceptable ≤30min per task (configurable, tracked)
- ✅ Track average latency per run (computed from all completed tasks)
- ✅ Alert on >50% latency increase from baseline (checkLatencyBaseline)
- ⚠️ Monitor cost per successful task (deferred - requires provider pricing integration)

**Cost tracking note:** Current implementation doesn't track monetary cost because:

1. Local Ollama has zero marginal cost per task
2. Symphony bridge abstracts provider details
3. No billing API integration exists yet

Cost monitoring deferred to future work when paid providers are primary route.

## Commit

Commit hash: (to be filled after commit)

Issue: ANQ-321  
State: Done (after successful validation)

---

Generated: 2026-03-27
Author: Symphony Agent
Evidence class: harness-runtime
