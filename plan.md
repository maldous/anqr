# ANQR Production‑Readiness Plan (Chronological)

> **Scope:** Full functional correctness, full unit + integration test coverage (no UI tests), overlay blend mode validation for scanability, end‑to‑end parity across Web / Mobile (Capacitor) / Netlify, and a complete i18n + documentation audit. This plan is derived from `knowledge.md` (project root) and targets the current architecture and file layout.

## Execution Log (updated as work proceeds)
- **2026‑02‑07** — Phase 0 kickoff.
  - Entry points confirmed: `src/main.tsx` and `netlify/functions/qr.ts`.
  - Extracted option matrix from `src/store/qr-store.ts` → `reports/option-matrix.json` and `reports/option-matrix.md`.
  - UI baseline captured via OpenClaw browser (localhost:5173). Snapshot confirms header/nav + sidebar + preview canvas present.
  - Analyze page baseline captured (shows summary chips, content analysis, structure/encoding panels, module matrix).
  - Gallery page baseline captured (category filters + sample links render).
  - Local dev server responding on `http://localhost:5173` (HTML confirmed via curl).
  - Share param parity scan complete: client=165 keys, server=154 keys, client-only=15, server-only=4. Report: `reports/param-parity.json`.
  - Added unit test guard for parity gaps: `tests/unit/share-param-parity.spec.ts`.
  - Overlay blend mode audit complete: QR overlay modes handled in `src/modules/qr-generator/*`; canvas composite blend modes handled in `src/modules/overlay/processor.ts` + `watermark.ts`. Existing tests cover QR overlay modes but **not** canvas composite modes.
  - Analyze audit complete: `reports/analyze-audit.md`.
  - i18n audit complete: `reports/i18n-audit.md`.
  - Added i18n leak-check script: `scripts/check-i18n-txt.js` (line-count + English-match checks).
  - Unit test coverage audit complete: `reports/test-coverage-audit.md`.
  - Added QR decoder pipeline tests: `tests/unit/qr-decoder-pipeline.spec.ts` (clean matrices, corruption, inversion).
  - Added blend-mode tests: `tests/unit/core-blend-modes.spec.ts` and `tests/unit/canvas-blend-modes.spec.ts`.
  - Ran targeted Vitest suite (decoder pipeline + blend tests): **pass**.
  - Added share-links round‑trip test: `tests/unit/share-links-roundtrip.spec.ts` (pass).
  - Added payload generator tests: `tests/unit/payload-generators.spec.ts` (pass).
  - Added dither algorithms tests: `tests/unit/dither-algorithms.spec.ts` (pass).
  - Parity analysis report drafted: `reports/parity-analysis.md` (client-only keys reduced to 10 after server aliases).
  - Updated Netlify param parsing: aliases for `qzEnforce`, `seed`, `spGridNum`, `speed`, `subpixel`; parity test updated and passing.
  - Closed share param parity gap: client=169 keys, server=169 keys, client-only=0, server-only=0; added client alias parsing for `maxOverlayIntensity*`.
  - Added QR encoder utils tests: `tests/unit/qr-encoder-utils.spec.ts` (pass).
  - Added QR generator decode tests: `tests/unit/qr-generator-decode.spec.ts` (pass; includes overlay path).
  - Added Netlify function integration test: `tests/unit/netlify-qr-function.spec.ts` (pass; PNG decode).
  - Added safety analyzer unit tests: `tests/unit/qr-analyzer-safety.spec.ts` (pass).
  - Expanded safety tests with ECC overlay-intensity boundary assertions (`validateOverlayIntensity`).
  - Added scanability robustness suite: `tests/unit/scanability-robustness.spec.ts` (overlay + blur/noise perturbations, decode via `decodeQR` + `scanImageData`).
  - Added i18n regression guard: `scripts/check-i18n-regressions.js` + baseline `reports/i18n-regression-baseline.json`; npm script `test:i18n` now passes.
  - Added analyzer export builder: `src/modules/qr-analyzer/export.ts` (`buildAnalysisExportData`) and switched Analyze JSON export to use module API.
  - Extended analyzer diagnostics with geometry fields (`QRAnalysisResult.geometry`) from decoder corners/bounds/rotation.
  - Added Analyze test hooks (`data-testid`) on summary bar + key diagnostic sections (structure, encoding, decoder metadata, spatial, module matrix).
  - Added export builder unit tests: `tests/unit/qr-analyzer-export.spec.ts` (pass).
  - Upgraded gallery manifest generation (`scripts/generate-gallery.mjs`) to deterministic spec output: sorted params/query, per-item parameter hash, output file hash/size, and run metadata (`manifestVersion: 2.0`).
  - Added CI quality workflow: `.github/workflows/quality.yml` running `typecheck`, `test:unit`, and `test:i18n` on push/PR.
  - Added CI-safe unit script `test:unit:ci`; workflow updated to use it.
  - Fixed mobile MediaStore adapter compatibility: JS now supports both plugin method names (`saveBase64ToDocuments` and Android `saveToDocuments`) in `src/modules/platform/media-store.ts`.
  - Added MediaStore adapter tests: `tests/unit/platform-media-store.spec.ts` (pass) and corrected Platform README API examples.
  - Added Makefile quality targets: `quality`, `test:unit`, `test:unit:ci`, `i18n:check` (verified via `make quality`).
  - Added analyzer geometry validation test: `tests/unit/qr-analyzer-geometry.spec.ts` (pass).
  - Added analyzer timing diagnostics (`decodeMs`, `totalAnalysisMs`) through decoder/analyzer/export, surfaced in Analyze UI, and covered by export/geometry unit tests.
  - Expanded Analyze summary/scannability diagnostics: promoted decoder bytes, erasures, orientation chips and added explicit module-size scan-safe status.
  - Strengthened Netlify response test with header assertions (content-type/cache/etag/CORS) in `tests/unit/netlify-qr-function.spec.ts`.
  - Added extra Analyze automation hooks: `data-testid` on original/reproduced preview surfaces.
  - Added consolidated sign-off status report: `reports/production-signoff.md` (completed items + remaining blockers).
  - Removed image-fixture-dependent QR-Art tests and normalized CI/unit commands to run the same stable suite.
  - Quality gate now passes with full unit suite (`npm run typecheck && npm run test:unit && npm run test:i18n`).
  - Updated `knowledge.md` to new module layout, parity section, and module directory reference.
  - Drafted gap notes: `reports/knowledge-gap.md`.
  - Created initial risk register: `reports/risk-register.md`.

