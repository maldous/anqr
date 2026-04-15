# Symphony State

## Purpose

Authoritative durable execution state for the ANQR harness. This module is the single source of truth for execution ownership, lifecycle transitions, worktree assignment, lease management, and integration candidacy. All scheduling decisions that affect correctness are derived from state managed here.

See ADR-0011 for the formal execution state model.

## Architecture (Phases 1–6)

The state model was normalized across Workstream B Phases 1–6:

- **Phase 1** — Schema, helpers, transition map, `inferExecutionPhase()`, `normalizeWorktreeRecord()`
- **Phase 2** — `transitionIssue()` and `transitionWorktree()` as sole lifecycle write APIs; deprecated helpers removed from production exports
- **Phase 3** — All lifecycle writers migrated to transition APIs; `releaseLease()` rewritten as atomic bidirectional release
- **Phase 4** — `claimAndAssignWorktree()` for atomic claim+assignment; durable ownership authoritative in router/scheduler
- **Phase 5** — Integration candidacy derived from `finalization.state`; ownership fallbacks made observable
- **Phase 6** — Full test coverage: no-transient-correctness proof, claim lifecycle, stale lease handling

### Key Invariants

- **Lifecycle transitions** go through `transitionIssue()` / `transitionWorktree()` only
- **Ownership is bidirectional** — issue records and worktree records agree on assignment
- **Claim + release are atomic** — `claimAndAssignWorktree()` and `releaseLease()` set both sides under one lock
- **State survives restart** — `loadState()` normalizes worktree records on load
- **`patchIssueState()`** is retained only for metadata-only writes that do not determine lifecycle phase

## Contents

- 71 immediate files
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
- `claim-and-assign-worktree.mjs` - Exports `claimAndAssignWorktree`, atomic claim + worktree assignment under one lock (Phase 4).
- `claim-issue.mjs` - Exports `claimIssue`, the main helper defined in this file.
- `clear-cooldown.mjs` - Exports `clearCooldown`, the main helper defined in this file.
- `clear-quarantine.mjs` - Exports `clearQuarantine`, the main helper defined in this file.
- `default-lease-ms.mjs` - Exports `DEFAULT_LEASE_MS`, a shared constant or state value used by sibling modules.
- `empty-store.mjs` - Exports `emptyStore`, the main helper defined in this file.
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
- `get-worktree-owner.mjs` - Exports `getWorktreeOwner`, reads durable worktree ownership (Phase 4).
- `get-worktree-state.mjs` - Exports `getWorktreeState`, the main helper defined in this file.
- `heartbeat-lease.mjs` - Exports `heartbeatLease`, the main helper defined in this file.
- `history-limit.mjs` - Exports `HISTORY_LIMIT`, a shared constant or state value used by sibling modules.
- `host-id.mjs` - Exports `HOST_ID`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `infer-execution-phase.mjs` - Exports `inferExecutionPhase`, derives execution phase from issue state (Phase 1).
- `is-lock-process-alive.mjs` - Exports `isLockProcessAlive`, the main helper defined in this file.
- `is-valid-issue-transition.mjs` - Exports `isValidIssueTransition`, validates issue lifecycle transitions (Phase 2).
- `is-valid-worktree-transition.mjs` - Exports `isValidWorktreeTransition`, validates worktree lifecycle transitions (Phase 2).
- `issue-phases.mjs` - Exports issue phase enum and constants (Phase 1).
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
- `set-finalization-state.mjs` - **Deprecated.** Exports `setFinalizationState`; removed from production exports in Phase 2. Retained on disk for test fixtures only. Use `transitionIssue()` instead.
- `set-global-value.mjs` - Exports `setGlobalValue`, the main helper defined in this file.
- `set-worktree-state.mjs` - **Deprecated.** Exports `setWorktreeState`; removed from production exports in Phase 2. Retained on disk for test fixtures only. Use `transitionWorktree()` instead.
- `transition-issue.mjs` - Exports `transitionIssue`, the lifecycle transition API for issues (Phase 2).
- `transition-map.mjs` - Exports the valid transition map for issue and worktree states (Phase 1).
- `transition-worktree.mjs` - Exports `transitionWorktree`, the lifecycle transition API for worktrees (Phase 2).
- `with-state-lock.mjs` - Exports `withStateLock`, the main helper defined in this file.
- `worktree-record-schema.mjs` - Exports the worktree record schema enforced on load (Phase 1).

## Subdirectories

- `acquire-state-lock/` - Acquire State Lock scope; immediate files include `acquire-state-lock.mjs`, `index.mjs`, `sleep-sync.mjs`.

## Operational Notes

- Current on-disk inventory: 71 immediate files and 1 child directory.
- `set-finalization-state.mjs` and `set-worktree-state.mjs` are deprecated — retained on disk for test fixtures only.
- `patchIssueState()` is the legitimate metadata-only write API (retry count, latency, source, transitions array).
- Integration candidacy is derived from `finalization.state` by `listIntegrationCandidates()` — there is no separate persistent queue.
- Ownership fallbacks in `infer-owner-from-branch.mjs` (git-log heuristic, issue reverse-scan) log warnings when activated — durable worktree state is the primary ownership record.

## Review Focus

Verify that all lifecycle-significant mutations go through `transitionIssue()` / `transitionWorktree()` and that no caller bypasses the atomic claim/release helpers for ownership changes.
