# Gallery Scan Matrix Summary

## Overview

- Total runs: 24 (12 per tier × 2 tiers)
- **Tier A (Production):** 6 pass / 6 fail (50%)
- **Tier B (Diagnostic):** 6 pass / 6 fail (50%)
- Scan-gate-rescued: 0 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

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
| overlay-outline | tsunami | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | king | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | logo | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | test | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | trump | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | dance | CONTRAST_COLLAPSE | fix-now |

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
| overlay-outline | tsunami | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | king | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | logo | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | test | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | trump | CONTRAST_COLLAPSE | fix-now |
| overlay-outline | dance | CONTRAST_COLLAPSE | fix-now |

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| animation-halftone | tsunami | pass | pass | ✅ both pass |
| animation-halftone | king | pass | pass | ✅ both pass |
| animation-halftone | logo | pass | pass | ✅ both pass |
| animation-halftone | test | pass | pass | ✅ both pass |
| animation-halftone | trump | pass | pass | ✅ both pass |
| animation-halftone | dance | pass | pass | ✅ both pass |
| overlay-outline | tsunami | fail | fail | ❌ both fail |
| overlay-outline | king | fail | fail | ❌ both fail |
| overlay-outline | logo | fail | fail | ❌ both fail |
| overlay-outline | test | fail | fail | ❌ both fail |
| overlay-outline | trump | fail | fail | ❌ both fail |
| overlay-outline | dance | fail | fail | ❌ both fail |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

_None — all Tier A passes also pass in Tier B._
