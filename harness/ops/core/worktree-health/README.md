# Worktree Health

## Purpose
Directory for git worktree management and concurrency support; immediate files include `all-worktree-ids.mjs`, `get-current-branch.mjs`, `get-fleet-inventory.mjs`, `get-git-dirty-files.mjs`, and others.

## Contents
- 10 immediate files
- 0 child directories

## Key Files
- `all-worktree-ids.mjs` - Exports `ALL_WORKTREE_IDS`, a shared constant or state value used by sibling modules.
- `get-current-branch.mjs` - Exports `getCurrentBranch`, the main helper defined in this file.
- `get-fleet-inventory.mjs` - Exports `getFleetInventory`, the main helper defined in this file.
- `get-git-dirty-files.mjs` - Exports `getGitDirtyFiles`, the main helper defined in this file.
- `get-head-sha.mjs` - Exports `getHeadSha`, the main helper defined in this file.
- `get-worktree-health-snapshot.mjs` - Exports `getWorktreeHealthSnapshot`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `write-fleet-health-file.mjs` - Exports `writeFleetHealthFile`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 10 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
