#!/usr/bin/env node

/**
 * symphony-worktree-recovery.mjs — Autonomous worktree recovery daemon
 *
 * Scans all worktrees, classifies their state, and drives same-worktree
 * repair until resolved or quarantined. Never runs agents directly —
 * sets state so the runner picks up repair work on the next cycle.
 *
 * Usage:
 *   node scripts/ops/orchestration/symphony-worktree-recovery.mjs once
 *   node scripts/ops/orchestration/symphony-worktree-recovery.mjs daemon
 *   node scripts/ops/orchestration/symphony-worktree-recovery.mjs status
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createLogger } from "../lib/logger.mjs";
import {
  getWorktreeHealthSnapshot,
  getFleetInventory,
  writeFleetHealthFile,
} from "../core/worktree-health.mjs";
import {
  loadState,
  setWorktreeState,
  getWorktreeState,
  listWorktreesByState,
  recordQuarantine,
  clearQuarantine,
  releaseLease,
  leaseIsActive,
  setFinalizationState,
  getFinalizationState,
  enqueueIntegrationCandidate,
} from "../symphony-state.mjs";
import {
  RECOVERY_POLL_INTERVAL_MS,
  RECOVERY_MAX_REPAIR_ATTEMPTS,
  RECOVERY_QUARANTINE_THRESHOLD_MS,
  RECOVERY_STALE_LEASE_GRACE_MS,
  RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD,
} from "../symphony-config.mjs";
import {
  getWorktreePath,
  getWorktreeBranch,
  DISCORD_WORKTREE_IDS,
  SYMPHONY_WORKTREE_IDS,
} from "../core/worktree-config.mjs";

const { logInfo, logWarn, logError, logDebug } = createLogger();

const ALL_WORKTREE_IDS = [
  ...SYMPHONY_WORKTREE_IDS.filter((id) => id !== "main"),
  ...DISCORD_WORKTREE_IDS,
];

/**
 * Classify a worktree's current state and determine repair action.
 * @param {object} snapshot - from getWorktreeHealthSnapshot()
 * @returns {{
 *   classification: string,
 *   confidence: number,
 *   inferredOwner: string|null,
 *   repairAction: string|null
 * }}
 */
