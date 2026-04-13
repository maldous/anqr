# Worktree Config

## Purpose
Directory for Discord ingress, delivery, or notification support; immediate files include `dirname.mjs`, `discord-worktree-ids.mjs`, `get-worktree-branch.mjs`, `get-worktree-path.mjs`, and others.

## Contents
- 11 immediate files
- 0 child directories

## Key Files
- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `discord-worktree-ids.mjs` - Exports `DISCORD_WORKTREE_IDS`, a shared constant or state value used by sibling modules.
- `get-worktree-branch.mjs` - Exports `getWorktreeBranch`, the main helper defined in this file.
- `get-worktree-path.mjs` - Exports `getWorktreePath`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-discord-worktree.mjs` - Exports `isDiscordWorktree`, the main helper defined in this file.
- `is-symphony-worktree.mjs` - Exports `isSymphonyWorktree`, the main helper defined in this file.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `symphony-worktree-ids.mjs` - Exports `SYMPHONY_WORKTREE_IDS`, a shared constant or state value used by sibling modules.
- `worktree-branch-prefix.mjs` - Exports `WORKTREE_BRANCH_PREFIX`, a shared constant or state value used by sibling modules.
- `worktree-prefix.mjs` - Exports `WORKTREE_PREFIX`, a shared constant or state value used by sibling modules.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 11 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
