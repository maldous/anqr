# S3776 Cognitive Complexity Reduction Plan

## Baseline: 144 findings, CC sum 5704

## Status Summary

| Category | Items | Done | Remaining |
|----------|-------|------|-----------|
| Modules (items 1–14) | 14 | 14 | 0 |
| Components (item 15) | 8 | 2 | 6 |
| Hooks/Store (item 16) | 2 | 1 | 1 |
| App/Netlify (item 17) | 2 | 1 | 1 |
| Other modules (item 18) | 35 | 13 | 22 |
| **Total** | **61** | **31** | **30** |

Legend: ✅ Done — ⬜ Remaining

---

## Decomposition Strategies Per File

### 1. ✅ src/modules/qr-encoder/utils.ts (CC 33 at line 65, CC 18 at line 94)
- **penaltyLevel1AdjacentModules** CC 33: Extracted `countSameNeighbors(qrcode, row, col, moduleCount)` — moves the 2 inner for-loops + if/continue into a helper
- **penaltyLevel2Blocks** CC 18: Already simple enough, low priority

### 2. ✅ src/modules/payload-generators/contacts.ts (CC 29 at line 35)
- **appendVCardContactInfo** CC 29: Extracted `formatTelLine(tel, version)` and `formatEmailLine(email, version)` — removes version branching from nested loops

### 3. ✅ src/modules/qr-decoder/locate.ts (CC 36 at line 136, CC 23 at line 67, CC 17 at line 466)
- **verifyVertical** CC 36: Extracted `scanUpward(…)` and `scanDownward(…)`
- **scanRow** CC 23: Extracted `handleDarkPixel(state, counts)` and `handleLightPixel(state, counts, x, results)` returning new state
- **refineFinderPatternCenter** CC 17: Extracted `searchGrid(…)` returning {bestX, bestY, bestScore}

### 4. ✅ src/modules/qr-decoder/extract.ts (CC 47 at line 30, CC 21 at line 511)
- **_calculateBlackPoints** CC 47: Extracted `computeGrayscale(pixels, idx)` for alpha compositing, and `computeBlockThreshold(sum, min, max, y, x, blackPoints)` for threshold calc
- **validateFinderRegion** CC 21: Extracted `compareFinderModule(matrix, finderPattern, row, col, rowOffset, colOffset, errors)`
- `sampleSinglePixel` now reuses `computeGrayscale`

### 5. ✅ src/modules/qr-decoder/decode.ts (CC 34 at line 916, CC 29 at line 591, CC 16 at line 1155)
- **decodeDataCodewordsDetailed** CC 34: Has `decodeSegmentData` extracted; segment processing logic decomposed
- **readCodewords** CC 29: Inner module processing extracted from the 3-deep nested loop
- CC 16: Lower priority, addressed in bulk commit

### 6. ✅ src/modules/qr-decoder/pattern-finder.ts (CC 51 at line 152, CC 32 at line 546, CC 20x2 at 250/303, CC 17x2 at 356/440)
> Touched in bulk commit; helper names may differ from original plan.
- **processFinderRow** CC 51: State machine helpers extracted
- **processAlignmentRow** CC 32: Alignment pixel handlers extracted
- **crossCheckVertical** CC 20: Scan-up and scan-down phases extracted
- **crossCheckHorizontal** CC 20: Same pattern as vertical

### 7. ✅ src/modules/qr-art/generate.ts (CC 268 at 2184, CC 126 at 1732, CC 91 at 1954, CC 38 at 4049, CC 37x2 at 699/1015, CC 32 at 1308, CC 26 at 1479)
> **21 helpers extracted across 3 phases. CC sum ~619 → ~310 estimated.**

**Phase A — Smaller functions (done):**
- **regenerateQRFromModifiedData** CC 91→~25: `drawFinderPattern`, `drawAlignmentPatterns`, `drawTimingPatterns`, `writeFormatInfo`, `writeVersionInfo`, `interleaveBlockCodewords`, `placeDataWithZigzag`
- **scanMatrixWithJsQR** CC 37→~15: `renderMatrixToImageData`, `hasExtraInvalidSegments`
- **generateBaseQR** CC 37→~18: `createQREncoderForGenerate`, `extractActualMaskPattern`
- **filterSelectionsForNumericSuffix** CC 126→~35: `accumulateByteGroupMasks`, `greedyRemoveInvalidSelections`
- **generateFullQArtBestMask** CC 38→~20: `resolveSharedSuffix`

**Phase B — generateFullQArt CC 268→~120 (done):**
- `validateBasisVectorSafety` — basis vector guard loop
- `verifyProtectedBytes` — per-block bit-level protection check
- `analyzeMatrixDiff` — structural diff counting
- `estimateBlockECCDamage` — ECC budget estimation
- `runDeterministicMutationTest` — single-vector mutation test
- `handleScanFailureFallback` — binary search fallback + re-validation
- `resolveQArtSuffixConfig` — suffix/version/encoding resolution (~180 lines, CC ~40 reduction)

