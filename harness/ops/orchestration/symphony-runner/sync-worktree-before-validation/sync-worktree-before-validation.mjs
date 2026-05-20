import { logInfo, logWarn, logError } from "../logger.mjs";
import { WORKTREE_ID } from "../worktree-id.mjs";
import { git } from "./git.mjs";

export function syncWorktreeBeforeValidation(worktreePath) {
  const label = `[sync-validation][${WORKTREE_ID}]`;

  try {
    const currentBranch = git("rev-parse --abbrev-ref HEAD", worktreePath);
    const mainSha = git("rev-parse origin/main", worktreePath);
    const headSha = git("rev-parse HEAD", worktreePath);

    logInfo(`${label} Syncing worktree for validation`);
    logInfo(`${label}   branch: ${currentBranch}`);
    logInfo(`${label}   head: ${headSha}`);
    logInfo(`${label}   origin/main: ${mainSha}`);

    git("fetch origin main --no-tags", worktreePath);

    const mergeBase = git(`merge-base HEAD origin/main`, worktreePath);
    if (mergeBase === mainSha) {
      logInfo(`${label} Already up-to-date with origin/main`);
      return { synced: true, method: "already-current", mainSha };
    }

    const hasUncommitted = git("status --porcelain", worktreePath).length > 0;
    if (hasUncommitted) {
      logInfo(`${label} Stashing uncommitted changes before rebase`);
      git("stash push -m 'anqr-validation-sync'", worktreePath);
    }

    try {
      git("rebase origin/main", worktreePath);
      logInfo(`${label} Rebase onto origin/main succeeded`);
    } catch (error__) {
      logWarn(`${label} Rebase failed — aborting and hard-resetting to guarantee clean worktree`);
      // Always abort any in-progress rebase first
      try { git("rebase --abort", worktreePath); } catch { /* may not be mid-rebase */ }
      // Hard-reset to HEAD to clear any conflict markers left by the failed rebase.
      // Without this, the recovery service detects the conflict markers and quarantines
      // the worktree — causing every subsequent issue to fail for the worktree's lifetime.
      try {
        git("reset --hard HEAD", worktreePath);
        git("clean -fd", worktreePath);
        logInfo(`${label} Hard-reset to HEAD after rebase failure — worktree is clean`);
      } catch (error__) {
        logWarn(`${label} Hard-reset also failed: ${error__.message}`);
      }

      if (hasUncommitted) {
        try { git("stash pop", worktreePath); } catch { /* ok */ }
      }

      return {
        synced: false,
        method: "rebase-failed",
        mainSha,
        error: error__.message,
      };
    }

    if (hasUncommitted) {
      try {
        git("stash pop", worktreePath);
        logInfo(`${label} Restored stashed changes`);
      } catch (error__) {
        logWarn(`${label} Stash pop failed — changes remain in stash: ${error__.message}`);
      }
    }

    const newHead = git("rev-parse HEAD", worktreePath);
    logInfo(`${label} Sync complete: ${headSha} → ${newHead}`);

    return { synced: true, method: "rebase", mainSha, previousHead: headSha, newHead };
  } catch (error__) {
    logError(`${label} Sync failed: ${error__.message}`);
    return { synced: false, method: "error", error: error__.message };
  }
}
