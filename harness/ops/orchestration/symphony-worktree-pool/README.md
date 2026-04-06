# ANQR Symphony Worktree Pool

## 1. Directory Overview

This directory contains the worktree pool management system for the ANQR (Agentic Number Query
Runner) Symphony orchestration system. It provides utilities to create, manage, repair, and clean up
git worktrees that serve as isolated execution environments for concurrent issue processing. The
worktree pool enables parallel execution of multiple Symphony agents without interfering with each
other's file states. It currently contains 21 files and 0 subdirectories.

## 2. File Summaries

### Files

- **cleanup-worktree-pool.d.ts** - Module that supports cleanup worktree pool.d. Exports `cleanupWorktreePool`.
- **cleanup-worktree-pool.mjs** - Removes all Symphony-managed worktrees and prunes stale worktree metadata via `git worktree prune`. Logs failures per worktree but continues cleanup.
- **create-worktree.d.ts** - Module that creates or builds worktree.d. Exports `createWorktree`.
- **create-worktree.mjs** - Creates a new Symphony worktree with a unique branch based on `origin/main`. Handles corrupted worktrees by detecting unregistered paths and cleaning them up before recreation. Installs dependencies via `npm install` and sets upstream tracking branch.
- **get-symphony-worktrees.d.ts** - Module that retrieves symphony worktrees.d. Exports `getSymphonyWorktrees`.
- **get-symphony-worktrees.mjs** - Filters all worktrees to only those managed by Symphony using the `WORKTREE_PREFIX` and `WORKTREE_BRANCH_PREFIX` patterns from worktree-config. Extracts worktree IDs from paths.
- **index.d.ts** - Module that supports index.d. Exports `createWorktree, removeWorktree, listWorktrees, getSymphonyWorktrees, initWorktreePool, cleanupWorktreePool, repairWorktrees, printWorktreeStatus`.
- **index.mjs** - Generated facade index exporting all public API members: `createWorktree`, `removeWorktree`, `listWorktrees`, `getSymphonyWorktrees`, `initWorktreePool`, `cleanupWorktreePool`, `reprovisionWorktree`, `repairWorktrees`, `printWorktreeStatus`.
- **init-worktree-pool.d.ts** - Module that supports init worktree pool.d. Exports `initWorktreePool`.
- **init-worktree-pool.mjs** - Initializes a pool of worktrees with a specified count. Performs disk space validation before creation (requires ~250MB per worktree). Returns array of created worktrees with IDs and paths.
- **list-worktrees.d.ts** - Module that lists worktrees.d. Exports `listWorktrees`.
- **list-worktrees.mjs** - Lists all git worktrees using `git worktree list --porcelain`. Parses output to return structured objects with path, branch, HEAD, and prunable status.
- **logger.mjs** - Shared logger module using the centralized logger from `../../lib/logger.mjs`. Exports `logInfo`, `logWarn`, `logError`, and `logDebug`.
- **print-worktree-status.d.ts** - Module that supports print worktree status.d. Exports `printWorktreeStatus`.
- **print-worktree-status.mjs** - Prints human-readable status showing total worktrees and Symphony worktrees with their IDs, paths, branches, HEAD commits, and prunable status.
- **remove-worktree.d.ts** - Module that supports remove worktree.d. Exports `removeWorktree`.
- **remove-worktree.mjs** - Removes a worktree by path and attempts to delete its branch. Uses `git worktree remove --force` to handle both clean and corrupted states.
- **repair-worktrees.d.ts** - Module that supports repair worktrees.d. Exports `repairWorktrees`.
- **repair-worktrees.mjs** - Runs `git worktree repair` to fix common worktree issues. Identifies and reports any prunable worktrees that may need manual attention.
- **reprovision-worktree.mjs** - Reprovisions a single worktree by first removing it, then recreating from fresh `origin/main`. Uses `git worktree prune` between removal and recreation.
- **runtime.mjs** - CLI entry point with command routing. Supports commands: `init [count]`, `cleanup`, `list`, `status`, `repair`. Default worktree count is 2.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-worktree-pool/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
