# Gallery Scan Matrix Summary

## Overview

- Total runs: 24 (12 per tier × 2 tiers)
- **Tier A (Production):** 12 pass / 0 fail (100%)
- **Tier B (Diagnostic):** 12 pass / 0 fail (100%)
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
| trump | 2 | 0 |
| dance | 2 | 0 |

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
| trump | 2 | 0 |
| dance | 2 | 0 |

### Failing Cases

_None_

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| render-frame-sticker | tsunami | pass | pass | ✅ both pass |
| render-frame-sticker | king | pass | pass | ✅ both pass |
| render-frame-sticker | logo | pass | pass | ✅ both pass |
| render-frame-sticker | test | pass | pass | ✅ both pass |
| render-frame-sticker | trump | pass | pass | ✅ both pass |
| render-frame-sticker | dance | pass | pass | ✅ both pass |
| overlay-center | tsunami | pass | pass | ✅ both pass |
| overlay-center | king | pass | pass | ✅ both pass |
| overlay-center | logo | pass | pass | ✅ both pass |
| overlay-center | test | pass | pass | ✅ both pass |
| overlay-center | trump | pass | pass | ✅ both pass |
| overlay-center | dance | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

_None — all Tier A passes also pass in Tier B._