export function classifyWorktree(snapshot) {
  const result = {
    classification: "clean",
    confidence: 1.0,
    inferredOwner: null,
    repairAction: null,
  };

  if (!snapshot.exists) {
    result.classification = "missing";
    result.repairAction = "reprovision";
    return result;
  }

  const hasDirtyFiles = snapshot.gitDirtyFiles.length > 0;
  const finState = snapshot.finalizationState;
  const isRepairable = finState && [
    "validation_failed_repairable",
    "commit_failed_repairable",
    "branch_push_failed_repairable",
    "integration_failed_repairable",
  ].includes(finState.state);

  // 1. Active lease with recent heartbeat → executing, skip (checked first — active work trumps all)
  if (snapshot.leaseState && leaseIsActive({ lease: snapshot.leaseState })) {
    const heartbeatAge = Date.now() - new Date(snapshot.leaseState.heartbeat_at || 0).getTime();
    if (heartbeatAge < RECOVERY_STALE_LEASE_GRACE_MS) {
      result.classification = "executing";
      result.repairAction = "skip";
      return result;
    }
    // Stale heartbeat — lease still technically active but runner may be dead
    result.classification = "stale_lease";
    result.confidence = 0.8;
    result.repairAction = "reclaim_lease";
    return result;
  }

  // 2. No dirty files + no active finalization → clean
  if (!hasDirtyFiles && !isRepairable) {
    result.classification = "clean";
    result.repairAction = "skip";
    return result;
  }

  // 3a. Specifically: branch_push_failed_repairable → retry push (no dirty files needed)
  if (finState?.state === "branch_push_failed_repairable" && finState.stickyOwner === snapshot.id) {
    result.classification = "half_committed";
    result.repairAction = "retry_push";
    result.confidence = 1.0;
    result.inferredOwner = snapshot.issueIdentifier;

    const finAge = Date.now() - new Date(finState.updatedAt || 0).getTime();
    if (finAge > RECOVERY_QUARANTINE_THRESHOLD_MS && (finState.attempts || 0) >= RECOVERY_MAX_REPAIR_ATTEMPTS) {
      result.repairAction = "quarantine";
    }
    return result;
  }

  // 3b. Other repairable states with stickyOwner match → dirty_owned / continue_repair
  if (isRepairable && finState.stickyOwner === snapshot.id) {
    result.classification = "dirty_owned";
    result.confidence = 1.0;
    result.inferredOwner = snapshot.issueIdentifier;
    result.repairAction = "continue_repair";

    // Check if stuck in repairable state too long
    const finAge = Date.now() - new Date(finState.updatedAt || 0).getTime();
    if (finAge > RECOVERY_QUARANTINE_THRESHOLD_MS && (finState.attempts || 0) >= RECOVERY_MAX_REPAIR_ATTEMPTS) {
      result.repairAction = "quarantine";
    }
    return result;
  }

  // 4. Dirty files + stale/expired lease
  if (hasDirtyFiles && snapshot.leaseState && !leaseIsActive({ lease: snapshot.leaseState })) {
    result.classification = "stale_lease";
    result.repairAction = "reclaim_lease";

    // Try to infer ownership from finalization state
    if (finState?.stickyOwner === snapshot.id) {
      result.confidence = 0.9;
      result.inferredOwner = snapshot.issueIdentifier;
    } else {
      result.confidence = 0.5;
      result.inferredOwner = inferOwnerFromBranch(snapshot);
    }
    return result;
  }

  // 5. Dirty files + no finalization + no lease → orphaned
  if (hasDirtyFiles && !isRepairable && !snapshot.leaseState) {
    const inferred = inferOwnerFromBranch(snapshot);
    if (inferred) {
      result.classification = "dirty_owned";
      result.confidence = 0.6;
      result.inferredOwner = inferred;
      result.repairAction = result.confidence >= RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD
        ? "continue_repair"
        : "quarantine";
    } else {
      result.classification = "dirty_orphaned";
      result.confidence = 0.3;
      result.repairAction = "quarantine";
    }
    return result;
  }

  // 6. Has repairable finalization but belongs to different worktree
  if (isRepairable && finState.stickyOwner !== snapshot.id) {
    result.classification = "clean";
    result.repairAction = "skip";
    return result;
  }

  // 7. Check for merge conflict markers
  if (hasDirtyFiles) {
    const worktreePath = snapshot.path;
    if (hasConflictMarkers(worktreePath, snapshot.gitDirtyFiles)) {
      result.classification = "conflicted";
      result.repairAction = "quarantine";
      return result;
    }
  }

  return result;
}

/**
 * Attempt to infer issue ownership from branch name and recent git log.
 * @param {object} snapshot
 * @returns {string|null}
 */
function inferOwnerFromBranch(snapshot) {
  // Check recent commit messages for issue identifiers (ANQ-NNN pattern)
  try {
    const log = execFileSync("git", ["log", "--oneline", "-5", "--format=%s"], {
      cwd: snapshot.path,
      encoding: "utf-8",
      timeout: 5_000,
    });
    const match = log.match(/ANQ-\d+/i);
    if (match) return match[0];
  } catch { /* ignore */ }

  // Check state store for issues assigned to this worktree
  const store = loadState();
  for (const [identifier, record] of Object.entries(store.issues)) {
    if (record.finalization?.worktreeId === snapshot.id) {
      return identifier;
    }
  }

  return null;
}

/**
 * Check if any dirty files have merge conflict markers.
 * @param {string} worktreePath
 * @param {string[]} dirtyFiles
 * @returns {boolean}
 */
function hasConflictMarkers(worktreePath, dirtyFiles) {
  for (const entry of dirtyFiles.slice(0, 10)) {
    const filePath = entry.slice(3).trim();
    if (filePath.includes(" -> ")) continue;
    try {
      const fullPath = resolve(worktreePath, filePath);
      if (!existsSync(fullPath)) continue;
      const content = readFileSync(fullPath, "utf-8").slice(0, 10_000);
      if (content.includes("<<<<<<<") && content.includes(">>>>>>>")) {
        return true;
      }
    } catch { /* ignore */ }
  }
  return false;
}

