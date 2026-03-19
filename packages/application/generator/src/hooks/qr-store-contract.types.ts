import type {
  AlignmentStyle,
  AnimationPatternType,
  AnimationTarget,
  AnimationWaveAxis,
  CharacterEncoding,
  DiffusionKernel,
  DitherKind,
  FinderStyle,
  GradientStop,
  GradientType,
  OrderedMatrix,
  OverlayMode,
  SafetyMode,
  TimingStyle,
  ColorMode,
} from "@/contracts/generator";
import type { ModuleStyleOption } from "@/domain/render";

interface CropRegion {
  x: number;
  y: number;
  size: number;
}

type FitMode = "cover" | "contain" | "stretch";

export interface QRGeneratorStoreState {
  payload: object;
  qr: {
    version: number;
    ecc: "L" | "M" | "Q" | "H";
    encodingMode: "auto" | "numeric" | "alphanumeric" | "byte" | "kanji";
    maskPattern: "auto" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    characterEncoding: CharacterEncoding;
    quietZoneModules: number;
    quietZoneMinEnforce: boolean;
    borderModulesExtra: number;
  };
  render: {
    modulePx: number;
    crispEdges: boolean;
    pixelSnap: "floor" | "round" | "ceil";
    moduleGapPercent: number;
    gapMode: "none" | "inset" | "stroke" | "negative_space";
    moduleStyle: ModuleStyleOption;
    finderStyle: FinderStyle;
    alignmentStyle: AlignmentStyle;
    timingStyle: TimingStyle;
    cornerRadius: number;
    dotRotationDeg: number;
    eyeOuterStyle: FinderStyle;
    eyeInnerStyle: FinderStyle;
    eyeScale: number;
    frameStyle: "none" | "rounded_frame" | "sticker" | "tag";
    frameText: string;
    fgColor: string;
    bgColor: string;
    bgTransparent: boolean;
    palette: string[];
    paletteMode: string;
    gradient: {
      type: GradientType;
      stops: GradientStop[];
    };
    perModuleColorMode: string;
    contrastGuard: boolean;
    minContrastRatio: number;
  };
  overlay: {
    enabled: boolean;
    file: File | null;
    url: string;
    cropEnabled: boolean;
    cropRegion: CropRegion;
    fit: FitMode;
    rotateDeg: number;
    flipX: boolean;
    flipY: boolean;
    colorMode: ColorMode;
    invert: boolean;
    brightness: number;
    contrast: number;
    gamma: number;
    saturation: number;
    hueRotateDeg: number;
    blurPx: number;
    sharpen: number;
    posterizeLevels: number;
    threshold: number;
    edgeDetect: string;
    mode: OverlayMode;
    intensity: number;
    preserveFinders: boolean;
    preserveTiming: boolean;
    preserveAlignment: boolean;
    protectFormatInfo: boolean;
    protectVersionInfo: boolean;
    subpixelGridSize: string;
    subpixelCenterRule: string;
    subpixelNeutralColor: string;
    subpixelFinderOverride: string;
    ditherKind: DitherKind;
    ditherStrength: number;
    finderDitherStrength: number;
    blendPreservations: boolean;
    blendPreservationMode: "overlay" | "dither";
    ditherSerpentine: boolean;
    diffusionKernel: DiffusionKernel;
    orderedMatrix: OrderedMatrix;
    blueNoiseTileSize: number;
    blueNoiseSeed: number;
    colorDither: "none" | "per_channel" | "perceptual";
    halftoneCell: "per_module" | "n×n";
    halftoneDotShape: string;
    duotoneColors: [string, string];
    brightnessCurve: "linear" | "s-curve" | "gamma";
    eccAwareEnabled: boolean;
    eccAwareRiskBudget: number;
    eccAwareWeightMap: string;
    gifUseFrameDelays: boolean;
    gifMaxFps: number;
    gifDisposalHandling: "respect" | "simplify";
    qrFirstMode: boolean;
    qrartIterations: number;
    qrartFragmentLength: number;
    qrartSeed: number;
  };
  watermark: {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  };
  output: {
    format: "png" | "webp" | "gif" | "svg";
    widthPx: number;
    heightPx: number;
    quality: number;
    filename: string;
    includeQuietZone: boolean;
    dpi: number;
    bgOverride: string;
    gifPaletteSize: number;
    gifQuantizer: "median_cut" | "neuquant" | "octree";
    gifDither: string;
    gifTransparentColor: string;
    gifDisposal: string;
    svgTrueVector: boolean;
    svgShapePrecision: number | string;
    svgEmbedRasterOverlay: boolean;
  };
  animation: {
    speedMs: number;
    loop: boolean;
    bounce: boolean;
    playing: boolean;
    startFrame: number;
    maxFrames: number;
    frameStep: number;
    interpolate: "none" | "crossfade" | "morph";
    temporalDither: "off" | "blue_noise" | "flicker_safe";
    seed: number;
    pattern: AnimationPatternType;
    target: AnimationTarget;
    waveAxis: AnimationWaveAxis;
    pattern2: AnimationPatternType;
    target2: AnimationTarget;
    waveAxis2: AnimationWaveAxis;
    moduleJitterPx: number;
    colorCycle: boolean;
  };
  safety: {
    mode: SafetyMode;
    minModulePx: number;
    minQuietZoneModules: number;
    lockFinders: boolean;
    lockTiming: boolean;
    lockAlign: boolean;
    lockFormat: boolean;
    lockVersion: boolean;
    maxOverlayIntensityByEcc: Record<"L" | "M" | "Q" | "H", number>;
  };
  metadata: {
    title: string;
    author: string;
    copyright: string;
    license: string;
    description: string;
    creationTime: boolean;
    customKv: Array<{ k: string; v: string }>;
  };
  auto: {
    pickVersion: boolean;
    pickEcc: boolean;
    reduceIntensityUntilSafe: boolean;
  };
  setAnimationPlaying: (playing: boolean) => void;
  setQrCharacterEncoding: (encoding: CharacterEncoding) => void;
  getPayloadText: () => string;
  setOverlayIntensity: (intensity: number) => void;
}