**Remaining (deferred, low priority):**
- `buildNumericSafeRanges` — promote from closure in encodeDataToBytes (CC ~10 reduction)

### 8. ✅ src/modules/qr-art/image-utils.ts (CC 32 at 125, CC 25 at 78)
- `removeSmallComponents` extracted and verified
- Additional helpers decomposed in bulk commit

### 9. ✅ src/modules/qr-art/elimination.ts (CC 31 at 638, CC 22 at 528, CC 16x3)
- Row-operation helpers extracted: `eliminatePixelFromOtherRows`, `buildBlockAffectionMatrix`, `computeFlipParity`

### 10. ✅ src/modules/qr-art/scan-fallback.ts (CC 34 at 529, CC 18 at 102)
- `validateCandidate` extracted for candidate validation logic

### 11. ✅ src/modules/qr-generator/qr-generator-class.ts (CC 30 at 1152, CC 27 at 1462, CC 22 at 816, CC 21 at 1087, CC 18 at 293, CC 16 at 667)
- Rendering phase helpers extracted (scan-gate metrics, string encoding, dither attempt builders)

### 12. ✅ src/modules/qr-generator/scaled-render.ts (CC 29 at 726, CC 25 at 388, CC 20 at 91, CC 19x3 at 221/458/1124)
- Module-drawing helpers extracted (structural preservation, dithered/non-dithered render helpers, scaled preserve flags)

### 13. ✅ src/modules/qr-generator/filters-preprocess.ts (CC 29 at 290, CC 25 at 372)
- Filter application helpers extracted: `applyBasicFilterOptions`, `applyDuotoneAndColorMode`, `buildFilterOptionsFromConfig`, `shouldAutoNormalizeColor`, `computeNormalizationStrength`, `applyAdaptiveNormalizationIfNeeded`

### 14. ✅ src/modules/qr-generator/pixel-matrix-dithered.ts (CC 29 at 907, CC 18 at 1444, CC 17x2 at 454/1630)
- Dithering phase helpers extracted (dither kind resolvers, threshold pattern helpers, module locking)

---

### 15. Components (React — extract into sub-components or helper functions)

| Component | CC | Status |
|-----------|-----|--------|
| **ShareSection.tsx** | 197 | ✅ Decomposed into 7 helper functions (CC 197 → ~5) |
| **Analyze.tsx** | 258/103/73/55/29/23/22/21/20/19 | ✅ Decomposed into 2 sub-modules (5993→3286 lines) |
| **Header.tsx** | 155/28 | ⬜ Extract nav builders |
| **PayloadSection.tsx** | 113 | ⬜ Extract payload type renderers |
| **OverlaySection.tsx** | 23/20 | ⬜ Extract overlay config helpers |
| **Preview.tsx** | 24/17 | ⬜ Extract preview render helpers |
| **StaticPage.tsx** | 19 | ⬜ Low priority |
| **help-link.tsx** | 29 | ⬜ Extract link builder |

### 16. Hooks/Store

| File | CC | Status |
|------|-----|--------|
| **useQRGenerator.ts** | 176/162/67/41/29/24/21 | ✅ Effect/callback helpers extracted |
| **qr-store.ts** | 139 | ⬜ Extract action handlers |

### 17. App/Netlify

| File | CC | Status |
|------|-----|--------|
| **netlify/functions/qr.ts** | 283/43/38/17/17 | ✅ Request handling helpers extracted |
| **App.tsx** | 186/17 | ⬜ Extract route/section renderers |

### 18. Other modules

