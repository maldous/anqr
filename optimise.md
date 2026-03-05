This file contains all optimisation opportunities. 

Perform the work for each, do not test, only lint/fix, then commit with appropriate message to describe change and push. 

I will review when done and direct you to bisect if I determine any regressions.

Attempt to complete all without requiring interaction from me. 

Note these optimisations have not been review - you should consider each as a suggestion and validate before implementing. 

Keep a running log of changes/decisions in result.md

1) [HUGE][CPU+MEM][WEB+ANDROID] Replace PixelDecisionMatrix’s `boolean[][]` + `(RGB|null)[][]` with packed TypedArrays end-to-end (e.g. `Uint8Array bits`, `Uint32Array colorsPacked`, `size`, `scale`). Kill all “bitsToMatrix / packedColorsToMatrix” conversions. (src/modules/qr-generator/pixel-matrix-*.ts, src/modules/qr-generator/render-loop.ts, src/modules/qr-generator/scaled-render.ts, src/modules/qr-generator/types.ts)

2) [HUGE][CPU+MEM][WEB+ANDROID] Replace OverlayData’s `{[row][col]}` object-of-objects with packed arrays (e.g. `Float32Array brightness`, optional `Uint32Array colorsPacked`). Objects here are massive GC churn at higher versions/scales. (src/modules/qr-generator/overlay-data.ts, src/modules/qr-generator/types.ts)

3) [HUGE][STARTUP+MEM][WEB+ANDROID] Stop importing the generated gallery payload into the main bundle via Header. `Header.tsx` imports `gallerySections` → pulls `gallery-showcase.generated.ts` (~300KB+) into main chunk. Load a tiny “category manifest” in Header, and lazy-load full `gallerySections` only on Gallery route. (src/components/Header.tsx, src/data/gallery-items.ts, src/data/gallery-showcase.generated.ts)

