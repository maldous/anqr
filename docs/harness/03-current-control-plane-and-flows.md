# Current Control Plane And Flows

## Current control-plane actors

The current platform has these control-plane actors:

- `linear-webhook-receiver`
- `discord-request-router`
- `symphony-agent-router`
- `linear-reconciler`
- `symphony-runner`
- `symphony-queue-control`
- `symphony-integrator`
- `symphony-worktree-recovery`
- `bridge-watchdog`
- `worktree-health`

Not all of them should own scheduling or git mutation.

Some of them currently do.

## Current Linear flow

1. Linear changes state or emits an event.
2. `linear-webhook-receiver` decides whether the event is eligible.
3. It calls `trigger-issue-execution.mjs`.
4. That posts to `/v1/linear/trigger` on the Symphony router.
5. `dispatch-linear-execution.mjs` chooses a least-loaded worktree from `wt1` to `wt4`.
6. The chosen executor gets `/v1/linear/execute`.
7. The runner syncs the worktree from `origin/main`.
8. The runner acquires a lease and starts work.
9. Validation and finalization run.
10. The runner may publish branch state.
11. The integrator later cherry-picks into `main`.
12. Recovery and reconciliation observe the same issue and may act again.

## Current reconciler flow

`linear-reconciler` does all of the following:

- checks healthy capacity
- inspects queue depth
- feeds Todo from Backlog
- detects stale work
- re-enqueues stale integration candidates
- dispatches Todo issues to the router

This means it is not only observing. It is scheduling.

## Current runner flow

The runner currently does all of the following:

- syncs the worktree from `origin/main` before lease acquisition
- fetches issue detail
- picks Todo issues directly through `pick-issue.mjs`
- acquires and heartbeats a lease
- runs AI work
- validates results
- may commit and push worktree branch state
- updates Linear state and comments
- emits completion and retry metadata

This makes the runner both executor and part-time scheduler.

## Current recovery flow

The worktree recovery daemon currently does all of the following:

- scans all worktrees
- classifies them
- releases stale leases
- sets worktree state
- retries pushes
- auto-commits dirty work
- pushes branches
- for main repo repair, pushes `main`
- propagates baseline fixes to other worktrees

This is too much authority for a recovery process.

## Current integration flow

The integrator is already single-writer by intent:

- reads integration queue
- acquires integration lock
- cherry-picks candidate branch head onto `main`
- reports success or conflict

This is the most correct part of the current control plane, but it is still fed by unstable upstream ownership rules.

## Why the current flow is unsafe

The system mixes three patterns:

- edge-triggered webhook dispatch
- level-triggered backlog reconciliation
- worker-local self-pick

That combination is unsafe when all three can touch the same queue without an earlier authoritative claim.

## Current execution classes

The runtime does not yet cleanly separate three classes of work:

- read-only
- command-only
- mutating

Production design must treat them differently.

Read-only and command-only tasks should not pay the full repository mutation cost.

Mutating tasks must go through the full state, validation, and integration pipeline.
