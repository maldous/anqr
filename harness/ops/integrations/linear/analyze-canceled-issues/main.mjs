// Generated from ../../../../scripts/ops/integrations/linear/analyze-canceled-issues.mjs:33

import { listIssuesByState } from "../linear-client.mjs";

import { CORRECT_CANCEL_PATTERNS } from "./correct-cancel-patterns.mjs";
import { REOPEN_PATTERNS } from "./reopen-patterns.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function main() {
  logInfo("[analyze-canceled-issues] Starting analysis...\n");

  const issues = await listIssuesByState(["Canceled"]);

  logInfo(`[analyze-canceled-issues] Analyzing ${issues.length} canceled issues\n`);

  const analysis = {
    shouldReopen: [],
    correctlyCanceled: [],
    needsReview: [],
  };

  for (const issue of issues) {
    const description = issue.description || "";
    const title = issue.title || "";
    const combined = `${title} ${description}`;

    // Check for explicit reopening markers
    if (REOPEN_PATTERNS.REOPENED.test(combined)) {
      analysis.shouldReopen.push({
        issue,
        reason: "Contains REOPENED marker",
        priority: "high",
      });
      continue;
    }

    if (REOPEN_PATTERNS.RE_EVALUATE.test(combined)) {
      analysis.shouldReopen.push({
        issue,
        reason: "Contains RE-EVALUATE marker",
        priority: "medium",
      });
      continue;
    }

    // Parent issues should likely remain open for tracking
    if (
      REOPEN_PATTERNS.PARENT_ISSUE.test(combined) &&
      !CORRECT_CANCEL_PATTERNS.EXPLICIT_CANCEL.test(combined)
    ) {
      analysis.needsReview.push({
        issue,
        reason: "Parent issue - may need to remain open for tracking",
        priority: "low",
      });
      continue;
    }

    // Check for correct cancellations
    let correctlyCanceled = false;
    for (const [key, pattern] of Object.entries(CORRECT_CANCEL_PATTERNS)) {
      if (pattern.test(combined)) {
        analysis.correctlyCanceled.push({
          issue,
          reason: `Correctly canceled: ${key}`,
        });
        correctlyCanceled = true;
        break;
      }
    }

    if (correctlyCanceled) continue;

    // Issues without clear cancellation reason need review
    if (!description || description.length < 50) {
      analysis.needsReview.push({
        issue,
        reason: "No clear cancellation reason in description",
        priority: "medium",
      });
    }
  }

  // Print results
  logInfo("=".repeat(80));
  logInfo("ANALYSIS RESULTS");
  logInfo("=".repeat(80) + "\n");

  if (analysis.shouldReopen.length > 0) {
    logWarn(`\n🔄 SHOULD BE REOPENED (${analysis.shouldReopen.length} issues):`);
    logWarn("-".repeat(80));

    const highPriority = analysis.shouldReopen.filter((a) => a.priority === "high");
    const mediumPriority = analysis.shouldReopen.filter((a) => a.priority === "medium");

    if (highPriority.length > 0) {
      logWarn("\nHIGH PRIORITY:");
      for (const rec of highPriority) {
        logWarn(`\n${rec.issue.identifier}: ${rec.issue.title}`);
        logWarn(`  Reason: ${rec.reason}`);
        logWarn(
          `  Labels: ${(rec.issue.labels?.nodes || []).map((l) => l.name).join(", ") || "none"}`,
        );
        logWarn(`  Created: ${rec.issue.createdAt.split("T")[0]}`);
        if (rec.issue.description) {
          const preview = rec.issue.description.substring(0, 150).replaceAll("\n", " ");
          logWarn(`  Description: ${preview}...`);
        }
      }
    }

    if (mediumPriority.length > 0) {
      logWarn("\nMEDIUM PRIORITY:");
      for (const rec of mediumPriority) {
        logWarn(`\n${rec.issue.identifier}: ${rec.issue.title}`);
        logWarn(`  Reason: ${rec.reason}`);
        logWarn(
          `  Labels: ${(rec.issue.labels?.nodes || []).map((l) => l.name).join(", ") || "none"}`,
        );
        logWarn(`  Created: ${rec.issue.createdAt.split("T")[0]}`);
      }
    }
  }

  if (analysis.needsReview.length > 0) {
    logInfo(`\n\n⚠️  NEEDS MANUAL REVIEW (${analysis.needsReview.length} issues):`);
    logInfo("-".repeat(80));
    for (const rec of analysis.needsReview.slice(0, 10)) {
      logInfo(`\n${rec.issue.identifier}: ${rec.issue.title}`);
      logInfo(`  Reason: ${rec.reason}`);
      logInfo(`  Priority: ${rec.priority}`);
    }
    if (analysis.needsReview.length > 10) {
      logInfo(`\n  ... and ${analysis.needsReview.length - 10} more`);
    }
  }

  logInfo(`\n\n✅ CORRECTLY CANCELED (${analysis.correctlyCanceled.length} issues)`);
  logInfo("-".repeat(80));
  logInfo("These issues were correctly canceled (NOT IN 1.0 SCOPE, superseded, etc.)");

  // Summary
  logInfo("\n" + "=".repeat(80));
  logInfo("SUMMARY");
  logInfo("=".repeat(80));
  logInfo(`Total canceled issues: ${issues.length}`);
  logInfo(`Should reopen: ${analysis.shouldReopen.length}`);
  logInfo(
    `  - High priority: ${analysis.shouldReopen.filter((a) => a.priority === "high").length}`,
  );
  logInfo(
    `  - Medium priority: ${analysis.shouldReopen.filter((a) => a.priority === "medium").length}`,
  );
  logInfo(`Needs review: ${analysis.needsReview.length}`);
  logInfo(`Correctly canceled: ${analysis.correctlyCanceled.length}`);
  logInfo("");

  // Return structured data
  return analysis;
}
