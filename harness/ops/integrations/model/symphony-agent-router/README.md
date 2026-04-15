# Symphony Agent Router

## Purpose

Router control plane that accepts scheduler-issued triggers, verifies scheduler-owned claims and durable worktree assignment, and forwards work into the assigned worktree-local bridge.

The router is transport and load-shedding logic only — it does not originate claims, select worktrees for unclaimed work, or make scheduling decisions. See ADR-0002 and ADR-0011.

## Durable State Authority (Workstream B Phase 4–6)

After Workstream B, the router no longer relies on transient memory for correctness:

### Startup Reconstruction

On startup (`runtime.mjs`), transient `activeRequests` counters are initialized from durable worktree state. Worktrees in `"executing"` state get their counter set to 1. This ensures the router has an accurate view immediately after restart.

### Periodic Reconciliation

`reconcileWorktreeCounters()` periodically syncs transient counters with durable state for Linear worktrees (wt1–4). If durable state says executing but counter is 0, the counter is corrected up. If durable state says not executing but counter is >0, the counter is corrected down. Discord worktrees (wt5–8) are not reconciled because they use transient HTTP proxy routing without durable claims.

### Counter Independence

Even with zeroed counters (fresh restart before reconciliation runs), the router makes correct decisions because:

- `selectLinearWorktree()` filters out worktrees in `"executing"` durable state
- `handleLinearTrigger()` trusts the scheduler's durable assignment — skips counter-based busy checks when target is from scheduler's claim
- `dispatchLinearExecution()` trusts scheduler assignment — skips counter-based busy checks when `assignedTarget` is provided
- Queue drain in `runtime.mjs` uses durable state for available-slot counting

Counters remain useful for the `/status` health endpoint and Discord load-shedding, but they are observation aids, not correctness inputs for Linear scheduling.

## Contents

- 26 immediate files
- 1 child directory

## Key Files

- `dispatch-linear-execution.mjs` - Exports `dispatchLinearExecution`, the main helper defined in this file.
- `global-active-requests.mjs` - Exports `setGlobalActiveRequests`, the main helper defined in this file.
- `handle-linear-queue.mjs` - Exports `handleLinearQueue`, the main helper defined in this file.
- `handle-linear-trigger.mjs` - Exports `handleLinearTrigger`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-path-within-root.mjs` - Exports `isPathWithinRoot`, the main helper defined in this file.
- `json.mjs` - Exports `json`, the main helper defined in this file.
- `linear-queue.mjs` - Exports `linearQueue`, a shared constant or state value used by sibling modules.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `max-concurrent.mjs` - Exports `MAX_CONCURRENT`, a shared constant or state value used by sibling modules.
- `max-queue-age-ms.mjs` - Exports `MAX_QUEUE_AGE_MS`, a shared constant or state value used by sibling modules.
- `max-queue-length.mjs` - Exports `MAX_QUEUE_LENGTH`, a shared constant or state value used by sibling modules.
- `overload.mjs` - Exports `overload`, the main helper defined in this file.
- `port.mjs` - Exports `PORT`, a shared constant or state value used by sibling modules.
- `proxy-request.mjs` - Exports `proxyRequest`, the main helper defined in this file.
- `queue-poll-interval-ms.mjs` - Exports `QUEUE_POLL_INTERVAL_MS`, a shared constant or state value used by sibling modules.
- `rebase-cwd-to-worktree.mjs` - Exports `rebaseCwdToWorktree`, the main helper defined in this file.
- `round-robin-index.mjs` - Exports `setRoundRobinIndex`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `select-linear-worktree.mjs` - Re-export facade that assembles the public surface for this directory.
- `select-worktree.mjs` - Exports `selectWorktree`, the main helper defined in this file.
- `server.mjs` - Exports `server`, a shared constant or state value used by sibling modules.
- `target-host.mjs` - Exports `TARGET_HOST`, a shared constant or state value used by sibling modules.
- `verify-scheduler-claim.mjs` - Exports `verifySchedulerClaim`, the main helper defined in this file.
- `worktree-ids.mjs` - Exports `WORKTREE_IDS`, a shared constant or state value used by sibling modules.
- `worktrees.mjs` - Exports `WORKTREES`, a shared constant or state value used by sibling modules.

## Subdirectories

- `select-linear-worktree/` - Select Linear Worktree scope; immediate files include `index.mjs`, `normalize-worktree-state.mjs`, `select-linear-worktree.mjs`.

## Operational Notes

- After Workstream A, the router is transport and load-shedding logic, not a claim originator.
- Both immediate trigger handling and queued trigger draining re-verify scheduler-owned claims before dispatch via `verifySchedulerClaim()`.
- `reconcileWorktreeCounters()` runs on a periodic interval (configured in `runtime.mjs`) to keep transient counters aligned with durable state.
- Startup reconstruction reads durable `worktreeStates` and initializes `activeRequests` counters before the HTTP server starts.

## Review Focus

Verify that the router honours durable assignment and never re-selects worktrees or dispatches unclaimed work. Confirm that no scheduling decision depends on transient counter accuracy alone.
