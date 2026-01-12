/**
 * Share Utilities Module
 * Handles URL parameter encoding/decoding, sharing, and embed code generation
 */

// ============================================
// CONSTANTS
// ============================================

/**
 * Maximum recommended share URL length.
 * URLs longer than this may fail in SMS, some social apps, and QR scanners.
 * Browser limits are typically 2048-8192 chars, but many channels are stricter.
 */
export const MAX_SHARE_URL_LENGTH = 2000;

// ============================================
// TYPES
// ============================================

export interface ShareConfig {
  // Content
  data: string;

  // Language
  lang?: string;

  // QR settings
  ec?: string;
  version?: number;
  size?: number;
  margin?: number;
  encodingMode?: string;
  maskPattern?: string | number; // 'auto' or 0-7
  characterEncoding?: string; // 'default', 'utf8', 'iso-8859-1', 'shift-jis'
  borderModulesExtra?: number;
  quietZoneMinEnforce?: boolean;

  // Colors
  fg?: string;
  bg?: string;
  transparent?: boolean;

  // Styles
  style?: string;
  finder?: string;
  alignmentStyle?: string;
  timingStyle?: string;

  // Render settings
  moduleGap?: number;
  gapMode?: string;
  cornerRadius?: number;
  gradientType?: string;
  gradientAngle?: number;
  gradientStops?: Array<{ color: string; pos: number }>;
  subpixelMode?: boolean;
  subpixelGrid?: number;
  eyeOuterStyle?: string;
  eyeInnerStyle?: string;
  eyeScale?: number;
  frameStyle?: string;
  frameText?: string;
  dotRotation?: number;
  crispEdges?: boolean;
  pixelSnap?: string;
  perModuleColorMode?: string;
  contrastGuard?: boolean;
  minContrastRatio?: number;

  // Overlay
  mode?: string;
  intensity?: number;
  logoSize?: number;
  overlayUrl?: string; // URL source for overlay image
  overlayType?: string; // static, gif, apng, webp_anim, video
  overlayFramePick?: string; // all, every_n, max_frames, duration_limit
  cropEnabled?: boolean;
  cropX?: number;
  cropY?: number;
  cropSize?: number;
  fit?: string;
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
  gifUseFrameDelays?: boolean;
  gifMaxFps?: number;
  gifDisposalHandling?: string;
  preserveFinders?: boolean;
  preserveTiming?: boolean;
  preserveAlignment?: boolean;
  protectFormatInfo?: boolean;
  protectVersionInfo?: boolean;
  eccAwareEnabled?: boolean;
  eccAwareRiskBudget?: number;
  eccAwareWeightMap?: string;

  // Overlay preprocessing
  colorMode?: string;
  brightness?: number;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  hue?: number;
  blur?: number;
  sharpen?: number;
  posterize?: number;
  threshold?: number;
  edge?: string;
  invert?: boolean;

  // Dithering
  ditherKind?: string;
  diffusionKernel?: string;
  ditherStrength?: number;
  ditherSerpentine?: boolean;
  orderedMatrix?: string;
  blueNoiseTileSize?: number;
  blueNoiseSeed?: number;
  colorDither?: string;

  // Subpixel
  subpixelGridSize?: string;
  subpixelCenterRule?: string;
  subpixelNeutralColor?: string;
  subpixelFinderOverride?: string;

  // Halftone
  halftoneCell?: string;
  halftoneDotShape?: string;
  brightnessCurve?: string;
  duotoneColor1?: string;
  duotoneColor2?: string;

  // Animation
  speed?: number;
  loop?: boolean;
  reverse?: boolean;
  bounce?: boolean;
  easing?: string;
  startFrame?: number;
  maxFrames?: number;
  frameStep?: number;
  interpolate?: string;
  temporalDither?: string;
  pattern?: string;
  moduleJitter?: number;
  colorCycle?: boolean;
  seed?: number;

  // Output
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
  jpegQuality?: number;
  webpQuality?: number;
  gifColors?: number;
  filename?: string;
  gifPaletteSize?: number;
  gifQuantizer?: string;
  gifDither?: string;
  gifDisposal?: string;
  gifTransparentColor?: string;
  svgTrueVector?: boolean;
  svgShapePrecision?: string;
  svgEmbedRasterOverlay?: boolean;
  dpi?: number;
  includeQuietZone?: boolean;
  bgOverride?: string;
  formatExtra?: string;

  // Safety
  safetyMode?: string;
  safetyMinModulePx?: number;
  safetyMinQuietZone?: number;
  lockFinders?: boolean;
  lockTiming?: boolean;
  lockAlign?: boolean;
  lockFormat?: boolean;
  lockVersion?: boolean;

  // QA
  qaContrastCheck?: boolean;
  qaSimulateBlur?: number;
  qaSimulateNoise?: number;
  qaSimulateRotation?: number;
  qaShowHeatmap?: boolean;

  // Auto-tuning
  autoPickVersion?: boolean;
  autoPickEcc?: boolean;
  autoReduceIntensity?: boolean;

  // Watermark
  watermarkEnabled?: boolean;
  watermarkKind?: string;
  watermarkText?: string;
  watermarkImageUrl?: string; // URL for image/pattern watermark
  watermarkPosition?: string;
  watermarkOpacity?: number;
  watermarkBlend?: string;

  // Animation (for animated GIF via server)
  animationPattern?: string; // none/pulse/wave/scanline/shimmer/drift/color_cycle
  animationFrames?: number;
  animationSpeed?: number;
  animationSeed?: number;

  // Render palette
  palette?: string; // JSON encoded or comma-separated hex colors
  paletteMode?: string; // position, brightness, diagonal, radial, random, row, column

  // Safety per-ECC limits
  maxOverlayIntensityL?: number;
  maxOverlayIntensityM?: number;
  maxOverlayIntensityQ?: number;
  maxOverlayIntensityH?: number;

  // Metadata
  metaTitle?: string;
  metaAuthor?: string;
  metaCopyright?: string;
  metaLicense?: string;
  metaDescription?: string;
  metaCreationTime?: boolean;
  metaCustomKv?: string; // JSON encoded
}

export interface EmbedOptions {
  width: number;
  height: number;
  responsive: boolean;
  showBorder: boolean;
  includeLink: boolean;
}

