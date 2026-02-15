# ANQR Overlay/Gallery Execution Plan (User-Directed Order)

## Goal
Build a comprehensive, test-driven overlay/image option validation pipeline that:
- audits and fixes overlay wiring gaps first,
- then unifies scenario definitions,
- then executes scan matrix tests across all four canonical images,
- and finally uses scan-approved outputs to drive Gallery generation with clear pass/fail diagnostics.

Canonical fixtures:
- `public/tsunami.jpg`
- `public/king.gif`
- `public/logo.png`
- `public/test.png`

---

## Phase 3 (First): Overlay Wiring Audit + Concrete Bug Fixes

### Scope
Audit and validate wiring for all overlay-relevant options across all overlay modes, including preservation behavior and blend behavior.

### What will be verified
1. Overlay mode behavior is actually wired and changes output:
   - `center`, `blend`, `halftone`, `halftone-dithered`, `mosaic`, `gapfill`, `brightness`, `duotone`, `subpixel`, `subpixel-size`, `dithered`, `dither`, `blue-noise`, `pixelate`, `outline`, `wave`, `extreme`, `artwork`.
2. Preservation/protection options are applied consistently where expected:
   - `preserveFinders`, `preserveTiming`, `preserveAlignment`, `protectFormatInfo`, `protectVersionInfo`, `preserveFunctionalPatterns`, `finderDitherStrength` (to be presented as Preservation Strength), `blendPreservations`.
3. Dither-related controls are wired and have measurable effect where applicable:
   - `ditherKind`, `ditherStrength`, `diffusionKernel`, `orderedMatrix`, `blueNoiseSeed`, `blueNoiseTileSize`, `colorDither`, `ditherSerpentine`, `qrFirstMode`.
4. Overlay transform/preprocess options are wired:
   - `fit`, `rotate`, `flipX`, `flipY`, `crop*`, `brightness`, `contrast`, `gamma`, `saturation`, `blur`, `sharpen`, `posterize`, `threshold`, `edge`, `invert`, `hue`.

### Test strategy
- Extend/replace temporary debug tests with permanent suites under `tests/unit/`:
  - per-mode render delta checks,
  - preservation locality checks,
  - decode smoke checks,
  - regression checks for known failures (e.g., subpixel detail collapse, preservation blending behavior).
- Use deterministic seeds and stable fixture sampling for repeatability.

### Deliverables
- Updated/fixed generator/render code for any concrete wiring defects.
- Permanent test suites (no `_tmp-*` tests).
- Short findings report of confirmed bugs fixed and any unresolved high-risk areas.

### Exit criteria
- All concrete wiring bugs found in Phase 3 are fixed.
- New/updated unit tests pass and demonstrate option effect where expected.
- No known “option toggles but no output change” gaps remain without documented reason.

---

## Phase 1 (Second): Canonical Scenario Source

### Scope
Create one canonical scenario catalog consumed by both:
- tests (scan matrix + wiring tests),
- gallery generation.

### Requirements
- Remove/avoid duplicate hand-maintained scenario definitions.
- Each scenario includes metadata:
  - `id`, `featureGroup`, `params`, `isAnimated`, `fixtures`, `galleryEligible`, optional `heroPriority`.
- Cover categories beyond overlay: QR encoding, render, animation, output, watermark, preprocessing, safety-sensitive variants.

### Deliverables
- New shared scenario module (single source of truth).
- `src/data/gallery-items.ts` and generation scripts refactored to consume canonical scenario definitions.

### Exit criteria
- Gallery definitions and test scenarios originate from one canonical source.
- No duplication drift between gallery items and test permutations.

---

## Phase 2 (Third): Comprehensive Scan Matrix Across 4 Images

### Scope
Run scenario-driven scan tests across all four fixtures and classify outcomes.

### Matrix dimensions
- Scenario × Fixture (`Tsunami`, `King`, `Logo`, `Test`) × output path (direct render + exported form as applicable).
- Include meaningful robustness perturbations (mild blur/noise/downscale) for stability checks.

### Outputs
- `reports/gallery-scan-matrix.json`: machine-readable pass/fail with diagnostics.
- `reports/gallery-scan-summary.md`: human-readable summary by feature group and fixture.
- Optional artifacts for failed/high-interest cases.

### Classification fields
- `status`: `pass` | `fail`
- `reasonCode`: `WIRE_GAP` | `CONTRAST_COLLAPSE` | `QUIET_ZONE_VIOLATION` | `ECC_BUDGET_EXCEEDED` | `EXPORT_LOSS` | `ANIMATION_FRAME_FAIL` | `UNKNOWN`
- `disposition`: `fix-now` | `tunable` | `unreasonable`

### Exit criteria
- Every scenario has explicit results across all four fixtures.
- Failures are categorized with reason and disposition.

---

## Remaining Phases (After 3 → 1 → 2)

## Phase 4: Gallery Gating by Scan-Approved Results

