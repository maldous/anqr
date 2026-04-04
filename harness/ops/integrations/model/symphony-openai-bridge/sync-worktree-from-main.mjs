import { execSync } from "node:child_process";

import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { IS_WORKTREE_BRIDGE } from "./is-worktree-bridge.mjs";
import { resolveConflictsWithAI } from "./resolve-conflicts-with-ai.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function syncWorktreeFromMain() {
  if (!IS_WORKTREE_BRIDGE) return;
  try {
    execSync("git fetch origin main", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 15000,
      stdio: "pipe",
    });
    try {
      execSync("git merge origin/main --ff-only", {
        cwd: BRIDGE_ROOT,
        encoding: "utf-8",
        timeout: 15000,
        stdio: "pipe",
      });
    } catch {
      logWarn(`⚠️ ff-only merge failed — attempting regular merge`);
      try {
        execSync("git merge origin/main --no-edit", {
          cwd: BRIDGE_ROOT,
          encoding: "utf-8",
          timeout: 30000,
          stdio: "pipe",
        });
      } catch {
        logInfo(`🔧 Merge conflict detected — attempting AI resolution`);
        const resolved = await resolveConflictsWithAI();
        if (!resolved) {
          logWarn(`⚠️ AI conflict resolution failed — aborting merge`);
          try {
            execSync("git merge --abort", {
              cwd: BRIDGE_ROOT,
              encoding: "utf-8",
              timeout: 5000,
              stdio: "pipe",
            });
          } catch {
            /* already clean */
          }
          return;
        }
        try {
          execSync("git commit --no-edit", {
            cwd: BRIDGE_ROOT,
            encoding: "utf-8",
            timeout: 15000,
            stdio: "pipe",
          });
          logInfo(`✅ Merge conflicts resolved by AI`);
        } catch (commitErr) {
          logWarn(`⚠️ Merge commit failed after AI resolution: ${commitErr.message}`);
          try {
            execSync("git merge --abort", {
              cwd: BRIDGE_ROOT,
              encoding: "utf-8",
              timeout: 5000,
              stdio: "pipe",
            });
          } catch {
            /* already clean */
          }
          return;
        }
      }
    }
    logInfo(`🔄 Worktree synced with origin/main`);
  } catch (err) {
    logWarn(`⚠️ Worktree sync failed (non-fatal): ${err.message}`);
  }
}
