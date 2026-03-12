/**
 * Share Links Module - URL Parameters
 * Handles URL parameter encoding/decoding for QR code sharing
 *
 * This module provides:
 * - Server-safe URL parameter parsing (works in Node.js and browser)
 * - URL parameter serialization for sharing
 * - Browser URL updates
 */

import { createLogger } from '../../infra/logging/logger';
import { MAX_SHARE_URL_LENGTH, type ShareConfig } from './types';

export const _log = createLogger('SHARE');

// Helper functions to reduce code duplication
export function parseIntParam(value: string | null): number | undefined {
  return value ? Number.parseInt(value, 10) : undefined;
}

export function parseFloatParam(value: string | null): number | undefined {
  return value ? Number.parseFloat(value) : undefined;
}

export function prefixHash(value: string | null): string | undefined {
  return value ? `#${value}` : undefined;
}

export function parseMaskParam(params: URLSearchParams): number | 'auto' | undefined {
  if (!params.has('mask')) return undefined;
  return params.get('mask') === 'auto' ? 'auto' : parseIntParam(params.get('mask'));
}

export function parseGradientStopsParam(
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

export function parseBlendMode(params: URLSearchParams): 'overlay' | 'dither' | undefined {
  const mode = params.get('blendPresMode');
  if (mode === 'dither' || mode === 'overlay') return mode;
  return undefined;
}

export function buildQREncodingParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.encodingMode && config.encodingMode !== 'auto') params.set('enc', config.encodingMode);
  if (config.maskPattern !== undefined && config.maskPattern !== 'auto')
    params.set('mask', String(config.maskPattern));
  if (config.characterEncoding && config.characterEncoding !== 'default')
    params.set('charset', config.characterEncoding);
  if (config.borderModulesExtra && config.borderModulesExtra !== 0)
    params.set('border', config.borderModulesExtra.toString());
  if (config.quietZoneMinEnforce === false) params.set('qzEnforce', '0');
}

export function buildQRSettingsParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.ec && config.ec !== 'H') params.set('ec', config.ec);
  if (config.version && config.version !== 0) params.set('v', config.version.toString());
  if (config.size && config.size !== 20) params.set('size', config.size.toString());
  if (config.margin !== undefined && config.margin !== 4)
    params.set('margin', config.margin.toString());
  buildQREncodingParams(config, params);
}

export function buildColorParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.fg && config.fg !== '#000000') params.set('fg', config.fg.replace('#', ''));
  if (config.bg && config.bg !== '#ffffff') params.set('bg', config.bg.replace('#', ''));
  if (config.transparent) params.set('transparent', '1');
}

export function buildStyleParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.style && config.style !== 'square') params.set('style', config.style);
  if (config.finder && config.finder !== 'square') params.set('finder', config.finder);
  if (config.alignmentStyle && config.alignmentStyle !== 'match_finder')
    params.set('align', config.alignmentStyle);
  if (config.timingStyle && config.timingStyle !== 'match_module')
    params.set('timing', config.timingStyle);
}

export function buildRenderGradientParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildRenderEyeFrameParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.eyeOuterStyle && config.eyeOuterStyle !== 'square')
    params.set('eyeOuter', config.eyeOuterStyle);
  if (config.eyeInnerStyle && config.eyeInnerStyle !== 'square')
    params.set('eyeInner', config.eyeInnerStyle);
  if (config.eyeScale !== undefined && config.eyeScale !== 100)
    params.set('eyeScale', config.eyeScale.toString());
  if (config.frameStyle && config.frameStyle !== 'none') params.set('frame', config.frameStyle);
  if (config.frameText) params.set('frameText', config.frameText);
}

export function buildRenderAdvancedParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildRenderParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.moduleGap !== undefined && config.moduleGap !== 0)
    params.set('gap', config.moduleGap.toString());
  if (config.gapMode && config.gapMode !== 'none') params.set('gapMode', config.gapMode);
  if (config.cornerRadius !== undefined && config.cornerRadius !== 0)
    params.set('radius', config.cornerRadius.toString());
  buildRenderGradientParams(config, params);
  buildRenderEyeFrameParams(config, params);
  buildRenderAdvancedParams(config, params);
}

