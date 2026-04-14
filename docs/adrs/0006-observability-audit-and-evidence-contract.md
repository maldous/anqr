# ADR-0006 Observability, Audit, And Evidence Contract

- Status: Accepted
- Date: 2026-04-14

## Context

Current logs are good enough to infer failure patterns but not strong enough to prove one end-to-end execution chain cleanly.

A prior draft of this ADR stated that every recovery action must be provably state-only. That wording was too strong for the actual recovery model because the platform still distinguishes between:

- state-only recovery actions
- quarantine and reprovision requests
- sandbox maintenance actions such as explicit reset or reprovision of non-active sandboxes

The safety boundary that matters most is not “no filesystem mutation whatsoever.” The safety boundary is:

- no hidden code publication by recovery
- no mutation of active sandboxes by unrelated recovery
- enough evidence to prove what class of recovery action occurred

## Decision

Every job must have stable IDs across ingress, claim, execution, recovery, and integration.

Every mutating candidate must record validation and integration evidence.

Every recovery action must emit evidence that identifies:

- action class
- target sandbox or state object
- reason
- ownership basis
- whether the action was state-only, quarantine/reprovision, or sandbox reset
- whether the action was non-publishing

Recovery evidence must be strong enough to prove that recovery did not publish code and did not mutate active work outside the allowed policy.

## Consequences

- correlation IDs alone are not enough
- claim IDs and execution attempt IDs become mandatory
- integration candidate IDs become mandatory
- recovery evidence must distinguish state-only actions from sandbox maintenance
- operator review becomes faster and more trustworthy
