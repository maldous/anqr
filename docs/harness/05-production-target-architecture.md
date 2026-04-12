# Production Target Architecture

## Design objective

The target design must allow:

- parallel execution across many tasks
- exact or effective once claiming per repository
- safe merge-back
- clean propagation of upstream changes
- bounded retries
- reliable recovery
- full auditability

## Recommended control-plane model

Use a **repo-scoped authoritative scheduler**.

Per repository, the system must have:

- one ingress-normalization path
- one scheduler with exclusive claim authority
- one execution lease model
- one integration queue
- one integration writer

## Authoritative ownership boundaries

### Ingress

Ingress may:

- accept events
- normalize payloads
- dedupe delivery IDs
- classify work as read-only, command-only, or mutating
- write desired work into durable state

Ingress may not:

- choose the final executor
- grant durable ownership
- mutate repository state

### Scheduler

Scheduler may:

- compute eligible jobs
- reserve capacity
- create claims atomically
- assign a worker pool and executor
- requeue expired claims

Scheduler must be the only actor allowed to transition:

- `eligible -> claimed`

### Executor

Executor may:

- pull or receive a claimed job
- create a task sandbox
- heartbeat the lease
- run AI work and tools
- run quality gates
- emit candidate artifacts or branch state

Executor may not:

- decide global queue ownership
- integrate directly to `main`

### Integrator

Integrator may:

- read candidate queue
- verify base SHA and validation status
- merge or cherry-pick one candidate at a time per repo
- mark conflict, stale-base, or integrated outcomes

Integrator must be the only writer to the repository mainline.

### Recovery

Recovery may:

- detect dead workers
- expire claims
- requeue work
- quarantine sandboxes
- request reprovisioning

Recovery may not:

- commit
- push
- fast-forward
- rebase active sandboxes
- reset active sandboxes
- merge mainline changes into active sandboxes

## Recommended execution classes

### Read-only

Examples:

- simple questions
- repository search
- file counting
- explanation tasks

Policy:

- no integration path
- no branch publication
- no worktree required unless tools require repository access
- fast timeout and cheap retry

### Command-only

Examples:

- controlled shell commands
- diagnostics
- report generation

Policy:

- no integration path unless explicitly configured to persist artifacts
- sandbox required if filesystem mutation is possible
- evidence required when operator-visible outputs matter

### Mutating

Examples:

- file edits
- test additions
- refactors
- service file changes
- documentation updates

Policy:

- claim required before execution
- sandbox required
- pinned base SHA required
- quality gate policy required
- candidate admission required
- repo-serial integration required

## Recommended merge strategy

Use one of these two equivalent shapes:

- patch artifact submission to a single integrator
- task branch submission to a single integrator

In both cases:

- the executor does not update `main`
- the candidate records its base SHA
- the integrator decides admission against current `main`
- conflicts become explicit states, not silent resets

## Recommended stale work rules

- a claim is stale only after heartbeat expiry plus grace
- a candidate is stale if its base SHA no longer satisfies integration policy
- an active sandbox is invalid only when its claim expires or the operator cancels it
- upstream `main` movement does not justify background mutation of an active sandbox

## Multi-repo design

For multi-repo support, keep the same control-plane model but scope it per repo:

- claim namespace per repo
- executor pool mapping per repo
- integration queue per repo
- integration lock per repo

Cross-repo work becomes a parent job that coordinates child repo jobs with explicit dependency edges.

## Constraints for worktree viability

A worktree-based executor pool remains viable only if all of these are true:

- worktrees are sandboxes, not durable source of truth
- active worktrees are not background-mutated
- only the scheduler owns task claims
- only the integrator writes mainline
- worktree refresh happens only when idle or when the sandbox is reprovisioned

Without those constraints, the current worktree-first model is not reliable.
