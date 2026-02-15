# Gallery Scan Matrix — Iteration 2 Findings (Current)

Generated: 2026-02-15
Dataset: 30 scenarios x 4 fixtures x 2 tiers = 240 runs
Source: `reports/gallery-scan-matrix.json` (updated 2026-02-15)
Runner: `make test:gallery:matrix` (sharded)

## Executive Summary
- Tier A (Production): **120/120 (100%)**.
- Tier B (Diagnostic): **98/120 (82%)**.
- Scan-gate rescued pairs: **22**.
- Prior P0 blockers (`overlay-mosaic`, blue-noise king regressions, `overlay-extreme` regression, `preserve-blended` Tier A failures) are now closed in Tier A.

## Tier A Status
- **No Tier A failures remain.**
- All previously `fix-now` Tier A items from Iteration 2 baseline are resolved.

## Tier B Residuals (Diagnostic)
Tier B remains intentionally stricter (`scanGateProfile=off`) and still surfaces intrinsic-art tradeoffs:
- 22 failures total.
- Fixture concentration: `king` 17, `test` 3, `tsunami` 1, `logo` 1.
- Largest residual scenario: `preserve-blended` (4 fails).

These are tracked as tunable/advanced-tradeoff behavior and not current production blockers given Tier A 100% pass.

## Infrastructure Improvement
Matrix execution is now resource-scaled and reusable via Makefile defaults:
- `test:gallery:matrix` runs sharded execution.
- Default tuning: `SCAN_MATRIX_SHARDS=16`, `SCAN_MATRIX_ESTIMATED_SHARD_GIB=4`.
- Full 240-run matrix now completes in ~80s on this host (down from ~450s single-process baseline).

## Disposition
- **Closed (P0):** Scanability production failures.
- **Open (non-scanability):** Android manual export verification, performance budget enforcement, remaining non-scanability release docs/evidence closure.
