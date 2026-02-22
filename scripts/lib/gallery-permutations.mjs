/**
 * gallery-permutations.mjs — Shared permutation engine
 *
 * Pure-data module: no I/O, no fetch, no fs.
 * Exports dimension arrays, generator functions, and helpers
 * that produce exactly 1000 QR-code scenario configs
 * (333 non-overlay + 333 overlay + 333 artwork).
 */

// ─── Fixed globals applied to every image ────────────────────────────
export const GLOBALS = Object.freeze({
  v: 6, align: 'match_finder', timing: 'match_module', gap: 0,
  gradAngle: 135, radius: 25, dotRot: 0, modulePx: 6,
  animSpeed: 100, jitter: 0, wmPos: 'bottom-center',
  gifPal: 256, gifMaxFps: 30, w: 294, h: 294, frameText: 'ANQR',
});

// ─── Payloads ────────────────────────────────────────────────────────
export const PAYLOADS = [
  { id: 'url', data: 'https://anqr.link' },
];
const DEFAULT_PAYLOAD = PAYLOADS[0];

// ─── Fixtures (overlay & artwork only) ───────────────────────────────
export const FIXTURES = [
  { id: 'tsunami', publicPath: '/tsunami.jpg', isAnimated: false },
  { id: 'king',    publicPath: '/king.gif',     isAnimated: true  },
  { id: 'logo',    publicPath: '/logo.png',     isAnimated: false },
  { id: 'test',    publicPath: '/test.png',     isAnimated: false },
  { id: 'trump',   publicPath: '/trump.png',    isAnimated: false },
  { id: 'dance',   publicPath: '/dance.gif',    isAnimated: true  },
];
const ARTWORK_FIXTURES = FIXTURES.filter(
  (f) => f.id !== 'king' && f.id !== 'logo',
);
const STATIC_FIXTURES  = FIXTURES.filter(f => !f.isAnimated);
const ANIMATED_FIXTURES = FIXTURES.filter(f => f.isAnimated);

// ─── Dimension arrays ────────────────────────────────────────────────
export const MODULE_STYLES     = ['square', 'rounded', 'dots', 'diamond', 'connected'];
export const FINDER_STYLES     = ['square', 'rounded', 'circle'];
export const GAP_MODES         = ['none', 'inset', 'stroke', 'negative_space'];
export const FRAME_STYLES      = ['rounded_frame', 'sticker', 'tag'];
export const GRADIENT_TYPES    = ['linear', 'radial', 'conic'];
export const EYE_OUTERS        = ['square', 'rounded', 'circle'];
export const EYE_INNERS        = ['square', 'rounded', 'circle'];
export const OVERLAY_MODES     = [
  'center','blend','halftone','halftone-dithered','mosaic','gapfill',
  'brightness','duotone','subpixel','dithered','blue-noise','pixelate',
  'outline','wave','subpixel-size','dither','extreme',
];
const ANIMATED_OVERLAY_MODES = [
  'center',
  'blend',
  'halftone',
  'mosaic',
  'brightness',
  'subpixel',
  'dithered',
  'wave',
  'pixelate',
];
export const DITHER_KINDS      = [
  'error_diffusion','ordered_bayer','ordered_clustered','ordered_void_cluster',
  'blue_noise_threshold','true_dither','blue_noise','white_noise',
  'gaussian_noise','triangular_noise','blue_noise_error_diffusion','screened_blue_noise',
  'perceptual','edge_aware','adaptive_threshold','temporal_blue_noise',
];
export const DIFFUSION_KERNELS = [
  'floyd_steinberg','jarvis_judice_ninke','stucki','burkes',
  'sierra','sierra_2','sierra_lite','atkinson',
];
export const ANIM_PATTERNS     = ['pulse', 'wave', 'scanline', 'shimmer', 'drift'];
export const EASINGS           = ['linear', 'ease_in', 'ease_out', 'ease_in_out', 'bounce'];
export const COLOR_MODES       = ['color', 'grayscale', 'bw'];
export const FIT_MODES         = ['cover', 'contain', 'stretch'];
export const WATERMARK_BLENDS  = ['normal', 'multiply', 'screen', 'overlay', 'soft-light'];

// ─── Preset palettes & colour helpers ────────────────────────────────
const GRADIENT_PRESETS = [
  '1a1a2e,0,e94560,1',
  '0ea5e9,0,6366f1,1',
  'dc2626,0,f97316,1',
  '7c3aed,0,ec4899,0.5,f59e0b,1',
  '059669,0,0284c7,1',
];
const FG_COLORS = ['000000', '1a365d', 'c41e3a', '166534', '6b21a8'];
const BG_COLORS = ['ffffff', 'fff5e6', 'f0fdf4', 'faf5ff', 'fef3c7'];
const PALETTE_PRESETS = [
  'ff6b6b,feca57,48dbfb,ff9ff3,54a0ff',
  '1e3a8a,2563eb,059669,d97706,dc2626',
  '6c5ce7,a29bfe,fd79a8,fab1a0,ffeaa7',
  '00b894,00cec9,0984e3,6c5ce7,e17055',
  '1a1a2e,16213e,0f3460,e94560,533483',
];

// ─── Internal helpers ────────────────────────────────────────────────
let _idCounter = 0;
function uid(category, label) {
  return `${category}__${label}--${++_idCounter}`;
}

function makeConfig(category, label, extraParams, opts = {}) {
  const fixtureId  = opts.fixtureId  ?? null;
  const isAnimated = opts.isAnimated  ?? false;
  const format     = isAnimated ? 'gif' : 'png';
  const defaultEc  = category === 'artwork' ? 'L' : 'H';
  const params     = { ...GLOBALS, ec: defaultEc, format, ...extraParams };
  if (!params.data) params.data = DEFAULT_PAYLOAD.data;
  return {
    id:        uid(category, label),
    category,
    params,
    fixtureId,
    isAnimated,
    payloadId: 'url',
  };
}

/** Generate one config per value — single-axis sweep. */
function sweep(category, dimension, values, paramBuilder, opts = {}) {
  return values.map(v => {
    const extra = typeof paramBuilder === 'function' ? paramBuilder(v) : { [dimension]: v };
    const label = `${dimension}-${v}`;
    return makeConfig(category, label, extra, opts);
  });
}

/** Cross-product of two value arrays. */
function cross(category, label, aVals, bVals, paramBuilder, opts = {}) {
  const out = [];
  for (const a of aVals) {
    for (const b of bVals) {
      out.push(makeConfig(category, `${label}-${a}-${b}`, paramBuilder(a, b), opts));
    }
  }
  return out;
}

