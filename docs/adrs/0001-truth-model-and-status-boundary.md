# ADR-0001 Truth Model And Status Boundary

- Status: Accepted
- Date: 2026-04-12

## Context

Previous harness documentation mixed three different statements:

- what the runtime currently does
- what the team originally intended
- what the production target should become

That made review and recovery harder.

## Decision

Harness documentation must explicitly label statements as one of:

- current reality
- known nonconformance
- target requirement

Documentation truth order is:

1. runtime code
2. systemd units
3. observed logs and status output
4. tests as intent evidence
5. earlier documentation

## Consequences

- future docs must not describe a planned state as if it is already live
- current faults must remain visible until they are removed from code and runtime
- Structurizr views must model current runtime topology, not aspirational topology
