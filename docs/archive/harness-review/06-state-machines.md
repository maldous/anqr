# State Machines

> **⚠️ Pre-implementation architecture review document.** Written before Workstreams A–G. The state model has been formalized in ADR-0011 with explicit transition maps, `transitionIssue()`/`transitionWorktree()` as sole lifecycle APIs, and durable execution ownership. See `harness/ops/core/symphony-state/README.md`.

## Why state machines matter

The harness currently has state, but the transitions are not strict enough.

Production behavior requires explicit state machines for jobs, claims, candidates, and sandboxes.

## Job lifecycle

### Read-only and command-only jobs

`received -> normalized -> eligible -> claimed -> executing -> completed`

Failure branches:

- `retry_wait`
- `failed`
- `dead_letter`

### Mutating jobs

`received -> normalized -> eligible -> claimed -> executing -> validation_pending -> candidate_ready -> integrating -> integrated`

Failure branches:

- `validation_failed`
- `stale_claim`
- `conflict`
- `retry_wait`
- `manual_review`
- `dead_letter`

## Claim lifecycle

`none -> claimed -> active -> expired -> released`

Required claim fields:

- `jobId`
- `repoId`
- `claimId`
- `executionAttemptId`
- `workerId`
- `pool`
- `claimedAt`
- `leaseExpiresAt`
- `baseSha`
- `jobClass`

## Lease lifecycle

`created -> heartbeating -> expired`

Lease exists to protect active execution.

Lease does not replace ingress dedupe or atomic claim.

## Candidate lifecycle

`none -> candidate_ready -> integrating -> integrated`

Failure branches:

- `conflict`
- `stale_base`
- `rejected`
- `manual_review`

Required candidate fields:

- `integrationCandidateId`
- `repoId`
- `jobId`
- `claimId`
- `baseSha`
- `candidateHeadSha`
- `changedPaths`
- `validationSummary`
- `createdAt`

## Worktree or sandbox lifecycle

`idle -> provisioned -> executing -> awaiting_disposal -> disposed`

Failure branches:

- `quarantined`
- `reprovisioning`

A sandbox is not an owner record.

It is disposable execution infrastructure.

## Current mismatch against target

The current runtime mixes issue state, lease state, worktree state, and finalization state, but still allows:

- external redispatch before claim
- recovery-driven mutation of git
- requeue without strong attempt identity
- late conflict discovery

The target model fixes that by making each transition authoritative and singular.
