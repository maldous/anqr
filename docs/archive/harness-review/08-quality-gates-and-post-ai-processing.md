# Quality Gates And Post-AI Processing

> **⚠️ Pre-implementation architecture review document.** Written before Workstreams A–G. Quality gates and evidence-gated closure are now enforced — see ADR-0007 (quality gates), ADR-0012 (evidence-gated closure), and `harness/ops/core/task-evidence/README.md`.

## Purpose

Post-AI processing is mandatory for any mutating task.

The executor is not done when the model stops. It is done when the work has been validated, evidenced, and admitted for integration.

## Gate tiers from the current repository

### Base repository gates

The current repository exposes these important gate surfaces:

- `make quality-fast`
- `make quality-release`
- `make quality-harness`
- `make quality-full`

The current script layer also exposes targeted commands such as:

- `npm run typecheck:harness`
- `npm run lint:harness`
- `npm run depcruise:harness`
- `npm run test:unit`
- `npm run queue:all:dry-run`
- `npm run linear:reconciler:once`
- `npm run harness:doctor`

## Required gate policy by task class

### Read-only

Required:

- no repository gates
- response evidence only when operator requested or when the task informs later action

### Command-only

Required:

- command exit status
- output capture
- any relevant diagnostics
- no integration path unless artifacts are intentionally persisted

### Mutating harness work

For changes touching `harness/*`, `services/systemd/*`, or `docs/harness/*`, the default minimum policy is:

1. targeted repo validation
   - `npm run typecheck:harness`
   - `npm run lint:harness`
   - `npm run depcruise:harness`
2. baseline regression
   - `npm run test:unit`
3. harness dry-run checks when orchestration logic changed
   - `make quality-harness`

For broader or cross-cutting repository changes, the candidate admission policy should escalate to:

- `make quality-fast`

For release-grade change sets or production rollout work, candidate admission should escalate to:

- `make quality-full`

## Evidence required after mutating work

Every candidate must record:

- commands run
- pass or fail result for each command
- changed paths
- base SHA
- candidate SHA
- integration decision
- rollback note or conflict note
- follow-up required

## Current gap

The current harness has evidence generation and gate surfaces, but it does not yet enforce a clean candidate admission policy before merge-back.

That policy is mandatory for production.
