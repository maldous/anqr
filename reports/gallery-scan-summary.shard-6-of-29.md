# Gallery Scan Matrix Summary

## Overview

- Total runs: 36 (18 per tier × 2 tiers)
- **Tier A (Production):** 18 pass / 0 fail (100%)
- **Tier B (Diagnostic):** 18 pass / 0 fail (100%)
- Scan-gate-rescued: 0 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 3 | 0 |
| king | 3 | 0 |
| logo | 3 | 0 |
| test | 3 | 0 |
| trump | 3 | 0 |
| dance | 3 | 0 |

### Failing Cases

_None_

## Tier B — Diagnostic

> Intrinsic scannability without scan gate assistance

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 3 | 0 |
| king | 3 | 0 |
| logo | 3 | 0 |
| test | 3 | 0 |
| trump | 3 | 0 |
| dance | 3 | 0 |

### Failing Cases

_None_

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| overlay-extreme | tsunami | pass | pass | ✅ both pass |
| overlay-extreme | king | pass | pass | ✅ both pass |
| overlay-extreme | logo | pass | pass | ✅ both pass |
| overlay-extreme | test | pass | pass | ✅ both pass |
| overlay-extreme | trump | pass | pass | ✅ both pass |
| overlay-extreme | dance | pass | pass | ✅ both pass |
| animation-duotone | tsunami | pass | pass | ✅ both pass |
| animation-duotone | king | pass | pass | ✅ both pass |
| animation-duotone | logo | pass | pass | ✅ both pass |
| animation-duotone | test | pass | pass | ✅ both pass |
| animation-duotone | trump | pass | pass | ✅ both pass |
| animation-duotone | dance | pass | pass | ✅ both pass |
| qrart-dots | tsunami | pass | pass | ✅ both pass |
| qrart-dots | king | pass | pass | ✅ both pass |
| qrart-dots | logo | pass | pass | ✅ both pass |
| qrart-dots | test | pass | pass | ✅ both pass |
| qrart-dots | trump | pass | pass | ✅ both pass |
| qrart-dots | dance | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

_None — all Tier A passes also pass in Tier B._
