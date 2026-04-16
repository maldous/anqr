# High-Confidence Automation Readiness Requirements for the ANQR Host-Local Harness

This document is the **index** for the implementation plan. Detailed content is organized into focused sub-documents for reviewability.

## Execution Progress

| Workstream                    | Status         | Started    | Completed  | Detail Document |
| ----------------------------- | -------------- | ---------- | ---------- | --------------- |
| A. Authoritative scheduling   | ✅ Complete | 2026-04-13 | 2026-04-18 | [PLAN-workstream-A.md](./PLAN-workstream-A.md) |
| B. State model normalization  | ✅ Complete | 2026-04-15 | 2026-04-18 | [PLAN-workstream-B.md](./PLAN-workstream-B.md) |
| C. Recovery demotion          | ✅ Complete    | 2026-04-13 | 2026-04-14 | [PLAN-workstream-C.md](./PLAN-workstream-C.md) |
| D. Boundary hardening         | ✅ Complete | 2026-04-16 | 2026-04-18 | [PLAN-workstream-D.md](./PLAN-workstream-D.md) |
| E. Config/lifecycle hardening | ✅ Complete | 2026-04-16 | 2026-04-18 | [PLAN-workstream-E.md](./PLAN-workstream-E.md) |
| F. Provider-routing evidence  | ✅ Complete    | 2026-04-16 | 2026-04-17 | [PLAN-workstream-F.md](./PLAN-workstream-F.md) |
| G. Evidence/closure model     | ✅ Complete | 2026-04-18 | 2026-04-18 | [PLAN-workstream-G.md](./PLAN-workstream-G.md) |
| H. Documentation alignment    | ⬜ Not Started | —          | —          | Continuous       |

## Workstreams A–G Completion Summary

**All implementation workstreams (A–G) are ✅ Complete as of 2026-04-18.** Confirmed by gpt-5-agent deep audit. All carry-forward items from A–F resolved during G implementation (including F5 server.mjs wiring). Each workstream carries accepted Low-severity caveats documented in its detail file. Only Workstream H (documentation alignment) and acceptance criterion #13 (live end-to-end demo) remain open.