### Status
- [x] Scan matrix test produces correct artifact format per fixture (GIF for king.gif, PNG for static)
- [x] `MatrixResult` and `galleryCandidates` track `isAnimated`, `heroPriority`, `galleryEligible`
- [x] Gallery candidates sorted by hero priority descending
- [x] `update-gallery-from-scan-matrix.mjs` copies artifacts with correct extension (.gif/.png)
- [x] Gallery manifest includes tier stats, hero priority, animated flag, and gallery eligibility
- [x] Two-tier testing (Tier A production, Tier B diagnostic) with scan-gate-rescued comparison
- [x] Failure classification distinguishes sub-pixel dithered modes (tunable) from module-level failures (fix-now)

### Deliverables
- Gallery generation consumes matrix output and includes scan-approved cases by default.
- Inclusion policy for HERO showcase: sorted by `heroPriority`, mandatory scan pass (Tier A), `galleryEligible` flag.
- Gallery manifest extended with scan metadata and provenance (tier stats, fixture type, hero priority).

## Phase 5: Feature Coverage Expansion (Encoding/Render/Animation/Output/Watermark)

### Status
- [x] Added 12 new scenarios expanding coverage across all feature groups (30 total, up from 18)
- [x] Overlay: +3 (duotone, pixelate, blend) → 9 total
- [x] Render: +3 (diamond+gap, linear gradient, sticker frame) → 5 total
- [x] Encoding: +2 (ECC-M, byte encoding) → 5 total
- [x] Animation: +2 (subpixel, halftone overlay modes) → 4 total
- [x] Watermark: +1 (text watermark) → 2 total
- [x] Output: +1 (grayscale color mode) → 2 total
- [x] FEATURE_COVERAGE_REQUIREMENTS enforced in test (overlay≥6, preservation≥2, render≥3, encoding≥3, animation≥3, output≥2, watermark≥2)
- [x] All heroPriority values unique across all 30 scenarios
- [x] Test passes: 240 runs (30×4×2), Tier A 107/120 (89%), Tier B 91/120 (75%), 0 RENDER_ERRORs
- [x] Render and Output groups achieve 100% Tier A pass rate

## Phase 6: CI/Make Integration

### Status
- [x] `make test:overlay:audit` — runs overlay preservation wiring audit (~2min, 80+ tests)
- [x] `make test:gallery:matrix` — runs gallery scan matrix (30×4×2 = 240 runs, ~4min)
- [x] `make gallery:auto` — full pipeline: scan matrix → copy approved → gallery manifest
- [x] Heavyweight tests excluded from regular `vitest run` / `test:unit` via vitest.config.ts exclude
- [x] Help text updated with new targets

### Deliverables
- Dedicated Make targets for heavyweight overlay/gallery suites.
- `gallery:auto` chains scan matrix test → artifact copy → manifest generation.
- Heavyweight suites isolated from fast local loops (`vitest run` excludes them).
- Wire into nightly/explicit CI by calling `make test:overlay:audit test:gallery:matrix` or `make gallery:auto`.

## Phase 7: Final Findings and Actionability Report
- Produce final report summarizing:
  - what works reliably,
  - what fails,
  - what is fixable quickly,
  - what is likely unreasonable to guarantee.
- Include specific recommendations for default settings and gallery curation policy.

---

## Knowledge Learned

Empirical findings synthesized from Phases 1–6 (30 scenarios × 4 fixtures × 2 tiers = 240 runs).

### Fixture Difficulty Ranking

| Fixture | Tier A (Production) | Tier B (Diagnostic) | Notes |
|---------|-------------------:|-------------------:|-------|
| logo.png | 29/30 (96%) | 29/30 (96%) | Easiest — simple shapes, high contrast |
| test.png | 27/30 (90%) | 26/30 (86%) | Synthetic, predictable geometry |
| tsunami.jpg | 26/30 (86%) | 25/30 (83%) | Photographic, moderate detail |
| king.gif | 25/30 (83%) | **11/30 (36%)** | Animated, high detail, saturated palette; hardest by far |

**Key insight:** king.gif drops from 83% → 36% without scan gate assistance. This is the single biggest finding — animated/high-detail fixtures are catastrophically dependent on scan gate retries.

### Overlay Mode Scannability Tiers

Ranked by Tier A pass count across all 4 fixtures:

- **Reliable (4/4):** `dithered`, `subpixel`, `halftone`, `extreme`, `duotone`, `pixelate`, `blend`
- **Fragile (2/4):** `blue-noise` — fails consistently on tsunami + king
- **Broken (0/4):** `mosaic` — fails on ALL fixtures in both tiers (systemic CONTRAST_COLLAPSE)

`blue-noise` and `mosaic` are the only overlay modes that fail in Tier A. All other modes are production-safe.

### Preservation Mode Risk

| Mode | Tier A | Tier B | Assessment |
|------|-------:|-------:|------------|
| balanced | 4/4 | 3/4 | Safe default |
| strength-100 | 3/4 | 2/4 | Borderline — fails on king |
| blended | 1/4 | 1/4 | **High risk** — only passes on logo; destroys scannability with most fixtures |

`blendPreservations` should be off by default. When enabled, it aggressively softens the QR/overlay boundary, causing contrast collapse on anything but trivial images.