// ============================================
// URL PARAMETER PARSING
// ============================================

// Helper functions to reduce code duplication and avoid unnecessary type assertions
function parseIntParam(value: string | null): number | undefined {
  return value ? Number.parseInt(value, 10) : undefined;
}

function parseFloatParam(value: string | null): number | undefined {
  return value ? Number.parseFloat(value) : undefined;
}

function prefixHash(value: string | null): string | undefined {
  return value ? `#${value}` : undefined;
}

/**
 * Parse URL parameters into a config object
 */
export function parseUrlParams(): Partial<ShareConfig> {
  const params = new URLSearchParams(globalThis.location.search);

  return {
    data: params.get('data') || undefined,
    lang: params.get('lang') || undefined,
    // QR settings
    ec: params.get('ec') || undefined,
    version: parseIntParam(params.get('v')),
    size: parseIntParam(params.get('size')),
    margin: parseIntParam(params.get('margin')),
    encodingMode: params.get('enc') || undefined,
    maskPattern: params.has('mask')
      ? params.get('mask') === 'auto'
        ? 'auto'
        : parseIntParam(params.get('mask'))
      : undefined,
    characterEncoding: params.get('charset') || undefined,
    borderModulesExtra: parseIntParam(params.get('border')),
    quietZoneMinEnforce: params.has('qzEnforce') ? params.get('qzEnforce') === '1' : undefined,
    // Colors
    fg: prefixHash(params.get('fg')),
    bg: prefixHash(params.get('bg')),
    transparent: params.get('transparent') === '1',
    // Styles
    style: params.get('style') || undefined,
    finder: params.get('finder') || undefined,
    alignmentStyle: params.get('align') || undefined,
    timingStyle: params.get('timing') || undefined,
    // Render settings
    moduleGap: parseIntParam(params.get('gap')),
    gapMode: params.get('gapMode') || undefined,
    cornerRadius: parseIntParam(params.get('radius')),
    gradientType: params.get('grad') || undefined,
    // Gradient stops/angle - parse from URL
    ...(params.get('gradStops')
      ? {
          gradientStops: params
            .get('gradStops')
            ?.split(',')
            .reduce(
              (acc, part, i, arr) => {
                if (i % 2 === 0 && arr[i + 1]) {
                  acc.push({ color: `#${part}`, pos: Number.parseFloat(arr[i + 1]) });
                }
                return acc;
              },
              [] as Array<{ color: string; pos: number }>
            ),
        }
      : {}),
    ...(params.get('gradAngle') ? { gradientAngle: parseIntParam(params.get('gradAngle')) } : {}),
    eyeOuterStyle: params.get('eyeOuter') || undefined,
    eyeInnerStyle: params.get('eyeInner') || undefined,
    eyeScale: parseIntParam(params.get('eyeScale')),
    frameStyle: params.get('frame') || undefined,
    frameText: params.get('frameText') || undefined,
    dotRotation: parseIntParam(params.get('dotRot')),
    crispEdges: params.get('crisp') === '1',
    pixelSnap: params.get('snap') || undefined,
    perModuleColorMode: params.get('modColor') || undefined,
    contrastGuard: params.get('cGuard') === '1',
    minContrastRatio: parseFloatParam(params.get('minContrast')),
    // Overlay
    mode: params.get('mode') || undefined,
    intensity: parseIntParam(params.get('intensity')),
    logoSize: parseIntParam(params.get('logoSize')),
    overlayUrl: params.get('img') || undefined,
    overlayType: params.get('ovType') || undefined,
    overlayFramePick: params.get('ovFramePick') || undefined,
    cropEnabled: params.get('cropEn') === '1',
    cropX: parseFloatParam(params.get('cropX')),
    cropY: parseFloatParam(params.get('cropY')),
    cropSize: parseFloatParam(params.get('cropSize')),
    gifUseFrameDelays: params.has('gifDelays') ? params.get('gifDelays') === '1' : undefined,
    gifMaxFps: parseIntParam(params.get('gifMaxFps')),
    gifDisposalHandling: params.get('gifDispH') || undefined,
    fit: params.get('fit') || undefined,
    rotate: parseIntParam(params.get('rot')),
    flipX: params.get('flipX') === '1',
    flipY: params.get('flipY') === '1',
    preserveFinders: params.get('keepFinders') !== '0',
    preserveTiming: params.get('keepTiming') === '1',
    preserveAlignment: params.get('keepAlign') === '1',
    protectFormatInfo: params.get('protectFmt') === '1',
    protectVersionInfo: params.get('protectVer') === '1',
    eccAwareEnabled: params.get('eccAware') === '1',
    eccAwareRiskBudget: parseIntParam(params.get('eccRisk')),
    eccAwareWeightMap: params.get('eccMap') || undefined,
    // Overlay preprocessing
    colorMode: params.get('colorMode') || undefined,
    brightness: parseIntParam(params.get('brightness')),
    contrast: parseIntParam(params.get('contrast')),
    gamma: parseFloatParam(params.get('gamma')),
    saturation: parseIntParam(params.get('saturation')),
    blur: parseIntParam(params.get('blur')),
    sharpen: parseIntParam(params.get('sharpen')),
    posterize: parseIntParam(params.get('posterize')),
    threshold: parseIntParam(params.get('threshold')),
    edge: params.get('edge') || undefined,
    invert: params.get('invert') === '1',
    hue: parseIntParam(params.get('hue')),
    // Subpixel rendering
    subpixelMode: params.get('subpixel') === '1',
    subpixelGrid: parseIntParam(params.get('spGridNum')),
    // Dithering
    ditherKind: params.get('ditherKind') || undefined,
    diffusionKernel: params.get('diffusionKernel') || undefined,
    ditherStrength: parseIntParam(params.get('ditherStrength')),
    ditherSerpentine: params.get('serpentine') === '1',
    orderedMatrix: params.get('matrix') || undefined,
    blueNoiseTileSize: parseIntParam(params.get('bnTile')),
    blueNoiseSeed: parseIntParam(params.get('bnSeed')),
    colorDither: params.get('colorDither') || undefined,
    // Subpixel
    subpixelGridSize: params.get('spGrid') || undefined,
    subpixelCenterRule: params.get('spCenter') || undefined,
    subpixelNeutralColor: prefixHash(params.get('spNeutral')),
    subpixelFinderOverride: params.get('spFinder') || undefined,
    // Halftone
    halftoneCell: params.get('htCell') || undefined,
    halftoneDotShape: params.get('htDot') || undefined,
    brightnessCurve: params.get('htCurve') || undefined,
    duotoneColor1: prefixHash(params.get('duo1')),
    duotoneColor2: prefixHash(params.get('duo2')),
    // Animation
    speed: parseIntParam(params.get('speed')),
    loop: params.has('loop') ? params.get('loop') !== '0' : undefined,
    reverse: params.get('reverse') === '1',
    bounce: params.get('bounce') === '1',
    startFrame: parseIntParam(params.get('startF')),
    maxFrames: parseIntParam(params.get('maxF')),
    frameStep: parseIntParam(params.get('stepF')),
    interpolate: params.get('interp') || undefined,
    temporalDither: params.get('tempDither') || undefined,
    pattern: params.get('animPattern') || undefined,
    moduleJitter: parseFloatParam(params.get('jitter')),
    colorCycle: params.get('colorCycle') === '1',
    seed: parseIntParam(params.get('seed')),
    easing: params.get('easing') || undefined,
    // Output
    width: parseIntParam(params.get('w')),
    height: parseIntParam(params.get('h')),
    format: params.get('format') || undefined,
    quality: parseFloatParam(params.get('quality')),
    jpegQuality: parseIntParam(params.get('jpegQ')),
    webpQuality: parseIntParam(params.get('webpQ')),
    gifColors: parseIntParam(params.get('gifColors')),
    filename: params.get('fname') || undefined,
    gifPaletteSize: parseIntParam(params.get('gifPal')),
    gifQuantizer: params.get('gifQuant') || undefined,
    gifDither: params.get('gifDith') || undefined,
    gifDisposal: params.get('gifDisp') || undefined,
    gifTransparentColor: prefixHash(params.get('gifTrans')),
    svgTrueVector: params.get('svgVec') === '1',
    svgShapePrecision: params.get('svgPrec') || undefined,
    svgEmbedRasterOverlay: params.has('svgEmbed') ? params.get('svgEmbed') === '1' : undefined,
    dpi: parseIntParam(params.get('dpi')),
    includeQuietZone: params.has('inclQz') ? params.get('inclQz') === '1' : undefined,
    bgOverride: prefixHash(params.get('bgOver')),
    formatExtra: params.get('fmtExtra') || undefined,
    // Safety
    safetyMode: params.get('safeMode') || undefined,
    safetyMinModulePx: parseIntParam(params.get('safeMinPx')),
    safetyMinQuietZone: parseIntParam(params.get('safeMinQz')),
    lockFinders: params.has('lockF') ? params.get('lockF') === '1' : undefined,
    lockTiming: params.has('lockT') ? params.get('lockT') === '1' : undefined,
    lockAlign: params.has('lockA') ? params.get('lockA') === '1' : undefined,
    lockFormat: params.has('lockFmt') ? params.get('lockFmt') === '1' : undefined,
    lockVersion: params.has('lockV') ? params.get('lockV') === '1' : undefined,

    // QA
    qaContrastCheck: params.get('qaContrast') === '1',
    qaSimulateBlur: parseFloatParam(params.get('qaBlur')),
    qaSimulateNoise: parseIntParam(params.get('qaNoise')),
    qaSimulateRotation: parseIntParam(params.get('qaRot')),
    qaShowHeatmap: params.get('qaHeatmap') === '1',

    // Auto-tuning
    autoPickVersion: params.has('autoVer') ? params.get('autoVer') === '1' : undefined,
    autoPickEcc: params.get('autoEcc') === '1',
    autoReduceIntensity: params.get('autoReduce') === '1',

    // Watermark
    watermarkEnabled: params.get('wmEn') === '1',
    watermarkKind: params.get('wmKind') || undefined,
    watermarkText: params.get('wmText') || undefined,
    watermarkPosition: params.get('wmPos') || undefined,
    watermarkOpacity: parseIntParam(params.get('wmOpacity')),
    watermarkBlend: params.get('wmBlend') || undefined,
    watermarkImageUrl: params.get('wmImg') || undefined,

    // Animation
    animationPattern: params.get('animPattern') || undefined,
    animationFrames: parseIntParam(params.get('animFrames')),
    animationSpeed: parseIntParam(params.get('animSpeed')),
    animationSeed: parseIntParam(params.get('animSeed')),

    // Metadata
    metaTitle: params.get('metaTitle') || undefined,
    metaAuthor: params.get('metaAuthor') || undefined,
    metaCopyright: params.get('metaCopy') || undefined,
    metaLicense: params.get('metaLic') || undefined,
    metaDescription: params.get('metaDesc') || undefined,
    metaCreationTime: params.get('metaTime') === '1',
    metaCustomKv: params.get('metaKv') || undefined,

    // Render palette
    palette: params.get('palette') || undefined,
    paletteMode: params.get('paletteMode') || undefined,

    // Safety per-ECC limits
    maxOverlayIntensityL: parseIntParam(params.get('maxIntL')),
    maxOverlayIntensityM: parseIntParam(params.get('maxIntM')),
    maxOverlayIntensityQ: parseIntParam(params.get('maxIntQ')),
    maxOverlayIntensityH: parseIntParam(params.get('maxIntH')),
  };
}

