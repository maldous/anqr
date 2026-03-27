# Linear Issue Review — 2026-03-26

## Executive Summary

**Total Open Issues:** 173

**Key Findings:**
- **129 issues** can likely be **resolved** (referenced files no longer exist)
- **2 duplicate issues** detected
- **131 issues** need label hygiene
- **0 stale issues** (>30 days old)

---

## 1. Issues Ready for Resolution (129 issues)

### Category Breakdown

All 129 resolvable issues fall into these categories:

#### **Sonar Code Quality Issues (127 issues)**
- **File path changes:** These Sonar issues reference files that have been moved or refactored
  - `scripts/ops/integrations/model/*` → Files moved to `scripts/ops/core/*` and `scripts/ops/integrations/model/*`
  - `scripts/ops/lib/logger.mjs` → Moved or refactored
  - `scripts/ops/runtime/watchdog/*` → Restructured
  - `scripts/ops/runtime/symphony/*` → Restructured
  - `tests/e2e/openclaw-symphony.spec.ts` → May have been reorganized
  - `tests/integration/*.spec.ts` → May have been reorganized or deleted

**Examples:**
- ANQ-879, ANQ-878: `symphony-session-state.mjs` issues
- ANQ-877, ANQ-876, ANQ-875: `bridge-watchdog.mjs` issues
- ANQ-874, ANQ-873: `watchdog-monitor.mjs` issues
- ANQ-751-879: Various bridge and integration file issues
- ANQ-771-846: E2E test file issues

#### **Harness Check Failures (1 issue)**
- ANQ-670: SonarDup issue for `codebuff-sdk-runner.mjs` (file no longer exists)

### Recommended Action

**Bulk resolve all 129 issues** with comment:
```
Resolved: Referenced file no longer exists in the codebase. File was moved, refactored, or removed as part of recent architecture changes. Sonar will recreate issues if problems reappear in the new file locations.
```

---

## 2. Duplicate Issues (2 issues)

### EMAIL Issues
- **ANQ-666** and **ANQ-665**: Both titled "[EMAIL] Ensure github issues are aligned with Linear issues"
  - Same title, same state (Backlog)
  - Created on the same day (2026-03-21)

**Recommended Action:**
- Keep one (ANQ-665), close the other (ANQ-666) as duplicate
- Or merge them if they contain different context

---

## 3. Label Hygiene Needed (131 issues)

**All Sonar-generated issues lack proper labels.**

Current state: Most have no labels or generic labels only.

**Recommended Action:**
- Add `sonar` label to all Sonar-generated issues
- Add appropriate package/runtime labels based on file paths:
  - `runtime:harness` for `scripts/ops/*` files
  - `pkg:testing` for `tests/*` files
  - `harness` for harness-related code quality issues

---

## 4. Active Work Issues (Highlighted)

### In Progress (1 issue)
- **ANQ-747**: Implement harness integration and OpenClaw end-to-end validation suites
  - Priority: P1
  - Labels: harness, runtime:harness, pkg:testing, reliability
  - Status: Actively being worked

### Recent Failures (2 issues)
- **ANQ-750**: Harness: test-unit failure (P1, created 2026-03-24)
- **ANQ-722**: Harness: repo-structure failure (P2, created 2026-03-23)

**Note:** These should be verified against current harness status before resolution.

---

## 5. Important Non-Sonar Issues (Selected)

### Testing Strategy Implementation (5 issues, Backlog)
- ANQ-749: Add security and mutation testing lanes
- ANQ-748: Add component and critical-flow coverage for web
- ANQ-746: Implement contract suites for API, MCP, bridges
- ANQ-745: Build shared fixtures, fakes, and contract helpers
- ANQ-744: Define ANQR protected test scope and wire Sonar coverage

### Governance & Standards (Active)
- ANQ-362: Establish unit test colocation baseline
- ANQ-350: Automated issue hygiene
- ANQ-347: Guardrail enforcement (P2)
- ANQ-326: Structured logging with redaction (P2)

### Release Readiness
- ANQ-315: Launch blocker tracker (P2, HUMAN)
- ANQ-314: Critical user journey validation (P1, HUMAN)
- ANQ-313: Performance budget compliance (P2)
- ANQ-312: QR scan reliability validation (P1, HUMAN)
- ANQ-311: Cross-platform QR parity verification (P1, HUMAN)
- ANQ-310: Security and redaction audit (P1, HUMAN)

---

## 6. Execution Plan

### Phase 1: Immediate Cleanup (Automated)
1. **Bulk resolve 129 Sonar issues** for non-existent files
2. **Close duplicate EMAIL issue** (ANQ-666)
3. **Add `sonar` label** to all Sonar-generated issues

### Phase 2: Verification (Manual)
1. Check if current Sonar scan has recreated any of these issues in new file locations
2. Verify harness failures (ANQ-750, ANQ-722) against latest harness report
3. Review EMAIL issues to understand their origin and purpose

### Phase 3: Ongoing Hygiene
1. Configure Sonar-Linear sync to automatically label issues
2. Set up automated duplicate detection
3. Implement stale issue escalation (as defined in governance docs)

---

## 7. Scripts Created

Two new Linear management scripts created:

1. **`scripts/ops/integrations/linear/list-open-issues.mjs`**
   - Lists all open issues with full metadata
   - Groups by state and label

2. **`scripts/ops/integrations/linear/review-open-issues.mjs`**
   - Analyzes issues for resolution opportunities
   - Detects duplicates, stale issues, missing labels
   - Cross-references with git and harness reports

**Usage:**
```bash
# List all open issues
node scripts/ops/integrations/linear/list-open-issues.mjs

# Analyze issues for cleanup
node scripts/ops/integrations/linear/review-open-issues.mjs
```

---

## Appendix: File Movement Context

The large number of resolvable Sonar issues is due to recent harness architecture refactoring:

**Old Structure:**
- `scripts/ops/integrations/model/symphony-openai-bridge.mjs`
- `scripts/ops/integrations/model/codebuff-openai-bridge.mjs`
- `scripts/ops/integrations/model/symphony-credit-gate.mjs`
- `scripts/ops/runtime/watchdog/bridge-watchdog.mjs`
- `scripts/ops/runtime/symphony/watchdog-monitor.mjs`
- `scripts/ops/lib/logger.mjs`

**Status:** These files were either:
- Moved to new locations in the harness architecture
- Refactored into new module structure
- Removed as part of architecture cleanup

**Impact:** Sonar issues still reference old file paths. Once resolved, new Sonar scan will create fresh issues for any code quality problems in the new locations.

---

**Generated:** 2026-03-26  
**Reviewed By:** Codebuff AI  
**Next Review:** After Sonar sync and harness report validation
