// Generated from ../../../../scripts/ops/integrations/linear/github-linear-sync-audit.mjs:130

import { listIssuesByState } from "../linear-client.mjs";

import { closeGitHubIssue } from "./close-git-hub-issue.mjs";
import { extractLinearIdentifier } from "./extract-linear-identifier.mjs";
import { fetchGitHubIssues } from "./fetch-git-hub-issues.mjs";
import { logInfo, logError, logWarn, logDebug } from "./logger.mjs";

export async function auditSync(closeOrphans = false) {
  logInfo("[github-linear-sync-audit] Starting audit\n");

  // Fetch GitHub issues
  logInfo("📥 Fetching GitHub issues...");
  const githubIssues = await fetchGitHubIssues("open");
  logInfo(`Found ${githubIssues.length} open GitHub issues\n`);

  // Fetch Linear issues (all states)
  logInfo("📥 Fetching Linear issues...");
  const allStates = [
    "Backlog",
    "Todo",
    "In Progress",
    "In Review",
    "Blocked",
    "Human Review",
    "Done",
    "Canceled",
  ];
  const linearIssues = await listIssuesByState(allStates);
  logInfo(`Found ${linearIssues.length} Linear issues (all states)\n`);

  // Build Linear identifier map
  const linearIdentifiers = new Set(linearIssues.map((i) => i.identifier));
  logDebug(`Linear identifiers: ${Array.from(linearIdentifiers).slice(0, 10).join(", ")}...\n`);

  // Analyze GitHub issues
  const orphanedIssues = [];
  const linkedIssues = [];
  const ambiguousIssues = [];

  for (const ghIssue of githubIssues) {
    const linkedIds = extractLinearIdentifier(ghIssue);

    if (linkedIds.length === 0) {
      // No Linear reference found
      orphanedIssues.push({
        number: ghIssue.number,
        title: ghIssue.title,
        url: ghIssue.html_url,
        created_at: ghIssue.created_at,
        updated_at: ghIssue.updated_at,
        reason: "No Linear identifier found",
      });
    } else if (linkedIds.length === 1) {
      const linkedId = linkedIds[0];
      const existsInLinear = linearIdentifiers.has(linkedId);

      if (existsInLinear) {
        linkedIssues.push({
          number: ghIssue.number,
          title: ghIssue.title,
          linearId: linkedId,
        });
      } else {
        orphanedIssues.push({
          number: ghIssue.number,
          title: ghIssue.title,
          url: ghIssue.html_url,
          created_at: ghIssue.created_at,
          updated_at: ghIssue.updated_at,
          reason: `Linear issue ${linkedId} not found (deleted or canceled)`,
          linkedId,
        });
      }
    } else {
      // Multiple Linear IDs found
      const activeIds = linkedIds.filter((id) => linearIdentifiers.has(id));

      if (activeIds.length === 0) {
        orphanedIssues.push({
          number: ghIssue.number,
          title: ghIssue.title,
          url: ghIssue.html_url,
          created_at: ghIssue.created_at,
          updated_at: ghIssue.updated_at,
          reason: `Multiple Linear IDs found but none active: ${linkedIds.join(", ")}`,
          linkedIds,
        });
      } else {
        ambiguousIssues.push({
          number: ghIssue.number,
          title: ghIssue.title,
          linkedIds,
          activeIds,
        });
      }
    }
  }

  // Report findings
  logInfo("=".repeat(80));
  logInfo("AUDIT RESULTS");
  logInfo("=".repeat(80) + "\n");

  logInfo(`✅ Linked issues: ${linkedIssues.length}`);
  logInfo(`❌ Orphaned issues: ${orphanedIssues.length}`);
  logInfo(`⚠️  Ambiguous issues: ${ambiguousIssues.length}\n`);

  if (orphanedIssues.length > 0) {
    logWarn("=".repeat(80));
    logWarn("ORPHANED GITHUB ISSUES (not linked to active Linear issues)");
    logWarn("=".repeat(80) + "\n");

    for (const issue of orphanedIssues) {
      logWarn(`#${issue.number}: ${issue.title}`);
      logWarn(`  URL: ${issue.url}`);
      logWarn(`  Reason: ${issue.reason}`);
      logWarn(`  Created: ${issue.created_at}`);
      logWarn(`  Updated: ${issue.updated_at}\n`);
    }
  }

  if (ambiguousIssues.length > 0) {
    logInfo("=".repeat(80));
    logInfo("AMBIGUOUS GITHUB ISSUES (multiple Linear references)");
    logInfo("=".repeat(80) + "\n");

    for (const issue of ambiguousIssues) {
      logInfo(`#${issue.number}: ${issue.title}`);
      logInfo(`  Linked IDs: ${issue.linkedIds.join(", ")}`);
      logInfo(`  Active IDs: ${issue.activeIds.join(", ")}\n`);
    }
  }

  if (closeOrphans && orphanedIssues.length > 0) {
    logWarn(`\n🔒 Closing ${orphanedIssues.length} orphaned issues...\n`);

    let closedCount = 0;
    let failedCount = 0;
    const batchSize = 10;

    for (let i = 0; i < orphanedIssues.length; i += batchSize) {
      const batch = orphanedIssues.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((issue) => closeGitHubIssue(issue.number, issue.reason)),
      );

      for (let j = 0; j < results.length; j++) {
        const issue = batch[j];
        if (results[j].status === "fulfilled") {
          closedCount++;
          if (closedCount % 50 === 0) {
            logInfo(`Progress: ${closedCount}/${orphanedIssues.length} closed`);
          }
        } else {
          failedCount++;
          logError(`❌ Failed to close #${issue.number}: ${results[j].reason.message}`);
        }
      }

      // Rate limit: wait 500ms between batches
      if (i + batchSize < orphanedIssues.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    logInfo(`\n📊 Closed ${closedCount} issues, ${failedCount} failed\n`);
  }

  // Summary
  logInfo("=".repeat(80));
  logInfo("SUMMARY");
  logInfo("=".repeat(80));
  logInfo(`Total GitHub issues: ${githubIssues.length}`);
  logInfo(
    `Properly linked: ${linkedIssues.length} (${((linkedIssues.length / githubIssues.length) * 100).toFixed(1)}%)`,
  );
  logInfo(
    `Orphaned: ${orphanedIssues.length} (${((orphanedIssues.length / githubIssues.length) * 100).toFixed(1)}%)`,
  );
  logInfo(
    `Ambiguous: ${ambiguousIssues.length} (${((ambiguousIssues.length / githubIssues.length) * 100).toFixed(1)}%)`,
  );

  return {
    total: githubIssues.length,
    linked: linkedIssues,
    orphaned: orphanedIssues,
    ambiguous: ambiguousIssues,
  };
}
