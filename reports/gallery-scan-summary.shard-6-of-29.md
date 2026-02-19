# Gallery Scan Matrix Summary

## Overview

- Total runs: 28 (14 per tier × 2 tiers)
- **Tier A (Production):** 13 pass / 1 fail (93%)
- **Tier B (Diagnostic):** 13 pass / 1 fail (93%)
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
| dance | 2 | 1 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| animation-duotone | dance | CONTRAST_COLLAPSE | fix-now |

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
| dance | 2 | 1 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| animation-duotone | dance | CONTRAST_COLLAPSE | fix-now |

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| overlay-extreme | tsunami | pass | pass | ✅ both pass |
| overlay-extreme | king | pass | pass | ✅ both pass |
| overlay-extreme | logo | pass | pass | ✅ both pass |
| overlay-extreme | test | pass | pass | ✅ both pass |
| overlay-extreme | trump | pass | pass | ✅ both pass |
| overlay-extreme | dance | pass | pass | ✅ both pass |
| animation-duotone | tsunami | — | — |  |
| animation-duotone | king | pass | pass | ✅ both pass |
| animation-duotone | logo | — | — |  |
| animation-duotone | test | — | — |  |
| animation-duotone | trump | — | — |  |
| animation-duotone | dance | fail | fail | ❌ both fail |
| qrart-dots | tsunami | pass | pass | ✅ both pass |
| qrart-dots | king | pass | pass | ✅ both pass |
| qrart-dots | logo | pass | pass | ✅ both pass |
| qrart-dots | test | pass | pass | ✅ both pass |
| qrart-dots | trump | pass | pass | ✅ both pass |
| qrart-dots | dance | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

_None — all Tier A passes also pass in Tier B._