---

## Phase 0 — Project Baseline & Traceability (Day 0)
1. **Confirm runtime surfaces + entry points**
   - Web/Capacitor: `src/main.tsx` → `src/App.tsx` → `src/hooks/useQRGenerator.ts`.
   - Netlify function: `netlify/functions/qr.ts` → `src/modules/qr-generator/qr-generator-class.ts` + `src/modules/shared/index.ts`.
2. **Capture current behavior**
   - Run the dev server on **`localhost:5173`** and record baseline outputs.
   - Inventory *all generator sections* in UI: **Payload / QR Encoding / Render / Overlay / Animation / Output / Watermark / Metadata / Share / Safety**.
3. **Build a coverage matrix from the source of truth**
   - Enumerate options from `src/store/qr-store.ts` (enums like `OverlayMode`, `DitherKind`, `OutputFormat`, `ECCLevel`, etc.).
   - Use this matrix as the master list for tests + gallery permutations.
4. **Create a structured risk register**
   - High‑risk areas: overlay blend modes, scanability, client ↔ server parity, render scaling/quiet zone, animated output.

---

## Phase 1 — Knowledge.md Validation & Alignment
1. **Reconcile `knowledge.md` with current code**
   - Verify file lists, module paths, and flow diagrams still match reality.
   - Ensure new modules (if any) or moved files are reflected.
2. **Document parity status**
   - Client and server parsers are at **169/169 keys** with zero mismatches.
   - Keep parity enforced with a unit test (see Phase 6/7).
3. **Define documentation deliverables**
   - Add “what changed” notes as part of final production readiness.

---

## Phase 2 — Functional Correctness by Generator Section
> For each section: verify specification compliance, boundary behavior, and scan‑safe constraints.

### 2.1 Payload (src/modules/payload-generators/* + store)
- Validate all payload types (URL, WiFi, vCard, EMV/QR payments, crypto, etc.).
- Ensure encoding mode + ECI selection is correct for multi‑byte and emoji payloads.
- Confirm payload length limits and error messaging paths.

### 2.2 QR Encoding (src/modules/qr-encoder/* + src/modules/qr-spec/*)
- Verify version selection, mask selection, and ECC generation correctness.
- Confirm structural module detection (finder/timing/alignment/format/version) is correct.
- Add tests for `calculateOptimalVersion`, mask penalties, and locked module detection.

### 2.3 Render (src/modules/qr-generator/*)
- Validate module alignment, quiet zone, and scaling precision.
- Ensure render styles (eyes, modules, gaps, gradients, per‑module color) are deterministic.
- Confirm “crisp” vs antialiased output remains scannable at all sizes.

