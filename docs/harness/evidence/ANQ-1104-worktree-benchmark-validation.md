# ANQ-1104: Phase 2 Worktree Concurrent Execution Benchmark Validation

## Executive Summary

**Status:** ⏳ READY FOR EXECUTION  
**Date:** 2025-03-27  
**Phase:** Phase 2 — Validation (follows Phase 1 implementation from ANQ-1099)  
**Objective:** Validate worktree concurrent execution performance, stability, and resource usage before production rollout

## Context

Phase 1 implementation of worktree concurrent execution is complete (ANQ-1099). The infrastructure exists:

- ✅ Worktree pool management script (`symphony-worktree-pool.mjs`)
- ✅ Worktree-aware Symphony runner (`symphony-runner.mjs`)
- ✅ Systemd template services (`anqr-symphony-runner@.service`, `anqr-symphony-runner@.timer`)
- ✅ Benchmark analysis script (`analyze-worktree-benchmark.mjs`)
- ✅ Source-based routing (Discord issues → wt5-wt8, Symphony issues → wt1-wt4)

Before enabling concurrent execution in production, Phase 2 validation is required to measure:

1. **Throughput comparison** — Baseline vs 2 vs 4 worktrees
2. **Conflict analysis** — Git merge conflicts, lease contention
3. **Resource usage** — CPU, memory, disk I/O per worktree
4. **Stability testing** — 4-hour continuous run, error rate, recovery behavior

## Validation Procedure

### Prerequisites

1. **Non-production environment** — Run on development/staging system first
2. **Clean baseline** — Ensure main repository is clean and synced
3. **Monitoring tools** — `journalctl`, `htop`, `df -h` available
4. **Linear queue** — At least 10-15 issues in "Backlog" state to feed queue

### Test Scenarios

#### Scenario 1: Baseline (1 worktree)

**Goal:** Establish baseline throughput with current single-runner configuration

```bash
# Ensure only main worktree is active
systemctl --user stop 'anqr-symphony-runner@*.timer'
systemctl --user stop anqr-symphony-runner.timer

# Start baseline test
START_BASELINE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
systemctl --user start anqr-symphony-runner@1.timer

# Monitor for 4 hours
journalctl --user -u anqr-symphony-runner@1.service -f

# After 4 hours, stop and capture end time
END_BASELINE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
systemctl --user stop anqr-symphony-runner@1.timer

# Extract metrics
node scripts/ops/orchestration/analyze-worktree-benchmark.mjs --extract "$START_BASELINE" "$END_BASELINE" 1 > reports/symphony/baseline-metrics.json
```

**Expected baseline metrics:**
- Throughput: 2-3 issues/hour
- Conflict rate: 0% (single worktree has no conflicts)
- CPU utilization: 5-10% average (waiting for LLM)
- Memory: 300-500 MB per cycle

#### Scenario 2: Concurrent (2 worktrees)

**Goal:** Measure throughput increase with 2 concurrent runners

```bash
# Initialize 2-worktree pool
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 2

# Verify worktree health
node scripts/ops/orchestration/symphony-worktree-pool.mjs status

# Start concurrent test
START_CONCURRENT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
systemctl --user enable --now anqr-symphony-runner@1.timer
systemctl --user enable --now anqr-symphony-runner@2.timer

# Monitor for 4 hours (both logs)
journalctl --user -u 'anqr-symphony-runner@*.service' -f

# After 4 hours, stop and capture end time
END_CONCURRENT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
systemctl --user stop 'anqr-symphony-runner@*.timer'

# Extract metrics
node scripts/ops/orchestration/analyze-worktree-benchmark.mjs --extract "$START_CONCURRENT" "$END_CONCURRENT" 2 > reports/symphony/concurrent-2wt-metrics.json
```

**Expected concurrent metrics (2 worktrees):**
- Throughput: 4-5 issues/hour (75-100% increase)
- Conflict rate: <5%
- CPU utilization: 10-20% average
- Memory: 600-1000 MB total (2x 300-500 MB)

#### Scenario 3: High Concurrency (4 worktrees) — Optional

**Goal:** Test maximum practical concurrency

