# Codex Working Log

Last updated: 2026-02-22 08:28:42 UTC

## Latest Update (2026-02-22, Quality-Gate Cleanup: Knip Unused Export)

- Resolved `knip` quality-gate failure:
  - removed unused export `clearBlueNoiseTileCache` from `src/modules/dither-algorithms/blue-noise.ts`.
- Verification:
  - `npx knip --include dependencies,unlisted,exports` now passes with exit code `0`.

## Latest Update (2026-02-22, Performance Hot-Path Pass: Logger + QR-Art + Animation + GIF Memory)

- Resolved logging hot-path overhead in `src/lib/logger.ts`:
  - `createLogger()` now avoids redaction/serialization/capture work unless needed.
  - structured capture is level-gated (`ANQR_LOG_CAPTURE_MIN_LEVEL`, default: `warn` in production).
  - explicit full capture override added via `ANQR_LOG_CAPTURE_ALL=1`.
  - warn/error still sanitize context and keep Sentry breadcrumb/event behavior.
  - string-buffer capture still works when `enableLogBuffer()` is active.
- Removed forced QR-Art basis cache invalidation in `src/modules/qr-art/generate.ts`:
  - deleted unconditional `clearBasisCache()` call before basis build.
  - cached RS basis now remains reusable across repeated renders.
- Reduced animation canvas allocation churn:
  - `src/modules/animation/apply-animation-pattern.ts` now accepts optional target canvas and supports canvas reuse.
  - `src/hooks/useQRGenerator.ts` now uses two scratch canvases for stacked animation effects, with persistent-clone mode only when needed.
- Fixed O(n²) frame index filtering in `src/hooks/useQRGenerator.ts`:
  - replaced `includes` membership checks with `Set.has` for decimated compositor indices.
- Reduced server GIF memory pressure in `netlify/functions/qr.ts`:
  - removed per-frame RGBA `Map` caches in `encodeAnimatedGif()` and `encodeAnimatedGifWithDelays()`.
  - frame pixel data is now generated on demand (lower peak memory, higher CPU acceptable).
- Optimized blue-noise tile generation:
  - `src/modules/dither-algorithms/blue-noise.ts` now memoizes tiles by `(size, seed)` with bounded cache.
  - switched tile storage to `Float32Array` and generalized sampling to `ArrayLike<number>`.
- Improved main-thread responsiveness (chunking path):
  - added cooperative yield points in heavy `generate()` stages in `src/hooks/useQRGenerator.ts` using `requestIdleCallback`/timeout helper path.
  - this improves responsiveness between expensive generation attempts without changing output behavior.
- Removed JSON stringify hash tax in `src/hooks/useQRGenerator.ts`:
  - replaced `JSON.stringify(config)`/`JSON.stringify(debouncedConfig)` comparison with referential comparison (`config !== debouncedConfig`) for pending-state detection.
- Validation:
  - `npm run typecheck` passes.
  - targeted suites pass:
    - logger: `tests/unit/logger.spec.ts`, `tests/unit/logger-buffer-redaction.spec.ts`, `tests/unit/logger-remote.spec.ts`
    - animation/dither: `tests/unit/animation-core.spec.ts`, `tests/unit/dither-algorithms.spec.ts`
    - qr-art/hook/netlify helpers: `tests/unit/qr-art-rs-basis-full.spec.ts`, `tests/unit/useQRGenerator-preserve-options.spec.ts`, `tests/unit/netlify-qr-helpers.spec.ts`

## Latest Update (2026-02-22, Security Hardening: CSP + SSRF + Dev Middleware + Script Eval Removal)

- Hardened production CSP in `netlify.toml`:
  - removed `'unsafe-eval'` and `'unsafe-inline'` from `script-src`.
  - added `script-src-attr 'none'`.
  - kept explicit third-party script allowlist domains.
- Hardened SSRF protections in `netlify/functions/qr.ts`:
  - `_isPrivateHostname()` now performs real DNS lookups (`dns.lookup` with `{ all: true }`) and blocks hostnames resolving to private/reserved addresses.
  - added short hostname safety cache (`overlayHostnameSafetyCache`) with TTL for resolved results and short negative-cache TTL.
  - DNS lookup failure now fails closed (treated as private/blocked).
  - added redirect-safe overlay fetch path (`fetchOverlayWithValidatedRedirects`) using `redirect: 'manual'`.
  - each redirect hop is re-validated (scheme + hostname private check) before continuing.
  - overlay fetch no longer relies on default redirect-follow behavior.
- Hardened Vite dev middleware path handling in `vite.config.ts`:
  - replaced `path.join(__dirname, 'public', req.url)` with safe URL pathname parsing + `decodeURIComponent`.
  - resolved against fixed `public` root and enforced root-prefix guard.
  - added explicit `400` for malformed URL and `403` for attempted traversal.
- Removed runtime code evaluation footgun in `scripts/generate-gallery-matrix.mjs`:
  - replaced `new Function(...)` object parsing with JSON-like literal normalization + `JSON.parse`.
  - no dynamic code execution remains in scenario galleryParams parsing path.
- Added regression coverage:
  - `tests/unit/netlify-qr-helpers.spec.ts` now includes redirect-based SSRF block test (302 redirect to `127.0.0.1` must be rejected).
- Validation:
  - `npm run typecheck` passes.
  - `npm run test:unit -- tests/unit/netlify-qr-helpers.spec.ts` passes.
  - `npm run test:unit -- tests/unit/netlify-qr-function.spec.ts` passes.

## Latest Update (2026-02-22, GIF Timing Preservation + Gallery Runner Strict-Mode Controls)

- Fixed frame-decimation timing correctness in `netlify/functions/qr.ts`:
  - `decimateFramesToMaxFps()` now preserves total animation duration by merging skipped-frame delays into the next kept frame.
  - added `decimateFramesToMaxCount()` and switched server hard-cap limiting to count-based decimation with duration preservation.
  - removed prior arbitrary target-fps heuristic (`Math.ceil(rawFrames.length / SERVER_MAX_ANIMATION_FRAMES) * 10`) and fallback striding branch.
- Updated gallery generators to stop forcing strict overlay failures globally:
  - `scripts/generate-gallery-local.mjs`, `scripts/generate-gallery-remote.mjs`, and `scripts/generate-gallery-browser.mjs` now set `_strictOverlay=1` only when `GALLERY_STRICT_OVERLAY=1`.
  - `_fullRender=1` remains enforced for parity renders.
- Improved browser preview GIF re-encode parity (`scripts/generate-gallery-browser.mjs`):
  - switched from per-frame palettes to a global sampled palette (+ black/white anchors) to reduce palette shimmer/flicker artifacts.
  - disposal mode now maps from scenario `gifDisp` (instead of forced `dispose: 1`).
  - preview GIF delay handling now honors `gifMaxFps` minimum delay clamp.
  - preview GIF palette size now follows scenario `gifColors`/`gifPal`.
- Validation:
  - `npm run typecheck` passes.
  - `npm run test:unit -- tests/unit/netlify-qr-helpers.spec.ts` passes.
  - `npm run test:unit -- tests/unit/netlify-qr-function.spec.ts` passes.

## Latest Update (2026-02-22, GIF Corruption Hardening + Payload-Permutation Removal)

- Fixed a server GIF encoding contract bug in `netlify/functions/qr.ts`:
  - `gifenc` frame option key is now `dispose` (was incorrectly `disposal`).
  - this removes `Dispose: Undefined` output and resolves strip/partial-frame corruption patterns.
- Hardened GIF frame encoding for non-transparent output:
  - added RGBA->opaque background compositing before quantization when `transparent=0`.
  - background defaults to request background (`bg` / `bgOver`) rather than implicit black.
- Hardened animated GIF palette stability:
  - switched animated server encoding to global palette sampling (multi-frame), instead of per-frame palette drift.
  - injected black/white anchor colors into palette to preserve QR rails in sparse/dither-heavy frames.
- Reduced transparent-region animation artifacts:
  - animation pattern effects now skip fully transparent pixels in shared animation functions (`src/modules/animation/shared-patterns.ts`).
  - server-only wave-axis + temporal-noise helpers also skip fully transparent pixels.
- Updated browser preview GIF helper parity:
  - `scripts/generate-gallery-browser.mjs` now uses `dispose` option key when encoding preview-captured GIFs.
- Payload permutation cleanup completed:
  - `scripts/lib/gallery-permutations.mjs` now uses a single payload (`https://anqr.link`) only.
  - removed overlay payload-variation generation block.
  - validated generator output remains exactly `1000` scenarios and all scenario payloads are `https://anqr.link`.
- Gallery stability curation update:
  - removed animated+dithered overlay permutations from gallery generation (kept static dither coverage).
  - this explicitly removes known unstable families like `ov-x-anim-king-dithered-*` and `heroFeature-king-dither-*`.
  - validated permutation output still totals exactly `1000` scenarios.

## Latest Update (2026-02-22, Blob Cache Config + Report Tracking Cleanup + Gallery Verification Contract)

