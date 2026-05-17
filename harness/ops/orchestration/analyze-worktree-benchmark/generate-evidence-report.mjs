import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

import { EVIDENCE_DIR } from "./evidence-dir.mjs";
import { logInfo } from "./logger.mjs";import { buildRecommendationsSection } from "./generate-evidence-report/build-recommendations-section.mjs";

export function generateEvidenceReport(comparison, baselineMetrics, concurrentMetrics) {
  const timestamp = new Date().toISOString().split("T")[0];
  const reportPath = resolve(EVIDENCE_DIR, `worktree-benchmark-${timestamp}.md`);

  const report = `# Worktree Concurrent Execution Benchmark Results

## Executive Summary

**Date:** ${new Date().toISOString()}
**Test Duration:** ${baselineMetrics.durationHours}h (baseline), ${concurrentMetrics.durationHours}h (concurrent)
**Result:** ${comparison.pass ? "✅ PASS" : "❌ FAIL"}

## Throughput Comparison

| Configuration | Worktrees | Issues/Hour | Total Issues |
|---------------|-----------|-------------|--------------|
| Baseline      | ${comparison.baseline.worktrees} | ${comparison.baseline.throughput} | ${baselineMetrics.completedIssues} |
| Concurrent    | ${comparison.concurrent.worktrees} | ${comparison.concurrent.throughput} | ${concurrentMetrics.completedIssues} |

**Throughput Increase:** ${comparison.comparison.throughputIncrease}% ${comparison.thresholds.throughputIncrease ? "✅" : "❌ (target: ≥75%)"}

## Conflict Analysis

| Configuration | Git Conflicts | Conflict Rate |
|---------------|---------------|---------------|
| Baseline      | ${baselineMetrics.gitConflicts} | ${comparison.baseline.conflicts}% |
| Concurrent    | ${concurrentMetrics.gitConflicts} | ${comparison.concurrent.conflicts}% |

**Conflict Rate:** ${comparison.concurrent.conflicts}% ${comparison.thresholds.conflictRate ? "✅" : "❌ (target: <5%)"}

## Resource Usage

### Baseline (${baselineMetrics.worktreeCount} worktree)
- CPU Average: ${baselineMetrics.resourceMetrics?.cpuAvg || "N/A"}
- Memory Peak: ${baselineMetrics.resourceMetrics?.memoryPeak || "N/A"}
- Disk I/O: ${baselineMetrics.resourceMetrics?.diskIO || "N/A"}

### Concurrent (${concurrentMetrics.worktreeCount} worktrees)
- CPU Average: ${concurrentMetrics.resourceMetrics?.cpuAvg || "N/A"}
- Memory Peak: ${concurrentMetrics.resourceMetrics?.memoryPeak || "N/A"}
- Disk I/O: ${concurrentMetrics.resourceMetrics?.diskIO || "N/A"}

## Stability

### Baseline
- Issues Completed: ${baselineMetrics.completedIssues}
- Average Retry Count: ${baselineMetrics.completedIssues > 0 ? (baselineMetrics.issueDetails.reduce((sum, i) => sum + i.retryCount, 0) / baselineMetrics.completedIssues).toFixed(2) : "0.00"}

### Concurrent
- Issues Completed: ${concurrentMetrics.completedIssues}
- Average Retry Count: ${concurrentMetrics.completedIssues > 0 ? (concurrentMetrics.issueDetails.reduce((sum, i) => sum + i.retryCount, 0) / concurrentMetrics.completedIssues).toFixed(2) : "0.00"}

## Acceptance Criteria

- [${comparison.thresholds.throughputIncrease ? "x" : " "}] Throughput increase ≥75% with 2 worktrees
- [${comparison.thresholds.conflictRate ? "x" : " "}] Conflict rate <5% across all tests
- [ ] No memory leaks or disk space exhaustion (manual verification required)
- [ ] No worktree corruption during test run (manual verification required)
- [ ] Resource usage within acceptable limits (manual verification required)

## Test Configuration

### Baseline
- Start: ${baselineMetrics.startTime}
- End: ${baselineMetrics.endTime}
- Duration: ${baselineMetrics.durationHours} hours
- Worktrees: ${baselineMetrics.worktreeCount}

### Concurrent
- Start: ${concurrentMetrics.startTime}
- End: ${concurrentMetrics.endTime}
- Duration: ${concurrentMetrics.durationHours} hours
- Worktrees: ${concurrentMetrics.worktreeCount}

## Recommendations

${buildRecommendationsSection(comparison, concurrentMetrics)}

## Evidence Files

- State snapshot: \`reports/symphony/state.json\`
- Benchmark results: \`reports/symphony/benchmark-results.json\`
- This report: \`docs/harness/evidence/worktree-benchmark-${timestamp}.md\`

---

**Generated:** ${new Date().toISOString()}
**Validation:** Worktree concurrency benchmark
`;

  writeFileSync(reportPath, report, "utf-8");
  logInfo(`Evidence report written: ${reportPath}`);

  return reportPath;
}
