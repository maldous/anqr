# Symphony Agent Router

## Purpose
Control-plane router that accepts scheduler-claimed work, honours the scheduler's durable worktree assignment, and forwards Linear-triggered execution into the correct worktree-local bridge.

**ADR-0002 compliance:** The router is transport only. It always verifies that the scheduler has claimed the issue before dispatch. `verifySchedulerClaim()` checks active lease existence, scheduler ownership, and durable worktree assignment. Unclaimed dispatch is rejected with 409.

## Contents
- 25 immediate files
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
- `worktree-ids.mjs` - Exports `WORKTREE_IDS`, a shared constant or state value used by sibling modules.
- `worktrees.mjs` - Exports `WORKTREES`, a shared constant or state value used by sibling modules.

## Subdirectories
- `select-linear-worktree/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `index.mjs`, `normalize-worktree-state.mjs`, `select-linear-worktree.mjs`.

## Operational Notes
- This router is the main fan-out point between the scheduler and executor worktrees.
- In authoritative mode (permanent), the router reads the scheduler's assigned worktreeId from durable state and dispatches to that worktree. Fallback to `selectLinearWorktree()` occurs only when the assigned worktree is not found.
- The router shares the filesystem-backed `symphony-state.json` with the scheduler. Both run on the same host.

## Review Focus
Verify the router always enforces scheduler claim verification (no bypass), honours durable worktree assignments, and does not originate scheduling authority.