- Netlify blob-cache handling in `netlify/functions/qr.ts` was hardened:
  - Added explicit credential path (`SITE_ID`/`NETLIFY_SITE_ID` + `NETLIFY_API_TOKEN`/`NETLIFY_AUTH_TOKEN`) so cache operations can run when env vars are present.
  - Added repo default `SITE_ID` fallback (`7def13e4-9486-4e9a-9ad3-87abff74ef1d`) when token exists.
  - Added Vitest/runtime guard (`IS_TEST_RUNTIME`) to disable blob-store access in unit tests to keep deterministic fetch behavior.
  - Added missing-env detection and one-time cache-disable path to avoid repeated noisy blob errors.
- Fixed current quality-gate regressions found from `make test`:
  - `src/modules/qr-generator/drawing-frames.ts`: safe fallback when `ctx.measureText` is unavailable in mocks.
  - `tests/unit/qr-generator-dithered-scan-gate.spec.ts`: blend-preservation coverage assertion now explicitly validates `blendPreservationMode: 'dither'`.
  - `tests/unit/required-tranche-2-visual.spec.ts` and `tests/unit/required-tranche-8-select-options.spec.ts`: synchronized explicit ID inventories with `tests/ids.txt`.
  - `tests/unit/share-param-parity.spec.ts`: updated allowed server-only query key list (`_strictOverlay`, `animSeed2`, `easing2`, `colorCycle2`, `reverse2`, `bounce2`).
- Updated gallery verification test contract for current web behavior:
  - `tests/basic/gallery-verification.spec.ts` now treats gallery links as web-relative in-app navigation (`/?...`) instead of requiring canonical absolute host links.
  - Updated URL parsing in the test to use `new URL(href, page.url())` for relative links.
  - Updated target/rel assertion to reflect current in-app navigation (no forced `_blank`).
- Repo hygiene cleanup for accidental generated artifacts:
  - Untracked all generated `reports/*` artifacts except committed baselines:
    - kept: `reports/.gitkeep`, `reports/i18n-regression-baseline.json`, `reports/param-parity.json`
    - removed from tracking: bundle/coverage/gallery-shards/payload/testid/indexnow/sentry/third-party report outputs
  - Untracked generated `test-report.txt` and added it to `.gitignore`.
  - `.netlify/` remains ignored and staged for removal from tracking (generated build artifacts must not be committed).

## Latest Update (2026-02-21, Blend Preservations Mode + Gallery Wiring)

- Implemented explicit blend-preservation style control end-to-end:
  - new setting: `blendPreservationMode: 'overlay' | 'dither'`
  - default is `overlay` to preserve current behavior unless explicitly changed.
- UI/UX updates (`src/components/sections/OverlaySection.tsx`):
  - converted preservation labels to i18n-backed strings.
  - added `Blend Preservation Style` selector (shown when `Blend Preservations` is enabled).
  - added test id: `overlay-blend-preservation-mode-select`.
- i18n updated (`src/i18n/locales/en-GB.json`) with:
  - `overlay.preservationStrength`
  - `overlay.blendPreservations`
  - `overlay.blendPreservationMode`
  - `overlay.blendPreservationModeOverlay`
  - `overlay.blendPreservationModeDither`
- Share-link/store/browser wiring completed:
  - state field + defaults in `src/store/qr-store.ts`.
  - generator config propagation in `src/hooks/useQRGenerator.ts`.
  - URL parse/build + type support in `src/modules/share-links/url-params.ts` and `src/modules/share-links/types.ts`.
  - hydration in `src/App.tsx`.
  - share payloads in `src/components/sections/ShareSection.tsx` and `src/components/Header.tsx`.
- API wiring completed (`netlify/functions/qr.ts`):
  - parses `blendPresMode` query param.
  - passes `blendPreservationMode` into QR generator config.
  - docs comment updated with the new API param.
- Renderer behavior split by mode:
  - `src/modules/qr-generator/scaled-render.ts`:
    - `overlay` mode = full module pass-through blending for boosted functional regions.
    - `dither` mode = blend constrained to dither rails for “dithered-in” look.
  - `src/modules/qr-generator/render-modes.ts`:
    - dither/extreme functional-module light rail behavior now differs between `overlay` vs `dither`.
  - `src/modules/qr-generator/qr-generator-class.ts`:
    - defaults/threads `blendPreservationMode` and adds it to scan-gate cache key inputs.
- Gallery permutations updated:
  - `scripts/lib/gallery-permutations.mjs`: added explicit `blendPresMode=overlay` vs `blendPresMode=dither` scenarios (static + animated).
  - `src/data/gallery-scan-scenarios.ts`: added preservation scenario pair for mode comparison.
- Test coverage added/updated:
  - `tests/unit/overlay-preservation-mode-audit.spec.ts`: verifies `blendPreservationMode` changes functional-region output.
  - `tests/unit/share-links-url-params-build.spec.ts`
  - `tests/unit/share-links-url-params-full.spec.ts`
  - `tests/unit/share-links-roundtrip.spec.ts`
  - `tests/basic/overlay.spec.ts`: basic-tier gating assertion for the new selector.
- Test-id governance updated:
  - regenerated `tests/ids.txt` and `tests/required.txt`.
  - synchronized `tests/unit/testid-inventory-explicit.spec.ts` with generated IDs.
- Validation run summary:
  - `npm run typecheck` passes.
  - unit suites above pass (including long preservation audit).
  - `npm run test:testid` passes.
  - targeted Playwright test passes:
    - `tests/basic/overlay.spec.ts` (grep: `preservation controls are hidden in basic tier`)
- Note:
  - `npm run test:required:strict` still reports existing direct-id mapping gaps for animation target/wave-axis select content IDs (pre-existing baseline issue not introduced by this change).

## Latest Update (2026-02-21, Pre-Run Readiness)

- Implemented animation target stacking end-to-end:
  - API/server: `animTarget`, `animWaveAxis`, `animPattern2`, `animTarget2`, `animWaveAxis2` wired and applied in GIF render pipeline.
  - Client/store/UI: primary + secondary pattern target controls added (including wave-axis selectors), with i18n and test IDs.
  - Share-link plumbing: parse/build/embed/hydration updated for new animation params.
- Fixed preview parity gaps in `src/hooks/useQRGenerator.ts`:
  - static-overlay animation path now applies module-target effects pre-render and result-target effects post-render.
  - removed stale `shouldGeneratePatternAnimation` path that was applying result effects to overlay input.
  - expanded animation effect dependency triggers (`pattern2`, target/axis fields) for reliable frame regeneration.
- Updated gallery permutation matrix for visual separation + new feature coverage:
  - added explicit `animTarget` + `animPattern2` stacked showcases in `nooverlay`, `overlay`, and animated `artwork`.
  - added controlled ECC/version variety with hard cap `v <= 9`.
  - artwork ECC remains low-only (`L`/`M`) with limited version variety.
- Updated remote gallery runner cache behavior:
  - `scripts/generate-gallery-remote.mjs` now allows cache by default.
  - optional bypass via `GALLERY_SKIP_CACHE=1`.
  - this supports expected behavior: existing scenarios can return blob-cache hits; new/changed params generate new blobs.
- Validation completed after changes:
  - `npm run typecheck` passes.
  - targeted unit suite passes:
    - `tests/unit/share-links-url-params-build.spec.ts`
    - `tests/unit/share-links-url-params-full.spec.ts`
    - `tests/unit/share-links-roundtrip.spec.ts`
    - `tests/unit/netlify-qr-helpers.spec.ts`
    - `tests/unit/animation-core.spec.ts`
  - targeted Playwright checks pass:
    - `tests/advanced/animation.spec.ts` full file (`35 passed`)
    - targeted new UI blocks (`Animation Target`, `Animation Secondary Pattern`) (`2 passed`)
  - `npm run test:i18n` and `npm run test:testid` pass.

## Latest Update (2026-02-21)

- Fixed artwork GIF regression in API path (`netlify/functions/qr.ts`):
  - for animated artwork overlays, QR-Art is now regenerated from each source GIF frame (`generateArtworkCanvas(overlayFrame.canvas, i)`), restoring true artwork motion.
  - stacked animation effects remain composited after QR-Art generation, so effect layers are not baked into QR-Art matrix generation.
  - added per-frame QR-Art fallback logging for robustness (`[ARTWORK] frame render fallback`).
- Fixed stacked-effect no-op behavior in animated overlay/frame pipeline (`netlify/functions/qr.ts`):
  - `reverse` and `bounce` now modify pattern progress in `applyPatternToFrameServer(...)`.
  - `tempDither` now applies per-frame temporal noise in server GIF animation (`calculateTemporalOffsetServer`, `applyTemporalNoiseToCanvasServer`).
  - `interp` (`crossfade`/`morph`) now interpolates overlay inputs between consecutive frames (safe path, pre-QR render), instead of being silently ignored.
  - widened `hasOverlayAnimationEffect` detection so artwork compositing includes interpolation/temporal-dither-only effect stacks.
- Fixed browser gallery artifact format/dimension mismatch (`scripts/generate-gallery-browser.mjs`):
  - browser artifacts now use `scenarioFilename(config)` extension (GIF scenarios save as `.gif`).
  - GIF scenarios are captured as multi-frame browser-canvas sequences and encoded to animated GIF (not static PNG snapshots).
  - browser artifacts are normalized to scenario target dimensions (`w/h`) before saving, avoiding preview-scale outputs like `980x980`.
  - verified with `nooverlay__visual-motion-1--95`: browser now outputs `nooverlay__visual-motion-1.gif` at `294x294` and decode passes.
