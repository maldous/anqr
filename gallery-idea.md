
  Created files:
  -  scripts/lib/gallery-permutations.mjs  (39KB) — Shared permutation engine generating exactly 1000 unique QR configs (334 non-overlay, 333 overlay, 333 artwork) across 5 payload types, 6 image fixtures, and all feature dimensions
  -  scripts/generate-gallery-remote.mjs  — Renders all 1000 via anqr.link API with retry/polling, scan verification, and JSON reporting
  -  scripts/generate-gallery-local.mjs  — Renders all 1000 locally via QRGenerator + @napi-rs/canvas with comprehensive param-to-config mapping
  -  scripts/generate-gallery-browser.mjs  — Renders all 1000 via Playwright browser screenshots with canvas detection and welcome modal dismissal

# Gallery Generation Plan

## Overview

Generate a comprehensive gallery covering **100% of every QR code option** via programmatic
permutation. Exactly **1,000 unique configs** split evenly: **333 non-overlay, 333 overlay, 333 artwork**.

Three rendering modes produce the same configs for comparison (remote API, local code, browser test).

## Payloads

Five payload types are used. **Artwork uses URL only.** Non-overlay and overlay
rotate through all five to showcase payload variety.

| ID | Payload String | Type |
|----|---------------|------|
| `url` | `https://anqr.link` | URL |
| `phone` | `tel:+12345550000` | Phone |
| `email` | `mailto:email@anqr.link` | Email |
| `geo` | `geo:38.90,-77.04` | Geolocation |
| `wifi` | `WIFI:T:WPA2;S:WIFI;P:;;` | WiFi |

Distribution: ~80% URL, ~5% each for phone/email/geo/wifi (applied via round-robin
on the scenario list after generation).

## Fixed Globals (all images)

| Setting | URL Param | Value |
|---------|-----------|-------|
| Version | `v` | 6 |
| MaskPattern | `matrix` | auto |
| AlignmentStyle | `align` | match_finder |
| TimingStyle | `timing` | match_module |
| GapPercent | `gap` | 10 |
| GradientAngle | `gradAngle` | 135 |
| CornerRadius | `radius` | 25 |
| DotRotation | `dotRot` | 22 |
| ModulePx | `modulePx` | 12 |
| AnimFrames | `animFrames` | input frame count (max 64) |
| AnimSpeed | `animSpeed` | 100 |
| Jitter | `jitter` | 0 |
| WatermarkPosition | `wmPos` | bottom-center |
| GifPaletteSize | `gifPal` | 256 |
| GifMaxFps | `gifMaxFps` | 30 |
| Width | `w` | 240 |
| Height | `h` | 240 |
| FrameText | `frameText` | ANQR |

## Fixtures (overlay & artwork only)

| ID | File | Type |
|----|------|------|
| tsunami | public/tsunami.jpg | Static |
| logo | public/logo.png | Static |
| test | public/test.png | Static |
| trump | public/trump.png | Static |
| king | public/king.gif | Animated |
| dance | public/dance.gif | Animated |

---

## Categories

### 1. Non-Overlay (333 configs)

QR codes with **no overlay image**. Showcases render styles, colors, gradients,
frames, encoding, animation patterns, watermarks, and payload types.

Includes **1 blank default** (all defaults, no special features).

#### Non-Overlay Dimension Sweeps

Single-axis sweeps (vary one dimension, keep all else at defaults):

