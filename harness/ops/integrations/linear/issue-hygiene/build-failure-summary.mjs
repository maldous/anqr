import { SYSTEMIC_FAILURE_THRESHOLD } from "./systemic-failure-threshold.mjs";

export function buildFailureSummary(issue, comments, analysis) {
  const lines = [
    "## Failure History (Archived)",
    "",
    `**Total comments:** ${comments.length}`,
    `**Failure comments:** ${analysis.failureCount}`,
    `**Stale execution alerts:** ${analysis.staleCount}`,
    `**Unique failure signatures:** ${analysis.uniqueFailures.size}`,
    "",
  ];

  if (analysis.uniqueFailures.size >= SYSTEMIC_FAILURE_THRESHOLD) {
    lines.push(
      "⚠️ **SYSTEMIC FAILURE DETECTED** — This issue has failed repeatedly with similar signatures.",
      "This likely indicates a fundamental problem that requires human investigation.",
      "",
    );
  }

  if (analysis.firstComment && analysis.lastComment) {
    const firstDate = new Date(analysis.firstComment.createdAt).toISOString().split("T")[0];
    const lastDate = new Date(analysis.lastComment.createdAt).toISOString().split("T")[0];
    const durationDays = Math.floor(
      (new Date(analysis.lastComment.createdAt) - new Date(analysis.firstComment.createdAt)) /
        (1000 * 60 * 60 * 24),
    );

    lines.push(`**First failure:** ${firstDate}`, `**Last failure:** ${lastDate}`, `**Duration:** ${durationDays} days`, "");
  }

  lines.push("### Recent Failure Signatures", "");
  const recentSignatures = Array.from(analysis.uniqueFailures).slice(-5);
  for (const sig of recentSignatures) {
    lines.push("```", sig, "```", "");
  }

  lines.push(
    "---",
    "*Archived by issue-hygiene.mjs*",
    "*Original comment history preserved in Linear version history. Archive preserves failure patterns for analysis.*",
  );

  return lines.join("\n");
}
