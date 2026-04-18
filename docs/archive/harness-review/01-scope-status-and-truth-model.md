# Scope, Status, And Truth Model

> **⚠️ Pre-implementation architecture review document.** Written before Workstreams A–G. The truth model described here was formalized in ADR-0001 and ADR-0011. For current scope and status, see [PLAN.md](../../PLAN.md).

## Scope

The harness is the repository-local automation platform for ANQR. It currently covers:

- Discord sourced interactive requests
- Linear sourced issue execution
- provider routing and AI execution bridges
- queue control, reconciliation, integration, recovery, and watchdog loops
- quality gate execution and evidence generation
- operator diagnostics and support tooling

## Current status

Current status is:

- operational enough to run work
- observable enough to identify failure patterns
- not reliable enough for unattended production execution

The gap is not mainly model quality. The gap is control-plane correctness.

## Truth model

When documentation, tests, and runtime disagree, use this order:

1. committed runtime code
2. committed systemd units
3. observed logs and status outputs
4. tests as intent evidence
5. previous docs and architecture narratives

This rule exists because the current harness contains remediation-era services that were added after the original design, and those additions changed control-plane behavior.

## What must be documented as distinct concerns

Every harness document must separate:

- **current reality**
- **known nonconformance**
- **target requirement**

Those three concerns must never be blended into one statement.

## Current architectural intent

The intended operating model is:

- executors `wt1` to `wt4` serve Linear sourced work
- executors `wt5` to `wt8` serve Discord sourced work
- some requests are read-only
- some requests run commands
- some requests mutate repository content
- mutating work must pass quality gates and then merge back safely
- ancillary services exist to keep the platform healthy, not to compete with executors for control

That intent is reasonable.

The current implementation does not consistently preserve it.

## Production bar

The harness is only production ready when all of the following are true:

- an eligible job is claimed once per repository
- the claim exists before any worker starts executing
- only one component has authority to decide ownership
- active work is not invalidated by background git mutation
- merge-back is serialized per repository
- stale work is invalidated by state machine rules, not by ad hoc reset
- audit records can prove who owned work, when, on which base SHA, and why ownership changed