/**
 * Build URL parameters from a config object
 */
export function buildUrlParams(config: Partial<ShareConfig>): string {
  const params = new URLSearchParams();

  // Required
  if (config.data) {
    params.set('data', config.data);
  }

  // Language
  if (config.lang && config.lang !== 'en') {
    params.set('lang', config.lang);
  }

  // QR settings
  if (config.ec && config.ec !== 'H') {
    params.set('ec', config.ec);
  }
  if (config.version && config.version !== 0) {
    params.set('v', config.version.toString());
  }
  if (config.size && config.size !== 20) {
    params.set('size', config.size.toString());
  }
  if (config.margin !== undefined && config.margin !== 4) {
    params.set('margin', config.margin.toString());
  }
  if (config.encodingMode && config.encodingMode !== 'auto') {
    params.set('enc', config.encodingMode);
  }
  if (config.maskPattern !== undefined && config.maskPattern !== 'auto') {
    params.set('mask', String(config.maskPattern));
  }
  if (config.characterEncoding && config.characterEncoding !== 'default') {
    params.set('charset', config.characterEncoding);
  }
  if (config.borderModulesExtra && config.borderModulesExtra !== 0) {
    params.set('border', config.borderModulesExtra.toString());
  }
  if (config.quietZoneMinEnforce === false) {
    params.set('qzEnforce', '0');
  }

  // Colors
  if (config.fg && config.fg !== '#000000') {
    params.set('fg', config.fg.replace('#', ''));
  }
  if (config.bg && config.bg !== '#ffffff') {
    params.set('bg', config.bg.replace('#', ''));
  }
  if (config.transparent) {
    params.set('transparent', '1');
  }

  // Styles
  if (config.style && config.style !== 'square') {
    params.set('style', config.style);
  }
  if (config.finder && config.finder !== 'square') {
    params.set('finder', config.finder);
  }
  if (config.alignmentStyle && config.alignmentStyle !== 'match_finder') {
    params.set('align', config.alignmentStyle);
  }
  if (config.timingStyle && config.timingStyle !== 'match_module') {
    params.set('timing', config.timingStyle);
  }

  // Render settings
  if (config.moduleGap !== undefined && config.moduleGap !== 0) {
    params.set('gap', config.moduleGap.toString());
  }
  if (config.gapMode && config.gapMode !== 'none') {
    params.set('gapMode', config.gapMode);
  }
  if (config.cornerRadius !== undefined && config.cornerRadius !== 0) {
    params.set('radius', config.cornerRadius.toString());
  }
  if (config.gradientType && config.gradientType !== 'none') {
    params.set('grad', config.gradientType);
    // Also encode gradient stops and angle
    if (config.gradientStops && config.gradientStops.length > 0) {
      const stopsStr = config.gradientStops
        .map((s) => `${s.color.replace('#', '')},${s.pos}`)
        .join(',');
      params.set('gradStops', stopsStr);
    }
    if (config.gradientAngle !== undefined && config.gradientAngle !== 0) {
      params.set('gradAngle', config.gradientAngle.toString());
    }
  }
  if (config.eyeOuterStyle && config.eyeOuterStyle !== 'square') {
    params.set('eyeOuter', config.eyeOuterStyle);
  }
  if (config.eyeInnerStyle && config.eyeInnerStyle !== 'square') {
    params.set('eyeInner', config.eyeInnerStyle);
  }
  if (config.eyeScale !== undefined && config.eyeScale !== 100) {
    params.set('eyeScale', config.eyeScale.toString());
  }
  if (config.frameStyle && config.frameStyle !== 'none') {
    params.set('frame', config.frameStyle);
  }
  if (config.frameText) {
    params.set('frameText', config.frameText);
  }
  if (config.dotRotation !== undefined && config.dotRotation !== 0) {
    params.set('dotRot', config.dotRotation.toString());
  }
  if (config.crispEdges === false) {
    params.set('crisp', '0');
  }
  if (config.pixelSnap && config.pixelSnap !== 'floor') {
    params.set('snap', config.pixelSnap);
  }
  if (config.perModuleColorMode && config.perModuleColorMode !== 'solid') {
    params.set('modColor', config.perModuleColorMode);
  }
  if (config.contrastGuard) {
    params.set('cGuard', '1');
  }
  if (config.minContrastRatio !== undefined && config.minContrastRatio !== 4.5) {
    params.set('minContrast', config.minContrastRatio.toString());
  }
  if (config.subpixelMode) {
    params.set('subpixel', '1');
  }
  if (config.subpixelGrid !== undefined && config.subpixelGrid !== 3) {
    params.set('spGridNum', config.subpixelGrid.toString());
  }

  // Overlay
  // Always include mode when overlayUrl is present (server requires it to process overlay)
  // Otherwise, only include if it differs from the default
  if (config.overlayUrl) {
    // When overlay URL is present, always include mode (default to 'dithered')
    params.set('mode', config.mode || 'dithered');
  } else if (config.mode && config.mode !== 'dithered') {
    params.set('mode', config.mode);
  }
  if (config.intensity !== undefined && config.intensity !== 100) {
    params.set('intensity', config.intensity.toString());
  }
  if (config.logoSize !== undefined && config.logoSize !== 25) {
    params.set('logoSize', config.logoSize.toString());
  }
  if (config.overlayUrl) {
    params.set('img', config.overlayUrl);
  }
  if (config.overlayType && config.overlayType !== 'static') {
    params.set('ovType', config.overlayType);
  }
  if (config.overlayFramePick && config.overlayFramePick !== 'all') {
    params.set('ovFramePick', config.overlayFramePick);
  }
  if (config.cropEnabled) {
    params.set('cropEn', '1');
  }
  if (config.cropX !== undefined && config.cropX !== 0.5) {
    params.set('cropX', config.cropX.toString());
  }
  if (config.cropY !== undefined && config.cropY !== 0.5) {
    params.set('cropY', config.cropY.toString());
  }
  if (config.cropSize !== undefined && config.cropSize !== 1) {
    params.set('cropSize', config.cropSize.toString());
  }
  if (config.gifUseFrameDelays === false) {
    params.set('gifDelays', '0');
  }
  if (config.gifMaxFps !== undefined && config.gifMaxFps !== 30) {
    params.set('gifMaxFps', config.gifMaxFps.toString());
  }
  if (config.gifDisposalHandling && config.gifDisposalHandling !== 'respect') {
    params.set('gifDispH', config.gifDisposalHandling);
  }
  if (config.fit && config.fit !== 'cover') {
    params.set('fit', config.fit);
  }
  if (config.rotate !== undefined && config.rotate !== 0) {
    params.set('rot', config.rotate.toString());
  }
  if (config.flipX) {
    params.set('flipX', '1');
  }
  if (config.flipY) {
    params.set('flipY', '1');
  }
  if (config.preserveFinders === false) {
    params.set('keepFinders', '0');
  }
  if (config.preserveTiming) {
    params.set('keepTiming', '1');
  }
  if (config.preserveAlignment) {
    params.set('keepAlign', '1');
  }
  if (config.protectFormatInfo) {
    params.set('protectFmt', '1');
  }
  if (config.protectVersionInfo) {
    params.set('protectVer', '1');
  }
  if (config.eccAwareEnabled) {
    params.set('eccAware', '1');
  }
  if (config.eccAwareRiskBudget !== undefined && config.eccAwareRiskBudget !== 50) {
    params.set('eccRisk', config.eccAwareRiskBudget.toString());
  }
  if (config.eccAwareWeightMap && config.eccAwareWeightMap !== 'distance_to_finders') {
    params.set('eccMap', config.eccAwareWeightMap);
  }

  // Overlay preprocessing
  if (config.colorMode && config.colorMode !== 'color') {
    params.set('colorMode', config.colorMode);
  }
  if (config.brightness !== undefined && config.brightness !== 0) {
    params.set('brightness', config.brightness.toString());
  }
  if (config.contrast !== undefined && config.contrast !== 0) {
    params.set('contrast', config.contrast.toString());
  }
  if (config.gamma !== undefined && config.gamma !== 1) {
    params.set('gamma', config.gamma.toString());
  }
  if (config.saturation !== undefined && config.saturation !== 0) {
    params.set('saturation', config.saturation.toString());
  }
  if (config.hue !== undefined && config.hue !== 0) {
    params.set('hue', config.hue.toString());
  }
  if (config.blur !== undefined && config.blur !== 0) {
    params.set('blur', config.blur.toString());
  }
  if (config.sharpen !== undefined && config.sharpen !== 0) {
    params.set('sharpen', config.sharpen.toString());
  }
  if (config.posterize !== undefined && config.posterize !== 0) {
    params.set('posterize', config.posterize.toString());
  }
  if (config.threshold !== undefined && config.threshold !== 128) {
    params.set('threshold', config.threshold.toString());
  }
  if (config.edge && config.edge !== 'off') {
    params.set('edge', config.edge);
  }
  if (config.invert) {
    params.set('invert', '1');
  }

  // Dithering
  if (config.ditherKind && config.ditherKind !== 'error_diffusion') {
    params.set('ditherKind', config.ditherKind);
  }
  if (config.diffusionKernel && config.diffusionKernel !== 'floyd_steinberg') {
    params.set('diffusionKernel', config.diffusionKernel);
  }
  if (config.ditherStrength !== undefined && config.ditherStrength !== 50) {
    params.set('ditherStrength', config.ditherStrength.toString());
  }
  if (config.ditherSerpentine) {
    params.set('serpentine', '1');
  }
  if (config.orderedMatrix && config.orderedMatrix !== 'bayer4') {
    params.set('matrix', config.orderedMatrix);
  }
  if (config.blueNoiseTileSize !== undefined && config.blueNoiseTileSize !== 64) {
    params.set('bnTile', config.blueNoiseTileSize.toString());
  }
  if (config.blueNoiseSeed !== undefined && config.blueNoiseSeed !== 0) {
    params.set('bnSeed', config.blueNoiseSeed.toString());
  }
  if (config.colorDither && config.colorDither !== 'none') {
    params.set('colorDither', config.colorDither);
  }

  // Subpixel
  if (config.subpixelGridSize && config.subpixelGridSize !== '3x3') {
    params.set('spGrid', config.subpixelGridSize);
  }
  if (config.subpixelCenterRule && config.subpixelCenterRule !== 'strict') {
    params.set('spCenter', config.subpixelCenterRule);
  }
  if (config.subpixelNeutralColor && config.subpixelNeutralColor !== '#808080') {
    params.set('spNeutral', config.subpixelNeutralColor.replace('#', ''));
  }
  if (config.subpixelFinderOverride && config.subpixelFinderOverride !== 'solid') {
    params.set('spFinder', config.subpixelFinderOverride);
  }

  // Halftone
  if (config.halftoneCell && config.halftoneCell !== 'per_module') {
    params.set('htCell', config.halftoneCell);
  }
  if (config.halftoneDotShape && config.halftoneDotShape !== 'circle') {
    params.set('htDot', config.halftoneDotShape);
  }
  if (config.brightnessCurve && config.brightnessCurve !== 'linear') {
    params.set('htCurve', config.brightnessCurve);
  }
  if (config.duotoneColor1 && config.duotoneColor1 !== '#000000') {
    params.set('duo1', config.duotoneColor1.replace('#', ''));
  }
  if (config.duotoneColor2 && config.duotoneColor2 !== '#ffffff') {
    params.set('duo2', config.duotoneColor2.replace('#', ''));
  }

  // Animation
  if (config.speed !== undefined && config.speed !== 100) {
    params.set('speed', config.speed.toString());
  }
  if (config.loop === false) {
    params.set('loop', '0');
  }
  if (config.reverse) {
    params.set('reverse', '1');
  }
  if (config.bounce) {
    params.set('bounce', '1');
  }
  if (config.startFrame !== undefined && config.startFrame !== 0) {
    params.set('startF', config.startFrame.toString());
  }
  if (config.maxFrames !== undefined && config.maxFrames !== 0) {
    params.set('maxF', config.maxFrames.toString());
  }
  if (config.frameStep !== undefined && config.frameStep !== 1) {
    params.set('stepF', config.frameStep.toString());
  }
  if (config.interpolate && config.interpolate !== 'none') {
    params.set('interp', config.interpolate);
  }
  if (config.temporalDither && config.temporalDither !== 'off') {
    params.set('tempDither', config.temporalDither);
  }
  // Note: 'pattern' refers to animation pattern (pulse/wave/etc), NOT module style pattern
  // Using 'animPattern' param name which matches the animation pattern concept
  if (config.pattern && config.pattern !== 'none') {
    params.set('animPattern', config.pattern);
  }
  if (config.moduleJitter !== undefined && config.moduleJitter !== 0) {
    params.set('jitter', config.moduleJitter.toString());
  }
  if (config.colorCycle) {
    params.set('colorCycle', '1');
  }
  if (config.seed !== undefined && config.seed !== 0) {
    params.set('seed', config.seed.toString());
  }
  if (config.easing && config.easing !== 'linear') {
    params.set('easing', config.easing);
  }

  // Output
  if (config.width && config.width !== 400) {
    params.set('w', config.width.toString());
  }
  if (config.height && config.height !== 400) {
    params.set('h', config.height.toString());
  }
  if (config.format && config.format !== 'gif') {
    params.set('format', config.format);
  }
  if (config.quality !== undefined && config.quality !== 0.9) {
    params.set('quality', config.quality.toString());
  }
  if (config.jpegQuality !== undefined && config.jpegQuality !== 92) {
    params.set('jpegQ', config.jpegQuality.toString());
  }
  if (config.webpQuality !== undefined && config.webpQuality !== 90) {
    params.set('webpQ', config.webpQuality.toString());
  }
  if (config.gifColors !== undefined && config.gifColors !== 256) {
    params.set('gifColors', config.gifColors.toString());
  }
  if (config.filename && config.filename !== 'anqr-qrcode') {
    params.set('fname', config.filename);
  }
  if (config.gifPaletteSize !== undefined && config.gifPaletteSize !== 256) {
    params.set('gifPal', config.gifPaletteSize.toString());
  }
  if (config.gifQuantizer && config.gifQuantizer !== 'median_cut') {
    params.set('gifQuant', config.gifQuantizer);
  }
  if (config.gifDither && config.gifDither !== 'floyd') {
    params.set('gifDith', config.gifDither);
  }
  if (config.gifDisposal && config.gifDisposal !== 'restore_background') {
    params.set('gifDisp', config.gifDisposal);
  }
  if (config.svgTrueVector) {
    params.set('svgVec', '1');
  }
  if (config.dpi !== undefined && config.dpi !== 72) {
    params.set('dpi', config.dpi.toString());
  }
  if (config.includeQuietZone === false) {
    params.set('inclQz', '0');
  }
  if (config.bgOverride && config.bgOverride !== '') {
    params.set('bgOver', config.bgOverride.replace('#', ''));
  }
  if (config.gifTransparentColor && config.gifTransparentColor !== '') {
    params.set('gifTrans', config.gifTransparentColor.replace('#', ''));
  }
  if (config.svgShapePrecision && config.svgShapePrecision !== 'pixel') {
    params.set('svgPrec', config.svgShapePrecision);
  }
  if (config.svgEmbedRasterOverlay === false) {
    params.set('svgEmbed', '0');
  }
  if (config.formatExtra && config.formatExtra !== 'none') {
    params.set('fmtExtra', config.formatExtra);
  }

  // Auto-render flag
  // Safety
  if (config.safetyMode && config.safetyMode !== 'off') {
    params.set('safeMode', config.safetyMode);
  }
  if (config.safetyMinModulePx !== undefined && config.safetyMinModulePx !== 2) {
    params.set('safeMinPx', config.safetyMinModulePx.toString());
  }
  if (config.safetyMinQuietZone !== undefined && config.safetyMinQuietZone !== 4) {
    params.set('safeMinQz', config.safetyMinQuietZone.toString());
  }
  if (config.lockFinders === false) {
    params.set('lockF', '0');
  }
  if (config.lockTiming === false) {
    params.set('lockT', '0');
  }
  if (config.lockAlign === false) {
    params.set('lockA', '0');
  }
  if (config.lockFormat === false) {
    params.set('lockFmt', '0');
  }
  if (config.lockVersion === false) {
    params.set('lockV', '0');
  }

  // QA
  if (config.qaContrastCheck) {
    params.set('qaContrast', '1');
  }
  if (config.qaSimulateBlur && config.qaSimulateBlur !== 0) {
    params.set('qaBlur', config.qaSimulateBlur.toString());
  }
  if (config.qaSimulateNoise && config.qaSimulateNoise !== 0) {
    params.set('qaNoise', config.qaSimulateNoise.toString());
  }
  if (config.qaSimulateRotation && config.qaSimulateRotation !== 0) {
    params.set('qaRot', config.qaSimulateRotation.toString());
  }
  if (config.qaShowHeatmap) {
    params.set('qaHeatmap', '1');
  }

  // Auto-tuning
  if (config.autoPickVersion === false) {
    params.set('autoVer', '0');
  }
  if (config.autoPickEcc) {
    params.set('autoEcc', '1');
  }
  if (config.autoReduceIntensity) {
    params.set('autoReduce', '1');
  }

  // Watermark
  if (config.watermarkEnabled) {
    params.set('wmEn', '1');
  }
  if (config.watermarkKind && config.watermarkKind !== 'text') {
    params.set('wmKind', config.watermarkKind);
  }
  if (config.watermarkText) {
    params.set('wmText', config.watermarkText);
  }
  if (config.watermarkPosition && config.watermarkPosition !== 'center') {
    params.set('wmPos', config.watermarkPosition);
  }
  if (config.watermarkOpacity !== undefined && config.watermarkOpacity !== 50) {
    params.set('wmOpacity', config.watermarkOpacity.toString());
  }
  if (config.watermarkBlend && config.watermarkBlend !== 'normal') {
    params.set('wmBlend', config.watermarkBlend);
  }
  if (config.watermarkImageUrl) {
    params.set('wmImg', config.watermarkImageUrl);
  }

  // Animation (for animated GIF via server)
  if (config.animationPattern && config.animationPattern !== 'none') {
    params.set('animPattern', config.animationPattern);
  }
  if (config.animationFrames !== undefined && config.animationFrames !== 24) {
    params.set('animFrames', config.animationFrames.toString());
  }
  if (config.animationSpeed !== undefined && config.animationSpeed !== 100) {
    params.set('animSpeed', config.animationSpeed.toString());
  }
  if (config.animationSeed !== undefined && config.animationSeed !== 0) {
    params.set('animSeed', config.animationSeed.toString());
  }

  // Metadata
  if (config.metaTitle) {
    params.set('metaTitle', config.metaTitle);
  }
  if (config.metaAuthor) {
    params.set('metaAuthor', config.metaAuthor);
  }
  if (config.metaCopyright) {
    params.set('metaCopy', config.metaCopyright);
  }
  if (config.metaLicense) {
    params.set('metaLic', config.metaLicense);
  }
  if (config.metaDescription) {
    params.set('metaDesc', config.metaDescription);
  }
  if (config.metaCreationTime) {
    params.set('metaTime', '1');
  }
  if (config.metaCustomKv) {
    params.set('metaKv', config.metaCustomKv);
  }

  // Render palette
  if (config.palette) {
    params.set('palette', config.palette);
  }
  if (config.paletteMode && config.paletteMode !== 'position') {
    params.set('paletteMode', config.paletteMode);
  }

  // Safety per-ECC limits
  if (config.maxOverlayIntensityL !== undefined && config.maxOverlayIntensityL !== 100) {
    params.set('maxIntL', config.maxOverlayIntensityL.toString());
  }
  if (config.maxOverlayIntensityM !== undefined && config.maxOverlayIntensityM !== 100) {
    params.set('maxIntM', config.maxOverlayIntensityM.toString());
  }
  if (config.maxOverlayIntensityQ !== undefined && config.maxOverlayIntensityQ !== 100) {
    params.set('maxIntQ', config.maxOverlayIntensityQ.toString());
  }
  if (config.maxOverlayIntensityH !== undefined && config.maxOverlayIntensityH !== 100) {
    params.set('maxIntH', config.maxOverlayIntensityH.toString());
  }

  return params.toString();
}

