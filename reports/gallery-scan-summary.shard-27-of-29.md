# Gallery Scan Matrix Summary

## Overview

- Total runs: 16 (8 per tier × 2 tiers)
- **Tier A (Production):** 3 pass / 5 fail (38%)
- **Tier B (Diagnostic):** 3 pass / 5 fail (38%)
- Scan-gate-rescued: 0 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 0 | 1 |
| king | 1 | 1 |
| logo | 1 | 0 |
| test | 0 | 1 |
| trump | 0 | 1 |
| dance | 1 | 1 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| overlay-brightness-mode | tsunami | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | king | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | test | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | trump | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | dance | CONTRAST_COLLAPSE | fix-now |

## Tier B — Diagnostic

> Intrinsic scannability without scan gate assistance

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 0 | 1 |
| king | 1 | 1 |
| logo | 1 | 0 |
| test | 0 | 1 |
| trump | 0 | 1 |
| dance | 1 | 1 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| overlay-brightness-mode | tsunami | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | king | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | test | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | trump | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | dance | CONTRAST_COLLAPSE | fix-now |

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| animation-subpixel | tsunami | — | — |  |
| animation-subpixel | king | pass | pass | ✅ both pass |
| animation-subpixel | logo | — | — |  |
| animation-subpixel | test | — | — |  |
| animation-subpixel | trump | — | — |  |
| animation-subpixel | dance | pass | pass | ✅ both pass |
| overlay-brightness-mode | tsunami | fail | fail | ❌ both fail |
| overlay-brightness-mode | king | fail | fail | ❌ both fail |
| overlay-brightness-mode | logo | pass | pass | ✅ both pass |
| overlay-brightness-mode | test | fail | fail | ❌ both fail |
| overlay-brightness-mode | trump | fail | fail | ❌ both fail |
| overlay-brightness-mode | dance | fail | fail | ❌ both fail |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

_None — all Tier A passes also pass in Tier B._
