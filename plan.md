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
- Gallery generation consumes matrix output and includes scan-approved cases by default.
- Add inclusion policy for HERO showcase: visual diversity + feature coverage + mandatory scan pass.
- Extend gallery manifest with scan metadata and provenance.

## Phase 5: Feature Coverage Expansion (Encoding/Render/Animation/Output/Watermark)
- Ensure canonical scenarios include representative coverage of each major section.
- Add section-level coverage checks so no major feature area is unintentionally absent from matrix runs.

## Phase 6: CI/Make Integration
- Add dedicated targets:
  - `make test:overlay:audit`
  - `make test:gallery:matrix`
  - `make gallery:auto`
- Keep heavyweight suites isolated from fast local loops; wire into nightly/explicit CI path.

## Phase 7: Final Findings and Actionability Report
- Produce final report summarizing:
  - what works reliably,
  - what fails,
  - what is fixable quickly,
  - what is likely unreasonable to guarantee.
- Include specific recommendations for default settings and gallery curation policy.

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
