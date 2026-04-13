# Sync Worktree Before Validation

## Purpose
Directory for worktree execution and publish flow; immediate files include `git.mjs`, `index.mjs`, `sync-worktree-before-validation.mjs`.

## Contents
- 3 immediate files
- 0 child directories

## Key Files
- `git.mjs` - Exports `git`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `sync-worktree-before-validation.mjs` - Exports `syncWorktreeBeforeValidation`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 3 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether ownership, timing, and state transitions in this directory stay consistent with the harness concurrency and integration model.
