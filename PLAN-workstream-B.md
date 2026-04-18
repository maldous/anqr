# Workstream B — State Model Normalization and Durable Ownership

> Part of [PLAN.md](./PLAN.md) · Status: ✅ Complete · Started: 2026-04-15 · Completed: 2026-04-18

## Summary

Phases 0–7 complete (gate-verified). Phase 0: A-integrity hotfix. Phase 1: schema/helpers/transition map. Phase 2: transition APIs + deprecated helpers removed from production surface. Phase 3: all writers migrated. Phase 4: atomic claim+release, all callers verified. Phase 5: integrationQueue removed, ownership fallbacks observable and tested, documentation aligned. Phase 6: no-transient-correctness proof, claim lifecycle tests, stale lease handling tests (36 tests). Phase 7: ADR-0011 execution state model, ADR-0002/symphony-state/router/scheduler docs aligned.

## Requirements Addressed

- **R3. One authoritative local execution state model** — The platform shall define and enforce one authoritative local execution-state model for claims, leases, retries, finalization, integration candidacy, quarantine, and recovery ownership.
- **R4. Durable and bounded dispatch accounting** — All execution-dispatch accounting that affects scheduling decisions shall be durable, restart-safe, and reconciled against real execution state.
- **R8. Idempotency, retries, and lock ownership shall be explicit** — All ingress, scheduling, execution, integration, and recovery flows shall have explicit idempotency behavior, retry policy, lock ownership rules, lease expiry handling, and stale-owner resolution rules.

## Detailed Progress

### Phase 0 — A-integrity hotfix (COMPLETE)

- [x] `normalizeRecord()` now preserves `assignment` field through normalization
- [x] Regression test: `assignment-roundtrip.spec.ts` — normalizeRecord preserves assignment
- [x] Regression test: claim → save → load (with normalization) → getIssueState preserves assignment
- [x] Regression test: claim → save → fresh load → verifySchedulerClaim passes (restart proof)
- [x] Regression test: patchIssueState does not drop existing assignment through multiple patches

### Phase 1 — Define the truth model (COMPLETE)

Phase 1 deliverables are done. Schema, helpers, transition map, and `inferExecutionPhase` all exist and are tested. Worktree schema is enforced on load via `normalizeWorktreeRecord()` in `loadState()`. Remaining ownership and lifecycle enforcement gaps belong to Phases 3–5, not Phase 1.

- [x] `issue-phases.mjs` — execution phase enum: `eligible`, `claimed`, `executing`, `cooldown`, `blocked`, `validation_failed`, `commit_failed`, `push_failed`, `integration_pending`, `evidence_pending`, `integration_failed`, `completed` (12 phases) + `FINALIZATION_STATE_TO_PHASE` mapping
- [x] `worktree-record-schema.mjs` — strict schema: `{ worktreeId, state, assignedIssue, owner, leasedAt, quarantinedAt, reason, repairAttempts, lastError, updatedAt }` + `normalizeWorktreeRecord()` with backwards-compatible `issueIdentifier` support
- [x] `transition-map.mjs` — `ISSUE_TRANSITION_MAP`, `WORKTREE_TRANSITION_MAP`, `isValidIssueTransition()`, `isValidWorktreeTransition()`
- [x] `infer-execution-phase.mjs` — `inferExecutionPhase(record)` derives phase from scattered fields with priority: active lease > blocked > cooldown > finalization > completed_at > eligible (priority order fixed: finalization now takes precedence over `completed_at` to prevent premature completion reporting)
- [x] All modules exported from `symphony-state/index.mjs`
- [x] Tests: `state-model-phase1.spec.ts` — 69 tests covering all Phase 1 modules
- [x] No store version bump
- [x] **BLOCKER 1:** `loadState()` now normalizes `worktreeStates` via `normalizeWorktreeRecord()` on load
- [x] **BLOCKER 7:** All worktreeStates readers verified — `loadState` is the single entry point, so normalization there covers all downstream readers