/**
 * Update the browser URL without reloading
 */
export function updateBrowserUrl(config: Partial<ShareConfig>): void {
  const params = buildUrlParams(config);
  const newUrl = globalThis.location.pathname + (params ? `?${params}` : '');
  globalThis.history.replaceState({}, '', newUrl);
}

/**
 * Get the full shareable URL
 */
export function getShareableUrl(config: Partial<ShareConfig>, baseUrl?: string): string {
  if (baseUrl) {
    const params = buildUrlParams(config);
    return params ? `${baseUrl}?${params}` : baseUrl;
  }

  const { hostname, origin, pathname, protocol } = globalThis.location;
  const lowerHost = hostname.toLowerCase();

  const isLocalhost =
    lowerHost === 'localhost' ||
    lowerHost === '127.0.0.1' ||
    lowerHost === '::1' ||
    lowerHost.endsWith('.localhost');

  // In dev (localhost) or Capacitor WebView, use the canonical public domain
  const base =
    isLocalhost || protocol === 'capacitor:' ? `https://anqr.link${pathname}` : origin + pathname;

  const params = buildUrlParams(config);
  return params ? `${base}?${params}` : base;
}

/**
 * Check if a share URL exceeds recommended length limits.
 * Returns warning message if too long, null otherwise.
 */
