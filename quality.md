This file contains all quality opportunities.

Perform the work for each, do not test, only lint/fix, then commit with appropriate message to describe change and push.

I will review when done and direct you to bisect if I determine any regressions.

Attempt to complete all without requiring interaction from me.

Note these quality opportunities have not been reviewed - you should consider each as a suggestion and validate before implementing.

Keep a running log of changes/decisions in result.md


1) [HUGE][HIDPI][WEB+ANDROID] Make the preview canvas DPR-aware so the QR is crisp on Retina/high-DPI.
   - Issue: QR generator outputs in CSS px; Preview canvas draws 1:1 → soft edges on high DPI.
   - Do: render at (cssW*dpr, cssH*dpr), set canvas.style.width/height to cssW/cssH, scale ctx by dpr.
   - Where: src/hooks/useQRGenerator.ts (copy-to-display), src/components/Preview.tsx (canvas sizing).
   - Validate: scannability unchanged, no layout shift, heatmap/noise overlays match DPR too.

2) [HUGE][LUMA][DITHER][WEB+ANDROID] Replace all “gray/luma” calculations used for dithering with linear-light relative luminance.
   - Issue: rgbToGray (0.299/0.587/0.114 in sRGB) causes midtone washout + incorrect thresholds for saturated colors.
   - Do: add srgb→linear and Y = 0.2126R + 0.7152G + 0.0722B; use that in:
     - src/modules/qr-generator/pixel-matrix-dithered.ts (luma01)
     - src/modules/qr-generator/overlay-data.ts (brightness map)
     - src/modules/qr-generator/filters-preprocess.ts (histogram detection)
     - src/modules/qr-art/image-utils.ts (target mapping)
   - Keep existing rgbToGray for UI/legacy only; introduce rgbToLumaLinear() and explicitly opt-in in artifact pipeline.

3) [HUGE][COLOR][BLEND][WEB+ANDROID] Switch overlay blending (blendColors / halftone backdrops / lightening) to linear-light blending to avoid “washed out” overlays.
   - Where:
     - src/modules/core/color.ts (add blendColorsLinear / blendRgbLinear)
     - src/modules/qr-generator/render-modes.ts (blend, gapfill, duotone, halftone-dithered)
     - src/modules/qr-generator/render-loop.ts (halftone-dithered backdrop constants)
     - src/modules/qr-generator/scaled-render.ts (dither backdrop wash + subpixel rails)
   - Defaults: use linear for artifact pipeline; keep a config escape hatch (blendSpace: 'srgb'|'linear').

4) [HUGE][OVERLAY SCALE][WEB+ANDROID] Fix blocky overlay backdrop in scaled rendering by enabling smoothing ONLY for overlay backdrop draws.
   - Issue: scaled-render sets ctx.imageSmoothingEnabled=false globally; then draws overlay backdrop → blocky.
   - Do:
     - ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high' for overlay backdrop drawImage.
     - restore to false before drawing modules.
   - Where: src/modules/qr-generator/scaled-render.ts (ditherBackdrop drawImage path).

5) [HUGE][TONE MAP][DITHER][WEB+ANDROID] Add tone-preserving mapping so dithering keeps the source image’s perceived contrast (prevents “washed out” result).
   - Do: implement one of:
     - histogram matching (overlay luma → target luma range)
     - adaptive contrast (CLAHE-lite at moduleCount resolution)
     - preserve mean + stddev mapping (fast)
   - Where: src/modules/qr-generator/pixel-matrix-dithered.ts (shapeOverlayDarkness / desire field) + overlay preprocessing.
   - Default: enable mild tone-map when overlayMode in {dithered, blue_noise, halftone-dithered}.

6) [HUGE][HALFTONE][WEB+ANDROID] Replace hardcoded halftone-dithered backdrop constants (0.5, 0.46) with background-aware math.
   - Issue: fixed blend factors crush saturation or over-whiten depending on bgColor and overlayIntensity.
   - Do: compute backdrop mix from:
     - bg luminance, target min contrast, effectiveIntensity, and module darkness.
   - Where: src/modules/qr-generator/render-loop.ts (overlayModeIsHalftoneDithered block).
   - Add config: halftoneBackdropStrength default ~0.25–0.35 (not 0.46).

7) [HUGE][DITHER DEFAULTS][WEB+ANDROID] Revisit the “mix” formula and defaults so detail is preserved without over-noise.
   - Current: mix = intensity * ditherStrength * ditherScale, with ditherStrength default 0.85.
   - Do:
     - default ditherStrength to ~0.65 for preview, ~0.75 for export
     - apply easing curve (smoothstep) so the last 20% intensity doesn’t explode noise
   - Where: src/modules/qr-generator/pixel-matrix-dithered.ts.

