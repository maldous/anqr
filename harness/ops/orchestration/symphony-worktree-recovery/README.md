# Symphony Worktree Recovery

## Purpose

Recovery daemon for classifying unhealthy worktrees, quarantining or reprovisioning damaged sandboxes, and performing non-publishing maintenance that keeps the executor fleet usable.

## Contents

- 15 immediate files
- 1 child directory

## Key Files

- `all-worktree-ids.mjs` - Exports `ALL_WORKTREE_IDS`, a shared constant or state value used by sibling modules.
- `check-baseline-health.mjs` - Exports `checkBaselineHealth`, the main helper defined in this file.
- `check-quarantined-for-reprovisioning.mjs` - Exports `checkQuarantinedForReprovisioning`, the main helper defined in this file.
- `classify-worktree.mjs` - Exports `classifyWorktree`, the main helper defined in this file.
- `detect-divergence.mjs` - Exports `detectDivergence`, the main helper defined in this file.
- `execute-repair.mjs` - Re-export facade that assembles the public surface for this directory.
- `has-conflict-markers.mjs` - Exports `hasConflictMarkers`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `infer-owner-from-branch.mjs` - Exports `inferOwnerFromBranch`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main-repo-root.mjs` - Exports `MAIN_REPO_ROOT`, a shared constant or state value used by sibling modules.
- `run-daemon.mjs` - Exports `runDaemon`, the main helper defined in this file.
- `run-recovery-cycle.mjs` - Exports `runRecoveryCycle`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `show-status.mjs` - Exports `showStatus`, the main helper defined in this file.

## Subdirectories

- `execute-repair/` - Execute Repair scope; immediate files include `execute-repair.mjs`, `index.mjs`.

## Operational Notes

- This directory reflects the Workstream C demotion of recovery away from code publication and toward state repair, quarantine, and sandbox maintenance only.
- The recovery path remains sensitive because it can still classify, reset, quarantine, and otherwise interfere with executor availability.

## Review Focus

Verify that recovery remains non-publishing, avoids active sandboxes, and emits evidence for every action while still keeping the worktree fleet serviceable.
