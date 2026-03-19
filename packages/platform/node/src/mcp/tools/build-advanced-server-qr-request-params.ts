import type { QrGenerateAdvancedInput } from "@/contracts/mcp";
import { buildBasicServerQRRequestParams, type ServerQRRequestParams } from "@/application/generator/server";
import { normalizeHexColor } from "./normalize-hex-color";

export function buildAdvancedServerQRRequestParams(
  input: QrGenerateAdvancedInput,
): ServerQRRequestParams {
  const params = buildBasicServerQRRequestParams(input);

  params.outputWidth = input.width ?? input.size ?? params.outputWidth;
  params.outputHeight = input.height ?? input.size ?? params.outputHeight;
  params.size = Math.max(params.outputWidth, params.outputHeight);
  params.outputFormat = input.format ?? params.outputFormat;
  params.explicitFormat = input.format ?? params.explicitFormat;
  params.transparent = input.transparent ?? params.transparent;
  params.encodingMode = input.encodingMode ?? params.encodingMode;
  params.version = input.version ?? params.version;
  params.maskPattern = input.maskPattern ?? params.maskPattern;
  params.characterEncoding = input.characterEncoding ?? params.characterEncoding;
  params.borderModulesExtra = input.borderModulesExtra ?? params.borderModulesExtra;
  params.quietZoneMinEnforce = input.quietZoneMinEnforce ?? params.quietZoneMinEnforce;
  params.crispEdges = input.crispEdges ?? params.crispEdges;
  params.pixelSnap = input.pixelSnap ?? params.pixelSnap;
  params.perModuleColorMode = input.perModuleColorMode ?? params.perModuleColorMode;
  params.contrastGuard = input.contrastGuard ?? params.contrastGuard;
  params.minContrastRatio = input.minContrastRatio ?? params.minContrastRatio;
  params.renderSeed = input.renderSeed ?? params.renderSeed;
  params.modulePxParam = input.modulePxParam ?? params.modulePxParam;
  params.moduleStyle = input.moduleStyle ?? params.moduleStyle;
  params.finderStyle = input.finderStyle ?? params.finderStyle;
  params.eyeOuterStyle = input.eyeOuterStyle ?? params.eyeOuterStyle;
  params.eyeInnerStyle = input.eyeInnerStyle ?? params.eyeInnerStyle;
  params.eyeScale = input.eyeScale ?? params.eyeScale;
  params.cornerRadius = input.cornerRadius ?? params.cornerRadius;
  params.moduleGap = input.moduleGap ?? params.moduleGap;
  params.gapMode = input.gapMode ?? params.gapMode;
  params.dotRotationDeg = input.dotRotationDeg ?? params.dotRotationDeg;
  params.frameStyle = input.frameStyle ?? params.frameStyle;
  params.frameText = input.frameText ?? params.frameText;
  params.gradientType = input.gradientType ?? params.gradientType;
  params.gradientAngle = input.gradientAngle ?? params.gradientAngle;
  params.gradientStops =
    input.gradientStops?.map((stop) => ({
      pos: stop.pos,
      color: normalizeHexColor(stop.color),
    })) ?? params.gradientStops;
  params.alignmentStyle = input.alignmentStyle ?? params.alignmentStyle;
  params.timingStyle = input.timingStyle ?? params.timingStyle;
  params.palette =
    input.palette?.map(normalizeHexColor) ?? params.palette;
  params.paletteMode = input.paletteMode ?? params.paletteMode;
  params.preserveFinders = input.preserveFinders ?? params.preserveFinders;
  params.preserveTiming = input.preserveTiming ?? params.preserveTiming;
  params.preserveAlignment = input.preserveAlignment ?? params.preserveAlignment;
  params.protectFormatInfo = input.protectFormatInfo ?? params.protectFormatInfo;
  params.protectVersionInfo = input.protectVersionInfo ?? params.protectVersionInfo;
  params.eccAwareEnabled = input.eccAwareEnabled ?? params.eccAwareEnabled;
  params.eccAwareRiskBudget = input.eccAwareRiskBudget ?? params.eccAwareRiskBudget;
  params.eccAwareWeightMap = input.eccAwareWeightMap ?? params.eccAwareWeightMap;

  params.overlayUrl = input.overlayUrl ?? params.overlayUrl;
  params.overlayMode = input.overlayMode ?? params.overlayMode;
  params.overlayIntensity = input.overlayIntensity ?? params.overlayIntensity;
  params.colorMode = input.colorMode ?? params.colorMode;
  params.logoSize = input.logoSize ?? params.logoSize;
  params.overlayBrightness = input.overlayBrightness ?? params.overlayBrightness;
  params.overlayContrast = input.overlayContrast ?? params.overlayContrast;
  params.overlayGamma = input.overlayGamma ?? params.overlayGamma;
  params.overlaySaturation = input.overlaySaturation ?? params.overlaySaturation;
  params.overlayHueRotate = input.overlayHueRotate ?? params.overlayHueRotate;
  params.overlayInvert = input.overlayInvert ?? params.overlayInvert;
  params.overlayBlur = input.overlayBlur ?? params.overlayBlur;
  params.overlaySharpen = input.overlaySharpen ?? params.overlaySharpen;
  params.overlayPosterize = input.overlayPosterize ?? params.overlayPosterize;
  params.overlayThreshold = input.overlayThreshold ?? params.overlayThreshold;
  params.overlayEdgeDetect = input.overlayEdgeDetect ?? params.overlayEdgeDetect;
  params.overlayFit = input.overlayFit ?? params.overlayFit;
  params.overlayRotate = input.overlayRotate ?? params.overlayRotate;
  params.overlayFlipX = input.overlayFlipX ?? params.overlayFlipX;
  params.overlayFlipY = input.overlayFlipY ?? params.overlayFlipY;
  params.ditherKind = input.ditherKind ?? params.ditherKind;
  params.diffusionKernel = input.diffusionKernel ?? params.diffusionKernel;
  params.ditherStrength = input.ditherStrength ?? params.ditherStrength;
  params.finderDitherStrength = input.finderDitherStrength ?? params.finderDitherStrength;
  params.blendPreservations = input.blendPreservations ?? params.blendPreservations;
  params.blendPreservationMode = input.blendPreservationMode ?? params.blendPreservationMode;
  params.ditherSerpentine = input.ditherSerpentine ?? params.ditherSerpentine;
  params.orderedMatrix = input.orderedMatrix ?? params.orderedMatrix;
  params.blueNoiseTileSize = input.blueNoiseTileSize ?? params.blueNoiseTileSize;
  params.blueNoiseSeed = input.blueNoiseSeed ?? params.blueNoiseSeed;
  params.colorDither = input.colorDither ?? params.colorDither;
  params.subpixelGridSize = input.subpixelGridSize ?? params.subpixelGridSize;
  params.subpixelGridNum = input.subpixelGridNum ?? params.subpixelGridNum;
  params.subpixelCenterRule = input.subpixelCenterRule ?? params.subpixelCenterRule;
  params.subpixelNeutralColor =
    input.subpixelNeutralColor
      ? normalizeHexColor(input.subpixelNeutralColor)
      : params.subpixelNeutralColor;
  params.subpixelFinderOverride = input.subpixelFinderOverride ?? params.subpixelFinderOverride;
  params.halftoneCell = input.halftoneCell ?? params.halftoneCell;
  params.halftoneDotShape = input.halftoneDotShape ?? params.halftoneDotShape;
  params.brightnessCurve = input.brightnessCurve ?? params.brightnessCurve;
  params.duotoneColor1 = input.duotoneColor1 ?? params.duotoneColor1;
  params.duotoneColor2 = input.duotoneColor2 ?? params.duotoneColor2;
  params.maxOverlayIntensityL = input.maxOverlayIntensityL ?? params.maxOverlayIntensityL;
  params.maxOverlayIntensityM = input.maxOverlayIntensityM ?? params.maxOverlayIntensityM;
  params.maxOverlayIntensityQ = input.maxOverlayIntensityQ ?? params.maxOverlayIntensityQ;
  params.maxOverlayIntensityH = input.maxOverlayIntensityH ?? params.maxOverlayIntensityH;
  params.outputQuality = input.outputQuality ?? params.outputQuality;
  params.outputDpi = input.outputDpi ?? params.outputDpi;
  params.watermarkEnabled = input.watermarkEnabled ?? params.watermarkEnabled;
  params.watermarkKind = input.watermarkKind ?? params.watermarkKind;
  params.watermarkText = input.watermarkText ?? params.watermarkText;
  params.watermarkImageUrl = input.watermarkImageUrl ?? params.watermarkImageUrl;
  params.watermarkPosition = input.watermarkPosition ?? params.watermarkPosition;
  params.watermarkOpacity = input.watermarkOpacity ?? params.watermarkOpacity;
  params.watermarkBlend = input.watermarkBlend ?? params.watermarkBlend;
  params.metaTitle = input.metaTitle ?? params.metaTitle;
  params.metaAuthor = input.metaAuthor ?? params.metaAuthor;
  params.metaCopyright = input.metaCopyright ?? params.metaCopyright;
  params.metaDescription = input.metaDescription ?? params.metaDescription;
  params.metaLicense = input.metaLicense ?? params.metaLicense;
  params.metaCreationTime = input.metaCreationTime ?? params.metaCreationTime;
  params.metaCustomKv = input.metaCustomKv ?? params.metaCustomKv;
  params.cropEnabled = input.cropEnabled ?? params.cropEnabled;
  params.cropX = input.cropX ?? params.cropX;
  params.cropY = input.cropY ?? params.cropY;
  params.cropSize = input.cropSize ?? params.cropSize;
  params.overlayType = input.overlayType ?? params.overlayType;
  params.overlayFramePick = input.overlayFramePick ?? params.overlayFramePick;
  params.gifUseFrameDelays = input.gifUseFrameDelays ?? params.gifUseFrameDelays;
  params.gifDisposalHandling = input.gifDisposalHandling ?? params.gifDisposalHandling;
  params.gifMaxFps = input.gifMaxFps ?? params.gifMaxFps;
  params.lockFinders = input.lockFinders ?? params.lockFinders;
  params.lockTiming = input.lockTiming ?? params.lockTiming;
  params.lockAlign = input.lockAlign ?? params.lockAlign;
  params.lockFormat = input.lockFormat ?? params.lockFormat;
  params.lockVersion = input.lockVersion ?? params.lockVersion;
  params.safetyMode = input.safetyMode ?? params.safetyMode;
  params.safetyMinModulePx = input.safetyMinModulePx ?? params.safetyMinModulePx;
  params.safetyMinQuietZone = input.safetyMinQuietZone ?? params.safetyMinQuietZone;
  params.autoPickVersion = input.autoPickVersion ?? params.autoPickVersion;
  params.autoPickEcc = input.autoPickEcc ?? params.autoPickEcc;
  params.autoReduceIntensity = input.autoReduceIntensity ?? params.autoReduceIntensity;

  params.animationPattern = input.animationPattern ?? params.animationPattern;
  params.animationPattern2 = input.animationPattern2 ?? params.animationPattern2;
  params.animationFrames = input.animationFrames ?? params.animationFrames;
  params.animationSpeed = input.animationSpeed ?? params.animationSpeed;
  params.animationLoop = input.animationLoop ?? params.animationLoop;
  params.animationBounce = input.animationBounce ?? params.animationBounce;
  params.animationReverse = input.animationReverse ?? params.animationReverse;
  params.animationColorCycle = input.animationColorCycle ?? params.animationColorCycle;
  params.animationTarget = input.animationTarget ?? params.animationTarget;
  params.animationWaveAxis = input.animationWaveAxis ?? params.animationWaveAxis;
  params.animationBounce2 = input.animationBounce2 ?? params.animationBounce2;
  params.animationReverse2 = input.animationReverse2 ?? params.animationReverse2;
  params.animationColorCycle2 = input.animationColorCycle2 ?? params.animationColorCycle2;
  params.animationTarget2 = input.animationTarget2 ?? params.animationTarget2;
  params.animationWaveAxis2 = input.animationWaveAxis2 ?? params.animationWaveAxis2;
  params.animationInterpolate = input.animationInterpolate ?? params.animationInterpolate;
  params.animationTemporalDither = input.animationTemporalDither ?? params.animationTemporalDither;
  params.animationModuleJitter = input.animationModuleJitter ?? params.animationModuleJitter;
  params.animationSeed = input.animationSeed ?? params.animationSeed;
  params.animationSeed2 = input.animationSeed2 ?? params.animationSeed2;
  params.animationEasing = input.animationEasing ?? params.animationEasing;
  params.animationEasing2 = input.animationEasing2 ?? params.animationEasing2;
  params.animationStartFrame = input.animationStartFrame ?? params.animationStartFrame;
  params.animationMaxFrames = input.animationMaxFrames ?? params.animationMaxFrames;
  params.animationFrameStep = input.animationFrameStep ?? params.animationFrameStep;

  params.webpQuality = input.webpQuality ?? params.webpQuality;
  params.gifColors = input.gifColors ?? params.gifColors;
  if (input.bgOverride !== undefined) {
    params.bgOverride = normalizeHexColor(input.bgOverride);
  }
  params.formatExtra = input.formatExtra ?? params.formatExtra;
  params.filename = input.filename ?? params.filename;
  params.includeQuietZone = input.includeQuietZone ?? params.includeQuietZone;
  params.gifDisposalCode = input.gifDisposalCode ?? params.gifDisposalCode;
  params.svgShapePrecision = input.svgShapePrecision ?? params.svgShapePrecision;
  params.svgEmbedRasterOverlay = input.svgEmbedRasterOverlay ?? params.svgEmbedRasterOverlay;

  return params;
}
