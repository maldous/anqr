// Generated from ../../../../scripts/ops/integrations/linear/issue-hygiene.mjs:185

import { updateIssue, addComment } from "../linear-client.mjs";

import { MAX_DESCRIPTION_LENGTH } from "./max-description-length.mjs";
import { buildFailureSummary } from "./build-failure-summary.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function applyHygiene(result, dryRun) {
  const { issue, detail, analysis, isSystemic, recommendation } = result;

  const summary = buildFailureSummary(issue, detail.comments.nodes, analysis);

  // Append summary to existing description
  const newDescription = `${detail.description || ""}\n\n${summary}`;

  if (dryRun) {
    logInfo(`[DRY RUN] Would update ${issue.identifier}:`);
    logInfo(`  Recommendation: ${recommendation}`);
    logInfo(`  Failure count: ${analysis.failureCount}`);
    logInfo(`  Unique failures: ${analysis.uniqueFailures.size}`);
    if (isSystemic) {
      logWarn(`  ⚠️  SYSTEMIC FAILURE — Would flag for human review`);
    }
    return;
  }

  // Update description with archived summary (check length limit)
  if (newDescription.length > MAX_DESCRIPTION_LENGTH) {
    logWarn(
      `Description would exceed ${MAX_DESCRIPTION_LENGTH} chars for ${issue.identifier}, truncating...`,
    );
    const truncated = newDescription.substring(0, MAX_DESCRIPTION_LENGTH - 100) + "\n\n[Truncated]";
    await updateIssue(issue.id, { description: truncated });
  } else {
    await updateIssue(issue.id, { description: newDescription });
  }

  logInfo(`✅ Archived ${analysis.failureCount} failure comments on ${issue.identifier}`);

  // Add hygiene notification comment
  const notificationLines = [
    "🧹 **Issue Hygiene Applied**",
    "",
    `Archived ${result.commentCount} comments (${analysis.failureCount} failure reports) to issue description.`,
  ];

  if (isSystemic) {
    notificationLines.push("");
    notificationLines.push(
      "⚠️ **SYSTEMIC FAILURE PATTERN DETECTED** — This issue requires human investigation.",
    );
    notificationLines.push("");
    notificationLines.push("Possible causes:");
    notificationLines.push("- Fundamental architectural issue");
    notificationLines.push("- Missing dependencies or environment configuration");
    notificationLines.push("- Incorrectly scoped issue (too broad)");
    notificationLines.push("- AI agent capability limitation");
    notificationLines.push("");
    notificationLines.push(
      "**Recommendation:** Review failure signatures in description and determine root cause.",
    );
  } else {
    notificationLines.push("");
    notificationLines.push("Original comment history preserved in Linear version history.");
    notificationLines.push("Failure patterns archived for analysis.");
  }

  await addComment(issue.id, notificationLines.join("\n"));

  if (isSystemic) {
    logWarn(`⚠️  Flagged ${issue.identifier} for human review (systemic failure pattern)`);
  }
}
