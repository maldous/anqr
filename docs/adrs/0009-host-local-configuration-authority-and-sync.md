# ADR-0009 Host Local Configuration Authority And Sync

- Status: Accepted
- Date: 2026-04-14

## Context

The current harness depends on host-local runtime configuration spread across repository files, user-level systemd environment files, Symphony environment files, and OpenClaw runtime files.

The source-grounded assessment confirmed that manual synchronization of those files is a live operational dependency, not merely a documentation issue.

That creates drift risk in auth, routing, provider access, webhook verification, and Discord behavior.

## Decision

The platform must define one authoritative configuration model for host-local automation runtime behavior.

Repository-defined runtime configuration may be the source model, but host-local rendered files must be generated, validated, or both.

Manual copy-and-remember synchronization is transitional only and must be detectable as drift.

Services that rely on rendered host-local configuration must fail fast when required configuration is missing, stale, or contradictory.

## Consequences

- configuration drift becomes an explicit engineering failure, not an operator surprise
- runtime startup and service validation must check configuration parity
- docs must identify which files are source artifacts and which files are rendered runtime artifacts
- future workstream completion claims involving service behavior must be judged against configuration authority, not only code changes
