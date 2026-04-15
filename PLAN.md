# Title

High-Confidence Automation Readiness Requirements for the ANQR Host-Local Harness

# Execution Progress

| Workstream                    | Status         | Started    | Completed  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------- | -------------- | ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Authoritative scheduling   | ✅ Complete    | 2026-04-13 | 2026-04-14 | All dispatch paths (trigger + queue drain) verify scheduler claims; scheduler requires worktreeId at claim time; `verifySchedulerClaim` extracted to shared module; ADR-0002/router/scheduler docs aligned                                                                                                                                                                                                                                                                                                                                                                               |
| B. State model normalization  | ✅ Complete    | 2026-04-15 | 2026-04-16 | Phases 0–7 complete (gate-verified). Phase 0: A-integrity hotfix. Phase 1: schema/helpers/transition map. Phase 2: transition APIs + deprecated helpers removed from production surface. Phase 3: all writers migrated. Phase 4: atomic claim+release, all callers verified. Phase 5: integrationQueue removed, ownership fallbacks observable and tested, documentation aligned. Phase 6: no-transient-correctness proof, claim lifecycle tests, stale lease handling tests (36 tests). Phase 7: ADR-0011 execution state model, ADR-0002/symphony-state/router/scheduler docs aligned. |
| C. Recovery demotion          | ✅ Complete    | 2026-04-13 | 2026-04-14 | All recovery git publication removed (including baseline cspell auto-fix + worktree propagation); `checkBaselineHealth` is detect-only; ADR-0005/ADR-0006/recovery docs aligned                                                                                                                                                                                                                                                                                                                                                                                                          |
| D. Boundary hardening         | ✅ Complete    | 2026-04-16 | 2026-04-16 | Phases 0–5 complete. BRIDGE_MODE formalization, boundary enforcement tests (28+ tests), startup validation, ADR-0008/0003 updated, executor BRIDGE_MODE=worktree, port isolation test, assertMutationContext decision documented.                                                                                                                                                                                                                                                                                                                                                        |
| E. Config/lifecycle hardening | ✅ Complete    | 2026-04-16 | 2026-04-16 | Phases 0–3 complete. Env drift detection, startup env validation (validate-startup-env.mjs), critical EnvironmentFile= enforcement (router, discord-router, linear-webhook), service dependency documentation.                                                                                                                                                                                                                                                                                                                                                                           |
| F. Provider-routing evidence  | 🟡 In Progress | 2026-04-16 | —          | Phase 0 gap analysis complete. Phase 1: RoutingDecisionEvidence structured record created, emitted from invokeWithFallback with per-attempt timing/error tracking, tests passing. Phase 2 (context-reduction evidence) remaining.                                                                                                                                                                                                                                                                                                                                                        |
| G. Evidence/closure model     | ⬜ Not Started | —          | —          | Depends on A–F                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| H. Documentation alignment    | ⬜ Not Started | —          | —          | Continuous                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## Decisions Log

