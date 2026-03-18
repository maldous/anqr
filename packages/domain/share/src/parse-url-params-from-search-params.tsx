import type { AnimationTarget } from "./animation-target.types";
import type { AnimationWaveAxis } from "./animation-wave-axis.types";
import { type ShareConfig } from "@/modules/share-links/types";
import { parseBlendMode } from "./parse-blend-mode";
import { parseFloatParam } from "./parse-float-param";
import { parseGradientStopsParam } from "./parse-gradient-stops-param";
import { parseIntParam } from "./parse-int-param";
import { parseMaskParam } from "./parse-mask-param";
import { prefixHash } from "./prefix-hash";

/**
 * Server-safe URL parameter parsing
 * Takes a URLSearchParams object and returns a ShareConfig
 * This can be used in both browser and Node.js environments
 */
export function parseUrlParamsFromSearchParams(params: URLSearchParams): Partial<ShareConfig> {
  return {
    data: params.get("data") || undefined,
    lang: params.get("lang") || undefined,
    // QR settings
    ec: params.get("ec") || undefined,
    version: parseIntParam(params.get("v")),
    size: parseIntParam(params.get("size")),
    margin: parseIntParam(params.get("margin")),
    encodingMode: params.get("enc") || undefined,
    maskPattern: parseMaskParam(params),
    characterEncoding: params.get("charset") || undefined,
    borderModulesExtra: parseIntParam(params.get("border")),
    quietZoneMinEnforce: params.has("qzEnforce") ? params.get("qzEnforce") === "1" : undefined,
    // Colors
    fg: prefixHash(params.get("fg")),
    bg: prefixHash(params.get("bg")),
    transparent: params.get("transparent") === "1",
    // Styles
    style: params.get("style") || undefined,
    finder: params.get("finder") || undefined,
    alignmentStyle: params.get("align") || undefined,
    timingStyle: params.get("timing") || undefined,
    // Render settings
    moduleGap: parseIntParam(params.get("gap")),
    gapMode: params.get("gapMode") || undefined,
    cornerRadius: parseIntParam(params.get("radius")),
    gradientType: params.get("grad") || undefined,
    // Gradient stops/angle - parse from URL
    gradientStops: parseGradientStopsParam(params.get("gradStops")),
    ...(params.get("gradAngle") ? { gradientAngle: parseIntParam(params.get("gradAngle")) } : {}),
    eyeOuterStyle: params.get("eyeOuter") || undefined,
    eyeInnerStyle: params.get("eyeInner") || undefined,
    eyeScale: parseIntParam(params.get("eyeScale")),
    frameStyle: params.get("frame") || undefined,
    frameText: params.get("frameText") || undefined,
    dotRotation: parseIntParam(params.get("dotRot")),
    crispEdges: params.get("crisp") === "1",
    pixelSnap: params.get("snap") || undefined,
    perModuleColorMode: params.get("modColor") || undefined,
    contrastGuard: params.get("cGuard") === "1",
    minContrastRatio: parseFloatParam(params.get("minContrast")),
    // Overlay
    mode: params.get("mode") || undefined,
    intensity: parseIntParam(params.get("intensity")),
    logoSize: parseIntParam(params.get("logoSize")),
    overlayUrl: params.get("img") || undefined,
    overlayType: params.get("ovType") || undefined,
    overlayFramePick: params.get("ovFramePick") || undefined,
    cropEnabled: params.get("cropEn") === "1",
    cropX: parseFloatParam(params.get("cropX")),
    cropY: parseFloatParam(params.get("cropY")),
    cropSize: parseFloatParam(params.get("cropSize")),
    gifUseFrameDelays: params.has("gifDelays") ? params.get("gifDelays") === "1" : undefined,
    gifMaxFps: parseIntParam(params.get("gifMaxFps")),
    gifDisposalHandling: params.get("gifDispH") || undefined,
    fit: params.get("fit") || undefined,
    rotate: parseIntParam(params.get("rot")),
    flipX: params.get("flipX") === "1",
    flipY: params.get("flipY") === "1",
    preserveFinders: params.get("keepFinders") !== "0",
    preserveTiming: params.get("keepTiming") === "1",
    preserveAlignment: params.get("keepAlign") === "1",
    protectFormatInfo: params.get("protectFmt") === "1",
    protectVersionInfo: params.get("protectVer") === "1",
    eccAwareEnabled: params.get("eccAware") === "1",
    eccAwareRiskBudget: parseIntParam(params.get("eccRisk")),
    eccAwareWeightMap: params.get("eccMap") || undefined,
    // Overlay preprocessing
    colorMode: params.get("colorMode") || undefined,
    brightness: parseIntParam(params.get("brightness")),
    contrast: parseIntParam(params.get("contrast")),
    gamma: parseFloatParam(params.get("gamma")),
    saturation: parseIntParam(params.get("saturation")),
    blur: parseIntParam(params.get("blur")),
    sharpen: parseIntParam(params.get("sharpen")),
    posterize: parseIntParam(params.get("posterize")),
    threshold: parseIntParam(params.get("threshold")),
    edge: params.get("edge") || undefined,
    invert: params.get("invert") === "1",
    hue: parseIntParam(params.get("hue")),
    // Subpixel rendering
    subpixelMode: params.get("subpixel") === "1",
    subpixelGrid: parseIntParam(params.get("spGridNum")),
    // Dithering
    ditherKind: params.get("ditherKind") || undefined,
    diffusionKernel: params.get("diffusionKernel") || undefined,
    ditherStrength: parseIntParam(params.get("ditherStrength")),
    finderDitherStrength: parseIntParam(params.get("finderDither")),
    blendPreservations: params.get("blendPres") === "1",
    blendPreservationMode: parseBlendMode(params),
    ditherSerpentine: params.get("serpentine") === "1",
    orderedMatrix: params.get("matrix") || undefined,
    blueNoiseTileSize: parseIntParam(params.get("bnTile")),
    blueNoiseSeed: parseIntParam(params.get("bnSeed")),
    colorDither: params.get("colorDither") || undefined,
    // Subpixel
    subpixelGridSize: params.get("spGrid") || undefined,
    subpixelCenterRule: params.get("spCenter") || undefined,
    subpixelNeutralColor: prefixHash(params.get("spNeutral")),
    subpixelFinderOverride: params.get("spFinder") || undefined,
    // Halftone
    halftoneCell: params.get("htCell") || undefined,
    halftoneDotShape: params.get("htDot") || undefined,
    brightnessCurve: params.get("htCurve") || undefined,
    duotoneColor1: prefixHash(params.get("duo1")),
    duotoneColor2: prefixHash(params.get("duo2")),
    // Animation
    speed: parseIntParam(params.get("speed")),
    loop: params.has("loop") ? params.get("loop") !== "0" : undefined,
    reverse: params.get("reverse") === "1",
    bounce: params.get("bounce") === "1",
    startFrame: parseIntParam(params.get("startF")),
    maxFrames: parseIntParam(params.get("maxF")),
    frameStep: parseIntParam(params.get("stepF")),
    interpolate: params.get("interp") || undefined,
    temporalDither: params.get("tempDither") || undefined,
    pattern: params.get("animPattern") || undefined,
    target: (params.get("animTarget") as AnimationTarget | null) || undefined,
    waveAxis: (params.get("animWaveAxis") as AnimationWaveAxis | null) || undefined,
    pattern2: params.get("animPattern2") || undefined,
    target2: (params.get("animTarget2") as AnimationTarget | null) || undefined,
    waveAxis2: (params.get("animWaveAxis2") as AnimationWaveAxis | null) || undefined,
    moduleJitter: parseFloatParam(params.get("jitter")),
    colorCycle: params.get("colorCycle") === "1",
    seed: parseIntParam(params.get("seed")),
    easing: params.get("easing") || undefined,
    // Output
    width: parseIntParam(params.get("w")),
    height: parseIntParam(params.get("h")),
    format: params.get("format") || undefined,
    quality: parseFloatParam(params.get("quality")),
    jpegQuality: parseIntParam(params.get("jpegQ")),
    webpQuality: parseIntParam(params.get("webpQ")),
    gifColors: parseIntParam(params.get("gifColors")),
    filename: params.get("fname") || undefined,
    gifPaletteSize: parseIntParam(params.get("gifPal")),
    gifQuantizer: params.get("gifQuant") || undefined,
    gifDither: params.get("gifDith") || undefined,
    gifDisposal: params.get("gifDisp") || undefined,
    gifTransparentColor: prefixHash(params.get("gifTrans")),
    svgTrueVector: params.get("svgVec") === "1",
    svgShapePrecision: params.get("svgPrec") || undefined,
    svgEmbedRasterOverlay: params.has("svgEmbed") ? params.get("svgEmbed") === "1" : undefined,
    dpi: parseIntParam(params.get("dpi")),
    includeQuietZone: params.has("inclQz") ? params.get("inclQz") === "1" : undefined,
    bgOverride: prefixHash(params.get("bgOver")),
    formatExtra: params.get("fmtExtra") || undefined,
    // Safety
    safetyMode: params.get("safeMode") || undefined,
    safetyMinModulePx: parseIntParam(params.get("safeMinPx")),
    safetyMinQuietZone: parseIntParam(params.get("safeMinQz")),
    lockFinders: params.has("lockF") ? params.get("lockF") === "1" : undefined,
    lockTiming: params.has("lockT") ? params.get("lockT") === "1" : undefined,
    lockAlign: params.has("lockA") ? params.get("lockA") === "1" : undefined,
    lockFormat: params.has("lockFmt") ? params.get("lockFmt") === "1" : undefined,
    lockVersion: params.has("lockV") ? params.get("lockV") === "1" : undefined,

    // QA
    qaContrastCheck: params.get("qaContrast") === "1",
    qaSimulateBlur: parseFloatParam(params.get("qaBlur")),
    qaSimulateNoise: parseIntParam(params.get("qaNoise")),
    qaSimulateRotation: parseIntParam(params.get("qaRot")),
    qaShowHeatmap: params.get("qaHeatmap") === "1",

    // Auto-tuning
    autoPickVersion: params.has("autoVer") ? params.get("autoVer") === "1" : undefined,
    autoPickEcc: params.get("autoEcc") === "1",
    autoReduceIntensity: params.get("autoReduce") === "1",

    // Watermark
    watermarkEnabled: params.get("wmEn") === "1",
    watermarkKind: params.get("wmKind") || undefined,
    watermarkText: params.get("wmText") || undefined,
    watermarkPosition: params.get("wmPos") || undefined,
    watermarkOpacity: parseIntParam(params.get("wmOpacity")),
    watermarkBlend: params.get("wmBlend") || undefined,
    watermarkImageUrl: params.get("wmImg") || undefined,

    // Animation
    animationPattern: params.get("animPattern") || undefined,
    animationTarget: (params.get("animTarget") as AnimationTarget | null) || undefined,
    animationWaveAxis: (params.get("animWaveAxis") as AnimationWaveAxis | null) || undefined,
    animationPattern2: params.get("animPattern2") || undefined,
    animationTarget2: (params.get("animTarget2") as AnimationTarget | null) || undefined,
    animationWaveAxis2: (params.get("animWaveAxis2") as AnimationWaveAxis | null) || undefined,
    animationFrames: parseIntParam(params.get("animFrames")),
    animationSpeed: parseIntParam(params.get("animSpeed")),
    animationSeed: parseIntParam(params.get("animSeed")),

    // Metadata
    metaTitle: params.get("metaTitle") || undefined,
    metaAuthor: params.get("metaAuthor") || undefined,
    metaCopyright: params.get("metaCopy") || undefined,
    metaLicense: params.get("metaLic") || undefined,
    metaDescription: params.get("metaDesc") || undefined,
    metaCreationTime: params.get("metaTime") === "1",
    metaCustomKv: params.get("metaKv") || undefined,

    // Render palette
    palette: params.get("palette") || undefined,
    paletteMode: params.get("paletteMode") || undefined,

    // Safety per-ECC limits
    maxOverlayIntensityL: parseIntParam(
      params.get("maxIntL") || params.get("maxOverlayIntensityL"),
    ),
    maxOverlayIntensityM: parseIntParam(
      params.get("maxIntM") || params.get("maxOverlayIntensityM"),
    ),
    maxOverlayIntensityQ: parseIntParam(
      params.get("maxIntQ") || params.get("maxOverlayIntensityQ"),
    ),
    maxOverlayIntensityH: parseIntParam(
      params.get("maxIntH") || params.get("maxOverlayIntensityH"),
    ),

    // Module pixel size (for server-side generation)
    modulePx: parseIntParam(params.get("modulePx")),
  };
}