export function buildOverlayImageSourceParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.overlayUrl) params.set('img', config.overlayUrl);
  if (config.overlayType && config.overlayType !== 'static')
    params.set('ovType', config.overlayType);
  if (config.overlayFramePick && config.overlayFramePick !== 'all')
    params.set('ovFramePick', config.overlayFramePick);
}

export function buildOverlayCropParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.cropEnabled) params.set('cropEn', '1');
  if (config.cropX !== undefined && config.cropX !== 0.5)
    params.set('cropX', config.cropX.toString());
  if (config.cropY !== undefined && config.cropY !== 0.5)
    params.set('cropY', config.cropY.toString());
  if (config.cropSize !== undefined && config.cropSize !== 1)
    params.set('cropSize', config.cropSize.toString());
}

export function buildOverlayGifParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.gifUseFrameDelays === false) params.set('gifDelays', '0');
  if (config.gifMaxFps !== undefined && config.gifMaxFps !== 30)
    params.set('gifMaxFps', config.gifMaxFps.toString());
  if (config.gifDisposalHandling && config.gifDisposalHandling !== 'respect')
    params.set('gifDispH', config.gifDisposalHandling);
}

export function buildOverlayImageParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  buildOverlayImageSourceParams(config, params);
  buildOverlayCropParams(config, params);
  buildOverlayGifParams(config, params);
}

export function buildOverlayTransformParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.fit && config.fit !== 'cover') params.set('fit', config.fit);
  if (config.rotate !== undefined && config.rotate !== 0)
    params.set('rot', config.rotate.toString());
  if (config.flipX) params.set('flipX', '1');
  if (config.flipY) params.set('flipY', '1');
}

export function buildOverlayProtectionParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildOverlayParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildPreprocessingColorParams(
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

export function buildPreprocessingFilterParams(
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

export function buildPreprocessingParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  buildPreprocessingColorParams(config, params);
  buildPreprocessingFilterParams(config, params);
}

export function buildDitherBlendParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.blendPreservations) params.set('blendPres', '1');
  if (
    config.blendPreservations &&
    config.blendPreservationMode &&
    config.blendPreservationMode !== 'overlay'
  ) {
    params.set('blendPresMode', config.blendPreservationMode);
  }
}

export function buildDitherNoiseParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.orderedMatrix && config.orderedMatrix !== 'bayer4')
    params.set('matrix', config.orderedMatrix);
  if (config.blueNoiseTileSize !== undefined && config.blueNoiseTileSize !== 64)
    params.set('bnTile', config.blueNoiseTileSize.toString());
  if (config.blueNoiseSeed !== undefined && config.blueNoiseSeed !== 0)
    params.set('bnSeed', config.blueNoiseSeed.toString());
  if (config.colorDither && config.colorDither !== 'none')
    params.set('colorDither', config.colorDither);
}

export function buildDitheringParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildHalftoneSpecificParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildSubpixelHalftoneParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildAnimPatternPrimaryParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  if (config.pattern && config.pattern !== 'none') params.set('animPattern', config.pattern);
  if (config.target && config.target !== 'result') params.set('animTarget', config.target);
  if (config.waveAxis && config.waveAxis !== 'y') params.set('animWaveAxis', config.waveAxis);
}

export function buildAnimPatternSecondaryParams(
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

export function buildAnimationPatternParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  buildAnimPatternPrimaryParams(config, params);
  buildAnimPatternSecondaryParams(config, params);
}

export function buildAnimationFrameParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildAnimationParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.speed !== undefined && config.speed !== 100)
    params.set('speed', config.speed.toString());
  if (config.loop === false) params.set('loop', '0');
  if (config.reverse) params.set('reverse', '1');
  if (config.bounce) params.set('bounce', '1');
  buildAnimationFrameParams(config, params);
  buildAnimationPatternParams(config, params);
}

export function buildGifFormatParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildSvgFormatParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.svgTrueVector) params.set('svgVec', '1');
  if (config.svgShapePrecision && config.svgShapePrecision !== 'pixel')
    params.set('svgPrec', config.svgShapePrecision);
  if (config.svgEmbedRasterOverlay === false) params.set('svgEmbed', '0');
}