8) [HUGE][QR-FIRST / BW][WEB+ANDROID] Improve high-contrast BW handling so it stays “true” without chunky QR artifacts.
   - Issue: bimodal BW currently either softened (blur+gamma) OR QR-first (rails 0–80 / 175–255) → can look harsh.
   - Do:
     - make softenBWImage adaptive: blur radius based on moduleCount + scale; gamma based on histogram valley depth.
     - add “edge-preserving soften” option (bilateral-lite) to keep line art crisp but ditherable.
   - Where: src/modules/qr-generator/filters-preprocess.ts (detectBimodalBW / softenBWImage).

9) [HUGE][QR-ART TARGET MAP][WEB+ANDROID] Use luminance (not average RGB) + more robust supersampling for QR-Art target extraction to reduce speckle/noise.
   - Issue: mapImageToTargetsSupersampled uses (r+g+b)/3; thresholding becomes wrong for saturated colors.
   - Do:
     - switch to linear-light luma
     - add supersampleLevel=3 (9 taps) in “quality” profile
     - compute importance from gradient magnitude (Sobel) rather than just min/max gray.
   - Where: src/modules/qr-art/image-utils.ts, src/modules/qr-art/generate.ts (resolvePerformanceSettings).

10) [HUGE][QR-ART REGULARIZATION][WEB+ANDROID] Add a “noise penalty” term during pixel ranking/selection to reduce salt-and-pepper.
   - Do:
     - penalize isolated flips (8-neighborhood)
     - prefer contiguous regions (component-aware weighting)
     - optionally blur importance map (σ ~0.6 modules)
   - Where: src/modules/qr-art/elimination.ts (rankPixelsByImportance / selectBasisVectorsForTarget / countMatchingPixels).

11) [HUGE][MASK SELECTION][QR-ART][WEB+ANDROID] Expand mask selection to optimize BOTH scannability and visual correlation (not just early heuristics).
   - Do:
     - evaluate more masks (or all 8) with a cheap proxy metric first (edge imprint + correlation)
     - then run full solver on top N masks.
   - Where: src/modules/qr-art/generate.ts (balanced mask constants, selection loop).

12) [HUGE][EXPORT QUALITY][WEB+ANDROID] Export should re-render at target resolution instead of scaling the preview canvas.
   - Issue: GIF/PNG export currently scales frames with smoothing disabled; artifacts + jaggies.
   - Do:
     - route export through generator with outputWidth/outputHeight and renderScalePerModule bumped
     - for raster: render at (targetPx) directly; avoid drawImage scaling
   - Where: src/modules/exporter/image-export.ts, gif-export.ts, useQRGenerator export paths.

13) [HUGE][GIF COLOR][EXPORT][WEB+ANDROID] Improve GIF palette strategy to reduce banding + preserve artwork colors.
   - Do:
     - sample more frames (e.g., 5–7 evenly spaced)
     - build palette from downsampled pixels across sampled frames (to cap memory)
     - add optional ordered/FS dithering before applyPalette (per-frame) when outputQuality high
   - Where: src/modules/exporter/gif-export.ts, src/modules/animation/gif-codec.ts.

14) [HUGE][COLOR PRESERVATION][DITHER][WEB+ANDROID] Preserve chroma during darkening/lightening of overlay colors.
   - Issue: current darkFactor multiplies RGB uniformly → desaturates and “muddy” colors.
   - Do:
     - convert RGB→HSL/OKLab-ish (or HSL at minimum), adjust L only, preserve S, clamp.
   - Where: src/modules/qr-generator/render-modes.ts (computeDarkFactor/computeLightBlend call sites).

15) [HUGE][SUBPIXEL][WEB+ANDROID] Re-tune subpixel rails so structure stays visible without hue drift.
   - Issue: subpixelDark/Light targets and chroma multipliers are fixed, can shift colors and flatten details.
   - Do:
     - derive rails from bg/fg luminance + desired contrast ratio
     - constrain chroma scaling to avoid clipping
   - Where: src/modules/qr-generator/scaled-render.ts (subpixel* constants).

