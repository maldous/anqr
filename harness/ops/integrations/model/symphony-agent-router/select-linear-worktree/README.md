# Select Linear Worktree

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `normalize-worktree-state.mjs`, `select-linear-worktree.mjs`.

## Contents
- 3 immediate files
- 0 child directories

## Key Files
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `normalize-worktree-state.mjs` - Exports `normalizeWorktreeState`, the main helper defined in this file.
- `select-linear-worktree.mjs` - Exports `selectLinearWorktree`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 3 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