/**
 * Execute a repair action on a worktree.
 * @param {string} worktreeId
 * @param {object} classification - from classifyWorktree()
 * @returns {{ ok: boolean, action: string, nextState: string, error?: string }}
 */
export async function executeRepair(worktreeId, classification) {
  const { repairAction, inferredOwner } = classification;

  switch (repairAction) {
    case "skip":
      return { ok: true, action: "skip", nextState: "unchanged" };

    case "reclaim_lease": {
      // Release stale lease so runner can re-acquire
      if (inferredOwner) {
        releaseLease(inferredOwner);
        logInfo(`[recovery] Released stale lease for ${inferredOwner} on ${worktreeId}`);
      }
      // If we have a confident owner, set dirty_owned so runner picks it up
      if (classification.confidence >= RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD && inferredOwner) {
        setWorktreeState(worktreeId, { state: "dirty_owned", issueIdentifier: inferredOwner });
        return { ok: true, action: "reclaim_lease", nextState: "dirty_owned" };
      }
      // Low confidence — quarantine
      return executeRepair(worktreeId, { ...classification, repairAction: "quarantine" });
    }

    case "continue_repair": {
      // Ensure worktree state is set correctly for the runner to pick up
      setWorktreeState(worktreeId, { state: "dirty_owned", issueIdentifier: inferredOwner });
      logInfo(`[recovery] Confirmed repair state for ${worktreeId} (issue: ${inferredOwner})`);
      return { ok: true, action: "continue_repair", nextState: "dirty_owned" };
    }

    case "retry_push": {
      const worktreePath = getWorktreePath(worktreeId.replace(/^wt/, ""));
      try {
        // Prefer branch stored in finalization state; fall back to computed branch
        const fin = inferredOwner ? getFinalizationState(inferredOwner) : null;
        const branch = fin?.branch || getWorktreeBranch(worktreeId.replace(/^wt/, ""));
        execFileSync("git", ["push", "-u", "origin", `HEAD:${branch}`], {
          cwd: worktreePath,
          stdio: "pipe",
          timeout: 30_000,
          env: { ...process.env, ANQR_AUTOMATION_PUSH: "1" },
        });
        const headSha = execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: worktreePath,
          encoding: "utf-8",
          timeout: 5_000,
        }).trim();

        if (inferredOwner) {
          setFinalizationState(inferredOwner, {
            state: "integration_pending",
            branch,
            headSha,
            attempts: 0,
            lastError: null,
          });
          enqueueIntegrationCandidate(inferredOwner);
        }
        setWorktreeState(worktreeId, { state: "available", issueIdentifier: null });
        logInfo(`[recovery] Push retry succeeded for ${worktreeId}`);
        return { ok: true, action: "retry_push", nextState: "available" };
      } catch (err) {
        logWarn(`[recovery] Push retry failed for ${worktreeId}: ${err.message}`);
        // Increment attempts in finalization
        if (inferredOwner) {
          const fin = getFinalizationState(inferredOwner);
          const attempts = (fin?.attempts || 0) + 1;
          if (attempts >= RECOVERY_MAX_REPAIR_ATTEMPTS) {
            return executeRepair(worktreeId, { ...classification, repairAction: "quarantine" });
          }
          setFinalizationState(inferredOwner, { attempts });
        }
        return { ok: false, action: "retry_push", nextState: "branch_push_failed", error: err.message };
      }
    }

    case "quarantine": {
      const wtState = getWorktreeState(worktreeId);
      recordQuarantine(worktreeId, {
        reason: classification.classification,
        repairAttempts: wtState?.repairAttempts || 0,
        lastError: `Classification: ${classification.classification}, confidence: ${classification.confidence}`,
      });
      logWarn(`[recovery] Quarantined ${worktreeId} (${classification.classification})`);
      return { ok: true, action: "quarantine", nextState: "quarantined" };
    }

    case "reprovision": {
      // Defer to fleet health service — just mark for reprovisioning
      recordQuarantine(worktreeId, {
        reason: "missing",
        lastError: "Worktree directory does not exist",
      });
      logWarn(`[recovery] Marked ${worktreeId} for reprovisioning (missing)`);
      return { ok: true, action: "reprovision", nextState: "quarantined" };
    }

    default:
      logWarn(`[recovery] Unknown repair action: ${repairAction}`);
      return { ok: false, action: repairAction || "unknown", nextState: "unchanged", error: "unknown action" };
  }
}

