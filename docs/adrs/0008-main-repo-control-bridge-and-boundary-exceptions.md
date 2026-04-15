# ADR-0008 Main Repo Control Bridge And Boundary Exceptions

- Status: Accepted
- Date: 2026-04-14
- Updated: 2026-04-16 (Workstream D enforcement)

## Context

The platform primarily uses managed git worktrees as autonomous execution sandboxes.

However, the project understanding and source-grounded assessment identified an intentional main-repo exception through the Codex bridge and path-remapping logic. Without an explicit ADR, reviewers can incorrectly assume that all autonomous execution is worktree-confined.

That omission weakens interpretation of scheduler, recovery, and safety changes because repository mutation risk depends on whether main-repo execution is allowed.

## Decision

Managed worktrees remain the default boundary for autonomous code-changing execution.

A main-repo control bridge may exist only as an explicit exception with clearly documented mode restrictions.

Unless separately ADR-approved, main-repo bridge execution must be treated as non-mutating control-plane execution.

Any code-changing main-repo execution path must be explicit, separately justified, and protected by dedicated controls and evidence.

Path remapping between the control checkout and bridge root must not silently widen a read-only or control-only path into an unrestricted mutation path.

## Enforcement (Workstream D)

### Bridge Mode

Every bridge instance has a `BRIDGE_MODE` that classifies its execution boundary:

| Mode            | BRIDGE_ROOT         | Mutations target | Used by                   |
| --------------- | ------------------- | ---------------- | ------------------------- |
| `worktree`      | Managed worktree    | Worktree sandbox | `anqr-symphony-executor@` |
| `control-plane` | Main repo (control) | Main checkout    | `anqr-symphony-codex`     |

`BRIDGE_MODE` is derived automatically by comparing `BRIDGE_ROOT` against `CONTROL_REPO_ROOT`. It can also be set explicitly via the `BRIDGE_MODE` environment variable in the systemd service file.

### Defense Layers

Six defense layers enforce worktree isolation. For each layer, the codex bridge is the documented exception:

| Layer                     | Worktree executors (wt1-wt8) | Codex bridge (port 4330)   |
| ------------------------- | ---------------------------- | -------------------------- |
| Config routing            | ✅ Ports 4321-4328           | ⚠️ Port 4330 (separate)    |
| Router cwd rebasing       | ✅ Routes to executor pool   | N/A (not in executor pool) |
| Systemd WorkingDirectory  | ✅ `%h/src/anqr-wt%i`        | ⚠️ `%h/src/anqr` (main)    |
| Process cwd               | ✅ Worktree directory        | ⚠️ Main repo directory     |
| Codebuff client isolation | ✅ Keyed by costMode+cwd     | ✅ Keyed by costMode+cwd   |
| File operations           | ✅ Resolve to worktree       | ⚠️ Resolve to main repo    |

### Startup Validation

`validateBoundaryInvariants()` runs at bridge startup and verifies:

1. `IS_WORKTREE_BRIDGE` and `BRIDGE_MODE` are consistent
2. Control-plane bridges have `BRIDGE_ROOT === CONTROL_REPO_ROOT`
3. Worktree bridges have `BRIDGE_ROOT !== CONTROL_REPO_ROOT`

Inconsistencies are logged as errors for operator investigation.

### Key Constraint

The codex bridge (`BRIDGE_MODE=control-plane`) is a **developer tool**, not an autonomous execution path. The scheduler, router, and reconciler must NEVER route autonomous work to the codex bridge. Only the Codex CLI or operator-initiated requests may use it.

### Tests

`boundary-enforcement.spec.ts` proves:

- Executor service files use worktree WorkingDirectory
- Codex service file uses main repo with explicit `BRIDGE_MODE=control-plane`
- `assertMutationContext` blocks main-repo mutations in the symphony-agent layer
- `remapRepoPathToBridgeRoot` uses safe containment checks (not startsWith)
- Bridge startup calls `validateBoundaryInvariants()`

## Consequences

- reviewers must not assume that the presence of worktrees alone guarantees complete isolation
- any main-repo mutation path must be called out directly in service docs and architecture docs
- the codex bridge is the only approved main-repo mutation path and must not be used for autonomous execution
- workstream completion claims that rely on worktree isolation must be judged against this exception explicitly
- future changes that retain or expand main-repo mutation need a dedicated follow-on ADR or an update to this ADR
- `BRIDGE_MODE` must be set or derivable for every bridge instance
