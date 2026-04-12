# Operations Runbooks

## Principle

Operational safety comes before throughput.

When the control plane is under repair, disable mutation and keep read-only and diagnostic work separate.

## Runbook: controlled restart of routing or executor services

1. stop new mutating work admission
2. wait for active claims to drain or expire cleanly
3. verify no candidate is mid-integration
4. restart the target service
5. confirm health endpoints
6. resume admission

Current helper scripts such as `harness/ops/orchestration/symphony-control.mjs` may remain useful, but service restart must follow the claim and integration state, not only timer state.

## Runbook: duplicate execution suspected

1. identify the issue identifier
2. inspect scheduler, ingress, and router logs for duplicate trigger events
3. identify all claim or attempt records
4. cancel all but the authoritative claim
5. quarantine any sandbox with ambiguous mutation history
6. document the duplicate-dispatch root cause

## Runbook: stale lease

1. confirm worker heartbeat loss
2. confirm worker process liveness
3. expire claim after grace
4. requeue the job as a new attempt
5. preserve old attempt evidence
6. do not mutate the old sandbox in place unless it is explicitly quarantined and isolated

## Runbook: integration conflict

1. capture candidate metadata and conflicting paths
2. mark candidate `conflict`
3. do not reset the sandbox into a new hidden state
4. create a replan or manual-review path
5. admit no silent auto-merge claim

## Runbook: quarantined sandbox

1. preserve audit metadata
2. capture changed paths and current HEAD
3. remove from scheduling pool
4. reprovision a fresh sandbox
5. only requeue the job if the claim is no longer active and retry policy allows it

## Runbook: provider failure

1. classify provider failure
2. keep job ownership stable
3. retry inside provider policy if claim is still valid
4. do not re-dispatch the same job to another executor without expiring or releasing the claim first

## Runbook: Discord read-only degradation

If mutating repo work is disabled, Discord may still serve:

- read-only questions
- diagnostics
- documentation lookup
- repository search

That mode must be declared clearly in operator status.