### Phase 2 — Transition helpers (COMPLETE)

Transition helpers are the sole lifecycle write APIs. Old mutation helpers have been fully addressed: `setFinalizationState` and `setWorktreeState` removed from production exports (no production callers remain); `patchIssueState` repositioned as the legitimate metadata-only write API (not deprecated — used for `retry_count`, `latency_ms`, `source`, `transitions`, etc.).

- [x] `transitionIssue(identifier, targetPhase, metadata)` — validates phase transition via `isValidIssueTransition`, infers current phase via `inferExecutionPhase`, applies metadata as patch, records transition in history with `from`/`to`/`reason`, all atomic within `withStateLock`
- [x] `transitionWorktree(worktreeId, targetState, metadata)` — validates state transition via `isValidWorktreeTransition`, applies metadata, normalizes result via `normalizeWorktreeRecord`, all atomic within `withStateLock`
- [x] `getWorktreeOwner(wtId)` — durable ownership lookup reading `assignedIssue` (or backwards-compatible `issueIdentifier`) from `worktreeStates`
- [x] `patchIssueState`, `setFinalizationState`, `setWorktreeState` marked `@deprecated` with one-time `console.warn` per process
- [x] All modules exported from `symphony-state/index.mjs`
- [x] Tests: `transition-helpers-phase2.spec.ts` — 27 tests covering transitionIssue, transitionWorktree, getWorktreeOwner, and deprecation warnings
- [x] Old mutation helpers resolved: `setFinalizationState` and `setWorktreeState` removed from `index.mjs` production exports (tests import directly from module files); `patchIssueState` repositioned as legitimate metadata-only write API with updated JSDoc

### Phase 3 — Migrate writers (COMPLETE)

All six lifecycle-significant helpers (`setCooldown`, `clearCooldown`, `markRetryExhausted`, `markIssueHumanOnly`, `resetRetryState`, `recordCompletion`) no longer fall back to `patchIssueState()` for lifecycle-significant mutations. If a transition is rejected, the helpers either return null (reject) or limit themselves to genuinely metadata-only cleanup (clearing stale fields that do not determine the current phase). `releaseLease()` is now a single atomic operation under one lock.

**What is done:**

- [x] `issue-phases.mjs` — added `integrated_main → completed` mapping to `FINALIZATION_STATE_TO_PHASE`
- [x] `transition-issue.mjs` — added finalization deep-merge so callers can pass partial finalization objects
- [x] `transition-map.mjs` — added `evidence_pending → integration_failed` transition for error-during-closeout path
- [x] `claim-issue.mjs` — delegates to `transitionIssue("claimed")`, maps rejection reasons to existing return contract (`already_claimed`, `blocked`, `cooldown_active`)
- [x] `acquire-lease.mjs` — delegates to `transitionIssue("executing")`, reads current lease via `getIssueState` on failure for return contract preservation
- [x] `release-lease.mjs` — hypothetical phase inference via `inferExecutionPhase(record-without-lease)` for active leases; direct cleanup for stale/expired leases
- [x] `record-quarantine.mjs` — delegates to `transitionWorktree("quarantined")`
- [x] `clear-quarantine.mjs` — delegates to `transitionWorktree("available")`
- [x] `execute-repair.mjs` — replaced 3 `setWorktreeState` calls with `transitionWorktree`; field `issueIdentifier` → `assignedIssue`
- [x] `integrate-candidate.mjs` — replaced 4 `setFinalizationState` calls with `transitionIssue` targeting correct phases (`integration_failed`, `evidence_pending`, `completed`)
- [x] `execute-issue.mjs` — replaced all `setFinalizationState`/`setWorktreeState` with `transitionIssue`/`transitionWorktree`; remaining `patchIssueState` calls are metadata-only
- [x] `quarantine-worktree.mjs` — replaced `setWorktreeState` with `transitionWorktree`
- [x] Tests: `transition-migration-phase3.spec.ts` — 24 tests

**Blockers resolved:**

