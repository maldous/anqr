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
| overlay-subpixel | tsunami | pass | pass | ✅ both pass |
| overlay-subpixel | king | pass | pass | ✅ both pass |
| overlay-subpixel | logo | pass | pass | ✅ both pass |
| overlay-subpixel | test | pass | pass | ✅ both pass |
| overlay-subpixel | trump | pass | pass | ✅ both pass |
| overlay-subpixel | dance | pass | pass | ✅ both pass |
| animation-extreme | tsunami | — | — |  |
| animation-extreme | king | pass | pass | ✅ both pass |
| animation-extreme | logo | — | — |  |
| animation-extreme | test | — | — |  |
| animation-extreme | trump | — | — |  |
| animation-extreme | dance | pass | pass | ✅ both pass |
| qrart-standard | tsunami | pass | pass | ✅ both pass |
| qrart-standard | king | pass | pass | ✅ both pass |
| qrart-standard | logo | pass | pass | ✅ both pass |
| qrart-standard | test | pass | pass | ✅ both pass |
| qrart-standard | trump | pass | pass | ✅ both pass |
| qrart-standard | dance | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

_None — all Tier A passes also pass in Tier B._