export function checkShareUrlLength(url: string): string | null {
  if (url.length > MAX_SHARE_URL_LENGTH) {
    return (
      `Share URL is ${url.length} characters (recommended max: ${MAX_SHARE_URL_LENGTH}). ` +
      'Very long URLs may fail in SMS, some social apps, and QR scanners. ' +
      'Consider using fewer custom settings or a URL shortener.'
    );
  }
  return null;
}

// ============================================
// EMBED CODE GENERATION
// ============================================

/**
 * Generate HTML embed code for an image
 * Uses the /api/qr endpoint to return an image (PNG, WebP, or GIF based on format param)
 */
export function generateImageEmbed(
  shareableUrl: string,
  alt: string = 'QR Code',
  options: Partial<EmbedOptions> = {}
): string {
  const opts: EmbedOptions = {
    width: options.width ?? 200,
    height: options.height ?? 200,
    responsive: options.responsive ?? false,
    showBorder: options.showBorder ?? false,
    includeLink: options.includeLink ?? false,
  };

  // Convert shareable URL to image API URL with proper dimensions
  const imageUrl = convertToImageApiUrl(
    shareableUrl,
    opts.width,
    opts.width === opts.height ? undefined : opts.width,
    opts.width === opts.height ? undefined : opts.height
  );

  const style = opts.responsive
    ? 'max-width: 100%; height: auto;'
    : `width: ${opts.width}px; height: ${opts.height}px;`;

  const border = opts.showBorder ? ' border: 1px solid #ccc;' : '';

  const imgTag = `<img src="${imageUrl}" alt="${alt}" style="${style}${border}" />`;

  if (opts.includeLink) {
    return `<a href="${shareableUrl}" target="_blank">${imgTag}</a>`;
  }

  return imgTag;
}