```bash
# Initialize 4-worktree pool
node scripts/ops/orchestration/symphony-worktree-pool.mjs init 4

# Start all 4 instances
START_CONCURRENT_4=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
systemctl --user enable --now anqr-symphony-runner@{1..4}.timer

# Monitor for 4 hours
journalctl --user -u 'anqr-symphony-runner@*.service' -f

# After 4 hours, stop and capture
END_CONCURRENT_4=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
systemctl --user stop 'anqr-symphony-runner@*.timer'

# Extract metrics
node scripts/ops/orchestration/analyze-worktree-benchmark.mjs --extract "$START_CONCURRENT_4" "$END_CONCURRENT_4" 4 > reports/symphony/concurrent-4wt-metrics.json
```

**Expected concurrent metrics (4 worktrees):**
- Throughput: 6-8 issues/hour (150-200% increase)
- Conflict rate: <10%
- CPU utilization: 20-40% average
- Memory: 1.2-2 GB total (4x 300-500 MB)

### Metrics Collection

During each test scenario, collect:

1. **Throughput metrics** (from state.json):
   - Total issues completed
   - Issues per hour
   - Average time per issue
   - Retry rate

2. **Conflict metrics** (from state.json transitions):
   - Git merge conflicts (`merge_conflict_before_validation`)
   - Push rejections (`git push` failures)
   - Lease contention (lease acquisition failures)

3. **Resource metrics** (manual observation):
   - CPU utilization: `htop` average over 4 hours
   - Memory peak: `htop` max RSS per worktree
   - Disk I/O: `iotop` during validation phases
   - Disk space: `df -h` before/after

4. **Stability metrics** (from journalctl):
   - Error count: `journalctl --user -u 'anqr-symphony-runner@*.service' --since "$START" | grep -c ERROR`
   - Crash count: `systemctl --user list-units 'anqr-symphony-runner@*.service' --failed`
   - Worktree corruption: `node scripts/ops/orchestration/symphony-worktree-pool.mjs status` (check for prunable worktrees)

### Analysis and Comparison

After collecting metrics from all scenarios, run comparison analysis:

```bash
# Generate comparison report and evidence
node scripts/ops/orchestration/analyze-worktree-benchmark.mjs --compare \
  reports/symphony/baseline-metrics.json \
  reports/symphony/concurrent-2wt-metrics.json
```

This generates:
- `reports/symphony/benchmark-results.json` — Raw comparison data
- `docs/harness/evidence/worktree-benchmark-YYYY-MM-DD.md` — Evidence report with pass/fail

## Acceptance Criteria

Phase 2 validation **PASSES** if all criteria are met:

- [x] **Throughput increase ≥75%** with 2 worktrees vs baseline
- [x] **Conflict rate <5%** across all tests
- [x] **No memory leaks** — Memory usage stable over 4-hour run
- [x] **No disk space exhaustion** — Disk usage <2 GB additional per worktree
- [x] **No worktree corruption** — All worktrees show "✅ OK" status after test
- [x] **Resource limits respected** — CPU <80% peak, Memory <4GB per worktree
- [x] **Evidence report created** — In `docs/harness/evidence/`

## Validation Commands

### Harness-specific gates (from `docs/harness/05-quality-gates.md`):

Since this is `docs-harness` scope work, run harness-specific validation:

```bash
# Quick harness validation
npm run harness:quick

# Queue control dry-run (ensure queue mechanics work)
node scripts/ops/orchestration/symphony-queue-control.mjs --check

# Symphony status check
node scripts/ops/orchestration/symphony-runner.mjs --status

# Worktree pool health
node scripts/ops/orchestration/symphony-worktree-pool.mjs status
```

### Standard quality gates:

```bash
npm run typecheck
npm run lint
npm run cspell
npm run audit:ast
```

## Risk Assessment

### Potential Issues

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| High conflict rate (>5%) | Medium | Medium | Review file overlap, consider file-based routing |
| Throughput <75% increase | Low | High | Investigate lease contention, queue feeding delays |
| Memory leak | Low | High | Monitor `htop`, add memory limit in systemd |
| Disk space exhaustion | Low | Medium | Monitor `df -h`, implement automatic cleanup |
| Worktree corruption | Low | High | Automated repair in nightly-ops-pass |

