// Generated from ../../../../scripts/ops/integrations/linear/issue-hygiene.mjs:91

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
    );
    lines.push("This likely indicates a fundamental problem that requires human investigation.");
    lines.push("");
  }

  if (analysis.firstComment && analysis.lastComment) {
    const firstDate = new Date(analysis.firstComment.createdAt).toISOString().split("T")[0];
    const lastDate = new Date(analysis.lastComment.createdAt).toISOString().split("T")[0];
    const durationDays = Math.floor(
      (new Date(analysis.lastComment.createdAt) - new Date(analysis.firstComment.createdAt)) /
        (1000 * 60 * 60 * 24),
    );

    lines.push(`**First failure:** ${firstDate}`);
    lines.push(`**Last failure:** ${lastDate}`);
    lines.push(`**Duration:** ${durationDays} days`);
    lines.push("");
  }

  lines.push("### Recent Failure Signatures");
  lines.push("");
  const recentSignatures = Array.from(analysis.uniqueFailures).slice(-5);
  for (const sig of recentSignatures) {
    lines.push("```");
    lines.push(sig);
    lines.push("```");
    lines.push("");
  }

  lines.push("---");
  lines.push("*Archived by issue-hygiene.mjs*");
  lines.push(
    "*Original comment history preserved in Linear version history. Archive preserves failure patterns for analysis.*",
  );

  return lines.join("\n");
}
