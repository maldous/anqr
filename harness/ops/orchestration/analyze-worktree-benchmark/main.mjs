import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { REPORTS_DIR } from "./reports-dir.mjs";
import { compareBenchmarks } from "./compare-benchmarks.mjs";
import { extractBenchmarkMetrics } from "./extract-benchmark-metrics.mjs";
import { generateEvidenceReport } from "./generate-evidence-report.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
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
  node harness/ops/orchestration/analyze-worktree-benchmark.mjs --extract "2026-01-01T10:00:00Z" "2026-01-01T14:00:00Z" 1 > baseline.json
  
  # Extract concurrent (2 worktrees, 4 hours)
  node harness/ops/orchestration/analyze-worktree-benchmark.mjs --extract "2026-01-01T16:00:00Z" "2026-01-01T20:00:00Z" 2 > concurrent.json
  
  # Compare and generate evidence
  node harness/ops/orchestration/analyze-worktree-benchmark.mjs --compare baseline.json concurrent.json
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
      console.log(
        `Throughput: ${comparison.baseline.throughput} → ${comparison.concurrent.throughput} issues/hour (+${comparison.comparison.throughputIncrease}%)`,
      );
      console.log(
        `Conflicts: ${comparison.baseline.conflicts}% → ${comparison.concurrent.conflicts}% (Δ${comparison.comparison.conflictIncrease}%)`,
      );
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
          "Missing required arguments: start-baseline, end-baseline, start-concurrent, end-concurrent, concurrent-worktrees",
        );
      }
      const baseline = extractBenchmarkMetrics(startBaseline, endBaseline, 1);
      const concurrent = extractBenchmarkMetrics(
        startConcurrent,
        endConcurrent,
        Number(concurrentWorktrees),
      );
      const comparison = compareBenchmarks(baseline, concurrent);
      const reportPath = generateEvidenceReport(comparison, baseline, concurrent);

      // Save intermediate results
      const resultsFile = resolve(REPORTS_DIR, "benchmark-results.json");
      writeFileSync(
        resultsFile,
        JSON.stringify({ baseline, concurrent, comparison }, null, 2),
        "utf-8",
      );
      logInfo(`Benchmark results saved: ${resultsFile}`);

      console.log("\n=== Benchmark Comparison ===\n");
      console.log(
        `Throughput: ${comparison.baseline.throughput} → ${comparison.concurrent.throughput} issues/hour (+${comparison.comparison.throughputIncrease}%)`,
      );
      console.log(
        `Conflicts: ${comparison.baseline.conflicts}% → ${comparison.concurrent.conflicts}% (Δ${comparison.comparison.conflictIncrease}%)`,
      );
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
