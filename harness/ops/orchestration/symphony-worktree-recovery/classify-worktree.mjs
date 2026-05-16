import { leaseIsActive } from "../../symphony-state.mjs";
import {
  RECOVERY_MAX_REPAIR_ATTEMPTS,
  RECOVERY_QUARANTINE_THRESHOLD_MS,
  RECOVERY_STALE_LEASE_GRACE_MS,
  RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD,
} from "../../symphony-config.mjs";

import { hasConflictMarkers } from "./has-conflict-markers.mjs";
import { inferOwnerFromBranch } from "./infer-owner-from-branch.mjs";

export function classifyWorktree(snapshot) {
  const result = {
    classification: "clean",
    confidence: 1.0,
    inferredOwner: null,
    repairAction: null,
    hasDirtyFiles: false,
  };

  if (!snapshot.exists) {
    result.classification = "missing";
    result.repairAction = "reprovision";
    return result;
  }

  const hasDirtyFiles = snapshot.gitDirtyFiles.length > 0;
  result.hasDirtyFiles = hasDirtyFiles;
  const finState = snapshot.finalizationState;
  const isRepairable =
    finState &&
    [
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
    result.inferredOwner = snapshot.issueIdentifier || null;
    result.repairAction = "reclaim_lease";
    return result;
  }

  // 1b. Diverged from origin/main — needs reset or quarantine
  if (snapshot.diverged) {
    result.classification = "diverged";
    if (hasDirtyFiles || isRepairable) {
      result.repairAction = "quarantine";
    } else {
      result.repairAction = "reset_to_main";
    }
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
    if (
      finAge > RECOVERY_QUARANTINE_THRESHOLD_MS &&
      (finState.attempts || 0) >= RECOVERY_MAX_REPAIR_ATTEMPTS
    ) {
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
    if (
      finAge > RECOVERY_QUARANTINE_THRESHOLD_MS &&
      (finState.attempts || 0) >= RECOVERY_MAX_REPAIR_ATTEMPTS
    ) {
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
    // Guard: never auto-commit conflict markers
    if (hasConflictMarkers(snapshot.path, snapshot.gitDirtyFiles)) {
      result.classification = "conflicted";
      result.repairAction = "quarantine";
      return result;
    }

    const inferred = inferOwnerFromBranch(snapshot);
    if (inferred) {
      result.classification = "dirty_owned";
      result.confidence = 0.6;
      result.inferredOwner = inferred;
      // ADR-0005: Recovery shall not publish code.
      // High confidence → continue repair (runner picks it up as dirty_owned).
      // Low confidence → reset_to_main. No active lease + no repairable finalization
      // means no committed work at risk. The issue will be retried from scratch.
      // Quarantine (manual intervention) is avoided because these are bridge artifacts.
      result.repairAction =
        result.confidence >= RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD
          ? "continue_repair"
          : "reset_to_main";
    } else {
      result.classification = "dirty_orphaned";
      result.confidence = 0.3;
      // ADR-0005: Recovery shall not auto-commit orphaned dirty worktrees.
      // reset_to_main discards unfinalized AI changes and restores to a clean
      // state so the worktree is available for new work. This breaks the
      // permanent quarantine loop where dirty_orphaned worktrees could never
      // recover automatically.
      result.repairAction = "reset_to_main";
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
