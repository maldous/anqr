# ADR-0002 Authoritative Claim And Dispatch

- Status: Accepted
- Date: 2026-04-12

## Context

The current runtime allows more than one component to discover and dispatch runnable Linear work:

- webhook receiver
- backlog reconciler
- runner self-pick behavior

A lease is acquired too late to prevent duplicate dispatch.

## Decision

Per repository, one scheduler will own the transition:

- `eligible -> claimed`

That claim must be atomic and durable.

Ingress may create desired work and dedupe deliveries.

Executors may only execute already-claimed work.

## Consequences

- webhook receiver no longer grants ownership
- reconciler no longer directly dispatches runnable work
- runner no longer self-picks global runnable work
- duplicate dispatch becomes observable as rejected claim attempts rather than double execution
