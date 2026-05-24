# QR Render Pipeline — Performance Review

## What's already good

The pipeline gets several things right. The shared `render-runtime/` core is genuinely shared between web and Netlify function via a thin canvas-type abstraction, and `render-frame-sequence.ts` cleanly delineates the per-frame contract (module input → render → result effects → interpolate → finalize). The `ArtworkState.lockedMask/lockedVersion` mechanism in `generate-artwork-frame.ts:41-44` is exactly the right pattern: run `generateFullQArtOptimal` only on frame 0, then pin those values so all subsequent frames use the cheaper single-mask path — that single optimisation likely saves >80% of artwork-GIF wall time. The `canUseFastPatternPath` short-circuit in `generate-gif-animation-frames.ts:86-104` is another good win (pattern-only animations skip the full frame loop). The blue-noise tile cache in `dither-algorithms/blue-noise-tile-cache.ts` and the diffusion kernel prep step (intent of `prepare-kernel.ts`) show the team is thinking about avoiding recomputation. The `generation-singleton`-style worker isolation for QArt and validation keeps the main thread responsive. Quality gates and 4830 unit tests are real protection against regression.

## Findings

### F1. Per-pixel kernel division — `prepared` field built but never used
- Confidence: 🔍 inferred
- Risk: low (algorithmically identical within float epsilon)
- Effort: low
- File: `packages/domain/render/src/dither/prepare-kernel.ts:30` (builds `kernel.prepared.normalizedWeights`); `packages/domain/render/src/dither/distribute-error-with-kernel.ts:18` (still computes `weight / kernel.divisor` per pixel).

`prepareKernel` runs once at module-load (kernels.ts:93) and packs `weight/divisor` into a `Float32Array normalizedWeights`, plus typed-array x/y offsets, into `kernel.prepared`. `distributeErrorWithKernel` ignores that field entirely and walks the nested `kernel.matrix` array, performing the division for every pixel of every overlay. For a 256×256 overlay with Floyd-Steinberg (4 non-zero weights) that's ~262 K divisions per overlay; for Jarvis (12 weights) ~786 K. Rewrite `distributeErrorWithKernel` to use the prepared typed arrays and the inner loop becomes a flat `for (let k=0;k<len;k++)` over typed arrays with a single multiply per neighbour. Output is byte-identical (same float math, just pre-divided).

### F2. Wave animation pattern issues a per-row drawImage
- Confidence: 🔍 inferred
- Risk: low (visual output unchanged)
- Effort: medium
- File: `packages/domain/render/src/animation/apply-animation-pattern.ts:57-92`.

For axis "y" the code does `for (let y = bounds.y; y < bounds.y + bounds.height; y++)` calling `ctx.drawImage(canvas, ..., 1px slice, ...)` per row. At 512×512 that's 512 sub-pixel drawImage calls per frame; for an axis "xy" wave it's 1024. Server canvas (`@napi-rs/canvas` Skia) and browser canvas both have measurable overhead per drawImage. Replace with a single `getImageData`/`putImageData` loop that performs the row/column shifts in one pixel buffer pass, or precompute a displacement LUT keyed by `(progress, seed, axis, dim)` and cache across frames within one animation.

### F3. Watermark recomputed per frame for static text
- Confidence: 🔍 inferred
- Risk: low
- Effort: low
- File: `packages/domain/render/src/server/draw-watermark-layer-server.ts:15-19` (called from `apply-watermark-server.ts:14/19`, called per frame from `scale-and-watermark-frame.ts:19`, called per frame from `render-animated-overlay-loop.ts:117` and `render-pattern-animation-loop.ts:73`).

`createTextWatermark(text, 14, "sans-serif", "#000000")` is invoked on every frame even when text/font/color are constant. For a 60-frame GIF that's 60 redundant font-shaping passes. The image/pattern watermark already reuses `options.imageCanvas`; do the same for text — hoist `createTextWatermark` to `buildWatermarkOpts` and cache the rendered text canvas onto the `WatermarkOptions` object once.

### F4. Color-cycle path does the canvas copy twice
- Confidence: 🔍 inferred
- Risk: low (output identical)
- Effort: low
- File: `packages/application/generator/src/frames/apply-frame-post-processing.service.ts:46-51`; `packages/domain/render/src/animation/color-cycle.ts:23-28`.