| Date       | Decision                                                                   | Rationale                                                                                                                                                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-13 | Use feature flag `SCHEDULER_AUTHORITATIVE` for phased rollout              | Allows shadow-mode testing before cutting over; old paths remain functional until validated                                                                                                                                                                                           |
| 2026-04-13 | Create `symphony-scheduler/` as new orchestration module                   | Cleanest separation of concerns; scheduler is a new first-class actor, not bolted onto existing code                                                                                                                                                                                  |
| 2026-04-13 | Scheduler claims via `claimIssue()` with atomic lease + durable assignment | Reuses existing `withStateLock` + `acquireLease` for atomicity; adds assignment metadata                                                                                                                                                                                              |
| 2026-04-13 | Reconciler converted to feed desired-work queue, not dispatch directly     | Preserves level-triggered safety net role while removing scheduling authority                                                                                                                                                                                                         |
| 2026-04-13 | Runner self-pick removed behind feature flag                               | Runner becomes pure executor of already-claimed work; sticky repair preserved as local concern                                                                                                                                                                                        |
| 2026-04-13 | Recovery git mutation removed (Workstream C)                               | `execute-repair.mjs` stripped of `auto_commit_and_push`, `retry_push`, and main-repo push; recovery limited to quarantine/reprovision/state-repair per ADR-0005                                                                                                                       |
| 2026-04-14 | Scheduler consumes desired-work queue (review remediation)                 | Per updated ADR-0002: desired-work is advisory, Linear state is authoritative; scheduler drains queue each cycle for priority boosting                                                                                                                                                |
| 2026-04-14 | Router hardened in authoritative mode (review remediation)                 | Per ADR-0002: router verifies scheduler claim before dispatch; returns 409 for unclaimed issues                                                                                                                                                                                       |
| 2026-04-14 | Recovery evidence emission added (review remediation)                      | Per updated ADR-0006: every recovery action emits structured evidence classifying action class, target, ownership, state-only vs sandbox-reset                                                                                                                                        |
| 2026-04-14 | reset_to_main gets active-sandbox guard (review remediation)               | Defense-in-depth: explicit leaseIsActive check before sandbox reset, falls back to quarantine if active                                                                                                                                                                               |
| 2026-04-14 | Tests rewritten to exercise real modules (review remediation)              | claimIssue tested via real module with mocked fs layer; recovery evidence structure verified against source                                                                                                                                                                           |
| 2026-04-14 | Router verifies scheduler ownership + assignment (2nd review)              | `verifySchedulerClaim` now checks `lease.owner === "scheduler"` and `assignment.worktreeId` exists; returns 409 with specific reason codes                                                                                                                                            |
| 2026-04-14 | Scheduler assigns worktreeId at claim time (2nd review)                    | Scheduler selects from `capacity.worktrees` and passes worktreeId into `claimIssue()`; claim+assignment atomic; router honours assignment                                                                                                                                             |
| 2026-04-14 | Router uses scheduler's durable assignment (2nd review)                    | In authoritative mode, router reads `assignedWorktreeId` from claim state and dispatches to that worktree instead of re-selecting                                                                                                                                                     |
| 2026-04-14 | `isNonPublishing` derived from action class (2nd review)                   | Per ADR-0006: `buildEvidence` derives `isNonPublishing` from explicit `NON_PUBLISHING_ACTIONS` set rather than hardcoding                                                                                                                                                             |
| 2026-04-14 | Behavioral recovery tests added (2nd review)                               | `recovery-behavioral.spec.ts` exercises real `executeRepair` with mocked deps; proves runtime demotion, active-lease guard, evidence structure                                                                                                                                        |
| 2026-04-14 | PLAN.md corrected to partially complete (2nd review)                       | Workstreams A and C marked 🟡 Partially Complete with explicit remaining items listed                                                                                                                                                                                                 |
| 2026-04-14 | Legacy bypass paths removed (Workstream A completion)                      | `SCHEDULER_AUTHORITATIVE` flag made permanent; all `if (!SCHEDULER_AUTHORITATIVE)` bypass code removed from runner, router, webhook, reconciler                                                                                                                                       |
| 2026-04-14 | Legacy reconciler dispatch helper deleted                                  | `run-reconciliation-cycle/dispatch-issue.mjs` and its exports removed so the reconciler no longer exposes a dormant direct-dispatch helper                                                                                                                                            |
| 2026-04-14 | `reset_to_main` explicitly classified (Workstream C completion)            | ADR-0005 updated with sandbox maintenance exception; execute-repair.mjs documents safety guarantees; recovery README reflects non-publishing contract                                                                                                                                 |
| 2026-04-14 | Scheduler README created                                                   | Documents authority boundaries, scheduling cycle flow, claim contract, systemd service, and operational notes                                                                                                                                                                         |
| 2026-04-14 | Legacy path removal tests added                                            | Source-verification tests prove runner/webhook/reconciler no longer contain bypass code                                                                                                                                                                                               |
| 2026-04-14 | Router queue bypass closed (3rd review)                                    | `verifySchedulerClaim` extracted to shared module; `runtime.mjs` queue drain now re-verifies claims before dispatch; items with expired/invalid claims are dropped                                                                                                                    |
| 2026-04-14 | Scheduler requires worktreeId (3rd review)                                 | Scheduler stops dispatch loop when no worktrees available rather than claiming with null assignment; router rejects claims missing `assignment.worktreeId`                                                                                                                            |
| 2026-04-14 | Claims without worktree assignment are rejected                            | `claimIssue()` now rejects missing `worktreeId`; null-assignment claims are no longer creatable even by direct callers                                                                                                                                                                |
| 2026-04-14 | Recovery baseline auto-fix removed (3rd review)                            | `attemptCspellAutoFix` and `propagateBaselineFixToCleanWorktrees` deleted; `checkBaselineHealth` rewritten to detect-and-report only; recovery daemon contains zero git publication commands                                                                                          |
| 2026-04-14 | ADRs and READMEs aligned to code (3rd review)                              | ADR-0002, ADR-0005, ADR-0006, scheduler README, router README, recovery README all corrected to match implemented behavior                                                                                                                                                            |
| 2026-04-15 | Phase 0: `normalizeRecord` assignment persistence hotfix (Workstream B)    | `normalizeRecord()` was silently dropping the `assignment` field written by `claimIssue()` — A-integrity bug that B exposed. Fixed by adding `assignment` to normalized schema.                                                                                                       |
| 2026-04-15 | Revised Workstream B plan per external reviewer guidance                   | 7-phase plan: Phase 0 hotfix → Phase 1 schema/helpers → Phase 2 transition APIs → Phase 3 migrate writers → Phase 4 durable ownership in router → Phase 5 bidirectional ownership → Phase 6 tests → Phase 7 docs                                                                      |
| 2026-04-15 | `inferExecutionPhase()` over persisted `executionPhase`                    | Reviewer: do not persist `executionPhase` yet — add read-side helper first to avoid creating another truth source before mutating paths are unified                                                                                                                                   |
| 2026-04-15 | No store version bump in Phase 1                                           | Reviewer: only bump version when on-disk shape changes materially or old readers/writers would misinterpret state. Adding optional fields does not qualify.                                                                                                                           |
| 2026-04-15 | `transitionIssue()`/`transitionWorktree()` as sole lifecycle write APIs    | Reviewer: old mutation helpers (`patchIssueState`, `setFinalizationState`, `setWorktreeState`) must be deprecated quickly, not left as open-ended alternatives                                                                                                                        |
| 2026-04-15 | Router reconstruction as transitional safety, not final model              | Reviewer: durable ownership is the authority; router counter reconstruction is a guardrail on startup, not the correctness model                                                                                                                                                      |
| 2026-04-15 | `worktreeStates[wtId].assignedIssue` as primary ownership record           | Reviewer: make durable worktree state the primary owner record; reverse scan of issues is validation/repair, not the authority lookup path                                                                                                                                            |
| 2026-04-15 | `finalization.state` authoritative, `integrationQueue` derived             | Reviewer: state belongs with the issue record; queues are easier to rebuild than issue history/state                                                                                                                                                                                  |
| 2026-04-15 | Honest B assessment: phases 3–5 are NOT complete per external review       | External reviewer identified 7 blockers: worktree normalization on load, lifecycle helpers still using patchIssueState, non-atomic claim+worktree, releaseLease not bidirectional, no dispatch rollback                                                                               |
| 2026-04-15 | `claimAndAssignWorktree` in symphony-state layer (Blocker 3)               | Atomic helper claims issue and assigns worktree under one lock; schedule-cycle calls this instead of separate claimIssue + transitionWorktree                                                                                                                                         |
| 2026-04-15 | `releaseLease` clears worktree ownership (Blocker 4)                       | After releasing issue-side lease, also transitions worktree to available with null assignedIssue; sequential lock acquisition (safe, conservative direction). _Superseded by Blocker 3b: rewritten as single atomic operation under one `withStateLock` call — no longer sequential._ |
| 2026-04-15 | `inferExecutionPhase` priority: finalization before completed_at           | Runner sets completed_at before integration runs; old priority let completed_at trump finalization.state=integration_pending, incorrectly returning "completed"                                                                                                                       |
| 2026-04-16 | D/E/F opened per strategic priority guidance                               | D primary (boundary hardening), E secondary (config drift detection), F discovery only (provider evidence gap analysis). D first because it is the next correctness-critical workstream after B.                                                                                      |
| 2026-04-16 | `BRIDGE_MODE` concept added to bridge identity (Workstream D)              | Auto-derived from `BRIDGE_ROOT === CONTROL_REPO_ROOT` comparison. Explicit env var override for service config. Two modes: `worktree` (isolated sandbox) and `control-plane` (main repo exception per ADR-0008).                                                                      |
| 2026-04-16 | Codex bridge classified as control-plane (Workstream D)                    | `anqr-symphony-codex.service` sets `BRIDGE_MODE=control-plane` explicitly. Startup validation warns about ADR-0008 exception. Must NOT be used for autonomous scheduled execution.                                                                                                    |
| 2026-04-16 | Env drift detection added to harness-doctor (Workstream E)                 | `check-env-drift.mjs` compares repo template key names against live host env file. Reports missing keys, extra keys, and symphony env symlink status.                                                                                                                                 |
| 2026-04-16 | D scope locked — assertMutationContext NOT added to bridge tools           | Codex bridge is intentional ADR-0008 exception. Defense-in-depth via port isolation (4330 outside 4321–4328 pool) and BRIDGE_MODE startup validation. Adding assertMutationContext would break intended codex functionality.                                                          |
| 2026-04-16 | Executor BRIDGE_MODE=worktree made explicit (Workstream D)                 | Symmetry with codex bridge's BRIDGE_MODE=control-plane. Auto-derivation remains as fallback but explicit env var is preferred for production services.                                                                                                                                |
| 2026-04-16 | Critical services use required EnvironmentFile (Workstream E)              | Router, discord-router, and linear-webhook converted from `EnvironmentFile=-` to `EnvironmentFile=` for `anqr-ops.env`. Services fail fast on missing secrets rather than starting broken. Supplementary `anqr.env` remains optional.                                                 |
| 2026-04-16 | Startup env validation added to bridge (Workstream E)                      | `validate-startup-env.mjs` checks provider tokens, ANQR_WORKTREE_ID, SYMPHONY_BRIDGE_PORT, and BRIDGE_MODE at startup. Logs warnings but does not throw.                                                                                                                              |
| 2026-04-16 | Provider routing evidence emitted (Workstream F)                           | `record-provider-routing-evidence.mjs` captures full routing decision chain. `invokeWithFallback` tracks per-attempt fallbackChain with timing and errors. Evidence emitted from server.mjs for both streaming and non-streaming paths.                                               |

