# Gallery Scan Matrix Summary

## Overview

- Total runs: 240 (120 per tier × 2 tiers)
- **Tier A (Production):** 107 pass / 13 fail (89%)
- **Tier B (Diagnostic):** 91 pass / 29 fail (76%)
- Scan-gate-rescued: 16 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 26 | 4 |
| king | 25 | 5 |
| logo | 29 | 1 |
| test | 27 | 3 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| overlay-blue-noise | tsunami | CONTRAST_COLLAPSE | fix-now |
| overlay-blue-noise | king | CONTRAST_COLLAPSE | fix-now |
| overlay-mosaic | tsunami | CONTRAST_COLLAPSE | fix-now |
| overlay-mosaic | king | CONTRAST_COLLAPSE | fix-now |
| overlay-mosaic | logo | CONTRAST_COLLAPSE | fix-now |
| overlay-mosaic | test | CONTRAST_COLLAPSE | fix-now |
| preserve-blended | tsunami | CONTRAST_COLLAPSE | fix-now |
| preserve-blended | king | CONTRAST_COLLAPSE | fix-now |
| preserve-blended | test | CONTRAST_COLLAPSE | fix-now |
| preserve-strength-100 | king | CONTRAST_COLLAPSE | fix-now |
| animation-blue-noise | tsunami | CONTRAST_COLLAPSE | fix-now |
| animation-blue-noise | king | CONTRAST_COLLAPSE | fix-now |
| encoding-ecc-m | test | CONTRAST_COLLAPSE | fix-now |

## Tier B — Diagnostic