- [x] **BLOCKER 2 (RESOLVED):** All 6 lifecycle helpers no longer fall back to `patchIssueState()` for lifecycle-significant mutations
- [x] **BLOCKER 4 (RESOLVED):** `releaseLease()` now performs issue lease release AND worktree ownership cleanup inside a single `withStateLock` call — truly atomic bidirectional release.

### Phase 4 — Durable ownership authoritative in router/scheduler (COMPLETE)

Strong progress on durable ownership. `claimAndAssignWorktree()` is atomic (claim side). `releaseLease()` is now atomic (release side) — issue lease release and worktree ownership cleanup happen under one lock. Dispatch failure rollback uses the atomic `releaseLease()`.

- [x] `schedule-cycle.mjs` — scheduler sets worktree to `"executing"` durably at claim time via `claimAndAssignWorktree()`
- [x] `claimAndAssignWorktree()` — atomic issue claim + worktree assignment under one `withStateLock` call
- [x] `execute-issue.mjs` — guarded `transitionWorktree("executing")`: skips if worktree already executing (scheduler set it)
- [x] Router startup reconstruction in `runtime.mjs` — reads durable `worktreeStates` on startup and initializes `activeRequests` counters
- [x] `handle-linear-trigger.mjs` — trusts scheduler assignment: skips `activeRequests >= 1` busy check when target is from scheduler's durable claim
- [x] `dispatch-linear-execution.mjs` — trusts scheduler assignment: skips `activeRequests >= 1` busy check when `assignedTarget` is provided
- [x] `select-linear-worktree.mjs` — uses durable state for availability: filters out worktrees in `"executing"` state
- [x] `runtime.mjs` queue drain — uses durable state for available-slot counting
- [x] `reconcile-worktree-counters.mjs` — periodic reconciliation syncs transient counters with durable state
- [x] `get-healthy-linear-capacity.mjs` — renamed `issueIdentifier` field to `assignedIssue`
- [x] Tests: `durable-ownership-phase4.spec.ts`
- [x] `schedule-cycle.mjs` calls `releaseLease()` on dispatch failure

**Blockers resolved:**

- [x] **BLOCKER 3b (RESOLVED):** `releaseLease()` rewritten to perform issue lease release + worktree ownership cleanup inside ONE `withStateLock` call.
- [x] **BLOCKER 5b (RESOLVED):** Dispatch rollback in `schedule-cycle.mjs` calls `releaseLease()`, which is now atomic.
- [x] Verified: all 8 `releaseLease()` callers use fire-and-forget or single-result pattern.

### Phase 5 — Bidirectional ownership and authority normalization (COMPLETE)

Integration candidacy is derived from finalization state. Durable worktree state is the primary ownership record. Recovery fallbacks (git-log heuristic, issue reverse-scan) are retained for repair context only and now log warnings when activated, making the authority gap observable and measurable.

- [x] `list-integration-candidates.mjs` — rewritten to derive candidates from `finalization.state`
- [x] `enqueue-integration-candidate.mjs` — deprecated as no-op
- [x] `dequeue-integration-candidate.mjs` — deprecated as no-op
- [x] `scan-for-repaired-candidates.mjs` — converted to no-op
- [x] `process-queue.mjs` — removed `scanForRepairedCandidates` call
- [x] `get-worktree-health-snapshot.mjs` — uses `getWorktreeOwner()` as primary ownership
- [x] `infer-owner-from-branch.mjs` — checks durable worktree state first, then fallbacks
- [x] Worktree schema is normalized on load via `normalizeWorktreeRecord()` in `loadState()`
- [x] `claimAndAssignWorktree()` sets both sides atomically
- [x] `releaseLease()` clears worktree ownership (now atomic — resolved via Blocker 3b)
- [x] Tests: `bidirectional-ownership-phase5.spec.ts` — 17 tests
- [x] `integrationQueue` removed from `empty-store.mjs` and `load-state.mjs` store schema defaults
- [x] Deprecated no-op modules deleted; all callers cleaned
- [x] `infer-owner-from-branch.mjs` fallbacks made observable — logs warnings when heuristics activate
- [x] Fallback observability proven by test: `infer-owner-fallback-observability.spec.ts` — 6 tests
- [x] Documentation alignment: harness/ops/README.md, symphony-state/README.md, symphony-integrator/README.md all corrected

