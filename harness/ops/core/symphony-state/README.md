# ANQR Symphony State

## 1. Directory Overview

This directory contains the core state management system for the ANQR (Agentic Number Query Runner)
Symphony orchestration. It provides persistent state tracking for issues, leases, worktrees, and the
integration queue. The module uses a centralized JSON state file with file-based locking to ensure
safe concurrent access from multiple worktree runners. It currently contains 62 files and 0
subdirectories.

## 2. File Summaries

### Files

- **acquire-integration-lock.mjs** - Acquires lock for integration processing (TTL-based).
- **acquire-lease.mjs** - Acquires an exclusive lease on an issue. Returns failure if lease already active.
- **acquire-state-lock.mjs** - File-based exclusive lock using O_EXCL. Automatically handles stale locks (dead processes or locks older than LOCK_STALE_MS).
- **add-external-key.mjs** - Adds external keys to an issue for tracking correlations (e.g., Linear issue ID).
- **calculate-exponential-backoff.mjs** - Computes backoff with exponential growth (base \* 2^retryCount) capped at maxMs, plus ±20% jitter.
- **can-execute-issue.mjs** - Checks if an issue can be executed (not human-only, not retry-exhausted, no cooldown, no active lease).
- **can-feed-issue.mjs** - Extends canExecuteIssue to exclude email-sourced issues.
- **check-latency-baseline.mjs** - Compares current average against baseline. Alerts if >50% increase.
- **clear-cooldown.mjs** - Removes cooldown, allowing issue to be retried.
- **clear-quarantine.mjs** - Resets worktree to available state.
- **default-lease-ms.mjs** - Default lease TTL (20 minutes). Configurable via ANQR_SYMPHONY_LEASE_MS.
- **dequeue-integration-candidate.mjs** - Removes issue from integration queue.
- **empty-store.mjs** - Returns the initial empty state structure with version, hostId, issues, worktreeStates, and global objects.
- **enqueue-integration-candidate.mjs** - Adds issue to integration queue (if not already present).
- **ensure-dir.mjs** - Creates state directory if it doesn't exist.
- **find-expired-leases.mjs** - Returns all issues with expired leases (for recovery processing).
- **get-finalization-state.mjs** - Retrieves finalization state for an issue.
- **get-fleet-snapshot.mjs** - Returns fleet-wide summary: available, executing, dirty, quarantined, blocked counts.
- **get-global-value.mjs** - Gets a global value with optional fallback.
- **get-issue-state.mjs** - Retrieves normalized state for a specific issue by identifier.
- **get-latency-metrics.mjs** - Calculates aggregate latency stats: count, average, median, p95, min, max.
- **get-lock-file.mjs** - Returns the lock file path (state.json.lock).
- **get-next-repairable-issue-for-worktree.mjs** - Finds next repairable issue for a worktree.
- **get-state-dir.mjs** - Returns state directory path. Uses ANQR_SYMPHONY_STATE_DIR env var or XDG_RUNTIME_DIR/anqr-symphony-state.
- **get-state-file.mjs** - Returns path to state.json.
- **get-worktree-state.mjs** - Retrieves state for a specific worktree.
- **heartbeat-lease.mjs** - Extends lease TTL by updating heartbeat_at and expires_at. Requires matching nonce.
- **history-limit.mjs** - Maximum transitions to keep (50). Configurable via ANQR_SYMPHONY_HISTORY_LIMIT.
- **host-id.mjs** - Current host identifier (hostname or ANQR_SYMPHONY_HOST_ID).
- **index.mjs** - Generated facade that re-exports all public functions and constants.
- **is-lock-process-alive.mjs** - Checks if a process ID is still alive using signal 0.
- **lease-is-active.mjs** - Checks if a lease is still valid based on expires_at timestamp.
- **list-integration-candidates.mjs** - Returns all integration candidates.
- **list-repairable-issues-for-worktree.mjs** - Lists all repairable issues for a worktree.
- **list-worktrees-by-state.mjs** - Lists all worktrees in a specific state.
- **load-state.mjs** - Loads the state.json file from disk, normalizing records and handling schema migrations. Returns an empty store if the file doesn't exist.
- **lock-max-retries.mjs** - Maximum lock acquire retries (100).
- **lock-retry-interval-ms.mjs** - Lock retry interval (50ms).
- **lock-stale-ms.mjs** - Stale lock threshold (60 seconds).
- **mark-issue-human-only.mjs** - Marks an issue as human-only (excluded from automatic execution).
- **mark-retry-exhausted.mjs** - Marks issue as permanently blocked after max retries. Clears lease and cooldown.
- **mutate-state.mjs** - Generic state mutation with automatic locking and persistence.
- **normalize-record.mjs** - Ensures consistent field types and defaults for issue records, including retry state, cooldown, lease, transitions, and finalization objects.
- **note-attempt-start.mjs** - Records retry count increment and attempt start time.
- **now-iso.mjs** - Returns current ISO timestamp.
- **patch-issue-state.mjs** - Merges patch into issue state with locking.
- **prune-history.mjs** - Truncates history array to HISTORY_LIMIT.
- **record-completion.mjs** - Records completed_at timestamp and latency_ms for an issue.
- **record-quarantine.mjs** - Moves worktree to quarantined state with reason and error details.
- **record-retry-event.mjs** - Records retry events in notes.retry_events (last 20 events).
- **record-transition.mjs** - Records state transitions (host, timestamp, fromState, toState).
- **release-integration-lock.mjs** - Releases integration lock.
- **release-lease.mjs** - Releases a lease, optionally verifying nonce to prevent accidental release of new leases.
- **release-state-lock.mjs** - Releases the lock only if the current process owns it.
- **repairable-finalization-states.mjs** - Set of finalization states that can be automatically repaired.
- **reset-retry-state.mjs** - Clears retry state (retry_count, blocked_reason, cooldown, lease, failure info).
- **save-state.mjs** - Atomic state persistence using temp file + rename to prevent corruption from crashes or concurrent access.
- **set-cooldown.mjs** - Sets cooldown_until timestamp and last_failure_reason. Optional signature for failure fingerprinting.
- **set-finalization-state.mjs** - Manages issue finalization state (validation, commit, branch push, integration).
- **set-global-value.mjs** - Sets a global key-value pair in state.
- **set-worktree-state.mjs** - Updates worktree state with patch (state, issueIdentifier, reason, etc.).
- **with-state-lock.mjs** - Wrapper that acquires lock, executes callback, and releases lock. Throws on failure after max retries.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