export function buildMiscFormatParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.dpi !== undefined && config.dpi !== 72) params.set('dpi', config.dpi.toString());
  if (config.includeQuietZone === false) params.set('inclQz', '0');
  if (config.bgOverride && config.bgOverride !== '')
    params.set('bgOver', config.bgOverride.replace('#', ''));
  if (config.formatExtra && config.formatExtra !== 'none')
    params.set('fmtExtra', config.formatExtra);
}

export function buildOutputFormatSpecificParams(
  config: Partial<ShareConfig>,
  params: URLSearchParams
): void {
  buildGifFormatParams(config, params);
  buildSvgFormatParams(config, params);
  buildMiscFormatParams(config, params);
}

export function buildOutputQualityParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.quality !== undefined && config.quality !== 0.9)
    params.set('quality', config.quality.toString());
  if (config.jpegQuality !== undefined && config.jpegQuality !== 92)
    params.set('jpegQ', config.jpegQuality.toString());
  if (config.webpQuality !== undefined && config.webpQuality !== 90)
    params.set('webpQ', config.webpQuality.toString());
  if (config.gifColors !== undefined && config.gifColors !== 256)
    params.set('gifColors', config.gifColors.toString());
}

export function buildOutputParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.width && config.width !== 400) params.set('w', config.width.toString());
  if (config.height && config.height !== 400) params.set('h', config.height.toString());
  if (config.format && config.format !== 'gif') params.set('format', config.format);
  buildOutputQualityParams(config, params);
  if (config.filename && config.filename !== 'anqr-qrcode') params.set('fname', config.filename);
  buildOutputFormatSpecificParams(config, params);
}

export function buildSafetyLockParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.lockFinders === false) params.set('lockF', '0');
  if (config.lockTiming === false) params.set('lockT', '0');
  if (config.lockAlign === false) params.set('lockA', '0');
  if (config.lockFormat === false) params.set('lockFmt', '0');
  if (config.lockVersion === false) params.set('lockV', '0');
}

export function buildSafetyIntensityParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.maxOverlayIntensityL !== undefined && config.maxOverlayIntensityL !== 100)
    params.set('maxIntL', config.maxOverlayIntensityL.toString());
  if (config.maxOverlayIntensityM !== undefined && config.maxOverlayIntensityM !== 100)
    params.set('maxIntM', config.maxOverlayIntensityM.toString());
  if (config.maxOverlayIntensityQ !== undefined && config.maxOverlayIntensityQ !== 100)
    params.set('maxIntQ', config.maxOverlayIntensityQ.toString());
  if (config.maxOverlayIntensityH !== undefined && config.maxOverlayIntensityH !== 100)
    params.set('maxIntH', config.maxOverlayIntensityH.toString());
}

export function buildSafetyParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  if (config.safetyMode && config.safetyMode !== 'off') params.set('safeMode', config.safetyMode);
  if (config.safetyMinModulePx !== undefined && config.safetyMinModulePx !== 2)
    params.set('safeMinPx', config.safetyMinModulePx.toString());
  if (config.safetyMinQuietZone !== undefined && config.safetyMinQuietZone !== 4)
    params.set('safeMinQz', config.safetyMinQuietZone.toString());
  buildSafetyLockParams(config, params);
  buildSafetyIntensityParams(config, params);
}

export function buildQAAutoTuneParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildWatermarkParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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

export function buildServerAnimPatternAxisParams(
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

export function buildServerAnimationParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
  buildServerAnimPatternAxisParams(config, params);
  if (config.animationFrames !== undefined && config.animationFrames !== 24)
    params.set('animFrames', config.animationFrames.toString());
  if (config.animationSpeed !== undefined && config.animationSpeed !== 100)
    params.set('animSpeed', config.animationSpeed.toString());
  if (config.animationSeed !== undefined && config.animationSeed !== 0)
    params.set('animSeed', config.animationSeed.toString());
}

export function buildMetadataPaletteParams(config: Partial<ShareConfig>, params: URLSearchParams): void {
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