> Intrinsic scannability without scan gate assistance

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 25 | 5 |
| king | 11 | 19 |
| logo | 29 | 1 |
| test | 26 | 4 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| overlay-dithered | king | CONTRAST_COLLAPSE | tunable |
| overlay-blue-noise | tsunami | CONTRAST_COLLAPSE | tunable |
| overlay-blue-noise | king | CONTRAST_COLLAPSE | tunable |
| overlay-mosaic | tsunami | CONTRAST_COLLAPSE | fix-now |
| overlay-mosaic | king | CONTRAST_COLLAPSE | fix-now |
| overlay-mosaic | logo | CONTRAST_COLLAPSE | fix-now |
| overlay-mosaic | test | CONTRAST_COLLAPSE | fix-now |
| preserve-balanced | king | CONTRAST_COLLAPSE | tunable |
| preserve-blended | tsunami | CONTRAST_COLLAPSE | tunable |
| preserve-blended | king | CONTRAST_COLLAPSE | tunable |
| preserve-blended | test | CONTRAST_COLLAPSE | tunable |
| preserve-strength-100 | king | CONTRAST_COLLAPSE | tunable |
| render-rounded | king | CONTRAST_COLLAPSE | tunable |
| render-dots-circle | king | CONTRAST_COLLAPSE | tunable |
| encoding-v6 | king | CONTRAST_COLLAPSE | tunable |
| encoding-v9 | king | CONTRAST_COLLAPSE | tunable |
| encoding-ecc-q | king | CONTRAST_COLLAPSE | tunable |
| animation-blue-noise | tsunami | CONTRAST_COLLAPSE | tunable |
| animation-blue-noise | king | CONTRAST_COLLAPSE | tunable |
| output-hd | king | CONTRAST_COLLAPSE | tunable |
| output-hd | test | CONTRAST_COLLAPSE | tunable |
| watermark-frame-tag | king | CONTRAST_COLLAPSE | tunable |
| render-diamond-gap | king | CONTRAST_COLLAPSE | tunable |
| encoding-ecc-m | tsunami | CONTRAST_COLLAPSE | tunable |
| encoding-ecc-m | king | CONTRAST_COLLAPSE | tunable |
| encoding-ecc-m | test | CONTRAST_COLLAPSE | tunable |
| encoding-byte-v6 | king | CONTRAST_COLLAPSE | tunable |
| watermark-text-bottom | king | CONTRAST_COLLAPSE | tunable |
| output-grayscale | king | CONTRAST_COLLAPSE | tunable |

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| overlay-dithered | tsunami | pass | pass | ✅ both pass |
| overlay-dithered | king | pass | fail | 🟢 rescued |
| overlay-dithered | logo | pass | pass | ✅ both pass |
| overlay-dithered | test | pass | pass | ✅ both pass |
| overlay-blue-noise | tsunami | fail | fail | ❌ both fail |
| overlay-blue-noise | king | fail | fail | ❌ both fail |
| overlay-blue-noise | logo | pass | pass | ✅ both pass |
| overlay-blue-noise | test | pass | pass | ✅ both pass |
| overlay-subpixel | tsunami | pass | pass | ✅ both pass |
| overlay-subpixel | king | pass | pass | ✅ both pass |
| overlay-subpixel | logo | pass | pass | ✅ both pass |
| overlay-subpixel | test | pass | pass | ✅ both pass |
| overlay-halftone | tsunami | pass | pass | ✅ both pass |
| overlay-halftone | king | pass | pass | ✅ both pass |
| overlay-halftone | logo | pass | pass | ✅ both pass |
| overlay-halftone | test | pass | pass | ✅ both pass |
| overlay-mosaic | tsunami | fail | fail | ❌ both fail |
| overlay-mosaic | king | fail | fail | ❌ both fail |
| overlay-mosaic | logo | fail | fail | ❌ both fail |
| overlay-mosaic | test | fail | fail | ❌ both fail |
| overlay-extreme | tsunami | pass | pass | ✅ both pass |
| overlay-extreme | king | pass | pass | ✅ both pass |
| overlay-extreme | logo | pass | pass | ✅ both pass |
| overlay-extreme | test | pass | pass | ✅ both pass |
| preserve-balanced | tsunami | pass | pass | ✅ both pass |
| preserve-balanced | king | pass | fail | 🟢 rescued |
| preserve-balanced | logo | pass | pass | ✅ both pass |
| preserve-balanced | test | pass | pass | ✅ both pass |
| preserve-blended | tsunami | fail | fail | ❌ both fail |
| preserve-blended | king | fail | fail | ❌ both fail |
| preserve-blended | logo | pass | pass | ✅ both pass |
| preserve-blended | test | fail | fail | ❌ both fail |
| preserve-strength-100 | tsunami | pass | pass | ✅ both pass |
| preserve-strength-100 | king | fail | fail | ❌ both fail |
| preserve-strength-100 | logo | pass | pass | ✅ both pass |
| preserve-strength-100 | test | pass | pass | ✅ both pass |
| render-rounded | tsunami | pass | pass | ✅ both pass |
| render-rounded | king | pass | fail | 🟢 rescued |
| render-rounded | logo | pass | pass | ✅ both pass |
| render-rounded | test | pass | pass | ✅ both pass |
| render-dots-circle | tsunami | pass | pass | ✅ both pass |
| render-dots-circle | king | pass | fail | 🟢 rescued |
| render-dots-circle | logo | pass | pass | ✅ both pass |
| render-dots-circle | test | pass | pass | ✅ both pass |
| encoding-v6 | tsunami | pass | pass | ✅ both pass |
| encoding-v6 | king | pass | fail | 🟢 rescued |
| encoding-v6 | logo | pass | pass | ✅ both pass |
| encoding-v6 | test | pass | pass | ✅ both pass |
| encoding-v9 | tsunami | pass | pass | ✅ both pass |
| encoding-v9 | king | pass | fail | 🟢 rescued |
| encoding-v9 | logo | pass | pass | ✅ both pass |
| encoding-v9 | test | pass | pass | ✅ both pass |
| encoding-ecc-q | tsunami | pass | pass | ✅ both pass |
| encoding-ecc-q | king | pass | fail | 🟢 rescued |
| encoding-ecc-q | logo | pass | pass | ✅ both pass |
| encoding-ecc-q | test | pass | pass | ✅ both pass |
| animation-dithered | tsunami | pass | pass | ✅ both pass |
| animation-dithered | king | pass | pass | ✅ both pass |
| animation-dithered | logo | pass | pass | ✅ both pass |
| animation-dithered | test | pass | pass | ✅ both pass |
| animation-blue-noise | tsunami | fail | fail | ❌ both fail |
| animation-blue-noise | king | fail | fail | ❌ both fail |
| animation-blue-noise | logo | pass | pass | ✅ both pass |
| animation-blue-noise | test | pass | pass | ✅ both pass |
| output-hd | tsunami | pass | pass | ✅ both pass |
| output-hd | king | pass | fail | 🟢 rescued |
| output-hd | logo | pass | pass | ✅ both pass |
| output-hd | test | pass | fail | 🟢 rescued |
| watermark-frame-tag | tsunami | pass | pass | ✅ both pass |
| watermark-frame-tag | king | pass | fail | 🟢 rescued |
| watermark-frame-tag | logo | pass | pass | ✅ both pass |
| watermark-frame-tag | test | pass | pass | ✅ both pass |
| overlay-duotone | tsunami | pass | pass | ✅ both pass |
| overlay-duotone | king | pass | pass | ✅ both pass |
| overlay-duotone | logo | pass | pass | ✅ both pass |
| overlay-duotone | test | pass | pass | ✅ both pass |
| overlay-pixelate | tsunami | pass | pass | ✅ both pass |
| overlay-pixelate | king | pass | pass | ✅ both pass |
| overlay-pixelate | logo | pass | pass | ✅ both pass |
| overlay-pixelate | test | pass | pass | ✅ both pass |
| overlay-blend | tsunami | pass | pass | ✅ both pass |
| overlay-blend | king | pass | pass | ✅ both pass |
| overlay-blend | logo | pass | pass | ✅ both pass |
| overlay-blend | test | pass | pass | ✅ both pass |
| render-diamond-gap | tsunami | pass | pass | ✅ both pass |
| render-diamond-gap | king | pass | fail | 🟢 rescued |
| render-diamond-gap | logo | pass | pass | ✅ both pass |
| render-diamond-gap | test | pass | pass | ✅ both pass |
| render-gradient-linear | tsunami | pass | pass | ✅ both pass |
| render-gradient-linear | king | pass | pass | ✅ both pass |
| render-gradient-linear | logo | pass | pass | ✅ both pass |
| render-gradient-linear | test | pass | pass | ✅ both pass |
| render-frame-sticker | tsunami | pass | pass | ✅ both pass |
| render-frame-sticker | king | pass | pass | ✅ both pass |
| render-frame-sticker | logo | pass | pass | ✅ both pass |
| render-frame-sticker | test | pass | pass | ✅ both pass |
| encoding-ecc-m | tsunami | pass | fail | 🟢 rescued |
| encoding-ecc-m | king | pass | fail | 🟢 rescued |
| encoding-ecc-m | logo | pass | pass | ✅ both pass |
| encoding-ecc-m | test | fail | fail | ❌ both fail |
| encoding-byte-v6 | tsunami | pass | pass | ✅ both pass |
| encoding-byte-v6 | king | pass | fail | 🟢 rescued |
| encoding-byte-v6 | logo | pass | pass | ✅ both pass |
| encoding-byte-v6 | test | pass | pass | ✅ both pass |
| animation-subpixel | tsunami | pass | pass | ✅ both pass |
| animation-subpixel | king | pass | pass | ✅ both pass |
| animation-subpixel | logo | pass | pass | ✅ both pass |
| animation-subpixel | test | pass | pass | ✅ both pass |
| animation-halftone | tsunami | pass | pass | ✅ both pass |
| animation-halftone | king | pass | pass | ✅ both pass |
| animation-halftone | logo | pass | pass | ✅ both pass |
| animation-halftone | test | pass | pass | ✅ both pass |
| watermark-text-bottom | tsunami | pass | pass | ✅ both pass |
| watermark-text-bottom | king | pass | fail | 🟢 rescued |
| watermark-text-bottom | logo | pass | pass | ✅ both pass |
| watermark-text-bottom | test | pass | pass | ✅ both pass |
| output-grayscale | tsunami | pass | pass | ✅ both pass |
| output-grayscale | king | pass | fail | 🟢 rescued |
| output-grayscale | logo | pass | pass | ✅ both pass |
| output-grayscale | test | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

| Scenario | Fixture |
| --- | --- |
| overlay-dithered | king |
| preserve-balanced | king |
| render-rounded | king |
| render-dots-circle | king |
| encoding-v6 | king |
| encoding-v9 | king |
| encoding-ecc-q | king |
| output-hd | king |
| output-hd | test |
| watermark-frame-tag | king |
| render-diamond-gap | king |
| encoding-ecc-m | tsunami |
| encoding-ecc-m | king |
| encoding-byte-v6 | king |
| watermark-text-bottom | king |
| output-grayscale | king |