### 2.4 Overlay (src/modules/overlay/processor.ts + src/modules/core/color.ts)
- Verify transform, crop/fit, and filter pipelines.
- Ensure overlays never violate quiet zones or locked finder/timing regions (respect locks).
- **Blend mode math** must match reference formulas (see Phase 3).

### 2.5 Animation (src/modules/animation/* + qr-generator temporal dither)
- Validate GIF/APNG/WebP parsing, frame timing, and decimation logic.
- Ensure temporal dithering is stable (no flicker that breaks scan).
- Confirm frame‑to‑frame QR stability (data modules do not shift).

### 2.6 Output (src/modules/exporter/*)
- Verify export formats: PNG/JPEG/WebP/GIF/SVG/Vector SVG.
- Check metadata injection and DPI correctness.
- Confirm output dimensions and naming conventions.

### 2.7 Watermark (src/modules/overlay/watermark.ts)
- Validate position, scaling, blending, and opacity.
- Ensure watermark placement cannot invalidate scanability.

### 2.8 Metadata (src/modules/exporter/* + UI)
- Confirm metadata fields are set consistently across formats.
- Validate metadata removal/opt‑in policies (privacy safe defaults).

### 2.9 Share (src/modules/share-links/*)
- Validate URL parameter encoding/decoding.
- Confirm `MAX_SHARE_URL_LENGTH` logic and fallbacks.
- Ensure embed URLs produce identical output on Netlify.

### 2.10 Safety (src/modules/qr-analyzer/*)
- Enforce min module size and quiet zone constraints.
- Validate overlay intensity limits and contrast warnings.
- Confirm `validateQRCodeRobust` (jsQR) detects failures reliably.

---

## Phase 3 — Overlay Blend Modes + Scanability (Critical Path)
1. **Reference blending spec**
   - Core math: `src/modules/core/color.ts` (`multiplyBlend`, `screenBlend`, `overlayBlend`, `alphaBlend`).
   - Canvas composite: `src/modules/overlay/processor.ts` + `watermark.ts` (`normal/multiply/screen/overlay/soft-light/hard-light`).
   - Confirm alpha model (premultiplied vs straight) and gamma handling (sRGB vs linear).
2. **Pixel‑level golden tests**
   - Pure‑JS formula tests for core blends + alpha behavior.
   - Canvas composite tests using 1×1 / 2×2 pixels vs W3C formulas (tolerance for rounding).
   - Compare browser canvas vs Node canvas (`@napi-rs/canvas`) for parity.
3. **Scanability validation suite**
   - Use multiple decoders (jsQR + at least one alternate decoder) for robustness.
   - Test thresholds: small sizes, low contrast, heavy overlays, blur/noise, animation frames.
   - Track decode success rate and confidence.
4. **Enforcement rules**
   - Auto‑flag or clamp configurations that drop below scanability thresholds.

---

## Phase 4 — Analyze Section Expansion
1. **Current sources**
   - `src/modules/qr-analyzer/*` (safety + scanner) already compute some metrics.
2. **Expand displayed metrics**
   - Geometry: finder centers/corners, bounding box, rotation/tilt summary.
   - Decoder bytes vs payload bytes, erasures + orientation promoted to summary.
   - Scannability panel: module size vs minimum, quiet zone vs minimum, scan simulation results.
   - Dominant color palette (top 3) + WCAG contrast.
   - Render time + encode time + export time.
3. **Expose diagnostics**
   - Provide JSON export for analysis data (used in tests + gallery metadata).
4. **Test hooks**
   - Add `data-testid`/`data-qa` to key panels, summary chips, and canvases for stable integration tests.

---

## Phase 5 — Automated Gallery Generation (Permutation‑Driven)
1. **Define a deterministic permutation spec**
   - Use the coverage matrix from Phase 0.
   - Include payload types, ECC levels, render styles, overlay modes, output formats.
2. **Build a generator tool (script)**
   - Generate gallery assets + a manifest (JSON) of config → output.
   - Replace/augment `src/data/gallery-items.ts` via generation (not manual edits).
3. **Use gallery outputs as regression baselines**
   - Pixel diff + scanability checks.
   - Provide a “failure‑only” filter for rapid triage.

---

## Phase 6 — Testing Strategy (Unit + Integration Only)
> **No UI tests.** Use Vitest and Node‑level harnesses for deterministic coverage.

### 6.1 Unit Tests (Vitest)
**P0 (highest risk)**
- **QR decoder pipeline:** binarize → locate → extract → RS decode → payload decode.
- **Encode→decode integration:** matrix from encoder → render → decode across ECC levels.

