import type {
  AlignmentStyle,
  AnimationPatternType,
  AnimationTarget,
  AnimationWaveAxis,
  CharacterEncoding,
  CropRegion,
  DiffusionKernel,
  DitherKind,
  ECCLevel as UrlImportEcc,
  EncodingMode as UrlImportEncodingMode,
  FinderStyle,
  FitMode as UrlImportOverlayFit,
  FrameStyle as UrlImportFrameStyle,
  GapMode as UrlImportGapMode,
  GifQuantizer as UrlImportGifQuantizer,
  GradientUpdate as UrlImportGradientUpdate,
  OrderedMatrix,
  OutputFormat as UrlImportOutputFormat,
  OverlayMode,
  PayloadKind as UrlImportPayloadKind,
  TimingStyle,
  ColorMode,
} from "@/contracts/generator";
import type { ModuleStyleOption } from "@/domain/render";
import type { UrlHelper } from "@/domain/payload/generators";
import type {
  GeneratorAutoState,
  GeneratorMetadataState,
  GeneratorSafetyState,
} from "../shared/store-sections.types";
import type { UrlImportTier } from "./url-import-tier.types";

interface UrlImportPatchableState {
  qr: {
    maskPattern: "auto" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    characterEncoding: CharacterEncoding;
    quietZoneMinEnforce: boolean;
  };
  render: {
    eyeOuterStyle: FinderStyle;
    eyeInnerStyle: FinderStyle;
    eyeScale: number;
    crispEdges: boolean;
    pixelSnap: "floor" | "round" | "ceil";
    contrastGuard: boolean;
    minContrastRatio: number;
    palette: string[];
    paletteMode: string;
    perModuleColorMode: string;
  };
  overlay: {
    protectFormatInfo: boolean;
    protectVersionInfo: boolean;
    type: "static" | "gif" | "apng" | "webp_anim" | "video";
    framePick: string;
    ditherSerpentine: boolean;
    orderedMatrix: OrderedMatrix;
    blueNoiseTileSize: number;
    blueNoiseSeed: number;
    colorDither: "none" | "per_channel" | "perceptual";
    subpixelGridSize: string;
    subpixelCenterRule: "strict" | "halftone_center";
    subpixelNeutralColor: string;
    subpixelFinderOverride: "solid" | "stylized";
    halftoneCell: "per_module" | "n×n";
    halftoneDotShape: string;
    duotoneColors: [string, string];
    brightnessCurve: "linear" | "s-curve" | "gamma";
    eccAwareEnabled: boolean;
    eccAwareRiskBudget: number;
    eccAwareWeightMap: string;
    cropEnabled: boolean;
    cropRegion: CropRegion;
    gifUseFrameDelays: boolean;
    gifMaxFps: number;
    gifDisposalHandling: "respect" | "simplify";
  };
  animation: {
    pattern: AnimationPatternType;
    target: AnimationTarget;
    waveAxis: AnimationWaveAxis;
    pattern2: AnimationPatternType;
    target2: AnimationTarget;
    waveAxis2: AnimationWaveAxis;
    colorCycle: boolean;
    seed: number;
    moduleJitterPx: number;
    interpolate: "none" | "crossfade" | "morph";
    temporalDither: "off" | "blue_noise" | "flicker_safe";
  };
  output: {
    dpi: number;
    includeQuietZone: boolean;
    bgOverride: string;
    gifDither: string;
    gifTransparentColor: string;
    gifDisposal: string;
    svgShapePrecision: string | number;
    svgEmbedRasterOverlay: boolean;
  };
  watermark: {
    enabled: boolean;
    kind: string;
    text: string;
    position: string;
    opacity: number;
    blend: string;
  };
  metadata: GeneratorMetadataState;
  safety: GeneratorSafetyState;
  qa: {
    contrastCheck: boolean;
    simulateBlurPx: number;
    simulateNoise: number;
    simulateRotationDeg: number;
    showHeatmap: boolean;
  };
  auto: GeneratorAutoState;
}

type UrlImportStateUpdater =
  | UrlImportPatchableState
  | Partial<UrlImportPatchableState>
  | ((state: UrlImportPatchableState) => UrlImportPatchableState | Partial<UrlImportPatchableState>);