- Fixed GIF animation artifacting in API overlay path:
  - hardened GIF frame composition in `parseGifFramesServer()` with deterministic canvas clearing and patch-canvas reuse.
  - reduced over-aggressive effect blending in animated overlay effects (`0.55 -> 0.35` for non-artwork overlays).
  - disabled rendered-frame interpolation for animated overlay source GIFs (prevents random/glitch-looking injected frames).
- Verified targeted fixes:
  - `artwork__art-dance-stack-shimmer-crossfade-temporal--748` now passes in targeted local render (`15.1s`, GIF `192.1 KB`).
  - regenerated artifact `reports/gallery-artifacts/local/artwork__art-dance-stack-shimmer-crossfade-temporal.gif` shows frame-to-frame subject motion restored.
  - frame uniqueness check confirms motion across all frames (`20/20` unique full-frame hashes and `20/20` unique center-region hashes).
- Execution control:
  - stopped active local/browser/remote full-gallery runs while applying fixes, per user request.
  - pending explicit user go-ahead before starting validation runs and deploy.

## User Requests

1. Read `gallery-idea.md` and fix `make gallery:local` output issues:
- QR codes look the same
- some outputs have no QR code
- animated GIF outputs are not actually animated

2. Treat `gallery-idea.md` as new/untrusted:
- app/api path has not been tested either

3. Consider possible fundamental regressions in rendering libraries:
- tests passed in the past
- recent API rendering work may have introduced regressions

4. Read project status docs:
- `knowledge.md`
- `tbd.md`

5. Rework `Makefile` organization (suggested sections):
- Meta/help
- Globals/exports
- Discovery/tool checks
- Pipeline entries
- Setup/housekeeping
- Web
- Quality
- Testing
- Assets
- Gallery
- i18n
- Deploy/validation
- Android
- Reports/misc

6. Keep an ongoing progress record in `codex.md`.

7. Clear `reports/gallery-artifacts` and start fresh.

8. Focus on local gallery generation first and keep `codex.md` up to date.

9. Investigate visual quality issue:
- nooverlay default looks non-crisp / resampled.

10. User follow-up:
- artwork output quality is unacceptable
- use existing QR-Art script and test on `public/trump.png`

11. Investigate QR-Art regression history:
- compare behavior around Feb 7 commits where output looked better.

12. Read analyzer snapshot file:
- `/home/user/Downloads/qr-analysis-1771595197804.json`

13. Correct QR-Art payload semantics:
- Base payload is `https://whitehouse.gov`
- QR-Art appends `#<numeric suffix>` in mixed mode (do not pre-supply full `#...` payload for this flow)

14. Ensure local/API artwork actually works again:
- `artwork__art-trump-dots-circle.png` should render correctly
- animated GIF artwork should stay animated

15. Expand permutations consistently across categories:
- include full animation option families (wave/shimmer/etc, color-cycle, bounce/reverse, interpolation, temporal dither, easing, seed)
- include watermark/gradient/finder-eye showcases
- keep options real (avoid no-op values)

16. Fix frame behavior and typography:
- framed QR should stay centered when text is present
- frame text should be cleaner, larger, sans-serif

17. New critical bug report:
- animated overlays with animation effects (`animPattern`, `interp`, `colorCycle`) only apply effect on first frame / output behavior appears wrong

18. Confirm there is a deterministic mapping from encoding request options to output filename for gallery page generation.

19. Deferred defect report to track (do not fix yet):
- `overlay__ditherKind-ordered_clustered.png` and similar dither variants (e.g. `overlay__diffKernel-sierra.png`) show inconsistent vertical dither scale, with visually larger modules toward the top vs bottom.

20. Deferred defect report to track (do not fix yet):
- combo-animation overlays (example: `overlay__ov-x-anim-king-subpixel-pulse.gif`) show glitchy/unstable frame behavior.

21. Additional feedback to track (do not interrupt baseline):
- artwork on `logo` does not look good
- exclude `logo` from artwork set (apply after baseline is complete)

22. Baseline execution preference update:
- use Netlify-max timeout for long-running artwork scenarios (`15 minutes`)
- for local rendering, use high parallelism (resources are available)

23. Additional feedback to track for future artwork curation:
- `king.gif` artwork does not look good
- exclude `king.gif` from future artwork showcase set (same as `logo`)

24. Similarity-analysis guardrail:
- exclude user-reported glitched GIFs from current similarity decisions
- after glitch fix, re-render and run a second similarity pass including fixed GIFs

25. Additional glitch exclusion feedback:
- include other known glitchy GIF families in exclusions (not only artwork king range)

26. Similarity strictness adjustment:
- keep the full set ambition (1000 images)
- if needed, relax similarity strictness (do not over-prune)

## Progress

- [x] Inspected current `gallery-idea.md` and new gallery scripts.
- [x] Confirmed current local artifact issues quantitatively:
  - 333 files total in `reports/gallery-artifacts/local`
  - 148 unique payload hashes (high duplication)
  - 78 `.gif` files that are actually PNG payloads
- [x] Ran targeted regression tests for renderer/API pipeline:
  - `tests/unit/qr-generator-render-modes-full.spec.ts`
  - `tests/unit/qr-generator-dithered-scan-gate.spec.ts`
  - `tests/unit/qr-art-integration.spec.ts`
  - `tests/unit/netlify-qr-function.spec.ts`
  - `tests/unit/netlify-qr-function-error.spec.ts`
  - Result: 5/5 files passed, 111/111 tests passed
- [x] Rewrote `scripts/generate-gallery-local.mjs` to use in-process Netlify handler (`netlify/functions/qr.ts`) with local fixture data-URL resolution and cache bypass.
- [x] Validated rewritten local generator on a non-overlay subset (12/12 pass).
- [x] Reworked local fixture loading to use dev-only `file://` overlays (no in-process HTTP asset server contention).
- [x] Added dev-only local file overlay support in `netlify/functions/qr.ts` (guarded by `NETLIFY_DEV` + `ANQR_LOCAL_OVERLAY_ROOT`).
- [x] Validated previously broken animated overlay case:
  - `overlay__ditherKind-anim-screened_blue_noise-king` now renders 61-frame GIF (was previously 1 frame on timeout fallback).
- [x] Read `knowledge.md` and `tbd.md` for current project status context.
- [x] Reorganized top-level Makefile help into requested 14-group section order.
- [x] Added Makefile aliases for pipeline/discovery usability: `ci`, `smoke`, `release`, `test:full`, `gallery:api`.
- [x] Cleared `reports/gallery-artifacts` and restarted local generation runs from clean state.
- [x] Fixed nooverlay decode failures in permutation set:
  - adjusted risky palette preset
  - hardened failing power combo (`power-4`)
- [x] Reworked local visual baseline for crisp QR output:
  - removed rotated modules (`dotRot=0`)
  - aligned default output geometry (`w=294`, `h=294`, `modulePx=6`)
  - set global `gap=0` for clean base modules
- [x] Revalidated local nooverlay category end-to-end:
  - `334/334` pass, `0` fail
- [x] Stabilized overlay permutation set:
  - removed/adjusted repeatedly failing families (`mode=dither` cross sweep, unstable payload+mode combinations, unsafe preservation combos)
  - added scanner-safe mode defaults consistently to cross/sweep blocks
  - removed clone-padding for overlay by adding unique filler set (no `overlay__pad-*` clones)
- [x] Overlay full local run revalidated:
  - `333/333` pass, `0` fail
- [x] Artwork combo failures fixed (`combo5` static fixtures) and revalidated.
- [x] Artwork full local run revalidated:
  - `333/333` pass, `0` fail
- [x] Ran dedicated QR-Art pipeline script on `public/trump.png`:
  - command: `node --import tsx scripts/run-qr-art.ts public/trump.png reports/gallery-artifacts/local/qr-art-trump.png`
  - result: success, version `6`, mask `7`, match `63.2%` (`874/1383`)
  - output files:
    - `reports/gallery-artifacts/local/qr-art-trump.png`
    - `reports/gallery-artifacts/local/qr-art-trump-hires.png`
  - decode check passed against generated output.
- [x] Extended `scripts/run-qr-art.ts` for reproducible regression testing:
  - added CLI args for `data`, `suffixMode`, `strictSuffix`, `ecc`, `autoSuffix`, `suffix`.
- [x] Reproduced mixed-mode long URL generation (`version=6`, `ecc=L`) and confirmed long payload output:
  - decoded length `289`, suffix length `271`.
- [x] Reproduced the Feb 7-style case with explicit payload components:
  - `trump.png`, `version=9`, `ecc=L`, numeric suffix length `490`.
  - current output decodes but visual quality is poor (bottom-heavy, weak facial structure).
- [x] Parsed `/home/user/Downloads/qr-analysis-1771595197804.json`:
  - payload length `513`
  - version `9`, ECC `L`, mask `4`
  - analyzer reports `encodingMode: byte`, `byteSegmentCount: 1`, `totalByteLength: 23` (inconsistent with payload length).
- [x] Re-ran current QR-Art with corrected semantics (base payload only, mixed mode auto-appended suffix):
  - command:
    - `node --import tsx scripts/run-qr-art.ts public/trump.png reports/gallery-artifacts/local/qr-art-trump-v9-whitehouse-autosuffix-current.png 9 100 "https://whitehouse.gov" numeric 1 L 1`
  - decode verification:
    - total length `513`
    - prefix `https://whitehouse.gov#...`
    - suffix length `490`
  - visual result remains degraded (same bottom-heavy pattern), confirming regression is not caused by payload input format.
