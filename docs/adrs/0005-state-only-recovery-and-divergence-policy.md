# ADR-0005 State-Only Recovery And Divergence Policy

- Status: Accepted
- Date: 2026-04-12

## Context

The current recovery daemon releases leases, retries pushes, auto-commits dirty work, syncs worktrees, and can propagate changes after mainline repair.

That makes recovery a second git writer.

## Decision

Recovery is limited to state repair, quarantine, reprovision request, and stale-claim handling.

Divergence is resolved by sandbox disposal or explicit replan, not by hidden background mutation of active work.

## Consequences

- no recovery auto-commit
- no recovery auto-push
- no recovery merge into active worktree
- no recovery reset of active worktree
- divergence becomes a visible state transition