| Dimension | Param | Values | Sweep Count |
|-----------|-------|--------|-------------|
| *(blank default)* | — | *(all defaults)* | **1** |
| *(payload samples)* | `data` | phone, email, geo, wifi | **4** |
| ModuleStyle | `style` | rounded, dots, diamond, connected | **4** |
| FinderStyle | `finder` | rounded, circle | **2** |
| GapMode | `gapMode` | inset, stroke, negative_space | **3** |
| FrameStyle | `frame` | rounded_frame, sticker, tag | **3** |
| GradientType | `grad` | linear, radial, conic | **3** |
| GradientStops | `gradStops` | 5 multi-color presets | **5** |
| EyeOuter | `eyeOuter` | rounded, circle | **2** |
| EyeInner | `eyeInner` | rounded, circle | **2** |
| EyeScale | `eyeScale` | 80, 120 | **2** |
| PerModuleColorMode | `modColor` | by_brightness, by_position, by_cluster | **3** |
| PaletteMode | `paletteMode` | position, brightness, diagonal, radial, random, row, column | **7** |
| Palette | `palette` | 5 presets | **5** |
| PixelSnap | `snap` | floor, ceil | **2** |
| CrispEdges | `crisp` | 1 | **1** |
| BgTransparent | `transparent` | 1 | **1** |
| FgColor | `fg` | #1a1a6c, #8b0000, #006400, #4a0080, #2c3e50 | **5** |
| BgColor | `bg` | #f5f5dc, #e8f5e9, #fff8e1, #f3e5f5, #fafafa | **5** |
| ContrastGuard | `cGuard` | 1 | **1** |
| MinContrast | `minContrast` | 3.0, 4.5, 7.0 | **3** |
| ECCLevel | `ec` | L, M, Q | **3** |
| EncodingMode | `enc` | byte, alphanumeric | **2** |
| AutoEcc | `autoEcc` | 1 | **1** |
| AutoVersion | `autoVer` | 1 | **1** |
| BorderModules | `border` | 0, 2, 4 | **3** |
| QuietZoneEnforce | `qzEnforce` | 1 | **1** |
| AnimPattern | `animPattern` | pulse, wave, scanline, shimmer, drift | **5** |
| Easing | `easing` | ease-in, ease-out, ease-in-out, bounce | **4** |
| Interpolation | `interp` | crossfade, morph | **2** |
| TempDither | `tempDither` | blue_noise, flicker_safe | **2** |
| Bounce | `bounce` | 1 | **1** |
| Reverse | `reverse` | 1 | **1** |
| ColorCycle | `colorCycle` | 1 | **1** |
| AnimSeed | `animSeed` | 42, 123, 999 | **3** |
| WmEnabled+Kind | `wmEn`+`wmKind` | text, pattern | **2** |
| WmText | `wmText` | ANQR, SAMPLE, anqr.link | **3** |
| WmBlend | `wmBlend` | normal, multiply, screen, overlay, soft-light | **5** |
| WmOpacity | `wmOpacity` | 0.3, 0.6, 1.0 | **3** |
| GifQuant | `gifQuant` | neuquant, octree | **2** |
| GifDith | `gifDith` | floyd, ordered | **2** |
| GifColors | `gifColors` | 32, 128 | **2** |
| GifTrans | `gifTrans` | 1 | **1** |
| **Single-axis subtotal** | | | **~118** |

#### Non-Overlay Cross-Products

| Cross-Product | Formula | Count |
|---------------|---------|-------|
| Style × Finder | 5 × 3 − 7 overlap | **8** |
| Style × GapMode(non-none) | 4 × 3 | **12** |
| Style × Gradient | 4 × 3 | **12** |
| Style × Frame | 4 × 3 | **12** |
| Frame × Gradient | 3 × 3 | **9** |
| EyeOuter × EyeInner (mismatches) | 3 × 3 − 3 diagonal | **6** |
| FgColor × Gradient | 5 × 3 | **15** |
| FgColor × BgColor (unique pairs) | 10 curated | **10** |
| ModColor × Palette | 3 × 5 | **15** |
| AnimPattern × Easing | 5 × 4 | **20** |
| AnimPattern × Style | 5 × 3 | **15** |
| AnimPattern × Flags (bounce/reverse/colorCycle) | 5 × 4 combos | **20** |
| AnimPattern × Gradient | 5 × 3 | **15** |
| Watermark × Style | 2 × 5 | **10** |
| Watermark × Blend × Opacity | curated | **6** |
| Multi-feature power combos | curated | **30** |
| **Cross-product subtotal** | | **~215** |

**Non-overlay total: 118 + 215 = 333** ✓

*(Generator trims/adds from cross-product pool to hit exactly 333 after dedup.)*

---

### 2. Overlay (333 configs)

QR codes with **overlay images**. Each config uses one of the 6 fixtures.
Showcases overlay modes, dithering, color modes, filters, preservation, and more.

#### Overlay Dimension Sweeps

Base coverage: each overlay mode × representative fixtures.

