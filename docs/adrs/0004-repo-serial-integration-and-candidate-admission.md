# ADR-0004 Repo-Serial Integration And Candidate Admission

- Status: Accepted
- Date: 2026-04-12

## Context

Current execution allows parallel mutation but discovers many conflicts late, during cherry-pick integration.

The integrator is already single-writer by intent, but candidate admission rules are not explicit enough.

## Decision

Every mutating execution attempt must emit a candidate record that includes:

- repo
- job
- claim
- base SHA
- candidate SHA or patch identity
- changed paths
- validation summary

Integration is serialized once per repository.

Only the integrator may write the repository mainline.

## Consequences

- late conflict becomes an explicit candidate state
- base drift is handled through stale-base or conflict policy
- executors do not push to mainline
- merge-back remains parallel in execution but serial in admission
