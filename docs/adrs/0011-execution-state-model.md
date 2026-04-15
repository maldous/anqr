# ADR-0011 Execution State Model

- Status: Accepted
- Date: 2026-04-16

## Context

Workstream B (state model normalization) identified that execution authority was split across three domains:

- Linear issue state (external service)
- durable local harness state (filesystem-backed JSON)
- transient router memory (in-process counters)

Before normalization, these three domains competed for truth about execution ownership. Router counters were treated as correctness inputs for scheduling. Local state lacked a formal lifecycle model. Linear state and local state could disagree after restarts, retries, and recovery events.

Phases 0–6 of Workstream B resolved this by establishing a single authoritative execution state model with explicit truth boundaries.

## Decision

The platform defines three truth domains with strict authority boundaries:

### 1. Linear — Desired work truth

Linear is the authoritative source for **what work exists and what its desired status is**.

- Issue existence, priority, labels, and workflow state (Todo, In Progress, Done, Canceled) are Linear's authority
- The scheduler reads Linear state to discover eligible work
- Local state does not override Linear's desired-status authority
- Linear state alone does not determine execution ownership — an issue being "In Progress" in Linear does not prove a local executor owns it

### 2. Durable local state — Execution ownership truth

The filesystem-backed harness state (`symphony-state`) is the authoritative source for **who owns what execution and what lifecycle phase it is in**.

Durable local state owns:

- **Issue lifecycle phase** — derived by `inferExecutionPhase()` from lease, finalization, cooldown, blocked, and completed fields
- **Lease ownership** — active lease with owner, nonce, expiry
- **Worktree assignment** — which worktree is assigned to which issue (`worktreeStates[wtId].assignedIssue`)
- **Worktree lifecycle state** — available, executing, quarantined, dirty_repairable, diverged
- **Finalization progress** — validation, commit, push, integration, evidence stages
- **Integration candidacy** — derived from `finalization.state` (not a separate queue)
- **Cooldown, retry, and blocked status**

Key properties:

- All lifecycle transitions go through `transitionIssue()` and `transitionWorktree()` — the sole lifecycle write APIs
- `claimAndAssignWorktree()` sets both issue and worktree ownership atomically under one lock
- `releaseLease()` clears both issue lease and worktree ownership atomically under one lock
- `loadState()` normalizes worktree records on load via `normalizeWorktreeRecord()`
- State survives process restart — all scheduling decisions that affect correctness are derived from durable state
- `patchIssueState()` is retained only for metadata-only writes (retry count, latency, source) that do not determine lifecycle phase

### 3. Router memory — Observation only

In-process transient counters (`activeRequests`, `failures`, round-robin index) in the router are **observation and load-shedding aids only**.

- Router counters do not determine execution ownership
- Router counters do not gate scheduling decisions
- On startup, counters are reconstructed from durable worktree state (startup reconstruction)
- Periodic reconciliation (`reconcileWorktreeCounters()`) syncs counters with durable state
- Even with zeroed counters (fresh restart, no reconciliation yet), the router makes correct decisions because:
  - `selectLinearWorktree()` filters by durable worktree state, not counters
  - `handleLinearTrigger()` trusts scheduler's durable assignment, not counter-based busy checks
  - Queue drain uses durable state for available-slot counting

### Authority hierarchy

```
Scheduling decision: "Should this issue be claimed?"
  → Linear state (eligible work) + durable local state (not already claimed/blocked/cooling)

Execution ownership: "Who owns this execution?"
  → Durable local state only (lease + assignment)

Worktree availability: "Is this worktree free?"
  → Durable local state only (worktreeStates[wtId].state)

Load observation: "How busy is the fleet?"
  → Router memory (transient counters, reconciled from durable state)
```

## Consequences

- Router and scheduler no longer rely on transient memory for correctness
- All execution ownership is reconstructable from durable state after restart
- `integrationQueue` as a persistent artifact is eliminated — candidacy is derived from `finalization.state`
- Ownership fallbacks (git-log heuristic, issue reverse-scan) are retained for repair context only and log warnings when activated
- Recovery can safely inspect durable state to determine ownership without trusting process-local memory
- The three truth domains are testable independently: Phase 6 tests prove no-transient-correctness, claim lifecycle, and stale lease handling