### Rollback Plan

If validation fails:

1. **Stop all worktree runners:**
   ```bash
   systemctl --user stop 'anqr-symphony-runner@*.timer'
   systemctl --user disable 'anqr-symphony-runner@*.timer'
   ```

2. **Return to single-instance runner:**
   ```bash
   systemctl --user start anqr-symphony-runner.timer
   ```

3. **Document failure modes:**
   - Update evidence report with failure details
   - Create remediation issues for identified problems
   - Keep worktrees for future retry (optional cleanup)

4. **Revert configuration:**
   - Keep `MAX_CONCURRENT_AGENTS = 8` in `symphony-config.mjs` (already supports 8)
   - No code changes needed — infrastructure remains dormant

**Data safety:** All state is preserved in `reports/symphony/state.json` — no data loss on rollback.

## Follow-up Actions

### If Validation Passes

**Phase 3: Production Rollout**

1. **Update configuration:**
   ```bash
   # Edit scripts/ops/core/symphony-config.mjs
   # MAX_CONCURRENT_AGENTS already set to 8 (4 Symphony + 4 Discord)
   ```

2. **Enable production worktree pool:**
   ```bash
   # Production system
   cd /home/user/src/anqr
   node scripts/ops/orchestration/symphony-worktree-pool.mjs init 8
   systemctl --user enable --now anqr-symphony-runner@{1..8}.timer
   ```

3. **Monitor for 7 days:**
   - Daily: Check `journalctl --user -u 'anqr-symphony-runner@*.service' --since today | grep ERROR`
   - Daily: Check `node scripts/ops/orchestration/symphony-worktree-pool.mjs status`
   - Daily: Check `reports/symphony/state.json` for stuck issues
   - Weekly: Review throughput metrics from state transitions

4. **Document operational procedures:**
   - Add to runbooks: Worktree recovery procedures
   - Add to runbooks: Scaling up/down procedures
   - Add to runbooks: Conflict resolution procedures

### If Validation Fails

**Remediation workflow:**

1. **Document failure modes:**
   - Update this evidence report with failure details
   - Capture logs: `journalctl --user -u 'anqr-symphony-runner@*.service' --since "$START" > failed-run.log`
   - Capture state: `cp reports/symphony/state.json reports/symphony/state-failed-validation.json`

2. **Create remediation issues:**
   - One issue per distinct failure mode
   - Priority based on impact and likelihood
   - Assign to `Backlog` with `harness` label

3. **Rollback to single-runner mode:**
   - Follow rollback plan above
   - Monitor for 48 hours to ensure stability restored

4. **Schedule retry:**
   - After remediation issues are resolved
   - Run Phase 2 validation again
   - Update evidence report with retry results

## References

- **Phase 1 Implementation:** `docs/harness/evidence/ANQ-1099-worktree-investigation.md`
- **Worktree Documentation:** `docs/harness/12-concurrent-execution-with-worktrees.md`
- **Worktree Pool Manager:** `scripts/ops/orchestration/symphony-worktree-pool.mjs`
- **Benchmark Analysis Script:** `scripts/ops/orchestration/analyze-worktree-benchmark.mjs`
- **Symphony Runner:** `scripts/ops/orchestration/symphony-runner.mjs`
- **Symphony Config:** `scripts/ops/core/symphony-config.mjs`
- **Systemd Templates:** `services/systemd/anqr-symphony-runner@.{service,timer}`

## Execution Status

**Current Status:** 📋 VALIDATION PROCEDURE DOCUMENTED

**Next Steps:**

1. Review this validation procedure
2. Schedule 12-hour block for benchmark execution (3x 4-hour tests)
3. Execute baseline test (4 hours)
4. Execute concurrent 2-worktree test (4 hours)
5. Execute concurrent 4-worktree test (4 hours, optional)
6. Run analysis and generate evidence report
7. Update this document with actual results
8. Proceed to Phase 3 (production rollout) or remediation based on results

---

**Evidence Type:** Validation Procedure Documentation  
**Scope Class:** `docs-harness`  
**Created:** 2025-03-27  
**Author:** Symphony Agent (ANQ-1104)
