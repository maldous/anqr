# ANQR Worktree Recovery

## 1. Directory Overview

This directory contains worktree recovery automation for the ANQR (Agentic Number Query Runner)
Symphony orchestration system. It provides health monitoring, classification, repair, and recovery
capabilities for worktrees in the fleet. The module detects stale leases, orphaned worktrees, push
failures, and other error states, then executes appropriate repair actions or quarantines worktrees
that cannot be recovered. It currently contains 17 files and 0 subdirectories.

## 2. File Summaries

### Files

- **all-worktree-ids.mjs** - Exports ALL_WORKTREE_IDS combining Symphony and Discord worktree IDs.
- **attempt-cspell-auto-fix.mjs** - Parses unknown words from cspell output, adds them to dictionary, commits and pushes changes, and propagates fixes to clean worktrees.
- **check-baseline-health.mjs** - Runs cspell baseline check on main repo to ensure dictionary is healthy. Attempts auto-fix if cspell fails.
- **check-quarantined-for-reprovisioning.mjs** - Checks quarantined worktrees for reprovisioning eligibility and triggers reprovisioning if repair attempts exceed threshold.
- **classify-worktree.mjs** - Classifies worktree health state by analyzing lease state, finalization state, dirty files, and ownership. Returns classification (clean, executing, stale_lease, dirty_owned, dirty_orphaned, half_committed, conflicted, missing) and recommended repair action.
- **execute-repair.mjs** - Executes repair actions based on classification: skip, reclaim_lease, continue_repair, retry_push, quarantine, reprovision. Uses symphony-state and symphony-config for configuration and state management.
- **has-conflict-markers.mjs** - Checks dirty files for git conflict markers (<<<<<<<, >>>>>>>) to detect merge conflicts.
- **index.mjs** - Facade exporting all public API members.
- **infer-owner-from-branch.mjs** - Infers issue owner from git branch by checking recent commit messages for ANQ-NNN patterns and consulting state store for worktree assignments.
- **logger.mjs** - Shared logging utilities using lib/logger.
- **main-repo-root.mjs** - Resolves main repository root path (parent of parent of parent of parent of this file).
- **parse-cspell-unknown-words.mjs** - Parses unknown word patterns from cspell output using regex matching.
- **propagate-baseline-fix-to-clean-worktrees.mjs** - Fast-forwards clean worktrees to include baseline fixes from main repo.
- **run-daemon.mjs** - Daemon mode that runs recovery cycles continuously at poll intervals. Handles SIGTERM/SIGINT shutdown, runs baseline health checks periodically, and checks quarantined worktrees for reprovisioning eligibility.
- **run-recovery-cycle.mjs** - Main orchestration for a single recovery cycle. Iterates through all worktrees, classifies each, executes repairs, and writes fleet health file. Returns statistics (scanned, repaired, quarantined, skipped, errors).
- **runtime.mjs** - Runtime entry point supporting `once`, `daemon`, and `status` modes.
- **show-status.mjs** - Displays current fleet health status including worktree classifications, repair actions, and confidence levels.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `runtime.mjs` provides a direct execution
path. The README content below is aligned to the current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-worktree-recovery/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
