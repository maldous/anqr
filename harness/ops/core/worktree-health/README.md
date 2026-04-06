# ANQR Worktree Health

## 1. Directory Overview

This directory contains worktree health monitoring and recovery logic for the ANQR (Agentic Number
Query Runner) harness system. It provides capabilities to inspect, classify, and report on the
health status of git worktrees used in the Symphony orchestration workflow. The module enables
automatic detection of stuck, dirty, quarantined, and available worktrees to support queue
management and worktree recovery operations. It currently contains 10 files and 0 subdirectories.

## 2. File Summaries

### Files

- **all-worktree-ids.mjs** - Exports ALL_WORKTREE_IDS combining SYMPHONY_WORKTREE_IDS (excluding "main") and DISCORD_WORKTREE_IDS. Provides the canonical list of all worktrees to monitor.
- **get-current-branch.mjs** - Exports getCurrentBranch function that runs `git rev-parse --abbrev-ref HEAD` to get the current branch name. Returns "unknown" on error.
- **get-fleet-inventory.mjs** - Exports getFleetInventory function that iterates over all worktrees and builds a fleet inventory with health snapshots. Returns an object containing the worktrees array, a summary object (available, executing, dirty, quarantined, blocked, missing counts), and a timestamp.
- **get-git-dirty-files.mjs** - Exports getGitDirtyFiles function that runs `git status --porcelain` in a worktree directory and returns an array of dirty file paths. Handles errors gracefully by returning an empty array.
- **get-head-sha.mjs** - Exports getHeadSha function that runs `git rev-parse HEAD` to get the current HEAD commit SHA. Returns "unknown" on error.
- **get-worktree-health-snapshot.mjs** - Exports getWorktreeHealthSnapshot function that generates a comprehensive health snapshot for a single worktree including path existence, git status (dirty files, branch, HEAD SHA), lease state, finalization state, and classification. Classification logic determines if worktree is: available, executing, dirty_owned, dirty_orphaned, quarantined, blocked, or missing.
- **index.mjs** - Generated facade index that re-exports all public functions: ALL_WORKTREE_IDS, getGitDirtyFiles, getCurrentBranch, getHeadSha, getWorktreeHealthSnapshot, getFleetInventory, writeFleetHealthFile.
- **logger.mjs** - Shared logger for this module's extracted members. Imports and re-exports logInfo from the centralized logger.
- **runtime.mjs** - Generated runtime carry-forward providing CLI interface. Supports three commands: `snapshot <worktreeId>` (outputs health snapshot for a worktree), `inventory` (outputs fleet inventory), and `write [path]` (writes fleet health file).
- **write-fleet-health-file.mjs** - Exports writeFleetHealthFile function that writes fleet health report to a JSON file. Combines fleet inventory with state store data from symphony-state. Defaults to `reports/symphony/fleet-health.json` if no path provided.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/core/worktree-health/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
