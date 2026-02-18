# Gallery Scan Matrix Summary

## Overview

- Total runs: 24 (12 per tier × 2 tiers)
- **Tier A (Production):** 7 pass / 5 fail (58%)
- **Tier B (Diagnostic):** 6 pass / 6 fail (50%)
- Scan-gate-rescued: 1 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 1 | 1 |
| king | 1 | 1 |
| logo | 2 | 0 |
| test | 1 | 1 |
| trump | 1 | 1 |
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
| tsunami | 1 | 1 |
| king | 1 | 1 |
| logo | 1 | 1 |
| test | 1 | 1 |
| trump | 1 | 1 |
| dance | 1 | 1 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| overlay-brightness-mode | tsunami | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | king | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | logo | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | test | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | trump | CONTRAST_COLLAPSE | fix-now |
| overlay-brightness-mode | dance | CONTRAST_COLLAPSE | fix-now |

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| animation-subpixel | tsunami | pass | pass | ✅ both pass |
| animation-subpixel | king | pass | pass | ✅ both pass |
| animation-subpixel | logo | pass | pass | ✅ both pass |
| animation-subpixel | test | pass | pass | ✅ both pass |
| animation-subpixel | trump | pass | pass | ✅ both pass |
| animation-subpixel | dance | pass | pass | ✅ both pass |
| overlay-brightness-mode | tsunami | fail | fail | ❌ both fail |
| overlay-brightness-mode | king | fail | fail | ❌ both fail |
| overlay-brightness-mode | logo | pass | fail | 🟢 rescued |
| overlay-brightness-mode | test | fail | fail | ❌ both fail |
| overlay-brightness-mode | trump | fail | fail | ❌ both fail |
| overlay-brightness-mode | dance | fail | fail | ❌ both fail |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

| Scenario | Fixture |
| --- | --- |
| overlay-brightness-mode | logo |
