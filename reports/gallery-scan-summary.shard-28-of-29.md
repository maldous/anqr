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
| tsunami | 1 | 0 |
| king | 2 | 0 |
| logo | 1 | 0 |
| test | 1 | 0 |
| trump | 1 | 0 |
| dance | 2 | 0 |

### Failing Cases

_None_

## Tier B — Diagnostic

> Intrinsic scannability without scan gate assistance

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 1 | 0 |
| king | 2 | 0 |
| logo | 1 | 0 |
| test | 1 | 0 |
| trump | 1 | 0 |
| dance | 2 | 0 |

### Failing Cases

_None_

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| animation-halftone | tsunami | — | — |  |
| animation-halftone | king | pass | pass | ✅ both pass |
| animation-halftone | logo | — | — |  |
| animation-halftone | test | — | — |  |
| animation-halftone | trump | — | — |  |
| animation-halftone | dance | pass | pass | ✅ both pass |
| overlay-outline | tsunami | pass | pass | ✅ both pass |
| overlay-outline | king | pass | pass | ✅ both pass |
| overlay-outline | logo | pass | pass | ✅ both pass |
| overlay-outline | test | pass | pass | ✅ both pass |
| overlay-outline | trump | pass | pass | ✅ both pass |
| overlay-outline | dance | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

_None — all Tier A passes also pass in Tier B._