## Workstream A Detailed Progress

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

## Workstream B Detailed Progress

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

**What is NOT done:**

- [x] **BLOCKER 2 (RESOLVED):** All 6 lifecycle helpers no longer fall back to `patchIssueState()` for lifecycle-significant mutations:
  - `set-cooldown.mjs` — rejects with null if transition invalid (no fallback)
  - `clear-cooldown.mjs` — transitions for cooldown→eligible; uses direct locked write for metadata-only `cooldown_until: null` cleanup (does not set lifecycle fields)
  - `mark-retry-exhausted.mjs` — rejects with null if transition invalid (no fallback)
  - `mark-issue-human-only.mjs` — rejects with null if transition invalid (no fallback)
  - `reset-retry-state.mjs` — returns current state as no-op for already-eligible issues; rejects with null otherwise (no fallback)
  - `record-completion.mjs` — only sets `latency_ms` (observation metadata) when transition rejected; does NOT set `completed_at`
- [x] **BLOCKER 4 (RESOLVED):** `releaseLease()` now performs issue lease release AND worktree ownership cleanup inside a single `withStateLock` call — truly atomic bidirectional release.

### Phase 4 — Durable ownership authoritative in router/scheduler (COMPLETE)

Strong progress on durable ownership. `claimAndAssignWorktree()` is atomic (claim side). `releaseLease()` is now atomic (release side) — issue lease release and worktree ownership cleanup happen under one lock. Dispatch failure rollback uses the atomic `releaseLease()`.

**What is done:**

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

**What is NOT done:**

- [x] **BLOCKER 3b (RESOLVED):** `releaseLease()` rewritten to perform issue lease release + worktree ownership cleanup inside ONE `withStateLock` call. Inlines the transition logic (same pattern as `claimAndAssignWorktree`) to avoid lock reentrancy.
- [x] **BLOCKER 5b (RESOLVED):** Dispatch rollback in `schedule-cycle.mjs` calls `releaseLease()`, which is now atomic.
- [x] Verified: all 8 `releaseLease()` callers use fire-and-forget or single-result pattern. None inspect a multi-stage return contract. Callers: `schedule-cycle.mjs`, `execute-issue.mjs`, `execute-repair.mjs`, `recover-in-progress-issue.mjs`, `symphony-runner/main.mjs`, `recover-stale-in-progress/main.mjs`, `startup-recovery/main.mjs`, `detect-stuck-work.mjs`.

### Phase 5 — Bidirectional ownership and authority normalization (COMPLETE)

Integration candidacy is derived from finalization state. Durable worktree state is the primary ownership record. Recovery fallbacks (git-log heuristic, issue reverse-scan) are retained for repair context only and now log warnings when activated, making the authority gap observable and measurable.

**What is done:**

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

**What is NOT done:**

- [x] `integrationQueue` removed from `empty-store.mjs` and `load-state.mjs` store schema defaults
- [x] `enqueueIntegrationCandidate()` and `dequeueIntegrationCandidate()` deprecated no-op modules deleted; all callers cleaned from `execute-issue.mjs`, `run-reconciliation-cycle.mjs`, and `integrate-candidate.mjs`; exports removed from `index.mjs` and `symphony-state.mjs`. (Minor: stale `vi.fn()` mock remains in `runner-lease-loss.spec.ts` — not an active workflow surface.)
- [x] `releaseLease()` is now atomic (resolved via Blocker 3b)
- [x] `infer-owner-from-branch.mjs` fallbacks made observable — logs warnings when git-log or reverse-scan heuristics activate, with clear JSDoc documenting the three-tier authority hierarchy (fallbacks retained for repair context only)
- [x] Tests strengthened: direct `normalizeWorktreeRecord` tests (real module), rejection tests proving lifecycle helpers return null (not silently mutate), atomic release tests
- [x] Fallback observability proven by test: `infer-owner-fallback-observability.spec.ts` — 6 tests exercising real `infer-owner-from-branch.mjs` module, proving stage 2 (git-log) and stage 3 (reverse-scan) `logWarn` emission, no-warning happy path, graceful fallthrough on git error, and correct worktreeId matching
- [x] Documentation alignment (gate-review remediation): `harness/ops/README.md` merge conflict resolved and stale export references removed; `harness/ops/core/symphony-state/README.md` inventory corrected (63→71 files, deleted integration-candidate files removed, deprecated helpers marked, missing Phase 1/2/4 files added); `harness/ops/orchestration/symphony-integrator/README.md` `scan-for-repaired-candidates.mjs` marked as retained no-op

### Remediation Blockers (ordered by correctness priority)

All correctness blockers (1, 2, 3a, 3b, 4, 5a, 5b, 7, 8) are resolved with real code changes. Blocker 6 (dead-structure cleanup) is also resolved: `integrationQueue` removed from schema, deprecated no-op modules deleted, all callers cleaned.

| #   | Blocker                                                                                                                           | Phase | Status                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------- |
| 1   | Normalize worktree state on load in `load-state.mjs`                                                                              | 1     | ✅ DONE                     |
| 7   | Verify all `worktreeStates` readers handle normalized records                                                                     | 1     | ✅ DONE                     |
| 3a  | Add atomic `claimAndAssignWorktree()` helper (claim side)                                                                         | 4     | ✅ DONE                     |
| 3b  | Make `releaseLease()` truly atomic bidirectional (release side) — releases issue lease + clears worktree ownership under one lock | 4/5   | ✅ DONE                     |
| 4   | Clear worktree ownership when lease is released                                                                                   | 3/5   | ✅ DONE (now atomic via 3b) |
| 5a  | Dispatch failure calls `releaseLease()`                                                                                           | 4     | ✅ DONE                     |
| 5b  | Dispatch rollback uses atomic bidirectional release (depends on 3b)                                                               | 4     | ✅ DONE                     |
| 2   | Remove `patchIssueState()` fallbacks from 6 lifecycle helpers — split metadata helpers from lifecycle helpers properly            | 3     | ✅ DONE                     |
| 6   | Remove persistent `integrationQueue` artifact from state model; remove deprecated no-op callers                                   | 5     | ✅ DONE                     |
| 8   | Strengthen tests: direct module tests, rejection tests, atomic release tests                                                      | 6     | ✅ DONE                     |

**Remediation order (corrected):**

1. ✅ Update PLAN.md with honest partial assessment
2. ✅ Blocker 2: removed `patchIssueState()` fallbacks — lifecycle helpers reject or use metadata-only writes
3. ✅ Blocker 3b: `releaseLease()` rewritten as atomic bidirectional release (one lock)
4. ✅ Blocker 5b: dispatch rollback uses atomic `releaseLease()` (no code change needed)
5. ✅ Blocker 6: `integrationQueue` removed from store schema; deprecated no-op modules deleted; all callers cleaned
6. ✅ Blocker 8: direct module tests, rejection tests, atomic release tests added
7. Run validation
8. Review and fix follow-up issues

### Phase 6 — Tests (COMPLETE)

