# Maintained Control Flow

This document defines the maintained harness control flow for ANQR 1.0.

## Primary loop

The maintained flow is:

1. `harness-report`
2. `linear-guardian`
3. `queue control`
4. `symphony runner`
5. `notify`

## Components

### 1. Harness report

- root entrypoint: `scripts/ops/harness-report.mjs`
- implementation: `scripts/ops/reporting/harness-report.mjs`
- purpose:
  - report repo and gate health
  - provide quick, continuous, and full views

### 2. Linear guardian

- root entrypoint: `scripts/ops/linear-guardian.mjs`
- implementation: `scripts/ops/governance/linear-guardian.mjs`
- purpose:
  - enforce issue hygiene
  - create or normalize governance-level issues
  - keep required labels and policy shape intact

### 3. Queue control

- root entrypoint: `scripts/ops/symphony-queue-control.mjs`
- implementation: `scripts/ops/orchestration/symphony-queue-control.mjs`
- purpose:
  - feed execution-ready work
  - enforce queue limits
  - detect stale or stuck work
  - act as the maintenance layer behind the runner

### 4. Symphony runner

- root entrypoint: `scripts/ops/symphony-runner.mjs`
- implementation: `scripts/ops/orchestration/symphony-runner.mjs`
- purpose:
  - pick ready work from Linear
  - execute via configured providers
  - run validation and evidence steps
  - update issue state and comments

### 5. Notify

- root entrypoint: `scripts/ops/notify.mjs`
- implementation: `scripts/ops/lib/notify.mjs`
- purpose:
  - send operational notifications
  - apply dedup/rate limiting to operator notifications

## Supporting flows

- nightly:
  - `scripts/ops/nightly-ops-pass.mjs`
  - orchestrates broader recurring checks and reporting
- email ingest:
  - `scripts/ops/email-ingest.mjs`
  - optional operator integration that turns selected mail into issues
- sonar sync:
  - `scripts/ops/integrations/sonar/sonar-linear-sync.mjs`
  - keeps Sonar findings visible in Linear

## Additional scripts

### Linear utilities

- `scripts/ops/linear-all.mjs` — Fetches all backlog issues from Linear, handling pagination. Used for bulk operations and reporting.
- `scripts/ops/linear-issue-review.mjs` — Performs one-time review and correction of open Linear issues to ensure they adhere to hexagonal architecture contracts.
- `scripts/ops/integrations/linear/linear-client.mjs` — Helper library for Linear API. Provides reusable functions for Linear operations (query building, mutations, etc.).

### Diagnostics

- `scripts/ops/harness-doctor.mjs` — Performs runtime diagnostics and health checks on the AI harness. Validates environment, tokens, services, and connectivity.

## Truth rules

- root `scripts/ops/*` entrypoints remain the stable operator contract
- structured subdirectories are the preferred implementation ownership locations
- duplicate or legacy helper locations must not be removed until their replacement path is recorded and accepted

## Degraded mode

The harness may run in degraded mode when:

- provider tokens are absent
- local model services are unavailable
- notification sinks are unavailable
- queue mutation is intentionally disabled via dry-run

In degraded mode:

- dry-run and read-only visibility are preferred
- the system must say which capability is degraded
- the public product runtime must not depend on the harness loop for basic QR generation
