# ANQR Worktree Health

## 1. Directory Overview

This directory contains worktree health monitoring and recovery logic for the ANQR (Agentic Number Query Runner) harness system. It provides capabilities to inspect, classify, and report on the health status of git worktrees used in the Symphony orchestration workflow. The module enables automatic detection of stuck, dirty, quarantined, and available worktrees to support queue management and worktree recovery operations.

## 2. File Summaries

### Core Utilities

- **logger.mjs** - Shared logger for this module's extracted members. Imports and re-exports logInfo from the centralized logger.

- **all-worktree-ids.mjs** - Exports ALL_WORKTREE_IDS combining SYMPHONY_WORKTREE_IDS (excluding "main") and DISCORD_WORKTREE_IDS. Provides the canonical list of all worktrees to monitor.

- **get-git-dirty-files.mjs** - Exports getGitDirtyFiles function that runs `git status --porcelain` in a worktree directory and returns an array of dirty file paths. Handles errors gracefully by returning an empty array.

- **get-current-branch.mjs** - Exports getCurrentBranch function that runs `git rev-parse --abbrev-ref HEAD` to get the current branch name. Returns "unknown" on error.

- **get-head-sha.mjs** - Exports getHeadSha function that runs `git rev-parse HEAD` to get the current HEAD commit SHA. Returns "unknown" on error.

### Fleet Management

- **get-fleet-inventory.mjs** - Exports getFleetInventory function that iterates over all worktrees and builds a fleet inventory with health snapshots. Returns an object containing the worktrees array, a summary object (available, executing, dirty, quarantined, blocked, missing counts), and a timestamp.

- **get-worktree-health-snapshot.mjs** - Exports getWorktreeHealthSnapshot function that generates a comprehensive health snapshot for a single worktree including path existence, git status (dirty files, branch, HEAD SHA), lease state, finalization state, and classification. Classification logic determines if worktree is: available, executing, dirty_owned, dirty_orphaned, quarantined, blocked, or missing.

### Output & Runtime

- **write-fleet-health-file.mjs** - Exports writeFleetHealthFile function that writes fleet health report to a JSON file. Combines fleet inventory with state store data from symphony-state. Defaults to `reports/symphony/fleet-health.json` if no path provided.

- **runtime.mjs** - Generated runtime carry-forward providing CLI interface. Supports three commands: `snapshot <worktreeId>` (outputs health snapshot for a worktree), `inventory` (outputs fleet inventory), and `write [path]` (writes fleet health file).

### Facade

- **index.mjs** - Generated facade index that re-exports all public functions: ALL_WORKTREE_IDS, getGitDirtyFiles, getCurrentBranch, getHeadSha, getWorktreeHealthSnapshot, getFleetInventory, writeFleetHealthFile.

## 3. Overall Directory Function

This directory serves as the health monitoring layer for the ANQR worktree fleet. The files work together to provide:

- **Health Snapshot Generation**: getWorktreeHealthSnapshot gathers comprehensive information about each worktree including git state, lease status, and finalization state to determine its health classification.

- **Fleet Inventory**: getFleetInventory iterates across all worktrees and produces a summary of fleet status used by orchestration scripts to make scheduling decisions.

- **Classification Logic**: Worktrees are classified as available (ready for work), executing (has active lease), dirty_owned (has repairable issues), dirty_orphaned (has non-repairable issues), quarantined (explicitly blocked), blocked (state set to blocked), or missing (directory doesn't exist).

- **Reporting**: writeFleetHealthFile produces JSON reports combining inventory and state data for external monitoring and debugging.

## 4. Usage Instructions

This directory is primarily imported by other harness modules rather than being run directly. Key usage patterns:

- Import health snapshot function:

```javascript
import { getWorktreeHealthSnapshot } from "./worktree-health.mjs";
const snapshot = getWorktreeHealthSnapshot("wt1");
```

- Import fleet inventory:

```javascript
import { getFleetInventory } from "./worktree-health.mjs";
const { worktrees, summary } = getFleetInventory();
```

- Run as CLI for debugging:

```bash
node ops/core/worktree-health/runtime.mjs snapshot wt1
node ops/core/worktree-health/runtime.mjs inventory
node ops/core/worktree-health/runtime.mjs write ./reports/fleet-health.json
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **Git** - Required for git commands (status, rev-parse)

### Internal Dependencies

- **../../lib/logger.mjs** - For logging functionality
- **../worktree-config.mjs** - For getWorktreePath, SYMPHONY_WORKTREE_IDS, DISCORD_WORKTREE_IDS
- **../symphony-state.mjs** - For getWorktreeState, loadState, leaseIsActive, getFinalizationState, getFleetSnapshot

## 6. Additional Comments

- **Classification Priority**: The classification logic follows a specific priority order: missing first, then quarantined, then executing (has active lease), then dirty_owned (dirty + repairable), then dirty_orphaned (dirty + not repairable), then blocked, then available.

- **Repairable States**: Worktrees with finalization states of validation_failed_repairable, commit_failed_repairable, branch_push_failed_repairable, or integration_failed_repairable are considered repairable.

- **Lease Tracking**: The snapshot checks for active leases by examining the symphony-state store for issues with leases that reference the worktree ID. This enables detection of worktrees currently executing issues.

- **Dirty File Detection**: Uses `git status --porcelain` for reliable detection of modified, added, and deleted files across different platforms and git configurations.

- **CLI Runtime**: The runtime.mjs file provides standalone CLI access for debugging and manual inspection of worktree health without requiring module imports.
