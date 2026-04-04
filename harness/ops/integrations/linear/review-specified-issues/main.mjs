import { updateIssue, addComment, STATES, listIssuesByState } from "../linear-client.mjs";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

import { COMPLETION_CHECKS } from "./completion-checks.mjs";
import { ISSUES_TO_REVIEW } from "./issues-to-review.mjs";
import { ROOT } from "./root.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  logInfo("[review-specified-issues] Starting issue review...\n");

  // Fetch all issues (all states to find them wherever they are)
  const allStates = [
    "Backlog",
    "Todo",
    "In Progress",
    "In Review",
    "Done",
    "Canceled",
    "Blocked",
    "Human Review",
  ];
  const allIssues = await listIssuesByState(allStates);

  const issueMap = new Map();
  for (const issue of allIssues) {
    issueMap.set(issue.identifier, issue);
  }

  const updates = [];

  for (const identifier of ISSUES_TO_REVIEW) {
    const issue = issueMap.get(identifier);
    const check = COMPLETION_CHECKS[identifier];

    if (!issue) {
      logInfo(`${identifier}: NOT FOUND in Linear`);
      continue;
    }

    logInfo(`\n${"=".repeat(80)}`);
    logInfo(`${identifier}: ${issue.title}`);
    logInfo(`Current State: ${issue.state.name}`);
    logInfo(`Priority: P${issue.priority || "?"}`);

    // Check evidence file if specified
    if (check.evidenceFile) {
      const evidencePath = resolve(ROOT, check.evidenceFile);
      const evidenceExists = existsSync(evidencePath);
      logInfo(`Evidence File: ${check.evidenceFile} ${evidenceExists ? "✅" : "❌"}`);
    }

    logInfo(`Assessment: ${check.status}`);
    logInfo(`Reason: ${check.reason}`);
    logInfo(`Action: ${check.action}`);

    // Determine what to do
    let shouldUpdate = false;
    let newState = null;
    let commentText = check.comment;

    if (check.action === "MARK_DONE" && issue.state.name !== "Done") {
      shouldUpdate = true;
      newState = STATES.done;
    } else if (check.action === "REOPEN_TO_BACKLOG" && issue.state.name !== "Backlog") {
      shouldUpdate = true;
      newState = STATES.backlog;
    } else if (check.action === "CHECK_IMPLEMENTATION") {
      // Check if already in a terminal state
      if (issue.state.name === "Done" || issue.state.name === "Canceled") {
        logInfo(`Already in terminal state (${issue.state.name}) - no action needed`);
      } else {
        logInfo(`⚠️  No evidence found - needs manual review. Moving to Backlog.`);
        shouldUpdate = true;
        newState = STATES.backlog;
        commentText = `📋 **Issue Review 2026-03-30**

No completion evidence found in repository. This issue requires manual review to determine:

1. Has the work been completed but not documented?
2. Does this issue need to be worked on?
3. Should this issue be closed or combined with another?

**Status:** Moving to Backlog for manual review and completion.`;
      }
    }

    if (shouldUpdate && newState && commentText) {
      updates.push({
        identifier,
        issueId: issue.id,
        currentState: issue.state.name,
        newState: newState === STATES.done ? "Done" : "Backlog",
        commentText,
      });
    } else if (issue.state.name === "Done" || issue.state.name === "Canceled") {
      logInfo(`✅ Already in terminal state - no update needed`);
    } else {
      logInfo(`ℹ️  No update needed (already in correct state or action unclear)`);
    }
  }

  // Summary
  logInfo(`\n${"=".repeat(80)}`);
  logInfo(`SUMMARY: ${updates.length} issue(s) to update\n`);

  if (updates.length === 0) {
    logInfo("No updates needed. All issues are in correct state.");
    return;
  }

  // Show what will be updated
  for (const update of updates) {
    logInfo(`${update.identifier}: ${update.currentState} → ${update.newState}`);
  }

  // Execute updates
  logInfo(`\n${"=".repeat(80)}`);
  logInfo("Executing updates...\n");

  for (const update of updates) {
    try {
      // Add comment first
      logInfo(`${update.identifier}: Adding comment...`);
      await addComment(update.issueId, update.commentText);

      // Update state
      logInfo(`${update.identifier}: Updating state to ${update.newState}...`);
      const stateId = update.newState === "Done" ? STATES.done : STATES.backlog;
      await updateIssue(update.issueId, { stateId });

      logInfo(`${update.identifier}: ✅ Updated successfully\n`);
    } catch (error) {
      logError(`${update.identifier}: ❌ Update failed: ${error.message}\n`);
    }
  }

  logInfo("✅ Review complete");
}
