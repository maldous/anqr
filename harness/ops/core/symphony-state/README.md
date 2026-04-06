# ANQR Symphony State

## 1. Directory Overview

This directory contains the core state management system for the ANQR (Agentic Number Query Runner) Symphony orchestration. It provides persistent state tracking for issues, leases, worktrees, and the integration queue. The module uses a centralized JSON state file with file-based locking to ensure safe concurrent access from multiple worktree runners.

## 2. File Summaries

### State Management

- **load-state.mjs** - Loads the state.json file from disk, normalizing records and handling schema migrations. Returns an empty store if the file doesn't exist.
- **save-state.mjs** - Atomic state persistence using temp file + rename to prevent corruption from crashes or concurrent access.
- **empty-store.mjs** - Returns the initial empty state structure with version, hostId, issues, worktreeStates, and global objects.
- **normalize-record.mjs** - Ensures consistent field types and defaults for issue records, including retry state, cooldown, lease, transitions, and finalization objects.
- **mutate-state.mjs** - Generic state mutation with automatic locking and persistence.

### Lock Management

- **acquire-state-lock.mjs** - File-based exclusive lock using O_EXCL. Automatically handles stale locks (dead processes or locks older than LOCK_STALE_MS).
- **release-state-lock.mjs** - Releases the lock only if the current process owns it.
- **with-state-lock.mjs** - Wrapper that acquires lock, executes callback, and releases lock. Throws on failure after max retries.
- **get-lock-file.mjs** - Returns the lock file path (state.json.lock).
- **is-lock-process-alive.mjs** - Checks if a process ID is still alive using signal 0.

### Issue State

- **get-issue-state.mjs** - Retrieves normalized state for a specific issue by identifier.
- **patch-issue-state.mjs** - Merges patch into issue state with locking.
- **mark-issue-human-only.mjs** - Marks an issue as human-only (excluded from automatic execution).
- **add-external-key.mjs** - Adds external keys to an issue for tracking correlations (e.g., Linear issue ID).

### Lease Management

- **acquire-lease.mjs** - Acquires an exclusive lease on an issue. Returns failure if lease already active.
- **release-lease.mjs** - Releases a lease, optionally verifying nonce to prevent accidental release of new leases.
- **heartbeat-lease.mjs** - Extends lease TTL by updating heartbeat_at and expires_at. Requires matching nonce.
- **lease-is-active.mjs** - Checks if a lease is still valid based on expires_at timestamp.
- **find-expired-leases.mjs** - Returns all issues with expired leases (for recovery processing).

### Retry Logic

- **set-cooldown.mjs** - Sets cooldown_until timestamp and last_failure_reason. Optional signature for failure fingerprinting.
- **clear-cooldown.mjs** - Removes cooldown, allowing issue to be retried.
- **mark-retry-exhausted.mjs** - Marks issue as permanently blocked after max retries. Clears lease and cooldown.
- **reset-retry-state.mjs** - Clears retry state (retry_count, blocked_reason, cooldown, lease, failure info).
- **calculate-exponential-backoff.mjs** - Computes backoff with exponential growth (base \* 2^retryCount) capped at maxMs, plus ±20% jitter.
- **record-retry-event.mjs** - Records retry events in notes.retry_events (last 20 events).
- **note-attempt-start.mjs** - Records retry count increment and attempt start time.

### Latency Metrics

- **record-completion.mjs** - Records completed_at timestamp and latency_ms for an issue.
- **get-latency-metrics.mjs** - Calculates aggregate latency stats: count, average, median, p95, min, max.
- **check-latency-baseline.mjs** - Compares current average against baseline. Alerts if >50% increase.

### Finalization State

- **set-finalization-state.mjs** - Manages issue finalization state (validation, commit, branch push, integration).
- **get-finalization-state.mjs** - Retrieves finalization state for an issue.
- **repairable-finalization-states.mjs** - Set of finalization states that can be automatically repaired.

### Integration Queue

- **enqueue-integration-candidate.mjs** - Adds issue to integration queue (if not already present).
- **dequeue-integration-candidate.mjs** - Removes issue from integration queue.
- **list-integration-candidates.mjs** - Returns all integration candidates.
- **acquire-integration-lock.mjs** - Acquires lock for integration processing (TTL-based).
- **release-integration-lock.mjs** - Releases integration lock.

### Worktree State

- **set-worktree-state.mjs** - Updates worktree state with patch (state, issueIdentifier, reason, etc.).
- **get-worktree-state.mjs** - Retrieves state for a specific worktree.
- **list-worktrees-by-state.mjs** - Lists all worktrees in a specific state.
- **record-quarantine.mjs** - Moves worktree to quarantined state with reason and error details.
- **clear-quarantine.mjs** - Resets worktree to available state.
- **get-fleet-snapshot.mjs** - Returns fleet-wide summary: available, executing, dirty, quarantined, blocked counts.
- **get-next-repairable-issue-for-worktree.mjs** - Finds next repairable issue for a worktree.
- **list-repairable-issues-for-worktree.mjs** - Lists all repairable issues for a worktree.

