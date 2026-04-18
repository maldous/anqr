# Harness index

This is the active entry point for harness work.

## What the harness is

The harness is the repo-local automation system that coordinates:

- ingress from external systems
- isolated work execution in worktrees
- routing and scheduling
- evidence, validation, and integration
- host runtime through committed systemd units

## Read this when you work on harness code

1. `docs/program/01-anqr-1.0-definition.md`
2. `docs/adrs/0002-authoritative-claim-and-dispatch.md`
3. `docs/adrs/0003-executor-pool-and-worktree-boundaries.md`
4. `docs/adrs/0005-state-only-recovery-and-divergence-policy.md`
5. `docs/adrs/0006-observability-audit-and-evidence-contract.md`
6. `docs/adrs/0011-execution-state-model.md`
7. `docs/adrs/0012-evidence-gated-closure.md`
8. `docs/adrs/0013-shared-bridge-state-and-canonical-session-keys.md`
9. `harness/README.md`
10. `harness/ops/README.md`
11. `services/systemd/README.md`

## Current model at a glance

- systemd units are the committed host runtime entrypoints
- orchestration lives under `harness/ops/orchestration/`
- integrations live under `harness/ops/integrations/`
- runtime configuration lives under `harness/ops/runtime/openclaw-config/`
- repo-local tooling and helpers live under `harness/ops/tools/` and `harness/ops/lib/`

## Important boundary

Older review-heavy harness narratives and migration writeups are historical. Keep them in `docs/archive/`. Do not use them as first-read operating doctrine for current harness work.
