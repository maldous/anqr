# ADR-0006 Observability, Audit, And Evidence Contract

- Status: Accepted
- Date: 2026-04-12

## Context

Current logs are good enough to infer failure patterns but not strong enough to prove one end-to-end execution chain cleanly.

## Decision

Every job must have stable IDs across ingress, claim, execution, recovery, and integration.

Every mutating candidate must record validation and integration evidence.

Every recovery action must be provably state-only.

## Consequences

- correlation IDs alone are not enough
- claim IDs and execution attempt IDs become mandatory
- integration candidate IDs become mandatory
- operator review becomes faster and more trustworthy