- [x] `assignment-roundtrip.spec.ts` — (already complete from Phase 0)
- [x] `no-transient-correctness.spec.ts` — 10 tests proving router startup with zeroed transient counters still respects durable ownership: restart reconstruction, durable-state availability filtering, stale counter correction, counter-independent dispatch safety, full 4-worktree restart scenario, claim-then-restart cycle
- [x] `claim-lifecycle-phase6.spec.ts` — 14 tests exercising complete lifecycle through transition helpers: claimAndAssignWorktree atomicity (both sides set or neither on failure), acquireLease claimed→executing, releaseLease bidirectional atomicity, full lifecycle claim→execute→push→integration→evidence→complete, parallel claims on different worktrees, dispatch failure rollback, integration candidacy persistence after worktree release, multiple candidates from different worktrees
- [x] `stale-lease-phase6.spec.ts` — 12 tests covering stale lease handling and orphaned assignments: findExpiredLeases identification of expired/active/lease-less, boundary testing with custom timestamps, releaseLease on expired lease (direct cleanup, bidirectional), nonce mismatch rejection, orphaned assignment clearing, finalization worktreeId fallback for orphan clearing, crash scenario (expired lease + executing worktree → both cleaned)
- [x] Bidirectional ownership consistency through full lifecycle (covered in claim-lifecycle-phase6.spec.ts)
- [x] Integration candidacy ownership tests (covered in claim-lifecycle-phase6.spec.ts)
- [x] Phase 4 brittle mock placement resolved — `durable-ownership-phase4.spec.ts` nested `vi.mock`/`vi.hoisted` calls moved to module top level, eliminating all 5 Vitest warnings

### Phase 7 — Documentation (COMPLETE)

- [x] ADR-0011: execution state model created — explicitly states: Linear = desired work truth, durable local state = execution ownership truth, router memory = observation only. Documents the three truth domains, authority hierarchy, key invariants (atomic claim/release, startup reconstruction, counter independence), and consequences.
- [x] ADR-0002 updated: added "Durable Execution Ownership (Workstream B)" section documenting atomic claim+release, startup reconstruction, counter independence, and integration candidacy derivation; cross-references ADR-0011
- [x] Symphony-state README updated: reflects Phase 1–6 architecture with lifecycle APIs, transition helpers, ownership model, key invariants, and deprecated helper status
- [x] Router README updated: added "Durable State Authority" section documenting startup reconstruction, periodic reconciliation, and counter independence; cross-references ADR-0002 and ADR-0011
- [x] Scheduler README updated: resolved merge conflict markers; updated claim flow to reference `claimAndAssignWorktree()` (atomic bidirectional); added dispatch failure rollback; cross-references ADR-0011
- [x] PLAN.md updated: Workstream B marked complete

### B Finish Line

> "Router and scheduler no longer rely on transient memory for correctness; all execution ownership is reconstructable from durable state after restart."

## Workstream C Detailed Progress

- [x] `auto_commit_and_push` demoted to quarantine in `execute-repair.mjs`
- [x] `retry_push` demoted to quarantine in `execute-repair.mjs`
- [x] `classify-worktree.mjs` updated: dirty orphaned → quarantine (not auto-commit)
- [x] Structured evidence emission per ADR-0006 (`buildEvidence` with action class, state-only, non-publishing)
- [x] `isNonPublishing` derived from explicit `NON_PUBLISHING_ACTIONS` set (not hardcoded)
- [x] `reset_to_main` guarded with explicit `leaseIsActive` check (defense-in-depth)
- [x] `attemptCspellAutoFix` deleted — recovery no longer commits/pushes to main
- [x] `propagateBaselineFixToCleanWorktrees` deleted — recovery no longer merges worktrees
- [x] `checkBaselineHealth` rewritten to detect-and-report only (no auto-fix, no git commands)
- [x] Recovery `index.mjs` cleaned of dead exports
- [x] Tests: `recovery-no-git-mutation.spec.ts` — source verification of demoted paths, evidence, and daemon-level non-publication
- [x] Tests: `recovery-behavioral.spec.ts` — behavioral tests exercising real executeRepair
- [x] `reset_to_main` explicitly classified as sandbox maintenance in execute-repair.mjs with documented safety guarantees
- [x] ADR-0005 updated: recovery contains no git add/commit/push/merge anywhere in daemon (including baseline health)
- [x] ADR-0006 updated: entire recovery subsystem follows evidence contract
- [x] Recovery README.md updated: removed deleted file references, reflects detect-only baseline health
- [x] Execute-repair README.md updated with complete action classification table

## Workstream D Detailed Progress

### D Phase 0 — Boundary Audit (COMPLETE)

Audit findings from tracing the codex bridge execution path and enumerating all main-repo execution surfaces:

- [x] **Codex bridge is a server-side mutation path.** The bridge has file-mutating tools (`write_file`, `str_replace`, `apply_patch`) that use `fs.writeFileSync()` with paths resolved via `resolveRequestPath()` → `remapRepoPathToBridgeRoot()`. These tools write to `BRIDGE_ROOT` which equals the main repo for the codex bridge.
- [x] **`assertMutationContext` is NOT in the bridge tool path.** It exists in `run-tool-loop.mjs` (symphony-agent layer), but the bridge's AI SDK tool execution path (`invoke-with-aiinner.mjs`) does not call it. This is acceptable because the codex bridge is a developer tool, not an autonomous execution path.
- [x] **Identity contradiction identified.** The codex bridge sets `ANQR_WORKTREE_ID=codex` → `IS_WORKTREE_BRIDGE=true`, but `BRIDGE_ROOT === CONTROL_REPO_ROOT` (both `/home/user/src/anqr`). No `BRIDGE_MODE` concept existed to distinguish this.
- [x] **Codex bridge is a separate service.** Port 4330, outside the executor pool (4321-4328). Router, scheduler, and reconciler never route work to port 4330.
- [x] **Six defense layers mapped** — config routing, router cwd rebasing, systemd WorkingDirectory, process cwd, Codebuff client isolation, file operations. All enforce isolation for executors; codex bridge is the documented exception.
- [x] **Runner guard verified.** `symphony-runner/runtime.mjs` refuses main-repo execution.
- [x] **Discord isolation verified.** `discord-request-router/process-and-proxy.mjs` blocks main-repo cwd.

### D Phase 1 — Bridge Identity Formalization (COMPLETE)

- [x] `bridge-mode.mjs` — derives `BRIDGE_MODE` from `BRIDGE_ROOT === CONTROL_REPO_ROOT`: `"worktree"` (isolated) or `"control-plane"` (main repo exception). Supports explicit env var override.
- [x] `deriveBridgeMode()` — pure function for testing the derivation logic
- [x] `isControlPlaneBridge()` — convenience predicate
- [x] `anqr-symphony-codex.service` — updated to set `BRIDGE_MODE=control-plane` explicitly
- [x] All new modules exported from `index.mjs`

### D Phase 2 — Boundary Enforcement Tests (COMPLETE)

- [x] `boundary-enforcement.spec.ts` — 28 tests in 6 categories:
  - Service file audit: executor uses worktree WorkingDirectory, codex uses main repo with control-plane, executor never points to main repo, codex on separate port, runner refuses main repo, Discord router blocks main-repo cwd
  - Bridge mode derivation: control-plane when roots match, worktree when different, trailing slash handling, all 8 worktree paths
  - assertMutationContext: blocks main repo, allows worktree, allows read-only, blocks missing worktreeId/leaseId, blocks projectRoot/worktreeRoot mismatch
  - remapRepoPathToBridgeRoot safety: early return for non-worktree, BRIDGE_ROOT fallback, isPathWithinRoot containment (not startsWith), parent traversal rejection
  - validate-boundary-invariants: module exists, checks consistency, logs ADR-0008 warning, called at startup
  - Env drift detection: parseEnvKeys extracts keys, handles missing files, checkEnvDrift returns structured result, harness-doctor integration

