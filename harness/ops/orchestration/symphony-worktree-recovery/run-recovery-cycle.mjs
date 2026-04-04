import { getWorktreeHealthSnapshot, writeFleetHealthFile } from "../../core/worktree-health.mjs";

import { ALL_WORKTREE_IDS } from "./all-worktree-ids.mjs";
import { classifyWorktree } from "./classify-worktree.mjs";
import { executeRepair } from "./execute-repair.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export async function runRecoveryCycle() {
  const stats = { scanned: 0, repaired: 0, quarantined: 0, skipped: 0, errors: [] };

  for (const id of ALL_WORKTREE_IDS) {
    const wtId = `wt${id}`;
    stats.scanned++;

    try {
      const snapshot = getWorktreeHealthSnapshot(id);
      const classification = classifyWorktree(snapshot);

      logDebug(
        `[recovery] ${wtId}: ${classification.classification} → ${classification.repairAction} (confidence: ${classification.confidence})`,
      );

      if (classification.repairAction === "skip") {
        stats.skipped++;
        continue;
      }

      const result = await executeRepair(wtId, classification);

      if (result.action === "quarantine" || result.nextState === "quarantined") {
        stats.quarantined++;
      } else if (result.ok) {
        stats.repaired++;
      } else {
        stats.errors.push(`${wtId}: ${result.error || "repair failed"}`);
      }
    } catch (err) {
      stats.errors.push(`${wtId}: ${err.message}`);
      logError(`[recovery] Error processing ${wtId}: ${err.message}`);
    }
  }

  // Write fleet health file after each cycle
  try {
    writeFleetHealthFile();
  } catch (err) {
    logWarn(`[recovery] Failed to write fleet health: ${err.message}`);
  }

  logInfo(
    `[recovery] Cycle complete: scanned=${stats.scanned} repaired=${stats.repaired} quarantined=${stats.quarantined} skipped=${stats.skipped} errors=${stats.errors.length}`,
  );
  return stats;
}