16) [HUGE][CONSISTENCY][ANIMATION][WEB+ANDROID] Ensure per-frame dithering is temporally coherent (reduce “sparkle”).
   - Do:
     - fix noise tile seed per animation, add small per-frame offset only when temporal mode enabled
     - introduce “temporal stabilization”: blend desire field with last frame (α ~0.15) for preview
   - Where: src/modules/qr-generator/pixel-matrix-dithered.ts (temporal offsets), src/modules/dither-algorithms/temporal.ts, useQRGenerator animation loop.

17) [BIG][QUIET ZONE][WEB+ANDROID] Guarantee quiet zone integrity across ALL overlay modes, including watermark/frame.
   - Do:
     - enforce quiet zone in final raster stage (mask out overlay influence)
     - prevent watermark draw from intruding into quiet zone unless explicitly enabled
   - Where: src/modules/qr-generator/qr-generator-class.ts, src/modules/overlay/watermark.ts, scaled-render.ts.

18) [BIG][EDGE IMPRINT][DITHER][WEB+ANDROID] Reduce “top/bottom banding” by visually styling preserved functional patterns without changing their bits.
   - Do:
     - keep bits locked, but allow size/halftone *render* style (with minimum dot size + contrast clamp)
   - Where: src/modules/qr-generator/render-loop.ts (applyOverlay gating) and/or scaled-render.ts.

19) [BIG][HALFTONE CURVES][WEB+ANDROID] Replace simplistic brightnessCurve options with a proper tone curve system.
   - Do:
     - support curve presets: linear, s-curve, filmic, gamma (user-defined), “ink spread”
     - apply in linear space
   - Where: src/modules/qr-generator/render-modes.ts (applyBrightnessCurve), drawing-halftone.ts.

20) [BIG][OVERLAY PREPROCESS][WEB+ANDROID] Add “render-intent” preprocessing presets for QR overlays:
   - “Photographic”: preserve midtone detail, mild contrast, mild denoise
   - “Line Art”: edge-preserving blur, avoid washout
   - “Logo”: preserve flat fills, avoid dithering speckle
   - Where: src/modules/qr-generator/filters-preprocess.ts + store defaults.

21) [BIG][DITHER KERNEL AUTO][WEB+ANDROID] Auto-select diffusion kernel based on overlay frequency content.
   - Do:
     - measure edge density (Sobel sum) on moduleCount map
     - pick kernel: Atkinson for soft, FS for balanced, Sierra for smoother, etc.
   - Where: src/modules/qr-generator/pixel-matrix-dithered.ts.

22) [BIG][ADAPTIVE THRESHOLD][WEB+ANDROID] Make adaptive_threshold actually adaptive (local mean/variance), not a fixed formula.
   - Do:
     - local window stats (e.g., 7×7 in scaled space) → threshold = mean - k*std
   - Where: src/modules/qr-generator/pixel-matrix-dithered.ts (thresholdPattern='adaptive_threshold').

23) [BIG][COLOR DITHER][WEB+ANDROID] Implement perceptual color dithering (not per-channel RGB).
   - Do:
     - work in OKLab/linear RGB and diffuse error by luminance weight
     - keep hue stability
   - Where: src/modules/qr-generator/pixel-matrix-dithered.ts (colorDitherMode), core color utils.

24) [BIG][SPECKLE CLEANUP][DITHER][WEB+ANDROID] Upgrade cleanupSpeckle to a proper morphology pass (opening/closing) with constraints.
   - Do:
     - remove singletons but preserve thin strokes (line art)
     - make thresholds dependent on scale + moduleCount
   - Where: src/modules/qr-generator/pixel-matrix-dithered.ts (removeIsolatedSpeckles), qr-art/image-utils.ts cleanupBinaryTargets.

25) [BIG][MODULE SHAPES][WEB+ANDROID] Reduce aliasing on rounded/dots/diamond at small module sizes.
   - Do:
     - anti-alias by drawing at 2× internal resolution then downsample ONLY for non-binary styles
     - or clamp cornerRadius based on moduleSize
   - Where: src/modules/qr-generator/drawing-primitives.ts, render-loop.ts (adjustedSize logic).

26) [BIG][PIXEL SNAP DEFAULT][WEB+ANDROID] Change default pixelSnap from 'floor' → 'round' for better centering (less bias).
   - Where: src/modules/qr-generator/render-loop.ts default, store defaults.

27) [BIG][GAP MODES][WEB+ANDROID] Improve gapMode='stroke' rendering quality (consistent stroke joins, no half-pixel blur).
   - Do:
     - align stroke to pixel grid (0.5 offsets) under DPR scaling
     - set ctx.lineJoin='miter'|'round' depending on style
   - Where: render-loop.ts (strokeRect path).

