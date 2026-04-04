import { listWorktreesByState, clearQuarantine } from "../../symphony-state.mjs";
import { RECOVERY_MAX_REPAIR_ATTEMPTS } from "../../symphony-config.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function checkQuarantinedForReprovisioning() {
  const quarantined = listWorktreesByState("quarantined");
  for (const wt of quarantined) {
    const repairAttempts = wt.repairAttempts || 0;
    if (repairAttempts >= RECOVERY_MAX_REPAIR_ATTEMPTS) {
      logInfo(
        `[recovery] Quarantined ${wt.worktreeId} eligible for reprovisioning (${repairAttempts} repair attempts)`,
      );
      try {
        const { reprovisionWorktree } = await import("../symphony-worktree-pool.mjs");
        await reprovisionWorktree(wt.worktreeId.replace(/^wt/, ""));
        clearQuarantine(wt.worktreeId);
        logInfo(`[recovery] ✅ Reprovisioned ${wt.worktreeId}`);
      } catch (err) {
        logError(`[recovery] Reprovisioning failed for ${wt.worktreeId}: ${err.message}`);
      }
    }
  }
}
