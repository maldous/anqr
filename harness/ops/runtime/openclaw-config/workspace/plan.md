# Production Readiness Plan (Draft)

> **Status/Blocker:** `knowledge.md` is not present in the current workspace. First step is to locate/restore it (or confirm the correct repo path) so it can be reviewed and updated as required.

## Phase 0 — Repo Discovery & Baseline (Day 0)
1. **Locate the correct codebase** (confirm repo path if not this workspace).
2. **Find/restore `knowledge.md`** and read it end‑to‑end.
3. **Inventory the project structure** (packages, apps, shared libs, build/test tooling, Netlify config).
4. **Baseline run**
   - Run local app on `localhost:5173` and capture current behavior.
   - Note all generator sections and settings exposed in UI.
5. **Document architecture map** (data flow for payload → encoding → rendering → output).
6. **Define performance & quality targets** (render time, bundle size, scanability success rate, memory).

## Phase 1 — Codebase Audit & Risk Review
1. **Static analysis**: lint, TypeScript checks, dead code detection, dependency audit.
2. **Cross‑platform review**: confirm browser/mobile/server branching and any divergent implementations.
3. **Identify critical risk zones**:
   - Overlay blend mode implementation.
   - QR encoding + error correction compliance.
   - Rendering pipeline (canvas/SVG/bitmap).
   - Output/export pipelines.
4. **Create a tracking matrix** of all generator sections and their options (used for test matrix and gallery).

## Phase 2 — Functional Correctness by Generator Section
> Goal: verify spec compliance, predictable behavior, and full option coverage.

### 2.1 Payload
- Validate input handling (URL, text, vCard, Wi‑Fi, geo, SMS, email, calendar, binary).
- Normalize encoding (UTF‑8, ECI, emoji, multi‑byte handling).
- Enforce safe size limits with clear error feedback.

### 2.2 Overlay
- Confirm all blend modes are **fully implemented** and **consistent across environments**.
- Verify alpha handling (premultiplied vs straight), gamma (sRGB vs linear), and color space.
- Ensure overlay never destroys QR quiet zone or finder patterns.

### 2.3 Encoding
- QR spec compliance: version selection, mask selection, ECC (L/M/Q/H), data/EC codewords.
- Mask penalty scoring correctness; deterministic behavior with seeded inputs.
- Validate structured append (if supported).

### 2.4 Rendering
- Canvas/SVG/bitmap parity: size, quiet zone, module alignment.
- DPI/scaling correctness; crisp edges at all sizes.
- Antialiasing and pixel alignment to avoid scan failures.

### 2.5 Animation
- Frame generation correctness; module stability across frames.
- Timing, loop control, and export formats (GIF/MP4/WebM if present).

### 2.6 Output
- Export correctness: PNG/SVG/PDF/WebP (as supported).
- Consistent metadata in exports; correct filenames and download flows.

### 2.7 Watermark
- Watermark positioning, scaling, opacity; does not interfere with scanability.

### 2.8 Metadata
- Verify embedded metadata and exposed metadata view.
- Ensure safe defaults and opt‑in rules where required.

### 2.9 Share
- Web Share API + clipboard + download flows across mobile/web.
- Fallbacks for unsupported browsers.

### 2.10 Safety
- Input sanitization, size limits, invalid options handling.
- Security review for injection surfaces or external fetches.

## Phase 3 — Overlay Blend Modes + Scanability Validation
1. **Reference implementation comparison**
   - Document exact math for each blend mode.
   - Implement pixel‑level validation vs reference formulas.
2. **Golden image suite**
   - Generate canonical expected outputs per blend mode and color combos.
3. **Scanability tests** (must be automated)
   - Use multiple QR decoders to verify scan success.
   - Test under: low contrast, small size, overlay coverage %, blur/noise.
   - Record decode confidence metrics.
4. **Failure analysis rules**
   - Auto‑flag configurations that drop below scanability thresholds.

## Phase 4 — Analyze Section Expansion
1. **Define an analysis data model** (what is shown and why it matters).
2. **Proposed data points**:
   - QR version, mask pattern, ECC level, capacity utilization.
   - Module count, quiet zone size, scaling factor, render timing.
   - Contrast ratio, overlay coverage %, minimum feature size.
   - Mask penalty breakdown and final score.
   - Output size, encoding time, render time.
3. **Expose data in UI** (compact + expanded views).
4. **Add export of analysis JSON** for test harnesses.

## Phase 5 — Automated Gallery Generation
1. **Permutation generator**
   - Define a config matrix across payloads, ECC, sizes, colors, overlays, blend modes, outputs.
   - Deterministic seed; limit to a curated but broad coverage set.
2. **Gallery builder**
   - Output assets + metadata manifest (JSON) for viewing and tests.
   - Allow filtering by failures or edge cases.
3. **Use gallery outputs**
   - Fuel regression tests and visual baselines.

## Phase 6 — Testing Strategy (Unit + Integration Only)
> **No UI tests**, but end‑to‑end functional verification across targets.

### 6.1 Unit Tests (Exhaustive)
- Encoding algorithm correctness.
- Blend mode math per pixel.
- Rendering of module grid (quiet zone, scaling).
- Output encoding/metadata correctness.
- Payload parsing/validation.

### 6.2 Property‑Based & Fuzz Tests
- Randomized payloads and option combinations.
- Ensure decoding success for valid inputs.
- Validate error handling for invalid inputs.

### 6.3 Golden Image / Snapshot Tests
- Compare generated images to known‑good baselines.
- Pixel diff thresholds for tolerance.

### 6.4 Integration Tests (Mobile/Web/Netlify)
- Run generator pipeline in **browser**, **mobile browser**, and **Netlify/server** builds.
- Verify consistent outputs across environments for same config.
- Test shared code paths vs platform‑specific branches.

### 6.5 Performance Tests
- Render time budgets; memory usage.
- Ensure no regressions (tracked in CI).

## Phase 7 — i18n Completeness
1. **Translation coverage check**: all keys exist in all locales.
2. **String literal audit**: detect English strings in non‑English locales.
3. **Pseudo‑localization** to uncover truncation and layout issues.
4. **Locale formatting**: numbers, dates, units.

## Phase 8 — Performance & Optimization
1. **Profiling**: CPU, memory, bundle size, render time.
2. **Optimization targets**:
   - Use Web Workers / OffscreenCanvas where safe.
   - Cache intermediate render steps.
   - Reduce re‑renders and unnecessary recomputation.
3. **Network & bundle**: tree‑shaking, code‑splitting, compression.

## Phase 9 — Deployment & Netlify Readiness
1. **Netlify build config audit** (functions, redirects, env vars, build flags).
2. **Server‑side compatibility**: ensure no browser‑only APIs in server builds.
3. **Runtime health checks** and build‑time integrity tests.

## Phase 10 — Documentation & Knowledge Base Updates
1. **Update `knowledge.md`** with:
   - Architecture overview
   - Generator options & constraints
   - Testing & gallery usage
   - Scanability guidelines
2. Add contributor/testing instructions for reproducibility.

## Phase 11 — Release Checklist & Sign‑off
- All tests passing (unit + integration + performance).
- Scanability success metrics meet thresholds.
- i18n coverage at 100% (no stray English).
- Netlify deploy verified.
- `knowledge.md` and docs updated.
- Final regression scan with gallery outputs.

---

### Immediate Next Action (pending repo path)
- Confirm the correct repo location and provide access to `knowledge.md` so Phase 0 can begin.
