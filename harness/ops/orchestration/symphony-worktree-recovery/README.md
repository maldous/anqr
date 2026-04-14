# Symphony Worktree Recovery

## Purpose
Recovery daemon for quarantining, classifying, and repairing unhealthy worktrees while keeping the executor fleet usable after drift, conflicts, or corruption.

**ADR-0005 compliance:** Recovery is limited to state repair, quarantine, reprovision request, stale-claim handling, and sandbox maintenance. It does **not** publish code (no auto-commit, no auto-push, no merge). `retry_push` and `auto_commit_and_push` actions are demoted to quarantine. `reset_to_main` is classified as sandbox maintenance (non-publishing) and guarded against active leases.

## Contents
- 18 immediate files
- 1 child directory

## Key Files
- `all-worktree-ids.mjs` - Exports `ALL_WORKTREE_IDS`, a shared constant or state value used by sibling modules.
- `attempt-cspell-auto-fix.mjs` - Exports `attemptCspellAutoFix`, the main helper defined in this file.
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
- `parse-cspell-unknown-words.mjs` - Exports `parseCspellUnknownWords`, the main helper defined in this file.
- `propagate-baseline-fix-to-clean-worktrees.mjs` - Exports `propagateBaselineFixToCleanWorktrees`, the main helper defined in this file.
- `run-daemon.mjs` - Exports `runDaemon`, the main helper defined in this file.
- `run-recovery-cycle.mjs` - Exports `runRecoveryCycle`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `show-status.mjs` - Exports `showStatus`, the main helper defined in this file.

## Subdirectories
- `execute-repair/` - Directory for fleet recovery, quarantine, and health enforcement; immediate files include `build-commit-message.mjs`, `execute-repair.mjs`, `extract-file-names.mjs`, `format-file-summary.mjs`, and others.

## Operational Notes
- This is one of the most sensitive directories in the current harness architecture because recovery mistakes can destabilize every executor.
- The code here should be read alongside ADR-0005 (state-only recovery) and ADR-0006 (evidence contract).
- Every recovery action emits structured evidence via `buildEvidence()` with `actionClass`, `isStateOnly`, and `isNonPublishing` classification.
- `reset_to_main` is the only action that performs filesystem mutation (git fetch/reset/clean). It is classified as sandbox maintenance, explicitly guarded against active leases, and always non-publishing.

## Review Focus
Verify that recovery remains non-publishing (no commit/push), that evidence is emitted for every action, that `reset_to_main` only runs on inactive worktrees, and that the recovery action surface matches ADR-0005 + ADR-0006.