/** Deduplicate by serialised params — keep first occurrence. */
function dedup(configs) {
  const seen = new Set();
  return configs.filter(c => {
    const key = JSON.stringify(c.params);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Trim array to exactly `n` items (remove from end) or pad by cloning with suffix. */
function trimOrPad(configs, n, category) {
  if (configs.length > n) return configs.slice(0, n);
  const originalLen = configs.length || 1;
  while (configs.length < n) {
    const src = configs[configs.length % originalLen];
    const clone = { ...src, id: uid(category, `pad-${configs.length}`), params: { ...src.params } };
    configs.push(clone);
  }
  return configs;
}

/** Round-robin payload assignment for non-artwork categories. */
function assignPayloads(configs) {
  configs.forEach((c) => {
    // Force a single payload across all scenarios for strict parity comparisons.
    c.payloadId = DEFAULT_PAYLOAD.id;
    c.params.data = DEFAULT_PAYLOAD.data;
  });
  return configs;
}

// ─── Pick helper: cycle through an array deterministically ───────────
function pick(arr, idx) { return arr[idx % arr.length]; }


// ═══════════════════════════════════════════════════════════════════════
// NON-OVERLAY SCENARIOS (target: 333)
// ═══════════════════════════════════════════════════════════════════════

export function generateNonOverlayScenarios() {
  _idCounter = 0;
  const CAT = 'nooverlay';
  const layer1 = [];

  // 1. Blank default (1)
  layer1.push(makeConfig(CAT, 'default', {}));

  // 2. Payload samples removed here to avoid near-identical visual outputs.
  // Payload diversity is still covered by assignPayloads(...) across all configs.

  // 3. ModuleStyle sweep: rounded, dots, diamond, connected (4)
  layer1.push(...sweep(CAT, 'style', MODULE_STYLES.slice(1), v => ({ style: v })));

  // 4. FinderStyle sweep: rounded, circle (2)
  layer1.push(...sweep(CAT, 'finder', FINDER_STYLES.slice(1), v => ({ finder: v })));

  // 5. GapMode sweep: inset, stroke, negative_space (3)
  layer1.push(...sweep(CAT, 'gapMode', GAP_MODES.slice(1), v => ({ gapMode: v })));

  // 6. FrameStyle sweep: rounded_frame, sticker, tag (3)
  layer1.push(...sweep(CAT, 'frame', FRAME_STYLES, v => ({ frame: v })));

  // 7. GradientType sweep: linear, radial, conic (3)
  layer1.push(...sweep(CAT, 'grad', GRADIENT_TYPES, v => ({ grad: v, gradStops: GRADIENT_PRESETS[0] })));

  // 8. GradientStops sweep: 5 multi-color presets (5)
  layer1.push(...sweep(CAT, 'gradStops', GRADIENT_PRESETS, v => ({ grad: 'linear', gradStops: v })));

  // 9. EyeOuter sweep: rounded, circle (2)
  layer1.push(...sweep(CAT, 'eyeOuter', EYE_OUTERS.slice(1), v => ({ eyeOuter: v })));

  // 10. EyeInner sweep: rounded, circle (2)
  layer1.push(...sweep(CAT, 'eyeInner', EYE_INNERS.slice(1), v => ({ eyeInner: v })));

  // 11. EyeScale sweep: 95, 105 (2)
  layer1.push(...sweep(CAT, 'eyeScale', [95, 105], v => ({ eyeScale: v })));

  // 12. ModColor sweep: by_brightness, by_position, by_cluster (3)
  layer1.push(...sweep(CAT, 'modColor', ['by_brightness', 'by_position', 'by_cluster'], v => ({ modColor: v })));

  // 13. PaletteMode sweep (7)
  layer1.push(...sweep(CAT, 'paletteMode', ['position', 'brightness', 'diagonal', 'radial', 'random', 'row', 'column'], v => ({ paletteMode: v, palette: PALETTE_PRESETS[0] })));

  // 14. Palette sweep: 5 presets (5)
  layer1.push(...sweep(CAT, 'palette', PALETTE_PRESETS, v => ({ palette: v, paletteMode: 'position' })));

  // 15. PixelSnap: floor, ceil (2)
  layer1.push(...sweep(CAT, 'snap', ['floor', 'ceil'], v => ({ snap: v })));

  // 16. CrispEdges: 1 (1)
  layer1.push(makeConfig(CAT, 'crisp', { crisp: 1 }));

  // 17. BgTransparent: 1 (1)
  layer1.push(makeConfig(CAT, 'transparent', { transparent: 1 }));

  // 18. FgColor sweep: 5 colors (5)
  layer1.push(...sweep(CAT, 'fg', FG_COLORS, v => ({ fg: v })));

  // 19. BgColor sweep: 5 colors (5)
  layer1.push(...sweep(CAT, 'bg', BG_COLORS, v => ({ bg: v })));

  // 20. BorderModules: 0, 2, 4 (3)
  layer1.push(...sweep(CAT, 'border', [0, 2, 4], v => ({ border: v })));

  // 21. AnimPattern sweep (5) — GIF with strong visual styling
  layer1.push(...sweep(
    CAT,
    'animPattern',
    ANIM_PATTERNS,
    (v, i) => ({
      animPattern: v,
      style: pick(['rounded', 'dots', 'diamond', 'connected'], i),
      finder: pick(['rounded', 'circle'], i + 1),
      gapMode: pick(['inset', 'stroke', 'negative_space'], i + 2),
      grad: pick(GRADIENT_TYPES, i + 3),
      gradStops: pick(GRADIENT_PRESETS, i + 4),
      format: 'gif',
    }),
    { isAnimated: true },
  ));

  // 22. Easing sweep (4) — GIF with structure/gradient differences
  layer1.push(...sweep(
    CAT,
    'easing',
    EASINGS.slice(1),
    (v, i) => ({
      animPattern: 'pulse',
      easing: v,
      style: pick(['rounded', 'dots', 'diamond', 'connected'], i + 2),
      finder: pick(['rounded', 'circle'], i + 3),
      grad: pick(GRADIENT_TYPES, i),
      gradStops: pick(GRADIENT_PRESETS, i + 1),
      frame: pick(FRAME_STYLES, i + 4),
      format: 'gif',
    }),
    { isAnimated: true },
  ));

  // 23. Interpolation: crossfade, morph (2) — GIF
  layer1.push(...sweep(
    CAT,
    'interp',
    ['crossfade', 'morph'],
    (v, i) => ({
      animPattern: 'wave',
      interp: v,
      style: pick(['rounded', 'dots', 'diamond', 'connected'], i),
      finder: pick(['rounded', 'circle'], i + 1),
      grad: pick(GRADIENT_TYPES, i + 2),
      gradStops: pick(GRADIENT_PRESETS, i + 3),
      format: 'gif',
    }),
    { isAnimated: true },
  ));

  // 24. TempDither: blue_noise, flicker_safe (2) — GIF
  layer1.push(...sweep(
    CAT,
    'tempDither',
    ['blue_noise', 'flicker_safe'],
    (v, i) => ({
      animPattern: 'shimmer',
      tempDither: v,
      style: pick(['dots', 'diamond', 'rounded'], i),
      finder: 'circle',
      grad: pick(GRADIENT_TYPES, i + 1),
      gradStops: pick(GRADIENT_PRESETS, i + 2),
      colorCycle: 1,
      format: 'gif',
    }),
    { isAnimated: true },
  ));

  // 25. Bounce: 1 (1) — GIF
  layer1.push(makeConfig(CAT, 'bounce', {
    animPattern: 'pulse',
    bounce: 1,
    style: 'diamond',
    finder: 'rounded',
    grad: 'conic',
    gradStops: GRADIENT_PRESETS[3],
    format: 'gif',
  }, { isAnimated: true }));

  // 26. Reverse: 1 (1) — GIF
  layer1.push(makeConfig(CAT, 'reverse', {
    animPattern: 'wave',
    reverse: 1,
    style: 'connected',
    finder: 'rounded',
    gapMode: 'stroke',
    grad: 'linear',
    gradStops: GRADIENT_PRESETS[4],
    format: 'gif',
  }, { isAnimated: true }));

  // 27. ColorCycle: 1 (1) — GIF
  layer1.push(makeConfig(CAT, 'colorCycle', {
    animPattern: 'shimmer',
    colorCycle: 1,
    style: 'dots',
    finder: 'circle',
    grad: 'radial',
    gradStops: GRADIENT_PRESETS[1],
    format: 'gif',
  }, { isAnimated: true }));

  // 28. AnimSeed: 42, 123, 999 (3)
  layer1.push(...sweep(
    CAT,
    'animSeed',
    [42, 123, 999],
    (v, i) => ({
      animPattern: 'drift',
      animSeed: v,
      style: pick(['rounded', 'dots', 'diamond'], i),
      finder: 'rounded',
      grad: pick(GRADIENT_TYPES, i),
      gradStops: pick(GRADIENT_PRESETS, i + 1),
      format: 'gif',
    }),
    { isAnimated: true },
  ));

  // 29. Watermark sweeps (13)
  layer1.push(makeConfig(CAT, 'wm-text', { wmEn: 1, wmKind: 'text', wmText: 'ANQR' }));
  layer1.push(makeConfig(CAT, 'wm-pattern', { wmEn: 1, wmKind: 'pattern' }));
  layer1.push(...sweep(CAT, 'wmText', ['SCAN ME', 'anqr.link', 'QR CODE'], v => ({ wmEn: 1, wmKind: 'text', wmText: v })));
  layer1.push(...sweep(CAT, 'wmBlend', WATERMARK_BLENDS, v => ({ wmEn: 1, wmKind: 'text', wmText: 'ANQR', wmBlend: v })));
  layer1.push(...sweep(CAT, 'wmOpacity', [30, 60, 90], v => ({ wmEn: 1, wmKind: 'text', wmText: 'ANQR', wmOpacity: v })));

  // 30. Human-appeal visual heroes (bold static + motion-first non-overlay GIFs)
  const visualHeroStatic = [
    { style: 'rounded', finder: 'rounded', grad: 'linear', gradStops: GRADIENT_PRESETS[3], frame: 'sticker', fg: '1a365d', bg: 'faf5ff' },
    { style: 'dots', finder: 'circle', grad: 'radial', gradStops: GRADIENT_PRESETS[1], frame: 'tag', fg: 'c41e3a', bg: 'fff5e6' },
    { style: 'diamond', finder: 'rounded', grad: 'conic', gradStops: GRADIENT_PRESETS[4], eyeOuter: 'circle', eyeInner: 'rounded', border: 2 },
    { style: 'connected', finder: 'square', grad: 'linear', gradStops: GRADIENT_PRESETS[0], wmEn: 1, wmKind: 'pattern', wmOpacity: 45 },
    { style: 'rounded', finder: 'circle', modColor: 'by_brightness', palette: PALETTE_PRESETS[2], paletteMode: 'radial', eyeScale: 105 },
    { style: 'dots', finder: 'circle', gapMode: 'negative_space', grad: 'linear', gradStops: GRADIENT_PRESETS[2], cGuard: 1, minContrast: 4.5 },
  ];
  visualHeroStatic.forEach((cfg, idx) => {
    layer1.push(makeConfig(CAT, `visual-static-${idx + 1}`, cfg));
  });

  const visualHeroMotion = [
    { animPattern: 'wave', interp: 'morph', easing: 'ease_in_out', style: 'rounded', finder: 'rounded', grad: 'linear', gradStops: GRADIENT_PRESETS[3] },
    { animPattern: 'shimmer', interp: 'crossfade', tempDither: 'flicker_safe', colorCycle: 1, style: 'dots', finder: 'circle', grad: 'radial', gradStops: GRADIENT_PRESETS[1] },
    { animPattern: 'pulse', bounce: 1, easing: 'ease_out', style: 'diamond', finder: 'rounded', grad: 'conic', gradStops: GRADIENT_PRESETS[4] },
    { animPattern: 'scanline', reverse: 1, interp: 'crossfade', style: 'connected', finder: 'square', fg: '1a365d', bg: 'ffffff' },
    { animPattern: 'drift', animSeed: 123, interp: 'morph', style: 'rounded', finder: 'circle', grad: 'linear', gradStops: GRADIENT_PRESETS[0], frame: 'tag' },
    { animPattern: 'wave', interp: 'crossfade', tempDither: 'blue_noise', style: 'dots', finder: 'circle', grad: 'conic', gradStops: GRADIENT_PRESETS[2] },
    { animPattern: 'shimmer', colorCycle: 1, easing: 'ease_in', style: 'diamond', finder: 'rounded', grad: 'radial', gradStops: GRADIENT_PRESETS[4], wmEn: 1, wmKind: 'text', wmText: 'ANQR' },
    { animPattern: 'pulse', bounce: 1, reverse: 1, easing: 'bounce', style: 'rounded', finder: 'rounded', grad: 'linear', gradStops: GRADIENT_PRESETS[1], frame: 'sticker' },
    { animPattern: 'scanline', interp: 'morph', tempDither: 'flicker_safe', style: 'connected', finder: 'square', modColor: 'by_cluster', palette: PALETTE_PRESETS[3], paletteMode: 'diagonal' },
    { animPattern: 'drift', colorCycle: 1, animSeed: 999, style: 'dots', finder: 'circle', grad: 'radial', gradStops: GRADIENT_PRESETS[0], eyeOuter: 'circle', eyeInner: 'circle' },
  ];
  visualHeroMotion.forEach((cfg, idx) => {
    layer1.push(makeConfig(CAT, `visual-motion-${idx + 1}`, { ...cfg, format: 'gif' }, { isAnimated: true }));
  });

  // 31. Targeted animation stacks (modules/result/both + secondary pattern/axis)
  const visualHeroTargetStacks = [
    {
      label: 'modules-wave-x-plus-result-wave-y',
      params: {
        animPattern: 'wave',
        animTarget: 'modules',
        animWaveAxis: 'x',
        animPattern2: 'wave',
        animTarget2: 'result',
        animWaveAxis2: 'y',
        interp: 'morph',
        easing: 'ease_in_out',
        tempDither: 'flicker_safe',
        colorCycle: 1,
        style: 'dots',
        finder: 'circle',
        grad: 'radial',
        gradStops: GRADIENT_PRESETS[4],
        format: 'gif',
      },
    },
    {
      label: 'result-wave-y-plus-modules-shimmer',
      params: {
        animPattern: 'wave',
        animTarget: 'result',
        animWaveAxis: 'y',
        animPattern2: 'shimmer',
        animTarget2: 'modules',
        interp: 'crossfade',
        easing: 'ease_out',
        tempDither: 'blue_noise',
        style: 'diamond',
        finder: 'rounded',
        grad: 'conic',
        gradStops: GRADIENT_PRESETS[3],
        format: 'gif',
      },
    },
    {
      label: 'both-wave-xy-plus-drift',
      params: {
        animPattern: 'wave',
        animTarget: 'both',
        animWaveAxis: 'xy',
        animPattern2: 'drift',
        animTarget2: 'both',
        easing: 'ease_in_out',
        interp: 'morph',
        colorCycle: 1,
        animSeed: 420,
        style: 'connected',
        finder: 'rounded',
        frame: 'tag',
        grad: 'linear',
        gradStops: GRADIENT_PRESETS[1],
        format: 'gif',
      },
    },
    {
      label: 'modules-scanline-plus-result-wave-x',
      params: {
        animPattern: 'scanline',
        animTarget: 'modules',
        reverse: 1,
        animPattern2: 'wave',
        animTarget2: 'result',
        animWaveAxis2: 'x',
        easing: 'ease_in',
        tempDither: 'flicker_safe',
        style: 'rounded',
        finder: 'circle',
        grad: 'radial',
        gradStops: GRADIENT_PRESETS[0],
        format: 'gif',
      },
    },
  ];
  visualHeroTargetStacks.forEach((combo, idx) => {
    layer1.push(makeConfig(CAT, `visual-target-stack-${idx + 1}`, combo.params, { isAnimated: true }));
  });

  // 32. Controlled version/ECC variation (cap version <= 9)
  const versionEccShowcase = [
    { label: 'ver-4-ec-L', params: { v: 4, ec: 'L', style: 'rounded', finder: 'rounded' } },
    { label: 'ver-6-ec-M', params: { v: 6, ec: 'M', style: 'dots', finder: 'circle' } },
    { label: 'ver-8-ec-Q', params: { v: 8, ec: 'Q', style: 'diamond', finder: 'rounded' } },
    { label: 'ver-9-ec-H', params: { v: 9, ec: 'H', style: 'connected', finder: 'square' } },
  ];
  for (const combo of versionEccShowcase) {
    layer1.push(makeConfig(CAT, `encoding-${combo.label}`, {
      ...combo.params,
      grad: 'linear',
      gradStops: GRADIENT_PRESETS[2],
      frame: 'tag',
    }));
  }

  // 31. "Huge permutation" showcases: stack many options in one render.
  layer1.push(makeConfig(CAT, 'mega-static',
    {
      v: 9,
      ec: 'Q',
      style: 'diamond',
      finder: 'rounded',
      frame: 'tag',
      grad: 'conic',
      gradStops: GRADIENT_PRESETS[3],
      eyeOuter: 'circle',
      eyeInner: 'rounded',
      gapMode: 'inset',
      palette: PALETTE_PRESETS[1],
      paletteMode: 'radial',
      modColor: 'by_cluster',
      fg: '1a365d',
      bg: 'fff5e6',
      border: 2,
      cGuard: 1,
      minContrast: 4.5,
      wmEn: 1,
      wmKind: 'text',
      wmText: 'ANQR',
      wmBlend: 'overlay',
      wmOpacity: 45,
    }));
  layer1.push(makeConfig(CAT, 'mega-animated',
    {
      v: 9,
      ec: 'Q',
      style: 'dots',
      finder: 'circle',
      frame: 'sticker',
      grad: 'radial',
      gradStops: GRADIENT_PRESETS[4],
      eyeOuter: 'circle',
      eyeInner: 'circle',
      gapMode: 'negative_space',
      palette: PALETTE_PRESETS[3],
      paletteMode: 'diagonal',
      modColor: 'by_position',
      border: 2,
      wmEn: 1,
      wmKind: 'pattern',
      wmBlend: 'soft-light',
      wmOpacity: 50,
      animPattern: 'wave',
      interp: 'morph',
      easing: 'ease_in_out',
      tempDither: 'flicker_safe',
      colorCycle: 1,
      bounce: 1,
      animSeed: 321,
      format: 'gif',
    },
    { isAnimated: true }));

  // Layer 1 subtotal: curated high-visual presets

  // ── Layer 2: Cross-products ─────────────────────────────────────────
  const layer2 = [];

  // Style × Finder (4×2 = 8)
  layer2.push(...cross(CAT, 'style-x-finder',
    MODULE_STYLES.slice(1), FINDER_STYLES.slice(1),
    (s, f) => ({ style: s, finder: f })));

  // Style × GapMode (4×3 = 12)
  layer2.push(...cross(CAT, 'style-x-gap',
    MODULE_STYLES.slice(1), GAP_MODES.slice(1),
    (s, g) => ({ style: s, gapMode: g })));

  // Style × Gradient (4×3 = 12)
  layer2.push(...cross(CAT, 'style-x-grad',
    MODULE_STYLES.slice(1), GRADIENT_TYPES,
    (s, g) => ({ style: s, grad: g, gradStops: GRADIENT_PRESETS[0] })));

  // Style × Frame (4×3 = 12)
  layer2.push(...cross(CAT, 'style-x-frame',
    MODULE_STYLES.slice(1), FRAME_STYLES,
    (s, f) => ({ style: s, frame: f })));

  // Frame × Gradient (3×3 = 9)
  layer2.push(...cross(CAT, 'frame-x-grad',
    FRAME_STYLES, GRADIENT_TYPES,
    (f, g) => ({ frame: f, grad: g, gradStops: GRADIENT_PRESETS[1] })));

  // EyeOuter × EyeInner (3×3 = 9)
  layer2.push(...cross(CAT, 'eyeO-x-eyeI',
    EYE_OUTERS, EYE_INNERS,
    (o, i) => ({ eyeOuter: o, eyeInner: i })));

  // FgColor × Gradient (5×3 = 15)
  layer2.push(...cross(CAT, 'fg-x-grad',
    FG_COLORS, GRADIENT_TYPES,
    (fg, g) => ({ fg, grad: g, gradStops: GRADIENT_PRESETS[2] })));

  // FgColor × BgColor (5×5 = 25, take 10)
  {
    const pool = cross(CAT, 'fg-x-bg', FG_COLORS, BG_COLORS, (f, b) => ({ fg: f, bg: b }));
    layer2.push(...pool.slice(0, 10));
  }

  // ModColor × Palette (3×5 = 15, take 10)
  {
    const pool = cross(CAT, 'modC-x-pal',
      ['by_brightness', 'by_position', 'by_cluster'], PALETTE_PRESETS,
      (m, p) => ({ modColor: m, palette: p, paletteMode: 'position' }));
    layer2.push(...pool.slice(0, 10));
  }

  // AnimPattern × Easing (5×4 = 20)
  layer2.push(...cross(CAT, 'anim-x-ease',
    ANIM_PATTERNS, EASINGS.slice(1),
    (a, e) => ({ animPattern: a, easing: e, format: 'gif' }),
    { isAnimated: true }));

  // AnimPattern × Style (5×3 = 15, take 10)
  {
    const pool = cross(CAT, 'anim-x-style',
      ANIM_PATTERNS, MODULE_STYLES.slice(1, 4),
      (a, s) => ({ animPattern: a, style: s, format: 'gif' }),
      { isAnimated: true });
    layer2.push(...pool.slice(0, 10));
  }

  // AnimPattern × flag showcase (curated scan-safe subset)
  {
    const flagShowcase = [
      { ap: 'pulse', fl: { bounce: 1 } },
      { ap: 'pulse', fl: { reverse: 1 } },
      { ap: 'wave', fl: { bounce: 1 } },
      { ap: 'wave', fl: { colorCycle: 1 } },
      { ap: 'scanline', fl: { reverse: 1 } },
      { ap: 'scanline', fl: { colorCycle: 1 } },
      { ap: 'shimmer', fl: { colorCycle: 1 } },
      { ap: 'drift', fl: { bounce: 1 } },
    ];
    for (let i = 0; i < flagShowcase.length; i++) {
      const { ap, fl } = flagShowcase[i];
      layer2.push(makeConfig(CAT, `anim-flag-${ap}-${Object.keys(fl)[0]}`,
        {
          animPattern: ap,
          ...fl,
          style: pick(['rounded', 'dots', 'diamond'], i),
          finder: pick(['rounded', 'circle'], i + 1),
          grad: pick(['linear', 'radial'], i),
          gradStops: pick(GRADIENT_PRESETS, i + 2),
          format: 'gif',
        },
        { isAnimated: true }));
    }
  }

  // AnimPattern × Gradient (5×3 = 15, take 10)
  {
    const pool = cross(CAT, 'anim-x-grad',
      ANIM_PATTERNS, GRADIENT_TYPES,
      (a, g) => ({ animPattern: a, grad: g, gradStops: GRADIENT_PRESETS[3], format: 'gif' }),
      { isAnimated: true });
    layer2.push(...pool.slice(0, 10));
  }

  // Watermark × Style (5×3 = 15, take 8)
  {
    const pool = cross(CAT, 'wm-x-style',
      MODULE_STYLES.slice(1), ['text', 'logo'].slice(0, 1),
      (s, k) => ({ style: s, wmEn: 1, wmKind: 'text', wmText: 'ANQR' }));
    layer2.push(...pool.slice(0, 4));
  }

  // Watermark × Blend × Opacity combos (5×3 = 15, take 8)
  {
    const pool = cross(CAT, 'wm-blend-x-opacity',
      WATERMARK_BLENDS, [30, 60, 90],
      (b, o) => ({ wmEn: 1, wmKind: 'text', wmText: 'ANQR', wmBlend: b, wmOpacity: o }));
    layer2.push(...pool.slice(0, 8));
  }

  // Multi-feature power combos (20)
  const powerCombos = [
    { style: 'rounded', finder: 'rounded', grad: 'linear', gradStops: GRADIENT_PRESETS[0], frame: 'tag' },
    { style: 'dots', finder: 'circle', grad: 'radial', gradStops: GRADIENT_PRESETS[1], gapMode: 'inset' },
    { style: 'diamond', grad: 'conic', gradStops: GRADIENT_PRESETS[2], eyeOuter: 'rounded', eyeInner: 'circle' },
    { style: 'connected', fg: '1a365d', bg: 'fff5e6', frame: 'sticker' },
    { style: 'rounded', finder: 'circle', gapMode: 'inset', fg: 'c41e3a', bg: 'ffffff' },
    { style: 'dots', finder: 'circle', grad: 'linear', gradStops: GRADIENT_PRESETS[3], frame: 'rounded_frame', eyeOuter: 'circle' },
    { style: 'diamond', gapMode: 'negative_space', grad: 'radial', gradStops: GRADIENT_PRESETS[4], fg: '166534' },
    { style: 'rounded', finder: 'rounded', modColor: 'by_brightness', palette: PALETTE_PRESETS[0], paletteMode: 'diagonal' },
    { style: 'dots', finder: 'circle', modColor: 'by_position', palette: PALETTE_PRESETS[1], paletteMode: 'radial' },
    { style: 'connected', modColor: 'by_cluster', palette: PALETTE_PRESETS[2], paletteMode: 'brightness' },
    { style: 'rounded', grad: 'linear', gradStops: GRADIENT_PRESETS[0], wmEn: 1, wmKind: 'text', wmText: 'SCAN ME' },
    { style: 'dots', finder: 'circle', eyeOuter: 'circle', eyeInner: 'rounded', fg: '6b21a8', bg: 'faf5ff' },
    { style: 'rounded', finder: 'rounded', frame: 'tag', grad: 'conic', gradStops: GRADIENT_PRESETS[1] },
    { style: 'diamond', finder: 'rounded', gapMode: 'inset', eyeOuter: 'rounded', eyeInner: 'rounded' },
    { style: 'rounded', gapMode: 'stroke', grad: 'linear', gradStops: GRADIENT_PRESETS[2], crisp: 1 },
    { style: 'dots', finder: 'circle', grad: 'radial', gradStops: GRADIENT_PRESETS[3], border: 4 },
    { style: 'connected', frame: 'sticker', fg: 'c41e3a', bg: 'fff5e6', eyeScale: 105 },
    { style: 'rounded', finder: 'rounded', grad: 'linear', gradStops: GRADIENT_PRESETS[4], cGuard: 1, minContrast: 4.5 },
    { style: 'diamond', finder: 'circle', gapMode: 'negative_space', frame: 'tag', fg: '166534' },
    { style: 'dots', finder: 'circle', grad: 'conic', gradStops: GRADIENT_PRESETS[0], eyeOuter: 'circle', eyeInner: 'circle', ec: 'Q' },
  ];
  for (let i = 0; i < powerCombos.length; i++) {
    layer2.push(makeConfig(CAT, `power-${i}`, powerCombos[i]));
  }

  // ── Merge and remove low-visual/no-op families ─────────────────────
  let all = dedup([...layer1, ...layer2]);

  const lowImpactLabelPatterns = [
    /^payload-/,
    /^enc-/,
    /^ec-/,
    /^autoEcc$/,
    /^autoVer$/,
    /^qzEnforce$/,
    /^cGuard$/,
    /^minContrast-/,
    /^snap-/,
    /^gifQuant-/,
    /^gifDith-/,
    /^gifColors-/,
    /^gifTrans$/,
  ];
  all = all.filter((cfg) => {
    const label = cfg.id.replace(/^[^_]+__/, '').replace(/--\d+$/, '');
    return !lowImpactLabelPatterns.some((re) => re.test(label));
  });

  // Fill to 333 with intentionally high-contrast geometry + motion combos.
  if (all.length < 333) {
    const filler = [];
    const fillerStyles = ['rounded', 'dots', 'diamond'];
    const fillerFinders = ['rounded', 'circle'];
    const fillerGaps = ['inset'];
    const fillerFrames = ['', 'rounded_frame', 'tag'];
    const fillerEyes = [
      { eyeOuter: 'rounded', eyeInner: 'rounded' },
      { eyeOuter: 'circle', eyeInner: 'circle' },
    ];
    const fillerAnimPatterns = ['pulse', 'wave', 'scanline', 'shimmer', 'drift'];

    let idx = 0;
    outer: for (const style of fillerStyles) {
      for (const finder of fillerFinders) {
        for (const gapMode of fillerGaps) {
          for (const grad of GRADIENT_TYPES) {
            for (const palette of PALETTE_PRESETS) {
              const eye = fillerEyes[idx % fillerEyes.length];
              const frame = fillerFrames[idx % fillerFrames.length];
              filler.push(makeConfig(CAT, `filler-static-${idx}`, {
                style,
                finder,
                gapMode,
                grad,
                gradStops: GRADIENT_PRESETS[idx % GRADIENT_PRESETS.length],
                fg: FG_COLORS[idx % FG_COLORS.length],
                bg: BG_COLORS[(idx + 1) % BG_COLORS.length],
                frame: frame || undefined,
                eyeOuter: eye.eyeOuter,
                eyeInner: eye.eyeInner,
                border: [1, 2][idx % 2],
                cGuard: 1,
                minContrast: 4.5,
              }));

              filler.push(makeConfig(CAT, `filler-anim-${idx}`, {
                style,
                finder,
                gapMode,
                grad,
                gradStops: GRADIENT_PRESETS[(idx + 2) % GRADIENT_PRESETS.length],
                frame: frame || undefined,
                eyeOuter: eye.eyeOuter,
                eyeInner: eye.eyeInner,
                animPattern: fillerAnimPatterns[idx % fillerAnimPatterns.length],
                easing: ['ease_in', 'ease_out', 'ease_in_out'][idx % 3],
                interp: ['crossfade', 'morph'][idx % 2],
                tempDither: ['blue_noise', 'flicker_safe'][idx % 2],
                colorCycle: (idx % 2 === 0 && fillerAnimPatterns[idx % fillerAnimPatterns.length] === 'shimmer') ? 1 : undefined,
                animSeed: [42, 123, 999][idx % 3],
                border: [1, 2][idx % 2],
                cGuard: 1,
                minContrast: 4.5,
                format: 'gif',
              }, { isAnimated: true }));

              idx++;
              if (filler.length >= 2400) break outer;
            }
          }
        }
      }
    }
    all = dedup([...all, ...filler]);
  }

  if (all.length < 333) {
    throw new Error(`nooverlay scenario generation produced ${all.length} unique configs; expected at least 333`);
  }

  return assignPayloads(all.slice(0, 333));
}

// ═══════════════════════════════════════════════════════════════════════
// OVERLAY SCENARIOS (target: 333)
// ═══════════════════════════════════════════════════════════════════════

export function generateOverlayScenarios() {
  _idCounter = 0;
  const CAT = 'overlay';
  const layer1 = [];

  const MODE_INTENSITY_DEFAULTS = {
    halftone: 60,
    'halftone-dithered': 50,
    gapfill: 55,
    brightness: 30,
    duotone: 50,
    dithered: 60,
    'blue-noise': 50,
    blend: 60,
    wave: 50,
    dither: 55,
    extreme: 45,
  };
  const BLOCKED_STATIC_MODE_FIXTURE = new Set([
    'halftone-dithered:trump',
    'halftone-dithered:test',
    'gapfill:test',
    'gapfill:trump',
    'brightness:tsunami',
    'brightness:test',
    'brightness:trump',
    'duotone:test',
    'duotone:trump',
    'dithered:trump',
    'blue-noise:tsunami',
    'blue-noise:trump',
    'extreme:logo',
  ]);
  const BLOCKED_ANIM_MODE_FIXTURE = new Set([
    'brightness:dance',
    'halftone:dance',
  ]);
  const HERO_ANIM_FIXTURES = ANIMATED_FIXTURES.filter(
    (fx) => fx.id === 'king' || fx.id === 'dance',
  );
  const OVERLAY_DITHER_KINDS = DITHER_KINDS.filter(
    (dk) => dk !== 'ordered_clustered' && dk !== 'white_noise' && dk !== 'gaussian_noise',
  );
  const SAFE_ANIM_DITHER_KINDS = [
    'error_diffusion',
    'ordered_bayer',
    'blue_noise_threshold',
    'screened_blue_noise',
    'adaptive_threshold',
  ];

  function overlayModeBase(mode) {
    const intensity = MODE_INTENSITY_DEFAULTS[mode];
    return {
      keepFinders: 1,
      keepTiming: 1,
      keepAlign: 1,
      protectFmt: 1,
      protectVer: 1,
      ...(intensity ? { intensity } : {}),
    };
  }

  // ── Layer 1: Single-axis sweeps ─────────────────────────────────────

  // 1. OverlayMode × static fixtures: 17 modes × 4 static fixtures = 68
  for (const mode of OVERLAY_MODES) {
    for (const fx of STATIC_FIXTURES) {
      if (BLOCKED_STATIC_MODE_FIXTURE.has(`${mode}:${fx.id}`)) {
        continue;
      }
      layer1.push(makeConfig(CAT, `mode-${mode}-${fx.id}`,
        { mode, img: fx.publicPath, ...overlayModeBase(mode) },
        { fixtureId: fx.id, isAnimated: false }));
    }
  }

  // 2. Animated overlays with full source frame sets.
  // Keep scanner-stable/high-value modes for animated fixtures.
  for (const mode of ANIMATED_OVERLAY_MODES) {
    for (const fx of ANIMATED_FIXTURES) {
      if (BLOCKED_ANIM_MODE_FIXTURE.has(`${mode}:${fx.id}`)) {
        continue;
      }
      layer1.push(makeConfig(CAT, `mode-${mode}-anim-${fx.id}`,
        { mode, img: fx.publicPath, format: 'gif', ...overlayModeBase(mode) },
        { fixtureId: fx.id, isAnimated: true }));
    }
  }
  // subtotal: 68 + 17 = 85

  // 3. ColorMode sweep (3)
  COLOR_MODES.forEach((cm, idx) => {
    const fx = pick(STATIC_FIXTURES, idx);
    layer1.push(makeConfig(CAT, `colorMode-${cm}`,
      { mode: 'blend', img: fx.publicPath, colorMode: cm, ...overlayModeBase('blend') },
      { fixtureId: fx.id }));
  });

  // 4. FitMode sweep (3)
  FIT_MODES.forEach((fm, idx) => {
    const fx = pick(STATIC_FIXTURES, idx + 1);
    layer1.push(makeConfig(CAT, `fit-${fm}`,
      { mode: 'blend', img: fx.publicPath, fit: fm, ...overlayModeBase('blend') },
      { fixtureId: fx.id }));
  });

  // 5. Intensity sweep: 30, 50, 70, 85, 100 (5)
  [30, 50, 70, 85, 100].forEach((int, idx) => {
    const fx = pick(STATIC_FIXTURES, idx + 2);
    layer1.push(makeConfig(CAT, `intensity-${int}`,
      { mode: 'blend', img: fx.publicPath, intensity: int, ...overlayModeBase('blend') },
      { fixtureId: fx.id }));
  });

  // 6. LogoSize sweep (scanner-safe upper bound)
  [20, 30, 35].forEach((ls, idx) => {
    const fx = pick(STATIC_FIXTURES, idx);
    layer1.push(makeConfig(CAT, `logoSize-${ls}`,
      { mode: 'center', img: fx.publicPath, logoSize: ls, ...overlayModeBase('center') },
      { fixtureId: fx.id }));
  });

  // 7. DitherKind sweep (exclude known unstable ordered_clustered)
  OVERLAY_DITHER_KINDS.forEach((dk, idx) => {
    const fx = pick(STATIC_FIXTURES, idx + 1);
    layer1.push(makeConfig(CAT, `ditherKind-${dk}`,
      { mode: 'dithered', img: fx.publicPath, ditherKind: dk, ...overlayModeBase('dithered') },
      { fixtureId: fx.id }));
  });

  // 7b. Animated dither showcase (curated kinds, full-frame GIF source)
  {
    for (const fx of HERO_ANIM_FIXTURES) {
      for (const dk of SAFE_ANIM_DITHER_KINDS) {
        layer1.push(makeConfig(CAT, `ditherKind-anim-${dk}-${fx.id}`,
          {
            mode: 'dithered',
            img: fx.publicPath,
            ditherKind: dk,
            diffusionKernel: dk === 'error_diffusion' ? 'atkinson' : 'sierra_2',
            ditherStrength: dk === 'adaptive_threshold' ? 70 : 60,
            format: 'gif',
            ...overlayModeBase('dithered'),
          },
          { fixtureId: fx.id, isAnimated: true }));
      }
    }
  }

  // 8. DiffusionKernel sweep (8)
  DIFFUSION_KERNELS.forEach((dk, idx) => {
    const fx = pick(STATIC_FIXTURES, idx + 2);
    layer1.push(makeConfig(CAT, `diffKernel-${dk}`,
      { mode: 'dithered', img: fx.publicPath, diffusionKernel: dk, ...overlayModeBase('dithered') },
      { fixtureId: fx.id }));
  });

  // 9. DitherStrength sweep: 25, 50, 75, 100 (4)
  [25, 50, 75, 100].forEach((ds, idx) => {
    const fx = pick(STATIC_FIXTURES, idx);
    layer1.push(makeConfig(CAT, `ditherStr-${ds}`,
      { mode: 'dithered', img: fx.publicPath, ditherStrength: ds, ...overlayModeBase('dithered') },
      { fixtureId: fx.id }));
  });

  // 10. Subpixel grid size sweep (scanner-safe values)
  [1, 3].forEach((sp, idx) => {
    const fx = pick(STATIC_FIXTURES, idx + 1);
    layer1.push(makeConfig(CAT, `spGridNum-${sp}`,
      { mode: 'subpixel-size', img: fx.publicPath, spGridNum: sp, ...overlayModeBase('subpixel') },
      { fixtureId: fx.id }));
  });

  // 11. Halftone dot shape sweep: circle, square (line variant is unstable for scan gate)
  ['circle', 'square'].forEach((hs, idx) => {
    const fx = pick(STATIC_FIXTURES, idx);
    layer1.push(makeConfig(CAT, `htDot-${hs}`,
      { mode: 'halftone', img: fx.publicPath, htDot: hs, intensity: 30, ...overlayModeBase('halftone') },
      { fixtureId: fx.id }));
  });

  // 12. Duotone pair sweeps removed (many pairings are intrinsically unscannable).
  // Base duotone mode coverage remains in the mode showcase block.

  // 13. Filter sweep: sharpen, blur, edge (3)
  ['sharpen', 'blur', 'edge'].forEach((filt, idx) => {
    const fx = pick(STATIC_FIXTURES, idx + 1);
    const filterParams = filt === 'sharpen' ? { sharpen: 100 } : filt === 'blur' ? { blur: 5 } : { edge: 'sobel' };
    layer1.push(makeConfig(CAT, `filter-${filt}`,
      { mode: 'blend', img: fx.publicPath, ...filterParams },
      { fixtureId: fx.id }));
  });

  // 14. Crop/flip/rotate (5)
  layer1.push(makeConfig(CAT, 'flipX', { mode: 'blend', img: STATIC_FIXTURES[0].publicPath, flipX: 1 }, { fixtureId: STATIC_FIXTURES[0].id }));
  layer1.push(makeConfig(CAT, 'flipY', { mode: 'blend', img: STATIC_FIXTURES[3].publicPath, flipY: 1 }, { fixtureId: STATIC_FIXTURES[3].id }));
  layer1.push(makeConfig(CAT, 'rot90', { mode: 'blend', img: STATIC_FIXTURES[1].publicPath, rot: 90 }, { fixtureId: STATIC_FIXTURES[1].id }));
  layer1.push(makeConfig(CAT, 'rot180', { mode: 'blend', img: STATIC_FIXTURES[2].publicPath, rot: 180 }, { fixtureId: STATIC_FIXTURES[2].id }));
  layer1.push(makeConfig(CAT, 'cropEn', { mode: 'blend', img: STATIC_FIXTURES[3].publicPath, cropEn: 1 }, { fixtureId: STATIC_FIXTURES[3].id }));

  // 15. Preservation sweeps: keepFinders, keepTiming (4)
  layer1.push(makeConfig(CAT, 'keepFinders', { mode: 'blend', img: STATIC_FIXTURES[0].publicPath, keepFinders: 1 }, { fixtureId: STATIC_FIXTURES[0].id }));
  layer1.push(makeConfig(CAT, 'keepTiming', { mode: 'blend', img: STATIC_FIXTURES[3].publicPath, keepTiming: 1 }, { fixtureId: STATIC_FIXTURES[3].id }));
  layer1.push(makeConfig(CAT, 'keepBoth', { mode: 'blend', img: STATIC_FIXTURES[1].publicPath, keepFinders: 1, keepTiming: 1 }, { fixtureId: STATIC_FIXTURES[1].id }));
  layer1.push(makeConfig(CAT, 'eccAware', { mode: 'blend', img: STATIC_FIXTURES[2].publicPath, eccAware: 1 }, { fixtureId: STATIC_FIXTURES[2].id }));

  // 15b. Blend-preservation style toggle showcase (overlay pass-through vs dither-integrated)
  layer1.push(makeConfig(CAT, 'blendPresMode-overlay',
    {
      mode: 'dithered',
      img: STATIC_FIXTURES[2].publicPath,
      keepFinders: 0,
      keepTiming: 1,
      keepAlign: 1,
      protectFmt: 1,
      protectVer: 1,
      finderDither: 82,
      blendPres: 1,
      blendPresMode: 'overlay',
      ...overlayModeBase('dithered'),
    },
    { fixtureId: STATIC_FIXTURES[2].id }));
  layer1.push(makeConfig(CAT, 'blendPresMode-dither',
    {
      mode: 'dithered',
      img: STATIC_FIXTURES[3].publicPath,
      keepFinders: 0,
      keepTiming: 1,
      keepAlign: 1,
      protectFmt: 1,
      protectVer: 1,
      finderDither: 82,
      blendPres: 1,
      blendPresMode: 'dither',
      ...overlayModeBase('dithered'),
    },
    { fixtureId: STATIC_FIXTURES[3].id }));
  layer1.push(makeConfig(CAT, 'blendPresMode-overlay-anim-dance',
    {
      mode: 'dithered',
      img: '/dance.gif',
      format: 'gif',
      keepFinders: 0,
      keepTiming: 1,
      keepAlign: 1,
      protectFmt: 1,
      protectVer: 1,
      finderDither: 84,
      blendPres: 1,
      blendPresMode: 'overlay',
      animPattern: 'wave',
      interp: 'morph',
      easing: 'ease_in_out',
      tempDither: 'flicker_safe',
      colorCycle: 1,
      ...overlayModeBase('dithered'),
    },
    { fixtureId: 'dance', isAnimated: true }));
  layer1.push(makeConfig(CAT, 'blendPresMode-dither-anim-king',
    {
      mode: 'dithered',
      img: '/king.gif',
      format: 'gif',
      keepFinders: 0,
      keepTiming: 1,
      keepAlign: 1,
      protectFmt: 1,
      protectVer: 1,
      finderDither: 84,
      blendPres: 1,
      blendPresMode: 'dither',
      animPattern: 'shimmer',
      interp: 'crossfade',
      easing: 'ease_out',
      tempDither: 'flicker_safe',
      colorCycle: 1,
      ...overlayModeBase('dithered'),
    },
    { fixtureId: 'king', isAnimated: true }));

  const HERO_VISUAL_MODES = ['blend', 'mosaic', 'subpixel', 'wave'];
  const HERO_VISUAL_STYLES = ['rounded', 'dots', 'diamond', 'connected'];
  const HERO_VISUAL_FINDERS = ['rounded', 'circle'];
  const HERO_VISUAL_GRADS = ['linear', 'radial', 'conic'];
  const HERO_VISUAL_FRAMES = [undefined, 'sticker', 'tag', 'rounded_frame'];
  const HERO_VISUAL_FG = ['1a365d', '166534', '7f1d1d', '4c1d95'];
  const HERO_VISUAL_BG = ['fff5e6', 'f0fdf4', 'eef2ff', 'faf5ff'];

  function heroVisualBase(idx, modeOverride) {
    const mode = modeOverride || pick(HERO_VISUAL_MODES, idx);
    return {
      mode,
      style: pick(HERO_VISUAL_STYLES, idx + 1),
      finder: pick(HERO_VISUAL_FINDERS, idx + 2),
      frame: pick(HERO_VISUAL_FRAMES, idx + 3),
      grad: pick(HERO_VISUAL_GRADS, idx + 4),
      gradStops: pick(GRADIENT_PRESETS, idx + 5),
      fg: pick(HERO_VISUAL_FG, idx + 6),
      bg: pick(HERO_VISUAL_BG, idx + 7),
      eyeOuter: pick(['rounded', 'circle'], idx + 8),
      eyeInner: pick(['rounded', 'circle'], idx + 9),
      ...overlayModeBase(mode),
    };
  }

  // 16. Animation pattern showcase on hero animated fixtures (visually distinct bases)
  {
    for (let fIdx = 0; fIdx < HERO_ANIM_FIXTURES.length; fIdx++) {
      const fx = HERO_ANIM_FIXTURES[fIdx];
      for (let i = 0; i < ANIM_PATTERNS.length; i++) {
        const ap = ANIM_PATTERNS[i];
        const seed = fIdx * 20 + i;
        const mode = pick(HERO_VISUAL_MODES, seed);
        layer1.push(
          makeConfig(
            CAT,
            `animPattern-${ap}-overlay-${fx.id}`,
            {
              ...heroVisualBase(seed, mode),
              img: fx.publicPath,
              animPattern: ap,
              format: 'gif',
              ...(ap === 'wave' ? { interp: 'morph', bounce: 1 } : {}),
              ...(ap === 'shimmer' ? { interp: 'crossfade', tempDither: 'flicker_safe', colorCycle: 1 } : {}),
              ...(ap === 'scanline' ? { reverse: 1 } : {}),
              ...(ap === 'drift' ? { animSeed: 300 + seed } : {}),
            },
            { fixtureId: fx.id, isAnimated: true }
          )
        );
      }
    }
  }

  // 17. Curated hero animation feature matrix (materially different visuals)
  {
    const heroFeatureCombos = [
      {
        label: 'neon-wave-morph',
        mode: 'blend',
        params: {
          animPattern: 'wave',
          interp: 'morph',
          easing: 'ease_in_out',
          colorCycle: 1,
          style: 'diamond',
          finder: 'circle',
          frame: 'tag',
          grad: 'conic',
          gradStops: GRADIENT_PRESETS[3],
        },
      },
      {
        label: 'noir-scanline',
        mode: 'subpixel',
        params: {
          animPattern: 'scanline',
          reverse: 1,
          interp: 'crossfade',
          easing: 'ease_out',
          style: 'connected',
          finder: 'rounded',
          grad: 'linear',
          gradStops: GRADIENT_PRESETS[0],
          fg: '0f172a',
          bg: 'f8fafc',
        },
      },
      {
        label: 'pop-shimmer',
        mode: 'mosaic',
        params: {
          animPattern: 'shimmer',
          interp: 'crossfade',
          colorCycle: 1,
          style: 'dots',
          finder: 'circle',
          frame: 'sticker',
          grad: 'radial',
          gradStops: GRADIENT_PRESETS[1],
        },
      },
      {
        label: 'retro-drift',
        mode: 'wave',
        params: {
          animPattern: 'drift',
          animSeed: 321,
          easing: 'ease_in',
          interp: 'morph',
          style: 'rounded',
          finder: 'rounded',
          frame: 'tag',
          grad: 'linear',
          gradStops: GRADIENT_PRESETS[2],
        },
      },
      {
        label: 'glass-pulse',
        mode: 'blend',
        params: {
          animPattern: 'pulse',
          easing: 'bounce',
          bounce: 1,
          style: 'rounded',
          finder: 'circle',
          grad: 'radial',
          gradStops: GRADIENT_PRESETS[4],
          fg: '1e3a8a',
          bg: 'eef2ff',
        },
      },
      {
        label: 'poster-wave',
        mode: 'mosaic',
        params: {
          animPattern: 'wave',
          interp: 'crossfade',
          easing: 'ease_out',
          style: 'diamond',
          finder: 'rounded',
          frame: 'rounded_frame',
          colorMode: 'bw',
          grad: 'conic',
          gradStops: GRADIENT_PRESETS[0],
        },
      },
      {
        label: 'heatmap-shimmer',
        mode: 'blend',
        params: {
          animPattern: 'shimmer',
          interp: 'morph',
          colorCycle: 1,
          style: 'dots',
          finder: 'circle',
          frame: 'sticker',
          grad: 'conic',
          gradStops: GRADIENT_PRESETS[2],
          wmEn: 1,
          wmKind: 'pattern',
          wmBlend: 'overlay',
          wmOpacity: 40,
        },
      },
      {
        label: 'cobalt-scanline',
        mode: 'wave',
        params: {
          animPattern: 'scanline',
          reverse: 1,
          easing: 'ease_in_out',
          style: 'connected',
          finder: 'rounded',
          grad: 'radial',
          gradStops: GRADIENT_PRESETS[4],
          fg: '1d4ed8',
          bg: 'eff6ff',
        },
      },
      {
        label: 'forest-drift',
        mode: 'subpixel',
        params: {
          animPattern: 'drift',
          animSeed: 777,
          easing: 'ease_out',
          interp: 'crossfade',
          style: 'rounded',
          finder: 'circle',
          frame: 'tag',
          grad: 'linear',
          gradStops: GRADIENT_PRESETS[4],
          fg: '14532d',
          bg: 'f0fdf4',
        },
      },
      {
        label: 'aurora-pulse',
        mode: 'blend',
        params: {
          animPattern: 'pulse',
          easing: 'ease_in_out',
          style: 'diamond',
          finder: 'rounded',
          frame: 'sticker',
          grad: 'radial',
          gradStops: GRADIENT_PRESETS[3],
          eyeOuter: 'circle',
          eyeInner: 'rounded',
        },
      },
      {
        label: 'dither-wave-etched',
        mode: 'dithered',
        params: {
          animPattern: 'wave',
          interp: 'morph',
          easing: 'ease_in_out',
          ditherKind: 'screened_blue_noise',
          diffusionKernel: 'sierra_2',
          ditherStrength: 62,
          style: 'connected',
          finder: 'rounded',
          grad: 'linear',
          gradStops: GRADIENT_PRESETS[1],
        },
      },
      {
        label: 'dither-shimmer-crystal',
        mode: 'dithered',
        params: {
          animPattern: 'shimmer',
          interp: 'crossfade',
          colorCycle: 1,
          ditherKind: 'ordered_bayer',
          diffusionKernel: 'atkinson',
          ditherStrength: 58,
          style: 'dots',
          finder: 'circle',
          grad: 'conic',
          gradStops: GRADIENT_PRESETS[0],
        },
      },
    ];

    for (let fIdx = 0; fIdx < HERO_ANIM_FIXTURES.length; fIdx++) {
      const fx = HERO_ANIM_FIXTURES[fIdx];
      for (let i = 0; i < heroFeatureCombos.length; i++) {
        const combo = heroFeatureCombos[i];
        const seed = fIdx * 60 + i;
        layer1.push(
          makeConfig(
            CAT,
            `heroFeature-${fx.id}-${combo.label}`,
            {
              ...heroVisualBase(seed, combo.mode),
              img: fx.publicPath,
              format: 'gif',
              ...combo.params,
            },
            { fixtureId: fx.id, isAnimated: true }
          )
        );
      }
    }
  }

  // 17c. Stacked animated+dithered hero combos (king + dance)
  {
    const stackedAnimatedDitherCombos = [
      {
        label: 'dither-wave-morph-sbn',
        params: {
          mode: 'dithered',
          animPattern: 'wave',
          interp: 'morph',
          easing: 'ease_in_out',
          ditherKind: 'screened_blue_noise',
          diffusionKernel: 'sierra_2',
          ditherStrength: 65,
          tempDither: 'flicker_safe',
          colorCycle: 1,
          bounce: 1,
        },
      },
      {
        label: 'dither-shimmer-crossfade-adaptive',
        params: {
          mode: 'dithered',
          animPattern: 'shimmer',
          interp: 'crossfade',
          easing: 'ease_out',
          ditherKind: 'adaptive_threshold',
          diffusionKernel: 'atkinson',
          ditherStrength: 70,
          tempDither: 'flicker_safe',
          colorCycle: 1,
        },
      },
      {
        label: 'dither-scanline-reverse-errordiff',
        params: {
          mode: 'dithered',
          animPattern: 'scanline',
          easing: 'ease_in',
          ditherKind: 'error_diffusion',
          diffusionKernel: 'floyd_steinberg',
          ditherStrength: 55,
          tempDither: 'blue_noise',
          reverse: 1,
        },
      },
      {
        label: 'dither-pulse-bounce-bayer',
        params: {
          mode: 'dithered',
          animPattern: 'pulse',
          easing: 'bounce',
          ditherKind: 'ordered_bayer',
          diffusionKernel: 'sierra_lite',
          ditherStrength: 60,
          colorCycle: 1,
          bounce: 1,
          animSeed: 2026,
        },
      },
      {
        label: 'wave-shimmer-morph-temporal',
        params: {
          mode: 'wave',
          animPattern: 'shimmer',
          interp: 'morph',
          easing: 'ease_in_out',
          tempDither: 'flicker_safe',
          colorCycle: 1,
          bounce: 1,
          animSeed: 888,
        },
      },
      {
        label: 'subpixel-drift-crossfade-cycled',
        params: {
          mode: 'subpixel',
          animPattern: 'drift',
          interp: 'crossfade',
          easing: 'ease_out',
          tempDither: 'blue_noise',
          colorCycle: 1,
          reverse: 1,
          animSeed: 999,
        },
      },
    ];
    for (const fx of HERO_ANIM_FIXTURES) {
      for (const combo of stackedAnimatedDitherCombos) {
        layer1.push(makeConfig(CAT, `animStack-${fx.id}-${combo.label}`,
          { img: fx.publicPath, format: 'gif', ...combo.params, ...overlayModeBase(combo.params.mode) },
          { fixtureId: fx.id, isAnimated: true }));
      }
    }
  }

  // 17b. Animated hero matrix (striking GIF showcase across fixtures and effects)
  for (const fx of ANIMATED_FIXTURES) {
    for (const ap of ANIM_PATTERNS) {
      layer1.push(makeConfig(
        CAT,
        `animHero-${fx.id}-${ap}`,
        { mode: 'blend', img: fx.publicPath, animPattern: ap, format: 'gif', ...overlayModeBase('blend') },
        { fixtureId: fx.id, isAnimated: true }
      ));
    }
    layer1.push(makeConfig(
      CAT,
      `animHero-${fx.id}-wave-morph`,
      {
        mode: 'wave',
        img: fx.publicPath,
        animPattern: 'wave',
        interp: 'morph',
        easing: 'ease_in_out',
        format: 'gif',
        ...overlayModeBase('wave'),
      },
      { fixtureId: fx.id, isAnimated: true }
    ));
    layer1.push(makeConfig(
      CAT,
      `animHero-${fx.id}-shimmer-crossfade`,
      {
        mode: 'blend',
        img: fx.publicPath,
        animPattern: 'shimmer',
        interp: 'crossfade',
        tempDither: 'flicker_safe',
        colorCycle: 1,
        format: 'gif',
        ...overlayModeBase('blend'),
      },
      { fixtureId: fx.id, isAnimated: true }
    ));
  }

  // 18. Watermark showcase in overlay mode
  {
    const fx = STATIC_FIXTURES[3];
    layer1.push(makeConfig(CAT, 'wm-text', { mode: 'blend', img: fx.publicPath, wmEn: 1, wmKind: 'text', wmText: 'ANQR', ...overlayModeBase('blend') }, { fixtureId: fx.id }));
    layer1.push(makeConfig(CAT, 'wm-pattern', { mode: 'blend', img: fx.publicPath, wmEn: 1, wmKind: 'pattern', ...overlayModeBase('blend') }, { fixtureId: fx.id }));
    for (const wmBlend of WATERMARK_BLENDS) {
      layer1.push(makeConfig(CAT, `wmBlend-${wmBlend}`, {
        mode: 'blend',
        img: fx.publicPath,
        wmEn: 1,
        wmKind: 'text',
        wmText: 'ANQR',
        wmBlend,
        ...overlayModeBase('blend'),
      }, { fixtureId: fx.id }));
    }
    for (const wmOpacity of [30, 60, 90]) {
      layer1.push(makeConfig(CAT, `wmOpacity-${wmOpacity}`, {
        mode: 'blend',
        img: fx.publicPath,
        wmEn: 1,
        wmKind: 'text',
        wmText: 'ANQR',
        wmOpacity,
        ...overlayModeBase('blend'),
      }, { fixtureId: fx.id }));
    }
  }

  // 19. Finder/eye style showcase with overlay
  {
    const fx = STATIC_FIXTURES[2];
    for (const finder of FINDER_STYLES.slice(1)) {
      layer1.push(makeConfig(CAT, `finder-${finder}`, {
        mode: 'blend',
        img: fx.publicPath,
        finder,
        ...overlayModeBase('blend'),
      }, { fixtureId: fx.id }));
    }
    layer1.push(makeConfig(CAT, 'eye-rr', {
      mode: 'blend',
      img: fx.publicPath,
      eyeOuter: 'rounded',
      eyeInner: 'rounded',
      ...overlayModeBase('blend'),
    }, { fixtureId: fx.id }));
    layer1.push(makeConfig(CAT, 'eye-cc', {
      mode: 'blend',
      img: fx.publicPath,
      eyeOuter: 'circle',
      eyeInner: 'circle',
      ...overlayModeBase('blend'),
    }, { fixtureId: fx.id }));
  }

  // 20. "Huge permutation" overlay showcases (stacked features)
  layer1.push(makeConfig(CAT, 'mega-static-trump',
    {
      mode: 'dithered',
      img: '/trump.png',
      style: 'dots',
      finder: 'circle',
      grad: 'conic',
      gradStops: GRADIENT_PRESETS[3],
      colorMode: 'grayscale',
      ditherKind: 'screened_blue_noise',
      diffusionKernel: 'sierra_2',
      ditherStrength: 65,
      frame: 'tag',
      eyeOuter: 'circle',
      eyeInner: 'rounded',
      keepFinders: 1,
      keepTiming: 1,
      keepAlign: 1,
      protectFmt: 1,
      protectVer: 1,
      eccAware: 1,
      wmEn: 1,
      wmKind: 'text',
      wmText: 'ANQR',
      wmBlend: 'soft-light',
      wmOpacity: 55,
      ...overlayModeBase('dithered'),
    },
    { fixtureId: 'trump' }));
  layer1.push(makeConfig(CAT, 'mega-anim-king',
    {
      mode: 'blend',
      img: '/king.gif',
      style: 'rounded',
      finder: 'rounded',
      grad: 'radial',
      gradStops: GRADIENT_PRESETS[4],
      colorMode: 'color',
      fit: 'cover',
      intensity: 60,
      frame: 'sticker',
      eyeOuter: 'rounded',
      eyeInner: 'circle',
      animPattern: 'wave',
      interp: 'morph',
      easing: 'ease_in_out',
      tempDither: 'flicker_safe',
      colorCycle: 1,
      bounce: 1,
      reverse: 1,
      animSeed: 777,
      wmEn: 1,
      wmKind: 'pattern',
      wmBlend: 'overlay',
      wmOpacity: 45,
      format: 'gif',
      ...overlayModeBase('blend'),
    },
    { fixtureId: 'king', isAnimated: true }));
  layer1.push(makeConfig(CAT, 'mega-anim-dance',
    {
      mode: 'wave',
      img: '/dance.gif',
      style: 'diamond',
      finder: 'circle',
      grad: 'linear',
      gradStops: GRADIENT_PRESETS[1],
      colorMode: 'bw',
      fit: 'contain',
      intensity: 55,
      animPattern: 'shimmer',
      interp: 'crossfade',
      easing: 'ease_out',
      tempDither: 'blue_noise',
      colorCycle: 1,
      wmEn: 1,
      wmKind: 'text',
      wmText: 'SCAN',
      wmBlend: 'screen',
      wmOpacity: 40,
      format: 'gif',
      ...overlayModeBase('wave'),
    },
    { fixtureId: 'dance', isAnimated: true }));

  // 21. Overlay target/secondary animation stacks (king + dance)
  {
    const targetStackCombos = [
      {
        label: 'modules-wave-x-plus-result-wave-y',
        params: {
          mode: 'blend',
          animPattern: 'wave',
          animTarget: 'modules',
          animWaveAxis: 'x',
          animPattern2: 'wave',
          animTarget2: 'result',
          animWaveAxis2: 'y',
          interp: 'morph',
          easing: 'ease_in_out',
          tempDither: 'flicker_safe',
          colorCycle: 1,
          style: 'dots',
          finder: 'circle',
          grad: 'radial',
          gradStops: GRADIENT_PRESETS[3],
        },
      },
      {
        label: 'result-wave-y-plus-modules-shimmer',
        params: {
          mode: 'mosaic',
          animPattern: 'wave',
          animTarget: 'result',
          animWaveAxis: 'y',
          animPattern2: 'shimmer',
          animTarget2: 'modules',
          interp: 'crossfade',
          easing: 'ease_out',
          tempDither: 'blue_noise',
          style: 'diamond',
          finder: 'rounded',
          grad: 'conic',
          gradStops: GRADIENT_PRESETS[2],
        },
      },
      {
        label: 'both-wave-xy-plus-drift',
        params: {
          mode: 'wave',
          animPattern: 'wave',
          animTarget: 'both',
          animWaveAxis: 'xy',
          animPattern2: 'drift',
          animTarget2: 'both',
          interp: 'morph',
          easing: 'ease_in_out',
          tempDither: 'flicker_safe',
          colorCycle: 1,
          animSeed: 515,
          style: 'connected',
          finder: 'rounded',
          grad: 'linear',
          gradStops: GRADIENT_PRESETS[4],
        },
      },
      {
        label: 'modules-scanline-plus-result-wave-x',
        params: {
          mode: 'subpixel',
          animPattern: 'scanline',
          animTarget: 'modules',
          reverse: 1,
          animPattern2: 'wave',
          animTarget2: 'result',
          animWaveAxis2: 'x',
          interp: 'crossfade',
          easing: 'ease_in',
          tempDither: 'blue_noise',
          style: 'rounded',
          finder: 'circle',
          grad: 'radial',
          gradStops: GRADIENT_PRESETS[0],
        },
      },
    ];
    for (const fx of HERO_ANIM_FIXTURES) {
      for (const combo of targetStackCombos) {
        layer1.push(
          makeConfig(
            CAT,
            `target-stack-${fx.id}-${combo.label}`,
            { img: fx.publicPath, format: 'gif', ...combo.params, ...overlayModeBase(combo.params.mode) },
            { fixtureId: fx.id, isAnimated: true }
          )
        );
      }
    }
  }

  // 22. Light encoding/ECC variation in overlay mode (cap version <= 9)
  {
    const overlayEncCombos = [
      { label: 'ver-5-ec-M', v: 5, ec: 'M', mode: 'blend' },
      { label: 'ver-7-ec-Q', v: 7, ec: 'Q', mode: 'mosaic' },
      { label: 'ver-9-ec-H', v: 9, ec: 'H', mode: 'dithered' },
    ];
    for (let i = 0; i < overlayEncCombos.length; i++) {
      const combo = overlayEncCombos[i];
      const fx = pick(STATIC_FIXTURES, i);
      layer1.push(
        makeConfig(
          CAT,
          `encoding-${combo.label}`,
          {
            mode: combo.mode,
            img: fx.publicPath,
            v: combo.v,
            ec: combo.ec,
            style: pick(['rounded', 'dots', 'diamond'], i),
            finder: pick(['rounded', 'circle'], i + 1),
            grad: pick(GRADIENT_TYPES, i),
            gradStops: pick(GRADIENT_PRESETS, i + 2),
            ...overlayModeBase(combo.mode),
          },
          { fixtureId: fx.id }
        )
      );
    }
  }

  // Layer 1 subtotal: expanded showcase coverage before cross-product filler

  // ── Layer 2: Cross-products to reach 333 ────────────────────────────
  const layer2 = [];

  // Mode × ColorMode (take 12)
  {
    const modes3 = ['blend', 'mosaic', 'dithered', 'subpixel'];
    const pool = cross(CAT, 'mode-x-cm', modes3, COLOR_MODES,
      (m, cm) => ({ mode: m, img: STATIC_FIXTURES[0].publicPath, colorMode: cm, ...overlayModeBase(m) }),
      { fixtureId: STATIC_FIXTURES[0].id });
    layer2.push(...pool.slice(0, 12));
  }

  // Mode × FitMode (take 9)
  {
    const modes3 = ['blend', 'mosaic', 'dithered'];
    const pool = cross(CAT, 'mode-x-fm', modes3, FIT_MODES,
      (m, fm) => ({ mode: m, img: STATIC_FIXTURES[1].publicPath, fit: fm, ...overlayModeBase(m) }),
      { fixtureId: STATIC_FIXTURES[1].id });
    layer2.push(...pool.slice(0, 9));
  }

  // Mode × RenderStyle (take 12)
  {
    const modes4 = ['blend', 'dithered', 'mosaic', 'blue-noise'];
    const styles3 = ['rounded', 'dots', 'diamond'];
    const pool = cross(CAT, 'mode-x-rstyle', modes4, styles3,
      (m, s) => ({ mode: m, img: STATIC_FIXTURES[2].publicPath, style: s, ...overlayModeBase(m) }),
      { fixtureId: STATIC_FIXTURES[2].id });
    layer2.push(...pool.slice(0, 12));
  }

  // Mode × Gradient (take 9)
  {
    const modes3 = ['blend', 'mosaic', 'dithered'];
    const pool = cross(CAT, 'mode-x-grad', modes3, GRADIENT_TYPES,
      (m, g) => ({ mode: m, img: STATIC_FIXTURES[0].publicPath, grad: g, gradStops: GRADIENT_PRESETS[0], ...overlayModeBase(m) }),
      { fixtureId: STATIC_FIXTURES[0].id });
    layer2.push(...pool.slice(0, 9));
  }

  // Mode × DitherKind (take 10)
  {
    const pool = cross(CAT, 'mode-x-dk', ['dithered'], OVERLAY_DITHER_KINDS.slice(0, 10),
      (_m, dk) => ({ mode: 'dithered', img: STATIC_FIXTURES[1].publicPath, ditherKind: dk, ...overlayModeBase('dithered') }),
      { fixtureId: STATIC_FIXTURES[1].id });
    layer2.push(...pool.slice(0, 10));
  }

  // Overlay + Animation cross matrix with dithered GIF coverage
  {
    const modes5 = ['blend', 'mosaic', 'subpixel', 'wave', 'dithered'];
    const patterns3 = ['pulse', 'wave', 'shimmer'];
    for (const fx of ANIMATED_FIXTURES) {
      for (const m of modes5) {
        const patterns = m === 'dithered' ? ['wave', 'shimmer'] : patterns3;
        for (const ap of patterns) {
          layer2.push(
            makeConfig(
              CAT,
              `ov-x-anim-${fx.id}-${m}-${ap}`,
              {
                mode: m,
                img: fx.publicPath,
                animPattern: ap,
                format: 'gif',
                ...(m === 'dithered'
                  ? {
                    ditherKind: ap === 'wave' ? 'screened_blue_noise' : 'adaptive_threshold',
                    diffusionKernel: ap === 'wave' ? 'sierra_2' : 'atkinson',
                    ditherStrength: ap === 'shimmer' ? 65 : 55,
                    tempDither: ap === 'shimmer' ? 'flicker_safe' : 'blue_noise',
                    colorCycle: ap === 'shimmer' ? 1 : undefined,
                  }
                  : {}),
                ...overlayModeBase(m),
              },
              { fixtureId: fx.id, isAnimated: true }
            )
          );
        }
      }
      layer2.push(makeConfig(CAT, `ov-x-anim-${fx.id}-shimmer-morph`,
        {
          mode: 'blend',
          img: fx.publicPath,
          animPattern: 'shimmer',
          interp: 'morph',
          tempDither: 'flicker_safe',
          colorCycle: 1,
          format: 'gif',
          ...overlayModeBase('blend'),
        },
        { fixtureId: fx.id, isAnimated: true }));
      layer2.push(makeConfig(CAT, `ov-x-anim-${fx.id}-dither-wave-morph`,
        {
          mode: 'dithered',
          img: fx.publicPath,
          animPattern: 'wave',
          interp: 'morph',
          easing: 'ease_in_out',
          ditherKind: 'screened_blue_noise',
          diffusionKernel: 'sierra_2',
          ditherStrength: 70,
          tempDither: 'flicker_safe',
          colorCycle: 1,
          bounce: 1,
          format: 'gif',
          ...overlayModeBase('dithered'),
        },
        { fixtureId: fx.id, isAnimated: true }));
    }
  }

  // Preservation combos (take 8)
  {
    const modes4 = ['blend', 'mosaic', 'dithered', 'subpixel'];
    for (let i = 0; i < modes4.length; i++) {
      const fx = pick(STATIC_FIXTURES, i);
      layer2.push(makeConfig(CAT, `keep-finder-${modes4[i]}`,
        { mode: modes4[i], img: fx.publicPath, keepFinders: 1, ...overlayModeBase(modes4[i]) },
        { fixtureId: fx.id }));
      layer2.push(makeConfig(CAT, `keep-both-${modes4[i]}`,
        { mode: modes4[i], img: fx.publicPath, keepFinders: 1, keepTiming: 1, ...overlayModeBase(modes4[i]) },
        { fixtureId: fx.id }));
    }
  }

  // Filter combos (take 6)
  {
    const filterMap = { sharpen: { sharpen: 100 }, blur: { blur: 5 }, edge: { edge: 'sobel' } };
    const filterNames = ['sharpen', 'blur', 'edge'];
    const modes2 = ['blend', 'mosaic'];
    const pool = cross(CAT, 'filter-x-mode', modes2, filterNames,
      (m, f) => ({ mode: m, img: STATIC_FIXTURES[2].publicPath, ...filterMap[f], ...overlayModeBase(m) }),
      { fixtureId: STATIC_FIXTURES[2].id });
    layer2.push(...pool.slice(0, 6));
  }

  // Hero animated dither matrix (explicitly bias king + dance for showcase)
  {
    for (const fx of HERO_ANIM_FIXTURES) {
      for (const dk of SAFE_ANIM_DITHER_KINDS) {
        layer2.push(makeConfig(CAT, `hero-dither-${fx.id}-${dk}`,
          {
            mode: 'dithered',
            img: fx.publicPath,
            format: 'gif',
            animPattern: dk.includes('blue') ? 'shimmer' : 'wave',
            interp: dk.includes('ordered') ? 'crossfade' : 'morph',
            easing: dk.includes('adaptive') ? 'ease_out' : 'ease_in_out',
            tempDither: dk.includes('blue') ? 'flicker_safe' : 'blue_noise',
            colorCycle: 1,
            bounce: dk === 'error_diffusion' ? 1 : undefined,
            reverse: dk === 'ordered_bayer' ? 1 : undefined,
            ditherKind: dk,
            diffusionKernel: dk === 'ordered_bayer' ? 'sierra_lite' : 'sierra_2',
            ditherStrength: dk === 'adaptive_threshold' ? 75 : 60,
            ...overlayModeBase('dithered'),
          },
          { fixtureId: fx.id, isAnimated: true }));
      }
    }
  }
  {
    const heroStackedShowcase = [
      {
        label: 'blend-wave-morph-softlight',
        params: {
          mode: 'blend',
          animPattern: 'wave',
          interp: 'morph',
          easing: 'ease_in_out',
          tempDither: 'flicker_safe',
          colorCycle: 1,
          wmEn: 1,
          wmKind: 'text',
          wmText: 'ANQR',
          wmBlend: 'soft-light',
          wmOpacity: 42,
        },
      },
      {
        label: 'dither-shimmer-blue-noise',
        params: {
          mode: 'dithered',
          animPattern: 'shimmer',
          interp: 'crossfade',
          easing: 'ease_out',
          ditherKind: 'screened_blue_noise',
          diffusionKernel: 'sierra_lite',
          ditherStrength: 58,
          tempDither: 'flicker_safe',
          colorCycle: 1,
        },
      },
      {
        label: 'dither-pulse-bayer-reverse',
        params: {
          mode: 'dithered',
          animPattern: 'pulse',
          easing: 'bounce',
          ditherKind: 'ordered_bayer',
          diffusionKernel: 'atkinson',
          ditherStrength: 60,
          reverse: 1,
          bounce: 1,
          animSeed: 313,
        },
      },
      {
        label: 'mosaic-drift-crossfade',
        params: {
          mode: 'mosaic',
          animPattern: 'drift',
          interp: 'crossfade',
          easing: 'ease_in',
          tempDither: 'blue_noise',
          colorCycle: 1,
          animSeed: 808,
        },
      },
      {
        label: 'wave-scanline-reverse',
        params: {
          mode: 'wave',
          animPattern: 'scanline',
          interp: 'morph',
          easing: 'ease_in_out',
          tempDither: 'flicker_safe',
          reverse: 1,
          colorCycle: 1,
          bounce: 1,
        },
      },
      {
        label: 'subpixel-wave-morph-vivid',
        params: {
          mode: 'subpixel',
          animPattern: 'wave',
          interp: 'morph',
          easing: 'ease_in_out',
          tempDither: 'blue_noise',
          colorCycle: 1,
          bounce: 1,
          animSeed: 404,
        },
      },
      {
        label: 'dither-drift-sierra2',
        params: {
          mode: 'dithered',
          animPattern: 'drift',
          interp: 'crossfade',
          easing: 'ease_out',
          ditherKind: 'screened_blue_noise',
          diffusionKernel: 'sierra_2',
          ditherStrength: 68,
          tempDither: 'flicker_safe',
          animSeed: 121,
        },
      },
      {
        label: 'blend-shimmer-reverse',
        params: {
          mode: 'blend',
          animPattern: 'shimmer',
          interp: 'crossfade',
          easing: 'ease_in',
          tempDither: 'flicker_safe',
          colorCycle: 1,
          reverse: 1,
          animSeed: 606,
        },
      },
      {
        label: 'mosaic-wave-bounce',
        params: {
          mode: 'mosaic',
          animPattern: 'wave',
          interp: 'morph',
          easing: 'ease_in_out',
          tempDither: 'blue_noise',
          bounce: 1,
          colorCycle: 1,
          animSeed: 77,
        },
      },
      {
        label: 'dither-scanline-adaptive',
        params: {
          mode: 'dithered',
          animPattern: 'scanline',
          interp: 'morph',
          easing: 'ease_out',
          ditherKind: 'error_diffusion',
          diffusionKernel: 'sierra_2',
          ditherStrength: 62,
          tempDither: 'blue_noise',
          reverse: 1,
        },
      },
      {
        label: 'blend-drift-softlight',
        params: {
          mode: 'blend',
          animPattern: 'drift',
          interp: 'morph',
          easing: 'ease_in_out',
          tempDither: 'flicker_safe',
          colorCycle: 1,
          animSeed: 512,
          wmEn: 1,
          wmKind: 'text',
          wmText: 'ANQR',
          wmBlend: 'soft-light',
          wmOpacity: 46,
        },
      },
    ];
    for (const fx of HERO_ANIM_FIXTURES) {
      for (const combo of heroStackedShowcase) {
        layer2.push(makeConfig(CAT, `hero-stack-${fx.id}-${combo.label}`,
          { img: fx.publicPath, format: 'gif', ...combo.params, ...overlayModeBase(combo.params.mode) },
          { fixtureId: fx.id, isAnimated: true }));
      }
    }
  }
  {
    const heroMotionCombos = [
      {
        label: 'blend-pulse-easein',
        params: { mode: 'blend', animPattern: 'pulse', easing: 'ease_in', colorCycle: 1, animSeed: 41 },
      },
      {
        label: 'blend-wave-crossfade',
        params: { mode: 'blend', animPattern: 'wave', interp: 'crossfade', easing: 'ease_out', bounce: 1 },
      },
      {
        label: 'blend-shimmer-morph',
        params: { mode: 'blend', animPattern: 'shimmer', interp: 'morph', tempDither: 'flicker_safe', colorCycle: 1 },
      },
      {
        label: 'mosaic-wave-morph',
        params: { mode: 'mosaic', animPattern: 'wave', interp: 'morph', easing: 'ease_in_out', bounce: 1 },
      },
      {
        label: 'mosaic-drift-soft',
        params: { mode: 'mosaic', animPattern: 'drift', interp: 'crossfade', easing: 'ease_in', animSeed: 87 },
      },
      {
        label: 'subpixel-wave-vivid',
        params: { mode: 'subpixel', animPattern: 'wave', interp: 'morph', tempDither: 'blue_noise', colorCycle: 1 },
      },
      {
        label: 'subpixel-shimmer-reverse',
        params: { mode: 'subpixel', animPattern: 'shimmer', interp: 'crossfade', tempDither: 'flicker_safe', reverse: 1 },
      },
      {
        label: 'wave-scanline-bounce',
        params: { mode: 'wave', animPattern: 'scanline', easing: 'ease_in_out', reverse: 1, bounce: 1 },
      },
      {
        label: 'wave-drift-cycle',
        params: { mode: 'wave', animPattern: 'drift', easing: 'ease_out', colorCycle: 1, animSeed: 404 },
      },
      {
        label: 'blend-drift-crossfade',
        params: { mode: 'blend', animPattern: 'drift', interp: 'crossfade', tempDither: 'blue_noise', animSeed: 2026 },
      },
    ];
    for (const fx of HERO_ANIM_FIXTURES) {
      for (const combo of heroMotionCombos) {
        layer2.push(makeConfig(CAT, `hero-motion-${fx.id}-${combo.label}`,
          { img: fx.publicPath, format: 'gif', ...combo.params, ...overlayModeBase(combo.params.mode) },
          { fixtureId: fx.id, isAnimated: true }));
      }
    }
  }

  // ── Merge, dedup, and fill to 333 without clone-padding ────────────
  let all = dedup([...layer1, ...layer2]);
  // Animated + dithered overlay combinations are currently unstable for scan fidelity
  // (frequent near-empty frames / decode failures). Keep dithered coverage in static
  // overlay scenarios, and keep animated overlays on non-dithered modes.
  all = all.filter((cfg) => {
    if (!cfg.isAnimated) return true;
    const mode = String(cfg.params?.mode || '').toLowerCase();
    if (mode === 'dithered') return false;
    if (cfg.params?.ditherKind) return false;
    return true;
  });
  if (all.length < 333) {
    const filler = [];
    const safeFillerModes = ['blend', 'mosaic', 'dithered', 'subpixel', 'pixelate', 'wave'];
    const fillerFixtures = [...HERO_ANIM_FIXTURES, ...STATIC_FIXTURES];
    const safePaletteModes = ['position', 'brightness', 'diagonal', 'radial'];
    const safeFg = ['000000', '1a365d', '166534', '7f1d1d', '4c1d95', '0f172a'];
    const safeBg = ['ffffff', 'f8fafc', 'fff7ed', 'f0fdf4', 'faf5ff', 'eef2ff'];
    const safeBorders = [0, 1, 2, 3];
    const safeIntensity = [35, 45, 55, 65];
    const safeFillerDitherKinds = ['error_diffusion', 'ordered_bayer', 'screened_blue_noise', 'adaptive_threshold'];
    let fillerIndex = 0;
    outer: for (const mode of safeFillerModes) {
      for (const fx of fillerFixtures) {
        if (mode === 'dithered' && fx.isAnimated) {
          continue;
        }
        for (const style of MODULE_STYLES) {
          for (const finder of FINDER_STYLES) {
            for (const grad of GRADIENT_TYPES) {
              for (const fg of safeFg) {
                const i = fillerIndex++;
                const isAnim = Boolean(fx.isAnimated);
                const fillerAnimPattern = pick(['pulse', 'wave', 'shimmer', 'drift'], i + 9);
                filler.push(makeConfig(CAT, `filler-${i}`,
                  {
                    mode,
                    img: fx.publicPath,
                    style,
                    finder,
                    grad,
                    gradStops: pick(GRADIENT_PRESETS, i),
                    colorMode: pick(COLOR_MODES, i + 1),
                    fit: pick(FIT_MODES, i + 2),
                    fg,
                    bg: pick(safeBg, i + 3),
                    border: pick(safeBorders, i + 4),
                    palette: pick(PALETTE_PRESETS, i + 5),
                    paletteMode: pick(safePaletteModes, i + 6),
                    intensity: pick(safeIntensity, i + 7),
                    ditherKind: mode === 'dithered' ? pick(safeFillerDitherKinds, i + 8) : undefined,
                    diffusionKernel: mode === 'dithered' ? pick(DIFFUSION_KERNELS, i + 10) : undefined,
                    ditherStrength: mode === 'dithered' ? pick([50, 60, 70], i + 11) : undefined,
                    format: isAnim ? 'gif' : undefined,
                    animPattern: isAnim ? fillerAnimPattern : undefined,
                    easing: isAnim ? pick(['ease_in', 'ease_out', 'ease_in_out'], i + 12) : undefined,
                    interp: isAnim ? pick(['crossfade', 'morph'], i + 13) : undefined,
                    tempDither: isAnim ? pick(['blue_noise', 'flicker_safe'], i + 14) : undefined,
                    colorCycle: isAnim && fillerAnimPattern === 'shimmer' ? 1 : undefined,
                    bounce: isAnim && fillerAnimPattern === 'wave' ? 1 : undefined,
                    reverse: isAnim && fillerAnimPattern === 'scanline' ? 1 : undefined,
                    animSeed: isAnim ? pick([42, 123, 777, 999], i + 15) : undefined,
                    ...overlayModeBase(mode),
                  },
                  { fixtureId: fx.id, isAnimated: isAnim }));
                if (filler.length >= 2400) {
                  break outer;
                }
              }
            }
          }
        }
      }
    }
    all = dedup([...all, ...filler]);
  }
  all = all.length >= 333 ? all.slice(0, 333) : trimOrPad(all, 333, CAT);
  return assignPayloads(all);
}

// ═══════════════════════════════════════════════════════════════════════
// ARTWORK SCENARIOS (target: 333)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Artwork = QR Art mode: the image is embedded into QR data via
 * Reed-Solomon manipulation. Payload is always URL. ECC defaults to L.
 *
 * Artwork fixtures intentionally exclude:
 * - king.gif
 * - logo.png
 * Remaining fixtures are rebalanced to still yield exactly 333 items.
 */
export function generateArtworkScenarios() {
  _idCounter = 0;
  const CAT = 'artwork';

  function artworkVisualScore(cfg) {
    const params = cfg.params || {};
    const label = cfg.id.replace(/^[^_]+__/, '').replace(/--\d+$/, '');
    let score = 0;

    if (params.style && params.style !== 'square') score += 2;
    if (params.finder && params.finder !== 'square') score += 2;
    if (params.gapMode && params.gapMode !== 'none') score += 2;
    if (params.frame) score += 2;
    if (params.grad) score += 3;
    if (params.eyeOuter && params.eyeOuter !== 'square') score += 2;
    if (params.eyeInner && params.eyeInner !== 'square') score += 2;
    if (params.modColor) score += 2;
    if (params.palette) score += 2;
    if (params.wmEn) score += 1;

    if (params.animPattern) score += 8;
    if (params.easing && params.easing !== 'linear') score += 2;
    if (params.interp) score += 5;
    if (params.tempDither) score += 5;
    if (params.colorCycle) score += 4;
    if (params.bounce) score += 3;
    if (params.reverse) score += 3;
    if (params.animSeed) score += 2;

    if (label.includes('-mega')) score += 20;
    if (label.includes('-stack-')) score += 14;
    if (/(default|fg-navy|fg-red|bg-cream|wm-text|wm-pattern)$/.test(label)) score -= 6;
    if (/frame-(rounded_frame|sticker|tag)$/.test(label)) score -= 2;

    return score;
  }

  function perFixture(fx) {
    const isAnim = fx.isAnimated;
    const base = { mode: 'artwork', img: fx.publicPath };
    const opts = { fixtureId: fx.id, isAnimated: isAnim };
    if (isAnim) base.format = 'gif';

    const configs = [];

    // 1. Base default (1)
    configs.push(makeConfig(CAT, `art-${fx.id}-default`, { ...base }, opts));

    // ── Single-axis sweeps ───────────────────────────────────────

    // ModuleStyle (4)
    for (const s of MODULE_STYLES.slice(1)) {
      configs.push(makeConfig(CAT, `art-${fx.id}-style-${s}`, { ...base, style: s }, opts));
    }

    // Finder (2)
    for (const f of FINDER_STYLES.slice(1)) {
      configs.push(makeConfig(CAT, `art-${fx.id}-finder-${f}`, { ...base, finder: f }, opts));
    }

    // GapMode (3)
    for (const g of GAP_MODES.slice(1)) {
      configs.push(makeConfig(CAT, `art-${fx.id}-gap-${g}`, { ...base, gapMode: g }, opts));
    }

    // Frame (3)
    for (const fr of FRAME_STYLES) {
      configs.push(makeConfig(CAT, `art-${fx.id}-frame-${fr}`, { ...base, frame: fr }, opts));
    }

    // Gradient (3)
    for (const gt of GRADIENT_TYPES) {
      configs.push(makeConfig(CAT, `art-${fx.id}-grad-${gt}`,
        { ...base, grad: gt, gradStops: GRADIENT_PRESETS[0] }, opts));
    }

    // Eye combos (4)
    configs.push(makeConfig(CAT, `art-${fx.id}-eye-rr`, { ...base, eyeOuter: 'rounded', eyeInner: 'rounded' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-eye-cc`, { ...base, eyeOuter: 'circle',  eyeInner: 'circle'  }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-eye-rc`, { ...base, eyeOuter: 'rounded', eyeInner: 'circle'  }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-eye-cr`, { ...base, eyeOuter: 'circle',  eyeInner: 'rounded' }, opts));

    // Colors + watermark (4)
    configs.push(makeConfig(CAT, `art-${fx.id}-fg-navy`,  { ...base, fg: '1a365d' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-fg-red`, {
      ...base,
      fg: 'c41e3a',
      ...(isAnim ? { animPattern: 'drift', animSeed: 123, format: 'gif' } : {}),
    }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-bg-cream`, { ...base, bg: 'fff5e6' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-wm-text`,  { ...base, wmEn: 1, wmKind: 'text', wmText: 'ANQR' }, opts));

    // ECC + watermark blend (2)
    configs.push(makeConfig(CAT, `art-${fx.id}-ec-M`, { ...base, ec: 'M' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-wm-pattern`, { ...base, wmEn: 1, wmKind: 'pattern', wmBlend: 'overlay', wmOpacity: 60 }, opts));

    // subtotal sweeps: 1 + 4 + 2 + 3 + 3 + 3 + 4 + 4 + 2 = 26

    // ── Cross-products ─────────────────────────────────────────

    // Style × Finder (4×2 = 8)
    for (const s of MODULE_STYLES.slice(1)) {
      for (const f of FINDER_STYLES.slice(1)) {
        configs.push(makeConfig(CAT, `art-${fx.id}-${s}-${f}`,
          { ...base, style: s, finder: f }, opts));
      }
    }

    // Style × Gradient (4×3 = 12)
    {
      const pool = [];
      for (const s of MODULE_STYLES.slice(1)) {
        for (const g of GRADIENT_TYPES) {
          pool.push(makeConfig(CAT, `art-${fx.id}-${s}-${g}`,
            { ...base, style: s, grad: g, gradStops: pick(GRADIENT_PRESETS, pool.length) }, opts));
        }
      }
      configs.push(...pool);
    }

    // Style × Frame (4×3 = 12)
    {
      const pool = [];
      for (const s of MODULE_STYLES.slice(1)) {
        for (const fr of FRAME_STYLES) {
          pool.push(makeConfig(CAT, `art-${fx.id}-${s}-${fr}`,
            { ...base, style: s, frame: fr }, opts));
        }
      }
      configs.push(...pool);
    }

    // Style × GapMode (4×3 = 12)
    {
      const pool = [];
      for (const s of MODULE_STYLES.slice(1)) {
        for (const g of GAP_MODES.slice(1)) {
          pool.push(makeConfig(CAT, `art-${fx.id}-${s}-gap-${g}`,
            { ...base, style: s, gapMode: g }, opts));
        }
      }
      configs.push(...pool);
    }

    // Multi-feature combos (3)
    configs.push(makeConfig(CAT, `art-${fx.id}-combo1`,
      { ...base, style: 'rounded', finder: 'rounded', grad: 'linear', gradStops: GRADIENT_PRESETS[1] }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-combo2`,
      { ...base, style: 'dots', finder: 'circle', frame: 'tag', fg: '6b21a8' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-combo3`,
      { ...base, style: 'diamond', gapMode: 'inset', eyeOuter: 'rounded', eyeInner: 'circle' }, opts));

    // subtotal cross: 8 + 12 + 12 + 12 + 3 = 47
    // total per static fixture: 26 + 47 = 73

    // Animated fixtures: include pattern + animation option showcases
    if (isAnim) {
      configs.push(makeConfig(CAT, `art-${fx.id}-anim-pulse`,
        { ...base, animPattern: 'pulse', colorCycle: 1, format: 'gif' }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-anim-wave`,
        { ...base, animPattern: 'wave', bounce: 1, format: 'gif' }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-anim-scanline`,
        { ...base, animPattern: 'scanline', reverse: 1, format: 'gif' }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-anim-shimmer`,
        {
          ...base,
          animPattern: 'shimmer',
          easing: 'ease_out',
          interp: 'crossfade',
          tempDither: 'blue_noise',
          format: 'gif',
        }, opts));

      for (const ap of ANIM_PATTERNS) {
        configs.push(makeConfig(CAT, `art-${fx.id}-anim-rich-${ap}`,
          {
            ...base,
            animPattern: ap,
            easing: 'ease_in_out',
            format: 'gif',
            ...(ap === 'wave' ? { interp: 'morph', bounce: 1 } : {}),
            ...(ap === 'shimmer' ? { colorCycle: 1 } : {}),
          }, opts));
      }
      for (const easing of EASINGS.slice(1)) {
        configs.push(makeConfig(CAT, `art-${fx.id}-anim-easing-${easing}`,
          { ...base, animPattern: 'pulse', easing, format: 'gif' }, opts));
      }
      for (const interp of ['crossfade', 'morph']) {
        configs.push(makeConfig(CAT, `art-${fx.id}-anim-interp-${interp}`,
          { ...base, animPattern: 'wave', interp, format: 'gif' }, opts));
      }
      for (const tempDither of ['blue_noise', 'flicker_safe']) {
        configs.push(makeConfig(CAT, `art-${fx.id}-anim-tempDither-${tempDither}`,
          { ...base, animPattern: 'shimmer', tempDither, format: 'gif' }, opts));
      }
      for (const animSeed of [123]) {
        configs.push(makeConfig(CAT, `art-${fx.id}-anim-seed-${animSeed}`,
          { ...base, animPattern: 'drift', animSeed, format: 'gif' }, opts));
      }
      for (const style of MODULE_STYLES.slice(1)) {
        configs.push(makeConfig(CAT, `art-${fx.id}-anim-style-${style}`,
          { ...base, animPattern: 'wave', style, format: 'gif' }, opts));
      }

      const stackedAnimShowcase = [
        {
          label: 'wave-morph-flicker-cycled',
          params: {
            style: 'dots',
            finder: 'circle',
            grad: 'radial',
            gradStops: GRADIENT_PRESETS[4],
            frame: 'sticker',
            animPattern: 'wave',
            interp: 'morph',
            easing: 'ease_in_out',
            tempDither: 'flicker_safe',
            colorCycle: 1,
            bounce: 1,
            animSeed: 510,
          },
        },
        {
          label: 'shimmer-crossfade-temporal',
          params: {
            style: 'diamond',
            finder: 'rounded',
            gapMode: 'negative_space',
            grad: 'conic',
            gradStops: GRADIENT_PRESETS[3],
            animPattern: 'shimmer',
            interp: 'crossfade',
            easing: 'ease_out',
            tempDither: 'blue_noise',
            colorCycle: 1,
            reverse: 1,
            animSeed: 811,
            wmEn: 1,
            wmKind: 'pattern',
            wmBlend: 'overlay',
            wmOpacity: 42,
          },
        },
        {
          label: 'scanline-reverse-morph',
          params: {
            style: 'connected',
            finder: 'rounded',
            frame: 'tag',
            grad: 'linear',
            gradStops: GRADIENT_PRESETS[2],
            animPattern: 'scanline',
            interp: 'morph',
            easing: 'ease_in',
            tempDither: 'flicker_safe',
            reverse: 1,
            colorCycle: 1,
            animSeed: 95,
          },
        },
        {
          label: 'drift-bounce-crossfade',
          params: {
            style: 'rounded',
            finder: 'circle',
            gapMode: 'inset',
            grad: 'radial',
            gradStops: GRADIENT_PRESETS[1],
            animPattern: 'drift',
            interp: 'crossfade',
            easing: 'bounce',
            tempDither: 'blue_noise',
            bounce: 1,
            colorCycle: 1,
            animSeed: 2026,
            wmEn: 1,
            wmKind: 'text',
            wmText: 'ANQR',
            wmBlend: 'soft-light',
            wmOpacity: 48,
          },
        },
      ];
      for (const combo of stackedAnimShowcase) {
        configs.push(makeConfig(CAT, `art-${fx.id}-stack-${combo.label}`,
          { ...base, ...combo.params, format: 'gif' }, opts));
      }

      // Explicit target-stack showcase for artwork animation:
      // animate modules, result, or both; include orthogonal wave axes.
      const artworkTargetStacks = [
        {
          label: 'target-modules-wave-x-result-wave-y',
          params: {
            animPattern: 'wave',
            animTarget: 'modules',
            animWaveAxis: 'x',
            animPattern2: 'wave',
            animTarget2: 'result',
            animWaveAxis2: 'y',
            interp: 'morph',
            easing: 'ease_in_out',
            tempDither: 'flicker_safe',
            colorCycle: 1,
            style: 'dots',
            finder: 'circle',
            grad: 'radial',
            gradStops: GRADIENT_PRESETS[4],
            format: 'gif',
          },
        },
        {
          label: 'target-result-wave-y-modules-shimmer',
          params: {
            animPattern: 'wave',
            animTarget: 'result',
            animWaveAxis: 'y',
            animPattern2: 'shimmer',
            animTarget2: 'modules',
            interp: 'crossfade',
            easing: 'ease_out',
            tempDither: 'blue_noise',
            style: 'diamond',
            finder: 'rounded',
            grad: 'conic',
            gradStops: GRADIENT_PRESETS[3],
            format: 'gif',
          },
        },
        {
          label: 'target-both-wave-xy-drift',
          params: {
            animPattern: 'wave',
            animTarget: 'both',
            animWaveAxis: 'xy',
            animPattern2: 'drift',
            animTarget2: 'both',
            interp: 'morph',
            easing: 'ease_in_out',
            tempDither: 'flicker_safe',
            colorCycle: 1,
            animSeed: 735,
            style: 'connected',
            finder: 'rounded',
            grad: 'linear',
            gradStops: GRADIENT_PRESETS[2],
            format: 'gif',
          },
        },
      ];
      for (const combo of artworkTargetStacks) {
        configs.push(
          makeConfig(CAT, `art-${fx.id}-stack-${combo.label}`, { ...base, ...combo.params }, opts)
        );
      }
    }

    // Static fixtures: add 2 more combos to reach 55
    if (!isAnim) {
      configs.push(makeConfig(CAT, `art-${fx.id}-combo4`,
        { ...base, style: 'connected', finder: 'rounded', grad: 'radial', gradStops: GRADIENT_PRESETS[2] }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-combo5`,
        { ...base, style: 'rounded', finder: 'rounded', frame: 'sticker', fg: 'c41e3a', bg: 'fff5e6' }, opts));
      // total 55
    }

    // Keep artwork ECC low while adding limited encoding variety.
    const artworkVersionByFixture = {
      trump: { v: 8, ec: 'M' },
      dance: { v: 7, ec: 'M' },
      test: { v: 6, ec: 'L' },
      tsunami: { v: 5, ec: 'L' },
    };
    const encodingChoice = artworkVersionByFixture[fx.id] || { v: 6, ec: 'L' };
    configs.push(
      makeConfig(
        CAT,
        `art-${fx.id}-encoding-v${encodingChoice.v}-${encodingChoice.ec}`,
        { ...base, v: encodingChoice.v, ec: encodingChoice.ec, style: 'rounded', finder: 'rounded' },
        opts
      )
    );

    if (fx.id === 'trump') {
      configs.push(makeConfig(CAT, `art-${fx.id}-mega`,
        {
          ...base,
          ec: 'M',
          style: 'diamond',
          finder: 'rounded',
          frame: 'tag',
          grad: 'conic',
          gradStops: GRADIENT_PRESETS[3],
          eyeOuter: 'circle',
          eyeInner: 'rounded',
          gapMode: 'inset',
          fg: '1a365d',
          bg: 'fff5e6',
          wmEn: 1,
          wmKind: 'text',
          wmText: 'ANQR',
          wmBlend: 'soft-light',
          wmOpacity: 50,
        }, opts));
    }
    if (isAnim) {
      configs.push(makeConfig(CAT, `art-${fx.id}-mega-anim`,
        {
          ...base,
          ec: 'M',
          style: 'dots',
          finder: 'circle',
          frame: 'sticker',
          grad: 'radial',
          gradStops: GRADIENT_PRESETS[4],
          eyeOuter: 'circle',
          eyeInner: 'circle',
          gapMode: 'negative_space',
          animPattern: 'wave',
          interp: 'morph',
          easing: 'ease_in_out',
          tempDither: 'flicker_safe',
          colorCycle: 1,
          bounce: 1,
          animSeed: 888,
          wmEn: 1,
          wmKind: 'pattern',
          wmBlend: 'overlay',
          wmOpacity: 45,
          format: 'gif',
        }, opts));
    }

    // Fixture-local extras to keep artwork volume at target while excluding logo/king.
    if (isAnim) {
      configs.push(makeConfig(CAT, `art-${fx.id}-extra-anim-a`,
        {
          ...base,
          style: 'rounded',
          finder: 'rounded',
          gapMode: 'inset',
          grad: 'linear',
          gradStops: GRADIENT_PRESETS[1],
          animPattern: 'drift',
          easing: 'ease_in_out',
          colorCycle: 1,
          animSeed: 2026,
          modulePx: 5,
          format: 'gif',
        }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-extra-anim-b`,
        {
          ...base,
          style: 'diamond',
          finder: 'circle',
          grad: 'conic',
          gradStops: GRADIENT_PRESETS[3],
          animPattern: 'wave',
          interp: 'morph',
          tempDither: 'flicker_safe',
          bounce: 1,
          modulePx: 7,
          format: 'gif',
        }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-extra-anim-c`,
        {
          ...base,
          style: 'dots',
          finder: 'rounded',
          frame: 'sticker',
          grad: 'radial',
          gradStops: GRADIENT_PRESETS[4],
          animPattern: 'shimmer',
          reverse: 1,
          wmEn: 1,
          wmKind: 'pattern',
          wmBlend: 'soft-light',
          wmOpacity: 40,
          modulePx: 5,
          format: 'gif',
        }, opts));
    } else {
      configs.push(makeConfig(CAT, `art-${fx.id}-extra-static-a`,
        {
          ...base,
          style: 'rounded',
          finder: 'rounded',
          frame: 'rounded_frame',
          grad: 'linear',
          gradStops: GRADIENT_PRESETS[2],
          palette: PALETTE_PRESETS[1],
          paletteMode: 'row',
          modulePx: 5,
          radius: 20,
        }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-extra-static-b`,
        {
          ...base,
          style: 'diamond',
          finder: 'rounded',
          gapMode: 'inset',
          grad: 'conic',
          gradStops: GRADIENT_PRESETS[3],
          palette: PALETTE_PRESETS[3],
          paletteMode: 'position',
          modulePx: 6,
          radius: 24,
          cGuard: 1,
          minContrast: 4.5,
        }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-extra-static-c`,
        {
          ...base,
          style: 'connected',
          finder: 'rounded',
          frame: 'sticker',
          wmEn: 1,
          wmKind: 'text',
          wmText: 'ANQR',
          wmBlend: 'soft-light',
          wmOpacity: 45,
          modulePx: 5,
          fg: '1a365d',
          bg: 'f0fdf4',
        }, opts));
    }

    return configs;
  }

  const perFixtureConfigs = new Map(
    ARTWORK_FIXTURES.map((fx) => {
      const ranked = dedup(perFixture(fx)).sort((a, b) => {
        const scoreDelta = artworkVisualScore(b) - artworkVisualScore(a);
        if (scoreDelta !== 0) return scoreDelta;
        return a.id.localeCompare(b.id);
      });
      return [fx.id, ranked];
    }),
  );

  // Rebalance toward trump/dance while excluding logo/king artwork.
  const targetByFixture = {
    trump: 84,
    dance: 100,
    test: 75,
    tsunami: 74,
  };
  const fixtureOrder = ['trump', 'dance', 'test', 'tsunami'];
  const mustIncludeByFixture = {
    trump: ['art-trump-mega'],
    dance: ['art-dance-mega-anim', 'art-dance-stack-'],
  };
  const selected = [];
  for (const fixtureId of fixtureOrder) {
    const list = perFixtureConfigs.get(fixtureId) || [];
    const take = Math.min(list.length, targetByFixture[fixtureId] || list.length);
    const requiredPrefixes = mustIncludeByFixture[fixtureId] || [];
    const required = list.filter((cfg) =>
      requiredPrefixes.some((prefix) => cfg.id.includes(prefix))
    );
    const requiredIds = new Set(required.map((cfg) => cfg.id));
    const remaining = list.filter((cfg) => !requiredIds.has(cfg.id));
    selected.push(...required.slice(0, take));
    if (required.length < take) {
      selected.push(...remaining.slice(0, take - required.length));
    }
  }

  if (selected.length < 333) {
    const selectedIds = new Set(selected.map((c) => c.id));
    const remainder = [];
    for (const fixtureId of fixtureOrder) {
      const list = perFixtureConfigs.get(fixtureId) || [];
      for (const cfg of list) {
        if (!selectedIds.has(cfg.id)) {
          remainder.push(cfg);
        }
      }
    }
    selected.push(...remainder.slice(0, 333 - selected.length));
  }

  const all = dedup(selected).slice(0, 333);

  // Ensure all artwork configs have URL payload and artwork defaults
  for (const c of all) {
    c.payloadId   = 'url';
    c.params.data = DEFAULT_PAYLOAD.data;
  }

  return all;
}

// ═══════════════════════════════════════════════════════════════════════
// COMBINED: all 1000
// ═══════════════════════════════════════════════════════════════════════

export function generateAllScenarios() {
  const noov = generateNonOverlayScenarios();
  const ov   = generateOverlayScenarios();
  const art  = generateArtworkScenarios();

  // Re-stamp unique IDs across the combined set to avoid counter collisions
  _idCounter = 0;
  const all = [...noov, ...ov, ...art];
  for (const c of all) {
    c.id = uid(c.category, c.id.replace(/^[^_]+__/, '').replace(/--\d+$/, ''));
  }

  // Ensure exactly 1000 (333+333+333 = 999, so add 1 bonus scenario)
  if (all.length < 1000) {
    const bonus = makeConfig('nooverlay', 'bonus-full-featured', {
      style: 'rounded', finder: 'rounded', grad: 'linear',
      gradStops: '6366f1,0,ec4899,0.5,f59e0b,1',
      frame: 'tag', gapMode: 'inset', eyeOuter: 'rounded', eyeInner: 'circle',
      fg: '1a365d', bg: 'faf5ff',
    });
    bonus.payloadId = 'url';
    all.push(bonus);
  }

  return all.slice(0, 1000);
}

// ═══════════════════════════════════════════════════════════════════════
// Utility exports
// ═══════════════════════════════════════════════════════════════════════

/**
 * Convert a scenario config’s params into a URLSearchParams string.
 * Skips internal-only keys that aren’t needed for the API URL.
 */
export function buildUrlParams(config) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(config.params)) {
    if (v !== undefined && v !== null && v !== '') {
      sp.set(k, String(v));
    }
  }
  return sp.toString();
}

/**
 * Derive a deterministic filename for a scenario config.
 * Format: `{category}__{label}.{ext}`
 * where label is the portion of id after `{category}__` and before `--{counter}`.
 */
export function scenarioFilename(config) {
  const ext = config.isAnimated ? 'gif' : 'png';
  // id format: "category__label--counter"
  const label = config.id
    .replace(/^[^_]+__/, '')   // strip category__
    .replace(/--\d+$/, '');     // strip --counter
  return `${config.category}__${label}.${ext}`;
}
