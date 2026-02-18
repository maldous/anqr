# Gallery Scan Matrix Summary

## Overview

- Total runs: 464 (232 per tier × 2 tiers)
- **Tier A (Production):** 231 pass / 1 fail (100%)
- **Tier B (Diagnostic):** 185 pass / 47 fail (80%)
- Scan-gate-rescued: 46 scenario×fixture pairs

## Tier A — Production

> Production-like settings with scan gate retry

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 58 | 0 |
| king | 57 | 1 |
| logo | 58 | 0 |
| test | 58 | 0 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| overlay-pixelate-coral | king | EXPORT_LOSS | fix-now |

## Tier B — Diagnostic

> Intrinsic scannability without scan gate assistance

### By Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 56 | 2 |
| king | 18 | 40 |
| logo | 56 | 2 |
| test | 55 | 3 |

### Failing Cases

| Scenario | Fixture | Reason | Disposition |
| --- | --- | --- | --- |
| overlay-dithered | king | CONTRAST_COLLAPSE | tunable |
| overlay-blue-noise | king | CONTRAST_COLLAPSE | tunable |
| overlay-halftone | king | CONTRAST_COLLAPSE | fix-now |
| overlay-mosaic | king | CONTRAST_COLLAPSE | fix-now |
| overlay-extreme | king | CONTRAST_COLLAPSE | fix-now |
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
| output-hd | king | CONTRAST_COLLAPSE | tunable |
| output-hd | test | CONTRAST_COLLAPSE | tunable |
| watermark-frame-tag | king | CONTRAST_COLLAPSE | tunable |
| overlay-duotone | king | CONTRAST_COLLAPSE | fix-now |
| overlay-pixelate | king | CONTRAST_COLLAPSE | fix-now |
| overlay-blend | king | CONTRAST_COLLAPSE | fix-now |
| render-diamond-gap | king | CONTRAST_COLLAPSE | tunable |
| encoding-ecc-m | king | CONTRAST_COLLAPSE | tunable |
| encoding-ecc-m | test | CONTRAST_COLLAPSE | tunable |
| encoding-byte-v6 | king | CONTRAST_COLLAPSE | tunable |
| watermark-text-bottom | king | CONTRAST_COLLAPSE | tunable |
| output-grayscale | king | CONTRAST_COLLAPSE | tunable |
| overlay-dithered-rounded | king | CONTRAST_COLLAPSE | tunable |
| overlay-halftone-dots | king | CONTRAST_COLLAPSE | fix-now |
| overlay-blue-noise-ocean | king | CONTRAST_COLLAPSE | tunable |
| overlay-duotone-sunset | king | CONTRAST_COLLAPSE | fix-now |
| overlay-extreme-midnight | king | CONTRAST_COLLAPSE | fix-now |
| overlay-blend-grayscale | king | CONTRAST_COLLAPSE | fix-now |
| overlay-dithered-forest | king | CONTRAST_COLLAPSE | tunable |
| overlay-pixelate-coral | king | CONTRAST_COLLAPSE | fix-now |
| overlay-mosaic-connected | king | CONTRAST_COLLAPSE | fix-now |
| overlay-dithered-gradient | king | CONTRAST_COLLAPSE | tunable |
| preprocess-brightness | logo | CONTRAST_COLLAPSE | tunable |
| preprocess-sharpen | tsunami | CONTRAST_COLLAPSE | tunable |
| preprocess-sharpen | king | CONTRAST_COLLAPSE | tunable |
| preprocess-sharpen | logo | CONTRAST_COLLAPSE | tunable |
| preprocess-posterize | king | CONTRAST_COLLAPSE | tunable |
| dither-error-diffusion | king | CONTRAST_COLLAPSE | tunable |
| dither-blue-noise | king | CONTRAST_COLLAPSE | tunable |
| dither-perceptual | king | CONTRAST_COLLAPSE | tunable |
| dither-floyd-steinberg | king | CONTRAST_COLLAPSE | tunable |
| dither-atkinson | king | CONTRAST_COLLAPSE | tunable |

## Comparison