28) [BIG][PALETTE + CONTRAST][WEB+ANDROID] Make contrastGuard palette-aware and background-aware to prevent “muddy” palette picks.
   - Do:
     - enforce minContrastRatio against bgColor for every chosen palette color
     - bias palette selection to keep local gradients
   - Where: src/modules/qr-generator/render-loop.ts (applyPaletteColor + ensureContrast).

29) [BIG][FRAME/WATERMARK][WEB+ANDROID] Render text watermarks with proper font metrics + hi-res rasterization for sharpness.
   - Do:
     - render text watermark at 2× (or DPR) and downsample
     - add optional stroke/halo for legibility without washing out
   - Where: src/modules/overlay/watermark.ts.

30) [BIG][WATERMARK BLEND][WEB+ANDROID] Use linear-light compositing for watermark blend modes.
   - Issue: canvas blend modes are sRGB-ish and can reduce perceived contrast.
   - Do: pre-blend watermark pixels in linear, then draw normal (optional high-quality path).
   - Where: overlay/watermark.ts (when blend != 'normal').

31) [BIG][SCAN GATE VISUAL][WEB+ANDROID] When scan gate applies a patch (occupancy changes), keep the *art look* stable by adjusting tone curve instead of flipping random pixels.
   - Do:
     - prefer adjustments in low-importance regions
     - keep large structures untouched
   - Where: src/modules/qr-generator/qr-generator-class.ts (dither attempt patching), pixel-matrix-dithered.ts (enforceModuleConstraints candidate scoring).

32) [BIG][OCCUPANCY MAP QUALITY][DITHER][WEB+ANDROID] Revisit default darkMinOccupancy/lightMaxOccupancy so detail survives while scan-safe.
   - Do:
     - tie defaults to ECC level (L can be looser, H stricter)
     - increase center-zone weighting only when decode risk detected
   - Where: pixel-matrix-dithered.ts enforceModuleConstraints, qr-generator-class.ts scan gate patch defaults.

33) [BIG][FUNCTIONAL PATTERN STYLE][WEB+ANDROID] Optional “styled preservations” that keep bits correct but match artwork.
   - Do:
     - for timing/alignment, allow color sampling but clamp luma to rails
     - for format/version, keep pure B/W but allow subtle dot size changes
   - Where: scaled-render.ts + render-loop.ts + render-modes.ts.

34) [BIG][OVERLAY COLOR SPACE][WEB+ANDROID] Apply overlay filters (brightness/contrast/saturation/gamma) in linear space for fidelity.
   - Where: src/modules/overlay/apply-filters.ts (overlay module), filters-preprocess.ts call sites.

35) [BIG][CROP/RESIZE QUALITY][WEB+ANDROID] Use multi-step downscale for large images to avoid moiré and preserve detail.
   - Do: downscale 0.5× repeatedly with smoothing high (or Lanczos-like) before final moduleCount map.
   - Where: overlay transforms / preprocessing pipeline (overlay-transforms.ts, overlay module).

36) [BIG][DITHER BACKDROP DEFAULTS][WEB+ANDROID] Reduce default ditherBackdropWash (0.18) and make it adaptive.
   - Rule: stronger wash only when bg is very bright and overlay is very dark, otherwise it kills contrast.
   - Where: scaled-render.ts.

37) [BIG][HALFTONE DOT LIMITS][WEB+ANDROID] Set better defaults for dotMinRadiusPx/dotMaxRadiusPx and tie to scale/moduleSize.
   - Where: config defaults, drawing-halftone.ts.

38) [BIG][DUOTONE QUALITY][WEB+ANDROID] Improve duotone mapping so highlights/shadows don’t clip.
   - Do: map brightness through a filmic curve; preserve midtone separation; blend in linear.
   - Where: render-modes.ts duotone section.

39) [BIG][VECTOR SVG][EXPORT][WEB+ANDROID] Improve vector SVG fidelity: match module styles + halftone where possible.
   - Do:
     - add Path2D output per module style
     - optional “raster embed overlay” for modes not representable as vectors
   - Where: src/modules/exporter/vector-svg.ts, svg-export.ts.

40) [BIG][PNG METADATA][EXPORT] Ensure embedded PNG metadata doesn’t degrade pixel data / color.
   - Do:
     - confirm chunk insert preserves bytes exactly
     - optionally add sRGB chunk and gAMA chunk (validate viewers)
   - Where: exporter/png-metadata.ts.

