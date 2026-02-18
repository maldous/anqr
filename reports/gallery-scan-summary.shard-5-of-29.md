# Gallery Scan Matrix Summary

## Overview

- Total runs: 16 (8 per tier × 2 tiers)
- **Tier A (Production):** 8 pass / 0 fail (100%)
- **Tier B (Diagnostic):** 8 pass / 0 fail (100%)
- Scan-gate-rescued: 0 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 2 | 0 |
| king | 2 | 0 |
| logo | 2 | 0 |
| test | 2 | 0 |

### Failing Cases

_None_

## Tier B — Diagnostic

> Intrinsic scannability without scan gate assistance

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 2 | 0 |
| king | 2 | 0 |
| logo | 2 | 0 |
| test | 2 | 0 |

### Failing Cases

_None_

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| overlay-mosaic | tsunami | pass | pass | ✅ both pass |
| overlay-mosaic | king | pass | pass | ✅ both pass |
| overlay-mosaic | logo | pass | pass | ✅ both pass |
| overlay-mosaic | test | pass | pass | ✅ both pass |
| animation-blend | tsunami | pass | pass | ✅ both pass |
| animation-blend | king | pass | pass | ✅ both pass |
| animation-blend | logo | pass | pass | ✅ both pass |
| animation-blend | test | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

_None — all Tier A passes also pass in Tier B._