| Metric | Value |
|--------|-------|
| Total implementation workstreams | 7 (A–G) |
| Workstreams complete | 7/7 |
| Acceptance criteria satisfied | 11/13 (#12 = H docs, #13 = live demo) |
| Definition-of-success criteria met | 9/11 (docs + live demo remaining) |
| Evidence test count | 79 (durability + closure-gate + locked-closure + provider-routing) |
| Total workstream test count | 400+ across 18 test files |

---

## Workstream G Readiness Assessment (Historical)

**Prerequisite check for starting Workstream G (Evidence, closure, and observability model):**

| Prerequisite | Status | Evidence |
|---|---|---|
| A–F functionally complete | ✅ Sufficient for G | G-prerequisite gaps in A, B, E, F resolved; remaining items are hardening, not blockers |
| All unit tests pass (4,342) | ✅ | `npx vitest run` — 0 failures, 0 skipped |
| knip clean (no unused exports) | ✅ | `make knip` |
| oxlint clean (0 warnings, 0 errors) | ✅ | `npx oxlint` — 6,780 files, 93 rules |
| No merge conflict markers in tracked files | ✅ | `grep -rn '<<<<<<<' --include='*.md'` — only intentional examples |

### Deep Review Verdict (gpt-5-agent per-workstream audit)

| Workstream | Review Verdict | Key Finding |
|---|---|---|
| A | ✅ **Complete** | All gaps resolved: A1/A2 trigger/runner fixes, A3 resolved in G Phase 1 (ensureEvidenceRecord wired into execute-linear-issue-request.mjs). Accepted caveats: A4 test coverage mismatch (Low), A5 mixed source-grep/runtime tests (Low). |
| B | ✅ **Complete** | All 8 correctness blockers resolved. G-prereqs (B1/B2/B3) resolved. Accepted caveats: B4 heartbeatLease special-case (Low), B5 atomicity mocked (Low), B6 deprecated helpers test-only (Low). |
| C | **Complete for no-publication objective** | Sandbox mutation (reset_to_main) is acceptable — not publishing. "State-only" wording is overclaimed but functional intent is met |
| D | ✅ **Complete** | Codex exception bounded by in-tool `assertBridgeMutationBoundary` and documented per ADR-0008. 61 boundary enforcement tests. Accepted caveats: D1–D5 mixed test types, naming footgun (all Low). |
| E | ✅ **Complete** | E1/E2 resolved (SHA-256 rotation, preflight wired). E4 decided in G Phase 3: repo-static sufficient for closure. Accepted caveats: E3/E5/E6 symlink/timer/placeholder (all Low). |
| F | ✅ **Complete** (Phase 1 + 2 + 3) | All findings resolved including F5 selection rationale (G Phase 3) and F7 evidence durability (G Phase 1). ~68% runtime behavioral tests. Accepted caveat: F8 query library-only (Low). |

### Honest G-Readiness Judgment

**Workstreams A–G are now complete.** All carry-forward items from A–F have been resolved during G implementation:

**Carry-forward items resolved in G:**
1. **A3 — Alternate executor path** — ✅ Resolved in G Phase 1: `executeLinearIssueRequest` now generates `correlationId`, calls `ensureEvidenceRecord`, always sets `ANQR_CORRELATION_ID`.
2. **F7 — Evidence durability** — ✅ Resolved in G Phase 1: `withEvidenceLock` (O_EXCL advisory locking), `loadEvidenceRecordWithDiagnostics` (three-state return), `ensureEvidenceRecord` (idempotent creation).
3. **E4 — Repo-static lifecycle checks** — ✅ Decided in G Phase 3: repo-static is sufficient for closure. Documented limitation.
4. **F5 — Selection rationale** — ✅ Resolved in G Phase 3: `selectProvider` accepts `selectionLog`, `recordProviderRoutingEvidence` includes `selectionRationale`.

**Accepted remaining caveats (all Low severity, non-blocking):**
- A4/A5: Test methodology (source-grep vs runtime) — critical paths have runtime coverage
- B4: `heartbeatLease()` directly mutates lease (special-case maintenance)
- B5: Atomicity tested with mocked lock/storage (proves logic, not filesystem crash-window)
- B6: Deprecated helpers still importable as files (removed from barrel exports)
- D1–D5: Mixed test types, naming footguns, codex auth skip (all Low)
- E3/E5/E6: Symlink overclaim, simplistic timer validation, placeholder generation (all Low)
- F8: Post-hoc query is library-only, no CLI/HTTP endpoint (Low)

## Document Index

### Workstream Details (one per workstream)

- [PLAN-workstream-A.md](./PLAN-workstream-A.md) — Authoritative scheduling and claim control
- [PLAN-workstream-B.md](./PLAN-workstream-B.md) — State model normalization and durable ownership
- [PLAN-workstream-C.md](./PLAN-workstream-C.md) — Recovery demotion to state-only safety behavior
- [PLAN-workstream-D.md](./PLAN-workstream-D.md) — Repo/worktree boundary hardening
- [PLAN-workstream-E.md](./PLAN-workstream-E.md) — Configuration and service lifecycle hardening
- [PLAN-workstream-F.md](./PLAN-workstream-F.md) — Provider-routing determinism and context-control evidence
- [PLAN-workstream-G.md](./PLAN-workstream-G.md) — Evidence, closure, and observability model

### Supporting Documents

- [PLAN-decisions.md](./PLAN-decisions.md) — Full chronological decisions log (all workstreams)
- [PLAN-assessment.md](./PLAN-assessment.md) — Original assessment, headline judgment, confirmed blocking issues, requirements R1–R12
- [PLAN-deliverables.md](./PLAN-deliverables.md) — Deliverables, acceptance criteria, documentation requirements, delivery sequence, final definition of success

## Workstream Summaries

### A. Authoritative Scheduling (✅ Complete)
Architectural scheduler authority is real. Router verifies claims on trigger + queue-drain paths. Trigger-path fallback removed; executor verifies assigned worktree. A3 alternate executor path resolved in G Phase 1 (evidence record creation wired in).

### B. State Model Normalization (✅ Complete)
Phases 0–7 implemented. Transition helpers exist. Major writer migration done. Atomic claim+release helpers exist. `patchIssueState()` now guarded (LIFECYCLE_FIELDS throws on lifecycle writes). Evidence gating enforced (`integration_pending → completed` removed). All 8 correctness blockers resolved.

### C. Recovery Demotion (✅ Complete)
All recovery git publication removed; `checkBaselineHealth` detect-only; ADR-0005/ADR-0006/recovery docs aligned. **Note:** recovery still performs sandbox mutation (git fetch/reset/clean in reset_to_main) which is acceptable — the no-publication contract is the actual requirement.

### D. Boundary Hardening (✅ Complete)
BRIDGE_MODE formalization, fail-closed boundary invariants, assertBridgeMutationBoundary in all file-mutating tools, 61 boundary enforcement tests. Codex control-plane exception is bounded by in-tool enforcement and documented per ADR-0008.

### E. Config/Lifecycle Hardening (✅ Complete)
Fail-closed startup validation, config generation tooling, lifecycle checks with enforce mode, timer overlap safety, dependency chain validation. Key rotation tracking with SHA-256 value hashing integrated. Config preflight wired as blocking gate in runner and advisory check in bridge startup. E4 decided: repo-static lifecycle checks are sufficient for closure.

### F. Provider-Routing Evidence (✅ Complete)
Structured routing decision evidence on all 5 paths (streaming/non-streaming success/failure + Codebuff relay). Per-attempt fallback chain tracking, context-reduction evidence, safety-net evidence, post-hoc query capability. ~68% runtime behavioral tests. F5 selection rationale resolved in G Phase 3. F7 evidence durability resolved in G Phase 1.

## Test Coverage Summary

| Test File | Tests | Workstream |
|-----------|-------|------------|
| scheduler-exclusivity.spec.ts | 40 | A |
| assignment-roundtrip.spec.ts | — | B Phase 0 |
| state-model-phase1.spec.ts | 69 | B Phase 1 |
| transition-helpers-phase2.spec.ts | 27 | B Phase 2 |
| transition-migration-phase3.spec.ts | 24 | B Phase 3 |
| durable-ownership-phase4.spec.ts | 14 | B Phase 4 |
| bidirectional-ownership-phase5.spec.ts | 15 | B Phase 5 |
| infer-owner-fallback-observability.spec.ts | 6 | B Phase 5 |
| no-transient-correctness.spec.ts | 11 | B Phase 6 |
| claim-lifecycle-phase6.spec.ts | 12 | B Phase 6 |
| stale-lease-phase6.spec.ts | 13 | B Phase 6 |
| b-prerequisite-lifecycle-guard.spec.ts | 18 | B (G prereqs) |
| recovery-no-git-mutation.spec.ts | 17 | C |
| recovery-behavioral.spec.ts | — | C |
| boundary-enforcement.spec.ts | 61 | D + E |
| config-lifecycle-enforcement.spec.ts | 57 | E |
| provider-routing-evidence.spec.ts | 32 | F |
| worktree-health.spec.ts | 10 | B |
