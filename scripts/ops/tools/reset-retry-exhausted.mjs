#!/usr/bin/env node

/**
 * reset-retry-exhausted.mjs — Reset retry_exhausted state for blocked issues
 *
 * Usage:
 *   node scripts/ops/tools/reset-retry-exhausted.mjs --dry-run
 *   node scripts/ops/tools/reset-retry-exhausted.mjs [--all] [--id ANQ-1234]
 */

import { listIssuesByState } from "../integrations/linear/linear-client.mjs";
import { getIssueState, resetRetryState } from "../core/symphony-state.mjs";
import { createLogger } from "../lib/logger.mjs";

const { logInfo, logWarn, logError } = createLogger();

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const resetAll = args.has("--all");
  const specificId = process.argv.find((arg) => arg.startsWith("--id="))?.split("=")[1];

  if (!resetAll && !specificId && !dryRun) {
    logError("Usage: reset-retry-exhausted.mjs --dry-run | --all | --id=ANQ-XXXX");
    logError("");
    logError("  --dry-run     Show what would be reset without making changes");
    logError("  --all         Reset ALL retry_exhausted issues in Backlog");
    logError("  --id=ANQ-XXX  Reset specific issue by identifier");
    process.exit(2);
  }

  logInfo(`[reset-retry-exhausted]${dryRun ? " (DRY RUN)" : ""} Starting...\\n`);

  let issuesToReset = [];

  if (specificId) {
    // Reset specific issue
    const state = getIssueState(specificId);
    if (state.retry_exhausted) {
      issuesToReset.push({
        identifier: specificId,
        state,
      });
    } else {
      logWarn(`Issue ${specificId} is not marked as retry_exhausted`);
      process.exit(0);
    }
  } else {
    // Get all Backlog issues
    const backlogIssues = await listIssuesByState(["Backlog"]);
    logInfo(`Found ${backlogIssues.length} issues in Backlog`);

    for (const issue of backlogIssues) {
      const state = getIssueState(issue.identifier);
      if (state.retry_exhausted) {
        issuesToReset.push({
          identifier: issue.identifier,
          title: issue.title,
          blocked_reason: state.blocked_reason,
          state,
        });
      }
    }
  }

  if (issuesToReset.length === 0) {
    logInfo("No retry_exhausted issues found");
    process.exit(0);
  }

  logInfo(`Found ${issuesToReset.length} retry_exhausted issues:\\n`);

  for (const { identifier, title, blocked_reason } of issuesToReset) {
    logInfo(`  ${identifier}: ${blocked_reason || "retry_exhausted"}`);
    if (title) logInfo(`    ${title.slice(0, 80)}`);
  }

  if (dryRun) {
    logInfo(`\\n[DRY RUN] Would reset ${issuesToReset.length} issues`);
    process.exit(0);
  }

  logInfo(`\\nResetting ${issuesToReset.length} issues...`);

  let resetCount = 0;
  for (const { identifier } of issuesToReset) {
    resetRetryState(identifier, { retry_count: 0 });
    // Also import and use clearCooldown to ensure issues can be picked up immediately
    const { clearCooldown } = await import("../core/symphony-state.mjs");
    clearCooldown(identifier);
    resetCount++;
    logInfo(`  ✅ Reset ${identifier}`);
  }

  logInfo(`\\n✅ Successfully reset ${resetCount} issues`);
  logInfo("\\nThese issues can now be fed from Backlog → Todo");
}

await main();