- [x] Isolated and fixed root-cause regression in QR-Art target mapping:
  - file: `src/modules/qr-art/image-utils.ts`
  - issue:
    - `mapImageToTargetsSupersampled()` treated `@napi-rs/canvas` canvases as `ImageData-like` because canvases expose a `data()` method.
    - this produced invalid `ImageData` (empty/invalid pixel buffer), collapsing targets to effectively all-light and destroying artwork fidelity.
  - fix:
    - detect canvas-like inputs first (`getContext` + width/height)
    - tighten ImageData-like guard to reject function-valued `data` and require array-like pixel data length.
- [x] Regression test added:
  - `tests/unit/qr-art-image-utils.spec.ts`
  - validates canvas inputs do not collapse to all-light/all-dark target maps.
- [x] Post-fix validation with corrected payload semantics:
  - command:
    - `node --import tsx scripts/run-qr-art.ts public/trump.png reports/gallery-artifacts/local/qr-art-trump-v9-whitehouse-autosuffix-current-fixed.png 9 100 "https://whitehouse.gov" numeric 1 L 1`
  - result:
    - version `9`, ECC `L`, mask `4`
    - match `84.7%` (`1978/2336`)
    - output visually matches expected Feb 7 style (face rendered across full QR, not bottom-heavy)
    - decode check passes with length `513` and suffix length `490`.
- [x] Confirmed API/local artwork path regression:
  - Netlify renderer was not invoking full QR-Art RS-basis generation for `mode=artwork`.
  - This caused low-fidelity/static-looking outputs even when browser path looked better.
- [x] Patched `netlify/functions/qr.ts` to run full QR-Art in API path:
  - static artwork: uses `generateFullQArtOptimal`/`generateFullQArt` + `renderFromMatrix`.
  - animated artwork overlays: renders each frame with QR-Art and preserves source frame delays.
  - locks mask/version from frame 0 for animation consistency (browser-aligned behavior).
- [x] Revalidated key user-reported failures:
  - `artwork__art-trump-dots-circle.png` now passes and renders with expected artwork.
  - `artwork__art-dance-default.gif` is animated with unique per-frame content (60 unique frames).
- [x] Expanded permutation coverage consistency in `scripts/lib/gallery-permutations.mjs`:
  - fixed easing token values to supported names (`ease_in`, `ease_out`, `ease_in_out`).
  - overlay category now explicitly includes:
    - full anim pattern family (`pulse/wave/scanline/shimmer/drift`)
    - easing/interp/temp-dither/bounce/reverse/colorCycle/animSeed
    - watermark kind/blend/opacity variants
    - finder/eye style showcases
  - artwork category now includes:
    - watermark text/pattern variants
    - animation option showcase flags (colorCycle, bounce, reverse, interp, tempDither, easing)
    - drift pattern coverage on animated fixtures
- [x] Added API support for `wmBlend=soft-light` to avoid no-op permutations.
- [x] Verified `wmBlend=soft-light` is active (not no-op):
  - `overlay__wmBlend-normal.png` and `overlay__wmBlend-soft-light.png` now produce different output hashes.
- [x] Fixed frame layout + typography quality:
  - centered QR content in framed renders (`qr-generator-class` + `scaled-render`) by applying symmetric frame margin offsets.
  - improved frame text rendering in `drawing-frames.ts`:
    - larger size
    - clean sans-serif stack
    - width-fit sizing loop for better readability.
- [x] Revalidated framed case from user:
  - `artwork__art-tsunami-frame-sticker.png` now shows centered QR with larger, cleaner `ANQR` text.
- [x] Regression tests after API/frame/permutation updates:
  - `npm run -s test:unit -- tests/unit/netlify-qr-function.spec.ts tests/unit/netlify-qr-gif-disposal.spec.ts`
  - result: 2 files passed, 19 tests passed.
- [x] Fixed animated-overlay + animation-effects regression in API renderer:
  - file: `netlify/functions/qr.ts`
  - animated overlay loop now applies animation effects per frame (not single-frame carryover):
    - `applyPatternToFrameServer(...)`
    - `colorCycle` overlay
    - `crossfade` / `morph` interpolation against previous rendered frame
  - each frame now receives frame-aware config (`frameIndex`, `animationFrames`).
- [x] Revalidated animated-overlay effects with targeted local API-handler runs:
  - generated:
    - `overlay__mode-blend-anim-dance.gif` (baseline)
    - `overlay__animHero-dance-shimmer-crossfade.gif`
    - `overlay__ov-x-anim-dance-shimmer-morph.gif`
  - all decode-pass, all are true 60-frame GIFs with 60 unique frame hashes.
  - frame-wise hash comparison vs baseline differs on `60/60` frames for both effect variants.
- [x] Re-ran Netlify QR unit tests after regression fix:
  - `npm run -s test:unit -- tests/unit/netlify-qr-function.spec.ts tests/unit/netlify-qr-gif-disposal.spec.ts`
  - result: 2 files passed, 20 tests passed.
- [x] Added explicit regression test for this bug:
  - file: `tests/unit/netlify-qr-function.spec.ts`
  - test: `applies animation effects across all frames for animated overlays`
  - uses local animated fixture (`public/dance.gif`) via dev-only file URL path to avoid network flake.
  - validates:
    - base/effects both remain multi-frame animated GIFs
    - per-frame hashes differ from baseline across nearly all frames (allowing frame 0 equality).
- [x] Confirmed filename ↔ request-option mapping path for gallery generation:
  - canonical options source: `generateAllScenarios()` (`scripts/lib/gallery-permutations.mjs`)
  - canonical filename derivation: `scenarioFilename(config)` (`scripts/lib/gallery-permutations.mjs`)
  - canonical URL query serialization: `buildUrlParams(config)` (`scripts/lib/gallery-permutations.mjs`)
  - run outputs preserve mapping key via `report.json` entries (`id`, `filename`) in each generator mode (`local`, `browser`, `remote`).
- [x] Logged deferred dither defect from visual review:
  - affected examples:
    - `overlay__ditherKind-ordered_clustered.png`
    - `overlay__diffKernel-sierra.png`
  - symptom:
    - vertical inconsistency in dither/module appearance (top appears larger/heavier than bottom).
  - status: tracked only for now (no fix yet per request).
- [x] Logged additional deferred combo-animation glitch defect:
  - affected example:
    - `overlay__ov-x-anim-king-subpixel-pulse.gif`
  - symptom:
    - glitchy visual output in combo animation overlays (frame instability/artifacting).
  - status: tracked only for now (no fix yet per request).
- [x] Began fresh sharded local baseline run (post-expansion) to avoid full-batch timeout storms:
  - `nooverlay`: `334/334` pass, `0` fail (`/tmp/gallery-local-nooverlay-full.log`)
  - `overlay`: `308/333` pass, `25` fail (`/tmp/gallery-local-overlay-full.log`)
  - `artwork-static` (trump/logo/test/tsunami): `180/180` pass, `0` fail (`/tmp/gallery-local-artwork-static.log`)
- [x] Started `artwork-animated` baseline shard with higher parallelism per feedback:
  - `153` configs, `GALLERY_CONCURRENCY=12`, timeout `240000ms`
  - log: `/tmp/gallery-local-artwork-animated.log`
- [x] Adjusted animated-artwork baseline run policy to match latest feedback:
  - terminated the in-flight `240000ms` run
  - restarted with Netlify-max timeout and high local parallelism:
    - `GALLERY_CONCURRENCY=20`
    - `GALLERY_SCENARIO_TIMEOUT_MS=900000` (`15 minutes`)
- [x] Completed animated artwork baseline via process-sharded local execution (single-id workers):
  - scope: all `153` animated artwork IDs (`king` + `dance`)
  - result: `123` pass / `30` fail
  - artifacts:
    - `/tmp/gallery-artwork-animated-sharded.status`
    - `/tmp/gallery-artwork-animated-sharded-logs/*`
    - `reports/gallery-artifacts/local/report-artwork-animated.json`
    - `reports/gallery-artifacts/local/passed-artwork-animated.txt`
    - `reports/gallery-artifacts/local/failed-artwork-animated.txt`
- [x] Consolidated full local baseline report across shards:
  - output:
    - `reports/gallery-artifacts/local/report-baseline-local.json`
    - `reports/gallery-artifacts/local/passed-baseline-local.txt`
    - `reports/gallery-artifacts/local/failed-baseline-local.txt`
  - totals:
    - overall: `1000` total, `945` pass, `55` fail
    - nooverlay: `334/334` pass
    - overlay: `308/333` pass
    - artwork: `303/333` pass
- [x] Expanded similarity exclusion list to include all user-reported glitch families:
  - file: `reports/gallery-artifacts/local/excluded-similarity-glitch.txt`
  - exclusions now include:
    - artwork king animated glitch range (`scanline`→`style-rounded`)
    - `overlay__animHero-king-*`
    - `overlay__ov-x-anim-king-*`
  - total explicit glitch exclusions: `32`
- [x] Re-ran filtered similarity analysis with expanded exclusions:
  - input dir: `reports/gallery-artifacts/local-sim-input`
  - analyzed: `938` baseline-pass artifacts
  - output:
    - `reports/gallery-artifacts/local-sim-input/visual-similarity-report.json`
    - `reports/gallery-artifacts/local-sim-input/visual-similarity-report.md`
