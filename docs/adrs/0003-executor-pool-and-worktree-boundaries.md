# ADR-0003 Executor Pool And Worktree Boundaries

- Status: Accepted
- Date: 2026-04-12
- Updated: 2026-04-19

## Context

The current platform uses eight long-lived worktrees:

- `wt1` to `wt4` for Linear
- `wt5` to `wt8` for Discord

That pool split is useful, but worktrees are currently overloaded as sandboxes, durable owners, repair surfaces, and branch identities.

## Decision

Keep worktrees as executor sandboxes.

Do not use worktrees as the durable source of task truth.

Active sandboxes must not be background-mutated by recovery or unrelated synchronization.

## Consequences

- idle sandboxes may refresh from `origin/main`
- active sandboxes stay pinned to claim base until completion or expiry
- recovery may quarantine or reprovision a sandbox
- recovery may not commit, push, merge, or reset an active sandbox

## Boundary Enforcement (Workstream D)

Workstream D formalized the isolation boundary with code-level enforcement:

- **Bridge mode**: Each bridge instance is classified as `worktree` or `control-plane` via `BRIDGE_MODE` (see ADR-0008)
- **Startup validation**: `validateBoundaryInvariants()` runs at bridge startup to verify identity consistency
- **Mutation guard**: `assertMutationContext()` in the symphony-agent layer blocks file mutations targeting the main repo
- **Runner guard**: `symphony-runner/runtime.mjs` refuses to execute from the main repository without worktree context
- **Discord isolation**: `discord-request-router/process-and-proxy.mjs` logs isolation violations and blocks main-repo cwd
- **Path containment**: `remapRepoPathToBridgeRoot()` uses `isPathWithinRoot()` (not `startsWith`) to prevent prefix-based path traversal
- **Tests**: `boundary-enforcement.spec.ts` proves all six defense layers

The one approved exception is the Codex bridge (`anqr-symphony-codex.service`), which runs with `BRIDGE_MODE=control-plane` for developer tooling only. See ADR-0008 for full details.

## Current Status

The executor pool and worktree boundaries have been implemented as described. The current system state matches the documentation.