import { listIssuesByState } from "../../linear-client.mjs";
import { QUEUE_STATES } from "../../symphony-config.mjs";
import { isDiscordWorktree, isSymphonyWorktree } from "../../core/worktree-config.mjs";
import { canExecuteIssue } from "../../symphony-state.mjs";

import { ROOT } from "./root.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { isBaselineRepairIssue } from "./is-baseline-repair-issue.mjs";
import { isDiscordIssue } from "./is-discord-issue.mjs";
import { logDebug } from "./logger.mjs";

export async function pickIssue({ excludeIds = new Set(), baselineOnly = false } = {}) {
  const todoIssues = await listIssuesByState(QUEUE_STATES.readyStates);

  logDebug(`[worktree-routing] pickIssue() called - WORKTREE_ID: ${WORKTREE_ID}, ROOT: ${ROOT}`);
  logDebug(`[worktree-routing] Total todo issues: ${todoIssues.length}`);
  logDebug(`[worktree-routing] Excluded IDs: ${excludeIds.size}`);
  logDebug(`[worktree-routing] Baseline only: ${baselineOnly}`);

  // IMPORTANT: Worktree routing to prevent concurrent conflicts
  // - Discord issues (wt5-wt8) are routed to Discord worktrees only
  // - Symphony issues (wt1-wt4, main) handle all other work
  const isDiscordWt = isDiscordWorktree(WORKTREE_ID);
  const isSymphonyWt = isSymphonyWorktree(WORKTREE_ID);

  logDebug(
    `[worktree-routing] This worktree - isDiscord: ${isDiscordWt}, isSymphony: ${isSymphonyWt}`,
  );

  const candidates = todoIssues
    .filter((issue) => !excludeIds.has(issue.id))
    .filter((issue) => canExecuteIssue(issue))
    .filter((issue) => (baselineOnly ? isBaselineRepairIssue(issue) : true))
    .filter((issue) => {
      // Worktree routing based on issue source
      const fromDiscord = isDiscordIssue(issue);

      logDebug(
        `[worktree-routing] Evaluating issue ${issue.identifier} - fromDiscord: ${fromDiscord}`,
      );

      // Discord worktrees (wt5-wt8) only handle Discord issues
      if (isDiscordWt && !fromDiscord) {
        logDebug(
          `[worktree-routing] ✗ Skipping non-Discord issue ${issue.identifier} (Discord worktree)`,
        );
        return false;
      }

      // Symphony worktrees (wt1-wt4, main) only handle non-Discord issues
      if (isSymphonyWt && fromDiscord) {
        logDebug(
          `[worktree-routing] ✗ Skipping Discord issue ${issue.identifier} (Symphony worktree)`,
        );
        return false;
      }

      logDebug(`[worktree-routing] ✓ Issue ${issue.identifier} matches worktree criteria`);
      return true;
    })
    .sort(
      (a, b) =>
        (a.priority ?? 99) - (b.priority ?? 99) || new Date(a.createdAt) - new Date(b.createdAt),
    );

  logDebug(`[worktree-routing] Candidate count after filtering: ${candidates.length}`);
  if (candidates.length > 0) {
    logDebug(`[worktree-routing] Selected issue: ${candidates[0].identifier}`);
  } else {
    logDebug(`[worktree-routing] No candidates available`);
  }

  return candidates[0] || null;
}
