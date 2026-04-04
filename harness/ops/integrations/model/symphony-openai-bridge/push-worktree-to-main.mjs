// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1899

import { execSync } from "node:child_process";

import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { IS_WORKTREE_BRIDGE } from "./is-worktree-bridge.mjs";
import { resolveConflictsWithAI } from "./resolve-conflicts-with-ai.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function pushWorktreeToMain() {
  if (!IS_WORKTREE_BRIDGE) return;
  try {
    const status = execSync("git status --porcelain", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 5000,
      stdio: "pipe",
    }).trim();
    if (!status) {
      logInfo(`📤 No changes to push`);
      return;
    }
    execSync("git add -A", { cwd: BRIDGE_ROOT, encoding: "utf-8", timeout: 10000, stdio: "pipe" });
    const diff = execSync("git diff --cached --stat", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 5000,
      stdio: "pipe",
    }).trim();
    if (!diff) {
      logInfo(`📤 No staged changes to push`);
      return;
    }
    execSync(`git commit -m "chore(harness): sync worktree changes to main"`, {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 15000,
      stdio: "pipe",
    });

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        execSync("git push origin HEAD:main", {
          cwd: BRIDGE_ROOT,
          encoding: "utf-8",
          timeout: 30000,
          stdio: "pipe",
        });
        logInfo(`📤 Worktree changes pushed to origin/main`);
        return;
      } catch (pushErr) {
        if (attempt < 3) {
          logWarn(`⚠️ Push attempt ${attempt} failed — rebasing and retrying`);
          try {
            execSync("git fetch origin main && git rebase origin/main", {
              cwd: BRIDGE_ROOT,
              encoding: "utf-8",
              timeout: 30000,
              stdio: "pipe",
            });
          } catch {
            logInfo(`🔧 Rebase conflict — attempting AI resolution`);
            let rebaseOk = false;
            for (let round = 0; round < 5; round++) {
              const aiOk = await resolveConflictsWithAI();
              if (!aiOk) break;
              try {
                execSync("GIT_EDITOR=true git rebase --continue", {
                  cwd: BRIDGE_ROOT,
                  encoding: "utf-8",
                  timeout: 30000,
                  stdio: "pipe",
                });
                rebaseOk = true;
                break;
              } catch {
                const remaining = execSync("git diff --name-only --diff-filter=U", {
                  cwd: BRIDGE_ROOT,
                  encoding: "utf-8",
                  timeout: 5000,
                  stdio: "pipe",
                }).trim();
                if (!remaining) {
                  rebaseOk = true;
                  break;
                }
                logInfo(`🔧 Rebase round ${round + 1}: more conflicts, continuing`);
              }
            }
            if (!rebaseOk) {
              logWarn(`⚠️ Rebase conflict resolution failed — aborting rebase`);
              try {
                execSync("git rebase --abort", {
                  cwd: BRIDGE_ROOT,
                  encoding: "utf-8",
                  timeout: 5000,
                  stdio: "pipe",
                });
              } catch {
                /* already clean */
              }
              break;
            }
            logInfo(`✅ Rebase conflicts resolved by AI`);
          }
        } else {
          logWarn(`⚠️ Push failed after ${attempt} attempts: ${pushErr.message}`);
        }
      }
    }
  } catch (err) {
    logWarn(`⚠️ Worktree push failed (non-fatal): ${err.message}`);
  }
}
