# ADR-0007 Quality Gates And Mutating Work Admission

- Status: Accepted
- Date: 2026-04-12

## Context

The repository already exposes meaningful gate surfaces through `package.json` scripts and the `Makefile`.

The runtime needs a clear rule for what must run before mutating work can be admitted for integration.

## Decision

Mutating work is not complete when the model returns.

Mutating work is complete only when:

- required validation commands ran
- results were recorded truthfully
- candidate metadata exists
- integration admission succeeded or conflict was recorded explicitly

The minimum harness-focused gate set is:

- `npm run typecheck:harness`
- `npm run lint:harness`
- `npm run depcruise:harness`
- `npm run test:unit`

Escalate to `make quality-harness`, `make quality-fast`, or `make quality-full` according to change scope.

## Consequences

- gate results become part of candidate evidence
- fake green merges are prohibited
- operator confidence depends on recorded commands, not narrative claims