- [x] Generated first-pass uniqueness decision artifact for hero curation:
  - outputs:
    - `reports/gallery-artifacts/local/visual-uniqueness-plan.json`
    - `reports/gallery-artifacts/local/visual-uniqueness-plan.md`
  - policy baked in:
    - exclude failed artifacts
    - exclude explicit glitch list
    - exclude artwork `logo` + `king` fixtures for future showcase
  - selected unique candidates: `127`
- [x] Relaxed similarity strictness and regenerated decision artifacts:
  - reran similarity with `GALLERY_VIS_THRESHOLD_BITS=1` (near-duplicate warning mode).
  - selected unique candidates increased to `432` (vs `127` strict pass).
- [x] Fixed animation-on-animation glitch root cause in API renderer:
  - file: `netlify/functions/qr.ts`
  - changes:
    - interpolation now uses previous **raw** frame (not recursively interpolated output).
    - animated `animPattern`/`colorCycle` are now applied to overlay input frames **before** QR render, not by post-distorting final QR frames.
- [x] Revalidated previously glitched overlay king combo families:
  - targeted retest IDs:
    - `overlay__animHero-king-*`
    - `overlay__ov-x-anim-king-*`
  - result: `14/14` pass after fix (was heavily failing before).
- [x] Revalidated artwork king animated glitch range:
  - targeted retest IDs: `artwork__art-king-anim-scanline` → `artwork__art-king-anim-style-rounded` (18 IDs)
  - result: `18/18` pass after fix.
- [x] Updated merged baseline with glitch-fix retest outcomes:
  - baseline now: `970` pass / `30` fail (from prior `945`/`55`)
  - category breakdown:
    - nooverlay: `334/334` pass
    - overlay: `320/333` pass
    - artwork: `316/333` pass
- [x] Ran second similarity pass including repaired GIF families:
  - no explicit glitch exclusions applied
  - input: `970` pass artifacts
  - threshold: `<=1` bit (relaxed strictness mode)
  - summary: `970 files`, `152 clusters`, `415 standalone`
  - updated artifacts:
    - `reports/gallery-artifacts/local-sim-input/visual-similarity-report.json`
    - `reports/gallery-artifacts/local-sim-input/visual-similarity-report.md`
    - `reports/gallery-artifacts/local/visual-uniqueness-plan.json`
    - `reports/gallery-artifacts/local/visual-uniqueness-plan.md`
- [x] Added a visual-similarity clustering tool for hero-gallery curation:
  - file: `scripts/analyze-gallery-visual-similarity.mjs`
  - outputs:
    - `reports/gallery-artifacts/local/visual-similarity-report.json`
    - `reports/gallery-artifacts/local/visual-similarity-report.md`
- [x] Finalized baseline retest merge:
  - current baseline:
    - overall: `999/1000` pass, `1` fail
    - nooverlay: `334/334` pass
    - overlay: `332/333` pass
    - artwork: `333/333` pass
  - only remaining fail:
    - `overlay__ditherKind-ordered_clustered.png` (`DECODE_FAILED`)
  - artifacts updated:
    - `reports/gallery-artifacts/local/report-baseline-local.json`
    - `reports/gallery-artifacts/local/passed-baseline-local.txt`
    - `reports/gallery-artifacts/local/failed-baseline-local.txt`
- [x] Regenerated similarity/uniqueness planning from latest pass set:
  - similarity input: `999` pass artifacts
  - output:
    - `reports/gallery-artifacts/local-sim-input/visual-similarity-report.json`
    - `reports/gallery-artifacts/local-sim-input/visual-similarity-report.md`
    - `reports/gallery-artifacts/local/visual-uniqueness-plan.json`
    - `reports/gallery-artifacts/local/visual-uniqueness-plan.md`
  - uniqueness totals:
    - selected: `459`
    - dropped: `441`
    - excluded by policy/fail: `223`
- [x] Prepared explicit filename/params mapping manifests for gallery curation and page wiring:
  - full matrix mapping (`1000` entries):
    - `reports/gallery-artifacts/local/gallery-filename-param-manifest.json`
  - selected candidate mapping (`459` entries):
    - `reports/gallery-artifacts/local/gallery-selected-filename-param-manifest.json`
  - matrix summary:
    - `reports/gallery-artifacts/local/gallery-candidate-summary.json`
  - selected summary:
    - `reports/gallery-artifacts/local/gallery-selected-candidate-summary.json`
- [x] Started fresh full local render after candidate confirmation:
  - command profile:
    - `ANQR_LOG_LEVEL=error`
    - `GALLERY_CONCURRENCY=20`
    - `GALLERY_SCENARIO_TIMEOUT_MS=900000`
  - aborted by user request to update `dance.gif` before completion.
  - progress at stop:
    - last completed index in log: `434/1000`
    - known fail observed during run before stop: `overlay__ditherKind-ordered_clustered.png` (`DECODE_FAILED`)
  - log preserved:
    - `/tmp/gallery-local-full.log`
- [x] Investigated user-reported nooverlay visual redundancy:
  - confirmed root causes:
    - `25` clone-padded nooverlay scenarios (`pad-*`) from `trimOrPad(...)`.
    - large low-visual/no-op groups (encoding/auto/gif-encoder sweeps) causing near-identical outputs.
  - baseline nooverlay similarity snapshot (before fix, threshold `<=1`):
    - `333` files, `47` clusters, `126` standalone, `207` clustered.
- [x] Refactored nooverlay permutation matrix for uniqueness and scan safety:
  - file: `scripts/lib/gallery-permutations.mjs`
  - key changes:
    - removed nooverlay clone-padding path; now throws if unique pool < target.
    - removed low-impact/no-op families from nooverlay curation (payload/enc/ec/auto/gif-encoder-only style toggles).
    - upgraded animation sweeps to include stronger geometric/gradient variation.
    - added curated nooverlay filler generator (high-visual static + animated combos) to reach target without duplicates.
    - tuned filler to scan-safe settings (`gapMode=inset` for filler regime, contrast guard).
    - replaced risky anim-flag expansion with curated scan-safe anim-flag showcase set.
- [x] Revalidated nooverlay after refactor (clean run):
  - command:
    - `ANQR_LOG_LEVEL=error GALLERY_CATEGORY=nooverlay GALLERY_CONCURRENCY=20 GALLERY_SCENARIO_TIMEOUT_MS=900000 node --import tsx scripts/generate-gallery-local.mjs`
  - result:
    - `334/334` pass, `0` fail.
  - artifacts:
    - `reports/gallery-artifacts/local/report.json`
    - `reports/gallery-artifacts/local/passed.txt`
    - `reports/gallery-artifacts/local/failed.txt`
- [x] Re-ran nooverlay similarity on clean output:
  - command:
    - `GALLERY_VIS_DIR=reports/gallery-artifacts/local GALLERY_VIS_THRESHOLD_BITS=1 node --import tsx scripts/analyze-gallery-visual-similarity.mjs`
  - latest summary:
    - `334` files, `40` clusters, `185` standalone, `149` clustered.
  - improvement vs pre-fix snapshot:
    - standalone: `126 -> 185` (`+59`)
    - clustered: `207 -> 149` (`-58`)
    - clusters: `47 -> 40` (`-7`)
- [x] Enforced artwork fixture exclusions in matrix generation:
  - `king.gif` and `logo.png` are excluded from `artwork` generation.
  - verified: `artwork=333`, no `art-*king*`/`art-*logo*` IDs.
- [x] Reworked overlay showcase to prioritize animated hero fixtures (`king.gif` + `dance.gif`):
  - added stacked animation+dither showcase families:
    - `animStack-*`
    - `hero-dither-*`
    - `hero-stack-*`
  - expanded animated dither coverage across both hero fixtures.
  - reworked animation option sweeps to run on animated fixtures (not static placeholders).
  - removed fallback dependence by ensuring curated layer coverage reaches 333 (no overlay filler IDs selected).
- [x] Removed known unstable `ordered_clustered` dither kind from overlay dither sweeps to avoid inherited decode failures.
- [x] Reworked artwork curation for visual impact + motion:
  - added explicit stacked animation families for animated artwork:
    - `art-dance-stack-*`
  - introduced visual-impact ranking for artwork selection to deprioritize near-duplicate low-impact variants.
  - added must-include rules to guarantee stacked dance animation showcases are in the selected 333.
  - hardened `art-*-extra-static-b` configuration to reduce decode risk.
- [x] Post-change scenario sanity checks:
  - combined matrix: `1000` total (`333 nooverlay + 333 overlay + 333 artwork + bonus`)
  - overlay fixture distribution: `king=73`, `dance=71` (`144/333` hero-heavy showcase)
  - rich king/dance animated+dither combos: `86`
  - artwork fixture distribution: `trump=79`, `dance=104`, `test=76`, `tsunami=74`
  - artwork stacked animation entries present: `4` (`art-dance-stack-*`)
- [ ] Run penultimate full local render from clean artifacts with updated matrix.
- [ ] Run quality/suitability review on penultimate output (decode/failures + similarity/readability spot checks).
- [ ] Run final full local render from clean artifacts after penultimate review.
- [ ] Reorganize `Makefile` internals further (if needed) while preserving behavior.

