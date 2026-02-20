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
  { id: 'url',   data: 'https://anqr.link' },
  { id: 'phone', data: 'tel:+12345550000' },
  { id: 'email', data: 'mailto:email@anqr.link' },
  { id: 'geo',   data: 'geo:38.90,-77.04' },
  { id: 'wifi',  data: 'WIFI:T:WPA2;S:WIFI;P:;;' },
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
export const EASINGS           = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bounce'];
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
  configs.forEach((c, i) => {
    if (c.category === 'artwork') return;          // artwork stays URL
    if (c.params.data && c.params.data !== DEFAULT_PAYLOAD.data) {
      const explicitPayload = PAYLOADS.find((p) => p.data === c.params.data);
      if (explicitPayload) {
        c.payloadId = explicitPayload.id;
      }
      return;
    }
    const p = PAYLOADS[i % PAYLOADS.length];
    c.payloadId  = p.id;
    c.params.data = p.data;
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

  // 2. Payload samples — phone, email, geo, wifi with default styling (4)
  for (const p of PAYLOADS.slice(1)) {
    layer1.push(makeConfig(CAT, `payload-${p.id}`, { data: p.data }));
  }

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

  // 20. ContrastGuard: 1 (1)
  layer1.push(makeConfig(CAT, 'cGuard', { cGuard: 1 }));

  // 21. MinContrast: 3.0, 4.5, 7.0 (3)
  layer1.push(...sweep(CAT, 'minContrast', [3.0, 4.5, 7.0], v => ({ minContrast: v, cGuard: 1 })));

  // 22. ECCLevel: L, M, Q (3)
  layer1.push(...sweep(CAT, 'ec', ['L', 'M', 'Q'], v => ({ ec: v })));

  // 23. EncodingMode: byte, alphanumeric (2)
  layer1.push(...sweep(CAT, 'enc', ['byte', 'alphanumeric'], v => ({ enc: v })));

  // 24. AutoEcc: 1 (1)
  layer1.push(makeConfig(CAT, 'autoEcc', { autoEcc: 1 }));

  // 25. AutoVersion: 1 (1)
  layer1.push(makeConfig(CAT, 'autoVer', { autoVer: 1 }));

  // 26. BorderModules: 0, 2, 4 (3)
  layer1.push(...sweep(CAT, 'border', [0, 2, 4], v => ({ border: v })));

  // 27. QzEnforce: 1 (1)
  layer1.push(makeConfig(CAT, 'qzEnforce', { qzEnforce: 1 }));

  // 28. AnimPattern sweep (5) — GIF
  layer1.push(...sweep(CAT, 'animPattern', ANIM_PATTERNS, v => ({ animPattern: v, format: 'gif' }), { isAnimated: true }));

  // 29. Easing sweep (4) — GIF
  layer1.push(...sweep(CAT, 'easing', EASINGS.slice(1), v => ({ animPattern: 'pulse', easing: v, format: 'gif' }), { isAnimated: true }));

  // 30. Interpolation: crossfade, morph (2) — GIF
  layer1.push(...sweep(CAT, 'interp', ['crossfade', 'morph'], v => ({ animPattern: 'wave', interp: v, format: 'gif' }), { isAnimated: true }));

  // 31. TempDither: blue_noise, flicker_safe (2) — GIF
  layer1.push(...sweep(CAT, 'tempDither', ['blue_noise', 'flicker_safe'], v => ({ animPattern: 'pulse', tempDither: v, format: 'gif' }), { isAnimated: true }));

  // 32. Bounce: 1 (1) — GIF
  layer1.push(makeConfig(CAT, 'bounce', { animPattern: 'pulse', bounce: 1, format: 'gif' }, { isAnimated: true }));

  // 33. Reverse: 1 (1) — GIF
  layer1.push(makeConfig(CAT, 'reverse', { animPattern: 'wave', reverse: 1, format: 'gif' }, { isAnimated: true }));

  // 34. ColorCycle: 1 (1) — GIF
  layer1.push(makeConfig(CAT, 'colorCycle', { animPattern: 'shimmer', colorCycle: 1, format: 'gif' }, { isAnimated: true }));

  // 35. AnimSeed: 42, 123, 999 (3)
  layer1.push(...sweep(CAT, 'animSeed', [42, 123, 999], v => ({ animPattern: 'drift', animSeed: v, format: 'gif' }), { isAnimated: true }));

  // 36. Watermark sweeps (13)
  layer1.push(makeConfig(CAT, 'wm-text', { wmEn: 1, wmKind: 'text', wmText: 'ANQR' }));
  layer1.push(makeConfig(CAT, 'wm-pattern', { wmEn: 1, wmKind: 'pattern' }));
  layer1.push(...sweep(CAT, 'wmText', ['SCAN ME', 'anqr.link', 'QR CODE'], v => ({ wmEn: 1, wmKind: 'text', wmText: v })));
  layer1.push(...sweep(CAT, 'wmBlend', WATERMARK_BLENDS, v => ({ wmEn: 1, wmKind: 'text', wmText: 'ANQR', wmBlend: v })));
  layer1.push(...sweep(CAT, 'wmOpacity', [30, 60, 90], v => ({ wmEn: 1, wmKind: 'text', wmText: 'ANQR', wmOpacity: v })));

  // 37. GIF encoder sweeps (7)
  layer1.push(...sweep(CAT, 'gifQuant', ['median_cut', 'octree'], v => ({ animPattern: 'pulse', gifQuant: v, format: 'gif' }), { isAnimated: true }));
  layer1.push(...sweep(CAT, 'gifDith', ['floyd', 'ordered'], v => ({ animPattern: 'pulse', gifDith: v, format: 'gif' }), { isAnimated: true }));
  layer1.push(...sweep(CAT, 'gifColors', [128, 64], v => ({ animPattern: 'pulse', gifColors: v, format: 'gif' }), { isAnimated: true }));
  layer1.push(makeConfig(CAT, 'gifTrans', { animPattern: 'pulse', gifTrans: 1, format: 'gif' }, { isAnimated: true }));

  // Layer 1 subtotal: ~118

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

  // AnimPattern × Flags combos (5×3 = 15, take 10)
  {
    const flags = [
      { bounce: 1 }, { reverse: 1 }, { colorCycle: 1 },
    ];
    for (const ap of ANIM_PATTERNS) {
      for (const fl of flags) {
        layer2.push(makeConfig(CAT, `anim-flag-${ap}-${Object.keys(fl)[0]}`,
          { animPattern: ap, ...fl, format: 'gif' }, { isAnimated: true }));
      }
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

  // ── Merge, dedup, trim/pad to 333 ──────────────────────────────────
  let all = dedup([...layer1, ...layer2]);
  all = trimOrPad(all, 333, CAT);
  return assignPayloads(all);
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
  // Dithered stays included as a showcase mode, but uses one safer fixture.
  for (const mode of ANIMATED_OVERLAY_MODES) {
    const fixturesForMode =
      mode === 'dithered' ? ANIMATED_FIXTURES.slice(0, 1) : ANIMATED_FIXTURES;
    for (const fx of fixturesForMode) {
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
  for (const cm of COLOR_MODES) {
    const fx = STATIC_FIXTURES[0];
    layer1.push(makeConfig(CAT, `colorMode-${cm}`,
      { mode: 'blend', img: fx.publicPath, colorMode: cm, ...overlayModeBase('blend') },
      { fixtureId: fx.id }));
  }

  // 4. FitMode sweep (3)
  for (const fm of FIT_MODES) {
    const fx = STATIC_FIXTURES[1];
    layer1.push(makeConfig(CAT, `fit-${fm}`,
      { mode: 'blend', img: fx.publicPath, fit: fm, ...overlayModeBase('blend') },
      { fixtureId: fx.id }));
  }

  // 5. Intensity sweep: 30, 50, 70, 85, 100 (5)
  for (const int of [30, 50, 70, 85, 100]) {
    const fx = STATIC_FIXTURES[2];
    layer1.push(makeConfig(CAT, `intensity-${int}`,
      { mode: 'blend', img: fx.publicPath, intensity: int, ...overlayModeBase('blend') },
      { fixtureId: fx.id }));
  }

  // 6. LogoSize sweep (scanner-safe upper bound)
  for (const ls of [20, 30, 35]) {
    const fx = STATIC_FIXTURES[0];
    layer1.push(makeConfig(CAT, `logoSize-${ls}`,
      { mode: 'center', img: fx.publicPath, logoSize: ls, ...overlayModeBase('center') },
      { fixtureId: fx.id }));
  }

  // 7. DitherKind sweep (16)
  for (const dk of DITHER_KINDS) {
    const fx = STATIC_FIXTURES[1];
    layer1.push(makeConfig(CAT, `ditherKind-${dk}`,
      { mode: 'dithered', img: fx.publicPath, ditherKind: dk, ...overlayModeBase('dithered') },
      { fixtureId: fx.id }));
  }

  // 7b. Animated dither showcase (curated kinds, full-frame GIF source)
  {
    const fx = ANIMATED_FIXTURES[0];
    const animatedDitherKinds = [
      'error_diffusion',
      'blue_noise_threshold',
      'screened_blue_noise',
      'adaptive_threshold',
    ];
    for (const dk of animatedDitherKinds) {
      layer1.push(makeConfig(CAT, `ditherKind-anim-${dk}-${fx.id}`,
        { mode: 'dithered', img: fx.publicPath, ditherKind: dk, format: 'gif', ...overlayModeBase('dithered') },
        { fixtureId: fx.id, isAnimated: true }));
    }
  }

  // 8. DiffusionKernel sweep (8)
  for (const dk of DIFFUSION_KERNELS) {
    const fx = STATIC_FIXTURES[2];
    layer1.push(makeConfig(CAT, `diffKernel-${dk}`,
      { mode: 'dithered', img: fx.publicPath, diffusionKernel: dk, ...overlayModeBase('dithered') },
      { fixtureId: fx.id }));
  }

  // 9. DitherStrength sweep: 25, 50, 75, 100 (4)
  for (const ds of [25, 50, 75, 100]) {
    const fx = STATIC_FIXTURES[0];
    layer1.push(makeConfig(CAT, `ditherStr-${ds}`,
      { mode: 'dithered', img: fx.publicPath, ditherStrength: ds, ...overlayModeBase('dithered') },
      { fixtureId: fx.id }));
  }

  // 10. Subpixel grid size sweep (scanner-safe values)
  for (const sp of [1, 3]) {
    const fx = STATIC_FIXTURES[1];
    layer1.push(makeConfig(CAT, `spGridNum-${sp}`,
      { mode: 'subpixel-size', img: fx.publicPath, spGridNum: sp, ...overlayModeBase('subpixel') },
      { fixtureId: fx.id }));
  }

  // 11. Halftone dot shape sweep: circle, square (line variant is unstable for scan gate)
  for (const hs of ['circle', 'square']) {
    const fx = STATIC_FIXTURES[0];
    layer1.push(makeConfig(CAT, `htDot-${hs}`,
      { mode: 'halftone', img: fx.publicPath, htDot: hs, intensity: 30, ...overlayModeBase('halftone') },
      { fixtureId: fx.id }));
  }

  // 12. Duotone pair sweeps removed (many pairings are intrinsically unscannable).
  // Base duotone mode coverage remains in the mode showcase block.

  // 13. Filter sweep: sharpen, blur, edge (3)
  for (const filt of ['sharpen', 'blur', 'edge']) {
    const fx = STATIC_FIXTURES[1];
    const filterParams = filt === 'sharpen' ? { sharpen: 100 } : filt === 'blur' ? { blur: 5 } : { edge: 'sobel' };
    layer1.push(makeConfig(CAT, `filter-${filt}`,
      { mode: 'blend', img: fx.publicPath, ...filterParams },
      { fixtureId: fx.id }));
  }

  // 14. Crop/flip/rotate (5)
  layer1.push(makeConfig(CAT, 'flipX', { mode: 'blend', img: STATIC_FIXTURES[0].publicPath, flipX: 1 }, { fixtureId: STATIC_FIXTURES[0].id }));
  layer1.push(makeConfig(CAT, 'flipY', { mode: 'blend', img: STATIC_FIXTURES[0].publicPath, flipY: 1 }, { fixtureId: STATIC_FIXTURES[0].id }));
  layer1.push(makeConfig(CAT, 'rot90', { mode: 'blend', img: STATIC_FIXTURES[1].publicPath, rot: 90 }, { fixtureId: STATIC_FIXTURES[1].id }));
  layer1.push(makeConfig(CAT, 'rot180', { mode: 'blend', img: STATIC_FIXTURES[1].publicPath, rot: 180 }, { fixtureId: STATIC_FIXTURES[1].id }));
  layer1.push(makeConfig(CAT, 'cropEn', { mode: 'blend', img: STATIC_FIXTURES[2].publicPath, cropEn: 1 }, { fixtureId: STATIC_FIXTURES[2].id }));

  // 15. Preservation sweeps: keepFinders, keepTiming (4)
  layer1.push(makeConfig(CAT, 'keepFinders', { mode: 'blend', img: STATIC_FIXTURES[0].publicPath, keepFinders: 1 }, { fixtureId: STATIC_FIXTURES[0].id }));
  layer1.push(makeConfig(CAT, 'keepTiming', { mode: 'blend', img: STATIC_FIXTURES[0].publicPath, keepTiming: 1 }, { fixtureId: STATIC_FIXTURES[0].id }));
  layer1.push(makeConfig(CAT, 'keepBoth', { mode: 'blend', img: STATIC_FIXTURES[1].publicPath, keepFinders: 1, keepTiming: 1 }, { fixtureId: STATIC_FIXTURES[1].id }));
  layer1.push(makeConfig(CAT, 'eccAware', { mode: 'blend', img: STATIC_FIXTURES[2].publicPath, eccAware: 1 }, { fixtureId: STATIC_FIXTURES[2].id }));

  // Layer 1 subtotal: ~238

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
    const pool = cross(CAT, 'mode-x-dk', ['dithered'], DITHER_KINDS.slice(0, 10),
      (_m, dk) => ({ mode: 'dithered', img: STATIC_FIXTURES[1].publicPath, ditherKind: dk, ...overlayModeBase('dithered') }),
      { fixtureId: STATIC_FIXTURES[1].id });
    layer2.push(...pool.slice(0, 10));
  }

  // Overlay + Animation (take 10)
  {
    const modes4 = ['blend', 'mosaic', 'subpixel', 'wave'];
    const patterns2 = ['pulse', 'wave'];
    const pool = cross(CAT, 'ov-x-anim', modes4, patterns2,
      (m, ap) => {
        const fx = ANIMATED_FIXTURES[0];
        return { mode: m, img: fx.publicPath, animPattern: ap, format: 'gif', ...overlayModeBase(m) };
      },
      { fixtureId: ANIMATED_FIXTURES[0].id, isAnimated: true });
    layer2.push(...pool);
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

  // Payload variety — different payloads with interesting overlay modes (10)
  {
    const interestingModes = ['center', 'blend', 'mosaic', 'subpixel', 'dithered',
                              'pixelate', 'wave', 'duotone', 'outline', 'brightness'];
    for (let i = 0; i < interestingModes.length; i++) {
      const fx = pick(STATIC_FIXTURES, i);
      const p = PAYLOADS[(i + 1) % PAYLOADS.length];
      layer2.push(makeConfig(CAT, `payload-${p.id}-${interestingModes[i]}`,
        { mode: interestingModes[i], img: fx.publicPath, data: p.data, ...overlayModeBase(interestingModes[i]) },
        { fixtureId: fx.id }));
    }
  }

  // ── Merge, dedup, and fill to 333 without clone-padding ────────────
  let all = dedup([...layer1, ...layer2]);
  if (all.length < 333) {
    const filler = [];
    const safeFillerModes = ['blend', 'mosaic', 'dithered', 'subpixel', 'pixelate', 'wave'];
    const safePaletteModes = ['position', 'brightness', 'diagonal', 'radial'];
    const safeFg = ['000000', '1a365d', '166534', '7f1d1d', '4c1d95', '0f172a'];
    const safeBg = ['ffffff', 'f8fafc', 'fff7ed', 'f0fdf4', 'faf5ff', 'eef2ff'];
    const safeBorders = [0, 1, 2, 3];
    const safeIntensity = [35, 45, 55, 65];
    const safeFillerDitherKinds = ['error_diffusion', 'ordered_bayer', 'screened_blue_noise', 'adaptive_threshold'];
    let fillerIndex = 0;
    outer: for (const mode of safeFillerModes) {
      for (const fx of STATIC_FIXTURES) {
        for (const style of MODULE_STYLES) {
          for (const finder of FINDER_STYLES) {
            for (const grad of GRADIENT_TYPES) {
              for (const fg of safeFg) {
                const i = fillerIndex++;
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
                    ...overlayModeBase(mode),
                  },
                  { fixtureId: fx.id }));
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
 * 6 fixtures × ~55–57 style combos each.
 * Static fixtures: 55 combos each (4 × 55 = 220)
 * Animated fixtures: 57 combos each (2 × 57 = 114)
 * Total: 334 → trim 1 = 333
 */
export function generateArtworkScenarios() {
  _idCounter = 0;
  const CAT = 'artwork';
  const all = [];

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

    // Colors (4)
    configs.push(makeConfig(CAT, `art-${fx.id}-fg-navy`,  { ...base, fg: '1a365d' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-fg-red`,   { ...base, fg: 'c41e3a' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-bg-cream`, { ...base, bg: 'fff5e6' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-bg-mint`,  { ...base, bg: 'f0fdf4' }, opts));

    // ECC (2)
    configs.push(makeConfig(CAT, `art-${fx.id}-ec-M`, { ...base, ec: 'M' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-ec-Q`, { ...base, ec: 'Q' }, opts));

    // subtotal sweeps: 1 + 4 + 2 + 3 + 3 + 3 + 4 + 4 + 2 = 26

    // ── Cross-products ─────────────────────────────────────────

    // Style × Finder (4×2 = 8)
    for (const s of MODULE_STYLES.slice(1)) {
      for (const f of FINDER_STYLES.slice(1)) {
        configs.push(makeConfig(CAT, `art-${fx.id}-${s}-${f}`,
          { ...base, style: s, finder: f }, opts));
      }
    }

    // Style × Gradient (4×3 = 12, take 8)
    {
      const pool = [];
      for (const s of MODULE_STYLES.slice(1)) {
        for (const g of GRADIENT_TYPES) {
          pool.push(makeConfig(CAT, `art-${fx.id}-${s}-${g}`,
            { ...base, style: s, grad: g, gradStops: pick(GRADIENT_PRESETS, pool.length) }, opts));
        }
      }
      configs.push(...pool.slice(0, 8));
    }

    // Style × Frame (4×3 = 12, take 8)
    {
      const pool = [];
      for (const s of MODULE_STYLES.slice(1)) {
        for (const fr of FRAME_STYLES) {
          pool.push(makeConfig(CAT, `art-${fx.id}-${s}-${fr}`,
            { ...base, style: s, frame: fr }, opts));
        }
      }
      configs.push(...pool.slice(0, 8));
    }

    // Multi-feature combos (3)
    configs.push(makeConfig(CAT, `art-${fx.id}-combo1`,
      { ...base, style: 'rounded', finder: 'rounded', grad: 'linear', gradStops: GRADIENT_PRESETS[1] }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-combo2`,
      { ...base, style: 'dots', finder: 'circle', frame: 'tag', fg: '6b21a8' }, opts));
    configs.push(makeConfig(CAT, `art-${fx.id}-combo3`,
      { ...base, style: 'diamond', gapMode: 'inset', eyeOuter: 'rounded', eyeInner: 'circle' }, opts));

    // subtotal cross: 8 + 8 + 8 + 3 = 27
    // total per static fixture: 26 + 27 = 53

    // Animated fixtures get 2 extra animation pattern variants
    if (isAnim) {
      configs.push(makeConfig(CAT, `art-${fx.id}-anim-pulse`,
        { ...base, animPattern: 'pulse', format: 'gif' }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-anim-wave`,
        { ...base, animPattern: 'wave', format: 'gif' }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-anim-scanline`,
        { ...base, animPattern: 'scanline', format: 'gif' }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-anim-shimmer`,
        { ...base, animPattern: 'shimmer', format: 'gif' }, opts));
      // +4 for animated => total 57
    }

    // Static fixtures: add 2 more combos to reach 55
    if (!isAnim) {
      configs.push(makeConfig(CAT, `art-${fx.id}-combo4`,
        { ...base, style: 'connected', finder: 'rounded', grad: 'radial', gradStops: GRADIENT_PRESETS[2] }, opts));
      configs.push(makeConfig(CAT, `art-${fx.id}-combo5`,
        { ...base, style: 'rounded', finder: 'rounded', frame: 'sticker', fg: 'c41e3a', bg: 'fff5e6' }, opts));
      // total 55
    }

    return configs;
  }

  // Generate per fixture
  for (const fx of FIXTURES) {
    all.push(...perFixture(fx));
  }
  // Expected: (4 static × 55) + (2 animated × 57) = 220 + 114 = 334

  // Ensure all artwork configs have URL payload and artwork defaults
  for (const c of all) {
    c.payloadId   = 'url';
    c.params.data = DEFAULT_PAYLOAD.data;
  }

  // Trim to exactly 333
  return trimOrPad(dedup(all), 333, CAT);
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
