// Generated from ../../../scripts/ops/core/worktree-health.mjs:112

import { getWorktreePath } from "../worktree-config.mjs";
import { existsSync } from "node:fs";
import {
  getWorktreeState,
  loadState,
  leaseIsActive,
  getFinalizationState,
} from "../symphony-state.mjs";

import { getCurrentBranch } from "./get-current-branch.mjs";
import { getGitDirtyFiles } from "./get-git-dirty-files.mjs";
import { getHeadSha } from "./get-head-sha.mjs";

export function getWorktreeHealthSnapshot(worktreeId) {
  const normalizedId = String(worktreeId).replace(/^wt/, "");
  const wtId = `wt${normalizedId}`;
  const path = getWorktreePath(normalizedId);
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

  // Check stored worktree state
  const wtState = getWorktreeState(wtId);
  if (wtState) {
    snapshot.issueIdentifier = wtState.issueIdentifier || null;
  }

  // Check for active issue lease
  const store = loadState();
  let activeIssueIdentifier = null;
  let activeLease = null;
  for (const [identifier, record] of Object.entries(store.issues)) {
    if (record.lease && record.finalization?.worktreeId === wtId) {
      activeLease = record.lease;
      activeIssueIdentifier = identifier;
      break;
    }
  }
  snapshot.leaseState = activeLease;
  if (activeIssueIdentifier) {
    snapshot.issueIdentifier = activeIssueIdentifier;
    snapshot.finalizationState = getFinalizationState(activeIssueIdentifier);
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