## Notes / Findings

- The previous local script used a manual param mapper with multiple divergence points from app/API behavior.
- A major concrete bug in old local script path resolution: `path.join(PUBLIC_DIR, '/foo')` resolves to `/foo` (absolute), causing local overlay fixture lookup failures.
- Data-URL overlay approach was rejected by Netlify handler (`fetchImageWithBuffer` originally `http/https` only).
- In-process localhost asset serving caused event-loop starvation under concurrency and sporadic fetch timeouts (`ok:false`), leading to missing overlays and 1-frame fallback GIFs.
- Dev-only `file://` overlay support resolved that class of local regression.
- Local sandbox limitation discovered: `tsx` CLI IPC pipe path (`/tmp/tsx-1000/*.pipe`) fails with EPERM in this environment; execution works via `node --import tsx ...`.
- `knowledge.md` indicates the stable production gallery pipeline is still centered on `scripts/generate-gallery.mjs`; `gallery-idea.md` additions are new and not yet proven.
- Current nooverlay uniqueness is still insufficient:
  - `334` artifacts generated
  - `204` unique hashes
  - indicates many functionally-equivalent scenarios
- Key-diff check against `src/modules/share-links/url-params.ts`:
  - all current permutation parameter keys are recognized (no unknown URL keys)
  - duplication is driven by scenario design/no-op combinations and pad-cloning, not unknown param names.
- Overlay clone-padding issue addressed by unique filler generation; no overlay `pad-*` outputs remain in current set.
- Nooverlay still relies on `trimOrPad()` and still has many `pad-*` clones; uniqueness cleanup there is still pending.
- QR-Art history review findings so far:
  - `33844b3` forced byte-only QArt behavior and removed static phone-safety cap.
  - `9c2ecb7` introduced mixed-mode numeric suffix logic and numeric-safe bit ranges.
  - `b59cc40` changed default `targetControlPercent` from `50` to `100`, added `lockVersionToMinimum` behavior, and changed control-target selection logic.
  - Current code can generate the long payload but image fidelity is significantly worse than the Feb 7 reference image.
- Analyzer snapshot likely confirms a mode/segment mismatch symptom:
  - decoded payload is long URL, but structural metadata reports byte-mode single segment and only 23 decoded bytes.
- Full artwork batch run with new API QR-Art path was started and healthy (all passing in-flight),
  then intentionally interrupted to apply expanded permutation coverage changes.
- Existing framed rendering previously allocated extra canvas area without offsetting QR origin,
  which made framed QRs appear top-left biased when frame text was present.
- Netlify Blobs env is intentionally absent in local tests, so blob cache read/write warnings are expected noise in unit-test stderr but do not fail tests.

## Next Actions

1. Execute penultimate full local gallery render on the updated matrix (`1000` scenarios).
2. Run quality/suitability pass on penultimate output:
   - decode/failure summary
   - visual-similarity cluster review
   - scanability spot checks of stacked animated+dither hero sets.
3. Apply any final small matrix tuning only if penultimate review shows regressions.
4. Execute final full local gallery render from clean artifacts.
5. After local final is stable, run browser/API parity renders and compare outputs/manifests.

## Update 2026-02-21 (Parity Hardening)

- [x] Stopped all in-flight gallery generators to prepare for a clean restart window.
- [x] Hardened parity behavior across generators:
  - `scripts/generate-gallery-local.mjs`
  - `scripts/generate-gallery-browser.mjs`
  - `scripts/generate-gallery-remote.mjs`
- [x] Added strict overlay render flag on all generator requests:
  - `?_fullRender=1&_strictOverlay=1`
  - prevents silent degraded output from being treated as success when overlay fetch/decode fails.
- [x] Added animated-output verification for animated scenarios in all three generators:
  - decode now fails with `ANIMATION_MISSING` / `ANIMATION_PARSE_ERROR` if GIF output is not truly animated.
- [x] Added per-scenario stale artifact cleanup in all three generators before rendering:
  - removes old `png/gif/webp/jpg/jpeg/svg` for the scenario basename to avoid stale carry-over masking failures.
- [x] Increased server-side overlay fetch timeout configurability in `netlify/functions/qr.ts`:
  - `ANQR_OVERLAY_FETCH_TIMEOUT_MS` (default now `60000` ms; was `10000` ms).
- [x] Added `_strictOverlay` to non-cache params in `netlify/functions/qr.ts` cache-key normalization.
- [x] Set default gallery timeout in `Makefile` to 15 minutes:
  - `GALLERY_SCENARIO_TIMEOUT_MS ?= 900000`
- [x] Confirmed local/browser parity on targeted sample (7/7) before final stop:
  - byte-for-byte identical hashes for all sampled outputs.
- [ ] Await user signal after Netlify Blob cache clear, then run fresh clean local/browser/remote comparison pass.

## Update 2026-02-21 (Remote Run Stability Rule)

- [x] Captured operational rule for gallery parity runs:
  - In this Codex runtime, long remote gallery generation against `https://anqr.link/api/qr` can show intermittent DNS `ENOTFOUND` when run inside sandbox networking.
  - Stable workaround: run `scripts/generate-gallery-remote.mjs` with escalated permissions (outside sandbox) for production remote runs.
  - Do **not** interrupt local/browser runs while recovering remote; restart remote clean and continue all three to completion.
- [x] Added richer remote fetch error diagnostics (`cause.code` / `cause.message`) in `scripts/generate-gallery-remote.mjs` for faster root-cause detection.
- [x] Confirmed remote resumed successfully after escalation and is progressing with zero failures in current run.

## Update 2026-02-21 (Runs Stopped By User)

- [x] Stopped all active gallery generation processes immediately on request.
- Progress snapshot at stop:
  - local: [820/1000], fails=8
  - browser: [828/1000], fails=8
  - remote: [430/1000], fails=3

## Update 2026-02-22 (GIF Corruption Verification)

- [x] Re-verified the previously reported broken GIF combos directly against current `netlify/functions/qr.ts` handler with explicit params:
  - `overlay__ov-x-anim-king-dithered-shimmer`
  - `overlay__ov-x-anim-dance-wave-wave`
  - `overlay__ov-x-anim-king-dithered-wave`
- [x] Current renderer output for those combos is now healthy:
  - no all-white frames (`blank_frames=0`)
  - full frame uniqueness restored (`61/61` for king dithered variants, `20/20` for dance wave/wave)
- [x] Root cause confirmation:
  - old failures in `reports/gallery-artifacts/local` were stale pre-fix artifacts, not evidence of current encoder regression.
  - stale files had signatures like `blank_frames=23` and lower frame uniqueness (e.g. `32/61`).
- [x] Replaced stale local artifacts with fresh renders for the affected filenames.
- [x] Added repeatable integrity check rule:
  - run `convert <gif> -coalesce -format '%k %[mean] %[standard-deviation]\n' info:` and flag frames where `k==1 && mean>65400 && stddev<1` as blank-frame corruption.
  - after replacement, local scan result: `FILES_WITH_BLANK_FRAMES=0`.

## Update 2026-02-22 (In-Run Feedback Findings; Apply Changes After Run)

- [x] User feedback captured during run:
  - `artwork__art-dance-stack-target-modules-wave-x-result-wave-y.gif` appears to still encode animation effects into QR modules.
  - too much static `trump` artwork in current selection.
  - GIF corruption/noise reports on:
    - `artwork__art-dance-anim-tempDither-blue_noise.gif`
    - `artwork__art-dance-anim-easing-bounce.gif`
  - `easing` and `bounce` are not visually compelling and should be removed from permutations.
  - next iteration should run local-only with higher concurrency for faster isolation.
  - additionally required: explicit variety of mask patterns across non-overlay, overlay, and artwork.

- [x] Operational action taken immediately:
  - stopped browser + remote generators on request.
  - kept local generator running.

- [x] Quantitative diagnostics (current code, no permutation edits yet):
  - `artwork__art-dance-stack-target-modules-wave-x-result-wave-y`:
    - frame integrity: `20/20` unique frame hashes, `blank_frames=0`
    - scanability across frames: `1/20` decodable (`19/20` undecodable)
    - interpretation: this combo is structurally too aggressive for scan stability.
  - `artwork__art-dance-anim-tempDither-blue_noise`:
    - batch artifact observed with low variety / occasional blank-like behavior earlier.
    - isolated rerenders are variable but generally non-blank; frame decode remains weak.
    - representative decode sample: `7/20` decodable (isolated), `14/20` on one local artifact rewrite.
  - `artwork__art-dance-anim-easing-bounce`:
    - representative decode sample: `7/20` decodable (isolated), `12/20` on one local artifact.
    - visual utility low, consistent with user feedback.

- [x] Repro insight:
  - repeated isolated renders of the *same* scenario (`artwork__art-dance-anim-tempDither-blue_noise--763`) produce materially different frame-hash diversity (`unique` ranged `12..19` across four runs), even with same params.
  - this indicates nondeterministic behavior still exists in the artwork animation pipeline.
  - however, severe all-white-frame corruption was not reproduced in the isolated loop (`blank_frames=0` each run).

- [x] Artwork mix audit (current permutation output):
  - artwork total: `333`
  - fixture distribution:
    - `trump`: `80` (animated `0`, static `80`)
    - `dance`: `104` (animated `104`, static `0`)
    - `test`: `75` (static only)
    - `tsunami`: `74` (static only)
  - confirms user point: `trump` contributes substantial static-only volume.

