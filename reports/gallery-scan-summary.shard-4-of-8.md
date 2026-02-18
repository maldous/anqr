# Gallery Scan Matrix Summary

## Overview

- Total runs: 108 (54 per tier × 2 tiers)
- **Tier A (Production):** 54 pass / 0 fail (100%)
- **Tier B (Diagnostic):** 25 pass / 29 fail (46%)
- Scan-gate-rescued: 29 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 9 | 0 |
| king | 9 | 0 |
| logo | 9 | 0 |
| test | 9 | 0 |
| trump | 9 | 0 |
| dance | 9 | 0 |

### Failing Cases

_None_

## Tier B — Diagnostic

> Intrinsic scannability without scan gate assistance

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 5 | 4 |
| king | 2 | 7 |
| logo | 5 | 4 |
| test | 5 | 4 |
| trump | 4 | 5 |
| dance | 4 | 5 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| overlay-halftone | tsunami | RENDER_ERROR | fix-now |
| overlay-halftone | king | RENDER_ERROR | fix-now |
| overlay-halftone | logo | RENDER_ERROR | fix-now |
| overlay-halftone | test | RENDER_ERROR | fix-now |
| overlay-halftone | trump | RENDER_ERROR | fix-now |
| overlay-halftone | dance | RENDER_ERROR | fix-now |
| encoding-v6 | king | CONTRAST_COLLAPSE | tunable |
| encoding-v6 | trump | CONTRAST_COLLAPSE | tunable |
| overlay-pixelate | tsunami | RENDER_ERROR | fix-now |
| overlay-pixelate | king | RENDER_ERROR | fix-now |
| overlay-pixelate | logo | RENDER_ERROR | fix-now |
| overlay-pixelate | test | RENDER_ERROR | fix-now |
| overlay-pixelate | trump | RENDER_ERROR | fix-now |
| overlay-pixelate | dance | RENDER_ERROR | fix-now |
| animation-halftone | tsunami | RENDER_ERROR | fix-now |
| animation-halftone | king | RENDER_ERROR | fix-now |
| animation-halftone | logo | RENDER_ERROR | fix-now |
| animation-halftone | test | RENDER_ERROR | fix-now |
| animation-halftone | trump | RENDER_ERROR | fix-now |
| animation-halftone | dance | RENDER_ERROR | fix-now |
| overlay-dithered-posterized | king | CONTRAST_COLLAPSE | tunable |
| overlay-dithered-posterized | dance | CONTRAST_COLLAPSE | tunable |
| overlay-true-dither | tsunami | RENDER_ERROR | fix-now |
| overlay-true-dither | king | RENDER_ERROR | fix-now |
| overlay-true-dither | logo | RENDER_ERROR | fix-now |
| overlay-true-dither | test | RENDER_ERROR | fix-now |
| overlay-true-dither | trump | RENDER_ERROR | fix-now |
| overlay-true-dither | dance | RENDER_ERROR | fix-now |
| dither-perceptual | king | CONTRAST_COLLAPSE | tunable |

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| overlay-halftone | tsunami | pass | fail | 🟢 rescued |
| overlay-halftone | king | pass | fail | 🟢 rescued |
| overlay-halftone | logo | pass | fail | 🟢 rescued |
| overlay-halftone | test | pass | fail | 🟢 rescued |
| overlay-halftone | trump | pass | fail | 🟢 rescued |
| overlay-halftone | dance | pass | fail | 🟢 rescued |
| encoding-v6 | tsunami | pass | pass | ✅ both pass |
| encoding-v6 | king | pass | fail | 🟢 rescued |
| encoding-v6 | logo | pass | pass | ✅ both pass |
| encoding-v6 | test | pass | pass | ✅ both pass |
| encoding-v6 | trump | pass | fail | 🟢 rescued |
| encoding-v6 | dance | pass | pass | ✅ both pass |
| overlay-pixelate | tsunami | pass | fail | 🟢 rescued |
| overlay-pixelate | king | pass | fail | 🟢 rescued |
| overlay-pixelate | logo | pass | fail | 🟢 rescued |
| overlay-pixelate | test | pass | fail | 🟢 rescued |
| overlay-pixelate | trump | pass | fail | 🟢 rescued |
| overlay-pixelate | dance | pass | fail | 🟢 rescued |
| animation-halftone | tsunami | pass | fail | 🟢 rescued |
| animation-halftone | king | pass | fail | 🟢 rescued |
| animation-halftone | logo | pass | fail | 🟢 rescued |
| animation-halftone | test | pass | fail | 🟢 rescued |
| animation-halftone | trump | pass | fail | 🟢 rescued |
| animation-halftone | dance | pass | fail | 🟢 rescued |
| overlay-dithered-bayer | tsunami | pass | pass | ✅ both pass |
| overlay-dithered-bayer | king | pass | pass | ✅ both pass |
| overlay-dithered-bayer | logo | pass | pass | ✅ both pass |
| overlay-dithered-bayer | test | pass | pass | ✅ both pass |
| overlay-dithered-bayer | trump | pass | pass | ✅ both pass |
| overlay-dithered-bayer | dance | pass | pass | ✅ both pass |
| overlay-dithered-posterized | tsunami | pass | pass | ✅ both pass |
| overlay-dithered-posterized | king | pass | fail | 🟢 rescued |
| overlay-dithered-posterized | logo | pass | pass | ✅ both pass |
| overlay-dithered-posterized | test | pass | pass | ✅ both pass |
| overlay-dithered-posterized | trump | pass | pass | ✅ both pass |
| overlay-dithered-posterized | dance | pass | fail | 🟢 rescued |
| preprocess-edge-sobel | tsunami | pass | pass | ✅ both pass |
| preprocess-edge-sobel | king | pass | pass | ✅ both pass |
| preprocess-edge-sobel | logo | pass | pass | ✅ both pass |
| preprocess-edge-sobel | test | pass | pass | ✅ both pass |
| preprocess-edge-sobel | trump | pass | pass | ✅ both pass |
| preprocess-edge-sobel | dance | pass | pass | ✅ both pass |
| overlay-true-dither | tsunami | pass | fail | 🟢 rescued |
| overlay-true-dither | king | pass | fail | 🟢 rescued |
| overlay-true-dither | logo | pass | fail | 🟢 rescued |
| overlay-true-dither | test | pass | fail | 🟢 rescued |
| overlay-true-dither | trump | pass | fail | 🟢 rescued |
| overlay-true-dither | dance | pass | fail | 🟢 rescued |
| dither-perceptual | tsunami | pass | pass | ✅ both pass |
| dither-perceptual | king | pass | fail | 🟢 rescued |
| dither-perceptual | logo | pass | pass | ✅ both pass |
| dither-perceptual | test | pass | pass | ✅ both pass |
| dither-perceptual | trump | pass | pass | ✅ both pass |
| dither-perceptual | dance | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

| Scenario | Fixture |
| --- | --- |
| overlay-halftone | tsunami |
| overlay-halftone | king |
| overlay-halftone | logo |
| overlay-halftone | test |
| overlay-halftone | trump |
| overlay-halftone | dance |
| encoding-v6 | king |
| encoding-v6 | trump |
| overlay-pixelate | tsunami |
| overlay-pixelate | king |
| overlay-pixelate | logo |
| overlay-pixelate | test |
| overlay-pixelate | trump |
| overlay-pixelate | dance |
| animation-halftone | tsunami |
| animation-halftone | king |
| animation-halftone | logo |
| animation-halftone | test |
| animation-halftone | trump |
| animation-halftone | dance |
| overlay-dithered-posterized | king |
| overlay-dithered-posterized | dance |
| overlay-true-dither | tsunami |
| overlay-true-dither | king |
| overlay-true-dither | logo |
| overlay-true-dither | test |
| overlay-true-dither | trump |
| overlay-true-dither | dance |
| dither-perceptual | king |
