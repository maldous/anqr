# ADR-0005 State-Only Recovery And Divergence Policy

- Status: Accepted
- Date: 2026-04-12

## Context

The current recovery daemon releases leases, retries pushes, auto-commits dirty work, syncs worktrees, and can propagate changes after mainline repair.

That makes recovery a second git writer.

## Decision

Recovery is limited to state repair, quarantine, reprovision request, and stale-claim handling.

Divergence is resolved by sandbox disposal or explicit replan, not by hidden background mutation of active work.

### Sandbox maintenance exception

`reset_to_main` on inactive worktrees (no active lease) is classified as **sandbox maintenance**, not code publishing. It resets a diverged worktree to `origin/main` so it can be reused by the executor fleet. This is explicitly allowed because:

- It only affects worktrees with no active lease (defense-in-depth guard blocks active worktrees)
- It does not commit, push, or publish code
- It restores the worktree to a clean, known state for future use
- Evidence is emitted with `actionClass: "sandbox_reset"` and `isNonPublishing: true`
- On failure, it falls back to quarantine rather than leaving partial state

## Consequences

- no recovery `git add`, `git commit`, `git push`, or `git merge` anywhere in the daemon
- no recovery auto-commit or auto-push (including baseline health auto-fix — removed)
- no recovery merge into active or inactive worktrees (worktree propagation removed)
- no recovery reset of active worktree (active-lease guard enforced)
- sandbox reset of inactive diverged worktrees is allowed as maintenance (`git fetch` + `git reset` — no commit/push)
- baseline health check detects cspell failures and reports them for operator intervention — it does not auto-fix
- divergence becomes a visible state transition
- every recovery action emits structured evidence per ADR-0006