### D Phase 3 — Startup Boundary Assertion (COMPLETE)

- [x] `validate-boundary-invariants.mjs` — validates bridge identity consistency at startup:
  - Logs bridge identity (BRIDGE_MODE, IS_WORKTREE_BRIDGE, BRIDGE_ROOT, CONTROL_REPO_ROOT, ANQR_WORKTREE_ID)
  - Error if BRIDGE_MODE=worktree but IS_WORKTREE_BRIDGE=false
  - Error if BRIDGE_MODE=control-plane but BRIDGE_ROOT !== CONTROL_REPO_ROOT
  - Error if BRIDGE_MODE=worktree but BRIDGE_ROOT === CONTROL_REPO_ROOT
  - Warning for control-plane bridges (ADR-0008 exception acknowledgment)
- [x] `server.mjs` — calls `validateBoundaryInvariants()` at module load time (before first request)

### D Phase 4 — ADR and Documentation (COMPLETE)

- [x] ADR-0008 updated: added Enforcement section with BRIDGE_MODE table, defense layers table, startup validation details, key constraint (codex bridge must NOT be used for autonomous execution), test references
- [x] ADR-0003 updated: added Boundary Enforcement section documenting all six defense layers and their code-level enforcement, cross-references ADR-0008

### D Phase 5 — Completion (COMPLETE)

- [x] `BRIDGE_MODE=worktree` added to `anqr-symphony-executor@.service` — explicit symmetry with codex bridge's `BRIDGE_MODE=control-plane`
- [x] Port isolation test added to `boundary-enforcement.spec.ts` — proves router WORKTREES pool (ports 4321–4328) structurally excludes codex bridge (port 4330)
- [x] **`assertMutationContext` decision:** NOT added to bridge tool path. The codex bridge is an intentional ADR-0008 exception for developer tooling. Defense-in-depth is provided by port isolation (router never routes to 4330) and BRIDGE_MODE startup validation. Adding assertMutationContext to bridge tools would break the intended codex bridge functionality.

## Workstream E Detailed Progress

### E Phase 0 — Config Authority Audit (COMPLETE)

Audit findings:

- [x] **Three env file locations mapped:** repo template (`services/systemd/anqr-ops.env`), live host (`~/.config/systemd/user/anqr-ops.env`), symphony env (`~/.config/symphony/anqr.env` → symlink to live host)
- [x] **ADR-0009/0010 already document** the authority model: repo is authoritative for structure, host is authoritative for secrets
- [x] **Symlink strategy already in place** for systemd units, OpenClaw config. Env files with secrets are NOT symlinked (correct).
- [x] **`check-harness-config.mjs` was extremely limited** — only checked 2 files (`.env`, `litellm-config.yaml`)
- [x] **Most services use `EnvironmentFile=-`** (optional, silently continues on missing) — acceptable for graceful degradation but risks silent failures
- [x] **No drift detection existed** between repo template key names and live host file key names

### E Phase 1 — Drift Detection (COMPLETE)

- [x] `check-env-drift.mjs` created:
  - `parseEnvKeys(filePath)` — extracts key names from env files (never reads values/secrets)
  - `checkEnvDrift()` — compares repo template keys vs live host keys, reports missing keys, extra keys, symphony env symlink status
- [x] Integrated into `harness-doctor/index.mjs` exports
- [x] Integrated into `harness-doctor/main.mjs` diagnostic categories as "Env File Drift"
- [x] Tests in `boundary-enforcement.spec.ts` verify parseEnvKeys, checkEnvDrift, and harness-doctor integration

### E Phase 2 — Startup Environment Validation (COMPLETE)

- [x] `validate-startup-env.mjs` created — checks critical env vars at bridge startup:
  - At least one provider token present (GROQ_TOKEN, GEMINI_TOKEN, OPENROUTER_TOKEN, etc.)
  - ANQR_WORKTREE_ID set for worktree bridges
  - SYMPHONY_BRIDGE_PORT explicitly set (not relying on default)
  - BRIDGE_MODE explicitly set (not auto-derived)
- [x] Integrated into `server.mjs` — called at module load time after `validateBoundaryInvariants()`
- [x] Exported from bridge `index.mjs`
- [x] Tests in `boundary-enforcement.spec.ts` verify module existence, env var checks, and server.mjs integration

### E Phase 3 — Service Lifecycle Hardening (COMPLETE)

- [x] **Critical EnvironmentFile= enforcement:**
  - `anqr-symphony-router.service` — `EnvironmentFile=` (required) for `anqr-ops.env` (provider tokens needed)
  - `anqr-discord-router.service` — `EnvironmentFile=` (required) for `anqr-ops.env` (DISCORD_TOKEN needed)
  - `anqr-linear-webhook.service` — `EnvironmentFile=` (required) for `anqr-ops.env` (LINEAR_WEBHOOK_SECRET needed)
  - Supplementary `anqr.env` remains optional (`EnvironmentFile=-`) for all services
- [x] Tests in `boundary-enforcement.spec.ts` verify required vs optional EnvironmentFile patterns
- [x] **Service dependency and timer overlap semantics (documented in PLAN.md):**
  - **Required ordering:** All services depend on `network-online.target` via `After=` and `Wants=`
  - **No strict inter-service ordering:** Router, executors, webhook, integrator start independently. Executors listen on their own ports; the router discovers them by port convention, not ordering.
  - **Timer overlap:** `anqr-worktree-health.timer`, `anqr-nightly.timer`, `anqr-linear-export.timer`, `anqr-rag-rebuild.timer` run independently. Overlap is safe because each operates on distinct state surfaces.
  - **Flock serialization:** Validation (vitest, typecheck) uses `flock` to prevent concurrent heavy processes across worktrees.
  - **Restart behavior:** All services use `Restart=on-failure` with `RestartSec=5`. Memory limits (`MemoryHigh`, `MemoryMax`) prevent OOM cascades.

## Workstream F Detailed Progress

### F Phase 0 — Provider Evidence Gap Analysis (COMPLETE — discovery only)

Gap analysis findings:

- [x] **Evidence that IS emitted today:**
  - `selectProvider()` logs candidate ranking, selection, and safety-net activation via `logDebug`/`logInfo`/`logWarn`
  - `record-provider-selection.mjs` tracks selection counts in per-session stats
  - `recordProviderSelection()` in `task-evidence` records provider name + model per correlation ID
  - `build-provider-probe-report.mjs` generates comprehensive probe reports with selector summaries
  - `symphony-adaptive-context` tracks per-provider token ceilings and throttling
  - `bridge-metrics` captures request counts, latencies, error rates per provider

- [x] **Evidence gaps identified (NOT yet addressed):**
  - No structured per-request evidence artifact linking: route → candidates → scores → fallback chain → final selection → context reduction into one reconstructable record
  - Context reduction decisions (adaptive context ceiling, truncation) not linked to the request evidence
  - Fallback events (provider failure → next candidate) logged but not structured as evidence artifacts
  - Safety-net activation (all candidates exhausted) logged but not captured as auditable evidence
  - No post-hoc query capability: "for request X, why was provider Y chosen?"

