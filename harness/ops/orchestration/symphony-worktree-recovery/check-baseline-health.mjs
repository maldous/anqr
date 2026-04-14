import { runCspell } from "../../core/symphony-validation.mjs";

import { MAIN_REPO_ROOT } from "./main-repo-root.mjs";
import { logInfo, logWarn } from "./logger.mjs";

/**
 * ADR-0005: Recovery detects baseline health issues but does NOT auto-fix them.
 * Cspell failures are logged for operator attention. Recovery does not commit,
 * push, or propagate fixes — that is the operator's or runner's responsibility.
 */
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

    // ADR-0005: Report the failure but do not attempt auto-fix.
    // Recovery is not a git writer. Operator or scheduled maintenance
    // must handle cspell dictionary updates.
    logWarn(
      "[recovery] ⚠️ Baseline cspell failing — operator intervention required (recovery does not auto-fix)",
    );
  } catch (err) {
    logWarn(`[recovery] Baseline health check error: ${err.message}`);
  }
}
