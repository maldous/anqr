#!/usr/bin/env node

/**
 * issue-hygiene.mjs — Automated issue hygiene for ANQR harness
 *
 * Responsibilities:
 *   - Identify issues with excessive failure comments
 *   - Archive comment history by consolidating into issue description
 *   - Flag systemic failure patterns for human review
 *   - Clean up outdated metadata
 *
 * Usage:
 *   LINEAR_API_KEY=... node scripts/ops/integrations/linear/issue-hygiene.mjs
 *   LINEAR_API_KEY=... node scripts/ops/integrations/linear/issue-hygiene.mjs --dry-run
 *   LINEAR_API_KEY=... node scripts/ops/integrations/linear/issue-hygiene.mjs --threshold=10
 */

import { listIssuesByState, getIssueDetail, updateIssue, addComment } from "./linear-client.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logWarn, logError, logDebug } = createLogger();

// Default threshold for excessive comments
const DEFAULT_COMMENT_THRESHOLD = 15;
const SYSTEMIC_FAILURE_THRESHOLD = 10; // If same failure appears 10+ times, flag as systemic
const MAX_DESCRIPTION_LENGTH = 50000; // Linear's limit, be conservative
const ANALYSIS_DELAY_MS = 100;
const ACTION_DELAY_MS = 200;

// Pattern matchers for comment analysis
const FAILURE_PATTERNS = {
  stillFailing: /\*\*Still failing\*\*/i,
  stale: /⏰.*Stale execution/i,
  harnessFail: /Harness.*failure/i,
  guardian: /Auto-created by linear-guardian/i,
};

function parseArgs() {
  const dryRun = process.argv.includes("--dry-run");
  const thresholdArg = process.argv.find((arg) => arg.startsWith("--threshold="));
  const threshold = thresholdArg
    ? Number.parseInt(thresholdArg.split("=")[1], 10)
    : DEFAULT_COMMENT_THRESHOLD;

  return { dryRun, threshold };
}

/**
 * Analyze comments to identify patterns
 */
function analyzeComments(comments) {
  const patterns = {
    failureCount: 0,
    staleCount: 0,
    uniqueFailures: new Set(),
    firstComment: null,
    lastComment: null,
    timestamps: [],
  };

  if (!comments || comments.length === 0) return patterns;

  patterns.firstComment = comments[0];
  patterns.lastComment = comments[comments.length - 1];

  for (const comment of comments) {
    patterns.timestamps.push(comment.createdAt);

    if (FAILURE_PATTERNS.stillFailing.test(comment.body)) {
      patterns.failureCount++;
      // Extract failure signature from code blocks
      const codeMatch = comment.body.match(/```\n([\s\S]*?)\n```/);
      if (codeMatch) {
        // Use first 100 chars as signature
        const signature = codeMatch[1].substring(0, 100).trim();
        patterns.uniqueFailures.add(signature);
      }
    }

    if (FAILURE_PATTERNS.stale.test(comment.body)) {
      patterns.staleCount++;
    }
  }

  return patterns;
}

/**
 * Build consolidated failure summary
 */
