# ADR-0003 Executor Pool And Worktree Boundaries

- Status: Accepted
- Date: 2026-04-12

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