- [x] Mask-pattern audit (current permutation output):
  - `mask` parameter is currently absent from all generated scenarios (`0/1000` set explicitly).
  - all runs therefore rely on implicit auto mask selection; no explicit mask sweep coverage exists.

- [x] Finder/timing/alignment dither visibility finding:
  - current overlay baseline applies structural preservation by default:
    - `keepFinders=1`
    - `keepTiming=1`
    - `keepAlign=1`
    - `protectFmt=1`
    - `protectVer=1`
  - this keeps those regions solid (typically black), which matches observed behavior where dither/module patterns are not visible there.
  - follow-up required: add explicit showcase variants that relax these protections (or use dither-preservation mode intentionally) to demonstrate dithered structural regions when desired.

- [ ] Post-run change plan (do not apply until current local run completes):
  - remove or sharply reduce `easing`/`bounce`-centric artwork animation variants.
  - reduce/disable `tempDither` use in artwork GIF permutations where scan stability regresses.
  - rebalance artwork toward stronger motion diversity without static-heavy `trump` dominance.
  - constrain/replace module-target stacks in artwork where decode-per-frame is extremely low.
  - add explicit mask-pattern variety for all categories (`nooverlay`, `overlay`, `artwork`).
  - run local-only high-concurrency validation pass first, then expand to browser/remote once stable.

## Update 2026-02-22 (Permutation Engine Correctness Pass)

- [x] Fixed `sweep(...)` index propagation bug:
  - `paramBuilder` now receives `(value, index)` so `pick(..., i)` logic works correctly.

- [x] Removed contradictory easing/bounce generation flow:
  - dropped explicit non-overlay `easing` sweep and `bounce` single-axis block.
  - dropped non-overlay `animPattern x easing` cross-product block.
  - removed `filterEasingBounceScenarios(...)` post-filter pass.
  - canonicalized params in `makeConfig(...)` with `sanitizeScenarioParams(...)` to strip unsupported animation keys (`easing`, `easing2`, `bounce`, `bounce2`) at construction time.

- [x] Hardened dedup semantics:
  - `dedup(...)` now uses a stable serializer (`stableStringify`) instead of raw `JSON.stringify`.
  - serializer now sorts object keys and ignores `undefined` properties.

- [x] Simplified low-impact filtering:
  - removed stale low-impact label pattern filtering block in non-overlay generation (patterns were not aligned with current labels and had no effective matches).

- [x] Reduced mutation side effects:
  - `assignPayloads(...)` remains immutable.
  - `applyMaskVariety(...)` remains immutable (works on cloned configs/params).
  - artwork payload normalization is now immutable (`map(...)`) instead of in-place mutation.

- [x] Sanity check after edits:
  - scenario counts: `333` non-overlay, `333` overlay, `333` artwork, `1000` total.
  - emitted `easing`/`bounce` params in final scenarios: `0`.
  - explicit mask assignments present across all categories (current total `32` per category).
  - no `undefined` values emitted in scenario params.

## Update 2026-02-22 (Review Follow-Up: Structural Consistency)

- [x] Validated parser health and syntax:
  - `node --check scripts/lib/gallery-permutations.mjs` passes.
  - confirmed no invalid spread/object forms such as `.combo.params`, `.base`, or `selected.push(....)` in current file.

- [x] Confirmed there is only one active implementation for each helper:
  - `sanitizeScenarioParams(...)` defined once.
  - `assignPayloads(...)` defined once (immutable form).
  - `stableStringify(...)` defined once.

- [x] Removed clone-padding risk path:
  - deleted `trimOrPad(...)`.
  - overlay generation now throws if unique configs are unexpectedly below `333`, then slices to `333`.

- [x] Preserved scenario ID provenance:
  - `generateAllScenarios()` no longer restamps IDs unconditionally.
  - restamp now happens only on actual ID collision (with `sourceId` preservation), which does not occur in normal generation.

- [x] Aligned extension derivation:
  - `scenarioFilename(...)` now uses `isScenarioAnimated(...)` (instead of raw `config.isAnimated`) for consistent `.gif/.png` behavior.

- [x] Reduced mode-policy ambiguity:
  - policy changed again per user direction: animated dithered outputs are enabled.
  - `'dithered'` restored in `ANIMATED_OVERLAY_MODES`.
  - overlay post-merge exclusion of animated dither/ditherKind scenarios removed.

- [x] Sanity checks after follow-up:
  - `generateOverlayScenarios()` still returns `333`.
  - `generateAllScenarios()` returns `1000` unique IDs.
  - filename extension mismatch count: `0`.
  - animated dithered overlay scenarios present: `50` (all `mode=dithered`).

## Update 2026-02-22 (Permutation Policy Correction)

- [x] Removed silent stripping of animation keys:
  - `sanitizeScenarioParams(...)` now only removes `undefined` values.
  - `easing`/`bounce` params are preserved again end-to-end.

- [x] Overlay allowlist/blocklist adjustment:
  - unblocked static overlay combinations:
    - `mode=dithered` with `trump`
    - `mode=blue-noise` with `trump`
    - `mode=blue-noise` with `tsunami`

- [x] `generateAllScenarios()` side-effect safety:
  - ID collision fallback now clones objects into a new `output` array instead of mutating source category objects in place.
  - verified no ID mutation side-effect when calling `generateAllScenarios()` after category generation.

- [x] Minor readability cleanup:
  - simplified non-overlay watermark-style cross-product from `['text','logo'].slice(0,1)` to explicit `['text']`.

- [x] Sanity checks after correction:
  - counts remain `333/333/333` and `1000` total.
  - preserved animation key presence in outputs:
    - nooverlay: `42` scenarios with easing/bounce keys
    - overlay: `76`
    - artwork: `20`
  - overlay static availability confirmed:
    - `overlay__mode-dithered-trump`
    - `overlay__mode-blue-noise-trump`
    - `overlay__mode-blue-noise-tsunami`

## Update 2026-02-22 06:23:50 UTC (Perf/Jank P0-P2 Pass)

- [x] `Analyze.tsx` matrix diagnostics moved behind explicit flag:
  - new gate: `VITE_ANALYZE_MATRIX_DIAGNOSTICS=1` (dev only).
  - default Analyze flow no longer runs regen-vs-original matrix diff work.

- [x] `Analyze.tsx` `sampleOriginalMatrix` fixed from per-cell readback to bulk read:
  - replaced `getImageData(x,y,1,1)` inside nested loops with single `getImageData(0,0,w,h)`.
  - sampling now indexes into one shared pixel buffer with bounds clamping.

- [x] `pixel-matrix-dithered.ts` high-allocation paths switched to typed-array working buffers:
  - added flat buffers for per-pixel work:
    - `matrixBits: Uint8Array`
    - `packedColors: Uint32Array`
    - `desire: Float32Array`
    - `errors: Float32Array` (error-diffusion path)
  - added helpers:
    - `pixelIndex(...)`
    - `packColor(...)` / `unpackColor(...)`
    - `bitsToMatrix(...)` / `packedColorsToMatrix(...)` (return-boundary conversion only)
  - updated hot functions to use flat indexing:
    - `generateBWFirstMatrix(...)`
    - `generateDitheredMatrix(...)`
    - `generateBlueNoiseMatrix(...)`
    - `distributeError(...)`
    - `enforceModuleConstraints(...)`
    - `removeIsolatedSpeckles(...)`
    - `computeQualityMetrics(...)`
  - result shape remains unchanged (`PixelDecisionMatrix` still returns 2D matrices).

- [x] `scaled-render.ts` preservation overlay path optimized:
  - precomputes boosted module list once (`boostedModules`) and exits early if empty.
  - avoids repeated full module-grid scans in both blend and non-blend boost passes.

- [x] `netlify/functions/qr.ts` GIF encode lock instrumentation:
  - retained strict single-encode serialization for correctness.
  - added queue-wait timing telemetry in `withGifEncodeLock(...)` (`[TIMING] GIF encode queue wait`) with `waitMs` and queue depth.

- [x] Previously-requested P0 cache fix remains in place:
  - no `clearBasisCache()` call from QR-Art generation path.

- [x] Validation run:
  - `npm run typecheck` passes.
  - `npx vitest run tests/unit/qr-generator-dithered-matrix.spec.ts` passes (`35` tests).
  - `npx vitest run tests/unit/qr-generator-artistic-guards.spec.ts tests/unit/coverage-batch-4.spec.ts` passes (`48` tests total).
  - `npx vitest run tests/unit/netlify-qr-function.spec.ts tests/unit/netlify-qr-helpers.spec.ts` passes (`43` tests).
  - `npx knip --include dependencies,unlisted,exports` passes.

## Update 2026-02-22 06:47:19 UTC (Gallery Sharding: Local/Browser/Remote)

- [x] Added shared shard parsing/filtering helper:
  - new file: `scripts/lib/gallery-sharding.mjs`
  - supports:
    - `GALLERY_SHARD=2/8` or `GALLERY_SHARD=2-of-8` (1-based)
    - `GALLERY_SHARD_INDEX` (0-based) + `GALLERY_SHARD_TOTAL`
  - deterministic selection uses round-robin by config order (`idx % total === shardIndex`).