/**
 * Convert a shareable app URL to an image API URL
 * Extracts parameters and maps them to the /api/qr endpoint format
 * @param shareableUrl - The shareable app URL with QR parameters
 * @param size - Default size (used if w/h not in URL)
 * @param width - Optional explicit width (overrides size)
 * @param height - Optional explicit height (overrides size)
 */
export function convertToImageApiUrl(
  shareableUrl: string,
  size: number = 200,
  width?: number,
  height?: number
): string {
  try {
    const url = new URL(shareableUrl);
    const params = url.searchParams;

    // Build image API URL with supported parameters
    const imageParams = new URLSearchParams();

    // Required: data
    const data = params.get('data');
    if (data) {
      imageParams.set('data', data);
    }

    // Output dimensions: use explicit params > URL params > size argument
    const urlWidth = params.get('w');
    const urlHeight = params.get('h');
    const finalWidth = width ?? (urlWidth ? Number.parseInt(urlWidth, 10) : null);
    const finalHeight = height ?? (urlHeight ? Number.parseInt(urlHeight, 10) : null);

    // If either w or h is specified, use w/h params; otherwise use size
    if (finalWidth !== null || finalHeight !== null) {
      // Use w/h - default missing dimension to the other or to size
      imageParams.set('w', (finalWidth ?? finalHeight ?? size).toString());
      imageParams.set('h', (finalHeight ?? finalWidth ?? size).toString());
    } else {
      imageParams.set('size', size.toString());
    }

    // Map client 'size' (module pixels) to server 'modulePx' for consistent sizing
    // This ensures the server uses the same module size as the client preview
    const clientSize = params.get('size');
    if (clientSize) {
      imageParams.set('modulePx', clientSize);
    }

    // All parameters supported by /api/qr that can be passed through directly
    // Note: w/h are handled separately above, not included here to avoid duplicates
    const passThroughParams = [
      // Colors
      'fg',
      'bg',
      'transparent',
      // QR settings
      'ec',
      'margin',
      'enc',
      'v',
      'border',
      'modulePx',
      // Safety per-ECC limits
      'maxIntL',
      'maxIntM',
      'maxIntQ',
      'maxIntH',
      // Rendering options
      'crisp',
      'snap',
      'modColor',
      'cGuard',
      'minContrast',
      // Module styling
      'style',
      'finder',
      'align',
      'timing',
      'eyeOuter',
      'eyeInner',
      'eyeScale',
      // Rendering
      'radius',
      'gap',
      'gapMode',
      'dotRot',
      // Frame
      'frame',
      'frameText',
      // Gradient
      'grad',
      'gradAngle',
      'gradStops',
      // Overlay
      'img',
      'mode',
      'intensity',
      'colorMode',
      'logoSize',
      // Protection settings
      'keepFinders',
      'keepTiming',
      'keepAlign',
      'protectFmt',
      'protectVer',
      // ECC-aware
      'eccAware',
      'eccRisk',
      'eccMap',
      // Overlay preprocessing
      'brightness',
      'contrast',
      'gamma',
      'saturation',
      'hue',
      'invert',
      'blur',
      'sharpen',
      'posterize',
      'threshold',
      'edge',
      'fit',
      'rot',
      'flipX',
      'flipY',
      // Dithering
      'ditherKind',
      'diffusionKernel',
      'ditherStrength',
      'serpentine',
      'matrix',
      'bnTile',
      'bnSeed',
      'colorDither',
      // Subpixel
      'spGrid',
      'spCenter',
      'spNeutral',
      'spFinder',
      // Halftone
      'htCell',
      'htDot',
      'htCurve',
      'duo1',
      'duo2',
      // Palette
      'palette',
      'paletteMode',
      // Output format
      'format',
      'quality',
      'dpi',
      // Watermark
      'wmEn',
      'wmKind',
      'wmText',
      'wmPos',
      'wmOpacity',
      'wmBlend',
      // Metadata
      'metaTitle',
      'metaAuthor',
      'metaCopy',
      'metaDesc',
      // Animation (for animated GIF)
      'animPattern',
      'animFrames',
      'animSpeed',
      'animSeed',
      // Watermark image URL
      'wmImg',
      // Additional params
      'subpixel',
      'spGridNum',
      'jpegQ',
      'webpQ',
      'gifColors',
      'easing',
    ];

    for (const key of passThroughParams) {
      const val = params.get(key);
      if (val) {
        imageParams.set(key, val);
      }
    }

    return `${url.origin}/api/qr?${imageParams.toString()}`;
  } catch {
    // Fallback: use the data parameter with default origin
    return `https://anqr.link/api/qr?data=${encodeURIComponent(shareableUrl)}&size=${size}`;
  }
}