### Remediation Blockers (ordered by correctness priority)

All correctness blockers (1, 2, 3a, 3b, 4, 5a, 5b, 7, 8) are resolved with real code changes. Blocker 6 (dead-structure cleanup) is also resolved.

| #   | Blocker                                                                      | Phase | Status                      |
| --- | ---------------------------------------------------------------------------- | ----- | --------------------------- |
| 1   | Normalize worktree state on load in `load-state.mjs`                         | 1     | ✅ DONE                     |
| 7   | Verify all `worktreeStates` readers handle normalized records                | 1     | ✅ DONE                     |
| 3a  | Add atomic `claimAndAssignWorktree()` helper (claim side)                    | 4     | ✅ DONE                     |
| 3b  | Make `releaseLease()` truly atomic bidirectional (release side)              | 4/5   | ✅ DONE                     |
| 4   | Clear worktree ownership when lease is released                              | 3/5   | ✅ DONE (now atomic via 3b) |
| 5a  | Dispatch failure calls `releaseLease()`                                      | 4     | ✅ DONE                     |
| 5b  | Dispatch rollback uses atomic bidirectional release (depends on 3b)          | 4     | ✅ DONE                     |
| 2   | Remove `patchIssueState()` fallbacks from 6 lifecycle helpers                | 3     | ✅ DONE                     |
| 6   | Remove persistent `integrationQueue` artifact from state model               | 5     | ✅ DONE                     |
| 8   | Strengthen tests: direct module tests, rejection tests, atomic release tests | 6     | ✅ DONE                     |

### Phase 6 — Tests (COMPLETE)

- [x] `assignment-roundtrip.spec.ts` — (already complete from Phase 0)
- [x] `no-transient-correctness.spec.ts` — 10 tests proving router startup with zeroed transient counters still respects durable ownership
- [x] `claim-lifecycle-phase6.spec.ts` — 14 tests exercising complete lifecycle through transition helpers
- [x] `stale-lease-phase6.spec.ts` — 12 tests covering stale lease handling and orphaned assignments
- [x] Phase 4 brittle mock placement resolved — `durable-ownership-phase4.spec.ts` nested `vi.mock`/`vi.hoisted` calls moved to module top level

### Phase 7 — Documentation (COMPLETE)

- [x] ADR-0011: execution state model created
- [x] ADR-0002 updated: added "Durable Execution Ownership (Workstream B)" section
- [x] Symphony-state README updated
- [x] Router README updated: added "Durable State Authority" section
- [x] Scheduler README updated: resolved merge conflict markers
- [x] PLAN.md updated: Workstream B marked complete

### B Finish Line

> "Router and scheduler no longer rely on transient memory for correctness; all execution ownership is reconstructable from durable state after restart."

## Implementation Requirements (from original assessment)

**Problem**
Execution authority is split across Linear, local durable state, and transient router memory.

**Required change**
Define one authoritative local execution-state model and enforce it for claims, leases, retries, finalization, integration candidacy, quarantine, and worktree ownership. Remove scheduler correctness dependence on transient in-memory counters.

**Expected end state**
Every active, queued, retrying, integrating, quarantined, or failed work item has one durable authoritative state record, one owner, and one recovery interpretation.

**Implementation notes**

- Formalize the state machine and transition rules.
- Make lock and lease semantics explicit in code and tests.
- Distinguish observation state from authority state.
- Ensure restart and crash recovery rehydrate from durable truth, not process-local memory.

**Risks if left unresolved**
State drift, stale-owner confusion, scheduler disagreement, false health signals, and incorrect recovery actions.

## Deliverables

