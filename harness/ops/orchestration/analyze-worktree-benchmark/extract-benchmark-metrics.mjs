// Generated from ../../../scripts/ops/orchestration/analyze-worktree-benchmark.mjs:33

import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";

import { REPORTS_DIR } from "./reports-dir.mjs";

export function extractBenchmarkMetrics(startTime, endTime, worktreeCount) {
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
          t.reason.includes("push")),
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
  const conflictRate =
    completedIssues.length > 0 ? (gitConflicts.length / completedIssues.length) * 100 : 0;

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
