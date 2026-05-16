# Current Control Plane And Flows

> **⚠️ Pre-implementation architecture review document.** Written before Workstreams A–G. Control-plane authority has been restructured: the scheduler is now the sole claim authority (ADR-0002), the router is transport-only, recovery is non-publishing (ADR-0005), and state ownership is formalized (ADR-0011). For current flows, see subsystem READMEs.

## Current control-plane actors

The current platform has these control-plane actors:

- `linear-webhook-receiver` — event-driven ingress
- `discord-request-router` (+ text/voice variants) — request routing with load balancing
- `symphony-agent-router` — transport layer; verifies scheduler-owned claims before forwarding
- `symphony-scheduler` — **authoritative claim authority** (ADR-0002); sole owner of claim decisions
- `linear-reconciler` — level-triggered backlog feed; handles `integrated_main → Done`; runs infinite daemon loop (can exit cleanly — needs restart monitoring)
- `symphony-runner` — executor; runs assigned work only; no self-pick
- `symphony-integrator` — single-writer cherry-pick to `main`; evidence-gated closure (ADR-0012)
- `symphony-worktree-recovery` — state-only recovery (ADR-0005); no git mutation of active worktrees
- `bridge-watchdog` — monitors router + 8 executors; 10s health check timeout; does not monitor reconciler
- `worktree-health` — fleet health checks; currently **inactive** (dead)

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
- fetches issue detail for an explicitly assigned issue or sticky repair
- acquires and heartbeats a lease
- runs AI work
- validates results
- may commit and push worktree branch state
- updates Linear state and comments
- emits completion and retry metadata

The runner is now an executor only for global Linear work. It does not self-pick runnable issues from Linear state.

## Current recovery flow

The worktree recovery daemon currently does all of the following:

- scans all worktrees
- classifies them
- releases stale leases
- sets worktree state
- quarantines or reprovisions unsafe sandboxes
- performs bounded non-publishing sandbox maintenance for `reset_to_main` on inactive diverged worktrees
- runs detect-only baseline health checks and reports cspell failures for operator intervention

Recovery no longer auto-commits, pushes, or propagates git state. Its remaining filesystem mutation is limited to non-publishing sandbox reset of inactive worktrees.

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
