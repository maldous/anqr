import { execFileSync } from "node:child_process";
import { isDiscordWorktree, isSymphonyWorktree } from "../../core/worktree-config.mjs";
import { getNextRepairableIssueForWorktree, getWorktreeState } from "../../symphony-state.mjs";
import { feedQueue, getQueueSnapshot } from "../../symphony-queue-control.mjs";
import { TARGET_MIN } from "../../symphony-config.mjs";

import { ROOT } from "./root.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { acquireLock } from "./acquire-lock.mjs";
import { executeIssue } from "./execute-issue.mjs";
import { getWorkingTreeStatus } from "./get-working-tree-status.mjs";
import { logWorkingTreeEntries } from "./log-working-tree-entries.mjs";
import { maybeRunPreflights } from "./maybe-run-preflights.mjs";
import { releaseLock } from "./release-lock.mjs";
import { showStatus } from "./show-status.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export async function main() {
  const args = new Map();
  // Parse arguments with values (e.g., --issue ISSUE-123)
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === "--dry-run") args.set("dryRun", true);
    else if (arg === "--once") args.set("once", true);
    else if (arg === "--status") args.set("status", true);
    else if (arg === "--issue" && i + 1 < process.argv.length) {
      args.set("issue", process.argv[i + 1]);
      i++; // Skip next arg (the value)
    }
  }
  const dryRun = args.get("dryRun");
  const doOnce = args.get("once");
  const doStatus = args.get("status");
  const targetIssue = args.get("issue");
  if (doStatus) {
    showStatus();
    process.exit(0);
  }
  if (!doOnce && !targetIssue) {
    logError("Usage: symphony-runner.mjs --once [--dry-run] [--issue IDENTIFIER] | --status");
    process.exit(2);
  }
  // Allow --issue without --once for webhook-triggered execution
  if (!doOnce && targetIssue) {
    // Running in trigger mode - one-shot execution of specific issue
  }
  logInfo(`[runner]${dryRun ? " (DRY RUN)" : ""} starting at ${new Date().toISOString()}`);
  logInfo(`[runner] Worktree: ${WORKTREE_ID}, Root: ${ROOT}`);

  // Debug: Verify directory variables
  logDebug(`[worktree-verify] ========== WORKTREE DIRECTORY VERIFICATION ==========`);
  logDebug(`[worktree-verify] process.cwd(): ${process.cwd()}`);
  logDebug(`[worktree-verify] ROOT: ${ROOT}`);
  logDebug(`[worktree-verify] WORKTREE_ID: ${WORKTREE_ID}`);
  logDebug(`[worktree-verify] ROOT === process.cwd(): ${ROOT === process.cwd()}`);

  // Inline test: Verify they're different for worktrees
  if (WORKTREE_ID !== "main" && ROOT === process.cwd()) {
    logWarn(
      `[worktree-verify] ⚠️ WARNING: ROOT equals process.cwd() - worktree separation may not be working!`,
    );
  } else if (WORKTREE_ID !== "main") {
    logDebug(`[worktree-verify] ✓ ROOT differs from process.cwd() - worktree separation active`);
  }

  // Test: Verify working directory
  try {
    const gitTopLevel = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();
    logDebug(`[worktree-verify] Git top-level directory: ${gitTopLevel}`);
    logDebug(`[worktree-verify] gitTopLevel === ROOT: ${gitTopLevel === ROOT}`);
  } catch (err) {
    logError(`[worktree-verify] Failed to get git top-level: ${err.message}`);
  }

  // Test: List actual worktrees
  try {
    const worktreeList = execFileSync("git", ["worktree", "list", "--porcelain"], {
      cwd: ROOT,
      encoding: "utf-8",
    });
    logDebug(`[worktree-verify] Git worktree list:\n${worktreeList}`);
  } catch (err) {
    logError(`[worktree-verify] Failed to list worktrees: ${err.message}`);
  }
  logDebug(`[worktree-verify] ====================================================`);

  // Log worktree routing configuration
  if (isDiscordWorktree(WORKTREE_ID)) {
    logInfo(`[runner] 🎮 Discord worktree mode: handling ONLY Discord-sourced issues`);
  } else if (isSymphonyWorktree(WORKTREE_ID)) {
    logInfo(`[runner] 🎼 Symphony worktree mode: handling non-Discord issues`);
  } else {
    logWarn(`[runner] ⚠️ Unknown worktree type: ${WORKTREE_ID} - will handle all issues`);
  }

  if (!process.env.LINEAR_API_KEY) {
    logError("[runner] LINEAR_API_KEY is not set");
    process.exit(1);
  }
  if (!acquireLock()) {
    logInfo("[runner] Another runner instance is active — exiting");
    process.exit(0);
  }
  process.on("exit", releaseLock);
  process.on("SIGINT", () => {
    releaseLock();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    releaseLock();
    process.exit(143);
  });

  try {
    const workingTree = getWorkingTreeStatus();
    if (workingTree.allowed.length > 0) {
      logWarn(
        `[runner] Ignoring ${workingTree.allowed.length} allowed runtime-generated dirty path(s)`,
      );
      logWorkingTreeEntries("[runner] allowed-dirty", workingTree.allowed);
    }
    if (workingTree.blocked.length > 0) {
      // Phase 2: Allow dirty worktree if marked for repair
      const dirtyWtState = getWorktreeState(WORKTREE_ID);
      if (dirtyWtState?.state === "dirty_owned") {
        logInfo(
          `[runner] Dirty worktree allowed for repair candidate (${dirtyWtState.issueIdentifier})`,
        );
      } else {
        logError(
          `[runner] Git working tree is dirty — refusing to run in a shared or unsafe worktree (${workingTree.blocked.length} blocking path(s))`,
        );
        logWorkingTreeEntries("[runner] blocking-dirty", workingTree.blocked);
        process.exit(1);
      }
    }

    const preflight = dryRun ? { pass: true } : await maybeRunPreflights();
    if (!preflight.pass) {
      logWarn(
        `[runner] Baseline pre-flight ${preflight.check} failed — execution limited to sticky repair and --issue targets`,
      );
    }

    if (!dryRun) {
      // FIRST: Clean up expired leases and recover stale In Progress issues BEFORE picking new work
      // This is critical for startup recovery - ensures issues stuck in In Progress are moved back to Todo
      const { findExpiredLeases } = await import("../../symphony-state.mjs");
      const expiredLeases = findExpiredLeases();
      for (const { issueIdentifier } of expiredLeases) {
        logInfo(`[runner] Clearing expired lease for ${issueIdentifier}`);
        const { releaseLease } = await import("../../symphony-state.mjs");
        releaseLease(issueIdentifier);
      }

      // Now check for stale In Progress issues - recover them to Todo so they can be picked up
      // This handles cases where runners crashed without completing issues or updating state
      const snap = await getQueueSnapshot();
      if (snap.inProgress.all.length > 0) {
        logInfo(`[runner] Checking for stale In Progress issues...`);
        const { detectStuckWork } = await import("../symphony-queue-control.mjs");
        await detectStuckWork(snap, false);
      }

      // SECOND: Feed the queue to ensure we have enough issues to work on
      // This handles cases where the queue feeder didn't run or issues weren't properly fed
      const freshSnap = await getQueueSnapshot();
      if (freshSnap.readyDepth < TARGET_MIN) {
        logInfo(
          `[runner] Queue depth ${freshSnap.readyDepth} < target ${TARGET_MIN} - feeding queue...`,
        );
        await feedQueue(freshSnap, false);
      }

      // Now check if we need to feed more issues from Backlog
      // CRITICAL: Use readyDepth (Todo count), not queueDepth (includes In Progress)
      if (freshSnap.readyDepth < TARGET_MIN) await feedQueue(freshSnap, false);
    }

    // SECOND: Pick and execute issues (now with recovered issues in Todo)
    const excludeIds = new Set();
    let executed = false;
    while (!executed) {
      // If --issue flag provided, fetch that specific issue directly
      let issue = null;
      if (targetIssue) {
        logInfo(`[runner] Targeting specific issue: ${targetIssue}`);
        const { findOpenIssuesByIdentifier } = await import("../../linear-client.mjs");
        const results = await findOpenIssuesByIdentifier(targetIssue);
        const found = results?.[0];
        if (found && found.state?.name !== "Done" && found.state?.name !== "Canceled") {
          issue = found;
        } else {
          logWarn(`[runner] Issue ${targetIssue} not found or already completed`);
        }
      } else {
        // Priority 1: sticky repair for this worktree
        const repairCandidate = getNextRepairableIssueForWorktree(WORKTREE_ID);
        if (repairCandidate) {
          const { findOpenIssuesByIdentifier } = await import("../../linear-client.mjs");
          const results = await findOpenIssuesByIdentifier(repairCandidate.issueIdentifier);
          if (results?.[0]) {
            issue = results[0];
            logInfo(
              `[runner] 🔧 Picked sticky repair issue: ${issue.identifier} (${repairCandidate.finalization.state})`,
            );
          }
        }
        // ADR-0002: Runners do not self-pick global work. They only execute
        // work assigned via --issue flag or sticky repair for this worktree.
      }
      if (!issue) break;
      const status = await executeIssue(issue, dryRun);
      if (status === "skip") {
        excludeIds.add(issue.id);
        continue;
      }
      // After completing an issue (success or handled outcome), feed queue to eliminate idle gap
      // CRITICAL: Use readyDepth (Todo count), not queueDepth (includes In Progress)
      const snap = await getQueueSnapshot();
      if (snap.readyDepth < TARGET_MIN) await feedQueue(snap, false);
      executed = true;
    }

    // After processing (whether an issue was executed or not), feed to keep queue topped up and eliminate idle gap
    // CRITICAL: Use readyDepth (Todo count), not queueDepth (includes In Progress)
    if (!dryRun) {
      const finalSnap = await getQueueSnapshot();
      if (finalSnap.readyDepth < TARGET_MIN) await feedQueue(finalSnap, false);
    }

    if (!executed) {
      logInfo(`[runner] No eligible issues found for execution`);
    }
    logInfo(`[runner] Run completed at ${new Date().toISOString()}`);
    process.exit(0);
  } catch (err) {
    logError(`[runner] Fatal error: ${err.message}`);
    logError(err.stack);
    process.exit(1);
  }
}