- ✅ Authoritative execution-state schema or module contract
- ✅ Durable dispatch accounting replacing in-memory correctness dependencies
- ✅ Lease, retry, finalization, quarantine, and integration queue invariants in code
- ✅ Restart and crash recovery tests

## Acceptance Criteria

3. ✅ All scheduling decisions that affect correctness survive process restart and are derived from durable state, not transient counters alone.
4. ✅ Every active issue has one durable owner, one durable lifecycle state, and one documented path for reassignment or quarantine. (All 8 correctness blockers resolved. B4 heartbeatLease is accepted special-case maintenance.)

## Completion Review Findings (gpt-5-agent deep audit)

**Verdict: ✅ Complete. All 8 correctness blockers resolved. G-prerequisites (B1/B2/B3) resolved. Accepted caveats: B4 heartbeatLease (special-case), B5 atomicity mocked (proves logic), B6 deprecated helpers (test-only).**

### Critical Findings

| #   | Finding                                                       | Severity       | Detail                                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1  | ~~`patchIssueState()` is unrestricted~~                       | ~~High~~       | **RESOLVED (G prerequisite).** `LIFECYCLE_FIELDS` guard added — `patchIssueState()` now throws on lifecycle-determining fields (`lease`, `finalization`, `completed_at`, `human_only`, `retry_exhausted`, `blocked_reason`, `cooldown_until`). Callers (`noteAttemptStart`, `email-ingest`) cleaned of lifecycle field writes. |
| B2  | ~~`publish-evidence-and-close.mjs` uses `patchIssueState()`~~ | ~~High~~       | **RESOLVED (G prerequisite).** Migrated to `transitionIssue("evidence_pending", {...})` self-transition with `reason: "missing_linear_detail"`.                                                                                                                                                                                |
| B3  | ~~`integration_pending → completed` allowed directly~~        | ~~High for G~~ | **RESOLVED (G prerequisite).** Removed from transition map. Must now go `integration_pending → evidence_pending → completed`. `evidence_pending` self-transition added for metadata annotation.                                                                                                                                |
| B4  | `heartbeatLease()` directly mutates lease                     | Medium         | Bypasses transition helpers entirely. Arguably special-case maintenance, but still means transitionIssue is not the sole lifecycle write path.                                                                                                                                                                                 |
| B5  | Atomicity tested with mocked lock/storage                     | Medium         | Tests mock `loadState`, `saveState`, `withStateLock`. Proves function bodies update both sides, but not real filesystem persistence, lock behavior, or crash-window safety.                                                                                                                                                    |
| B6  | Deprecated helpers still exist as importable modules          | Low            | `setFinalizationState.mjs` and `setWorktreeState.mjs` remain as files. Removed from barrel exports and no production callers found, but still importable as backdoors.                                                                                                                                                         |

### Impact on Workstream G (historical — G is now ✅ Complete)

- ~~B1+B2 are blocking for G~~ **RESOLVED** — `patchIssueState()` now enforces metadata-only boundary at runtime
- ~~B3 is blocking for G~~ **RESOLVED** — transition map requires evidence gating before completion
- **G prerequisite work completed:**
  1. ✅ `patchIssueState()` restricted to non-lifecycle fields via `LIFECYCLE_FIELDS` guard (throws on violation)
  2. ✅ `integration_pending → completed` removed — must go through `evidence_pending` first
  3. ✅ `publish-evidence-and-close.mjs` migrated to `transitionIssue()` with `evidence_pending` self-transition
  4. ✅ `transitionIssue()` auto-clears blocking fields (`blocked_reason`, `human_only`, `retry_exhausted`) on `blocked → eligible`
  5. ✅ `noteAttemptStart.mjs` and `email-ingest/main.mjs` cleaned of lifecycle field writes
  6. ✅ 18 new tests in `b-prerequisite-lifecycle-guard.spec.ts` (guard, transition map, auto-clear, source verification)
  7. Remaining: deprecated helper files (`setFinalizationState.mjs`, `setWorktreeState.mjs`) kept for test imports only