41) [MED][QR-ART CLEANUP][WEB+ANDROID] After solver output, run a constrained cleanup pass to remove tiny islands (without breaking decode).
   - Do:
     - detect small components in data region only (exclude functional)
     - flip if improves correlation AND does not violate scan heuristics
   - Where: qr-art/generate.ts (post-processing step).

42) [MED][QR-ART THRESHOLD][WEB+ANDROID] Make QR-Art threshold adaptive based on image histogram rather than fixed 128.
   - Where: qr-art/image-utils.ts (threshold param), generate.ts.

43) [MED][IMPORTANCE MAP][QR-ART] Use edge-aware importance (Sobel magnitude) for pixel ranking.
   - Where: qr-art/image-utils.ts, elimination.ts.

44) [MED][NOISE TILE QUALITY][DITHER] Allow larger blueNoiseTileSize default on export (e.g., 128) to reduce repeating patterns.
   - Where: pixel-matrix-dithered.ts default tile size + store.

45) [MED][ORDERED MATRICES] Add void-and-cluster matrices tuned for QR scale (reduce visible grid).
   - Where: dither-algorithms/matrices.ts, kernels.ts.

46) [MED][ANIMATION INTERPOLATION] Interpolate in linear-light for smoother fades and less banding.
   - Where: src/modules/animation/interpolate-frames.ts, color-cycle.ts.

47) [MED][ANIMATION RESAMPLE] When generating animation frames from source media, resample with smoothing high before per-module processing.
   - Where: animation/parsing.ts and overlay preprocessing per frame.

48) [MED][GIF DISPOSAL] Pick disposal mode automatically based on frame differences to reduce ghosting.
   - Where: exporter/gif-export.ts.

49) [MED][GIF TRANSPARENCY] If transparentBackground, ensure palette reserves a stable transparent index and doesn’t dither into it.
   - Where: gif-export.ts + gif-codec.ts (palette handling).

50) [MED][STROKE/OUTLINE MODES] For outline-only modes, add hinting: thickness scales with DPR and moduleSize.
   - Where: render-loop.ts.

51) [MED][TEXT RENDERING] If frame text present, render at DPR scale and downsample for crisp anti-aliased typography.
   - Where: drawing-frames.ts.

52) [MED][LOGO/EMBED] Center logo compositing should be linear-light + preserve edges (optional subtle outline).
   - Where: drawing-frames.ts (drawCenterLogo), overlay module.

53) [MED][CONTRAST AUTO] Add “auto contrast guard” when safety mode on: increase fg/bg separation before overlay.
   - Where: store defaults + generator config normalization.

54) [MED][FILTER PRESETS] Add safe “QR-optimized” presets (contrast + slight gamma + slight sharpen) selectable per overlay type.
   - Where: store/UI mapping + filters-preprocess.ts.

55) [MED][EDGE DETECT MODE] For edge-detect filters, add a “soft edge” mode to avoid harsh outlines that dither poorly.
   - Where: filters-edge.ts.

56) [MED][PALETTE GRADIENT] Add palette interpolation (not nearest bucket) for smoother color transitions.
   - Where: applyPaletteColor.

57) [MED][RANDOMNESS] Ensure all randomness in artifact generation is seeded (unless user opts into random).
   - Where: temporal noise, jitter, some noise generation.

58) [MED][DITHER STRENGTH UI] Normalize ditherStrength semantics (0–100 everywhere) and apply consistent mapping.
   - Where: pixel-matrix-dithered.ts (rawStrength handling), UI/store.

59) [MED][SCANNABILITY METRICS] Add a “quality meter” that reports:
   - artCorrelation, edgeImprint, occupancy violations, finder/timing contrast
   - without changing output; helps tune defaults.
   - Where: qr-generator-class.ts + pixel-matrix-dithered.ts metrics.

60) [MED][SUBPIXEL GRID] Add grid-size-specific tuning presets (2x2 vs 3x3 vs 4x4) for chroma/luma rails.
   - Where: scaled-render.ts.

61) [LOW][RENDER ORDER] For certain overlay modes, draw light modules (if needed) before dark to avoid blend artifacts.
   - Where: render-loop.ts.

62) [LOW][CLAMPING] Audit all clamp ranges that currently silently clip highlights/shadows; adjust to preserve dynamic range.
   - Where: render-modes.ts (computeDarkFactor, computeLightBlend, duotone lighten), scaled-render.ts.

63) [LOW][MARGIN ROUNDING] Avoid Math.round in size math when it causes 1px drift; prefer floor/ceil consistently.
   - Where: scaled-render.ts (size calculation), qr-generator-class.ts.

