# Observability And Audit

## Current strength

The current runtime already logs a lot of useful detail:

- service identity
- worktree identity
- queue and dispatch events
- some correlation IDs
- issue transitions
- integration attempts
- recovery actions

That is enough to infer major failures.

## Current weakness

It is still too hard to prove the exact causal chain for one job across ingress, claim, execution, recovery, and integration.

## Required audit fields

Every job needs these identifiers:

- `job_id`
- `source_event_id`
- `correlation_id`
- `claim_id`
- `execution_attempt_id`
- `integration_candidate_id`
- `integration_attempt_id`
- `repo_id`
- `worker_id`
- `sandbox_id`
- `worktree_id` when applicable

## Required logs

### Ingress

Log:

- original source
- normalized job class
- dedupe decision
- repo selection
- desired work record created

### Claim and scheduler

Log:

- claim creation
- actor creating claim
- capacity decision
- pool selection
- worktree or sandbox selection
- duplicate claim rejection

### Executor

Log:

- base SHA at start
- current HEAD at start
- worker and sandbox identity
- heartbeat renewals
- validation steps
- candidate emission

### Recovery

Log:

- stale detection reason
- worker liveness check
- state transition performed
- proof that no git mutation occurred

### Integrator

Log:

- candidate selected
- base SHA
- current mainline SHA
- merge or cherry-pick result
- conflict files
- integrated SHA

## Required metrics

- duplicate dispatch attempts
- duplicate claim rejections
- claim expiries
- lease mismatches
- validation failures
- integration conflicts
- stale-base rejections
- retries by issue
- quarantined sandboxes
- recovery actions by type
- mean queue age
- integration latency
- pool utilization by class

## Current audit gaps that must be closed

- no single authoritative claim record before dispatch
- no universal attempt ID threaded through all services
- too much reliance on local request counters
- no strong proof that recovery did not mutate active jobs
- no explicit candidate admission audit contract
