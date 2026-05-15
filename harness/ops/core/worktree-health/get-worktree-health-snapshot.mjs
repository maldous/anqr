import { getWorktreePath, PROJECT_ROOT } from "../worktree-config.mjs";
import { existsSync } from "node:fs";
import {
  getWorktreeState,
  getWorktreeOwner,
  loadState,
  leaseIsActive,
  getFinalizationState,
} from "../symphony-state.mjs";

import { getCurrentBranch } from "./get-current-branch.mjs";
import { getGitDirtyFiles } from "./get-git-dirty-files.mjs";
import { getHeadSha } from "./get-head-sha.mjs";

export function getWorktreeHealthSnapshot(worktreeId) {
  const isMainRepo = String(worktreeId) === "main";
  const normalizedId = isMainRepo ? "main" : String(worktreeId).replace(/^wt/, "");
  const wtId = isMainRepo ? "main" : `wt${normalizedId}`;
  const path = isMainRepo ? PROJECT_ROOT : getWorktreePath(normalizedId);
  const exists = existsSync(path);

  const snapshot = {
    id: wtId,
    path,
    exists,
    gitDirtyFiles: [],
    branch: "unknown",
    headSha: "unknown",
    finalizationState: null,
    leaseState: null,
    classification: "available",
    issueIdentifier: null,
    updatedAt: new Date().toISOString(),
  };

  if (!exists) {
    snapshot.classification = "missing";
    return snapshot;
  }

  snapshot.gitDirtyFiles = getGitDirtyFiles(path);
  snapshot.branch = getCurrentBranch(path);
  snapshot.headSha = getHeadSha(path);

  // Phase 5: durable worktree state is the primary ownership record.
  const wtState = getWorktreeState(wtId);
  const durableOwner = getWorktreeOwner(wtId);
  if (durableOwner) {
    snapshot.issueIdentifier = durableOwner;
    snapshot.finalizationState = getFinalizationState(durableOwner);
  }

  const store = loadState();

  // Validate ownership by checking for active lease. Prefer the durable
  // worktree owner, but fall back to active issue assignment because stale
  // recovery state must never hide a live runner lease.
  let activeLease = null;
  const ownerToCheck = snapshot.issueIdentifier;
  if (ownerToCheck) {
    const record = store.issues[ownerToCheck];
    if (record?.lease) {
      activeLease = record.lease;
    }
  }
  if (!activeLease) {
    for (const [identifier, record] of Object.entries(store.issues || {})) {
      if (record?.assignment?.worktreeId !== wtId) continue;
      if (!record?.lease || !leaseIsActive({ lease: record.lease })) continue;
      activeLease = record.lease;
      snapshot.issueIdentifier = identifier;
      snapshot.finalizationState = getFinalizationState(identifier);
      break;
    }
  }
  snapshot.leaseState = activeLease;

  if (activeLease && leaseIsActive({ lease: activeLease })) {
    snapshot.classification = "executing";
    return snapshot;
  }

  // If worktree state was explicitly set, prefer it
  if (wtState?.state === "quarantined") {
    snapshot.classification = "quarantined";
    return snapshot;
  }

  // Classification logic
  const hasDirtyFiles = snapshot.gitDirtyFiles.length > 0;
  const hasActiveLease = activeLease && leaseIsActive({ lease: activeLease });
  const finState = snapshot.finalizationState;
  const isRepairable =
    finState &&
    [
      "validation_failed_repairable",
      "commit_failed_repairable",
      "branch_push_failed_repairable",
      "integration_failed_repairable",
    ].includes(finState.state);

  if (hasActiveLease) {
    snapshot.classification = "executing";
  } else if (hasDirtyFiles && isRepairable && finState.stickyOwner === wtId) {
    snapshot.classification = "dirty_owned";
  } else if (hasDirtyFiles && !isRepairable && !hasActiveLease) {
    snapshot.classification = "dirty_orphaned";
  } else if (isRepairable && finState.stickyOwner === wtId) {
    snapshot.classification = "dirty_owned";
  } else if (wtState?.state === "blocked") {
    snapshot.classification = "blocked";
  } else {
    snapshot.classification = "available";
  }

  return snapshot;
}
