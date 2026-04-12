# Validation And Rollout Plan

## Goal

Prove the architecture is correct before trusting it with unattended mutating work.

## Required validation suites

### Duplicate-dispatch suite

Prove:

- webhook and reconciler can fire together
- only one claim is created
- all later claim attempts are rejected cleanly

### Lease-expiry suite

Prove:

- worker heartbeat loss expires the claim once
- recovery requeues state without mutating git
- retries create a new execution attempt

### Integration-conflict suite

Prove:

- two overlapping candidates can execute in parallel
- only one integrates first
- the other becomes `conflict` or `stale_base`
- no hidden reset converts conflict into fake success

### Restart suite

Prove:

- restarting webhook, router, scheduler, integrator, or recovery does not duplicate an active claim
- integration queue survives restart
- idle sandboxes refresh safely after restart

### Multi-repo suite

If multi-repo support is planned, prove:

- repo A integration conflict does not block repo B
- claims are unique within repo scope
- cross-repo parent jobs respect dependency order

## Rollout stages

### Stage 1

- documentation and state-machine alignment
- control-plane authority reduction
- recovery changed to state-only behavior

### Stage 2

- atomic claim before dispatch
- candidate admission contract
- repo-serial integration enforcement

### Stage 3

- concurrency and failure-injection tests
- operator dashboards and metrics
- dry-run shadow execution

### Stage 4

- limited mutating production rollout
- bounded issue classes only
- explicit incident review after every conflict, duplicate, or stale-claim event

## Exit criteria for production

The mutating platform is production ready only when all of these hold:

- zero duplicate claims in forced-concurrency tests
- zero background git mutation by recovery
- one writer to mainline per repo
- full audit chain from event to integration
- deterministic recovery after restart
