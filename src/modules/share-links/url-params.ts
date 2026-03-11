/**
 * Share Links Module - URL Parameters
 * Handles URL parameter encoding/decoding for QR code sharing
 *
 * This module provides:
 * - Server-safe URL parameter parsing (works in Node.js and browser)
 * - URL parameter serialization for sharing
 * - Browser URL updates
 */

import { createLogger } from '../../lib/logger';
import { MAX_SHARE_URL_LENGTH, type ShareConfig } from './types';

const _log = createLogger('SHARE');

// Helper functions to reduce code duplication
function parseIntParam(value: string | null): number | undefined {
  return value ? Number.parseInt(value, 10) : undefined;
}

function parseFloatParam(value: string | null): number | undefined {
  return value ? Number.parseFloat(value) : undefined;
}

function prefixHash(value: string | null): string | undefined {
  return value ? `#${value}` : undefined;
}

function parseMaskParam(params: URLSearchParams): number | 'auto' | undefined {
  if (!params.has('mask')) return undefined;
  return params.get('mask') === 'auto' ? 'auto' : parseIntParam(params.get('mask'));
}

function parseGradientStopsParam(
  raw: string | null
): Array<{ color: string; pos: number }> | undefined {
  if (!raw) return undefined;
  const parts = raw.split(',');
  const stops: Array<{ color: string; pos: number }> = [];
  for (let i = 0; i < parts.length - 1; i += 2) {
    stops.push({ color: `#${parts[i]}`, pos: Number.parseFloat(parts[i + 1]) });
  }
  return stops.length > 0 ? stops : undefined;
}

function parseBlendMode(params: URLSearchParams): 'overlay' | 'dither' | undefined {
  const mode = params.get('blendPresMode');
  if (mode === 'dither' || mode === 'overlay') return mode;
  return undefined;
}

/**
 * Server-safe URL parameter parsing
 * Takes a URLSearchParams object and returns a ShareConfig
 * This can be used in both browser and Node.js environments
 */
export function parseUrlParamsFromSearchParams(params: URLSearchParams): Partial<ShareConfig> {
  return {
    data: params.get('data') || undefined,
    lang: params.get('lang') || undefined,
    // QR settings
    ec: params.get('ec') || undefined,
    version: parseIntParam(params.get('v')),
    size: parseIntParam(params.get('size')),
    margin: parseIntParam(params.get('margin')),
    encodingMode: params.get('enc') || undefined,
    maskPattern: parseMaskParam(params),
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
    gradientStops: parseGradientStopsParam(params.get('gradStops')),
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
    finderDitherStrength: parseIntParam(params.get('finderDither')),
    blendPreservations: params.get('blendPres') === '1',
    blendPreservationMode: parseBlendMode(params),
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
    target: (params.get('animTarget') as 'result' | 'modules' | 'both' | null) || undefined,
    waveAxis: (params.get('animWaveAxis') as 'x' | 'y' | 'xy' | null) || undefined,
    pattern2: params.get('animPattern2') || undefined,
    target2: (params.get('animTarget2') as 'result' | 'modules' | 'both' | null) || undefined,
    waveAxis2: (params.get('animWaveAxis2') as 'x' | 'y' | 'xy' | null) || undefined,
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
    animationTarget:
      (params.get('animTarget') as 'result' | 'modules' | 'both' | null) || undefined,
    animationWaveAxis: (params.get('animWaveAxis') as 'x' | 'y' | 'xy' | null) || undefined,
    animationPattern2: params.get('animPattern2') || undefined,
    animationTarget2:
      (params.get('animTarget2') as 'result' | 'modules' | 'both' | null) || undefined,
    animationWaveAxis2: (params.get('animWaveAxis2') as 'x' | 'y' | 'xy' | null) || undefined,
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
    maxOverlayIntensityL: parseIntParam(
      params.get('maxIntL') || params.get('maxOverlayIntensityL')
    ),
    maxOverlayIntensityM: parseIntParam(
      params.get('maxIntM') || params.get('maxOverlayIntensityM')
    ),
    maxOverlayIntensityQ: parseIntParam(
      params.get('maxIntQ') || params.get('maxOverlayIntensityQ')
    ),
    maxOverlayIntensityH: parseIntParam(
      params.get('maxIntH') || params.get('maxOverlayIntensityH')
    ),

    // Module pixel size (for server-side generation)
    modulePx: parseIntParam(params.get('modulePx')),
  };
}

