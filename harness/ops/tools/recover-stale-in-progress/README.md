# Recover Stale In Progress

## 1. Directory Overview

This directory contains the recover-stale-in-progress automation tool for the ANQR (Agentic Number Query Runner) harness. The tool identifies and recovers Linear issues that are stuck in "In Progress" state but have become stale due to expired leases or timeouts, allowing them to be picked up by runners again.

## 2. File Summaries

### logger.mjs

Shared logger module that exports logging functions created from the central logger utility. Provides `logInfo`, `logWarn`, and `logError` functions for structured logging within this tool.

### issue-age.mjs

Utility function that calculates the age of an issue in milliseconds. Takes an issue object and a field name (typically "updatedAt"), returning the difference between the current time and the specified timestamp.

### minutes-ago.mjs

Utility function that converts issue age from milliseconds to minutes. Imports `issueAge` from the sibling module and divides by 60,000 to return the age in whole minutes.

### main.mjs

Main orchestration module that implements the recovery logic. Imports queue control functions from symphony-state, Linear client functions, and local utilities. Supports `--dry-run` and `--force` flags. The main function:

1. Gets current queue snapshot and identifies all "In Progress" issues
2. For each active issue, checks if it has an active lease, recent heartbeat, or is executable
3. Identifies stale issues (age > TASK_TIMEOUT_MS) that need recovery
4. Skips issues with active leases, recent heartbeats, or that are not executable
5. When forced, releases the lease, updates issue state to "Todo", adds a recovery comment, and records the transition

### runtime.mjs

Generated runtime carry-forward file that imports and executes the main function. Provides the CLI entry point for the tool.

### index.mjs

Generated facade index that re-exports all public API members: `issueAge`, `minutesAgo`, and `main`.

## 3. Overall Directory Function

This directory provides a self-contained recovery tool for handling stale "In Progress" issues in the ANQR harness. It works in conjunction with the queue control system (symphony-queue-control.mjs) and state management (symphony-state.mjs) to:

- Detect issues that have been in "In Progress" state beyond the task timeout threshold
- Identify issues without active leases or recent heartbeats (indicating abandoned execution)
- Safely recover these issues by releasing their leases and moving them back to "Todo" state
- Add recovery comments to issues for audit trail purposes

The tool prevents queue deadlocks by ensuring stuck issues can be requeued for execution by other runners.

## 4. Usage Instructions

### Basic Usage (Dry Run)

```bash
node ops/tools/recover-stale-in-progress/runtime.mjs
```

Runs in dry-run mode by default, showing what issues would be recovered without making changes.

### Force Recovery

```bash
node ops/tools/recover-stale-in-progress/runtime.mjs --force
```

Actually performs the recovery of stale issues. Requires `--force` flag to prevent accidental state changes.

### Dry Run with Force Flag Check

```bash
node ops/tools/recover-stale-in-progress/runtime.mjs --dry-run
```

Shows issues that would be recovered without making changes, useful for verification before actual recovery.

### Understanding Output

The tool reports for each active issue:
- **Age**: How long since last update (in minutes)
- **State**: Current Linear state
- **Lease active**: Whether the issue has an active execution lease
- **Recent heartbeat**: Whether a heartbeat was received within the recovery grace period
- **Stale**: Whether the issue exceeds the task timeout threshold
- **Old**: Whether the issue exceeds the stale threshold

Issues are skipped if they have active leases, recent heartbeats, or are not executable (human_only, retry_exhausted, blocked).

## 5. Dependencies

### Internal Dependencies

- **../../symphony-queue-control.mjs** - For `getQueueSnapshot` to retrieve current queue state
- **../../core/symphony-state.mjs** - For state management functions including `getIssueState`, `releaseLease`, `recordTransition`, `canExecuteIssue`, `leaseIsActive`, and timing constants
- **../../integrations/linear/linear-client.mjs** - For Linear API operations (`updateIssue`, `addComment`)
- **../../lib/logger.mjs** - For creating the shared logger

### External Services

- **Linear** - Issue tracking platform for reading issue state and performing updates

### Timing Constants (from symphony-config)

- **TASK_TIMEOUT_MS** - Threshold for marking an issue as stale (25 minutes)
- **STALE_THRESHOLD_MS** - Threshold for marking an issue as old (30 minutes)
- **RECOVERY_GRACE_MS** - Grace period for heartbeat detection (10 minutes)

## 6. Additional Comments

- **Safety Mechanisms**: The tool has multiple safety checks - it skips issues with active leases, recent heartbeats, and non-executable issues. Recovery requires the `--force` flag to prevent accidental modifications.

- **Dry-Run Default**: The tool runs in dry-run mode by default, displaying what would happen without making changes. This allows operators to verify the impact before committing.

- **Recovery Comment**: When recovering an issue, the tool adds a comment explaining the recovery reason, providing an audit trail in Linear.

- **State Transitions**: The tool records all transitions using `recordTransition` for tracking and debugging purposes.

- **Exit Codes**: The tool exits with code 1 if stale issues are found but `--force` is not provided, prompting the user to confirm recovery.