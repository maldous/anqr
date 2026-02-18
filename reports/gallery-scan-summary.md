# Gallery Scan Matrix Summary

## Overview

- Total runs: 36 (18 per tier × 2 tiers)
- **Tier A (Production):** 13 pass / 5 fail (72%)
- **Tier B (Diagnostic):** 12 pass / 6 fail (67%)
- Scan-gate-rescued: 1 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 2 | 1 |
| king | 2 | 1 |
| logo | 3 | 0 |
| test | 2 | 1 |
| trump | 2 | 1 |
| dance | 2 | 1 |

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
| tsunami | 2 | 1 |
| king | 2 | 1 |
| logo | 2 | 1 |
| test | 2 | 1 |
| trump | 2 | 1 |
| dance | 2 | 1 |

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
| animation-pixelate | tsunami | pass | pass | ✅ both pass |
| animation-pixelate | king | pass | pass | ✅ both pass |
| animation-pixelate | logo | pass | pass | ✅ both pass |
| animation-pixelate | test | pass | pass | ✅ both pass |
| animation-pixelate | trump | pass | pass | ✅ both pass |
| animation-pixelate | dance | pass | pass | ✅ both pass |
| animation-blend | tsunami | pass | pass | ✅ both pass |
| animation-blend | king | pass | pass | ✅ both pass |
| animation-blend | logo | pass | pass | ✅ both pass |
| animation-blend | test | pass | pass | ✅ both pass |
| animation-blend | trump | pass | pass | ✅ both pass |
| animation-blend | dance | pass | pass | ✅ both pass |
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