| Dimension | Param | Values | Per-fixture | Count |
|-----------|-------|--------|-------------|-------|
| OverlayMode × 3 fixtures | `mode` | 17 modes × 3 (tsunami, logo, king) | — | **51** |
| OverlayMode × 3 fixtures | `mode` | 17 modes × 3 (test, trump, dance) | — | **51** |
| ColorMode | `colorMode` | color, grayscale, bw × 2 fixtures | — | **6** |
| FitMode | `fit` | cover, contain, stretch × 2 fixtures | — | **6** |
| Intensity | `intensity` | 30, 50, 70, 85, 100 × 1 fixture | — | **5** |
| LogoSize (center mode) | `logoSize` | 15, 25, 40 × 1 fixture | — | **3** |
| DitherKind | `ditherKind` | 16 kinds × 1 fixture | — | **16** |
| DiffusionKernel | `diffusionKernel` | 8 kernels × 1 fixture | — | **8** |
| DitherStrength | `ditherStrength` | 25, 50, 75, 100 × 1 fixture | — | **4** |
| SubpixelGrid | `spGrid` | 2, 3, 4 × 1 fixture | — | **3** |
| SubpixelCenter | `spCenter` | strict, halftone × 1 fixture | — | **2** |
| SubpixelFinder | `spFinder` | solid, stylized × 1 fixture | — | **2** |
| SubpixelNeutral | `spNeutral` | 3 colors × 1 fixture | — | **3** |
| SubpixelGridNum | `spGridNum` | 1, 2, 3 × 1 fixture | — | **3** |
| HalftoneCell | `htCell` | 2 modes × 1 fixture | — | **2** |
| HalftoneDot | `htDot` | circle, square, line × 1 fixture | — | **3** |
| HalftoneCurve | `htCurve` | linear, s-curve, gamma × 1 fixture | — | **3** |
| Duotone combos | `duo1`+`duo2` | 5 pairs × 1 fixture | — | **5** |
| Brightness | `brightness` | -50, -25, 25, 50 × 1 fixture | — | **4** |
| Contrast | `contrast` | -50, -25, 25, 50 × 1 fixture | — | **4** |
| Gamma | `gamma` | 0.5, 0.75, 1.5, 2.0 × 1 fixture | — | **4** |
| Sharpen | `sharpen` | 25, 50, 100 × 1 fixture | — | **3** |
| Blur | `blur` | 1, 3, 5 × 1 fixture | — | **3** |
| Edge | `edge` | 1 × 1 fixture | — | **1** |
| Posterize | `posterize` | 3, 4, 6, 8 × 1 fixture | — | **4** |
| Hue | `hue` | 60, 120, 180, 240, 300 × 1 fixture | — | **5** |
| Saturation | `saturation` | -100, -50, 50, 100 × 1 fixture | — | **4** |
| Invert | `invert` | 1 × 1 fixture | — | **1** |
| Threshold | `threshold` | 64, 128, 192 × 1 fixture | — | **3** |
| CropEnabled | `cropEn` | 1 + 3 presets × 1 fixture | — | **3** |
| FlipX | `flipX` | 1 × 1 fixture | — | **1** |
| FlipY | `flipY` | 1 × 1 fixture | — | **1** |
| Rotation | `rot` | 90, 180, 270 × 1 fixture | — | **3** |
| KeepFinders | `keepFinders` | 0, 1 × 1 fixture | — | **2** |
| KeepTiming | `keepTiming` | 0, 1 × 1 fixture | — | **2** |
| KeepAlignment | `keepAlign` | 0, 1 × 1 fixture | — | **2** |
| ProtectFormat | `protectFmt` | 1 × 1 fixture | — | **1** |
| ProtectVersion | `protectVer` | 1 × 1 fixture | — | **1** |
| LockFinders | `lockF` | 1 × 1 fixture | — | **1** |
| LockTiming | `lockT` | 1 × 1 fixture | — | **1** |
| LockAlignment | `lockA` | 1 × 1 fixture | — | **1** |
| EccAware | `eccAware` | 1 × 1 fixture | — | **1** |
| EccRisk | `eccRisk` | 25, 50, 75 × 1 fixture | — | **3** |
| EccMap | `eccMap` | distance, block, empirical × 1 fixture | — | **3** |
| **Single-axis subtotal** | | | | **~238** |

#### Overlay Cross-Products

| Cross-Product | Formula | Count |
|---------------|---------|-------|
| Mode × ColorMode | 5 popular modes × 2 non-default colors × 1 fixture | **10** |
| Mode × FitMode | 5 modes × 2 non-default fits × 1 fixture | **10** |
| Mode × RenderStyle | 3 modes × 4 styles × 1 fixture | **12** |
| Mode × Gradient | 3 modes × 3 gradients × 1 fixture | **9** |
| Mode × DitherKind | dithered × 5 dither kinds × 1 fixture | **5** |
| Overlay+Anim | 3 modes × 2 patterns × 2 animated fixtures | **12** |
| Preservation combos | 6 curated preserve/lock combinations × 2 fixtures | **12** |
| Filter combos | curated multi-filter × 2 fixtures | **10** |
| Payload variety | 4 non-URL payloads × mode × fixture | **15** |
| **Cross-product subtotal** | | **~95** |

