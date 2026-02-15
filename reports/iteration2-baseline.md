# Iteration 2 Baseline Reconciliation

Date: 2026-02-15
Scope: Phase 0 truth pass from `plan2.md`

## Evidence Collected This Iteration
- `npm run test:unit:coverage` (filtered heavy suites) completed: 114 test files, 2883 tests passed.
- `npm run test:coverage:gap` regenerated coverage gap report.
- `npm run test:required:gap` regenerated required-mapping report.
- `npm run test:testid` regenerated testid audit report.
- `make test:overlay:audit` completed successfully in dedicated run.
- `make test:gallery:matrix` completed and regenerated matrix artifacts.

## Confirmed Open Issues
1. Scanability blockers remain open in current matrix artifacts (`reports/gallery-scan-summary.md`, updated 2026-02-15 15:44):
- Tier A now 112/120 (93%), but 8 `fix-now` failures remain.
- `preserve-blended` still fails 3/4 fixtures in Tier A.
- `overlay-blue-noise` and `animation-blue-noise` still fail on `king`.
- `overlay-extreme` regressed on `logo` in Tier A.

2. Android export manual verification is incomplete (`reports/android-export-verification.md`):
- PNG: `NOT VERIFIED`
- SVG: `NOT VERIFIED`
- Overlay export: `NOT VERIFIED`

3. Coverage remains below enforced thresholds (`reports/coverage-gap.md`):
- Global: statements 91.19%, branches 81.75%, functions 94.84%, lines 91.73%
- 115 files below 100%
- Critical low files still include:
  - `src/modules/qr-generator/scaled-render.ts`
  - `src/modules/qr-generator/qr-generator-class.ts`
  - `src/modules/qr-decoder/extract.ts`
  - `src/modules/qr-decoder/qr-data-decoder.ts`
  - `src/i18n/index.ts`

4. Risk register still has unresolved mitigations (`reports/risk-register.md`):
- R1 overlay blend modes: `Mitigating`
- R2 scanability: `Mitigating`
- R6 performance: `Mitigating`
- R7 output correctness: `Mitigating`

5. Performance/i18n hotspot remains open (from `reports/performance-bundle-audit.md` and signoff/risk notes):
- i18n/static bundle weight remains a dominant artifact risk with no iteration-2 reduction evidence yet.

## Confirmed Closed Issues (This Iteration)
1. Required mapping gap remains closed:
- `reports/required-gap.md`: 2161/2161 direct (`100.0%`).

2. Test ID coverage gap remains closed:
- `reports/testid-coverage.md`: 0 uncovered interactive IDs, 0 uncovered non-interactive IDs.

3. Payload option drift for removed URL aliases resolved in code/docs:
- Removed `file_url` and `cloud_link` from `PayloadKind` in `src/store/qr-store.ts`.
- Updated payload option list in `reports/option-matrix.md`.
- Updated regression test coverage in `tests/unit/qr-store.spec.ts`.

## Stale/Contradictory Statements Requiring Updates
1. `reports/production-signoff.md` is stale:
- States "Remaining Before Full Sign-off: None" while multiple P0 items are still open (scanability, Android export verification, risk mitigations).

2. `src/payload.md` is internally inconsistent and outdated:
- Mixes "FIXED" claims with unchecked audit checklists.
- Contradictory What3Words notes (radius removed vs radius selector present).
- Contains implementation notes that no longer match current runtime/type state.

3. `reports/gallery-scan-findings.md` was stale vs the regenerated matrix and has been updated in this iteration.

## Immediate Follow-up Required
1. Reconcile signoff/risk docs to reflect current open blockers:
- `reports/production-signoff.md`
- `reports/risk-register.md`

2. Convert `src/payload.md` from mixed plan log to a concise current-state closure report.
