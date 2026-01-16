/**
 * Share Utilities - Types
 * Type definitions for URL parameter encoding/decoding and sharing
 */

/**
 * Maximum recommended share URL length.
 * URLs longer than this may fail in SMS, some social apps, and QR scanners.
 * Browser limits are typically 2048-8192 chars, but many channels are stricter.
 */
export const MAX_SHARE_URL_LENGTH = 2000;

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
