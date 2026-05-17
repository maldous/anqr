import { getWorktreeHealthSnapshot, writeFleetHealthFile } from "../../core/worktree-health.mjs";
import { getWorktreeState, transitionWorktree } from "../../symphony-state.mjs";

import { ALL_WORKTREE_IDS } from "./all-worktree-ids.mjs";
import { classifyWorktree } from "./classify-worktree.mjs";
import { detectDivergence } from "./detect-divergence.mjs";
import { executeRepair } from "./execute-repair.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export async function runRecoveryCycle() {
  const stats = { scanned: 0, repaired: 0, quarantined: 0, skipped: 0, errors: [] };

  for (const id of ALL_WORKTREE_IDS) {
    const wtId = id === "main" ? "main" : `wt${id}`;
    stats.scanned++;

    try {
      const snapshot = getWorktreeHealthSnapshot(id);
      snapshot.diverged = detectDivergence(snapshot);
      const classification = classifyWorktree(snapshot);

      logDebug(
        `[recovery] ${wtId}: ${classification.classification} → ${classification.repairAction} (confidence: ${classification.confidence})`,
      );

      // Main is the control repo, not an executor worktree. Dirty files
      // are expected (runtime artifacts: reports/, state.json, etc.).
      // Never quarantine or repair main — only clear stale quarantine state.
      if (wtId === "main") {
        if (classification.classification === "clean") {
          const wtState = getWorktreeState(wtId);
          if (wtState?.state === "quarantined") {
            transitionWorktree(wtId, "available", { assignedIssue: null });
            logInfo(`[recovery] Cleared quarantine for main (now clean)`);
            stats.repaired++;
          } else {
            stats.skipped++;
          }
        } else {
          logDebug(
            `[recovery] main: ${classification.classification} — skipping (control repo, not an executor)`,
          );
          stats.skipped++;
        }
        continue;
      }

      if (classification.repairAction === "skip") {
        // A clean worktree that was previously quarantined should be
        // transitioned back to available.  Without this, recovery
        // correctly classifies the worktree as "clean" but the skip
        // action leaves the quarantined state untouched, starving the
        // scheduler of healthy worktrees.
        if (classification.classification === "clean") {
          const wtState = getWorktreeState(wtId);
          if (wtState?.state === "quarantined") {
            transitionWorktree(wtId, "available", { assignedIssue: null });
            logInfo(`[recovery] Cleared quarantine for ${wtId} (now clean)`);
            stats.repaired++;
            continue;
          }
        }
        stats.skipped++;
        continue;
      }

      const result = await executeRepair(wtId, classification, snapshot);

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
    `[recovery] Cycle complete: scanned ${stats.scanned} worktrees, repaired ${stats.repaired}, quarantined ${stats.quarantined}, skipped ${stats.skipped}, ${stats.errors.length} errors.`,
  );
  return stats;
}