- [x] **F Phase 1 scope (COMPLETE):**
  - `record-provider-routing-evidence.mjs` created in `task-evidence/` — structured per-request evidence
  - Emitted from `server.mjs` for both streaming and non-streaming paths
  - `invokeWithFallback` returns `fallbackChain` with per-attempt timing, outcome, error details
  - Evidence includes: routeModelId, allowedProviders, selectedProvider, attempts, triedProviders, hasFallback, fallbackChain
  - Tests in `provider-routing-evidence.spec.ts` verify module structure, exports, fallbackChain tracking, and server.mjs integration

### F Phase 1 — Provider Routing Evidence (COMPLETE)

- [x] `record-provider-routing-evidence.mjs` — structured evidence record with:
  - `routeModelId` — resolved model ID for the request
  - `allowedProviders` — providers allowed by route policy
  - `selectedProvider` — final selected provider
  - `attempts` / `triedProviders` — ordered attempt history
  - `hasFallback` — boolean indicating fallback occurred
  - `fallbackChain` — per-attempt records: `{ providerName, model, attemptNumber, outcome, durationMs, errorType, errorMessage }`
- [x] Exported from `task-evidence/index.mjs`
- [x] `invokeWithFallback` modified — tracks `fallbackChain` array with per-attempt timing via `attemptStartMs`; pushes success/failure entries; returns chain in result
- [x] `server.mjs` modified — imports `recordProviderRoutingEvidence`; emits evidence for streaming and non-streaming paths when `correlationId` is present
- [x] Tests: `provider-routing-evidence.spec.ts` — module existence, export structure, per-attempt fields, invokeWithFallback source verification, server.mjs integration

### F Remaining Work

- [ ] F Phase 2: Context-reduction evidence — emit context shaping decisions (adaptive ceiling, truncation) linked to request evidence
- [ ] F Phase 2: Safety-net activation evidence — structured record when all candidates exhausted
- [ ] F Phase 2: Post-hoc query capability: "for request X, why was provider Y chosen?"

# Purpose

This document defines the implementation work required to move the platform from its current state to **high-confidence fit-for-purpose status as a host-local automation harness for complete AI automation**. It is an implementation charter, not a review. It translates the confirmed findings from Review 1, Review 2, and the final source-grounded report into concrete requirements, workstreams, deliverables, and acceptance criteria.

The target outcome is a harness that is operationally trustworthy, deterministic enough for autonomous use, safe in its recovery behavior, explicit in its state ownership, disciplined in its repo and worktree boundaries, and continuously aligned between code, service configuration, and documentation.

# How the Assessment Was Built

**Review 1** was the first documentation-based architecture review. It reconstructed the platform from lighter README material and identified the major risk themes early: split control behavior, under-defined state ownership, concurrency fragility, provider-routing opacity, recovery risk, and weak operational detail. It was directionally correct, but it could not prove how much of the risk was documentation gap versus real implementation gap.

**Review 2** was the second-pass documentation correlation review. It used richer markdown README material to validate or correct the first pass. It increased confidence in the intended architecture by making the runner, integrator, reconciler, worktree fleet, provider-routing layer, systemd topology, Codex path, and OpenClaw config surface explicit. It also confirmed that several of the first-pass concerns were not misunderstandings. They remained active design risks.

The **final report** was the implementation-authoritative stage. It validated the earlier reviews against the actual repository and confirmed that the most serious risk zones still exist in code, not only in documentation. That report is the current-state authority for this requirements document.

This sequence matters because the understanding evolved in three steps:

- Review 1 identified the right architectural pressure points early.
- Review 2 clarified the intended design and narrowed ambiguity.
- The final report established which of those concerns remain materially unresolved in implementation and therefore must drive requirements.

# Headline Current-State Judgment

**The platform is partially fit for purpose as a host-local automation harness, but does not yet deserve high confidence for autonomous operation.**

In practical terms, that means the platform is credible as a real local automation system with worktree execution, integration, provider routing, evidence, and recovery surfaces, but it still lacks the control integrity required for strong autonomous trust. It is suitable for operator-observed use and iterative hardening. It is not yet suitable for high-confidence autonomous execution where correctness, determinism, recovery safety, and clean control boundaries are required.

# Confirmed Blocking Issues

1. **Split scheduler authority**
   Work admission and execution can be advanced by multiple actors rather than one authoritative scheduler. This remains the clearest architectural blocker because it undermines exactly-once claiming, clear responsibility, and predictable recovery.

2. **Recovery acting as a second git rider**
   Recovery still performs mutating git operations, including commit and push behavior, despite the intended design direction that recovery should be state-only, quarantine-oriented, and non-publishing. This is the most dangerous correctness risk because recovery can bypass the intended runner and integrator control path.

3. **Split local state ownership**
   Operational truth is still split across Linear, filesystem-backed harness state, and transient router memory. This creates drift risk after restarts, retries, and recovery events.

4. **Manual configuration synchronization risk**
   Critical runtime behavior depends on host-local environment files and OpenClaw config being kept in sync outside the repository’s transactional boundary. This makes drift a real runtime hazard.

5. **Intentional main repo versus worktree isolation exceptions**
   The architecture documents worktree isolation as the main safety boundary, but implementation retains explicit main-repo exceptions, especially in the Codex path and repair path. This weakens the isolation model and makes boundary discipline harder to guarantee.

6. **Provider routing nondeterminism**
   Provider selection depends on mutable health, probes, leases, recent history, and fallback state. This is workable for experimentation but too opaque for high-confidence autonomous operation unless bounded and observable.

7. **Idempotency, retry, lock ownership, and closure semantics remain insufficiently controlled**
   Earlier reviews flagged missing operational guarantees around retries, locks, closure rules, and evidence gating. The final report confirms that the broader control model is still not strong enough.

8. **Service lifecycle safety is still too weakly enforced**
   The platform has a real systemd topology, but reliability still depends heavily on harness-side repair loops rather than a tightly defined lifecycle model.

9. **Documentation drift is an engineering problem, not a writing problem**
   The assessment sequence showed that documentation quality improved, but code still diverged from intended ADR direction in important places. This means documentation alignment must be treated as a delivery requirement.

# Requirements for High-Confidence Automation Operation

## R1. Single authoritative scheduler

The platform **shall** have exactly one component that owns global issue admission and the transition from eligible to claimed. No runner, reconciler, webhook handler, or router path may independently self-pick or re-dispatch work outside that authority.

## R2. Recovery shall not publish code

Recovery **shall not** perform git add, commit, push, merge, cherry-pick, or any other code-publishing mutation. Recovery **shall** be limited to state repair, quarantine, reprovision requests, health marking, and explicit handoff back to the authoritative scheduler or operator workflow.

## R3. One authoritative local execution state model

The platform **shall** define and enforce one authoritative local execution-state model for claims, leases, retries, finalization, integration candidacy, quarantine, and recovery ownership. Linear, local state, and in-memory router counters **shall not** be competing truth domains for execution authority.

## R4. Durable and bounded dispatch accounting

All execution-dispatch accounting that affects scheduling decisions **shall** be durable, restart-safe, and reconciled against real execution state. In-memory-only counters **shall not** be relied on for scheduler correctness.