| Scenario | Fixture | Tier A | Tier B | Delta |
| --- | --- | --- | --- | --- |
| overlay-dithered | tsunami | pass | pass | ✅ both pass |
| overlay-dithered | king | pass | fail | 🟢 rescued |
| overlay-dithered | logo | pass | pass | ✅ both pass |
| overlay-dithered | test | pass | pass | ✅ both pass |
| overlay-blue-noise | tsunami | pass | pass | ✅ both pass |
| overlay-blue-noise | king | pass | fail | 🟢 rescued |
| overlay-blue-noise | logo | pass | pass | ✅ both pass |
| overlay-blue-noise | test | pass | pass | ✅ both pass |
| overlay-subpixel | tsunami | pass | pass | ✅ both pass |
| overlay-subpixel | king | pass | pass | ✅ both pass |
| overlay-subpixel | logo | pass | pass | ✅ both pass |
| overlay-subpixel | test | pass | pass | ✅ both pass |
| overlay-halftone | tsunami | pass | pass | ✅ both pass |
| overlay-halftone | king | pass | fail | 🟢 rescued |
| overlay-halftone | logo | pass | pass | ✅ both pass |
| overlay-halftone | test | pass | pass | ✅ both pass |
| overlay-mosaic | tsunami | pass | pass | ✅ both pass |
| overlay-mosaic | king | pass | fail | 🟢 rescued |
| overlay-mosaic | logo | pass | pass | ✅ both pass |
| overlay-mosaic | test | pass | pass | ✅ both pass |
| overlay-extreme | tsunami | pass | pass | ✅ both pass |
| overlay-extreme | king | pass | fail | 🟢 rescued |
| overlay-extreme | logo | pass | pass | ✅ both pass |
| overlay-extreme | test | pass | pass | ✅ both pass |
| preserve-balanced | tsunami | pass | pass | ✅ both pass |
| preserve-balanced | king | pass | fail | 🟢 rescued |
| preserve-balanced | logo | pass | pass | ✅ both pass |
| preserve-balanced | test | pass | pass | ✅ both pass |
| preserve-blended | tsunami | pass | fail | 🟢 rescued |
| preserve-blended | king | pass | fail | 🟢 rescued |
| preserve-blended | logo | pass | pass | ✅ both pass |
| preserve-blended | test | pass | fail | 🟢 rescued |
| preserve-strength-100 | tsunami | pass | pass | ✅ both pass |
| preserve-strength-100 | king | pass | fail | 🟢 rescued |
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
| animation-blue-noise | tsunami | pass | pass | ✅ both pass |
| animation-blue-noise | king | pass | pass | ✅ both pass |
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
| overlay-duotone | king | pass | fail | 🟢 rescued |
| overlay-duotone | logo | pass | pass | ✅ both pass |
| overlay-duotone | test | pass | pass | ✅ both pass |
| overlay-pixelate | tsunami | pass | pass | ✅ both pass |
| overlay-pixelate | king | pass | fail | 🟢 rescued |
| overlay-pixelate | logo | pass | pass | ✅ both pass |
| overlay-pixelate | test | pass | pass | ✅ both pass |
| overlay-blend | tsunami | pass | pass | ✅ both pass |
| overlay-blend | king | pass | fail | 🟢 rescued |
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
| encoding-ecc-m | tsunami | pass | pass | ✅ both pass |
| encoding-ecc-m | king | pass | fail | 🟢 rescued |
| encoding-ecc-m | logo | pass | pass | ✅ both pass |
| encoding-ecc-m | test | pass | fail | 🟢 rescued |
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
| animation-mosaic | tsunami | pass | pass | ✅ both pass |
| animation-mosaic | king | pass | pass | ✅ both pass |
| animation-mosaic | logo | pass | pass | ✅ both pass |
| animation-mosaic | test | pass | pass | ✅ both pass |
| animation-extreme | tsunami | pass | pass | ✅ both pass |
| animation-extreme | king | pass | pass | ✅ both pass |
| animation-extreme | logo | pass | pass | ✅ both pass |
| animation-extreme | test | pass | pass | ✅ both pass |
| animation-pixelate | tsunami | pass | pass | ✅ both pass |
| animation-pixelate | king | pass | pass | ✅ both pass |
| animation-pixelate | logo | pass | pass | ✅ both pass |
| animation-pixelate | test | pass | pass | ✅ both pass |
| animation-blend | tsunami | pass | pass | ✅ both pass |
| animation-blend | king | pass | pass | ✅ both pass |
| animation-blend | logo | pass | pass | ✅ both pass |
| animation-blend | test | pass | pass | ✅ both pass |
| animation-duotone | tsunami | pass | pass | ✅ both pass |
| animation-duotone | king | pass | pass | ✅ both pass |
| animation-duotone | logo | pass | pass | ✅ both pass |
| animation-duotone | test | pass | pass | ✅ both pass |
| overlay-dithered-rounded | tsunami | pass | pass | ✅ both pass |
| overlay-dithered-rounded | king | pass | fail | 🟢 rescued |
| overlay-dithered-rounded | logo | pass | pass | ✅ both pass |
| overlay-dithered-rounded | test | pass | pass | ✅ both pass |
| overlay-halftone-dots | tsunami | pass | pass | ✅ both pass |
| overlay-halftone-dots | king | pass | fail | 🟢 rescued |
| overlay-halftone-dots | logo | pass | pass | ✅ both pass |
| overlay-halftone-dots | test | pass | pass | ✅ both pass |
| overlay-blue-noise-ocean | tsunami | pass | pass | ✅ both pass |
| overlay-blue-noise-ocean | king | pass | fail | 🟢 rescued |
| overlay-blue-noise-ocean | logo | pass | pass | ✅ both pass |
| overlay-blue-noise-ocean | test | pass | pass | ✅ both pass |
| overlay-subpixel-diamond | tsunami | pass | pass | ✅ both pass |
| overlay-subpixel-diamond | king | pass | pass | ✅ both pass |
| overlay-subpixel-diamond | logo | pass | pass | ✅ both pass |
| overlay-subpixel-diamond | test | pass | pass | ✅ both pass |
| overlay-duotone-sunset | tsunami | pass | pass | ✅ both pass |
| overlay-duotone-sunset | king | pass | fail | 🟢 rescued |
| overlay-duotone-sunset | logo | pass | pass | ✅ both pass |
| overlay-duotone-sunset | test | pass | pass | ✅ both pass |
| overlay-extreme-midnight | tsunami | pass | pass | ✅ both pass |
| overlay-extreme-midnight | king | pass | fail | 🟢 rescued |
| overlay-extreme-midnight | logo | pass | pass | ✅ both pass |
| overlay-extreme-midnight | test | pass | pass | ✅ both pass |
| overlay-blend-grayscale | tsunami | pass | pass | ✅ both pass |
| overlay-blend-grayscale | king | pass | fail | 🟢 rescued |
| overlay-blend-grayscale | logo | pass | pass | ✅ both pass |
| overlay-blend-grayscale | test | pass | pass | ✅ both pass |
| overlay-dithered-forest | tsunami | pass | pass | ✅ both pass |
| overlay-dithered-forest | king | pass | fail | 🟢 rescued |
| overlay-dithered-forest | logo | pass | pass | ✅ both pass |
| overlay-dithered-forest | test | pass | pass | ✅ both pass |
| overlay-pixelate-coral | tsunami | pass | pass | ✅ both pass |
| overlay-pixelate-coral | king | fail | fail | ❌ both fail |
| overlay-pixelate-coral | logo | pass | pass | ✅ both pass |
| overlay-pixelate-coral | test | pass | pass | ✅ both pass |
| overlay-mosaic-connected | tsunami | pass | pass | ✅ both pass |
| overlay-mosaic-connected | king | pass | fail | 🟢 rescued |
| overlay-mosaic-connected | logo | pass | pass | ✅ both pass |
| overlay-mosaic-connected | test | pass | pass | ✅ both pass |
| overlay-dithered-gradient | tsunami | pass | pass | ✅ both pass |
| overlay-dithered-gradient | king | pass | fail | 🟢 rescued |
| overlay-dithered-gradient | logo | pass | pass | ✅ both pass |
| overlay-dithered-gradient | test | pass | pass | ✅ both pass |
| preprocess-contrast | tsunami | pass | pass | ✅ both pass |
| preprocess-contrast | king | pass | pass | ✅ both pass |
| preprocess-contrast | logo | pass | pass | ✅ both pass |
| preprocess-contrast | test | pass | pass | ✅ both pass |
| preprocess-brightness | tsunami | pass | pass | ✅ both pass |
| preprocess-brightness | king | pass | pass | ✅ both pass |
| preprocess-brightness | logo | pass | fail | 🟢 rescued |
| preprocess-brightness | test | pass | pass | ✅ both pass |
| preprocess-gamma | tsunami | pass | pass | ✅ both pass |
| preprocess-gamma | king | pass | pass | ✅ both pass |
| preprocess-gamma | logo | pass | pass | ✅ both pass |
| preprocess-gamma | test | pass | pass | ✅ both pass |
| preprocess-sharpen | tsunami | pass | fail | 🟢 rescued |
| preprocess-sharpen | king | pass | fail | 🟢 rescued |
| preprocess-sharpen | logo | pass | fail | 🟢 rescued |
| preprocess-sharpen | test | pass | pass | ✅ both pass |
| preprocess-posterize | tsunami | pass | pass | ✅ both pass |
| preprocess-posterize | king | pass | fail | 🟢 rescued |
| preprocess-posterize | logo | pass | pass | ✅ both pass |
| preprocess-posterize | test | pass | pass | ✅ both pass |
| preprocess-edge-sobel | tsunami | pass | pass | ✅ both pass |
| preprocess-edge-sobel | king | pass | pass | ✅ both pass |
| preprocess-edge-sobel | logo | pass | pass | ✅ both pass |
| preprocess-edge-sobel | test | pass | pass | ✅ both pass |
| dither-error-diffusion | tsunami | pass | pass | ✅ both pass |
| dither-error-diffusion | king | pass | fail | 🟢 rescued |
| dither-error-diffusion | logo | pass | pass | ✅ both pass |
| dither-error-diffusion | test | pass | pass | ✅ both pass |
| dither-ordered-bayer | tsunami | pass | pass | ✅ both pass |
| dither-ordered-bayer | king | pass | pass | ✅ both pass |
| dither-ordered-bayer | logo | pass | pass | ✅ both pass |
| dither-ordered-bayer | test | pass | pass | ✅ both pass |
| dither-blue-noise | tsunami | pass | pass | ✅ both pass |
| dither-blue-noise | king | pass | fail | 🟢 rescued |
| dither-blue-noise | logo | pass | pass | ✅ both pass |
| dither-blue-noise | test | pass | pass | ✅ both pass |
| dither-perceptual | tsunami | pass | pass | ✅ both pass |
| dither-perceptual | king | pass | fail | 🟢 rescued |
| dither-perceptual | logo | pass | pass | ✅ both pass |
| dither-perceptual | test | pass | pass | ✅ both pass |
| dither-floyd-steinberg | tsunami | pass | pass | ✅ both pass |
| dither-floyd-steinberg | king | pass | fail | 🟢 rescued |
| dither-floyd-steinberg | logo | pass | pass | ✅ both pass |
| dither-floyd-steinberg | test | pass | pass | ✅ both pass |
| dither-atkinson | tsunami | pass | pass | ✅ both pass |
| dither-atkinson | king | pass | fail | 🟢 rescued |
| dither-atkinson | logo | pass | pass | ✅ both pass |
| dither-atkinson | test | pass | pass | ✅ both pass |

