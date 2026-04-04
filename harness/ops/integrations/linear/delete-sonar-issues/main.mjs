// Generated from ../../../../scripts/ops/integrations/linear/delete-sonar-issues.mjs:27

import { listIssuesByState } from "../linear-client.mjs";

import { deleteIssue } from "./delete-issue.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function main() {
  logInfo("[delete-sonar-issues] Fetching all issues...\n");

  // Fetch all issues (open and closed)
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
  const allIssues = await listIssuesByState(allStates);

  // Filter for [Sonar] issues
  const sonarIssues = allIssues.filter((issue) => issue.title.includes("[Sonar]"));

  logInfo(`[delete-sonar-issues] Found ${sonarIssues.length} issues with "[Sonar]" in the title\n`);

  if (sonarIssues.length === 0) {
    logInfo("[delete-sonar-issues] No Sonar issues to delete. Exiting.\n");
    return;
  }

  // Display issues to be deleted
  logInfo(`\n${"=".repeat(80)}`);
  logInfo(`ISSUES TO BE DELETED (${sonarIssues.length} total)`);
  logInfo("=".repeat(80));

  for (const issue of sonarIssues) {
    const labels = (issue.labels?.nodes || []).map((l) => l.name).join(", ");
    const state = issue.state.name;

    logInfo(`\n${issue.identifier}: ${issue.title}`);
    logInfo(`  State: ${state} | Labels: ${labels || "none"}`);
    logInfo(`  Created: ${issue.createdAt.split("T")[0]}`);
  }

  logInfo("\n");
  logWarn(
    `[delete-sonar-issues] About to delete ${sonarIssues.length} issues. Starting deletion...\n`,
  );

  // Delete each issue
  let deleted = 0;
  let failed = 0;

  for (const issue of sonarIssues) {
    try {
      await deleteIssue(issue.id);
      deleted++;
      logInfo(`✓ Deleted ${issue.identifier}: ${issue.title}`);
    } catch (error) {
      failed++;
      logError(`✗ Failed to delete ${issue.identifier}: ${error.message}`);
    }
  }

  logInfo(`\n${"=".repeat(80)}`);
  logInfo(`DELETION COMPLETE`);
  logInfo("=".repeat(80));
  logInfo(`  Deleted: ${deleted}`);
  logInfo(`  Failed: ${failed}`);
  logInfo(`  Total: ${sonarIssues.length}`);
  logInfo("\n");
}
