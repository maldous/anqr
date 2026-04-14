# Symphony State

## Purpose

Directory for git worktree management and concurrency support; immediate files include `acquire-integration-lock.mjs`, `acquire-lease.mjs`, `acquire-state-lock.mjs`, `add-external-key.mjs`, and others, with child directories `acquire-state-lock/`.

## Contents

- 62 immediate files
- 1 child directory

## Key Files

- `acquire-integration-lock.mjs` - Exports `acquireIntegrationLock`, the main helper defined in this file.
- `acquire-lease.mjs` - Exports `acquireLease`, the main helper defined in this file.
- `acquire-state-lock.mjs` - Re-export facade that assembles the public surface for this directory.
- `add-external-key.mjs` - Exports `addExternalKey`, the main helper defined in this file.
- `calculate-exponential-backoff.mjs` - Exports `calculateExponentialBackoff`, the main helper defined in this file.
- `can-execute-issue.mjs` - Exports `canExecuteIssue`, the main helper defined in this file.
- `can-feed-issue.mjs` - Exports `canFeedIssue`, the main helper defined in this file.
- `check-latency-baseline.mjs` - Exports `checkLatencyBaseline`, the main helper defined in this file.
- `clear-cooldown.mjs` - Exports `clearCooldown`, the main helper defined in this file.
- `clear-quarantine.mjs` - Exports `clearQuarantine`, the main helper defined in this file.
- `default-lease-ms.mjs` - Exports `DEFAULT_LEASE_MS`, a shared constant or state value used by sibling modules.
- `dequeue-integration-candidate.mjs` - Exports `dequeueIntegrationCandidate`, the main helper defined in this file.
- `empty-store.mjs` - Exports `emptyStore`, the main helper defined in this file.
- `enqueue-integration-candidate.mjs` - Exports `enqueueIntegrationCandidate`, the main helper defined in this file.
- `ensure-dir.mjs` - Exports `ensureDir`, the main helper defined in this file.
- `find-expired-leases.mjs` - Exports `findExpiredLeases`, the main helper defined in this file.
- `get-finalization-state.mjs` - Exports `getFinalizationState`, the main helper defined in this file.
- `get-fleet-snapshot.mjs` - Exports `getFleetSnapshot`, the main helper defined in this file.
- `get-global-value.mjs` - Exports `getGlobalValue`, the main helper defined in this file.
- `get-issue-state.mjs` - Exports `getIssueState`, the main helper defined in this file.
- `get-latency-metrics.mjs` - Exports `getLatencyMetrics`, the main helper defined in this file.
- `get-lock-file.mjs` - Exports `getLockFile`, the main helper defined in this file.
- `get-next-repairable-issue-for-worktree.mjs` - Exports `getNextRepairableIssueForWorktree`, the main helper defined in this file.
- `get-state-dir.mjs` - Exports `getStateDir`, the main helper defined in this file.
- `get-state-file.mjs` - Exports `getStateFile`, the main helper defined in this file.
- `get-worktree-state.mjs` - Exports `getWorktreeState`, the main helper defined in this file.
- `heartbeat-lease.mjs` - Exports `heartbeatLease`, the main helper defined in this file.
- `history-limit.mjs` - Exports `HISTORY_LIMIT`, a shared constant or state value used by sibling modules.
- `host-id.mjs` - Exports `HOST_ID`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-lock-process-alive.mjs` - Exports `isLockProcessAlive`, the main helper defined in this file.
- `lease-is-active.mjs` - Exports `leaseIsActive`, the main helper defined in this file.
- `list-integration-candidates.mjs` - Exports `listIntegrationCandidates`, the main helper defined in this file.
- `list-repairable-issues-for-worktree.mjs` - Exports `listRepairableIssuesForWorktree`, the main helper defined in this file.
- `list-worktrees-by-state.mjs` - Exports `listWorktreesByState`, the main helper defined in this file.
- `load-state.mjs` - Exports `loadState`, the main helper defined in this file.
- `lock-max-retries.mjs` - Exports `LOCK_MAX_RETRIES`, a shared constant or state value used by sibling modules.
- `lock-retry-interval-ms.mjs` - Exports `LOCK_RETRY_INTERVAL_MS`, a shared constant or state value used by sibling modules.
- `lock-stale-ms.mjs` - Exports `LOCK_STALE_MS`, a shared constant or state value used by sibling modules.
- `mark-issue-human-only.mjs` - Exports `markIssueHumanOnly`, the main helper defined in this file.
- `mark-retry-exhausted.mjs` - Exports `markRetryExhausted`, the main helper defined in this file.
- `mutate-state.mjs` - Exports `mutateState`, the main helper defined in this file.
- `normalize-record.mjs` - Exports `normalizeRecord`, the main helper defined in this file.
- `note-attempt-start.mjs` - Exports `noteAttemptStart`, the main helper defined in this file.
- `now-iso.mjs` - Exports `nowIso`, the main helper defined in this file.
- `patch-issue-state.mjs` - Exports `patchIssueState`, the main helper defined in this file.
- `prune-history.mjs` - Exports `pruneHistory`, the main helper defined in this file.
- `record-completion.mjs` - Exports `recordCompletion`, the main helper defined in this file.
- `record-quarantine.mjs` - Exports `recordQuarantine`, the main helper defined in this file.
- `record-retry-event.mjs` - Exports `recordRetryEvent`, the main helper defined in this file.
- `record-transition.mjs` - Exports `recordTransition`, the main helper defined in this file.
- `release-integration-lock.mjs` - Exports `releaseIntegrationLock`, the main helper defined in this file.
- `release-lease.mjs` - Exports `releaseLease`, the main helper defined in this file.
- `release-state-lock.mjs` - Exports `releaseStateLock`, the main helper defined in this file.
- `repairable-finalization-states.mjs` - Exports `REPAIRABLE_FINALIZATION_STATES`, a shared constant or state value used by sibling modules.
- `reset-retry-state.mjs` - Exports `resetRetryState`, the main helper defined in this file.
- `save-state.mjs` - Exports `saveState`, the main helper defined in this file.
- `set-cooldown.mjs` - Exports `setCooldown`, the main helper defined in this file.
- `set-finalization-state.mjs` - Exports `setFinalizationState`, the main helper defined in this file.
- `set-global-value.mjs` - Exports `setGlobalValue`, the main helper defined in this file.
- `set-worktree-state.mjs` - Exports `setWorktreeState`, the main helper defined in this file.
- `with-state-lock.mjs` - Exports `withStateLock`, the main helper defined in this file.

## Subdirectories

- `acquire-state-lock/` - Directory for harness support logic; immediate files include `acquire-state-lock.mjs`, `index.mjs`, `sleep-sync.mjs`.

## Operational Notes

- Current on-disk inventory: 62 immediate files and 1 child directory.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the directory purpose, immediate files, and child modules still align with the current harness architecture.