4) [HUGE][STARTUP][WEB+ANDROID] Lazy-load QR-Art core (RS basis + elimination + generate.ts) only when QR-Art is enabled. Right now `useQRGenerator` imports `@/modules/qr-art` directly, which likely drags large QR-Art code into the main editor chunk. Convert to dynamic import or “client stub” that boots the worker only when needed. (src/hooks/useQRGenerator.ts, src/modules/qr-art/*)

5) [HUGE][CPU+MEM][WEB+ANDROID] Remove `unpackQArtMatrix(packed)->boolean[][]` expansion. You already have `PackedMatrixWrapper` in QRGenerator; keep packed matrices packed through the pipeline. (src/hooks/useQRGenerator.ts, src/modules/qr-generator/qr-generator-class.ts)

6) [HUGE][UI RESPONSIVENESS][WEB+ANDROID] Run the whole heavy render pipeline in a dedicated worker when supported (OffscreenCanvas + ImageBitmap output), not just validation/QR-Art. Keep main-thread fallback. This is the single biggest “feels snappy” win on Android WebView. (new worker module + refactor QRGenerator entrypoints)

7) [HUGE][CPU][WEB+ANDROID] Add “adaptive preview quality”: during live edits render at reduced scale / reduced overlay resolution, then refine after settle (CONFIG_SETTLE_DEBOUNCE_MS) or on idle. Export always uses full quality. (src/hooks/useQRGenerator.ts, src/modules/qr-generator/pixel-matrix-utils.ts)

8) [HUGE][CPU+MEM][WEB+ANDROID] Use transferable buffers for worker messaging:
   - Validation worker: send `Uint8ClampedArray.buffer` + width/height (transfer list) instead of cloning ImageData.
   - QR-Art worker: same for target image + any packed matrices.
   (src/modules/qr-analyzer/validation-worker-client.ts + validation-worker.ts, src/modules/qr-art/qart-worker-client.ts + qart-worker.ts)

9) [HUGE][CPU][WEB+ANDROID] Avoid per-generation creation of tiny canvases in hashing. Reuse a pooled 32x32 OffscreenCanvas (or one-per-thread) for `hashCanvasContent`, or better: stop pixel-hashing and use a logical “overlay revision id” based on source + transforms. (src/modules/qr-generator/utils.ts, src/modules/qr-generator/overlay-data.ts)

10) [HUGE][CPU][WEB+ANDROID] Audit + enforce CanvasPool usage for *all* temporary canvases (overlay scaling, preprocessing, frame scratch, hashing). Ensure `createCanvasFn` used everywhere comes from a pool, not `document.createElement('canvas')`. (src/modules/qr-generator/canvas-factory.ts + call sites)

11) [HUGE][CPU+MEM][WEB+ANDROID] Replace the object-heavy “matrix-like” structures used in scaled modes with packed arrays (even if you keep a compatibility wrapper API). Scaled overlays at renderScale 12–24 can be millions of cells. (src/modules/qr-generator/scaled-render.ts, pixel-matrix-*)

12) [HUGE][CPU][WEB+ANDROID] In QR-Art elimination: replace Maps in hot paths with typed arrays / index tables where possible (`pixelToVectorIndex`, etc.). Map allocations dominate on mobile. (src/modules/qr-art/elimination.ts)

13) [HUGE][CPU][WEB+ANDROID] In QR-Art elimination: avoid building intermediate JS arrays (`idx: number[]`, `vals: number[]`) then converting to typed arrays; do a 2-pass count+fill into typed arrays. (src/modules/qr-art/elimination.ts)

14) [HUGE][STARTUP][WEB+ANDROID] Split editor sections into lazy chunks (PayloadSection, OverlaySection, Analyze already). Load the heavy controls only when accordion/tab opens. (src/components/sections/PayloadSection.tsx, OverlaySection.tsx, App.tsx)

15) [HUGE][CPU][WEB+ANDROID] Reduce redundant image reads: centralize all getImageData calls behind a cache keyed by (canvas ref + size + overlay options + frame index). In animations you currently read/copy ImageData frequently. (src/hooks/useQRGenerator.ts, src/modules/animation/*)

16) [HUGE][CPU][WEB+ANDROID] Reuse ImageData buffers for per-frame operations (color-cycle, patterns, interpolate) instead of `new ImageData(new Uint8ClampedArray(...))` each time. Pool `Uint8ClampedArray` sized buffers. (src/modules/animation/animation-patterns.ts, color-cycle.ts, interpolate-frames.ts, gif-compositor.ts)

17) [HUGE][CPU][WEB+ANDROID] Prefer ImageBitmap decode paths for overlays/frames where possible; avoid DOM Image -> drawImage -> getImageData chains when an ImageDecoder path exists. (src/modules/animation/parsing.ts, overlay preprocessing)

18) [HUGE][CPU][WEB+ANDROID] In rendering: avoid constructing per-cell RGB objects (`{r,g,b}`) in hot loops. Keep packed `0xRRGGBB` ints until the last possible moment. (pixel-matrix-dithered.ts already packs; finish the job by removing unpack-to-objects)

19) [HUGE][CPU][WEB+ANDROID] In render loop: accept packed `bits/colors` and iterate linearly over index rather than nested arrays for max JIT friendliness (single stride loop). (src/modules/qr-generator/render-loop.ts)

20) [HUGE][CPU][WEB+ANDROID] Cap renderScale defaults more aggressively for preview on Android, based on device memory/cores; keep full scale for export. (src/modules/qr-generator/pixel-matrix-utils.ts, store defaults)

21) [BIG][STARTUP][WEB+ANDROID] Ensure qr-decoder code stays out of main bundle: only import decode/validation through worker entrypoints or dynamic import. (validate worker already helps; confirm no accidental main-thread imports)

22) [BIG][CPU][WEB+ANDROID] Replace `sanitizeQArtRenderConfig` JSON fallback with a manual whitelist copier (primitives only). JSON stringify is expensive on WebView. (src/hooks/useQRGenerator.ts)

23) [BIG][CPU][WEB+ANDROID] Eliminate `imageBitmapToCanvas()` allocations in steady-state: draw ImageBitmap into a pooled canvas (or directly use bitmaprenderer where supported). (src/hooks/useQRGenerator.ts)

24) [BIG][CPU][WEB+ANDROID] Eliminate `cloneCanvasFrame()` allocations per frame; use pooled canvases or store ImageBitmaps instead of canvases for intermediate frames. (src/hooks/useQRGenerator.ts, src/modules/animation/*)

25) [BIG][UI][WEB+ANDROID] Ensure all “generate” triggers are debounced by *semantic* changes only. Avoid regenerating if changes don’t affect output (e.g., UI-only state). Create a stable “render signature” from only render-affecting config. (src/hooks/useQRGenerator.ts)

26) [BIG][CPU][WEB+ANDROID] Move expensive work scheduling to `requestIdleCallback` where acceptable (post-settle refinement, validation, analytics) with timeout fallback. (src/hooks/useQRGenerator.ts)

27) [BIG][CPU][WEB+ANDROID] Batch DOM/state updates around generation results using `startTransition` so React input stays responsive. (src/hooks/useQRGenerator.ts, App.tsx)

28) [BIG][MEM][WEB+ANDROID] Ensure the Zustand store never stores large binary blobs/canvases/frames. Store references/ids, keep heavy data in module-local caches with explicit eviction. (src/store/qr-store.ts, src/hooks/useQRGenerator.ts)

29) [BIG][CPU][WEB+ANDROID] Add explicit cache eviction policy knobs (max bytes, LRU by bytes not entries) for overlay data, pixel matrices, and frame caches. (src/modules/qr-generator/cache.ts + new caches)

30) [BIG][CPU][WEB+ANDROID] Dither kernels: precompute kernel offset arrays into flat typed arrays (dx[], dy[], w[]) to avoid object property reads in inner loops. (src/modules/qr-generator/pixel-matrix-dithered.ts, src/modules/dither-algorithms/kernels)

31) [BIG][CPU][WEB+ANDROID] Avoid per-pixel `Math` overhead (min/max/abs) in tight loops: hoist constants, use local vars, minimize function calls (especially in dithering). (pixel-matrix-dithered.ts, dithering-*.ts)

32) [BIG][CPU][WEB+ANDROID] Replace repeated `isFinderPattern/isTimingPattern/...` calls with a packed functional map everywhere (you already do this in render-loop; extend to pixel-matrix generation and scaled-render where it still uses spec functions). (scaled-render.ts, pixel-matrix-dithered.ts)

33) [BIG][CPU][WEB+ANDROID] Ensure all getImageData contexts request `{ willReadFrequently: true, desynchronized: true }` consistently (some sites do, some don’t). (overlay-data.ts currently does not)

34) [BIG][CPU][WEB+ANDROID] Reduce canvas state churn: avoid setting `imageSmoothingEnabled/Quality` repeatedly; set once per canvas acquisition or only when needed. (overlay-data.ts, scaled-render.ts, drawing.ts)

35) [BIG][CPU][WEB+ANDROID] Replace string-heavy cache keys with numeric hashes (or nested Maps keyed by primitives) to reduce allocations: `${canvasHash}:${moduleCount}:...` in hot paths can churn. (overlay-data.ts, cache.ts usage patterns)

36) [BIG][CPU][WEB+ANDROID] In `hashCanvasContent`, avoid allocating a DOM canvas each call; pool one, or cache hash per overlay revision. (utils.ts)

37) [BIG][CPU][WEB+ANDROID] In Netlify `/api/qr`: ETag shouldn’t hash full output buffer; derive from deterministic `cacheKey` (or hash cacheKey) to avoid O(n) hashing per request. (netlify/functions/qr.ts)

38) [BIG][NET][WEB] Add `stale-while-revalidate` and long-lived caching headers for deterministic `/api/qr` responses and gallery assets. (netlify.toml + function headers)

39) [BIG][STARTUP][WEB+ANDROID] Configure Vite `build.rollupOptions.output.manualChunks` to isolate big/rare features:
   - qr-art
   - gifuct-js/gifenc
   - gallery generated data
   - analyze-only tooling
   (vite.config.ts)

40) [BIG][UI][WEB+ANDROID] Apply `content-visibility: auto` to long/complex settings sections so offscreen controls don’t cost layout/paint. (sections components)

41) [BIG][UI][WEB+ANDROID] Virtualize large lists (gallery items, payload option lists) to reduce DOM nodes. (Gallery.tsx, PayloadSection.tsx)

42) [BIG][CPU][WEB+ANDROID] Avoid re-render storms from store updates: use Zustand selectors + `shallow` for each section; don’t subscribe whole App to whole store. (App.tsx, sections)

43) [BIG][CPU][WEB+ANDROID] Ensure animated preview uses a single RAF loop with fixed timestep; avoid nested timers and re-entrant generation. (useQRGenerator.ts)

44) [BIG][CPU][WEB+ANDROID] When generating GIFs: decimate/interpolate *before* applying expensive overlay transforms/dithering, and reuse per-frame preprocessing artifacts when only timing changes. (useQRGenerator.ts, animation/*, exporter/*)

45) [BIG][CPU][WEB+ANDROID] In GIF compositor: avoid `putImageData` patches if a `drawImage` of cached ImageBitmap works; ImageData ops are slow on WebView. (gif-compositor.ts)

46) [BIG][CPU][WEB+ANDROID] Replace repeated `ctx.getImageData()` reads of the same canvas region with cached ImageData for the frame lifecycle. (Preview.tsx, Analyze.tsx, animation modules)

47) [BIG][CPU][WEB+ANDROID] Prefer `canvas.toBlob()` async over `toDataURL()` anywhere it still exists; keep UI thread free. (exporter/*, browser-io/*)

48) [BIG][ANDROID] In MainActivity, set WebView performance flags via `getBridge().getWebView().getSettings()`:
   - enable/confirm hardware acceleration
   - set cache mode, DOM storage, render priority policy where available
   - disable over-scroll + scrollbars for less paint
   - set `setOffscreenPreRaster(true)` for smoother scroll on older devices (measure)
   (android/app/src/main/java/.../MainActivity.java)

49) [BIG][ANDROID] Consider forcing ANGLE / Skia-backed rendering where available (device dependent) and ensure WebView uses latest Chromium via Android System WebView updates (document for QA). (release checklist)

50) [BIG][ANDROID] Ensure JS heap pressure is minimized: packed arrays + pools (items 1–2) are the main fix; then tune GC by avoiding short-lived objects in render loops. (global)

51) [MED][CPU] In qr-encoder/math gexp: replace while-loops with modulus-based normalization (careful with negatives) and use typed arrays for EXP/LOG tables. (src/modules/qr-encoder/math.ts)

52) [MED][CPU] In QR generator render-loop: track and avoid redundant `ctx.fillStyle` sets; batch same-color modules into runs when possible. (render-loop.ts)

53) [MED][CPU] In drawing primitives: avoid path rebuilds for repeated shapes; precompute Path2D for module styles (square/rounded/dots/eyes) and reuse. (drawing-*.ts)

54) [MED][CPU] Use `Path2D` caches keyed by style+radius+scale to reduce per-cell geometry cost. (drawing.ts)

55) [MED][CPU] In halftone/gradient/pattern rendering: precompute per-row gradient stops and reuse; avoid recomputing color conversions per module. (drawing-gradients.ts, drawing-halftone.ts)

56) [MED][CPU] Replace per-module `ensureContrast` calls with palette-level precomputation; ensure any contrast enforcement is computed once per config. (color.ts, render-loop.ts)

57) [MED][CPU] Normalize/validate colors once per config, not in inner loops. (utils.ts + call sites)

58) [MED][CPU] Reduce allocations in dithering: pool `Float32Array` (errors/desire) by size; you already allocate many per generation. (pixel-matrix-dithered.ts)

59) [MED][CPU] In temporal dithering: precompute noise tiles and reuse across frames; avoid per-frame RNG setup. (modules/dither-algorithms/*)

60) [MED][CPU] In overlay preprocessing filters (blur/sharpen/edge): use separable kernels for Gaussian blur, reuse scratch buffers, and offer integer math fast path. (filters-*.ts)

61) [MED][CPU] Use `ImageBitmap` + `transferToImageBitmap()` to display preview with fewer copies (especially when generation is off-thread). (Preview.tsx + generator pipeline)

62) [MED][CPU] Avoid reading full canvas pixels for operations that only need downsampled luminance (validation pre-pass, hash, overlay intensity estimation). (various)

63) [MED][CPU] Add “fast scannability heuristic” prior to decode attempts (contrast + finder integrity + timing), and only run full decode when heuristic indicates risk or on idle/export. (qr-analyzer pipeline)

64) [MED][CPU] Validation worker: allow progressive attempts (1 attempt quick → schedule more attempts if failed) rather than fixed attempts immediately. (validation-worker.ts)

65) [MED][NET] For remote overlays: cache fetched images (by URL + CORS + transforms) in IndexedDB/Cache Storage; reuse between sessions. (browser-io + overlay module)

66) [MED][NET] Add fetch timeouts + abort controllers for overlay downloads; avoid hanging workers/preview. (overlay loading code)

67) [MED][STARTUP] Lazy-load rare export formats (vector SVG, metadata embedding, watermarking, GIF quantizers). (exporter/* + dynamic imports)

68) [MED][STARTUP] Lazy-load AdMob + ad-related code paths (already dynamic in admob.ts; confirm no eager imports elsewhere). (modules/platform/*)

69) [MED][UI] Defer analytics (trackEvent) until idle; avoid doing it during generation-critical paths. (useQRGenerator.ts, components)

70) [MED][UI] Reduce layout thrash: avoid measuring DOM during render; batch reads/writes; prefer CSS for animations. (App/layout components)

71) [MED][MEM] Centralize cache clearing on route change / app backgrounding (Android onPause) to release large arrays/canvases. (cache.ts + platform hooks)

72) [MED][MEM] Add explicit “low-memory mode” toggle (auto-enabled on Android Go / low RAM) that reduces preview scale and disables heavy effects until export. (store defaults + generator)

73) [MED][ANDROID] On app background/foreground, pause any RAF loops and free frame buffers; resume lazily. (MainActivity lifecycle + JS listener)

74) [MED][ANDROID] Consider enabling WebView “renderer priority policy” to keep rendering thread alive during heavy JS. (MainActivity)

75) [MED][BUNDLE] Run a bundle analyzer and set hard budgets per chunk; fail CI if main editor chunk grows beyond target. (vite config + CI)

76) [MED][BUNDLE] Ensure tree-shaking is effective: avoid importing from barrel files that pull unused modules into chunks. (src/modules/index.ts usage)

77) [MED][CPU] Replace `Map<string,T>` LRU with a ring buffer / custom LRU using arrays for hot caches to reduce iterator overhead. (src/modules/qr-generator/cache.ts)

78) [MED][CPU] Avoid string concatenation in hot keys; use numeric composite key (e.g. 32-bit hash of params) and nested maps for (overlayHash→moduleCount→intensity→colorMode). (overlay-data.ts)

79) [MED][CPU] In `getScaleFactor`, ensure scale doesn’t exceed what’s needed for a given module style/overlay; cap by output size and device class. (pixel-matrix-utils.ts)

80) [MED][CPU] In scaled render, avoid per-pixel `validateColor` / parsing; parse once. (scaled-render.ts)

81) [LOW][CPU] In QR math tables: use `Uint16Array` for EXP/LOG and avoid bounds checks. (qr-encoder/math.ts)

82) [LOW][CPU] Replace `codePointAt` in hashString with `charCodeAt` if you only need UTF-16 units (faster). (qr-generator/utils.ts)

83) [LOW][CPU] Where you do `new Array(n).fill(...)` in hot paths, prefer typed arrays or preallocated reusable arrays. (pixel-matrix-dithered.ts)

84) [LOW][CPU] Avoid try/catch in frequently hit paths (move guards out); exceptions deopt V8. (useQRGenerator.ts, utils)

85) [LOW][CPU] Ensure logger calls in hot loops are gated behind flags (some are; confirm none in inner loops). (qr-generator, qart)

86) [LOW][UI] Memoize static icons/components (Radix + lucide) where rerenders happen frequently. (Header.tsx, sections)

87) [LOW][UI] Prefer CSS containment (`contain: layout paint size`) on isolated panels to reduce repaint cost. (sections)

88) [LOW][NET] Preconnect/dns-prefetch to known third-party domains (ads/analytics) but only after user consent / idle. (index.html / app bootstrap)

89) [LOW][ANDROID] Confirm release builds disable WebView debugging and any verbose logs. (MainActivity.java)

90) [LOW][ANDROID] Confirm ProGuard/R8 keeps only needed classes; shrink unused plugin code. (proguard-rules.pro, build.gradle)

91) [LOW][SERVER] Netlify function: reuse Node canvas objects across invocations where possible (module-level pool) to reduce native allocs. (netlify/functions/qr.ts)

92) [LOW][SERVER] Netlify function: cache decoded overlay images in blobs/kv by URL+transform so repeated hits don’t re-fetch/decode. (qr.ts)

93) [LOW][SERVER] Netlify function: avoid unnecessary metadata embedding work unless requested; keep fast path minimal. (qr.ts)

94) [LOW][TEST] Add microbench + perf regression tests for:
    - pixel matrix gen at multiple sizes/scales
    - render-loop at multiple moduleCount
    - QR-Art elimination at typical iterations
    (tests/perf/* new)

95) [LOW][TOOLING] Add a “perf overlay” for real devices (Android) showing ms/frame, allocations, current scale, worker usage. Keep off by default. (useQRGenerator.ts, dev tools)

96) [LOW][DOC] Document recommended defaults for Android (scale, features) and a QA matrix for low/mid/high devices. (knowledge.md / release checklist)

97) [LOW][CODE HEALTH] Identify any accidental deep copies of config/state per render; replace with structural sharing + immutable updates. (store + hooks)

98) [LOW][CODE HEALTH] Ensure all long-running loops yield cooperatively (`await` or chunk) on main thread where workers aren’t used. (useQRGenerator.ts, qart fallback paths)

99) [LOW][UI] Ensure image elements use `decoding="async"` and `loading="lazy"` where appropriate (gallery thumbnails). (Gallery.tsx)

100) [LOW][UI] Prefer `prefers-reduced-motion` checks to reduce work on devices that request it (optional). (animations)

101) [LOW][SEC+PERF] Keep COOP/COEP constraints in mind: SharedArrayBuffer/threaded WASM likely unavailable due to third-party scripts, so prioritize OffscreenCanvas + standard workers instead. (architecture note)

102) [LOW][CLEANUP] Ad“clear heavy caches” button for debugging and for Android low-memory recovery. (UI + cache.ts)

103) [LOW][CLEANUP] On route change away from editor, terminate workers (validation, qart) and release pools if not needed. (worker clients)

104) [LOW][CLEANUP] Ensure `URL.revokeObjectURL` always runs on overlay replace/unmount (looks mostly good; keep auditing). (OverlaySection.tsx, Analyze.tsx)

105) [LOW][BUNDLE] Avoid importing from `@/modules/index.ts` in editor critical code if it re-exports many modules and hurts tree-shaking; import direct subpaths. (codebase-wide)

106) [LOW][BUNDLE] Consider moving huge generated TS data to static JSON, fetched on demand, so it never impacts JS parse/compile time. (gallery-showcase.generated.ts -> public/gallery/*.json)

107) [LOW][CPU] Avoid repeated `parseColor`/color conversions; memoize conversions per color string. (core/color utils)

108) [LOW][CPU] In render-loop, consider precomputing row offsets (`rowBase = row*mc`) to avoid repeated multiplications (some already hoisted; verify all inner loops). (render-loop.ts)

109) [LOW][CPU] Prefer integer arithmetic in hot pixel loops; keep floats only where needed for quality. (dither + filters)

110) [LOW][CPU] Ensure `desynchronized: true` is used only when it helps; some browsers ignore it; measure on Android devices. (canvas context creation points)
