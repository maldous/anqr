# ANQR Symphony Worktree Pool

## 1. Directory Overview

This directory contains the worktree pool management system for the ANQR (Agentic Number Query Runner) Symphony orchestration system. It provides utilities to create, manage, repair, and clean up git worktrees that serve as isolated execution environments for concurrent issue processing. The worktree pool enables parallel execution of multiple Symphony agents without interfering with each other's file states.

## 2. File Summaries

### Core Worktree Management

- **create-worktree.mjs** - Creates a new Symphony worktree with a unique branch based on `origin/main`. Handles corrupted worktrees by detecting unregistered paths and cleaning them up before recreation. Installs dependencies via `npm install` and sets upstream tracking branch.

- **remove-worktree.mjs** - Removes a worktree by path and attempts to delete its branch. Uses `git worktree remove --force` to handle both clean and corrupted states.

- **list-worktrees.mjs** - Lists all git worktrees using `git worktree list --porcelain`. Parses output to return structured objects with path, branch, HEAD, and prunable status.

- **get-symphony-worktrees.mjs** - Filters all worktrees to only those managed by Symphony using the `WORKTREE_PREFIX` and `WORKTREE_BRANCH_PREFIX` patterns from worktree-config. Extracts worktree IDs from paths.

### Pool Operations

- **init-worktree-pool.mjs** - Initializes a pool of worktrees with a specified count. Performs disk space validation before creation (requires ~250MB per worktree). Returns array of created worktrees with IDs and paths.

- **cleanup-worktree-pool.mjs** - Removes all Symphony-managed worktrees and prunes stale worktree metadata via `git worktree prune`. Logs failures per worktree but continues cleanup.

- **reprovision-worktree.mjs** - Reprovisions a single worktree by first removing it, then recreating from fresh `origin/main`. Uses `git worktree prune` between removal and recreation.

- **repair-worktrees.mjs** - Runs `git worktree repair` to fix common worktree issues. Identifies and reports any prunable worktrees that may need manual attention.

### Utilities

- **print-worktree-status.mjs** - Prints human-readable status showing total worktrees and Symphony worktrees with their IDs, paths, branches, HEAD commits, and prunable status.

- **logger.mjs** - Shared logger module using the centralized logger from `../../lib/logger.mjs`. Exports `logInfo`, `logWarn`, `logError`, and `logDebug`.

### Facade and Runtime

- **index.mjs** - Generated facade index exporting all public API members: `createWorktree`, `removeWorktree`, `listWorktrees`, `getSymphonyWorktrees`, `initWorktreePool`, `cleanupWorktreePool`, `reprovisionWorktree`, `repairWorktrees`, `printWorktreeStatus`.

- **runtime.mjs** - CLI entry point with command routing. Supports commands: `init [count]`, `cleanup`, `list`, `status`, `repair`. Default worktree count is 2.

### TypeScript Declarations

- **index.d.ts**, **create-worktree.d.ts**, **remove-worktree.d.ts**, **list-worktrees.d.ts**, **get-symphony-worktrees.d.ts**, **init-worktree-pool.d.ts**, **cleanup-worktree-pool.d.ts**, **reprovision-worktree.d.ts**, **repair-worktrees.d.ts**, **print-worktree-status.d.ts** - TypeScript type declarations for all modules.

## 3. Overall Directory Function

This directory provides the infrastructure for managing a pool of git worktrees that serve as isolated execution contexts for Symphony agent tasks. The worktree pool is essential for concurrent issue processing - each issue gets processed in its own worktree to avoid file state conflicts.

Key workflows:
- **Pool Initialization**: Creates N worktrees based on `origin/main` for parallel processing capacity
- **Issue Execution**: Worktrees are allocated to individual issues; each worktree has a dedicated branch
- **Pool Maintenance**: Repair handles corruption, cleanup removes all worktrees, reprovision handles individual worktree failures
- **Monitoring**: Status command provides visibility into worktree health and prunable states

The pool works with `worktree-config.mjs` to determine paths, branch prefixes, and naming conventions.

## 4. Usage Instructions

### CLI Commands

```bash
# Initialize pool with 2 worktrees (default)
node symphony-worktree-pool.mjs init

# Initialize with custom count
node symphony-worktree-pool.mjs init 4

# Remove all Symphony worktrees
node symphony-worktree-pool.mjs cleanup

# List all worktrees as JSON
node symphony-worktree-pool.mjs list

# Show human-readable status
node symphony-worktree-pool.mjs status

# Repair corrupted worktrees
node symphony-worktree-pool.mjs repair
```

### Programmatic Usage

```javascript
import {
  createWorktree,
  removeWorktree,
  listWorktrees,
  getSymphonyWorktrees,
  initWorktreePool,
  cleanupWorktreePool,
  reprovisionWorktree,
  repairWorktrees,
  printWorktreeStatus,
} from "./symphony-worktree-pool/index.mjs";

// Create a single worktree
const path = createWorktree(1);

// Initialize pool
const created = await initWorktreePool(3);

// Get all Symphony worktrees
const worktrees = getSymphonyWorktrees();

// Reprovision a failed worktree
await reprovisionWorktree(2);
```

## 5. Dependencies

### Internal Dependencies

- **../../core/worktree-config.mjs** - Provides `PROJECT_ROOT`, `WORKTREE_PREFIX`, `WORKTREE_BRANCH_PREFIX`, `getWorktreePath()`, `getWorktreeBranch()`
- **../../lib/logger.mjs** - Logger factory for shared logging

### Runtime Requirements

- **Node.js** - ESM modules with .mjs extension
- **Git** - CLI for worktree operations
- **npm** - For dependency installation in new worktrees

### Disk Space

- ~250MB per worktree (200MB base + 50MB overhead for node_modules)
- init-worktree-pool validates available space before creation

## 6. Additional Comments

- **Worktree Naming**: Worktrees follow pattern `{WORKTREE_PREFIX}{id}` (e.g., `symphony-wt-1`) with branches prefixed by `WORKTREE_BRANCH_PREFIX`

- **Fresh Base Ref**: Worktrees are created from `origin/main` (fetched fresh) rather than local `main` to avoid inheriting stale state

- **Upstream Tracking**: Created branches are pushed to origin with `-u` for future push operations

- **Corruption Handling**: create-worktree.mjs detects unregistered paths, removes them via `git worktree remove --force` or manual `rm`, then recreates

- **Graceful Degradation**: init-worktree-pool continues creating remaining worktrees if individual ones fail, returning count of successful creations

- **Prunable Detection**: repair-worktrees identifies prunable worktrees (incomplete/corrupted) for manual cleanup