## R5. Worktree isolation shall be the default and enforced boundary

All code-changing autonomous execution **shall** occur in explicitly managed worktrees unless a documented exception is approved, justified, constrained, and enforced by code. Main-repo execution paths **shall** either be removed or converted into tightly bounded exception flows with their own controls and evidence.

## R6. Configuration synchronization shall be automated or eliminated

The platform **shall not** depend on manual synchronization of critical runtime configuration across repository files, host environment files, and OpenClaw runtime config. Config propagation **shall** be automated, validated, and drift-detectable.

## R7. Provider routing shall be policy-bounded and observable

Provider selection **shall** have explicit precedence rules, bounded fallback behavior, stable audit output, and operator-verifiable selection evidence. Adaptive routing may remain heuristic, but it **shall** be explainable and reproducible enough for incident analysis.

## R8. Idempotency, retries, and lock ownership shall be explicit

All ingress, scheduling, execution, integration, and recovery flows **shall** have explicit idempotency behavior, retry policy, lock ownership rules, lease expiry handling, and stale-owner resolution rules. These rules **shall** be enforced in code and documented.

## R9. Execution completion and workflow completion shall be distinct

The platform **shall** distinguish clearly between runner completion, integration completion, evidence publication, and workflow closure. No API surface or state transition may imply full workflow completion before integration and evidence closure are actually complete.

## R10. Evidence shall gate closure

Issue closure and final success status **shall** require defined evidence artifacts for scheduling, execution, validation, integration, and recovery outcomes where applicable. Missing evidence **shall** block closure.

## R11. Service lifecycle behavior shall be deliberate

Systemd units, timers, recovery loops, and startup flows **shall** have explicit dependency, overlap, restart, and ownership semantics. Host supervision must support correctness, not only liveness.

## R12. Documentation shall describe implemented behavior only

Architecture, operations, recovery, scheduling, state, configuration, and boundary documents **shall** match implemented behavior. Stale, contradictory, or aspirational claims **shall** be removed or explicitly marked as target-state, not current-state.

# Prioritized Workstreams

1. **Workstream A. Authoritative scheduling and claim control**
   Highest priority because split scheduler authority is the primary correctness defect. This workstream is the prerequisite for reliable retries, durable accounting, and safe recovery.

2. **Workstream B. State model normalization and durable ownership**
   Depends on A for authority boundaries. It establishes the durable truth model used by scheduling, execution, recovery, and integration.

3. **Workstream C. Recovery demotion to state-only safety behavior**
   Depends on A and B. Recovery cannot be made safe without authoritative scheduling and durable ownership.

4. **Workstream D. Repo/worktree boundary hardening**
   Depends on A, B, and C because the platform must know who is allowed to mutate what before boundary rules can be enforced.

5. **Workstream E. Configuration and service lifecycle hardening**
   Can proceed partly in parallel, but final completion depends on stable control ownership and boundary rules.

6. **Workstream F. Provider-routing determinism and context-control evidence**
   Can proceed in parallel after core scheduler and state ownership are established.

7. **Workstream G. Evidence, closure, and observability model**
   Depends on A through F because evidence must reflect the real control model, not the old one.

8. **Workstream H. Documentation and reality-alignment closure**
   Runs continuously, but final publication happens after each upstream workstream lands.

# Detailed Implementation Requirements

## Workstream A. Authoritative scheduling and claim control

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
- Align implementation with the intended single-scheduler model already reflected in the final report’s cited ADR direction.

**Risks if left unresolved**
Duplicate work, inconsistent claim timing, hard-to-debug retries, queue drift, and no clear owner for correctness failures.

## Workstream B. State model normalization and durable ownership

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

## Workstream C. Recovery demotion to state-only safety behavior

**Problem**
Recovery can currently mutate git state, auto-commit, push, sync, and even affect main-repo state.

**Required change**
Remove all recovery-side git publishing and repository mutation behavior that is outside explicit quarantine or non-publishing repair. Recovery must only classify, quarantine, mark state, request reprovision, or hand work back to the scheduler or operator path.

**Expected end state**
Recovery cannot publish code, cannot become a second git writer, and cannot bypass the runner or integrator lifecycle.

**Implementation notes**

- Delete or disable auto-commit, auto-push, main mutation, and cross-worktree propagation paths.
- Preserve only non-publishing repair operations.
- Add explicit stale-owner and orphan handling that results in quarantine or reassignment, not code mutation.

**Risks if left unresolved**
Unintended code publication, silent corruption of active work, race conditions with live execution, and violation of the intended control model.

## Workstream D. Repo/worktree boundary hardening

**Problem**
The worktree isolation story is weakened by intentional main-repo execution and repair exceptions.

**Required change**
Either remove main-repo code-changing execution paths or formalize them as explicit, minimal, non-default exceptions with dedicated controls, service boundaries, evidence, and approval requirements.

**Expected end state**
The default invariant is simple: autonomous code mutation happens in managed worktrees only. Any exception is visible, bounded, documented, and testable.

**Implementation notes**

- Review the Codex bridge path and path-remapping logic.
- Decide whether main-repo execution remains necessary.
- If kept, isolate it behind an explicit exception mode with separate service semantics and no ambiguity with worktree execution.

**Risks if left unresolved**
Weakened isolation, accidental main-repo mutation, hidden coupling between control checkout and execution checkout, and harder incident analysis.

## Workstream E. Configuration and service lifecycle hardening

**Problem**
Critical runtime behavior depends on manual env/config sync and a lifecycle model that is clearer than before but still not safe enough for high-confidence autonomous use.

**Required change**
Automate config propagation or eliminate split config surfaces. Define service dependency and timer overlap semantics. Add startup validation that refuses unsafe drifted config states.

**Expected end state**
Host-local runtime config is generated, validated, or synchronized from one authoritative source. Services fail clearly on invalid or drifted config. Timers and long-running services have explicit overlap and dependency controls.

**Implementation notes**

- Replace copy-and-remember config workflows with generated or synced config.
- Add drift-detection commands and CI or preflight validation.
- Tighten unit and timer semantics around ordering, restart behavior, and exclusivity.

**Risks if left unresolved**
Operator error remains part of the runtime contract. Configuration drift continues to cause unpredictable failures.

## Workstream F. Provider-routing determinism and context-control evidence

**Problem**
Provider routing and context shaping are adaptive and history-dependent, but not bounded enough for high-confidence autonomous trust.

**Required change**
Define stable routing policy precedence, fallback thresholds, and evidence emission for provider selection and prompt-shaping decisions. Make route choice and context reduction inspectable after the fact.

**Expected end state**
For any execution, operators can determine which provider was chosen, why it was chosen, what fallbacks occurred, and whether context reduction materially changed the request.

**Implementation notes**

- Emit routing-decision evidence with scores, probes, fallback triggers, and safety-net reasons.
- Emit context-shaping evidence with reduction cause, removed content class, and final provider budget.
- Bound hidden policy interactions where possible.

**Risks if left unresolved**
Poor reproducibility, weak incident analysis, opaque cost behavior, and hard-to-explain result variation.

## Workstream G. Evidence, closure, and observability model

**Problem**
The platform has evidence mechanisms, but the closure contract is still too weak and the boundary between execution completion and workflow completion is muddy.

