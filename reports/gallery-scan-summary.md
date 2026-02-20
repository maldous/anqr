# Gallery Scan Matrix Summary

## Overview

- **Method:** API-based (`https://anqr.link/api/qr`)
- **Total runs:** 410
- **Pass:** 392 (96%)
- **Fail:** 18

## Results by Fixture

| Fixture | Pass | Fail |
| --- | ---: | ---: |
| tsunami | 69 | 1 |
| king | 67 | 1 |
| logo | 67 | 1 |
| test | 65 | 3 |
| trump | 57 | 11 |
| dance | 67 | 1 |

## Failing Cases

| Scenario | Fixture | Reason |
| --- | --- | --- |
| overlay-blue-noise | trump | VERIFY_ERROR |
| preserve-blended | trump | VERIFY_ERROR |
| preserve-strength-100 | trump | VERIFY_ERROR |
| render-dots-circle | trump | VERIFY_ERROR |
| encoding-ecc-q | trump | VERIFY_ERROR |
| animation-blue-noise | trump | VERIFY_ERROR |
| output-hd | tsunami | VERIFY_ERROR |
| output-hd | king | VERIFY_ERROR |
| output-hd | logo | VERIFY_ERROR |
| output-hd | test | VERIFY_ERROR |
| output-hd | trump | VERIFY_ERROR |
| output-hd | dance | VERIFY_ERROR |
| watermark-frame-tag | trump | VERIFY_ERROR |
| render-diamond-gap | trump | VERIFY_ERROR |
| encoding-ecc-m | test | VERIFY_ERROR |
| preprocess-edge-sobel | test | VERIFY_ERROR |
| preprocess-edge-sobel | trump | VERIFY_ERROR |
| overlay-halftone-dithered | trump | VERIFY_ERROR |
