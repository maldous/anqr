# ADR-0008 Main Repo Control Bridge And Boundary Exceptions

- Status: Accepted
- Date: 2026-04-14

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

## Consequences

- reviewers must not assume that the presence of worktrees alone guarantees complete isolation
- any main-repo mutation path must be called out directly in service docs and architecture docs
- workstream completion claims that rely on worktree isolation must be judged against this exception explicitly
- future changes that retain or expand main-repo mutation need a dedicated follow-on ADR or an update to this ADR