**Overlay total: 238 + 95 = 333** ✓

*(Generator trims/adds from cross-product pool to hit exactly 333 after dedup.)*

---

### 3. Artwork (333 configs)

QR Art mode (`mode=artwork`). Payload is **always** `https://anqr.link` — the server
computes the `#nnnn..` suffix via Reed-Solomon data manipulation to embed the image.

Artwork is a **type of overlay** with a very limited subset of options:
- Only render-level styling applies (module style, finder, colors, gradients, frames, gaps, eyes)
- No dither/filter/color-mode/fit/intensity/preservation controls (handled internally by RS algorithm)
- ECC is typically L or M (artwork needs maximum data capacity for image embedding)
- Works with **both static and animated** inputs (animated → GIF output)

**Strategy**: 6 fixtures × ~55–56 style combinations per fixture = 333

#### Artwork Dimensions (per fixture)

| Dimension | Param | Values | Sweep Count |
|-----------|-------|--------|-------------|
| *(base default)* | — | *(all defaults, ECC=L)* | **1** |
| ModuleStyle | `style` | rounded, dots, diamond, connected | **4** |
| FinderStyle | `finder` | rounded, circle | **2** |
| GapMode | `gapMode` | inset, stroke, negative_space | **3** |
| FrameStyle | `frame` | rounded_frame, sticker, tag | **3** |
| GradientType | `grad` | linear, radial, conic | **3** |
| EyeOuter | `eyeOuter` | rounded, circle | **2** |
| EyeInner | `eyeInner` | rounded, circle | **2** |
| FgColor | `fg` | #1a1a6c, #8b0000, #006400, #4a0080, #2c3e50 | **5** |
| BgColor | `bg` | #f5f5dc, #e8f5e9, #fff8e1 | **3** |
| ECC | `ec` | M | **1** |
| **Per-fixture sweep subtotal** | | | **~29** |

#### Artwork Cross-Products (per fixture)

| Cross-Product | Formula | Count |
|---------------|---------|-------|
| Style × Finder | 4 × 2 | **8** |
| Style × Gradient | 4 × 3 | **12** |
| Style × Frame | 4 × 3 − 4 trim | **8** |

Per-fixture cross-product subtotal: **~28**

#### Per-Fixture Totals

| Fixture Type | Sweeps | Cross-Products | Subtotal |
|-------------|--------|----------------|----------|
| Static (×4: tsunami, logo, test, trump) | 29 | 26 | **55** |
| Animated (×2: king, dance) | 29 | 28* | **57** |

*Animated fixtures get 2 extra: animation pattern variants (shimmer, wave)*

**Artwork total: (4 × 55) + (2 × 57) = 220 + 114 = 334 → trim 1 = 333** ✓

*(Generator trims from animated cross-product pool to hit exactly 333.)*

---

## Grand Total

| Category | Static (PNG) | Animated (GIF) | Total |
|----------|-------------|----------------|-------|
| Non-overlay | ~240 | ~93 | **333** |
| Overlay | ~235 | ~98 | **333** |
| Artwork | ~220 | ~114 | **333** |
| **All** | **~695** | **~305** | **1,000** |

Plus 1 blank default in non-overlay (included in the 333 count).

---

## Rendering Modes

Each category is rendered three ways:

| Mode | How | Output Directory |
|------|-----|------------------|
| **Remote** | HTTP GET to `https://anqr.link/api/qr?...` | `reports/gallery-artifacts/{category}/remote/` |
| **Local** | Direct call to `QRGenerator` class (Node, no browser) | `reports/gallery-artifacts/{category}/local/` |
| **Browser** | Puppeteer loads `http://localhost:5173/?...` and screenshots | `reports/gallery-artifacts/{category}/browser/` |

All three modes use the **same 1,000 configs** and should produce identical (or near-identical) images.
Each mode writes `passed.txt` and `failed.txt` listing filenames.

| Mode | 1,000 images | Notes |
|------|-------------|-------|
| Remote API | ~1–3 hours | Network-bound, concurrency 6; artwork slow (~30–120s each) |
| Local | ~30–90 min | CPU-bound; artwork still slow |
| Browser | ~2–4 hours | Puppeteer overhead |

