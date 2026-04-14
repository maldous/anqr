# Select Linear Worktree

## Purpose
Worktree-selection helper that chooses a healthy Linear executor slot for non-authoritative or fallback transport decisions based on health and current in-process load.

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
- Current on-disk inventory: 3 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