`apply-frame-post-processing` calls `cloneCanvasSimple(finalResult)` (clone-canvas-simple.service.ts:13 — `drawImage` of full frame into a new canvas), then passes the clone as `targetCanvas` to `applyColorCycle`. Inside, `resolveEffectTargetCanvas` sees `result !== canvas` and does `ctx.drawImage(canvas, 0, 0)` (color-cycle.ts:27) — second full-frame draw. Two `drawImage` calls per frame where one (or zero) is needed. Either drop the clone (let `applyColorCycle` allocate via `resolveEffectTargetCanvas`'s OffscreenCanvas path) or — better — write color-cycle in-place: read `getImageData` from source, mutate, write to a single target canvas. Saves one full-frame blit per animated frame.

### F5. Defensive `if (!errors[ny])` after pre-allocation
- Confidence: 🔍 inferred
- Risk: low
- Effort: trivial
- File: `packages/domain/render/src/dither/dithering-error.ts:28`; allocator at `init-error-matrix.ts:3-6`.

`initErrorMatrix(moduleCount)` always allocates every row up front, but `distributeError` still runs `if (!errors[ny]) errors[ny] = [];` per neighbour pixel — a wasted truthiness check plus `(errors[ny][nx] || 0)` per accumulate. Since rows are guaranteed dense `number[]`, drop the guard and use direct `+=`. Also pre-divide weights as in F1 — this kernel struct (`DiffusionKernel` from `qr-generator-shared`) is the per-module path, so even smaller hot loop (moduleCount² ≤ ~32 K for v40) but trivial to fix.

### F6. Server-side temporal-noise computes x/y from `i` every pixel
- Confidence: 🔍 inferred
- Risk: low
- Effort: low
- File: `packages/domain/render/src/server/apply-temporal-noise-to-canvas-server.ts:21-30`.

`for (let i = 0; i < data.length; i += 4)` then `const x = (i / 4) % width; const y = Math.floor(i / 4 / width);` — a modulo and floor-divide per pixel where a nested `for (let y) for (let x)` would give them free. The noise formula is `x*phi + y*phi² + offset*1000) % 1`; per-row `y*phi²` is invariant, so it can be hoisted. Also `Math.max(0, Math.min(255, ...))` could be a clamp inlined. Output is bit-identical when refactored.

### F7. AoS object pixels in error-diffusion inner loop
- Confidence: 💭 speculative
- Risk: low-medium (numerically identical if done carefully)
- Effort: medium-high
- File: `packages/domain/render/src/dither/copy-image-to-pixels.ts:7-19`; `packages/domain/render/src/dither/run-diffusion-dither.ts`; `packages/domain/render/src/dither/distribute-error-with-kernel.ts`.

The dither converts `Float32Array[]` (which is already SoA-ish, packed RGB triplets per row) into `{r,g,b}` object rows for the diffusion pass. Three downsides: (a) object allocation per pixel hits GC; (b) hidden classes are not type-stable across rows; (c) no SIMD-friendly contiguous memory. Carry the math on three parallel `Float32Array`s (or a single `Float32Array(width*height*3)`) and the inner loop is straight typed-array arithmetic. This is the largest potential win for full-image error diffusion paths but requires careful refactoring of `runDiffusionDither` and every `quantize*Pixel` callback — flag as a follow-up, not a quick fix.

### F8. Server `applyFrameInterpolation` hard-codes t=0.5
- Confidence: 💭 speculative (could be intentional)
- Risk: medium (changes visual output if intent is wrong)
- Effort: low
- File: `packages/domain/render/src/server/apply-frame-interpolation.ts:11`.

`interpolateOverlayFramesServer(previousCanvas, currentCanvas, mode, 0.5)` — for a sequence of N frames, this always produces a 50/50 blend with the previous output, making every interpolated frame a ghost of frame i-1 at fixed weight rather than a smooth ramp. Compare with `apply-interpolation-to-frames.service.ts` (client) which produces N intermediate frames between key frames. Worth a question to the author before changing — may be intentional motion-blur, or it may be a latent bug producing weaker animation than the user-facing client.

### F9. `clone-canvas-simple` exists in two places with identical bodies
- Confidence: 🔍 inferred
- Risk: low
- Effort: trivial
- File: `packages/application/generator/src/frames/clone-canvas-simple.service.ts:7-18`; `packages/application/generator/src/hooks/clone-canvas-simple.tsx`.

Two `cloneCanvasSimple` implementations. Pick one home (`frames/`) and re-export from `hooks/`. Trivial dedup; reduces drift risk.

### F10. Per-frame `canvasHashCache.delete` only on HTMLCanvasElement
- Confidence: 🔍 inferred
- Risk: low
- Effort: trivial
- File: `packages/application/generator/src/frames/execute-frame-generation-loop.service.ts:34-36`.

`if (params.gifCompositor?.canvas instanceof HTMLCanvasElement) canvasHashCache.delete(...)` — if the gifCompositor is using OffscreenCanvas (the runtime supports both), the cache invalidation silently no-ops. Either invalidate unconditionally or document why HTMLCanvas-only is correct.

### F11. GIF palette anchor injection runs after quantisation
- Confidence: 💭 speculative
- Risk: low
- Effort: low
- File: `packages/domain/render/src/server/build-global-gif-palette.ts:54-58`; `ensure-gif-palette-anchors.ts` (not opened).

Sampling 3 frames is good. Anchoring palette to include black/white *after* quantising may displace useful colors when the user-chosen `paletteSize` is small (e.g. 8). Worth confirming `ensureGifPaletteAnchors` reserves slots before quantisation rather than evicting after.

### F12. `applyDither` allocates `boolean[][]` and `RGB[][]` row arrays
- Confidence: 💭 speculative
- Risk: low
- Effort: medium
- File: `packages/domain/render/src/dither/build-row-wise-dither-result.ts`; `init-dither-results.ts`.

Output is built as nested arrays of objects/booleans (`Array.from({length:width})` per row). For a 256×256 dither that's 65 536 `RGB` objects per overlay invocation. A `Uint8Array(width*height)` for `isDark` (bit-packed even) and a `Uint8ClampedArray(width*height*3)` for colors would slash GC and improve cache locality for any downstream consumer. Requires consumer-side changes.

### F13. Shared core boundary — client vs server frame loops diverge
- Confidence: 🔍 inferred
- Risk: medium (logic drift over time)
- Effort: high
- Files: `packages/application/generator/src/server/render-runtime/render-frame-sequence.ts` (one loop); `packages/application/generator/src/frames/execute-frame-generation-loop.service.ts` (other loop, plus `process-and-post-process-frame.service.ts`).

The two paths differ in: (a) where temporal noise is applied — server uses `applyResultEffectsForFrameHelper` (covers result effects + temporal in one place); client splits across `applyResultEphemeral` + `process-animation-frame-loop-iteration` + `applyFramePostProcessing`. (b) Server applies watermark inside `scaleAndWatermarkFrame` per frame; client uses `applyWatermarkToCanvas` after color-cycle. (c) Color cycle ordering differs. These are subtle and currently working, but any new effect added in one place needs mirroring in the other. Worth documenting as ADR or extracting a typed "frame pipeline spec" both implement.

---

## Recommendations ranked by ROI

Top of the list = highest value per unit risk × effort.

1. **F3 — cache the text watermark canvas once.** Linear win across every animated GIF render; trivial change; output identical. Highest cleanness:value ratio.
2. **F4 — drop redundant clone in color-cycle path.** Saves one full-frame `drawImage` per frame when color cycle is on. Three lines of code; output identical.
3. **F1 — use the already-built `kernel.prepared` typed arrays in `distribute-error-with-kernel.ts`.** Optimisation that's literally already on the heap; just plumb it through. Numerically identical. Touches the overlay-dither hot path which runs on every overlay-mode preview.
4. **F5 — drop the `if (!errors[ny])` guard and pre-divide the per-module kernel weights.** Same idea as F1 but on the matrix path. Tiny diff, low risk thanks to `enforceModuleConstraints` downstream safety net (but write the fix to preserve byte-identical output anyway — don't lean on the safety net).
5. **F6 — refactor temporal-noise loop to nested y/x with hoisted `y*phi²`.** One-file change, output identical, every animated GIF frame in temporal-dither mode is touched.
6. **F2 — replace wave per-row `drawImage` with a single `getImageData`/`putImageData` shift.** Larger refactor than the above but eliminates the worst loop count in the animation set. Verify visually against the test-bench wave reference before shipping.
7. **F9, F10 — small hygiene fixes.** Bundle into one cleanup PR. Low risk, modest value.
8. **F8 — confirm intent of `t=0.5` in server frame interpolation.** Don't change — *ask*. Could be a real bug worth fixing or could be deliberate. Cheap to clarify.
9. **F11 — verify GIF palette anchor ordering.** One-file read to confirm; fix only if anchor injection actually evicts colors.
10. **F12 — flatten dither result structures to typed arrays.** Bigger refactor; defer until F1/F4/F5/F6 are in and we've measured to confirm dither is still a hot path.
11. **F7 — SoA refactor of error-diffusion pixel storage.** Biggest theoretical win but biggest blast radius (every `quantize*Pixel` function changes signature). Don't take this on without a profile first; the smaller wins above probably reduce the marginal payoff.
12. **F13 — formalise the client/server frame-loop contract.** Architectural work, not perf. Track as a quality/drift-prevention task.

Notes on scan correctness preservation: items F1, F4, F5, F6 produce numerically identical output to the current code (same float arithmetic, just reorganised). F2 and F12 require visual regression checks against existing scannability tests but don't touch the matrix. F7 requires the full unit-test suite (4830) to still pass — they cover the dither code paths and would catch arithmetic drift. None of the recommendations touch the QR encoding, mask selection, `calculateOptimalVersion`, `generateFullQArtOptimal`, or `enforceModuleConstraints` — i.e. the actual modules-that-end-up-on-the-scan-grid logic is untouched.