function buildFailureSummary(issue, comments, analysis) {
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

/**
 * Check if issue needs hygiene intervention
 */
async function analyzeIssue(issue, threshold) {
  const detail = await getIssueDetail(issue.id);

  if (!detail || !detail.comments) {
    return null;
  }

  const commentCount = detail.comments.nodes.length;

  if (commentCount < threshold) {
    return null;
  }

  const analysis = analyzeComments(detail.comments.nodes);

  // Only intervene if there are actual failure comments
  if (analysis.failureCount === 0) {
    return null;
  }

  const isSystemic = analysis.uniqueFailures.size >= SYSTEMIC_FAILURE_THRESHOLD;

  return {
    issue,
    detail,
    commentCount,
    analysis,
    isSystemic,
    recommendation: isSystemic
      ? "FLAG_FOR_HUMAN_REVIEW"
      : commentCount > threshold * 2
        ? "ARCHIVE_AND_CONSOLIDATE"
        : "ARCHIVE_ONLY",
  };
}

/**
 * Apply hygiene action to an issue
 */
async function applyHygiene(result, dryRun) {
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

/**
 * Main execution
 */
async function main() {
  const { dryRun, threshold } = parseArgs();

  logInfo(`[issue-hygiene]${dryRun ? " (DRY RUN)" : ""} Starting...`);
  logInfo(`[issue-hygiene] Comment threshold: ${threshold}\n`);

  // Analyze open issues (excluding Done and Canceled)
  const openStates = ["Backlog", "Todo", "In Progress", "In Review", "Blocked", "Human Review"];
  const issues = await listIssuesByState(openStates);

  logInfo(`[issue-hygiene] Analyzing ${issues.length} open issues\n`);

  const results = {
    analyzed: 0,
    needsHygiene: [],
    systemic: [],
    archived: [],
  };

  for (const issue of issues) {
    results.analyzed++;

    if (results.analyzed % 10 === 0) {
      logDebug(`[issue-hygiene] Analyzed ${results.analyzed}/${issues.length} issues...`);
    }

    try {
      const result = await analyzeIssue(issue, threshold);

      if (result) {
        results.needsHygiene.push(result);
        if (result.isSystemic) {
          results.systemic.push(result);
        }
      }

      // Rate limit: small delay between API calls
      await new Promise((resolve) => setTimeout(resolve, ANALYSIS_DELAY_MS));
    } catch (error) {
      logError(`Failed to analyze ${issue.identifier}: ${error.message}`);
    }
  }

  // Print findings
  logInfo("\n" + "=".repeat(80));
  logInfo("HYGIENE ANALYSIS RESULTS");
  logInfo("=".repeat(80) + "\n");

  if (results.needsHygiene.length === 0) {
    logInfo("✅ No issues require hygiene intervention\n");
    return;
  }

  logInfo(`Found ${results.needsHygiene.length} issues requiring hygiene:\n`);

  if (results.systemic.length > 0) {
    logWarn(`⚠️  SYSTEMIC FAILURES (${results.systemic.length} issues):`);
    logWarn("-".repeat(80));
    for (const result of results.systemic) {
      logWarn(`\n${result.issue.identifier}: ${result.issue.title}`);
      logWarn(`  Comments: ${result.commentCount}`);
      logWarn(`  Failures: ${result.analysis.failureCount}`);
      logWarn(`  Unique failure signatures: ${result.analysis.uniqueFailures.size}`);
      logWarn(`  State: ${result.issue.state.name}`);
    }
    logWarn("");
  }

  const archiveOnly = results.needsHygiene.filter((r) => !r.isSystemic);
  if (archiveOnly.length > 0) {
    logInfo(`\n📋 ARCHIVE CANDIDATES (${archiveOnly.length} issues):`);
    logInfo("-".repeat(80));
    for (const result of archiveOnly) {
      logInfo(`\n${result.issue.identifier}: ${result.issue.title}`);
      logInfo(`  Comments: ${result.commentCount}`);
      logInfo(`  Failures: ${result.analysis.failureCount}`);
      logInfo(`  State: ${result.issue.state.name}`);
    }
  }

  // Apply hygiene actions
  logInfo("\n" + "=".repeat(80));
  logInfo(dryRun ? "HYGIENE ACTIONS (DRY RUN)" : "APPLYING HYGIENE ACTIONS");
  logInfo("=".repeat(80) + "\n");

  for (const result of results.needsHygiene) {
    try {
      await applyHygiene(result, dryRun);
      if (!dryRun) {
        results.archived.push(result);
      }
      // Rate limit
      await new Promise((resolve) => setTimeout(resolve, ACTION_DELAY_MS));
    } catch (error) {
      logError(`Failed to apply hygiene to ${result.issue.identifier}: ${error.message}`);
    }
  }

  // Summary
  logInfo("\n" + "=".repeat(80));
  logInfo("SUMMARY");
  logInfo("=".repeat(80));
  logInfo(`Total issues analyzed: ${results.analyzed}`);
  logInfo(`Issues needing hygiene: ${results.needsHygiene.length}`);
  logInfo(`Systemic failures flagged: ${results.systemic.length}`);
  if (!dryRun) {
    logInfo(`Issues archived: ${results.archived.length}`);
  }
  logInfo("");
}

await main();