/**
 * Generate iframe embed code
 */
export function generateIframeEmbed(url: string, options: Partial<EmbedOptions> = {}): string {
  const opts: EmbedOptions = {
    width: options.width ?? 300,
    height: options.height ?? 300,
    responsive: options.responsive ?? false,
    showBorder: options.showBorder ?? false,
    includeLink: options.includeLink ?? false,
  };

  const style = opts.responsive
    ? 'width: 100%; aspect-ratio: 1;'
    : `width: ${opts.width}px; height: ${opts.height}px;`;

  const border = opts.showBorder ? ' border: 1px solid #ccc;' : ' border: none;';

  return `<iframe src="${url}" style="${style}${border}" loading="lazy" title="QR Code"></iframe>`;
}

/**
 * Generate markdown embed
 * Converts shareable URL to image API URL for actual image embedding
 */
export function generateMarkdownEmbed(
  shareableUrl: string,
  alt: string = 'QR Code',
  size: number = 200,
  width?: number,
  height?: number
): string {
  const imageUrl = convertToImageApiUrl(shareableUrl, size, width, height);
  return `![${alt}](${imageUrl})`;
}

/**
 * Generate BBCode embed
 */
export function generateBBCodeEmbed(imageUrl: string, linkUrl?: string): string {
  if (linkUrl) {
    return `[url=${linkUrl}][img]${imageUrl}[/img][/url]`;
  }
  return `[img]${imageUrl}[/img]`;
}