export interface UrlImportStore {
  setTier: (tier: UrlImportTier) => void;
  setPayloadKind: (kind: UrlImportPayloadKind) => void;
  setPayloadText: (text: string) => void;
  setPayloadUrl: (url: Partial<UrlHelper>) => void;
  setQrEcc: (ecc: UrlImportEcc) => void;
  setQrVersion: (version: number) => void;
  setQrQuietZone: (modules: number) => void;
  setQrEncodingMode: (mode: UrlImportEncodingMode) => void;
  setRenderModulePx: (px: number) => void;
  setRenderFgColor: (color: string) => void;
  setRenderBgColor: (color: string) => void;
  setRenderBgTransparent: (transparent: boolean) => void;
  setRenderModuleStyle: (style: ModuleStyleOption) => void;
  setRenderFinderStyle: (style: FinderStyle) => void;
  setRenderAlignmentStyle: (style: AlignmentStyle) => void;
  setRenderTimingStyle: (style: TimingStyle) => void;
  setRenderModuleGap: (percent: number) => void;
  setRenderGapMode: (mode: UrlImportGapMode) => void;
  setRenderCornerRadius: (radius: number) => void;
  setRenderGradient: (gradient: UrlImportGradientUpdate) => void;
  setRenderFrameStyle: (style: UrlImportFrameStyle) => void;
  setRenderFrameText: (text: string) => void;
  setOverlayMode: (mode: OverlayMode) => void;
  setOverlayIntensity: (intensity: number) => void;
  setOverlayEnabled: (enabled: boolean) => void;
  setOverlayFile: (file: File | null) => void;
  setOverlayUrl: (url: string) => void;
  setOverlayFit: (fit: UrlImportOverlayFit) => void;
  setOverlayRotate: (rotateDeg: number) => void;
  setOverlayFlip: (flip: { x?: boolean; y?: boolean }) => void;
  setOverlayPreserveFinders: (preserveFinders: boolean) => void;
  setOverlayPreserveTiming: (preserveTiming: boolean) => void;
  setOverlayPreserveAlignment: (preserveAlignment: boolean) => void;
  setOverlayColorMode: (colorMode: ColorMode) => void;
  setOverlayBrightness: (brightness: number) => void;
  setOverlayContrast: (contrast: number) => void;
  setOverlayGamma: (gamma: number) => void;
  setOverlaySaturation: (saturation: number) => void;
  setOverlayHueRotate: (hueRotateDeg: number) => void;
  setOverlayBlur: (blurPx: number) => void;
  setOverlaySharpen: (sharpen: number) => void;
  setOverlayPosterize: (posterizeLevels: number) => void;
  setOverlayThreshold: (threshold: number) => void;
  setOverlayEdgeDetect: (edgeDetect: "off" | "sobel" | "canny") => void;
  setOverlayInvert: (invert: boolean) => void;
  setOverlayDitherKind: (ditherKind: DitherKind) => void;
  setOverlayDiffusionKernel: (diffusionKernel: DiffusionKernel) => void;
  setOverlayDitherStrength: (ditherStrength: number) => void;
  setAnimationSpeedMs: (speedMs: number) => void;
  setAnimationLoop: (loop: boolean) => void;
  setAnimationBounce: (bounce: boolean) => void;
  setAnimationStartFrame: (startFrame: number) => void;
  setAnimationMaxFrames: (maxFrames: number) => void;
  setAnimationFrameStep: (frameStep: number) => void;
  setOutputFormat: (format: UrlImportOutputFormat) => void;
  setOutputWidth: (widthPx: number) => void;
  setOutputHeight: (heightPx: number) => void;
  setOutputQuality: (quality: number) => void;
  setOutputFilename: (filename: string) => void;
  setOutputGifPaletteSize: (gifPaletteSize: number) => void;
  setOutputGifQuantizer: (gifQuantizer: UrlImportGifQuantizer) => void;
  setOutputSvgTrueVector: (svgTrueVector: boolean) => void;
  patchState: (partial: UrlImportStateUpdater, replace?: boolean) => void;
}