/**
 * Run one full recovery cycle across all worktrees.
 * @returns {{ scanned: number, repaired: number, quarantined: number, skipped: number, errors: string[] }}
 */
export async function runRecoveryCycle() {
  const stats = { scanned: 0, repaired: 0, quarantined: 0, skipped: 0, errors: [] };

  for (const id of ALL_WORKTREE_IDS) {
    const wtId = `wt${id}`;
    stats.scanned++;

    try {
      const snapshot = getWorktreeHealthSnapshot(id);
      const classification = classifyWorktree(snapshot);

      logDebug(`[recovery] ${wtId}: ${classification.classification} → ${classification.repairAction} (confidence: ${classification.confidence})`);

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

  logInfo(`[recovery] Cycle complete: scanned=${stats.scanned} repaired=${stats.repaired} quarantined=${stats.quarantined} skipped=${stats.skipped} errors=${stats.errors.length}`);
  return stats;
}

/**
 * Check quarantined worktrees for reprovisioning eligibility.
 */
async function checkQuarantinedForReprovisioning() {
  const quarantined = listWorktreesByState("quarantined");
  for (const wt of quarantined) {
    const repairAttempts = wt.repairAttempts || 0;
    if (repairAttempts >= RECOVERY_MAX_REPAIR_ATTEMPTS) {
      logInfo(`[recovery] Quarantined ${wt.worktreeId} eligible for reprovisioning (${repairAttempts} repair attempts)`);
      try {
        const { reprovisionWorktree } = await import("./symphony-worktree-pool.mjs");
        await reprovisionWorktree(wt.worktreeId.replace(/^wt/, ""));
        clearQuarantine(wt.worktreeId);
        logInfo(`[recovery] ✅ Reprovisioned ${wt.worktreeId}`);
      } catch (err) {
        logError(`[recovery] Reprovisioning failed for ${wt.worktreeId}: ${err.message}`);
      }
    }
  }
}

/**
 * Show recovery daemon status.
 */
function showStatus() {
  const inventory = getFleetInventory();
  console.log("\n=== Worktree Recovery Status ===");
  console.log(`Timestamp: ${inventory.timestamp}`);
  console.log(`Summary: ${JSON.stringify(inventory.summary)}`);
  console.log();

  for (const wt of inventory.worktrees) {
    const classification = classifyWorktree(wt);
    console.log(`  ${wt.id}: ${wt.classification} → ${classification.repairAction || "none"} (confidence: ${classification.confidence})`);
    if (wt.issueIdentifier) console.log(`    Issue: ${wt.issueIdentifier}`);
    if (wt.gitDirtyFiles.length > 0) console.log(`    Dirty files: ${wt.gitDirtyFiles.length}`);
  }
  console.log();
}

/**
 * Run in daemon mode — poll periodically.
 */
export async function runDaemon() {
  logInfo(`[recovery] Starting daemon mode (poll every ${RECOVERY_POLL_INTERVAL_MS / 1000}s)`);

  const shutdown = (signal) => {
    logInfo(`[recovery] Received ${signal}, shutting down...`);
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  while (true) {
    try {
      await runRecoveryCycle();
      await checkQuarantinedForReprovisioning();
    } catch (err) {
      logError(`[recovery] Cycle error: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, RECOVERY_POLL_INTERVAL_MS));
  }
}

// CLI — only run when executed directly, not when imported as a module
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2];
  if (mode === "once") {
    runRecoveryCycle()
      .then((stats) => {
        logInfo(`[recovery] Single cycle: ${JSON.stringify(stats)}`);
        process.exit(stats.errors.length > 0 ? 1 : 0);
      })
      .catch((err) => {
        logError(`[recovery] Fatal: ${err.message}`);
        process.exit(1);
      });
  } else if (mode === "daemon") {
    runDaemon().catch((err) => {
      logError(`[recovery] Fatal: ${err.message}`);
      process.exit(1);
    });
  } else if (mode === "status") {
    showStatus();
  } else {
    console.error("Usage: symphony-worktree-recovery.mjs <once|daemon|status>");
    process.exit(2);
  }
}
