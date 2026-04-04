// Generated from ../../../scripts/ops/orchestration/symphony-worktree-recovery.mjs:614

import { runCspell } from "../../core/symphony-validation.mjs";

import { MAIN_REPO_ROOT } from "./main-repo-root.mjs";
import { attemptCspellAutoFix } from "./attempt-cspell-auto-fix.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function checkBaselineHealth() {
  logInfo("[recovery] 🔍 Running baseline cspell check...");

  try {
    // Only run cspell (lightweight) — not full preflights (typecheck/lint/tests)
    // to avoid resource contention with executor flock locks.
    const result = await runCspell(MAIN_REPO_ROOT, [], { fullProject: true });
    if (result.pass) {
      logInfo("[recovery] ✅ Baseline cspell passing");
      return;
    }

    logWarn("[recovery] ⚠️ Baseline cspell failing");
    const fixed = await attemptCspellAutoFix(result.detail);
    if (!fixed) {
      logWarn("[recovery] Could not auto-fix cspell — manual intervention may be needed");
    }
  } catch (err) {
    logWarn(`[recovery] Baseline health check error: ${err.message}`);
  }
}
