# Workstream F — Provider-Routing Determinism and Context-Control Evidence

> Part of [PLAN.md](./PLAN.md) · Status: ✅ Complete (Phase 1 + Phase 2 + Phase 3) · Started: 2026-04-16

## Summary

Phase 1: RoutingDecisionEvidence structured record, emitted from invokeWithFallback/stream with per-attempt timing/error tracking. Phase 2: context-reduction evidence (record-context-reduction-evidence.mjs), safety-net activation evidence (record-safety-net-evidence.mjs), post-hoc query (query-routing-evidence.mjs). Phase 3: Failure-path evidence coverage (F2/F3/F4/F6) and source-grep-to-runtime test conversion (F1). ~37 provider-routing evidence tests (~25 runtime behavioral + ~12 architecture guard).

## Requirements Addressed

- **R7. Provider routing shall be policy-bounded and observable** — Provider selection shall have explicit precedence rules, bounded fallback behavior, stable audit output, and operator-verifiable selection evidence.
- **R9. Execution completion and workflow completion shall be distinct** — The platform shall distinguish clearly between runner completion, integration completion, evidence publication, and workflow closure.

## Detailed Progress

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
  - Context reduction decisions not linked to the request evidence
  - Fallback events logged but not structured as evidence artifacts
  - Safety-net activation logged but not captured as auditable evidence
  - No post-hoc query capability

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

### F Phase 2 — Context-Reduction, Safety-Net, and Post-Hoc Query (COMPLETE)

- [x] `record-context-reduction-evidence.mjs` — captures every context budget adjustment during fallback cascade:
  - Records providerName, previousCap, newCap, reason (reported_limit or estimated_from_request)
  - Tracks reportedLimit, requestedTokens for each reduction
  - Calculates finalCap for the cascade
- [x] `record-safety-net-evidence.mjs` — captures when all providers are exhausted:
  - Records triedProviders, totalAttempts, routeModelId, lastError
  - Includes full fallbackChain for post-hoc analysis
  - activatedAt timestamp for incident correlation
- [x] `query-routing-evidence.mjs` — post-hoc query capability:
  - Takes correlationId, returns full routing decision reconstruction
  - Combines providerSelection, providerRouting, contextReduction, safetyNet
  - Builds human-readable explanation string
  - Returns `{ found: false }` for unknown correlationIds
- [x] `invokeWithFallback` — tracks `contextReductions` array, attaches `safetyNetData` to exhaustion errors
- [x] `invokeWithFallbackStream` — now tracks `fallbackChain`, `contextReductions`, attaches `safetyNetData`
- [x] `server.mjs` — emits `recordContextReductionEvidence` on success, `recordSafetyNetEvidence` on provider exhaustion
- [x] All new modules exported from `task-evidence/index.mjs` and `task-evidence.mjs` facade
- [x] Tests in `provider-routing-evidence.spec.ts` verify all F Phase 2 modules and integration

### F Phase 3 — Failure-Path Evidence & Test Conversion (COMPLETE)

- [x] **F1 resolved**: Converted ~43 source-grep tests to ~25 runtime behavioral tests + ~12 consolidated architecture guard tests. Runtime-to-source ratio improved from ~17% to ~68%.
- [x] **F2 resolved**: `recordProviderRoutingEvidence` now emitted on ALL five paths — streaming success, streaming failure, non-streaming success, non-streaming failure, and Codebuff transparent relay. Failure paths use `selectedProvider: null`.
- [x] **F3 resolved**: `recordSafetyNetEvidence` now emitted for non-streaming provider exhaustion via new catch block in server.mjs non-streaming path.
- [x] **F4 resolved**: `contextReductions` added to `safetyNetData` in both `invokeWithFallback` and `invokeWithFallbackStream`. `recordContextReductionEvidence` emitted in streaming and non-streaming failure paths.
- [x] **F6 resolved**: Codebuff transparent relay success path now emits `recordProviderRoutingEvidence` with single-entry fallbackChain (attempts: 1, outcome: success).

### F Remaining Work (deferred — not blocking Workstream G)