**Grand total across all modes: 3,000 images**

---

## Permutation Strategy

**NOT** a full cartesian product. Two layers ensure 100% value coverage:

### Layer 1: Single-Axis Sweeps
For each dimension, iterate over all **non-default** values while keeping everything else
at defaults. Guarantees every option value appears in at least one image.

### Layer 2: Cross-Product Combos
For visually meaningful pairs, generate the full cross-product.
After generation, deduplicate by serialized URL params and trim/pad
to hit exactly 333 per category.

### Payload Assignment
After scenario generation, assign payloads via round-robin:
- Every 5th non-overlay/overlay scenario cycles through phone → email → geo → wifi → url
- ~80% of scenarios use URL, ~5% each for the other four
- All artwork scenarios use URL exclusively

### Deduplication
Serialize each config as sorted URL params string. Drop exact duplicates.
Trim excess from largest cross-product group or pad with more combos.

---

## Script Architecture

### Shared: `scripts/lib/gallery-permutations.mjs`

Central module that programmatically generates all 1,000 scenario configs:

```javascript
export const FIXED = {
  v: 6, matrix: 'auto', align: 'match_finder', timing: 'match_module',
  gap: 10, gradAngle: 135, radius: 25, dotRot: 22, modulePx: 12,
  animSpeed: 100, jitter: 0, wmPos: 'bottom-center',
  gifPal: 256, gifMaxFps: 30, w: 240, h: 240, frameText: 'ANQR',
};

export const PAYLOADS = [
  { id: 'url',   data: 'https://anqr.link' },
  { id: 'phone', data: 'tel:+12345550000' },
  { id: 'email', data: 'mailto:email@anqr.link' },
  { id: 'geo',   data: 'geo:38.90,-77.04' },
  { id: 'wifi',  data: 'WIFI:T:WPA2;S:WIFI;P:;;' },
];

export const FIXTURES = [
  { id: 'tsunami', path: '/tsunami.jpg', animated: false },
  { id: 'king',    path: '/king.gif',    animated: true },
  { id: 'logo',    path: '/logo.png',    animated: false },
  { id: 'test',    path: '/test.png',    animated: false },
  { id: 'trump',   path: '/trump.png',   animated: false },
  { id: 'dance',   path: '/dance.gif',   animated: true },
];

export const MODULE_STYLES = ['square', 'rounded', 'dots', 'diamond', 'connected'];
export const FINDER_STYLES = ['square', 'rounded', 'circle'];
export const GAP_MODES = ['none', 'inset', 'stroke', 'negative_space'];
export const FRAME_STYLES = ['rounded_frame', 'sticker', 'tag'];
export const GRADIENT_TYPES = ['linear', 'radial', 'conic'];
export const EYE_OUTERS = ['square', 'rounded', 'circle'];
export const EYE_INNERS = ['square', 'rounded', 'circle'];
export const OVERLAY_MODES = [
  'center', 'blend', 'halftone', 'halftone-dithered', 'mosaic', 'gapfill',
  'brightness', 'duotone', 'subpixel', 'dithered', 'blue-noise', 'pixelate',
  'outline', 'wave', 'subpixel-size', 'dither', 'extreme'
];
export const DITHER_KINDS = [
  'error_diffusion', 'ordered_bayer', 'ordered_clustered', 'ordered_void_cluster',
  'blue_noise_threshold', 'true_dither', 'blue_noise', 'white_noise',
  'gaussian_noise', 'triangular_noise', 'blue_noise_error_diffusion',
  'screened_blue_noise', 'perceptual', 'edge_aware', 'adaptive_threshold',
  'temporal_blue_noise'
];
export const DIFFUSION_KERNELS = [
  'floyd_steinberg', 'jarvis_judice_ninke', 'stucki', 'burkes',
  'sierra', 'sierra_2', 'sierra_lite', 'atkinson'
];
export const ANIM_PATTERNS = ['pulse', 'wave', 'scanline', 'shimmer', 'drift'];
export const EASINGS = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bounce'];
export const COLOR_MODES = ['color', 'grayscale', 'bw'];
export const FIT_MODES = ['cover', 'contain', 'stretch'];
export const WATERMARK_BLENDS = ['normal', 'multiply', 'screen', 'overlay', 'soft-light'];

export function generateNonOverlayScenarios(): Config[]  // → exactly 333
export function generateOverlayScenarios(): Config[]     // → exactly 333
export function generateArtworkScenarios(): Config[]     // → exactly 333
export function generateAllScenarios(): Config[]         // → exactly 1000
```

