#!/usr/bin/env node

/**
 * reopen-marked-issues.mjs — Reopen canceled Linear issues marked for reopening
 *
 * Reopens issues that contain:
 * - REOPENED: marker (high priority)
 * - RE-EVALUATE: marker (medium priority)
 *
 * Usage:
 *   LINEAR_API_KEY=... node scripts/ops/integrations/linear/reopen-marked-issues.mjs
 *   LINEAR_API_KEY=... node scripts/ops/integrations/linear/reopen-marked-issues.mjs --dry-run
 */

import { listIssuesByState, updateIssue, addComment, STATES } from "./linear-client.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logWarn, logError } = createLogger();

const REOPEN_PATTERNS = {
  REOPENED: /REOPENED:/i,
  RE_EVALUATE: /RE-EVALUATE:/i,
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  logInfo(`[reopen-marked-issues]${dryRun ? " (DRY RUN)" : ""} Starting...\n`);

  const issues = await listIssuesByState(["Canceled"]);

  logInfo(`[reopen-marked-issues] Found ${issues.length} canceled issues\n`);

  const toReopen = [];

  for (const issue of issues) {
    const description = issue.description || "";
    const title = issue.title || "";
    const combined = `${title} ${description}`;

    let priority = null;
    let reason = null;

    if (REOPEN_PATTERNS.REOPENED.test(combined)) {
      priority = "high";
      reason = "Contains REOPENED marker";
      toReopen.push({ issue, priority, reason });
    } else if (REOPEN_PATTERNS.RE_EVALUATE.test(combined)) {
      priority = "medium";
      reason = "Contains RE-EVALUATE marker";
      toReopen.push({ issue, priority, reason });
    }
  }

  if (toReopen.length === 0) {
    logInfo("[reopen-marked-issues] No issues found to reopen\n");
    return;
  }

  logWarn(`\n[reopen-marked-issues] Found ${toReopen.length} issues to reopen:\n`);

  const highPriority = toReopen.filter((i) => i.priority === "high");
  const mediumPriority = toReopen.filter((i) => i.priority === "medium");

  if (highPriority.length > 0) {
    logWarn("\nHIGH PRIORITY:");
    for (const { issue, reason } of highPriority) {
      logWarn(`  ${issue.identifier}: ${issue.title}`);
      logWarn(`    Reason: ${reason}\n`);
    }
  }

  if (mediumPriority.length > 0) {
    logWarn("\nMEDIUM PRIORITY:");
    for (const { issue, reason } of mediumPriority) {
      logWarn(`  ${issue.identifier}: ${issue.title}`);
      logWarn(`    Reason: ${reason}\n`);
    }
  }

  if (dryRun) {
    logInfo("\n[DRY RUN] Would reopen these issues and move to Backlog state\n");
    return;
  }

  logInfo(`\n[reopen-marked-issues] Reopening ${toReopen.length} issues...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const { issue, reason } of toReopen) {
    try {
      // Move to Backlog state
      await updateIssue(issue.id, {
        stateId: STATES.backlog,
      });

      // Add comment explaining the reopening
      await addComment(
        issue.id,
        `🔄 **Issue reopened for reevaluation**\n\nReason: ${reason}\n\n⚠️ **Legacy Issue Notice**: This is a possibly legacy issue that needs to be reevaluated against current architecture, practice requirements, and the 1.0 Foundation principles.\n\n**What "legacy issue reevaluation" means:**\n- The issue may have been resolved by subsequent changes\n- It may have been incorrectly classified or diagnosed\n- The underlying problem may no longer exist in the current codebase\n- The proposed solution may conflict with current architecture\n- The issue may be out of scope for 1.0 launch claim\n\n**Required actions before proceeding:**\n1. **Verify the issue still exists** — Check if the problem is reproducible in the current codebase\n2. **Review against current architecture** — Ensure any proposed solution aligns with dependency rules and package boundaries\n3. **Check 1.0 scope** — Confirm the issue applies to claimed launch surfaces (apps/web, netlify/*)\n4. **Update or close** — If no longer relevant, close with explanation. If still valid, update description with current context.\n\nDo not proceed with implementation until reevaluation is complete.`,
      );

      logInfo(`✅ Reopened ${issue.identifier}: ${issue.title}`);
      successCount++;

      // Rate limit: small delay between updates
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      logError(`❌ Failed to reopen ${issue.identifier}: ${error.message}`);
      failCount++;
    }
  }

  logInfo(`\n[reopen-marked-issues] Complete: ${successCount} reopened, ${failCount} failed\n`);
}

await main();
