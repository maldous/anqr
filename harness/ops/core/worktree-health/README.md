# ANQR Worktree Health

## 1. Directory Overview

This directory implements **ANQR Worktree Health** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 10 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **all-worktree-ids.mjs** - Exports `ALL_WORKTREE_IDS`, a shared constant used by sibling modules.
- **get-current-branch.mjs** - Exports `getCurrentBranch`, which gets current branch.
- **get-fleet-inventory.mjs** - Exports `getFleetInventory`, which gets fleet inventory.
- **get-git-dirty-files.mjs** - Exports `getGitDirtyFiles`, which gets git dirty files.
- **get-head-sha.mjs** - Exports `getHeadSha`, which gets head sha.
- **get-worktree-health-snapshot.mjs** - Exports `getWorktreeHealthSnapshot`, which gets worktree health snapshot.
- **index.mjs** - Facade module that re-exports public members from `./all-worktree-ids.mjs`, `./get-git-dirty-files.mjs`, `./get-current-branch.mjs`, `./get-head-sha.mjs`, `./get-worktree-health-snapshot.mjs`, `./get-fleet-inventory.mjs`, and 1 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logInfo`.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **write-fleet-health-file.mjs** - Exports `writeFleetHealthFile`, which writes fleet health file.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Discord integration, Symphony integration, and git/worktree awareness.

## 4. Usage Instructions

```bash
node ops/core/worktree-health/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`
- **Internal relative modules** - `../../lib/logger.mjs`, `../symphony-state.mjs`, `../worktree-config.mjs`, `./all-worktree-ids.mjs`, `./get-current-branch.mjs`, `./get-fleet-inventory.mjs`, `./get-git-dirty-files.mjs`, `./get-head-sha.mjs`, `./get-worktree-health-snapshot.mjs`, `./index.mjs`, `./logger.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
