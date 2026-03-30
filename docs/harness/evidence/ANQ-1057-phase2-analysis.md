# ANQ-1057 Phase 2 Analysis: Domain Core Unit Tests Scope Assessment

## Executive Summary

**Status:** ⚠️ SCOPE TOO LARGE FOR SINGLE SESSION

ANQ-1057 requests comprehensive unit tests across 5 domain packages to achieve 85%+ coverage, adding ~12,000 lines of test code. Current analysis shows this requires testing **1,746 source files**, which cannot be completed in a single Symphony runner session.

**Recommendation:** Break into 5 separate issues (one per domain package) or implement incrementally over multiple sessions.

---

## Scope Analysis

### File Counts (excluding existing .spec.ts files)

| Package                        | Source Files | Estimated Test Files Needed | Priority |
|--------------------------------|--------------|----------------------------|----------|
| `packages/domain/qr/src`       | 766          | ~200-300                   | HIGH     |
| `packages/domain/render/src`   | 771          | ~200-300                   | HIGH     |
| `packages/domain/payload/src`  | 135          | ~30-50                     | MEDIUM   |
| `packages/observability/logging/src` | 53    | ~15-20                     | LOW      |
| `packages/domain/analyze/src`  | 21           | ~10-15                     | MEDIUM   |
| **TOTAL**                      | **1,746**    | **~455-685**               | -        |

### Current Test Coverage

From coverage-scope.json Phase 2:
- **Current:** 9% (1,507/16,302 lines)
- **Target:** 85%+ (~13,857 lines covered)
- **Gap:** ~12,350 lines of production code need test coverage
- **Estimated test code needed:** ~12,000-15,000 lines

### Existing Test Coverage

**Already have tests for:**
- ✅ `packages/domain/qr/src/encode/` - Basic tests exist (qr-encode.spec.ts, auto-detect-type-number.spec.ts, calculate-mode-data-bits.spec.ts, calculate-optimal-version.spec.ts)
- ✅ `packages/domain/render/src/primitives/` - primitives.spec.ts exists
- ✅ `packages/domain/render/src/color/` - alpha-blend.spec.ts and others exist  
- ✅ `packages/domain/payload/src/` - payload-generators.spec.ts exists
- ✅ `packages/observability/logging/src/` - Multiple .spec.ts files exist

**Missing coverage for:**
- ❌ Most of `packages/domain/qr/src/qr-decoder/`
- ❌ Most of `packages/domain/qr/src/qr-generator/`
- ❌ Most of `packages/domain/qr/src/spec/`
- ❌ Most of `packages/domain/render/src/` (filters, effects, canvas operations)
- ❌ `packages/domain/analyze/src/` (almost entirely untested)

---

## Recommended Approach

### Option 1: Split into 5 Sub-Issues (RECOMMENDED)

Create separate Linear issues for each package:

1. **ANQ-1057-A: Domain QR Unit Tests** (~300 test files, +7% coverage)
   - Priority: P1 (highest business value)
   - Estimated effort: 3-5 Symphony sessions
   - Focus: QR encoding, decoding, spec validation

2. **ANQ-1057-B: Domain Render Unit Tests** (~300 test files, +6% coverage)
   - Priority: P1 (highest business value)  
   - Estimated effort: 3-5 Symphony sessions
   - Focus: Canvas rendering, filters, effects, color operations

3. **ANQ-1057-C: Domain Payload Unit Tests** (~40 test files, +2% coverage)
   - Priority: P2
   - Estimated effort: 1-2 Symphony sessions
   - Focus: Payload generators (vCard, WiFi, payments, etc.)

4. **ANQ-1057-D: Domain Analyze Unit Tests** (~15 test files, +2% coverage)
   - Priority: P2
   - Estimated effort: 1 Symphony session
   - Focus: QR analysis, metrics, decoder validation

5. **ANQ-1057-E: Observability Logging Unit Tests** (~20 test files, +1% coverage)
   - Priority: P3 (already has partial coverage)
   - Estimated effort: 1 Symphony session
   - Focus: Complete buffer capture, redaction, structured logging tests

### Option 2: Incremental Implementation

Keep ANQ-1057 open but implement over multiple Symphony sessions:
- Session 1: Complete `packages/domain/analyze/` (smallest, 21 files)
- Session 2: Complete `packages/observability/logging/` (53 files)
- Session 3-4: Complete `packages/domain/payload/` (135 files)
- Session 5-10: Complete `packages/domain/qr/` (766 files)
- Session 11-16: Complete `packages/domain/render/` (771 files)

**Estimated total:** 16-20 Symphony sessions to reach 85%+ coverage across all 5 packages.

---

## Constraints

### Symphony Runner Limits
- **Time budget:** ~30-60 minutes per session (watchdog timeout)
- **Focus requirement:** Need to run validation gates before completion
- **Realistic output:** 50-100 test cases per session maximum

### Quality Requirements (per docs/harness/05-quality-gates.md)
- ✅ All tests must pass (`npm run test:unit`)
- ✅ No type errors (`npm run typecheck`)
- ✅ No lint errors (`npm run lint`)
- ✅ No spelling errors (`npm run cspell`)
- ✅ AST density compliance (`npm run audit:ast`)

### Test Quality Requirements
- Pure unit tests only (no network, filesystem mutation, SDK calls)
- Colocated `*.spec.ts` files in package roots
- Property-based tests for large output spaces (QR encoding, payload generation)
- Golden fixtures for render and analysis invariants

---

## Immediate Action Required

**DECISION NEEDED:** Choose Option 1 or Option 2 above.

If **Option 1** is chosen, create 5 sub-issues and close ANQ-1057 as parent tracker.

If **Option 2** is chosen, update ANQ-1057 description to note incremental approach and track progress via comments.

---

## Session 1 Proposal (if proceeding incrementally)

**Target:** Complete `packages/domain/analyze/` (smallest package, 21 files)

**Rationale:**
- Smallest scope (~10-15 test files needed)
- Manageable in single session
- Demonstrates testing patterns for other packages
- Immediate +2% coverage gain

**Deliverables:**
1. Unit tests for all 21 files in `packages/domain/analyze/src/`
2. 85%+ line coverage for the package
3. All validation gates passing
4. Evidence document with coverage report

**Estimated time:** 45-60 minutes

---

## Conclusion

ANQ-1057 as currently scoped is **too large** for a single Symphony session. Recommend splitting into 5 sub-issues or implementing incrementally over 16-20 sessions.

**Next step:** Await decision on Option 1 vs Option 2, then proceed with smallest package first.

---

**Created:** 2026-03-30  
**Analyst:** Symphony Agent (ANQ-1057 session)  
**Status:** Awaiting direction
