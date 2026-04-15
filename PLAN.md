# High-Confidence Automation Readiness Requirements for the ANQR Host-Local Harness

This document is the **index** for the implementation plan. Detailed content is organized into focused sub-documents for reviewability.

## Execution Progress

| Workstream                    | Status         | Started    | Completed  | Detail Document |
| ----------------------------- | -------------- | ---------- | ---------- | --------------- |
| A. Authoritative scheduling   | 🟡 Substantially Complete | 2026-04-13 | — | [PLAN-workstream-A.md](./PLAN-workstream-A.md) |
| B. State model normalization  | 🟡 Substantially Complete | 2026-04-15 | — | [PLAN-workstream-B.md](./PLAN-workstream-B.md) |
| C. Recovery demotion          | ✅ Complete    | 2026-04-13 | 2026-04-14 | [PLAN-workstream-C.md](./PLAN-workstream-C.md) |
| D. Boundary hardening         | 🟡 Substantially Complete | 2026-04-16 | — | [PLAN-workstream-D.md](./PLAN-workstream-D.md) |
| E. Config/lifecycle hardening | 🟡 Substantially Complete | 2026-04-16 | — | [PLAN-workstream-E.md](./PLAN-workstream-E.md) |
| F. Provider-routing evidence  | ✅ Complete    | 2026-04-16 | 2026-04-17 | [PLAN-workstream-F.md](./PLAN-workstream-F.md) |
| G. Evidence/closure model     | ⬜ Ready to Start | —      | —          | Carry-forward: A3, E4, F5, F7 |
| H. Documentation alignment    | ⬜ Not Started | —          | —          | Continuous       |

## Workstream G Readiness Assessment

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
| A | Substantially implemented | ~~Trigger-path fallback weakens strict authority~~ **RESOLVED**; ~~runner doesn't verify assigned worktree~~ **RESOLVED**; remaining: A3 alternate executor path unguarded, tests mixed source-grep/runtime |
| B | Substantially implemented, G-prereqs resolved | ~~`patchIssueState()` unrestricted~~ **RESOLVED** (LIFECYCLE_FIELDS guard); ~~`integration_pending → completed` direct~~ **RESOLVED** (must go through evidence_pending); remaining: heartbeatLease bypasses transition helpers, atomicity mocked |
| C | **Complete for no-publication objective** | Sandbox mutation (reset_to_main) is acceptable — not publishing. "State-only" wording is overclaimed but functional intent is met |
| D | Substantively complete | Codex exception now bounded by in-tool `assertBridgeMutationBoundary`; tests are mixed runtime/source; `IS_WORKTREE_BRIDGE` naming contradiction is a future footgun |
| E | Substantially complete, lifecycle wired | ~~Key-inventory not value-aware~~ **RESOLVED** (SHA-256 rotation tracking); ~~preflight not wired~~ **RESOLVED** (blocking gate in runner, advisory in bridge); remaining: repo-static lifecycle checks, symlink overclaim |
| F | **Complete** (Phase 1 + 2 + 3) | ~~Source-text tests~~ **RESOLVED** (~68% runtime); ~~failure-path evidence~~ **RESOLVED**; ~~non-streaming safety-net~~ **RESOLVED**; ~~Codebuff relay~~ **RESOLVED**; deferred: selection rationale (F5), evidence durability (F7) |

### Honest G-Readiness Judgment

**Workstreams A–F are now sufficient to begin Workstream G.** Earlier G-prerequisite gaps in A (A1/A2), B (B1/B2/B3), E (E1/E2), and F (F1–F4/F6) have been resolved and covered by expanded tests. The remaining work is primarily closure-grade hardening, not start blockers.

Remaining items fall into two tiers:

**Early-G carry-forward (should be addressed as G begins):**
1. **A3 — Alternate executor path** — `/v1/linear/execute` bypasses scheduler claim verification and assignment enforcement via operator override semantics. Needs hardening or documented privileged-path exception.
2. **F7 — Evidence durability** — All evidence persistence is best-effort (no locking, last-write-wins). G must decide if evidence is advisory or closure-authoritative.
3. **E4 — Repo-static lifecycle checks** — `checkServiceLifecycle()` inspects repo files, not live host state. If G closure claims require host-runtime proof, this needs upgrading.
4. **F5 — Selection rationale** — Evidence records final selection but not ranked candidates, scores, or policy precedence. "Why was provider chosen" only weakly satisfied.