### Constants

- **default-lease-ms.mjs** - Default lease TTL (20 minutes). Configurable via ANQR_SYMPHONY_LEASE_MS.
- **history-limit.mjs** - Maximum transitions to keep (50). Configurable via ANQR_SYMPHONY_HISTORY_LIMIT.
- **host-id.mjs** - Current host identifier (hostname or ANQR_SYMPHONY_HOST_ID).
- **lock-retry-interval-ms.mjs** - Lock retry interval (50ms).
- **lock-max-retries.mjs** - Maximum lock acquire retries (100).
- **lock-stale-ms.mjs** - Stale lock threshold (60 seconds).

### Utilities

- **get-state-dir.mjs** - Returns state directory path. Uses ANQR_SYMPHONY_STATE_DIR env var or XDG_RUNTIME_DIR/anqr-symphony-state.
- **get-state-file.mjs** - Returns path to state.json.
- **ensure-dir.mjs** - Creates state directory if it doesn't exist.
- **now-iso.mjs** - Returns current ISO timestamp.
- **can-execute-issue.mjs** - Checks if an issue can be executed (not human-only, not retry-exhausted, no cooldown, no active lease).
- **can-feed-issue.mjs** - Extends canExecuteIssue to exclude email-sourced issues.
- **prune-history.mjs** - Truncates history array to HISTORY_LIMIT.
- **record-transition.mjs** - Records state transitions (host, timestamp, fromState, toState).

### Global Values

- **set-global-value.mjs** - Sets a global key-value pair in state.
- **get-global-value.mjs** - Gets a global value with optional fallback.

### Index

- **index.mjs** - Generated facade that re-exports all public functions and constants.

## 3. Overall Directory Function

This directory serves as the central state repository for Symphony execution. It provides:

- **Issue Lifecycle Management**: Track issue state from creation through execution, retry, cooldown, completion, or finalization.
- **Lease-based Concurrency Control**: Prevent duplicate execution across multiple runners using leases with TTL and heartbeats.
- **Retry with Exponential Backoff**: Automatic retry with increasing delays and jitter to handle transient failures.
- **Latency Monitoring**: Track execution times and alert on significant degradation (>50% above baseline).
- **Integration Queue**: Manage issues pending integration (branch push, PR creation).
- **Worktree Health**: Track worktree states (available, executing, dirty, quarantined, blocked) for fleet management.
- **Repairable Failures**: Identify and retry repairable finalization failures automatically.

The state uses file-based locking to ensure safe concurrent access from multiple worktree processes. All modifications are atomic (temp file + rename) to prevent corruption.

## 4. Usage Instructions

This directory is primarily imported by other harness modules. Key usage patterns:

```javascript
// Import state functions
import {
  acquireLease,
  releaseLease,
  heartbeatLease,
  setCooldown,
  recordCompletion,
  getLatencyMetrics,
} from "./ops/core/symphony-state/index.mjs";

// Acquire lease before processing
const result = acquireLease(issueIdentifier, { owner: HOST_ID, ttlMs: 20 * 60 * 1000 });
if (!result.ok) {
  // Another runner has the lease
  return;
}

// Record progress with heartbeats
heartbeatLease(issueIdentifier, lease.nonce);

// On failure, set cooldown
const backoff = calculateExponentialBackoff(retryCount);
setCooldown(issueIdentifier, backoff, errorMessage);

// On success, record completion
recordCompletion(issueIdentifier, { latencyMs: duration });
```

### Environment Variables

- `ANQR_SYMPHONY_STATE_DIR` - Override state directory location
- `ANQR_SYMPHONY_LEASE_MS` - Override default lease TTL (default: 20 minutes)
- `ANQR_SYMPHONY_HISTORY_LIMIT` - Override max transition history (default: 50)
- `ANQR_SYMPHONY_HOST_ID` - Override hostname-based host ID

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **No external packages** - Pure Node.js implementation

### Internal Dependencies

- Uses constants from `../linear-client.mjs` indirectly through other modules

## 6. Additional Comments

- **Shared State Directory**: The state uses a SHARED central directory (not per-worktree) to prevent lease race conditions where multiple runners pick up the same issue because they can't see each other's leases.
- **Fail-Closed Design**: Lease acquisition fails if lease is active, preventing duplicate processing.
- **Stale Lock Handling**: Automatically detects and removes locks from dead processes or locks older than 60 seconds.
- **Atomic Writes**: All state modifications use temp file + rename to prevent partial writes on crash.
- **Exponential Backoff**: Base 10 minutes, doubles each retry, max 60 minutes, with ±20% jitter to prevent thundering herd.
- **Latency Baseline**: On first completion, sets baseline. Alerts if current average exceeds baseline by >50%.
- **Finalization States**: Track repairable vs permanent failures for automatic retry of fixable issues.
