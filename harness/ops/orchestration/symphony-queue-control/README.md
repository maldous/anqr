# ANQR Queue Control

## 1. Directory Overview

This directory contains queue management automation for the ANQR (Agentic Number Query Runner) harness. It provides intelligent queue control to maintain optimal throughput by automatically feeding issues from backlog to todo, draining excess issues when overloaded, enforcing concurrency limits, and recovering stuck work. The module acts as the orchestration layer that keeps the runner queue healthy and balanced.

## 2. File Summaries

### Core Queue Management

- **feed-queue.mjs** - Promotes backlog issues to Todo when ready depth falls below TARGET_MIN. Filters for automatable issues, sorts by priority, and marks Discord-sourced issues for routing. Updates Linear state, records transitions in symphony-state, and supports dry-run mode.

- **drain-overflow.mjs** - Demotes excess Todo issues back to Backlog when ready depth exceeds TARGET_MAX. Prioritizes by priority (lower priority value = higher priority to keep), updates Linear state, adds explanatory comments, records transitions, and supports dry-run mode.

- **enforce-max-concurrent.mjs** - Enforces MAX_CONCURRENT_AGENTS limit by demoting excess In Progress issues to Todo. Skips issues with active leases or recently updated (within RECOVERY_GRACE_MS), adds recovery comments, records transitions, and supports dry-run mode.

- **detect-stuck-work.mjs** - Detects and recovers stale In Progress issues that exceed TASK_TIMEOUT_MS without active lease or recent heartbeat. Returns recovered issues to Todo, adds recovery comments, sets cooldown, records transitions, and supports dry-run mode.

### Utilities and Helpers

- **get-queue-snapshot.mjs** - Fetches current queue state by querying Linear for backlog (feed source), todo (ready states), and in progress (active states) issues. Filters for automatable and executable issues using canFeedIssue, canExecuteIssue, and leaseIsActive predicates.

- **issue-age.mjs** - Simple utility that calculates issue age in milliseconds by subtracting the issue's field timestamp from current time.

- **minutes-ago.mjs** - Converts issue age to minutes by dividing milliseconds by 60,000 using issueAge function.

- **count-enabled-timers.mjs** - Counts enabled systemd user timers for anqr-symphony-runner@*.timer using systemctl. Returns 0 on failure (no timers or systemctl unavailable).

- **validate-concurrency-config.mjs** - Validates that enabled timer count doesn't exceed MAX_CONCURRENT_AGENTS. Logs warnings if mismatch detected, useful for detecting misconfigured deployments.

- **print-queue-health.mjs** - Prints formatted queue health snapshot showing backlog, todo, inProgress counts (automatable vs total), queue depth, and target configuration. Calls validateConcurrencyConfig.

### Logging and Actions

- **logger.mjs** - Shared logger module using createLogger from lib/logger.mjs. Exports logInfo and logError functions.

- **log-action.mjs** - Action logger that stores actions in the actions array and logs with icons: feed (📥, promotes), drain (📤, demotes), stale (⏰, timeout), info (ℹ️), concurrent (🔒, limit), recover (🩹, stuck), skip (⏭️, skipped).

- **actions.mjs** - Mutable array that accumulates all performed actions for summary reporting.

### Entry Points

- **main.mjs** - Main orchestration module with CLI interface. Supports --check (print health), --feed, --drain, --enforce, --all (run all), --dry-run (simulate without changes). Prints summary of actions taken.

- **index.mjs** - Generated facade index exporting all public API members: actions, logAction, issueAge, minutesAgo, getQueueSnapshot, countEnabledTimers, validateConcurrencyConfig, printQueueHealth, feedQueue, drainOverflow, enforceMaxConcurrent, detectStuckWork, main.

- **runtime.mjs** - Generated runtime carry-forward that imports main from index and executes it when run directly. Handles errors and exits with code 1 on fatal error.

## 3. Overall Directory Function

This directory serves as the queue health management layer of the ANQR harness. The files work together to maintain optimal runner throughput through continuous balancing:

**Queue Feeding Pipeline**: When todo count drops below TARGET_MIN, feed-queue.mjs promotes high-priority backlog issues to todo, ensuring runners always have work available.

**Queue Draining Pipeline**: When todo count exceeds TARGET_MAX, drain-overflow.mjs demotes lower-priority issues back to backlog, preventing queue saturation.

**Concurrency Enforcement**: enforce-max-concurrent.mjs ensures no more than MAX_CONCURRENT_AGENTS issues are in progress simultaneously by demoting excess issues (with active lease or recent updates protected).

**Stuck Work Recovery**: detect-stuck-work.mjs monitors for stale in-progress issues that have exceeded TASK_TIMEOUT_MS without heartbeat, recovering them to todo for re-execution.

The main.mjs orchestrates all these functions via CLI flags, enabling both manual runs and automated scheduled execution via systemd timers.

## 4. Usage Instructions

### Running Queue Control

```bash
# Via facade (recommended)
node ops/orchestration/symphony-queue-control.mjs --all
```

Or directly:

```bash
node ops/orchestration/symphony-queue-control/runtime.mjs --all
```

### Available Flags

- `--check` - Print queue health snapshot without making changes
- `--feed` - Feed queue (promote backlog to todo)
- `--drain` - Drain queue (demote excess todo to backlog)
- `--enforce` - Enforce max concurrent and detect stuck work
- `--all` - Run all operations (check, feed, drain, enforce)
- `--dry-run` - Simulate operations without making actual changes

### Common Usage Patterns

```bash
# Check queue health
node ops/orchestration/symphony-queue-control.mjs --check

# Feed queue only
node ops/orchestration/symphony-queue-control.mjs --feed

# Full health check and balance (dry run)
node ops/orchestration/symphony-queue-control.mjs --all --dry-run
```

### Scheduling

Queue control is typically run on a schedule via systemd user timers. The validate-concurrency-config.mjs helps verify timer count matches MAX_CONCURRENT_AGENTS.

## 5. Dependencies

### Internal Dependencies

- **../../symphony-config.mjs** - Provides TARGET_MIN, TARGET_MAX, MAX_CONCURRENT_AGENTS, QUEUE_STATES, RECOVERY_GRACE_MS, TASK_TIMEOUT_MS, STALE_THRESHOLD_MS
- **../../linear-client.mjs** - Linear API client (listIssuesByState, updateIssue, addComment, STATES)
- **../../symphony-state.mjs** - State management (getIssueState, canExecuteIssue, canFeedIssue, leaseIsActive, releaseLease, recordTransition, setCooldown)
- **../../core/discord-source.mjs** - Discord source detection (isDiscordSourced, markDiscordSource)
- **../../lib/logger.mjs** - Logger factory (createLogger)

### External Services

- **Linear** - Issue tracking and state management
- **systemd** - Timer management (for count-enabled-timers.mjs)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials in environment
- Linear issues with proper state labels (Backlog, Todo, In Progress)

## 6. Additional Comments

- **Feed vs Drain Logic**: Both feed-queue and drain-overflow operate on Todo (runnable) count, not In Progress. This is because runners pick work from Todo, so that's what matters for keeping runners busy.

- **Lease Protection**: enforce-max-concurrent and detect-stuck-work skip issues with active leases (leaseIsActive returns true) to avoid disrupting running agents. This prevents recovery of issues that are actively being worked on.

- **Heartbeat Grace Period**: detect-stuck-work also skips issues with recent heartbeat (within RECOVERY_GRACE_MS) to handle edge cases where lease just barely expired but runner is still alive.

- **Priority Inversion**: feed-queue promotes lower priority number first (higher priority), while drain-overflow keeps lower priority number first (higher priority stays). This ensures high-priority work is protected during both feeding and draining.

- **Discord Source Tracking**: feed-queue marks Discord-sourced issues in symphony-state for downstream worktree routing decisions.

- **Dry-Run Essential**: Always use --dry-run first to see what actions would be taken before running against production Linear workspace.