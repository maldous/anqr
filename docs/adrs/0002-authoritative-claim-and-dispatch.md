# ADR-0002 Authoritative Claim And Dispatch

- Status: Accepted
- Date: 2026-04-14

## Context

The current runtime allowed more than one component to discover and dispatch runnable Linear work:

- webhook receiver
- backlog reconciler
- runner self-pick behavior

A lease was acquired too late to prevent duplicate dispatch.

Workstream A introduces a dedicated scheduler, a durable `claimIssue()` transition, and ingress paths that write desired work instead of directly dispatching. It also introduces a migration flag.

That change makes two additional boundaries material:

- the scheduler owns global `eligible -> claimed`
- the router remains a transport surface and must not become an alternate claim authority

It also makes the role of desired-work signals explicit. Desired-work records are ingress intent and dedupe hints. They are not, by themselves, the authoritative source of runnable work.

## Decision

Per repository, one scheduler owns the transition:

- `eligible -> claimed`

That claim must be atomic and durable.

Ingress may create desired-work signals and dedupe deliveries.

Authoritative eligibility remains a scheduler decision derived from repository truth sources such as Linear state and durable local execution state.

Executors may only execute already-claimed work.

In authoritative mode:

- webhook receiver is write-only ingress
- reconciler feeds scheduler intent and repair inputs, but does not directly dispatch runnable work
- runners do not self-pick global runnable work
- router accepts scheduler-assigned work for transport and worktree selection, but does not originate global ownership
- every router dispatch path — both trigger and queue-drain — verifies the scheduler claim before forwarding to an executor

The migration flag `SCHEDULER_AUTHORITATIVE` is retained as a permanent `true` constant for documentation. The authoritative scheduling model is the only supported mode.

The scheduler always assigns a `worktreeId` at claim time. Claims without worktree assignment are not created — the scheduler skips an issue if no worktree is available. The router rejects dispatch for claims missing `assignment.worktreeId`.

## Consequences

- webhook receiver no longer grants ownership
- reconciler no longer directly dispatches runnable work
- runner no longer self-picks global runnable work
- duplicate dispatch becomes observable as rejected claim attempts rather than double execution
- desired-work queue semantics must be documented and tested as advisory ingress, not independent truth
- router verifies scheduler claims on all dispatch paths (trigger endpoint and queue drain) — no bypass mode exists
- the flag is permanent