// ============================================
// SOCIAL SHARING
// ============================================

/**
 * Generate social share URLs
 */
export function getSocialShareUrls(
  url: string,
  title: string = 'Check out this QR code!'
): Record<string, string> {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error_) {
    // Fallback for older browsers - Clipboard API may not be available
    console.warn('Clipboard API failed, using fallback:', error_);
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      // execCommand is deprecated but necessary for older browser fallback
      // NOSONAR - intentionally using deprecated API for browser compatibility
      document.execCommand('copy');
      return true;
    } catch (fallbackError_) {
      console.warn('Fallback copy failed:', fallbackError_);
      return false;
    } finally {
      textarea.remove();
    }
  }
}

/**
 * Copy image to clipboard (if supported)
 */
export async function copyImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) return false;

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (error_) {
    console.warn('Copy image to clipboard failed:', error_);
    return false;
  }
}

// ============================================
// DATA URL HELPERS
// ============================================

/**
 * Convert canvas to data URL
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.9
): string {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    png: 'image/png',
  };
  const mimeType = mimeTypes[format] || 'image/png';
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Convert canvas to Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.9
): Promise<Blob | null> {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    png: 'image/png',
  };
  const mimeType = mimeTypes[format] || 'image/png';
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
}

/**
 * Create a download link for a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ============================================
// QR CODE URL SHORTENING
// ============================================

/**
 * Shorten a URL for smaller QR codes (using common short URL services)
 * Note: This is a client-side helper - actual shortening requires an API
 */
export function estimateQRSize(text: string, ecc: 'L' | 'M' | 'Q' | 'H' = 'Q'): number {
  const capacities: Record<string, number[]> = {
    L: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520],
    M: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412],
    Q: [11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292],
    H: [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220],
  };

  const caps = capacities[ecc];
  const len = text.length;

  for (let v = 0; v < caps.length; v++) {
    if (caps[v] >= len) {
      return v + 1;
    }
  }

  return 40; // Maximum version
}

// ============================================
// EXPORT
// ============================================

export const ShareUtils = {
  // URL params
  parseUrlParams,
  buildUrlParams,
  updateBrowserUrl,
  getShareableUrl,
  checkShareUrlLength,

  // Embed codes
  generateImageEmbed,
  generateIframeEmbed,
  generateMarkdownEmbed,
  generateBBCodeEmbed,

  // Social
  getSocialShareUrls,
  copyToClipboard,
  copyImageToClipboard,

  // Data
  canvasToDataUrl,
  canvasToBlob,
  downloadBlob,
  estimateQRSize,
};

export default ShareUtils;