- [x] Wired sharding into all gallery generators:
  - `scripts/generate-gallery-local.mjs`
  - `scripts/generate-gallery-browser.mjs`
  - `scripts/generate-gallery-remote.mjs`
  - behavior:
    - applies shard filter after `GALLERY_CATEGORY` / `GALLERY_IDS` filters
    - logs shard metadata in startup and JSON report
    - writes shard-safe report files to avoid collisions:
      - `passed.shard-X-of-N.txt`
      - `failed.shard-X-of-N.txt`
      - `report.shard-X-of-N.json`
    - keeps original filenames (`passed.txt`, etc.) when unsharded.

- [x] Updated Makefile passthrough for all three targets:
  - added vars:
    - `GALLERY_SHARD`
    - `GALLERY_SHARD_INDEX`
    - `GALLERY_SHARD_TOTAL`
  - `gallery:local`, `gallery:browser`, `gallery:remote` now forward shard env values.
  - help text updated with sharding usage hints.

- [x] Validation:
  - syntax checks passed for:
    - `scripts/lib/gallery-sharding.mjs`
    - `scripts/generate-gallery-local.mjs`
    - `scripts/generate-gallery-browser.mjs`
    - `scripts/generate-gallery-remote.mjs`
  - local shard run check:
    - `GALLERY_IDS=nooverlay__default--1,nooverlay__style-rounded--2 GALLERY_SHARD=1/2`
    - selected only one config and emitted shard-suffixed report files
  - browser (api mode) shard run check:
    - same IDs with `GALLERY_SHARD=2/2`
    - selected complementary config and emitted shard-suffixed report files

## Update 2026-02-22 06:50:37 UTC (Makefile Auto-Shard Fanout)

- [x] Added `GALLERY_SHARD_COUNT` make variable (default `1`) for auto-parallel shard orchestration.

- [x] `gallery:local`, `gallery:browser`, `gallery:remote` now support two modes:
  - direct single run (`GALLERY_SHARD_COUNT<=1`) using existing explicit shard envs
  - automatic parallel fanout (`GALLERY_SHARD_COUNT>1`) launching shard `1..N` concurrently with `GALLERY_SHARD="i/N"`.

- [x] Guardrail added:
  - when `GALLERY_SHARD_COUNT>1`, target exits with error if `GALLERY_SHARD`, `GALLERY_SHARD_INDEX`, or `GALLERY_SHARD_TOTAL` are also set explicitly.

- [x] Help text updated to include `GALLERY_SHARD_COUNT` tunable.

- [x] Validation:
  - `make -n gallery:{local,remote,browser} GALLERY_SHARD_COUNT>1` shows expected parallel shard loop.
  - real smoke run:
    - `make gallery:local GALLERY_SHARD_COUNT=2 GALLERY_LOCAL_CONCURRENCY=1 GALLERY_IDS=nooverlay__default--1,nooverlay__style-rounded--2`
    - two shards executed in parallel and produced:
      - `passed.shard-1-of-2.txt` / `report.shard-1-of-2.json`
      - `passed.shard-2-of-2.txt` / `report.shard-2-of-2.json`

## Update 2026-02-22 07:02:09 UTC (Animation/GIF/QR-Art Perf Pass)

- [x] `useQRGenerator` frame cache moved out of React state:
  - heavy frame arrays now live in `animationFramesRef`.
  - lightweight state tracks only `animationFrameCount` + `animationFramesRevision`.
  - playback/export/global debug state switched to ref-backed access.
  - avoids large canvas arrays in React state and reduces render churn.

- [x] Frame persistence logic no longer always deep-copies:
  - added `persistFrameCanvas(...)` in cache builder.
  - stores direct frame references when safe.
  - detects source-canvas reuse and retroactively detaches prior references using `cloneCanvas(...)` only when needed.

- [x] `interpolateFrames(...)` optimized:
  - supports optional reusable target canvas.
  - adds reusable morph `ImageData` scratch buffer.
  - large-frame morph path guarded with fast crossfade fallback (`MAX_MORPH_PIXELS`).

- [x] `applyAnimationPattern(...)` hot-path optimization:
  - `wave` now uses strip-based `drawImage` displacement instead of full `getImageData` clone/scan.
  - `shimmer` now uses gradient overlay compositing instead of per-pixel loops.
  - supports optional bounded effect region via `AnimationOptions.effectBounds`.

- [x] `gif-compositor.ts` allocation reduction:
  - caches per-frame patch `ImageData` and reuses on subsequent `apply(...)` calls.
  - removes repeated `new ImageData(new Uint8ClampedArray(...))` allocations during playback.

- [x] `netlify/functions/qr.ts` GIF encoder memory/CPU improvements:
  - global palette sampling now downsamples with adaptive stride and bounded sample budget.
  - avoids concatenating full RGBA for all sampled frames.
  - animated encoder paths cache only palette-sampled prepared frames to avoid duplicate prep work.

- [x] `qr-art/elimination.ts` inner-loop optimization:
  - `countMatchingPixels(...)` switched from string-key map + `Map` flip counts to:
    - per-block numeric lookup map
    - `Uint8Array` flip parity buffer
  - block result lookup now uses prebuilt `Map` instead of repeated `.find(...)`.
  - `gaussJordanEliminate(...)` now shrinks available pixel order incrementally per block.

- [x] Validation:
  - `npm run -s typecheck` passes.
  - targeted regression suite passes:
    - `ANQR_LOG_LEVEL=error npx vitest run tests/unit/animation-core.spec.ts tests/unit/animation-patterns.spec.ts tests/unit/animation-parsing-compositor-loop.spec.ts tests/unit/animation-playback-delay.spec.ts tests/unit/exporter-gif.spec.ts tests/unit/netlify-qr-gif-disposal.spec.ts tests/unit/logger.spec.ts tests/unit/logger-buffer-redaction.spec.ts tests/unit/useQRGenerator-preserve-options.spec.ts tests/unit/qr-art-regression.spec.ts`
    - result: `10` files passed, `51` tests passed.

- [x] Logger capture policy reminder:
  - structured capture defaults to warn+ unless explicitly enabled.
  - tests that assert trace/debug/info structured capture now set `ANQR_LOG_CAPTURE_MIN_LEVEL=trace` in test setup.

## Update 2026-02-22 07:07:41 UTC (Follow-up Stability)

- [x] Added shimmer compatibility fallback in `apply-animation-pattern.ts`:
  - when the rendering context lacks `createLinearGradient` (mock/test contexts), shimmer now no-ops safely instead of throwing.

- [x] Updated logger unit test harnesses for explicit structured-capture policy:
  - `tests/unit/logger.spec.ts`
  - `tests/unit/logger-buffer-redaction.spec.ts`
  - both suites now pin:
    - `ANQR_LOG_CAPTURE_MIN_LEVEL=trace`
    - `ANQR_LOG_CAPTURE_CONSOLE=1`
  - and restore prior env after each test.

## Update 2026-02-22 08:28:42 UTC (GIF Corruption Hardening A-D)

- [x] Centralized GIF encode serialization in shared animation module:
  - added `src/modules/animation/gif-lock.ts` with `withGifEncodeLock(...)`.
  - Netlify function now wraps through shared lock (retains queue-wait timing logs):
    - `netlify/functions/qr.ts`
  - Browser preview GIF re-encode now serialized:
    - `scripts/generate-gallery-browser.mjs`
  - Frontend GIF export now serialized:
    - `src/modules/exporter/gif-export.ts`

- [x] Cloned indexed palette buffers before `gif.writeFrame(...)` at all active callsites:
  - `netlify/functions/qr.ts` (`encodeGif`, `encodeAnimatedGif`, `encodeAnimatedGifWithDelays`)
  - `scripts/generate-gallery-browser.mjs` (`encodeAnimatedGifFromCanvases`)
  - `src/modules/exporter/gif-export.ts` (`exportGif`)

- [x] Removed server-side patch-canvas resize-in-loop footgun in GIF parse/composite:
  - `netlify/functions/qr.ts` `parseGifFramesServer(...)`
  - patch canvas now fixed-size (max patch dimensions), no per-frame width/height resets.
  - compositing uses bounded source/destination rect draw to apply only patch area.

- [x] Gallery artifact writing now verify-gated with temp files (no final corrupt artifact on fail):
  - `scripts/generate-gallery-local.mjs`
  - `scripts/generate-gallery-remote.mjs`
  - `scripts/generate-gallery-browser.mjs`
  - flow:
    - magic-byte check (GIF/PNG/WEBP/JPEG/SVG)
    - QR verify
    - write temp file
    - rename to final only on pass
    - delete temp on verify failure

- [x] Added explicit magic-byte validation before publish:
  - animated scenarios require GIF header (`GIF87a`/`GIF89a`).
  - static scenarios checked against resolved output extension signature.

- [x] Validation:
  - syntax checks:
    - `node --check scripts/generate-gallery-local.mjs`
    - `node --check scripts/generate-gallery-remote.mjs`
    - `node --check scripts/generate-gallery-browser.mjs`
  - `npm run -s typecheck` passes.
  - targeted tests pass:
    - `ANQR_LOG_LEVEL=error npx vitest run tests/unit/exporter-gif.spec.ts tests/unit/netlify-qr-gif-disposal.spec.ts tests/unit/animation-core.spec.ts`
    - result: `3` files passed, `11` tests passed.