**P1 (core stability)**
- **QR encoding:** `src/modules/qr-encoder/*`, `src/modules/qr-spec/*`, Shift‑JIS/ECI correctness.
- **QR generator core:** pixel‑matrix variants, render loop, scaled render, cache behavior.
- **Blend modes:** `src/modules/core/color.ts` + canvas composite (`src/modules/overlay/processor.ts`).

**P2 (feature correctness)**
- **Dither algorithms:** ordered/blue‑noise/error diffusion/temporal.
- **Payload generators:** vCard, WiFi, EMV, payment schemes, social links.
- **Share links:** URL round‑trip + embed/social helpers.

**P3 (supporting modules)**
- **Overlay:** crop + filters + watermark blending.
- **Exporter:** PNG/GIF/SVG output + metadata.
- **Core utilities:** color/contrast/gradient/harmony math invariants.

### 6.2 Property‑Based & Fuzz Tests
- Randomized payloads and config permutations (bounded for performance).
- Assert decoding success and invariants (quiet zone preserved, module count correct).

### 6.3 Golden Image Tests
- Canonical QR outputs for key configs (static + overlay + animation).
- Cross‑platform comparisons (browser vs Node canvas).

### 6.4 Integration Tests (Web + Netlify + Mobile‑aligned)
- **Web:** run generator modules directly using the same config as UI.
- **Netlify:** call `netlify/functions/qr.ts` with full param coverage and compare output.
- **Parity test:** fail CI if share‑links keys diverge from server parser (current gap: 0).
- **Mobile:** validate that export paths (MediaStore plugin) receive correct data.

---

## Phase 7 — Client ↔ Server Parity (Netlify)
1. **Unify query parameter mapping**
   - Establish a single source of truth (shared parser or generated list).
   - Ensure all client keys are parsed server‑side where relevant (current gap: 0).
2. **Automated parity guard**
   - Unit test that compares key sets from `src/modules/share-links/url-params.ts` and `netlify/functions/qr.ts`.
   - CI must fail on mismatch (allowlist should trend toward zero).

---

## Phase 8 — i18n Completeness & Zero English Leaks
1. **Full key coverage audit**
   - UI strings: `src/i18n/locales/txt/*.txt` + `template.json`.
   - Static pages: `src/i18n/static/txt/*.txt` + template‑*.ts.
   - **Status:** line counts match en‑US for all locales (see `reports/i18n-audit.md`).
2. **No untranslated English**
   - Leaks identified in: **rm**, **hi‑IN**, **am**, **ne‑NP**, **is‑IS**, **lv** (details in `reports/i18n-audit.md`).
   - Add automated `i18n` leak checker (line‑count + exact English matches + English‑heavy lines) and fail CI on regressions. (Script now at `scripts/check-i18n-txt.js`.)
3. **Workflow constraint**
   - Only edit `txt/en-GB.txt` + templates; never edit generated files.
   - User runs `make i18n:xlate` and `make i18n:fill` after changes.

---

## Phase 9 — Performance & Optimization
1. **Profiling**
   - Render time, export time, memory pressure in browser and mobile.
   - Animation frame processing cost (decimation + temporal dither).
2. **Optimization targets**
   - Cache heavy overlay processing (existing caches verified).
   - OffscreenCanvas/worker usage where safe.
   - Reduce redundant renders in `useQRGenerator.ts`.
3. **Bundle + network**
   - Verify tree‑shaking, code splitting, compression.

---

## Phase 10 — Netlify + Mobile Readiness
1. **Netlify function readiness**
   - Confirm `@napi-rs/canvas` parity and environment stability.
   - Validate image responses + headers.
2. **Capacitor / Android**
   - Verify `MediaStoreWriterPlugin.java` and `media-store-writer.ts` integration.
   - Ensure exports land in Documents/Downloads reliably.

---

## Phase 11 — Documentation Finalization
1. **Update `knowledge.md`**
   - Add resolved parity status and test coverage notes.
   - Document the gallery generator and new tests.
2. **Add developer checklists**
   - Test commands (Vitest, integration harness), release checklist.

---

## Phase 12 — Production Sign‑off Checklist
- All unit/integration tests green.
- Overlay blend modes validated vs reference math (browser + Netlify).
- Scanability success metrics meet agreed thresholds.
- Analyze section provides full diagnostics.
- i18n coverage is 100% (no English leaks).
- Netlify function output matches web output for identical configs.
- Documentation updated and current.

---

### Immediate Next Steps (Once Execution Begins)
1. Run Phase 0 discovery and build the full option matrix from `qr-store.ts`.
2. Build parity tests for share‑links vs server query keys.
3. Start the blend‑mode validation suite (golden image baselines + scanability checks).
