# ANQR Harness Architecture Index

## Status

The harness is **not production safe in its current orchestration form**.

The runtime is partially implemented and actively used, but it still has structural faults:

- duplicated dispatch authority
- late lease acquisition
- long-lived mutable worktrees acting as execution sandboxes and durable task owners at the same time
- recovery logic that mutates git state
- repo integration that is serialized too late
- audit trails that are useful for inference but still weak for proof

This documentation set is written to replace mixed doctrine and partial remediation notes with one clear reference set.

## Read this set in order

1. [01-scope-status-and-truth-model.md](01-scope-status-and-truth-model.md)
2. [02-current-runtime-and-service-topology.md](02-current-runtime-and-service-topology.md)
3. [03-current-control-plane-and-flows.md](03-current-control-plane-and-flows.md)
4. [04-known-failures-and-evidence.md](04-known-failures-and-evidence.md)
5. [05-production-target-architecture.md](05-production-target-architecture.md)
6. [06-state-machines.md](06-state-machines.md)
7. [07-worktree-and-git-governance.md](07-worktree-and-git-governance.md)
8. [08-quality-gates-and-post-ai-processing.md](08-quality-gates-and-post-ai-processing.md)
9. [09-observability-and-audit.md](09-observability-and-audit.md)
10. [10-operations-runbooks.md](10-operations-runbooks.md)
11. [11-validation-and-rollout-plan.md](11-validation-and-rollout-plan.md)
12. [workspace/README.md](workspace/README.md)

## What this set governs

This set governs:

- `harness/ops/*`
- `services/systemd/*`
- `workspace.dsl`
- the worktree pool used by the executor fleet
- the control-plane contract for Discord and Linear sourced work
- post-AI validation, evidence, and merge admission

This set does not redefine the ANQR product architecture outside the harness.

## Key decisions captured here

- one repository may execute many jobs concurrently
- one repository must integrate one candidate at a time
- scheduler authority must be singular per repository
- leases are execution guards, not ingress dedupe
- worktrees are sandboxes, not the durable source of task truth
- recovery must repair state before it repairs git, and it must not mutate active execution baselines