64) [LOW][GRADIENT FILL] Ensure gradients are computed in linear-light (optional) and match bg/fg contrast needs.
   - Where: drawing-gradients.ts + core.

65) [LOW][MOSAIC/PIXELATE MODES] For pixelate/pattern modes, use perceptual averaging instead of simple RGB average.
   - Where: render-modes.ts pixelate.

66) [LOW][DUOTONE FALLBACK] When only one duotone color provided, compute highlight from bgColor and preserve contrast.
   - Where: render-modes.ts (DUOTONE_MAX_LIGHTEN logic).

67) [LOW][BIMODAL DETECT] Use linear luminance in detectBimodalBW histogram; current gray can misclassify saturated images.
   - Where: filters-preprocess.ts.

68) [LOW][SOFTEN AMOUNTS] Expose soften blur radius/gamma to config so QA can tune for specific bad cases.
   - Where: filters-preprocess.ts.

69) [LOW][COLOR MODE CONSISTENCY] Ensure colorMode rules are identical across:
   - overlayData extraction
   - render-loop overlay modes
   - scaled-render path
   - qr-art coloring output
   - Where: overlay-data.ts, render-loop.ts, scaled-render.ts, qr-art/generate.ts.

70) [LOW][WATERMARK SAFE AREA] Add “safe margin” option to keep watermark away from QR modules entirely.
   - Where: overlay/watermark.ts.

71) [LOW][EXPORT DPI] If dpi setting exists, ensure it influences output metadata and (optionally) physical sizing.
   - Where: exporter/image-export.ts, png-metadata.ts.

72) [LOW][PNG COMPRESSION] Use better PNG compression settings (if using canvas->blob you’re limited; otherwise via encoder).
   - Where: exporter/image-export.ts (only if adding a PNG encoder is acceptable).

73) [LOW][SVG STROKE ALIGN] When exporting SVG with strokes/gaps, align to pixel grid to avoid hairline artifacts.
   - Where: vector-svg.ts.

74) [LOW][QA SNAPSHOTS] Add golden-image fixtures for:
   - dithering (color photo, line art, high-contrast spiral)
   - halftone-dithered
   - subpixel
   - qr-art
   - animation GIF export
   - Where: tests/ (new snapshot harness).

75) [LOW][DEFAULTS PACK] Revisit these fixed constants and retune with the new perf headroom:
   - src/modules/qr-generator/render-modes.ts:
     - computeDarkFactor minFactor defaults
     - computeLightBlend maxBlend defaults
     - DUOTONE_MAX_LIGHTEN
     - applyBrightnessCurve gamma exponent (0.7)
   - src/modules/qr-generator/scaled-render.ts:
     - ditherBackdropAlpha default (0.4)
     - ditherBackdropWash default (0.18)
     - subpixel luma rails + chroma multipliers
   - src/modules/qr-generator/pixel-matrix-dithered.ts:
     - shapeOverlayDarkness gammaLift/midBoost weights
     - gaussian01 sigma (0.18) / triangular noise distribution
     - default ditherStrength (0.85)
   - src/modules/qr-generator/filters-preprocess.ts:
     - soften blur radius (3), soften gamma (0.65)
   - src/modules/qr-art/generate.ts:
     - BALANCED_MASK_* thresholds
     - quality profile supersampleLevel (2), candidateFraction (1)
     - speckle area thresholds (2/2)

76) [LOW][DOCUMENTATION] Add a “Quality Guide” describing:
   - why images wash out (color space + blend + rails)
   - which modes are best for photos vs line art
   - recommended defaults per mode and device class
   - Where: knowledge.md + new quality.md.

77) [LOW][SAFETY] When safety.mode != off, automatically clamp any quality settings that risk decode (document exactly).
   - Where: store config normalization + qr-generator-clas.ts scan gate.

78) [LOW][UI SATISFACTION] Add a one-click “Make it look like the photo” preset:
   - enables tone map, linear blend, mild denoise, correct luma, export rerender
   - Where: store presets.

79) [LOW][UI SATISFACTION] Add a one-click “Clean QR-Art” preset:
   - supersample 3, edge-aware importance, stronger speckle cleanup, regularization on
   - Where: store presets + qr-art performance profile.

80) [LOW][VALIDATE] For every change: re-check that ALL existing options are still honored identically across:
   - preview vs export
   - static vs animation
   - web vs android
   - scaled vs non-scaled path
   - and update result.md decisions/notes as you go.