/**
 * Parse URL parameters into a config object (browser-only)
 * Wraps parseUrlParamsFromSearchParams for browser convenience
 */
export function parseUrlParams(): Partial<ShareConfig> {
  return parseUrlParamsFromSearchParams(new URLSearchParams(globalThis.location.search));
}

function buildQREncodingParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.encodingMode && config.encodingMode !== 'auto') params.set('enc', config.encodingMode);
  if (config.maskPattern !== undefined && config.maskPattern !== 'auto')
    params.set('mask', String(config.maskPattern));
  if (config.characterEncoding && config.characterEncoding !== 'default')
    params.set('charset', config.characterEncoding);
  if (config.borderModulesExtra && config.borderModulesExtra !== 0)
    params.set('border', config.borderModulesExtra.toString());
  if (config.quietZoneMinEnforce === false) params.set('qzEnforce', '0');
}

function buildQRSettingsParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.ec && config.ec !== 'H') params.set('ec', config.ec);
  if (config.version && config.version !== 0) params.set('v', config.version.toString());
  if (config.size && config.size !== 20) params.set('size', config.size.toString());
  if (config.margin !== undefined && config.margin !== 4)
    params.set('margin', config.margin.toString());
  buildQREncodingParams(config, params);
}

function buildColorParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.fg && config.fg !== '#000000') params.set('fg', config.fg.replace('#', ''));
  if (config.bg && config.bg !== '#ffffff') params.set('bg', config.bg.replace('#', ''));
  if (config.transparent) params.set('transparent', '1');
}

function buildStyleParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.style && config.style !== 'square') params.set('style', config.style);
  if (config.finder && config.finder !== 'square') params.set('finder', config.finder);
  if (config.alignmentStyle && config.alignmentStyle !== 'match_finder')
    params.set('align', config.alignmentStyle);
  if (config.timingStyle && config.timingStyle !== 'match_module')
    params.set('timing', config.timingStyle);
}

function buildRenderGradientParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.gradientType && config.gradientType !== 'none') {
    params.set('grad', config.gradientType);
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
}

function buildRenderEyeFrameParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.eyeOuterStyle && config.eyeOuterStyle !== 'square')
    params.set('eyeOuter', config.eyeOuterStyle);
  if (config.eyeInnerStyle && config.eyeInnerStyle !== 'square')
    params.set('eyeInner', config.eyeInnerStyle);
  if (config.eyeScale !== undefined && config.eyeScale !== 100)
    params.set('eyeScale', config.eyeScale.toString());
  if (config.frameStyle && config.frameStyle !== 'none') params.set('frame', config.frameStyle);
  if (config.frameText) params.set('frameText', config.frameText);
}

function buildRenderAdvancedParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.dotRotation !== undefined && config.dotRotation !== 0)
    params.set('dotRot', config.dotRotation.toString());
  if (config.crispEdges === false) params.set('crisp', '0');
  if (config.pixelSnap && config.pixelSnap !== 'floor') params.set('snap', config.pixelSnap);
  if (config.perModuleColorMode && config.perModuleColorMode !== 'solid')
    params.set('modColor', config.perModuleColorMode);
  if (config.contrastGuard) params.set('cGuard', '1');
  if (config.minContrastRatio !== undefined && config.minContrastRatio !== 4.5)
    params.set('minContrast', config.minContrastRatio.toString());
  if (config.subpixelMode) params.set('subpixel', '1');
  if (config.subpixelGrid !== undefined && config.subpixelGrid !== 3)
    params.set('spGridNum', config.subpixelGrid.toString());
}

function buildRenderParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.moduleGap !== undefined && config.moduleGap !== 0)
    params.set('gap', config.moduleGap.toString());
  if (config.gapMode && config.gapMode !== 'none') params.set('gapMode', config.gapMode);
  if (config.cornerRadius !== undefined && config.cornerRadius !== 0)
    params.set('radius', config.cornerRadius.toString());
  buildRenderGradientParams(config, params);
  buildRenderEyeFrameParams(config, params);
  buildRenderAdvancedParams(config, params);
}

function buildOverlayImageSourceParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.overlayUrl) params.set('img', config.overlayUrl);
  if (config.overlayType && config.overlayType !== 'static')
    params.set('ovType', config.overlayType);
  if (config.overlayFramePick && config.overlayFramePick !== 'all')
    params.set('ovFramePick', config.overlayFramePick);
}

function buildOverlayCropParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.cropEnabled) params.set('cropEn', '1');
  if (config.cropX !== undefined && config.cropX !== 0.5)
    params.set('cropX', config.cropX.toString());
  if (config.cropY !== undefined && config.cropY !== 0.5)
    params.set('cropY', config.cropY.toString());
  if (config.cropSize !== undefined && config.cropSize !== 1)
    params.set('cropSize', config.cropSize.toString());
}

function buildOverlayGifParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.gifUseFrameDelays === false) params.set('gifDelays', '0');
  if (config.gifMaxFps !== undefined && config.gifMaxFps !== 30)
    params.set('gifMaxFps', config.gifMaxFps.toString());
  if (config.gifDisposalHandling && config.gifDisposalHandling !== 'respect')
    params.set('gifDispH', config.gifDisposalHandling);
}

function buildOverlayImageParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  buildOverlayImageSourceParams(config, params);
  buildOverlayCropParams(config, params);
  buildOverlayGifParams(config, params);
}

function buildOverlayTransformParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.fit && config.fit !== 'cover') params.set('fit', config.fit);
  if (config.rotate !== undefined && config.rotate !== 0)
    params.set('rot', config.rotate.toString());
  if (config.flipX) params.set('flipX', '1');
  if (config.flipY) params.set('flipY', '1');
}

function buildOverlayProtectionParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.preserveFinders === false) params.set('keepFinders', '0');
  if (config.preserveTiming) params.set('keepTiming', '1');
  if (config.preserveAlignment) params.set('keepAlign', '1');
  if (config.protectFormatInfo) params.set('protectFmt', '1');
  if (config.protectVersionInfo) params.set('protectVer', '1');
  if (config.eccAwareEnabled) params.set('eccAware', '1');
  if (config.eccAwareRiskBudget !== undefined && config.eccAwareRiskBudget !== 50)
    params.set('eccRisk', config.eccAwareRiskBudget.toString());
  if (config.eccAwareWeightMap && config.eccAwareWeightMap !== 'distance_to_finders')
    params.set('eccMap', config.eccAwareWeightMap);
}

function buildOverlayParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.overlayUrl) {
    params.set('mode', config.mode || 'dithered');
  } else if (config.mode && config.mode !== 'dithered') {
    params.set('mode', config.mode);
  }
  if (config.intensity !== undefined && config.intensity !== 100)
    params.set('intensity', config.intensity.toString());
  if (config.logoSize !== undefined && config.logoSize !== 25)
    params.set('logoSize', config.logoSize.toString());
  buildOverlayImageParams(config, params);
  buildOverlayTransformParams(config, params);
  buildOverlayProtectionParams(config, params);
}

function buildPreprocessingColorParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.colorMode && config.colorMode !== 'color') params.set('colorMode', config.colorMode);
  if (config.brightness !== undefined && config.brightness !== 0)
    params.set('brightness', config.brightness.toString());
  if (config.contrast !== undefined && config.contrast !== 0)
    params.set('contrast', config.contrast.toString());
  if (config.gamma !== undefined && config.gamma !== 1)
    params.set('gamma', config.gamma.toString());
  if (config.saturation !== undefined && config.saturation !== 0)
    params.set('saturation', config.saturation.toString());
  if (config.hue !== undefined && config.hue !== 0) params.set('hue', config.hue.toString());
}

function buildPreprocessingFilterParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.blur !== undefined && config.blur !== 0) params.set('blur', config.blur.toString());
  if (config.sharpen !== undefined && config.sharpen !== 0)
    params.set('sharpen', config.sharpen.toString());
  if (config.posterize !== undefined && config.posterize !== 0)
    params.set('posterize', config.posterize.toString());
  if (config.threshold !== undefined && config.threshold !== 128)
    params.set('threshold', config.threshold.toString());
  if (config.edge && config.edge !== 'off') params.set('edge', config.edge);
  if (config.invert) params.set('invert', '1');
}

function buildPreprocessingParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  buildPreprocessingColorParams(config, params);
  buildPreprocessingFilterParams(config, params);
}

function buildDitherBlendParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.blendPreservations) params.set('blendPres', '1');
  if (
    config.blendPreservations &&
    config.blendPreservationMode &&
    config.blendPreservationMode !== 'overlay'
  ) {
    params.set('blendPresMode', config.blendPreservationMode);
  }
}

function buildDitherNoiseParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.orderedMatrix && config.orderedMatrix !== 'bayer4')
    params.set('matrix', config.orderedMatrix);
  if (config.blueNoiseTileSize !== undefined && config.blueNoiseTileSize !== 64)
    params.set('bnTile', config.blueNoiseTileSize.toString());
  if (config.blueNoiseSeed !== undefined && config.blueNoiseSeed !== 0)
    params.set('bnSeed', config.blueNoiseSeed.toString());
  if (config.colorDither && config.colorDither !== 'none')
    params.set('colorDither', config.colorDither);
}

function buildDitheringParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.ditherKind && config.ditherKind !== 'error_diffusion')
    params.set('ditherKind', config.ditherKind);
  if (config.diffusionKernel && config.diffusionKernel !== 'floyd_steinberg')
    params.set('diffusionKernel', config.diffusionKernel);
  if (config.ditherStrength !== undefined && config.ditherStrength !== 50)
    params.set('ditherStrength', config.ditherStrength.toString());
  if (config.finderDitherStrength !== undefined && config.finderDitherStrength !== 65)
    params.set('finderDither', config.finderDitherStrength.toString());
  buildDitherBlendParams(config, params);
  if (config.ditherSerpentine) params.set('serpentine', '1');
  buildDitherNoiseParams(config, params);
}

function buildHalftoneSpecificParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.halftoneCell && config.halftoneCell !== 'per_module')
    params.set('htCell', config.halftoneCell);
  if (config.halftoneDotShape && config.halftoneDotShape !== 'circle')
    params.set('htDot', config.halftoneDotShape);
  if (config.brightnessCurve && config.brightnessCurve !== 'linear')
    params.set('htCurve', config.brightnessCurve);
  if (config.duotoneColor1 && config.duotoneColor1 !== '#000000')
    params.set('duo1', config.duotoneColor1.replace('#', ''));
  if (config.duotoneColor2 && config.duotoneColor2 !== '#ffffff')
    params.set('duo2', config.duotoneColor2.replace('#', ''));
}

function buildSubpixelHalftoneParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.subpixelGridSize && config.subpixelGridSize !== '3x3')
    params.set('spGrid', config.subpixelGridSize);
  if (config.subpixelCenterRule && config.subpixelCenterRule !== 'strict')
    params.set('spCenter', config.subpixelCenterRule);
  if (config.subpixelNeutralColor && config.subpixelNeutralColor !== '#808080')
    params.set('spNeutral', config.subpixelNeutralColor.replace('#', ''));
  if (config.subpixelFinderOverride && config.subpixelFinderOverride !== 'solid')
    params.set('spFinder', config.subpixelFinderOverride);
  buildHalftoneSpecificParams(config, params);
}

function buildAnimPatternPrimaryParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.pattern && config.pattern !== 'none') params.set('animPattern', config.pattern);
  if (config.target && config.target !== 'result') params.set('animTarget', config.target);
  if (config.waveAxis && config.waveAxis !== 'y') params.set('animWaveAxis', config.waveAxis);
}

function buildAnimPatternSecondaryParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.pattern2 && config.pattern2 !== 'none') params.set('animPattern2', config.pattern2);
  if (config.target2 && config.pattern2 && config.pattern2 !== 'none')
    params.set('animTarget2', config.target2);
  if (config.waveAxis2 && config.waveAxis2 !== 'x') params.set('animWaveAxis2', config.waveAxis2);
  if (config.moduleJitter !== undefined && config.moduleJitter !== 0)
    params.set('jitter', config.moduleJitter.toString());
  if (config.colorCycle) params.set('colorCycle', '1');
  if (config.seed !== undefined && config.seed !== 0) params.set('seed', config.seed.toString());
  if (config.easing && config.easing !== 'linear') params.set('easing', config.easing);
}

function buildAnimationPatternParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  buildAnimPatternPrimaryParams(config, params);
  buildAnimPatternSecondaryParams(config, params);
}

function buildAnimationFrameParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.startFrame !== undefined && config.startFrame !== 0)
    params.set('startF', config.startFrame.toString());
  if (config.maxFrames !== undefined && config.maxFrames !== 0)
    params.set('maxF', config.maxFrames.toString());
  if (config.frameStep !== undefined && config.frameStep !== 1)
    params.set('stepF', config.frameStep.toString());
  if (config.interpolate && config.interpolate !== 'none') params.set('interp', config.interpolate);
  if (config.temporalDither && config.temporalDither !== 'off')
    params.set('tempDither', config.temporalDither);
}

function buildAnimationParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.speed !== undefined && config.speed !== 100)
    params.set('speed', config.speed.toString());
  if (config.loop === false) params.set('loop', '0');
  if (config.reverse) params.set('reverse', '1');
  if (config.bounce) params.set('bounce', '1');
  buildAnimationFrameParams(config, params);
  buildAnimationPatternParams(config, params);
}

function buildGifFormatParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.gifPaletteSize !== undefined && config.gifPaletteSize !== 256)
    params.set('gifPal', config.gifPaletteSize.toString());
  if (config.gifQuantizer && config.gifQuantizer !== 'median_cut')
    params.set('gifQuant', config.gifQuantizer);
  if (config.gifDither && config.gifDither !== 'floyd') params.set('gifDith', config.gifDither);
  if (config.gifDisposal && config.gifDisposal !== 'restore_background')
    params.set('gifDisp', config.gifDisposal);
  if (config.gifTransparentColor && config.gifTransparentColor !== '')
    params.set('gifTrans', config.gifTransparentColor.replace('#', ''));
}

function buildSvgFormatParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.svgTrueVector) params.set('svgVec', '1');
  if (config.svgShapePrecision && config.svgShapePrecision !== 'pixel')
    params.set('svgPrec', config.svgShapePrecision);
  if (config.svgEmbedRasterOverlay === false) params.set('svgEmbed', '0');
}

function buildMiscFormatParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.dpi !== undefined && config.dpi !== 72) params.set('dpi', config.dpi.toString());
  if (config.includeQuietZone === false) params.set('inclQz', '0');
  if (config.bgOverride && config.bgOverride !== '')
    params.set('bgOver', config.bgOverride.replace('#', ''));
  if (config.formatExtra && config.formatExtra !== 'none')
    params.set('fmtExtra', config.formatExtra);
}

function buildOutputFormatSpecificParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  buildGifFormatParams(config, params);
  buildSvgFormatParams(config, params);
  buildMiscFormatParams(config, params);
}

function buildOutputQualityParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.quality !== undefined && config.quality !== 0.9)
    params.set('quality', config.quality.toString());
  if (config.jpegQuality !== undefined && config.jpegQuality !== 92)
    params.set('jpegQ', config.jpegQuality.toString());
  if (config.webpQuality !== undefined && config.webpQuality !== 90)
    params.set('webpQ', config.webpQuality.toString());
  if (config.gifColors !== undefined && config.gifColors !== 256)
    params.set('gifColors', config.gifColors.toString());
}

function buildOutputParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.width && config.width !== 400) params.set('w', config.width.toString());
  if (config.height && config.height !== 400) params.set('h', config.height.toString());
  if (config.format && config.format !== 'gif') params.set('format', config.format);
  buildOutputQualityParams(config, params);
  if (config.filename && config.filename !== 'anqr-qrcode') params.set('fname', config.filename);
  buildOutputFormatSpecificParams(config, params);
}

function buildSafetyLockParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.lockFinders === false) params.set('lockF', '0');
  if (config.lockTiming === false) params.set('lockT', '0');
  if (config.lockAlign === false) params.set('lockA', '0');
  if (config.lockFormat === false) params.set('lockFmt', '0');
  if (config.lockVersion === false) params.set('lockV', '0');
}

function buildSafetyIntensityParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.maxOverlayIntensityL !== undefined && config.maxOverlayIntensityL !== 100)
    params.set('maxIntL', config.maxOverlayIntensityL.toString());
  if (config.maxOverlayIntensityM !== undefined && config.maxOverlayIntensityM !== 100)
    params.set('maxIntM', config.maxOverlayIntensityM.toString());
  if (config.maxOverlayIntensityQ !== undefined && config.maxOverlayIntensityQ !== 100)
    params.set('maxIntQ', config.maxOverlayIntensityQ.toString());
  if (config.maxOverlayIntensityH !== undefined && config.maxOverlayIntensityH !== 100)
    params.set('maxIntH', config.maxOverlayIntensityH.toString());
}

function buildSafetyParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.safetyMode && config.safetyMode !== 'off') params.set('safeMode', config.safetyMode);
  if (config.safetyMinModulePx !== undefined && config.safetyMinModulePx !== 2)
    params.set('safeMinPx', config.safetyMinModulePx.toString());
  if (config.safetyMinQuietZone !== undefined && config.safetyMinQuietZone !== 4)
    params.set('safeMinQz', config.safetyMinQuietZone.toString());
  buildSafetyLockParams(config, params);
  buildSafetyIntensityParams(config, params);
}

function buildQAAutoTuneParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.qaContrastCheck) params.set('qaContrast', '1');
  if (config.qaSimulateBlur && config.qaSimulateBlur !== 0)
    params.set('qaBlur', config.qaSimulateBlur.toString());
  if (config.qaSimulateNoise && config.qaSimulateNoise !== 0)
    params.set('qaNoise', config.qaSimulateNoise.toString());
  if (config.qaSimulateRotation && config.qaSimulateRotation !== 0)
    params.set('qaRot', config.qaSimulateRotation.toString());
  if (config.qaShowHeatmap) params.set('qaHeatmap', '1');
  if (config.autoPickVersion === false) params.set('autoVer', '0');
  if (config.autoPickEcc) params.set('autoEcc', '1');
  if (config.autoReduceIntensity) params.set('autoReduce', '1');
}

function buildWatermarkParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.watermarkEnabled) params.set('wmEn', '1');
  if (config.watermarkKind && config.watermarkKind !== 'text')
    params.set('wmKind', config.watermarkKind);
  if (config.watermarkText) params.set('wmText', config.watermarkText);
  if (config.watermarkPosition && config.watermarkPosition !== 'center')
    params.set('wmPos', config.watermarkPosition);
  if (config.watermarkOpacity !== undefined && config.watermarkOpacity !== 50)
    params.set('wmOpacity', config.watermarkOpacity.toString());
  if (config.watermarkBlend && config.watermarkBlend !== 'normal')
    params.set('wmBlend', config.watermarkBlend);
  if (config.watermarkImageUrl) params.set('wmImg', config.watermarkImageUrl);
}

function buildServerAnimPatternAxisParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.animationPattern && config.animationPattern !== 'none')
    params.set('animPattern', config.animationPattern);
  if (config.animationTarget && config.animationTarget !== 'result')
    params.set('animTarget', config.animationTarget);
  if (config.animationWaveAxis && config.animationWaveAxis !== 'y')
    params.set('animWaveAxis', config.animationWaveAxis);
  if (config.animationPattern2 && config.animationPattern2 !== 'none')
    params.set('animPattern2', config.animationPattern2);
  if (config.animationTarget2 && config.animationTarget2 !== 'result')
    params.set('animTarget2', config.animationTarget2);
  if (config.animationWaveAxis2 && config.animationWaveAxis2 !== 'x')
    params.set('animWaveAxis2', config.animationWaveAxis2);
}

function buildServerAnimationParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  buildServerAnimPatternAxisParams(config, params);
  if (config.animationFrames !== undefined && config.animationFrames !== 24)
    params.set('animFrames', config.animationFrames.toString());
  if (config.animationSpeed !== undefined && config.animationSpeed !== 100)
    params.set('animSpeed', config.animationSpeed.toString());
  if (config.animationSeed !== undefined && config.animationSeed !== 0)
    params.set('animSeed', config.animationSeed.toString());
}

function buildMetadataPaletteParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.metaTitle) params.set('metaTitle', config.metaTitle);
  if (config.metaAuthor) params.set('metaAuthor', config.metaAuthor);
  if (config.metaCopyright) params.set('metaCopy', config.metaCopyright);
  if (config.metaLicense) params.set('metaLic', config.metaLicense);
  if (config.metaDescription) params.set('metaDesc', config.metaDescription);
  if (config.metaCreationTime) params.set('metaTime', '1');
  if (config.metaCustomKv) params.set('metaKv', config.metaCustomKv);
  if (config.palette) params.set('palette', config.palette);
  if (config.paletteMode && config.paletteMode !== 'position')
    params.set('paletteMode', config.paletteMode);
}

/**
 * Build URL parameters from a config object
 */
export function buildUrlParams(config: Partial<ShareConfig>): string {
  const params = new URLSearchParams();

  if (config.data) params.set('data', config.data);
  if (config.lang && config.lang !== 'en') params.set('lang', config.lang);

  buildQRSettingsParams(config, params);
  buildColorParams(config, params);
  buildStyleParams(config, params);
  buildRenderParams(config, params);
  buildOverlayParams(config, params);
  buildPreprocessingParams(config, params);
  buildDitheringParams(config, params);
  buildSubpixelHalftoneParams(config, params);
  buildAnimationParams(config, params);
  buildOutputParams(config, params);
  buildSafetyParams(config, params);
  buildQAAutoTuneParams(config, params);
  buildWatermarkParams(config, params);
  buildServerAnimationParams(config, params);
  buildMetadataPaletteParams(config, params);

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
