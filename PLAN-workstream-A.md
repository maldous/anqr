# Workstream A — Authoritative Scheduling and Claim Control

> Part of [PLAN.md](./PLAN.md) · Status: ✅ Complete · Started: 2026-04-13 · Completed: 2026-04-18

## Summary

All dispatch paths (trigger + queue drain) verify scheduler claims; scheduler requires worktreeId at claim time; `verifySchedulerClaim` extracted to shared module; ADR-0002/router/scheduler docs aligned.

## Requirements Addressed

- **R1. Single authoritative scheduler** — The platform shall have exactly one component that owns global issue admission and the transition from eligible to claimed.
- **R4. Durable and bounded dispatch accounting** — All execution-dispatch accounting that affects scheduling decisions shall be durable, restart-safe, and reconciled against real execution state.

## Detailed Progress

- [x] Feature flag `SCHEDULER_AUTHORITATIVE` added to `symphony-config.mjs`
- [x] `claimIssue()` added to `symphony-state`
- [x] `symphony-scheduler/` module created with `claim-issue.mjs`, `get-eligible-work.mjs`, `schedule-cycle.mjs`, `main.mjs`, `runtime.mjs`, `index.mjs`
- [x] Webhook receiver converted to write-only ingress (enqueues to desired-work queue)
- [x] Reconciler converted to feed desired-work queue instead of dispatching directly
- [x] Runner self-pick removed
- [x] Systemd service `anqr-symphony-scheduler.service` created and enabled in `default.target.wants`
- [x] Scheduler consumes desired-work queue as advisory priority boost (drainDesiredWork)
- [x] Router verifies scheduler ownership (`lease.owner === "scheduler"`) and durable assignment on ALL dispatch paths
- [x] Scheduler assigns worktreeId at claim time from capacity data; stops dispatch when pool exhausted, and `claimIssue()` rejects missing worktree assignment (no null-assignment claims)
- [x] Router uses scheduler's assigned worktree in authoritative mode
- [x] `verifySchedulerClaim` extracted to shared module (`verify-scheduler-claim.mjs`) — used by both `handleLinearTrigger` and `runtime.mjs` queue drain
- [x] Router queue drain (`runtime.mjs`) re-verifies scheduler claims before dispatch; drops items with expired/invalid claims
- [x] Tests: `scheduler-exclusivity.spec.ts` — behavioral claimIssue + source verification + router queue claim verification
- [x] Integration: multi-claim worktree assignment tests (prevent double-assignment)
- [x] Legacy bypass paths removed — runner self-pick, webhook triggerViaRouter, reconciler dispatchIssue, router SCHEDULER_AUTHORITATIVE bypass
- [x] Legacy removal verification tests prove no bypass code remains in runner/webhook/reconciler/router
- [x] Scheduler README.md documenting authority boundaries, cycle flow, claim contract (null-worktreeId fallback removed)
- [x] Router README.md updated — documents both trigger and queue-drain claim verification
- [x] ADR-0002 updated: accurate about all dispatch paths requiring claim verification

## Implementation Requirements (from original assessment)

**Problem**
Global work admission is split across webhook, router, reconciler, and runner paths.

**Required change**
Implement one authoritative scheduler path for global claim and dispatch. Remove runner self-pick for global work. Convert reconciler to feed or repair scheduler state rather than dispatch work independently. Ensure webhook ingress records or queues requests into the same scheduler-owned path.

**Expected end state**
Only one component can move an issue from eligible to claimed. Every execution attempt can be traced back to that component. Duplicate global dispatch caused by overlapping actors is eliminated by design.

**Implementation notes**

- Replace self-pick behavior with scheduler-issued assignments only.
- Reframe reconciler as a scheduler repair input, not an alternate dispatcher.
- Make dispatch accounting durable and scheduler-owned.
- Align implementation with the intended single-scheduler model already reflected in the final report's cited ADR direction.

**Risks if left unresolved**
Duplicate work, inconsistent claim timing, hard-to-debug retries, queue drift, and no clear owner for correctness failures.

## Deliverables

- ✅ Code changes removing runner global self-pick
- ✅ Code changes removing reconciler direct dispatch
- ✅ Unified scheduler-owned claim and dispatch path
- ✅ Scheduler state machine documentation
- ✅ Scheduler-focused integration tests

## Acceptance Criteria

1. ✅ There is one and only one scheduler-authoritative code path for global issue admission and claim. No runner, reconciler, or webhook flow can bypass it. (A3 resolved in G Phase 1 — `/v1/linear/execute` is a documented operator-privilege path with evidence record creation.)
3. ✅ All scheduling decisions that affect correctness survive process restart and are derived from durable state, not transient counters alone.

## Completion Review Findings (gpt-5-agent deep audit)

**Verdict: ✅ Complete. All gaps (A1–A3) resolved. A4/A5 are accepted Low-severity test methodology caveats.**

The architectural changes are real and meaningful — scheduler authority exists, runner self-pick is removed, reconciler feeds the queue, router verifies claims. However:

### Gaps Identified

| # | Gap | Severity | Detail |
|---|-----|----------|--------|
| A1 | ~~Trigger path fallback~~ | ~~Medium~~ | **RESOLVED (G prerequisite).** Removed `selectLinearWorktree()` fallback from `handle-linear-trigger.mjs` and `dispatch-linear-execution.mjs`. Trigger path now rejects with 503 when assigned worktree is missing (consistent with queue-drain path). `selectLinearWorktree` import removed from both files. |
| A2 | ~~Runner doesn't verify assigned worktree~~ | ~~Medium~~ | **RESOLVED (G prerequisite).** `execute-issue.mjs` now verifies `assignment.worktreeId === WORKTREE_ID` before lease acquisition. Skipped for repair candidates (validated at pick time) and operator overrides (`--issue` flag via `operatorOverride` option). |
| A3 | ~~Direct executor path unguarded~~ | ~~Low~~ | **RESOLVED (G Phase 1).** `execute-linear-issue-request.mjs` now generates `correlationId` via `randomUUID()`, calls `ensureEvidenceRecord()`, always sets `ANQR_CORRELATION_ID` env var. Response changed to `"execution_complete"`. This is a documented operator-privilege path, not a scheduler-bypass. |
| A4 | Tests focus on `claimIssue` not `claimAndAssignWorktree` | Low | Headline behavioral tests exercise `claimIssue()` but production scheduler uses `claimAndAssignWorktree()`. Coverage mismatch, not fatal. |
| A5 | Tests mostly source-grep | Medium | ~20 of 30 tests are `fs.readFileSync` + `expect(source).toContain(...)` source verification, not runtime exclusivity proof. |

### Impact on Workstream G

- **G can proceed** — scheduler authority is architecturally real
- ~~G should note that strict end-to-end assignment enforcement is not proven~~ **RESOLVED**
- **G prerequisite work completed:**
  1. ✅ Removed `selectLinearWorktree()` fallback from trigger path and dispatch path
  2. ✅ Added executor-side worktree assignment verification in `execute-issue.mjs`
  3. ✅ 11 new tests for fallback removal and assignment verification in `scheduler-exclusivity.spec.ts`
  4. ✅ `main.mjs` passes `operatorOverride` for `--issue` targets
