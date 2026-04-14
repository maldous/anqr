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

  // Validate ownership by checking for active lease (reverse scan is
  // validation only, not authority — Phase 5 invariant).
  let activeLease = null;
  const ownerToCheck = snapshot.issueIdentifier;
  if (ownerToCheck) {
    const store = loadState();
    const record = store.issues[ownerToCheck];
    if (record?.lease) {
      activeLease = record.lease;
    }
  }
  snapshot.leaseState = activeLease;

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
