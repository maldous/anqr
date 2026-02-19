# Gallery Scan Matrix Summary

## Overview

- Total runs: 28 (14 per tier × 2 tiers)
- **Tier A (Production):** 14 pass / 0 fail (100%)
- **Tier B (Diagnostic):** 14 pass / 0 fail (100%)
- Scan-gate-rescued: 0 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 2 | 0 |
| king | 3 | 0 |
| logo | 2 | 0 |
| test | 2 | 0 |
| trump | 2 | 0 |
| dance | 3 | 0 |

### Failing Cases

_None_

## Tier B — Diagnostic

> Intrinsic scannability without scan gate assistance

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 2 | 0 |
| king | 3 | 0 |
| logo | 2 | 0 |
| test | 2 | 0 |
| trump | 2 | 0 |
| dance | 3 | 0 |

### Failing Cases

_None_

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| overlay-mosaic | tsunami | pass | pass | ✅ both pass |
| overlay-mosaic | king | pass | pass | ✅ both pass |
| overlay-mosaic | logo | pass | pass | ✅ both pass |
| overlay-mosaic | test | pass | pass | ✅ both pass |
| overlay-mosaic | trump | pass | pass | ✅ both pass |
| overlay-mosaic | dance | pass | pass | ✅ both pass |
| animation-blend | tsunami | — | — |  |
| animation-blend | king | pass | pass | ✅ both pass |
| animation-blend | logo | — | — |  |
| animation-blend | test | — | — |  |
| animation-blend | trump | — | — |  |
| animation-blend | dance | pass | pass | ✅ both pass |
| qrart-colored | tsunami | pass | pass | ✅ both pass |
| qrart-colored | king | pass | pass | ✅ both pass |
| qrart-colored | logo | pass | pass | ✅ both pass |
| qrart-colored | test | pass | pass | ✅ both pass |
| qrart-colored | trump | pass | pass | ✅ both pass |
| qrart-colored | dance | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

_None — all Tier A passes also pass in Tier B._
