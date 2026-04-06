# ANQR Worktree Recovery

## 1. Directory Overview

This directory implements **ANQR Worktree Recovery** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 17 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **all-worktree-ids.mjs** - Exports `ALL_WORKTREE_IDS`, a shared constant used by sibling modules.
- **attempt-cspell-auto-fix.mjs** - Exports `attemptCspellAutoFix`, which implements attempt cspell auto fix.
- **check-baseline-health.mjs** - Exports `checkBaselineHealth`, which checks baseline health.
- **check-quarantined-for-reprovisioning.mjs** - Exports `checkQuarantinedForReprovisioning`, which checks quarantined for reprovisioning.
- **classify-worktree.mjs** - Exports `classifyWorktree`, which implements classify worktree.
- **execute-repair.mjs** - Exports `executeRepair`, which implements execute repair.
- **has-conflict-markers.mjs** - Exports `hasConflictMarkers`, which checks for conflict markers.
- **index.mjs** - Facade module that re-exports public members from `./main-repo-root.mjs`, `./all-worktree-ids.mjs`, `./classify-worktree.mjs`, `./infer-owner-from-branch.mjs`, `./has-conflict-markers.mjs`, `./execute-repair.mjs`, and 8 more siblings.
- **infer-owner-from-branch.mjs** - Exports `inferOwnerFromBranch`, which implements infer owner from branch.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **main-repo-root.mjs** - Exports `MAIN_REPO_ROOT`, a shared constant used by sibling modules.
- **parse-cspell-unknown-words.mjs** - Exports `parseCspellUnknownWords`, which parses cspell unknown words.
- **propagate-baseline-fix-to-clean-worktrees.mjs** - Exports `propagateBaselineFixToCleanWorktrees`, which implements propagate baseline fix to clean worktrees.
- **run-daemon.mjs** - Exports `runDaemon`, which runs daemon.
- **run-recovery-cycle.mjs** - Exports `runRecoveryCycle`, which runs recovery cycle.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **show-status.mjs** - Exports `showStatus`, which shows status.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Discord integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-worktree-recovery/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`
- **Internal relative modules** - `../../core/symphony-validation.mjs`, `../../core/worktree-config.mjs`, `../../core/worktree-health.mjs`, `../../lib/logger.mjs`, `../../symphony-config.mjs`, `../../symphony-state.mjs`, `./all-worktree-ids.mjs`, `./attempt-cspell-auto-fix.mjs`, `./check-baseline-health.mjs`, `./check-quarantined-for-reprovisioning.mjs`, `./classify-worktree.mjs`, `./execute-repair.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
