# Worktree And Git Governance

> **⚠️ Pre-implementation architecture review document.** Written before Workstreams A–G. Worktree isolation is now enforced by six defense layers (ADR-0003, ADR-0008), recovery is non-publishing (ADR-0005), and worktree assignment is atomic and durable (ADR-0011). See `harness/ops/orchestration/symphony-worktree-recovery/README.md`.

## Current worktree policy

The current fleet uses eight long-lived worktrees:

- `wt1` to `wt4` for Linear
- `wt5` to `wt8` for Discord

That split is acceptable as a pool definition.

It is not acceptable as a durable ownership model.

## Required worktree policy

### What a worktree is

A worktree is:

- an executor sandbox
- a filesystem and git isolation boundary
- a disposable pool slot

A worktree is not:

- a durable source of task truth
- the authoritative scheduler state
- the recovery authority
- a reason to mutate other active worktrees

## Refresh rules

### Allowed

- refresh idle worktrees from `origin/main`
- reprovision quarantined worktrees
- discard completed task sandboxes
- rehydrate a fresh sandbox for a retry attempt

### Forbidden

- fast-forward active worktrees under an active claim
- merge `main` into active worktrees in the background
- auto-commit dirty active worktrees from recovery
- push active worktree branches from recovery
- reset active worktrees because another branch integrated

## Branch and base rules

Every mutating attempt must record:

- repository
- branch or patch identity
- base SHA
- execution attempt ID

Every integration attempt must compare candidate base SHA to current mainline state.

## Conflict policy

When two mutating jobs overlap in the same repository:

- both may execute in parallel
- only one candidate may integrate at a time
- later candidates must be checked against the new base
- conflict becomes an explicit state
- the platform must not hide the conflict with reset-and-retry loops

## Invalidating stale work

A task becomes stale when:

- its claim expires
- its worker dies and heartbeat grace elapses
- its candidate cannot satisfy current integration policy
- an operator cancels it

A task does not become stale merely because:

- another task integrated first
- recovery decided to resync the pool
- queue depth changed

## Multi-repo rule

If the platform expands beyond one repo, each repo needs its own:

- scheduler state
- integration queue
- integration lock
- sandbox pool policy

Cross-repo work must be coordinated above the repo layer, not by sharing one blind scheduler loop.
