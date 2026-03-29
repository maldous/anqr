#!/usr/bin/env node

/**
 * analyze-worktree-benchmark.mjs — Analyze worktree concurrent execution benchmarks
 *
 * Measures throughput, conflict rate, resource usage, and stability for
 * concurrent Symphony execution using git worktrees.
 *
 * Usage:
 *   node scripts/ops/orchestration/analyze-worktree-benchmark.mjs --report <path>
 *   node scripts/ops/orchestration/analyze-worktree-benchmark.mjs --compare <baseline> <concurrent>
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../lib/logger.mjs";

const { logInfo, logError } = createLogger();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..", "..", "..");
const REPORTS_DIR = resolve(PROJECT_ROOT, "reports", "symphony");
const EVIDENCE_DIR = resolve(PROJECT_ROOT, "docs", "harness", "evidence");

/**
 * Extract metrics from symphony state.json and journalctl logs
 * @param {string} startTime - ISO timestamp when benchmark started
 * @param {string} endTime - ISO timestamp when benchmark ended
 * @param {number} worktreeCount - Number of worktrees in use
 * @returns {Object} - Benchmark metrics
 */
function extractBenchmarkMetrics(startTime, endTime, worktreeCount) {
  const stateFile = resolve(REPORTS_DIR, "state.json");
  
  if (!existsSync(stateFile)) {
    throw new Error(`State file not found: ${stateFile}`);
  }

  const state = JSON.parse(readFileSync(stateFile, "utf-8"));
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationHours = (end - start) / (1000 * 60 * 60);

  // Count issues completed in time window
  const completedIssues = Object.values(state.issues || {}).filter((issue) => {
    if (!issue.transitions || issue.transitions.length === 0) return false;
    const lastTransition = issue.transitions[issue.transitions.length - 1];
    const transitionTime = new Date(lastTransition.timestamp).getTime();
    return (
      transitionTime >= start &&
      transitionTime <= end &&
      (lastTransition.to === "Done" || lastTransition.to === "In Review")
    );
  });

  // Count conflicts (failures with git-related reasons)
  const gitConflicts = Object.values(state.issues || {}).filter((issue) => {
    if (!issue.transitions) return false;
    return issue.transitions.some(
      (t) =>
        t.reason &&
        (t.reason.includes("git") ||
          t.reason.includes("conflict") ||
          t.reason.includes("merge") ||
          t.reason.includes("push"))
    );
  });

  // Resource metrics extraction is best-effort
  const resourceMetrics = {
    cpuAvg: "N/A",
    memoryPeak: "N/A",
    diskIO: "N/A",
  };

  // Calculate throughput
  const throughput = completedIssues.length / durationHours;
  const conflictRate = completedIssues.length > 0 
    ? (gitConflicts.length / completedIssues.length) * 100 
    : 0;

  return {
    worktreeCount,
    durationHours: durationHours.toFixed(2),
    startTime,
    endTime,
    completedIssues: completedIssues.length,
    throughput: throughput.toFixed(2),
    gitConflicts: gitConflicts.length,
    conflictRate: conflictRate.toFixed(2),
    resourceMetrics,
    issueDetails: completedIssues.map((issue) => ({
      identifier: issue.issueIdentifier,
      priority: issue.priority,
      retryCount: issue.retry_count || 0,
    })),
  };
}

/**
 * Compare two benchmark runs
 * @param {Object} baseline - Baseline metrics (1 worktree)
 * @param {Object} concurrent - Concurrent metrics (2+ worktrees)
 * @returns {Object} - Comparison results
 */
function compareBenchmarks(baseline, concurrent) {
  const throughputIncrease =
    ((concurrent.throughput - baseline.throughput) / baseline.throughput) * 100;
  const conflictIncrease = concurrent.conflictRate - baseline.conflictRate;

  const passThresholds = {
    throughputIncrease: throughputIncrease >= 75, // ≥75% improvement required
    conflictRate: concurrent.conflictRate < 5, // <5% conflict rate required
  };

  return {
    baseline: {
      worktrees: baseline.worktreeCount,
      throughput: baseline.throughput,
      conflicts: baseline.conflictRate,
    },
    concurrent: {
      worktrees: concurrent.worktreeCount,
      throughput: concurrent.throughput,
      conflicts: concurrent.conflictRate,
    },
    comparison: {
      throughputIncrease: throughputIncrease.toFixed(2),
      conflictIncrease: conflictIncrease.toFixed(2),
    },
    pass: passThresholds.throughputIncrease && passThresholds.conflictRate,
    thresholds: passThresholds,
  };
}

/**
 * Generate evidence report
 * @param {Object} comparison - Comparison results
 * @param {Object} baselineMetrics - Full baseline metrics
 * @param {Object} concurrentMetrics - Full concurrent metrics
 * @returns {string} - Markdown report
 */
function generateEvidenceReport(comparison, baselineMetrics, concurrentMetrics) {
  const timestamp = new Date().toISOString().split("T")[0];
  const reportPath = resolve(EVIDENCE_DIR, `worktree-benchmark-${timestamp}.md`);

  const report = `# ANQ-1104: Worktree Concurrent Execution Benchmark Results

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

${
  comparison.pass
    ? `### ✅ Validation Passed

Concurrent execution with ${concurrentMetrics.worktreeCount} worktrees is ready for production:

1. Update \`MAX_CONCURRENT_AGENTS\` in \`scripts/ops/core/symphony-config.mjs\` to ${concurrentMetrics.worktreeCount}
2. Enable production worktree pool: \`node scripts/ops/orchestration/symphony-worktree-pool.mjs init ${concurrentMetrics.worktreeCount}\`
3. Enable systemd timers: \`systemctl --user enable --now anqr-symphony-runner@{1..${concurrentMetrics.worktreeCount}}.timer\`
4. Monitor for 7 days (Phase 3)
`
    : `### ❌ Validation Failed

Issues detected — remediation required:

${
  !comparison.thresholds.throughputIncrease
    ? `- **Throughput:** Only ${comparison.comparison.throughputIncrease}% increase (target: ≥75%)\\n  - Review runner contention and lease acquisition delays\\n  - Check for queue starvation or idle gaps\\n`
    : ""
}${
  !comparison.thresholds.conflictRate
    ? `- **Conflicts:** ${comparison.concurrent.conflicts}% conflict rate (target: <5%)\\n  - Review git push collision handling\\n  - Consider serializing final push operations\\n`
    : ""
}

**Action:** Create remediation issues and rollback to single-runner mode.
`
}

