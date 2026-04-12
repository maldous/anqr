# Known Failures And Evidence

## Summary

The current failures are structural.

Provider rate limits, individual AI errors, and flaky tasks exist, but they are not the main reason the harness behaves unpredictably.

## Evidence-backed failure list

| Failure                                     | Current evidence                                                                                                                                                         | Current mechanism                                                                            | Required correction                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Duplicate Linear dispatch                   | Router logs show the same issue dispatched to more than one worktree. Example: `ANQ-1580` was sent to `wt1` and `wt2` within about one second.                           | Webhook and reconciler both triggered dispatch before a durable claim existed.               | Create an atomic claim before dispatch and make one scheduler authoritative per repo.                                    |
| Repeated replay of the same issue           | Router and reconciler logs show repeated redispatch of `ANQ-1617`.                                                                                                       | Reconciler re-sees work as eligible because ownership and retry state are not stable enough. | Separate ingress from claim. Reconciler may only requeue expired claims, not redispatch runnable work opportunistically. |
| Lease loss during execution and validation  | Integration tests and logs include `lease_mismatch` and abandonment flows.                                                                                               | Lease starts too late and competes with other state mutations.                               | Move durable claim earlier. Keep lease as execution heartbeat only.                                                      |
| Recovery mutates git                        | `anqr-symphony-worktree-recovery.service` sets `ANQR_AUTOMATION_COMMIT=1` and `ANQR_AUTOMATION_PUSH=1`. Recovery code performs commit, push, sync, and propagation work. | Recovery is acting as a second git writer.                                                   | Make recovery state-only. Do not allow background repair to commit, push, merge, or reset active workspaces.             |
| Late conflict discovery                     | Integrator logs show repeated cherry-pick conflicts for `ANQ-1617` before a later success.                                                                               | Conflict is discovered after local execution, not at claim or candidate admission time.      | Make candidate admission explicit and repo-serial. Treat base SHA drift as a first-class invalidation rule.              |
| Split scheduling authority                  | Webhook, reconciler, runner self-pick, queue control, and recovery all influence runnable work.                                                                          | The control plane is split.                                                                  | Introduce one repo-scoped scheduler with exclusive claim authority.                                                      |
| Capacity is advisory, not authoritative     | Router chooses least-loaded worktree using local `activeRequests`.                                                                                                       | Local request counters do not prove issue ownership.                                         | Capacity decisions must consume durable claim state, not only in-memory request counters.                                |
| Worktrees drift and get repaired under load | Recovery and runner both sync or repair against `origin/main`.                                                                                                           | Worktree baseline can move under or between executions.                                      | Idle worktrees may refresh. Active worktrees must stay pinned to claim base until completion or expiry.                  |
| Tests miss the control-plane failure mode   | Current tests verify webhook ingress, worktree creation, and some lease-loss behavior. They do not prove scheduler exclusivity under concurrent ingress.                 | Tests prove local intent, not distributed correctness.                                       | Add duplicate-dispatch, split-brain, restart, conflict, and lease-expiry concurrency tests.                              |

## Current nonconformances that must be documented openly

### The system is not effectively once

The current runtime is not effectively-once for mutating Linear work.

It is at best at-least-once with manual cleanup.

### Ancillary services are not ancillary enough

`linear-reconciler`, `symphony-worktree-recovery`, and parts of runner behavior are shaping execution ownership and git state.

That violates the intended model where executors do work and support services only recover from failure.

### Worktree identity is overloaded

A worktree currently represents:

- a pool slot
- a long-lived branch
- a mutable sandbox
- a repair surface
- a possible durable owner of issue progress

Those roles should be split.

### Existing documentation mixed intent with remediation

Previous docs often described a desired state as if it already existed.

This set replaces that with explicit status labeling.
