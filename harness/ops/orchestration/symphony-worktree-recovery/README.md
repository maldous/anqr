# ANQR Worktree Recovery

## 1. Directory Overview

This directory contains worktree recovery automation for the ANQR (Agentic Number Query Runner) Symphony orchestration system. It provides health monitoring, classification, repair, and recovery capabilities for worktrees in the fleet. The module detects stale leases, orphaned worktrees, push failures, and other error states, then executes appropriate repair actions or quarantines worktrees that cannot be recovered.

## 2. File Summaries

### Core Recovery Logic

- **classify-worktree.mjs** - Classifies worktree health state by analyzing lease state, finalization state, dirty files, and ownership. Returns classification (clean, executing, stale_lease, dirty_owned, dirty_orphaned, half_committed, conflicted, missing) and recommended repair action.

- **execute-repair.mjs** - Executes repair actions based on classification: skip, reclaim_lease, continue_repair, retry_push, quarantine, reprovision. Uses symphony-state and symphony-config for configuration and state management.

- **run-recovery-cycle.mjs** - Main orchestration for a single recovery cycle. Iterates through all worktrees, classifies each, executes repairs, and writes fleet health file. Returns statistics (scanned, repaired, quarantined, skipped, errors).

- **run-daemon.mjs** - Daemon mode that runs recovery cycles continuously at poll intervals. Handles SIGTERM/SIGINT shutdown, runs baseline health checks periodically, and checks quarantined worktrees for reprovisioning eligibility.

### Health and Status

- **check-baseline-health.mjs** - Runs cspell baseline check on main repo to ensure dictionary is healthy. Attempts auto-fix if cspell fails.

- **check-quarantined-for-reprovisioning.mjs** - Checks quarantined worktrees for reprovisioning eligibility and triggers reprovisioning if repair attempts exceed threshold.

- **show-status.mjs** - Displays current fleet health status including worktree classifications, repair actions, and confidence levels.



### Repair Utilities

- **infer-owner-from-branch.mjs** - Infers issue owner from git branch by checking recent commit messages for ANQ-NNN patterns and consulting state store for worktree assignments.

- **has-conflict-markers.mjs** - Checks dirty files for git conflict markers (<<<<<<<, >>>>>>>) to detect merge conflicts.

- **attempt-cspell-auto-fix.mjs** - Parses unknown words from cspell output, adds them to dictionary, commits and pushes changes, and propagates fixes to clean worktrees.

- **propagate-baseline-fix-to-clean-worktrees.mjs** - Fast-forwards clean worktrees to include baseline fixes from main repo.

- **parse-cspell-unknown-words.mjs** - Parses unknown word patterns from cspell output using regex matching.

### Configuration and Entry Points

- **all-worktree-ids.mjs** - Exports ALL_WORKTREE_IDS combining Symphony and Discord worktree IDs.

- **main-repo-root.mjs** - Resolves main repository root path (parent of parent of parent of parent of this file).

- **logger.mjs** - Shared logging utilities using lib/logger.

- **index.mjs** - Facade exporting all public API members.

- **runtime.mjs** - Runtime entry point supporting `once`, `daemon`, and `status` modes.

## 3. Overall Directory Function

This directory serves as the automated recovery layer for the ANQR worktree fleet. The workflow operates as follows: `runRecoveryCycle()` iterates through all worktrees, `classifyWorktree()` determines each worktree's health state and repair action, `executeRepair()` performs the appropriate action, and the daemon runs continuously to catch new issues.

The classification logic follows a priority order: active leases with recent heartbeats are skipped (executing), stale leases trigger lease reclamation, dirty files with no owner trigger repair or quarantine, half-committed states trigger push retry, and conflicting worktrees are quarantined. Recovery actions include skipping healthy worktrees, reclaiming stale leases, continuing interrupted repairs, retrying failed pushes, quarantining unrecoverable worktrees, and reprovisioning missing worktrees.

The daemon also performs periodic baseline health checks (cspell) and propagates fixes to clean worktrees, ensuring the fleet maintains a consistent baseline.

## 4. Usage Instructions

### Running Recovery

```bash
# Run a single recovery cycle
node symphony-worktree-recovery.mjs once

# Run in daemon mode (continuous recovery)
node symphony-worktree-recovery.mjs daemon

# Show current fleet status
node symphony-worktree-recovery.mjs status
```

### Daemon Mode

The daemon runs continuously, polling at intervals defined by `RECOVERY_POLL_INTERVAL_MS` from symphony-config. It performs baseline health checks every N cycles (defined by `RECOVERY_BASELINE_CHECK_INTERVAL_CYCLES`) and checks quarantined worktrees for reprovisioning eligibility after each cycle.

### Programmatic Usage

```javascript
import { runRecoveryCycle, runDaemon, classifyWorktree, showStatus } from "./symphony-worktree-recovery/index.mjs";

// Run a single cycle
const stats = await runRecoveryCycle();

// Run daemon
await runDaemon();

// Classify a worktree
const snapshot = getWorktreeHealthSnapshot(id);
const classification = classifyWorktree(snapshot);

// Show status
showStatus();
```

## 5. Dependencies

### Internal Dependencies

- **../../symphony-config.mjs** - Provides recovery configuration constants (RECOVERY_POLL_INTERVAL_MS, RECOVERY_MAX_REPAIR_ATTEMPTS, RECOVERY_QUARANTINE_THRESHOLD_MS, RECOVERY_STALE_LEASE_GRACE_MS, RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD)

- **../../symphony-state.mjs** - State management (getWorktreeState, setWorktreeState, recordQuarantine, releaseLease, leaseIsActive, getFinalizationState, setFinalizationState, enqueueIntegrationCandidate)

- **../../core/worktree-health.mjs** - Health monitoring (getWorktreeHealthSnapshot, getFleetInventory, writeFleetHealthFile)

- **../../core/worktree-config.mjs** - Worktree configuration (SYMPHONY_WORKTREE_IDS, DISCORD_WORKTREE_IDS, getWorktreePath, getWorktreeBranch)

- **../../lib/logger.mjs** - Logging utilities

- **../../core/symphony-validation.mjs** - Validation (runCspell)

### External Tools

- **git** - For git operations (log, push, merge, fetch, checkout)

- **cspell** - For spell checking and auto-fix

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid worktree directory structure
- Git repository with worktrees configured

## 6. Additional Comments

- **Classification Confidence**: The system assigns confidence levels (0.3-1.0) to classifications. Low-confidence orphan detection leads to quarantine rather than risky repair.

- **Stale Lease Handling**: Worktrees with stale leases (heartbeat older than RECOVERY_STALE_LEASE_GRACE_MS) are flagged for lease reclamation. If ownership confidence is high enough, the worktree is marked dirty_owned for runner pickup; otherwise it's quarantined.

- **Push Retry**: Failed branch pushes are retried with attempt tracking. After RECOVERY_MAX_REPAIR_ATTEMPTS, the worktree is quarantined.

- **Baseline Auto-Fix Safety**: The cspell auto-fix refuses to run if main repo has uncommitted changes, preventing work loss. It also limits auto-fix to 20 unknown words, requiring manual review for larger issues.

- **Conflict Detection**: Merge conflict markers in dirty files trigger immediate quarantine since conflicts require manual resolution.

- **Reprovisioning**: Quarantined worktrees that exceed repair attempt thresholds are eligible for reprovisioning (deletion and recreation) via the worktree pool.