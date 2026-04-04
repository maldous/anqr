// Generated from ../../../scripts/ops/tools/recover-stale-in-progress.mjs:38

import { getQueueSnapshot } from "../../symphony-queue-control.mjs";
import {
  getIssueState,
  releaseLease,
  recordTransition,
  canExecuteIssue,
  STALE_THRESHOLD_MS,
  TASK_TIMEOUT_MS,
  RECOVERY_GRACE_MS,
  leaseIsActive,
} from "../../core/symphony-state.mjs";
import { updateIssue, addComment } from "../../integrations/linear/linear-client.mjs";

import { issueAge } from "./issue-age.mjs";
import { minutesAgo } from "./minutes-ago.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const force = args.has("--force");

  logInfo(`[recover-stale-in-progress]${dryRun ? " (DRY RUN)" : ""} Starting...\n`);

  // Get current queue snapshot
  const snap = await getQueueSnapshot();
  const activeIssues = snap.inProgress.all;

  if (activeIssues.length === 0) {
    logInfo("No active issues detected");
    process.exit(0);
  }

  logInfo(`Found ${activeIssues.length} active issues:\n`);

  let issuesToRecover = [];
  let issuesToSkip = [];

  for (const issue of activeIssues) {
    const ageMs = issueAge(issue, "updatedAt");
    const state = getIssueState(issue.identifier);
    const hasActiveLease = leaseIsActive(state);
    const recentHeartbeat =
      state.lease?.heartbeat_at &&
      Date.now() - new Date(state.lease.heartbeat_at).getTime() < RECOVERY_GRACE_MS;

    const isStale = ageMs > TASK_TIMEOUT_MS;
    const isOld = ageMs > STALE_THRESHOLD_MS;

    logInfo(`  ${issue.identifier}: ${issue.title}`);
    logInfo(`    Age: ${minutesAgo(issue, "updatedAt")} minutes`);
    logInfo(`    State: In Progress`);
    logInfo(`    Lease active: ${hasActiveLease}`);
    logInfo(`    Recent heartbeat: ${recentHeartbeat}`);
    logInfo(`    Stale (>${TASK_TIMEOUT_MS / 60000}min): ${isStale}`);
    logInfo(`    Old (>${STALE_THRESHOLD_MS / 60000}min): ${isOld}`);

    // Skip issues with active leases or recent heartbeats
    if (hasActiveLease || recentHeartbeat) {
      issuesToSkip.push({
        identifier: issue.identifier,
        reason: hasActiveLease ? "active_lease" : "recent_heartbeat",
      });
      logInfo(`    ✓ Skipping (${issuesToSkip[issuesToSkip.length - 1].reason})\n`);
      continue;
    }

    // Skip if issue is not executable (human_only, retry_exhausted, etc.)
    if (!canExecuteIssue(issue)) {
      issuesToSkip.push({
        identifier: issue.identifier,
        reason: "not_executable",
      });
      logInfo(`    ✗ Skipping (not executable - human_only/retry_exhausted/blocked)\n`);
      continue;
    }

    // Recover stale issues
    if (isStale) {
      issuesToRecover.push({
        identifier: issue.identifier,
        title: issue.title,
        ageMs,
        isOld,
      });
      logInfo(`    🔄 Marked for recovery\n`);
    } else {
      issuesToSkip.push({
        identifier: issue.identifier,
        reason: "not_stale",
      });
      logInfo(`    ✓ Skipping (not stale enough)\n`);
    }
  }

  if (issuesToRecover.length === 0) {
    logInfo("\nNo stale In Progress issues found that need recovery");
    process.exit(0);
  }

  logInfo(`\nFound ${issuesToRecover.length} issues to recover:\n`);
  for (const issue of issuesToRecover) {
    logInfo(`  ${issue.identifier}: ${issue.title}`);
    logInfo(
      `    Age: ${minutesAgo({ updatedAt: new Date(Date.now() - issue.ageMs).toISOString() }, "updatedAt")} minutes`,
    );
    logInfo(`    Old (>${STALE_THRESHOLD_MS / 60000}min): ${issue.isOld}\n`);
  }

  if (dryRun) {
    logInfo(`\n[DRY RUN] Would recover ${issuesToRecover.length} issues`);
    process.exit(0);
  }

  if (!force) {
    logWarn("\n⚠️  Use --force to actually recover these issues");
    process.exit(1);
  }

  logInfo(`\nRecovering ${issuesToRecover.length} issues...`);

  let recoveredCount = 0;
  for (const identifier of issuesToRecover) {
    try {
      // Release any existing lease first
      releaseLease(identifier);

      // Update issue state to Todo
      await updateIssue(identifier, { stateId: "Todo" });

      // Add recovery comment
      await addComment(
        identifier,
        `⏰ **Recovered from stale execution** — no active lease and no update for ${minutesAgo({ updatedAt: new Date(Date.now() - issueAge({ updatedAt: new Date().toISOString() }, "updatedAt")).getTime() }, "updatedAt")} minutes. Returned to Todo.`,
      );

      // Record transition
      recordTransition(identifier, {
        actor: "recovery-tool",
        reason: "stale_recovery",
        from: "In Progress",
        to: "Todo",
      });

      recoveredCount++;
      logInfo(`  ✅ Recovered ${identifier}`);
    } catch (error) {
      logError(`  ❌ Failed to recover ${identifier}: ${error.message}`);
    }
  }

  logInfo(`\n✅ Successfully recovered ${recoveredCount} issues`);
  logInfo("\nThese issues can now be picked up by runners again");
}