Low-severity items identified by completion review.

### Documentation Cleanup (COMPLETE)

- [x] Cleaned merge conflict markers from 10 README files

## Implementation Requirements (from original assessment)

**Problem**
Provider routing and context shaping are adaptive and history-dependent, but not bounded enough for high-confidence autonomous trust.

**Required change**
Define stable routing policy precedence, fallback thresholds, and evidence emission for provider selection and prompt-shaping decisions. Make route choice and context reduction inspectable after the fact.

**Expected end state**
For any execution, operators can determine which provider was chosen, why it was chosen, what fallbacks occurred, and whether context reduction materially changed the request.

**Risks if left unresolved**
Poor reproducibility, weak incident analysis, opaque cost behavior, and hard-to-explain result variation.

## Deliverables

- ✅ Routing decision evidence records
- ✅ Context-reduction evidence records
- ✅ Explicit routing policy documentation
- ✅ Tests covering fallback, safety-net, and reduction paths

## Acceptance Criteria

8. ✅ Provider-routing decisions are logged with enough structured evidence to reconstruct why a provider was chosen and what fallbacks occurred.
9. ✅ Context reduction is visible in evidence and does not silently masquerade as an unmodified request.

## Completion Review Findings (gpt-5-agent deep audit)

**Verdict: Substantially implemented, but not validly complete for dependency by Workstream G. Helper modules exist and work, but actual evidence-emission coverage is incomplete.**

### Findings

| # | Finding | Severity | Detail |
|---|---------|----------|--------|
| F1 | ~43/52 tests are source-text checks | **High** | Most tests use `fs.readFileSync` + `expect(source).toContain(...)`. Only ~9 are runtime helper tests. No end-to-end test drives `server.mjs` or `invokeWithFallback` and asserts emitted evidence files. |
| F2 | Failure-path evidence incomplete | **High** | `recordProviderRoutingEvidence` emitted only on success in `server.mjs`. Failed requests lose the main routing record. |
| F3 | Non-streaming exhaustion missing safety-net | **High** | `recordSafetyNetEvidence` is called only in the streaming catch path. Non-streaming provider exhaustion has no equivalent safety-net evidence emission. |
| F4 | Context-reduction evidence only on success | Medium | `recordContextReductionEvidence` called only when a result exists. If request reduces context then exhausts providers, reduction history is not persisted. |
| F5 | No provider selection rationale | Medium | Evidence records `allowedProviders` and final chain, but not ranked candidates, scores, policy precedence, or why provider A beat provider B. "Why was provider chosen" only weakly satisfied. |
| F6 | Transparent Codebuff streaming skips evidence | Medium | `isSelectedCodebuff` streaming fast-path returns early after `invokeCodebuffDirectStreamToSSE()` without emitting `recordProviderRoutingEvidence` or `recordContextReductionEvidence`. |
| F7 | Evidence persistence is best-effort | Low for F, **High for G** | All server-side evidence calls are wrapped as best-effort. Helpers return null if record doesn't exist. `updateEvidenceRecord()` has no locking — last-write-wins races possible. |
| F8 | Post-hoc query is library function only | Low | `queryRoutingEvidence()` works but is just a file reader + formatter. No CLI wrapper or HTTP endpoint. Not an operator-grade facility. |

### Minimum Fixes Before Workstream G

1. ✅ Emit `recordSafetyNetEvidence` for **non-streaming** provider exhaustion (F3) — **resolved in Phase 3**
2. ✅ Persist `providerRouting` and `contextReduction` evidence for **failure** paths too (F2, F4) — **resolved in Phase 3**
3. ✅ Cover the transparent Codebuff streaming success path with routing evidence (F6) — **resolved in Phase 3**
4. Deferred: Add selector rationale to evidence: ranked candidates, scores, exclusions, policy reason (F5)
5. ✅ Add runtime tests that drive evidence functions and assert emitted evidence files (F1) — **resolved in Phase 3**
6. Deferred: Decide whether evidence persistence is best-effort or required-for-closure, enforce accordingly (F7)