## Scan-Gate-Rescued

Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:

| Scenario | Fixture |
| --- | --- |
| overlay-dithered | king |
| overlay-blue-noise | king |
| overlay-halftone | king |
| overlay-mosaic | king |
| overlay-extreme | king |
| preserve-balanced | king |
| preserve-blended | tsunami |
| preserve-blended | king |
| preserve-blended | test |
| preserve-strength-100 | king |
| render-rounded | king |
| render-dots-circle | king |
| encoding-v6 | king |
| encoding-v9 | king |
| encoding-ecc-q | king |
| output-hd | king |
| output-hd | test |
| watermark-frame-tag | king |
| overlay-duotone | king |
| overlay-pixelate | king |
| overlay-blend | king |
| render-diamond-gap | king |
| encoding-ecc-m | king |
| encoding-ecc-m | test |
| encoding-byte-v6 | king |
| watermark-text-bottom | king |
| output-grayscale | king |
| overlay-dithered-rounded | king |
| overlay-halftone-dots | king |
| overlay-blue-noise-ocean | king |
| overlay-duotone-sunset | king |
| overlay-extreme-midnight | king |
| overlay-blend-grayscale | king |
| overlay-dithered-forest | king |
| overlay-mosaic-connected | king |
| overlay-dithered-gradient | king |
| preprocess-brightness | logo |
| preprocess-sharpen | tsunami |
| preprocess-sharpen | king |
| preprocess-sharpen | logo |
| preprocess-posterize | king |
| dither-error-diffusion | king |
| dither-blue-noise | king |
| dither-perceptual | king |
| dither-floyd-steinberg | king |
| dither-atkinson | king |
