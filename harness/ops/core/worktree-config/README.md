# Worktree Configuration

## 1. Directory Overview

This directory contains shared worktree configuration constants and utilities for the ANQR (Agentic
Number Query Runner) harness. It provides centralized worktree path and branch resolution, worktree
ID management for Symphony and Discord runners, and helper functions to identify worktree types. It
currently contains 11 files and 0 subdirectories.

## 2. File Summaries

### Files

- **dirname.mjs** - Exports `__dirname` using `node:path` and `node:url` utilities for ESM compatibility. Required for proper path resolution in ESM modules.
- **discord-worktree-ids.mjs** - Exports `DISCORD_WORKTREE_IDS = ["5", "6", "7", "8"]`. Defines the list of worktree IDs assigned to Discord integration.
- **get-worktree-branch.mjs** - Exports `getWorktreeBranch(id)` function that returns the git branch name for a worktree given its ID. Throws an error if ID is not provided.
- **get-worktree-path.mjs** - Exports `getWorktreePath(id)` function that resolves the full filesystem path for a worktree given its ID. Throws an error if ID is not provided.
- **index.mjs** - Generated facade index that re-exports all symbols from the other modules for convenient single-point importing. Includes all constants and utility functions.
- **is-discord-worktree.mjs** - Exports `isDiscordWorktree(worktreeId)` function that checks if a given worktree ID belongs to the Discord worktree pool. Normalizes IDs by stripping optional "wt" prefix.
- **is-symphony-worktree.mjs** - Exports `isSymphonyWorktree(worktreeId)` function that checks if a given worktree ID belongs to the Symphony worktree pool. Normalizes IDs by stripping optional "wt" prefix.
- **project-root.mjs** - Exports `PROJECT_ROOT` resolved to 4 levels up from the current module's directory. Used as the base path for calculating worktree paths.
- **symphony-worktree-ids.mjs** - Exports `SYMPHONY_WORKTREE_IDS = ["main", "1", "2", "3", "4"]`. Defines the list of worktree IDs assigned to Symphony execution (including main branch).
- **worktree-branch-prefix.mjs** - Exports `WORKTREE_BRANCH_PREFIX = "symphony/wt"`. Defines the prefix used for git branch names in worktrees.
- **worktree-prefix.mjs** - Exports `WORKTREE_PREFIX = "anqr-wt"`. Defines the prefix used for worktree directory names.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