### Per-mode scripts

| Script | Mode |
|--------|------|
| `scripts/generate-gallery-remote.mjs` | Remote API (all 3 categories) |
| `scripts/generate-gallery-local.mjs` | Local QRGenerator (all 3 categories) |
| `scripts/generate-gallery-browser.mjs` | Puppeteer screenshots (all 3 categories) |

Legacy scripts (`generate-gallery-nooverlay.mjs`, `generate-gallery-qrart.mjs`) are
replaced by the unified scripts above.

### Existing script mapping

| Old Target | New Target |
|-----------|-----------|
| `gallery:overlay` | `gallery:remote` (overlay subset) |
| `gallery:nooverlay` | `gallery:remote` (nooverlay subset) |
| `gallery:qrart` | `gallery:remote` (artwork subset) |

---

## Makefile Targets

```makefile
# Unified targets (recommended)
gallery:remote           # All 1,000 configs via anqr.link API
gallery:local            # All 1,000 configs via local QRGenerator
gallery:browser          # All 1,000 configs via Puppeteer

# Per-category remote (for focused runs)
gallery:remote:nooverlay # 333 non-overlay via API
gallery:remote:overlay   # 333 overlay via API
gallery:remote:artwork   # 333 artwork via API

# Aggregate
gallery:all              # All 3 modes × 1,000 = 3,000 images
```

Environment variable filters (all optional):
```bash
GALLERY_CATEGORY=nooverlay,overlay,artwork  # Filter categories
GALLERY_SCENARIOS=style-rounded,anim-pulse  # Filter by scenario ID
GALLERY_FIXTURES=tsunami,king               # Filter fixtures (overlay/artwork)
GALLERY_API_URL=https://anqr.link/api/qr    # API endpoint
GALLERY_CONCURRENCY=6                       # Parallel requests
```

---

## Output Structure

```
reports/gallery-artifacts/
├── nooverlay/
│   ├── remote/
│   │   ├── nooverlay__default.png
│   │   ├── nooverlay__style-rounded.png
│   │   ├── nooverlay__anim-pulse.gif
│   │   ├── nooverlay__phone__style-dots.png
│   │   ├── ...
│   │   ├── passed.txt
│   │   └── failed.txt
│   ├── local/
│   │   └── ... (same filenames)
│   └── browser/
│       └── ...
├── overlay/
│   ├── remote/
│   │   ├── overlay__dithered__tsunami.png
│   │   ├── overlay__blend__king.gif
│   │   ├── overlay__wifi__mosaic__logo.png
│   │   ├── ...
│   │   ├── passed.txt
│   │   └── failed.txt
│   ├── local/
│   │   └── ...
│   └── browser/
│       └── ...
├── artwork/
│   ├── remote/
│   │   ├── artwork__default__tsunami.png
│   │   ├── artwork__style-rounded__tsunami.png
│   │   ├── artwork__style-dots__finder-circle__king.gif
│   │   ├── ...
│   │   ├── passed.txt
│   │   └── failed.txt
│   ├── local/
│   │   └── ...
│   └── browser/
│       └── ...
└── summary.json          # Merged report across all modes
```

## File Naming Convention

```
{category}__{payload?}__{scenario-id}__{fixture?}.{png|gif}
```

- Payload prefix only for non-URL payloads: `phone__`, `email__`, `geo__`, `wifi__`
- URL payload has no prefix (default)
- Fixture suffix only for overlay/artwork
- Animated fixtures → `.gif`, static → `.png`
- Animation scenarios (non-overlay) → `.gif`

Examples:
- `nooverlay__default.png` — blank default
- `nooverlay__style-rounded.png` — rounded modules, URL payload
- `nooverlay__phone__style-dots.png` — dots style, phone payload
- `nooverlay__anim-pulse.gif` — pulse animation
- `overlay__dithered__tsunami.png`
- `overlay__wifi__blend__king.gif` — WiFi payload, blend mode, animated
- `artwork__default__tsunami.png`
- `artwork__style-dots__finder-circle__king.gif`

---

## Verification

After all modes complete:
1. Compare `passed.txt` across remote/local/browser — should be identical sets
2. Any discrepancy indicates a rendering parity bug
3. `failed.txt` items are excluded from gallery candidates
4. User inspects and curates from passed images
5. Final gallery candidates selected from `passed.txt` union across modes