**Accepted remaining caveats (non-blocking):**
- B4: `heartbeatLease()` directly mutates lease (special-case maintenance)
- B5: Atomicity tested with mocked lock/storage (proves logic, not filesystem crash-window)
- B6: Deprecated helpers still importable as files (removed from barrel exports)
- D1–D5: Mixed test types, naming footguns, codex auth skip (all Low)
- E3/E5/E6: Symlink overclaim, simplistic timer validation, placeholder generation (all Low)
- F8: Post-hoc query is library-only, no CLI/HTTP endpoint (Low)

**Recommendation:** G can begin now without bundling prior prerequisite remediation. G should focus on evidence durability, closure authority, and the carry-forward items above.

## Document Index

### Workstream Details (one per workstream)

- [PLAN-workstream-A.md](./PLAN-workstream-A.md) — Authoritative scheduling and claim control
- [PLAN-workstream-B.md](./PLAN-workstream-B.md) — State model normalization and durable ownership
- [PLAN-workstream-C.md](./PLAN-workstream-C.md) — Recovery demotion to state-only safety behavior
- [PLAN-workstream-D.md](./PLAN-workstream-D.md) — Repo/worktree boundary hardening
- [PLAN-workstream-E.md](./PLAN-workstream-E.md) — Configuration and service lifecycle hardening
- [PLAN-workstream-F.md](./PLAN-workstream-F.md) — Provider-routing determinism and context-control evidence

### Supporting Documents

- [PLAN-decisions.md](./PLAN-decisions.md) — Full chronological decisions log (all workstreams)
- [PLAN-assessment.md](./PLAN-assessment.md) — Original assessment, headline judgment, confirmed blocking issues, requirements R1–R12
- [PLAN-deliverables.md](./PLAN-deliverables.md) — Deliverables, acceptance criteria, documentation requirements, delivery sequence, final definition of success

## Workstream Summaries

### A. Authoritative Scheduling (🟡 Substantially Complete)
Architectural scheduler authority is real. Router verifies claims on trigger + queue-drain paths. Trigger-path fallback removed; executor verifies assigned worktree. **Remaining:** A3 alternate executor path (`/v1/linear/execute`) bypasses claim verification; tests mixed source-grep/runtime.

### B. State Model Normalization (🟡 Substantially Complete)
Phases 0–7 implemented. Transition helpers exist. Major writer migration done. Atomic claim+release helpers exist. `patchIssueState()` now guarded (LIFECYCLE_FIELDS throws on lifecycle writes). Evidence gating enforced (`integration_pending → completed` removed). **Remaining:** `heartbeatLease()` bypasses transition helpers; atomicity tested with mocked lock/storage.

### C. Recovery Demotion (✅ Complete)
All recovery git publication removed; `checkBaselineHealth` detect-only; ADR-0005/ADR-0006/recovery docs aligned. **Note:** recovery still performs sandbox mutation (git fetch/reset/clean in reset_to_main) which is acceptable — the no-publication contract is the actual requirement.

### D. Boundary Hardening (🟡 Substantially Complete)
BRIDGE_MODE formalization, fail-closed boundary invariants, assertBridgeMutationBoundary in all file-mutating tools, 61 boundary enforcement tests. Codex control-plane exception is bounded by in-tool enforcement and documented per ADR-0008. **Remaining:** tests mixed runtime/source; `IS_WORKTREE_BRIDGE` naming contradiction.

### E. Config/Lifecycle Hardening (🟡 Substantially Complete)
Fail-closed startup validation, config generation tooling, lifecycle checks with enforce mode, timer overlap safety, dependency chain validation. Key rotation tracking with SHA-256 value hashing integrated. Config preflight wired as blocking gate in runner and advisory check in bridge startup. **Remaining:** lifecycle checks are repo-static not host-runtime; symlink verification is existence-only.

### F. Provider-Routing Evidence (✅ Complete)
Structured routing decision evidence on all 5 paths (streaming/non-streaming success/failure + Codebuff relay). Per-attempt fallback chain tracking, context-reduction evidence, safety-net evidence, post-hoc query capability. ~68% runtime behavioral tests. **Deferred:** selection rationale (F5), evidence durability/locking (F7), CLI/HTTP query endpoint (F8).

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