**Required change**
Define mandatory evidence classes and enforce closure gating. Separate runner completion, integration completion, and issue closure in state, APIs, and notifications.

**Expected end state**
No issue appears complete unless required evidence exists for the lifecycle that actually occurred. APIs and notifications cannot imply full completion prematurely.

**Implementation notes**

- Define required evidence for dispatch, execution, validation, integration, recovery, and closure.
- Reject closeout when evidence is missing or state is incomplete.
- Ensure HTTP and notification surfaces use precise lifecycle terms.

**Risks if left unresolved**
False completion, misleading status, weak auditability, and brittle operational trust.

## Workstream H. Documentation and reality-alignment closure

**Problem**
Documentation quality improved, but the final report showed that important areas still diverge from implemented behavior.

**Required change**
Update or replace architecture, ADR, README, operations, service, and runtime-control documents so they describe current implemented behavior exactly. Remove stale or contradicted claims.

**Expected end state**
A reviewer can move from docs to code and observe no material contradiction in scheduler ownership, recovery behavior, state ownership, config flow, repo/worktree boundaries, provider-routing policy, or closure semantics.

**Implementation notes**

- Treat docs as code-deliverables, not follow-up tasks.
- Document current-state and target-state distinctly where a transition remains in progress.
- Require review of doc/code alignment in every affected pull request.

**Risks if left unresolved**
Recurring design drift, repeated false confidence, and wasted review cycles.

# Deliverables

1. **Authoritative scheduling implementation**
   - code changes removing runner global self-pick
   - code changes removing reconciler direct dispatch
   - unified scheduler-owned claim and dispatch path
   - scheduler state machine documentation
   - scheduler-focused integration tests

2. **State model implementation**
   - authoritative execution-state schema or module contract
   - durable dispatch accounting replacing in-memory correctness dependencies
   - lease, retry, finalization, quarantine, and integration queue invariants in code
   - restart and crash recovery tests

3. **Recovery safety implementation**
   - removal of recovery-side commit, push, merge, and publish behavior
   - quarantine and reprovision workflows
   - recovery decision documentation
   - tests proving recovery does not mutate git publish state

4. **Boundary hardening implementation**
   - explicit policy for main-repo execution paths
   - either removed or formally controlled main-repo mutation path
   - service and runtime config updates enforcing boundary rules
   - boundary tests covering worktree-only and approved exception flows

5. **Config and service lifecycle implementation**
   - automated config generation or synchronization mechanism
   - drift-detection and preflight validation tooling
   - updated systemd unit and timer definitions
   - startup/runbook documentation
   - tests or verification scripts for config parity and timer exclusivity

6. **Provider-routing and context evidence implementation**
   - routing decision evidence records
   - context-reduction evidence records
   - explicit routing policy documentation
   - tests covering fallback, safety-net, and reduction paths

7. **Evidence and closure implementation**
   - lifecycle status model separating execution, integration, and closure
   - mandatory evidence gating in closure paths
   - notification and API wording updates
   - audit tests proving closure fails when evidence is incomplete

8. **Documentation alignment package**
   - updated architecture docs
   - updated README files for affected subsystems
   - updated ADR status or replacement ADRs where current behavior changes
   - updated operational runbooks
   - removed or corrected stale contradictory content

9. **Completion evidence package**
   - before/after architecture summary
   - test results
   - service verification outputs
   - drift-check outputs
   - sample lifecycle evidence for a successful issue run and a quarantined failure path

# Acceptance Criteria

1. There is one and only one scheduler-authoritative code path for global issue admission and claim. No runner, reconciler, or webhook flow can bypass it.

2. Recovery code contains no autonomous git publish behavior. Automated tests prove recovery cannot commit, push, or mutate main.

3. All scheduling decisions that affect correctness survive process restart and are derived from durable state, not transient counters alone.

4. Every active issue has one durable owner, one durable lifecycle state, and one documented path for reassignment or quarantine.

5. Main-repo mutation is either eliminated from autonomous execution or documented as an explicit exception with code-level enforcement, evidence, and tests.

6. Config drift between repo-defined runtime settings and host runtime state is automatically detected and causes validation failure before unsafe operation.

7. Systemd service and timer behavior is documented and verified for dependency ordering, exclusivity where required, restart behavior, and startup safety.

8. Provider-routing decisions are logged with enough structured evidence to reconstruct why a provider was chosen and what fallbacks occurred.

9. Context reduction is visible in evidence and does not silently masquerade as an unmodified request.

10. Workflow completion is not signaled until integration and required evidence publication are complete.

11. Closure fails when mandatory evidence is missing.

12. Updated documentation matches implemented behavior for scheduler ownership, recovery limits, state ownership, repo/worktree boundaries, config flow, and lifecycle semantics.

13. A full end-to-end demonstration exists for:
    - successful authoritative scheduling through integration and closure
    - duplicate-trigger suppression \* recovery quarantine without git mutation
    - restart-safe resumption
    - config drift detection
    - provider fallback with recorded evidence

# Documentation and Reality Alignment Requirements

1. The following document classes must be updated whenever affected by implementation changes:
   - architecture overviews
   - subsystem READMEs
   - ADRs or ADR status notes
   - systemd/service lifecycle docs
   - operational runbooks
   - recovery and incident handling docs
   - config and environment setup docs

2. Documentation must describe:
   - ownership boundaries
   - control-flow boundaries
   - state authority
   - retry and idempotency semantics
   - lock and lease semantics
   - recovery behavior
   - repo/worktree boundary rules
   - config synchronization rules
   - evidence and closure rules

3. Any document that describes target-state rather than current-state must say so explicitly.

4. Stale or contradicted documents must be removed, replaced, or marked obsolete in the same delivery that changes the behavior.

5. Pull requests that change scheduler, recovery, state, boundary, provider-routing, config, or lifecycle behavior must include matching documentation changes as blocking deliverables.

6. The final delivery must include a doc-to-code alignment check showing that each critical control claim maps to the implemented subsystem named in the final report and second review.

# Recommended Delivery Sequence

1. Lock the target control model and define the authoritative scheduler and state model.
2. Remove runner self-pick and reconciler direct dispatch.
3. Replace transient dispatch correctness dependencies with durable state.
4. Remove recovery-side git mutation and publishing behavior.
5. Harden worktree and main-repo boundary rules.
6. Automate config propagation and add drift validation.
7. Tighten service lifecycle and timer safety.
8. Add provider-routing and context-control evidence.
9. Enforce closure gating and lifecycle-state precision.
10. Update all affected architecture, operations, and subsystem documents.
11. Run full end-to-end verification and produce the completion evidence package.

# Final Definition of Success

The platform deserves **high-confidence fit-for-purpose status as a host-local automation harness for complete AI automation** only when all of the following are true:

- one authoritative scheduler owns global execution admission
- recovery cannot publish code or act as a second git rider
- local execution truth is durable, singular, and restart-safe
- worktree isolation is the enforced default and any exception is explicit and controlled
- configuration drift is automated away or blocked before unsafe runtime
- provider routing and context shaping are observable enough for incident-grade reconstruction
- lifecycle status is precise from dispatch through closure
- evidence gates closure
- service lifecycle behavior supports correctness, not only liveness
- documentation matches implemented reality
- end-to-end tests and evidence prove the above under normal, retry, restart, drift, and failure scenarios