## Evidence Files

- State snapshot: \`reports/symphony/state.json\`
- Benchmark results: \`reports/symphony/benchmark-results.json\`
- This report: \`docs/harness/evidence/worktree-benchmark-${timestamp}.md\`

---

**Generated:** ${new Date().toISOString()}
**Validation:** Phase 2 (ANQ-1104)
`;

  writeFileSync(reportPath, report, "utf-8");
  logInfo(`Evidence report written: ${reportPath}`);

  return reportPath;
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    console.log(`Usage:
  analyze-worktree-benchmark.mjs --extract <start> <end> <worktrees>
    Extract metrics from state.json for given time window
    
  analyze-worktree-benchmark.mjs --compare <baseline.json> <concurrent.json>
    Compare two benchmark runs and generate evidence report
    
  analyze-worktree-benchmark.mjs --report <start-baseline> <end-baseline> <start-concurrent> <end-concurrent> <concurrent-worktrees>
    Full pipeline: extract both runs and generate comparison report

Examples:
  # Extract baseline (1 worktree, 4 hours)
  node scripts/ops/orchestration/analyze-worktree-benchmark.mjs --extract "2026-01-01T10:00:00Z" "2026-01-01T14:00:00Z" 1 > baseline.json
  
  # Extract concurrent (2 worktrees, 4 hours)
  node scripts/ops/orchestration/analyze-worktree-benchmark.mjs --extract "2026-01-01T16:00:00Z" "2026-01-01T20:00:00Z" 2 > concurrent.json
  
  # Compare and generate evidence
  node scripts/ops/orchestration/analyze-worktree-benchmark.mjs --compare baseline.json concurrent.json
`);
    process.exit(0);
  }

  try {
    if (args[0] === "--extract") {
      const [, startTime, endTime, worktreeCount] = args;
      if (!startTime || !endTime || !worktreeCount) {
        throw new Error("Missing required arguments: start, end, worktreeCount");
      }
      const metrics = extractBenchmarkMetrics(startTime, endTime, Number(worktreeCount));
      console.log(JSON.stringify(metrics, null, 2));
    } else if (args[0] === "--compare") {
      const [, baselineFile, concurrentFile] = args;
      if (!baselineFile || !concurrentFile) {
        throw new Error("Missing required arguments: baseline.json, concurrent.json");
      }
      const baseline = JSON.parse(readFileSync(baselineFile, "utf-8"));
      const concurrent = JSON.parse(readFileSync(concurrentFile, "utf-8"));
      const comparison = compareBenchmarks(baseline, concurrent);
      const reportPath = generateEvidenceReport(comparison, baseline, concurrent);
      
      console.log("\n=== Benchmark Comparison ===\n");
      console.log(`Throughput: ${comparison.baseline.throughput} → ${comparison.concurrent.throughput} issues/hour (+${comparison.comparison.throughputIncrease}%)`);
      console.log(`Conflicts: ${comparison.baseline.conflicts}% → ${comparison.concurrent.conflicts}% (Δ${comparison.comparison.conflictIncrease}%)`);
      console.log(`\nResult: ${comparison.pass ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`\nEvidence report: ${reportPath}`);
    } else if (args[0] === "--report") {
      const [, startBaseline, endBaseline, startConcurrent, endConcurrent, concurrentWorktrees] =
        args;
      if (
        !startBaseline ||
        !endBaseline ||
        !startConcurrent ||
        !endConcurrent ||
        !concurrentWorktrees
      ) {
        throw new Error(
          "Missing required arguments: start-baseline, end-baseline, start-concurrent, end-concurrent, concurrent-worktrees"
        );
      }
      const baseline = extractBenchmarkMetrics(startBaseline, endBaseline, 1);
      const concurrent = extractBenchmarkMetrics(
        startConcurrent,
        endConcurrent,
        Number(concurrentWorktrees)
      );
      const comparison = compareBenchmarks(baseline, concurrent);
      const reportPath = generateEvidenceReport(comparison, baseline, concurrent);
      
      // Save intermediate results
      const resultsFile = resolve(REPORTS_DIR, "benchmark-results.json");
      writeFileSync(
        resultsFile,
        JSON.stringify({ baseline, concurrent, comparison }, null, 2),
        "utf-8"
      );
      logInfo(`Benchmark results saved: ${resultsFile}`);
      
      console.log("\n=== Benchmark Comparison ===\n");
      console.log(`Throughput: ${comparison.baseline.throughput} → ${comparison.concurrent.throughput} issues/hour (+${comparison.comparison.throughputIncrease}%)`);
      console.log(`Conflicts: ${comparison.baseline.conflicts}% → ${comparison.concurrent.conflicts}% (Δ${comparison.comparison.conflictIncrease}%)`);
      console.log(`\nResult: ${comparison.pass ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`\nEvidence report: ${reportPath}`);
    } else {
      throw new Error(`Unknown command: ${args[0]}`);
    }
  } catch (err) {
    logError(`Benchmark analysis failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
