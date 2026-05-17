export function buildRecommendationsSection(comparison, concurrentMetrics) {
  if (comparison.pass) {
    return (
      "### ✅ Validation Passed\n\n" +
      "Concurrent execution with " + concurrentMetrics.worktreeCount + " worktrees is ready for production:\n\n" +
      "1. Update `MAX_CONCURRENT_AGENTS` in `harness/ops/core/symphony-config.mjs` " +
      "to " + concurrentMetrics.worktreeCount + "\n" +
      "2. Enable production worktree pool: " +
      "`node harness/ops/orchestration/symphony-worktree-pool.mjs init " +
      concurrentMetrics.worktreeCount + "`\n" +
      "3. Enable systemd timers: " +
      "`systemctl --user enable --now anqr-symphony-runner@{1.." +
      concurrentMetrics.worktreeCount + "}.timer`\n" +
      "4. Monitor for 7 days (Phase 3)\n"
    );
  }
  const failures = [];
  if (!comparison.thresholds.throughputIncrease) {
    failures.push(
      "- **Throughput:** Only " + comparison.comparison.throughputIncrease + "% increase (target: ≥75%)\n" +
        "  - Review runner contention and lease acquisition delays\n" +
        "  - Check for queue starvation or idle gaps\n",
    );
  }
  if (!comparison.thresholds.conflictRate) {
    failures.push(
      "- **Conflicts:** " + comparison.concurrent.conflicts + "% conflict rate (target: <5%)\n" +
        "  - Review git push collision handling\n" +
        "  - Consider serializing final push operations\n",
    );
  }
  return (
    "### ❌ Validation Failed\n\n" +
    "Issues detected — remediation required:\n\n" +
    failures.join("") +
    "\n**Action:** Create remediation issues and rollback to single-runner mode.\n"
  );
}
