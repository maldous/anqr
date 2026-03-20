# Harness Operating Model

The harness exists to run governed engineering work with minimal human supervision while staying truthful about scope, quality, and escalation.

## Core loop

The maintained control flow is:

`harness-report -> linear-guardian -> queue control -> symphony runner -> notify`

Supporting jobs:

- nightly ops pass
- email ingest
- Sonar sync and audit
- provider credit/routing checks

## Surfaces

- `scripts/ops/*`
  - canonical harness runtime
- `services/systemd/*`
  - canonical local operator automation runtime
- Linear
  - issue system of record for active work
- reports
  - generated evidence and operational output

## Required behavior

- keep the harness separate from product request-path code
- keep launch truth in docs, not in prompt fragments
- prefer dry-run and evidence-first modes before mutation
- escalate secrets, approvals, billing, and launch-claim changes to humans

## Degraded mode

The harness must remain usable in reduced environments:

- with provider fallbacks
- with queue dry-runs instead of mutation
- with public MCP/API running even if authenticated hardening is not enabled

When degraded, the system must say so explicitly instead of pretending full capability.
