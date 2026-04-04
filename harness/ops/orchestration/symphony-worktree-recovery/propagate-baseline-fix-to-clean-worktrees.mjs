// Generated from ../../../scripts/ops/orchestration/symphony-worktree-recovery.mjs:582

import { getWorktreeHealthSnapshot } from "../../core/worktree-health.mjs";
import { leaseIsActive } from "../../symphony-state.mjs";
import { getWorktreePath } from "../../core/worktree-config.mjs";
import { execFileSync } from "node:child_process";

import { ALL_WORKTREE_IDS } from "./all-worktree-ids.mjs";
import { logInfo, logDebug } from "./logger.mjs";

export async function propagateBaselineFixToCleanWorktrees() {
  for (const id of ALL_WORKTREE_IDS) {
    const snapshot = getWorktreeHealthSnapshot(id);
    if (snapshot.gitDirtyFiles.length > 0) continue;
    if (snapshot.leaseState && leaseIsActive({ lease: snapshot.leaseState })) continue;

    const wtPath = getWorktreePath(String(id));
    try {
      execFileSync("git", ["fetch", "origin", "main"], {
        cwd: wtPath,
        timeout: 15_000,
        stdio: "pipe",
      });
      execFileSync("git", ["merge", "--ff-only", "origin/main"], {
        cwd: wtPath,
        timeout: 15_000,
        stdio: "pipe",
      });
      logInfo(`[recovery] ✅ Fast-forwarded wt${id} to include baseline fix`);
    } catch {
      logDebug(`[recovery] Could not fast-forward wt${id} — will pick up fix on next reset`);
    }
  }
}
