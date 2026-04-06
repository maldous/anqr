# ANQR Symphony State

## 1. Directory Overview

This directory implements **ANQR Symphony State** within the ANQR harness. Key immediate entries include `index.mjs`, `get-next-repairable-issue-for-worktree.mjs`, `list-repairable-issues-for-worktree.mjs`, `mark-issue-human-only.mjs`. The current inventory is 62 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **acquire-integration-lock.mjs** - Exports `acquireIntegrationLock`, which acquires integration lock.
- **acquire-lease.mjs** - Exports `acquireLease`, which acquires lease.
- **acquire-state-lock.mjs** - Exports `acquireStateLock`, which acquires state lock.
- **add-external-key.mjs** - Exports `addExternalKey`, which implements add external key.
- **calculate-exponential-backoff.mjs** - Exports `calculateExponentialBackoff`, which calculates exponential backoff.
- **can-execute-issue.mjs** - Exports `canExecuteIssue`, which determines whether execute issue.
- **can-feed-issue.mjs** - Exports `canFeedIssue`, which determines whether feed issue.
- **check-latency-baseline.mjs** - Exports `checkLatencyBaseline`, which checks latency baseline.
- **clear-cooldown.mjs** - Exports `clearCooldown`, which clears cooldown.
- **clear-quarantine.mjs** - Exports `clearQuarantine`, which clears quarantine.
- **default-lease-ms.mjs** - Exports `DEFAULT_LEASE_MS`, a shared constant used by sibling modules.
- **dequeue-integration-candidate.mjs** - Exports `dequeueIntegrationCandidate`, which dequeues integration candidate.
- **empty-store.mjs** - Exports `emptyStore`, which implements empty store.
- **enqueue-integration-candidate.mjs** - Exports `enqueueIntegrationCandidate`, which enqueues integration candidate.
- **ensure-dir.mjs** - Exports `ensureDir`, which ensures dir.
- **find-expired-leases.mjs** - Exports `findExpiredLeases`, which finds expired leases.
- **get-finalization-state.mjs** - Exports `getFinalizationState`, which gets finalization state.
- **get-fleet-snapshot.mjs** - Exports `getFleetSnapshot`, which gets fleet snapshot.
- **get-global-value.mjs** - Exports `getGlobalValue`, which gets global value.
- **get-issue-state.mjs** - Exports `getIssueState`, which gets issue state.
- **get-latency-metrics.mjs** - Exports `getLatencyMetrics`, which gets latency metrics.
- **get-lock-file.mjs** - Exports `getLockFile`, which gets lock file.
- **get-next-repairable-issue-for-worktree.mjs** - Exports `getNextRepairableIssueForWorktree`, which gets next repairable issue for worktree.
- **get-state-dir.mjs** - Exports `getStateDir`, which gets state dir.
- **get-state-file.mjs** - Exports `getStateFile`, which gets state file.
- **get-worktree-state.mjs** - Exports `getWorktreeState`, which gets worktree state.
- **heartbeat-lease.mjs** - Exports `heartbeatLease`, which implements heartbeat lease.
- **history-limit.mjs** - Exports `HISTORY_LIMIT`, a shared constant used by sibling modules.
- **host-id.mjs** - Exports `HOST_ID`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./get-state-dir.mjs`, `./get-state-file.mjs`, `./get-lock-file.mjs`, `./default-lease-ms.mjs`, `./history-limit.mjs`, `./host-id.mjs`, and 55 more siblings.
- **is-lock-process-alive.mjs** - Exports `isLockProcessAlive`, which checks whether lock process alive.
- **lease-is-active.mjs** - Exports `leaseIsActive`, which implements lease is active.
- **list-integration-candidates.mjs** - Exports `listIntegrationCandidates`, which lists integration candidates.
- **list-repairable-issues-for-worktree.mjs** - Exports `listRepairableIssuesForWorktree`, which lists repairable issues for worktree.
- **list-worktrees-by-state.mjs** - Exports `listWorktreesByState`, which lists worktrees by state.
- **load-state.mjs** - Exports `loadState`, which loads state.
- **lock-max-retries.mjs** - Exports `LOCK_MAX_RETRIES`, a shared constant used by sibling modules.
- **lock-retry-interval-ms.mjs** - Exports `LOCK_RETRY_INTERVAL_MS`, a shared constant used by sibling modules.
- **lock-stale-ms.mjs** - Exports `LOCK_STALE_MS`, a shared constant used by sibling modules.
- **mark-issue-human-only.mjs** - Exports `markIssueHumanOnly`, which marks issue human only.
- **mark-retry-exhausted.mjs** - Exports `markRetryExhausted`, which marks retry exhausted.
- **mutate-state.mjs** - Exports `mutateState`, which implements mutate state.
- **normalize-record.mjs** - Exports `normalizeRecord`, which normalizes record.
- **note-attempt-start.mjs** - Exports `noteAttemptStart`, which implements note attempt start.
- **now-iso.mjs** - Exports `nowIso`, which implements now iso.
- **patch-issue-state.mjs** - Exports `patchIssueState`, which implements patch issue state.
- **prune-history.mjs** - Exports `pruneHistory`, which implements prune history.
- **record-completion.mjs** - Exports `recordCompletion`, which implements record completion.
- **record-quarantine.mjs** - Exports `recordQuarantine`, which implements record quarantine.
- **record-retry-event.mjs** - Exports `recordRetryEvent`, which implements record retry event.
- **record-transition.mjs** - Exports `recordTransition`, which implements record transition.
- **release-integration-lock.mjs** - Exports `releaseIntegrationLock`, which releases integration lock.
- **release-lease.mjs** - Exports `releaseLease`, which releases lease.
- **release-state-lock.mjs** - Exports `releaseStateLock`, which releases state lock.
- **repairable-finalization-states.mjs** - Exports `REPAIRABLE_FINALIZATION_STATES`, a shared `Set` constant used by this module group.
- **reset-retry-state.mjs** - Exports `resetRetryState`, which implements reset retry state.
- **save-state.mjs** - Exports `saveState`, which implements save state.
- **set-cooldown.mjs** - Exports `setCooldown`, which implements set cooldown.
- **set-finalization-state.mjs** - Exports `setFinalizationState`, which implements set finalization state.
- **set-global-value.mjs** - Exports `setGlobalValue`, which implements set global value.
- **set-worktree-state.mjs** - Exports `setWorktreeState`, which implements set worktree state.
- **with-state-lock.mjs** - Exports `withStateLock`, which implements with state lock.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, timer, scheduling, cooldown, or watchdog behavior, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/core/symphony-state/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:os`, `node:path`
- **Internal relative modules** - `./acquire-state-lock.mjs`, `./can-execute-issue.mjs`, `./default-lease-ms.mjs`, `./empty-store.mjs`, `./ensure-dir.mjs`, `./get-global-value.mjs`, `./get-issue-state.mjs`, `./get-lock-file.mjs`, `./get-state-dir.mjs`, `./get-state-file.mjs`, `./history-limit.mjs`, `./host-id.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