### Scan Gate Effectiveness

- **16 of 120** scenario×fixture pairs are "rescued" by scan gate (pass Tier A, fail Tier B)
- Scan gate is most impactful on **king.gif** (~14 rescued pairs) — king goes from 36% → 83%
- For **logo.png**, scan gate rescues almost nothing — logo is intrinsically scannable
- **Implication:** scan gate is essential for animated/high-detail fixtures but should not be relied on as a crutch for fundamentally broken configurations

### Feature Group Reliability (Tier A)

| Feature Group | Tier A | Tier B | Notes |
|--------------|-------:|-------:|-------|
| render | 20/20 (100%) | 17/20 (85%) | All styles safe in production; king causes Tier B dips |
| output | 8/8 (100%) | 5/8 (62%) | HD and grayscale reliable in production; king fragile without gate |
| watermark | 8/8 (100%) | 6/8 (75%) | Frame tags and text watermarks don't hurt production scannability |
| encoding | 19/20 (95%) | 13/20 (65%) | Only ECC-M loses one Tier A fixture; ECC-M/byte sensitive in Tier B |
| animation | 14/16 (87%) | 14/16 (87%) | blue-noise animation drags it down (both tiers) |
| overlay | 30/36 (83%) | 29/36 (80%) | mosaic (0/4) and blue-noise (2/4) are the culprits |
| preservation | 8/12 (66%) | 7/12 (58%) | blended preservation (1/4) is the main offender |

### Disposition Classification Logic

Two-axis classification based on tier and overlay mode:

- **Tier A failures → always `fix-now`:** scan gate already tried its best; these are genuinely broken
- **Tier B failures on sub-pixel dithered modes (`dithered`, `blue-noise`) → `tunable`:** expected art-first behavior without scan gate
- **Tier B failures on module-level modes (`mosaic`, `halftone`, etc.) → `fix-now`:** should decode even without scan gate

The `SUBPIXEL_DITHERED_MODES` set in `classifyResult()` drives this logic.

**Concrete counts:** Tier A: 13 failures (all `fix-now`). Tier B: 29 failures (4 `fix-now` + 25 `tunable`).

### Two-Tier Testing Methodology

| | Tier A (Production) | Tier B (Diagnostic) |
|---|---|---|
| Purpose | Matches what users see | Intrinsic scannability |
| `scanGateProfile` | `'preview'` | `'off'` |
| `overlayIntensity` | 70 | 65 |
| `qrBitBiasStrength` | 0.15 | 0 |

The delta between tiers reveals scan gate dependency. Large deltas (king 83→36%) flag fragile configurations that work only because the scan gate retries mask underlying contrast issues.

### GIF Encoding for Animated Fixtures

- king.gif artifacts must be encoded as **GIF** (not PNG) via `gifenc` (`quantize → applyPalette → writeFrame`)
- The `canvasToGifBuffer()` helper in the scan matrix test handles single-frame GIF encoding
- `isAnimated` flag on fixtures drives extension selection (`.gif` vs `.png`) in both the test and `update-gallery-from-scan-matrix.mjs`

### CI Integration Patterns

- Heavyweight tests (scan matrix ~4min, overlay audit ~2min) are **excluded** from regular `vitest run` via `vitest.config.ts` `exclude` array
- Dedicated Make targets for explicit/nightly runs:
  - `make test:overlay:audit` — overlay preservation wiring audit
  - `make test:gallery:matrix` — full scan matrix (240 runs)
  - `make gallery:auto` — chains: scan matrix test → artifact copy → manifest generation
- Regular `test:unit` stays fast (~30s) for local development loops

### Gallery Curation Policy Implications

- 29 of 30 scenarios produce at least one gallery candidate
- Hero showcase prioritization: `heroPriority` desc → mandatory Tier A pass → `galleryEligible` flag
- `overlay-mosaic` (0/4) should be excluded or fixed before gallery inclusion
- `blue-noise` variants are borderline — pass on logo + test but fail on photographic/animated fixtures
- King.gif gallery items should use scan-gate-rescued pairs only (Tier A pass) since intrinsic scannability is low

### Scenarios That Always Work (Both Tiers, All Fixtures)

11 universally reliable scenarios — safe defaults for gallery hero items and recommended starting configurations:

- **Animation:** `animation-dithered`, `animation-subpixel`, `animation-halftone`
- **Overlay:** `overlay-blend`, `overlay-duotone`, `overlay-extreme`, `overlay-halftone`, `overlay-pixelate`, `overlay-subpixel`
- **Render:** `render-frame-sticker`, `render-gradient-linear`

---

## Guardrails
- Do not include non-scannable outputs in gallery without explicit override.
- Preserve deterministic test behavior (fixed seeds, fixed fixtures).
- Remove temporary debug/spec files before completion.
- Keep user-visible naming aligned (e.g., “Preservation Strength”).

---

## Execution Order (Locked)
1. Phase 3
2. Phase 1
3. Phase 2
4. Phase 4
5. Phase 5
6. Phase 6
7. Phase 7
