# ANQR Queue Control

## 1. Directory Overview

This directory contains queue management automation for the ANQR (Agentic Number Query Runner)
harness. It provides intelligent queue control to maintain optimal throughput by automatically
feeding issues from backlog to todo, draining excess issues when overloaded, enforcing concurrency
limits, and recovering stuck work. The module acts as the orchestration layer that keeps the runner
queue healthy and balanced. It currently contains 16 files and 0 subdirectories.

## 2. File Summaries

### Files

- **actions.mjs** - Mutable array that accumulates all performed actions for summary reporting.
- **count-enabled-timers.mjs** - Counts enabled systemd user timers for anqr-symphony-runner@\*.timer using systemctl. Returns 0 on failure (no timers or systemctl unavailable).
- **detect-stuck-work.mjs** - Detects and recovers stale In Progress issues that exceed TASK_TIMEOUT_MS without active lease or recent heartbeat. Returns recovered issues to Todo, adds recovery comments, sets cooldown, records transitions, and supports dry-run mode.
- **drain-overflow.mjs** - Demotes excess Todo issues back to Backlog when ready depth exceeds TARGET_MAX. Prioritizes by priority (lower priority value = higher priority to keep), updates Linear state, adds explanatory comments, records transitions, and supports dry-run mode.
- **enforce-max-concurrent.mjs** - Enforces MAX_CONCURRENT_AGENTS limit by demoting excess In Progress issues to Todo. Skips issues with active leases or recently updated (within RECOVERY_GRACE_MS), adds recovery comments, records transitions, and supports dry-run mode.
- **feed-queue.mjs** - Promotes backlog issues to Todo when ready depth falls below TARGET_MIN. Filters for automatable issues, sorts by priority, and marks Discord-sourced issues for routing. Updates Linear state, records transitions in symphony-state, and supports dry-run mode.
- **get-queue-snapshot.mjs** - Fetches current queue state by querying Linear for backlog (feed source), todo (ready states), and in progress (active states) issues. Filters for automatable and executable issues using canFeedIssue, canExecuteIssue, and leaseIsActive predicates.
- **index.mjs** - Generated facade index exporting all public API members: actions, logAction, issueAge, minutesAgo, getQueueSnapshot, countEnabledTimers, validateConcurrencyConfig, printQueueHealth, feedQueue, drainOverflow, enforceMaxConcurrent, detectStuckWork, main.
- **issue-age.mjs** - Simple utility that calculates issue age in milliseconds by subtracting the issue's field timestamp from current time.
- **log-action.mjs** - Action logger that stores actions in the actions array and logs with icons: feed (📥, promotes), drain (📤, demotes), stale (⏰, timeout), info (ℹ️), concurrent (🔒, limit), recover (🩹, stuck), skip (⏭️, skipped).
- **logger.mjs** - Shared logger module using createLogger from lib/logger.mjs. Exports logInfo and logError functions.
- **main.mjs** - Main orchestration module with CLI interface. Supports --check (print health), --feed, --drain, --enforce, --all (run all), --dry-run (simulate without changes). Prints summary of actions taken.
- **minutes-ago.mjs** - Converts issue age to minutes by dividing milliseconds by 60,000 using issueAge function.
- **print-queue-health.mjs** - Prints formatted queue health snapshot showing backlog, todo, inProgress counts (automatable vs total), queue depth, and target configuration. Calls validateConcurrencyConfig.
- **runtime.mjs** - Generated runtime carry-forward that imports main from index and executes it when run directly. Handles errors and exits with code 1 on fatal error.
- **validate-concurrency-config.mjs** - Validates that enabled timer count doesn't exceed MAX_CONCURRENT_AGENTS. Logs warnings if mismatch detected, useful for detecting misconfigured deployments.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-queue-control/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
