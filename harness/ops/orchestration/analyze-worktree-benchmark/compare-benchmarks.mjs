// Generated from ../../../scripts/ops/orchestration/analyze-worktree-benchmark.mjs:106

export function compareBenchmarks(baseline, concurrent) {
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
