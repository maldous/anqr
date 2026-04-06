# Worktree Configuration

## 1. Directory Overview

This directory contains shared worktree configuration constants and utilities for the ANQR (Agentic Number Query Runner) harness. It provides centralized worktree path and branch resolution, worktree ID management for Symphony and Discord runners, and helper functions to identify worktree types.

## 2. File Summaries

### Constant Files

- **worktree-prefix.mjs** - Exports `WORKTREE_PREFIX = "anqr-wt"`. Defines the prefix used for worktree directory names.

- **worktree-branch-prefix.mjs** - Exports `WORKTREE_BRANCH_PREFIX = "symphony/wt"`. Defines the prefix used for git branch names in worktrees.

- **symphony-worktree-ids.mjs** - Exports `SYMPHONY_WORKTREE_IDS = ["main", "1", "2", "3", "4"]`. Defines the list of worktree IDs assigned to Symphony execution (including main branch).

- **discord-worktree-ids.mjs** - Exports `DISCORD_WORKTREE_IDS = ["5", "6", "7", "8"]`. Defines the list of worktree IDs assigned to Discord integration.

- **project-root.mjs** - Exports `PROJECT_ROOT` resolved to 4 levels up from the current module's directory. Used as the base path for calculating worktree paths.

- **dirname.mjs** - Exports `__dirname` using `node:path` and `node:url` utilities for ESM compatibility. Required for proper path resolution in ESM modules.

### Utility Functions

- **get-worktree-path.mjs** - Exports `getWorktreePath(id)` function that resolves the full filesystem path for a worktree given its ID. Throws an error if ID is not provided.

- **get-worktree-branch.mjs** - Exports `getWorktreeBranch(id)` function that returns the git branch name for a worktree given its ID. Throws an error if ID is not provided.

- **is-symphony-worktree.mjs** - Exports `isSymphonyWorktree(worktreeId)` function that checks if a given worktree ID belongs to the Symphony worktree pool. Normalizes IDs by stripping optional "wt" prefix.

- **is-discord-worktree.mjs** - Exports `isDiscordWorktree(worktreeId)` function that checks if a given worktree ID belongs to the Discord worktree pool. Normalizes IDs by stripping optional "wt" prefix.

### Index/Facade

- **index.mjs** - Generated facade index that re-exports all symbols from the other modules for convenient single-point importing. Includes all constants and utility functions.

## 3. Overall Directory Function

This directory serves as the single source of truth for worktree configuration across the ANQR harness. The files work together to provide:

- **Worktree ID Management**: Separates worktrees into Symphony pool (main, 1-4) and Discord pool (5-8) for isolated execution environments
- **Path Resolution**: Calculates filesystem paths to worktree directories relative to project root
- **Branch Resolution**: Determines git branch names for worktrees based on ID
- **Type Detection**: Provides runtime utilities to identify which pool a worktree belongs to

This configuration is imported by orchestration scripts in `ops/orchestration/` to route issues to appropriate worktrees and manage concurrent execution.

## 4. Usage Instructions

Import worktree configuration utilities:

```javascript
import {
  SYMPHONY_WORKTREE_IDS,
  DISCORD_WORKTREE_IDS,
  getWorktreePath,
  getWorktreeBranch,
  isSymphonyWorktree,
  isDiscordWorktree,
  WORKTREE_PREFIX,
  WORKTREE_BRANCH_PREFIX,
  PROJECT_ROOT,
} from "./ops/core/worktree-config/index.mjs";
```

Example usage:

```javascript
// Get path to Symphony worktree #2
const path = getWorktreePath("2");
// Returns: /path/to/anqr-wt2

// Get branch name for Discord worktree #5
const branch = getWorktreeBranch("5");
// Returns: "symphony/wt5"

// Check if worktree is for Symphony
const isSymphony = isSymphonyWorktree("wt1");
// Returns: true
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **node:path** - For path resolution
- **node:url** - For ESM directory resolution

### Internal Dependencies

- No external harness dependencies - this module is self-contained

### Configuration Dependencies

- **PROJECT_ROOT** - Automatically resolved relative to module location (4 directories up from this module)

## 6. Additional Comments

- **Worktree ID Normalization**: The `isSymphonyWorktree` and `isDiscordWorktree` functions normalize input by stripping optional "wt" prefix, accepting both "1" and "wt1" as valid identifiers

- **Branch Naming Convention**: Worktree branches follow the pattern `symphony/wt{id}` (e.g., symphony/wt1, symphony/wt5)

- **Directory Naming Convention**: Worktree directories follow the pattern `anqr-wt{id}` (e.g., anqr-wt1, anqr-wt5) located at sibling level to the main project

- **Pool Isolation**: Symphony and Discord worktrees are intentionally kept in separate ID pools (1-4 vs 5-8) to prevent resource contention and enable independent scaling
