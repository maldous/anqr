import { listIssuesByState } from "../linear-client.mjs";

import { ACTION_DELAY_MS } from "./action-delay-ms.mjs";
import { ANALYSIS_DELAY_MS } from "./analysis-delay-ms.mjs";
import { analyzeIssue } from "./analyze-issue.mjs";
import { applyHygiene } from "./apply-hygiene.mjs";
import { parseArgs } from "./parse-args.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export async function main() {
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