| File | CC | Status |
|------|-----|--------|
| **share-links/url-params.ts** | 310/17 | ✅ `buildUrlParams` decomposed into 15+ builder helpers |
| **qr-generator/render-modes.ts** | 28 | ✅ Per-mode applier functions extracted |
| **qr-generator/dithering-matrix.ts** | 29 | ✅ `computeDitheredModuleValue`, `enforceModuleConstraints` extracted |
| **qr-generator/overlay-subpixel.ts** | 25 | ✅ `processSubpixelCell`, `resolveOverlayColor`, `resolveHalftoneColor` extracted |
| **qr-generator/render-loop.ts** | 20x2/16x2 | ✅ `processRenderCell`, `computeFinalModuleColor`, `drawStyledModule` extracted |
| **qr-encoder/encoder.ts** | 30/21/20/19 | ✅ Helpers extracted in bulk commit |
| **qr-encoder/encoder-api.ts** | 20 | ✅ `scanNumericRun`, `scanAlphanumericRun`, `scanByteRunEnd`, `mergeAdjacentSegments` extracted |
| **qr-decoder/decode-qr.ts** | 27/16 | ✅ `collectTimingDiagnostics`, `collectAlignmentDiagnostics`, `runMaskRootabilitySweep`, `attemptRSCorrectionWithFallback` extracted |
| **qr-decoder/binarizer.ts** | 21/18 | ✅ Binarizer helpers extracted in bulk commit |
| **qr-art/bit-mapping.ts** | 27/16 | ✅ `updateLruCache`, interleaving helpers extracted |
| **qr-art/semantic-layout.ts** | 20 | ✅ `findBlockForLinearByte`, `isBitAllowed`, `validateVectorSelection` extracted |
| **dither-algorithms/advanced.ts** | 17x3 | ✅ Per-algorithm quantize helpers extracted |
| **dither-algorithms/error-diffusion.ts** | 17 | ✅ `distributeErrorWithKernel`, `quantizeErrorDiffusionPixel` extracted |
| **payload-generators/payments.ts** | 33/20 | ⬜ Extract EMV TLV builder helpers |
| **qr-decoder/decoder-adapter.ts** | 26/16 | ⬜ Extract `tryDecode` sub-phases |
| **qr-decoder/qr-data-decoder.ts** | 26/18/17/16 | ⬜ Extract per-mode decode helpers |
| **qr-decoder/format.ts** | 23/17 | ⬜ Extract format/version bit readers |
| **qr-decoder/perspective.ts** | 20 | ⬜ Extract transform computation helpers |
| **qr-decoder/rs-decoder.ts** | 25 | ⬜ Extract `runEuclideanAlgorithm` sub-steps |
| **qr-decoder/qr-detector.ts** | 25 | ⬜ Extract detection phase helpers |
| **qr-decoder/reed-solomon.ts** | 24 | ⬜ Extract syndrome/error-locator helpers |
| **qr-decoder/rs-rootability.ts** | 19 | ⬜ Extract `berlekampMassey` sub-steps |
| **qr-spec/qr-patterns.ts** | 24/16 | ⬜ Extract alignment center lookup |
| **exporter/gif-export.ts** | 22 | ⬜ Extract frame encoding helpers |
| **overlay/overlay-filters.ts** | 21 | ⬜ Extract convolution kernel helpers |
| **animation/animation-patterns.ts** | 20/16 | ⬜ Extract pattern frame applier helpers |
| **animation/shared-patterns.ts** | 20 | ⬜ Extract easing/pulse helpers |
| **animation/gif-compositor.ts** | 16 | ⬜ Low priority |
| **animation/parsing.ts** | 16 | ⬜ Low priority |
| **qr-analyzer/decoder.ts** | 24/16 | ⬜ Extract geometry/color analysis helpers |
| **qr-analyzer/analyzer-content.ts** | 18 | ⬜ Extract content detection helpers |
| **qr-art/index.ts** | 21/16 | ⬜ Extract alignment position helpers |
| **qr-art/qart-worker.ts** | 24 | ⬜ Extract worker message handler |
| **qr-art/rs-basis.ts** | 26/25 | ⬜ Extract basis computation phases |
| **lib/logger.ts** | 17 | ⬜ Low priority |

---

## Priority Order for Remaining Work

### Tier 1 — High CC, high risk (do next)
1. **qr-art/generate.ts** — CC sum ~619, single largest contributor ✅
2. **Analyze.tsx** — CC sum ~623, largest component ✅
3. **App.tsx** — CC 186, app shell
4. **Header.tsx** — CC 155, navigation
5. **qr-store.ts** — CC 139, state management

### Tier 2 — Medium CC (batch together)
6. **PayloadSection.tsx** — CC 113
7. **payments.ts** — CC 33/20
8. **decoder-adapter.ts** — CC 26/16
9. **qr-data-decoder.ts** — CC 26/18/17/16
10. **rs-decoder.ts** — CC 25
11. **qr-detector.ts** — CC 25
12. **rs-basis.ts** — CC 26/25
13. **qart-worker.ts** — CC 24
14. **qr-analyzer/decoder.ts** — CC 24/16
15. **reed-solomon.ts** — CC 24
16. **qr-patterns.ts** — CC 24/16
17. **help-link.tsx** — CC 29
18. **format.ts** — CC 23/17
19. **exporter/gif-export.ts** — CC 22
20. **overlay-filters.ts** — CC 21
21. **qr-art/index.ts** — CC 21/16

### Tier 3 — Low CC (batch or defer)
22. **perspective.ts** — CC 20
23. **animation-patterns.ts** — CC 20/16
24. **shared-patterns.ts** — CC 20
25. **OverlaySection.tsx** — CC 23/20
26. **Preview.tsx** — CC 24/17
27. **rs-rootability.ts** — CC 19
28. **StaticPage.tsx** — CC 19
29. **analyzer-content.ts** — CC 18
30. **lib/logger.ts** — CC 17
31. **gif-compositor.ts** — CC 16
32. **parsing.ts** — CC 16
