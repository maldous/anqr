/**
 * Share Links Module - Types
 * Types for URL sharing and embed generation
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('SHARE');

/**
 * Maximum recommended URL length for reliable sharing
 */
export const MAX_SHARE_URL_LENGTH = 2048;

/**
 * Share configuration object containing all QR settings
 */
export interface ShareConfig {
  // Required
  data?: string;
  lang?: string;

  // QR settings
  ec?: string;
  version?: number;
  size?: number;
  margin?: number;
  encodingMode?: string;
  maskPattern?: number | 'auto';
  characterEncoding?: string;
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
  gradientStops?: Array<{ color: string; pos: number }>;
  gradientAngle?: number;
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
  overlayUrl?: string;
  overlayType?: string;
  overlayFramePick?: string;
  cropEnabled?: boolean;
  cropX?: number;
  cropY?: number;
  cropSize?: number;
  gifUseFrameDelays?: boolean;
  gifMaxFps?: number;
  gifDisposalHandling?: string;
  fit?: string;
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
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
  blur?: number;
  sharpen?: number;
  posterize?: number;
  threshold?: number;
  edge?: string;
  invert?: boolean;
  hue?: number;

  // Subpixel rendering
  subpixelMode?: boolean;
  subpixelGrid?: number;

  // Dithering
  ditherKind?: string;
  diffusionKernel?: string;
  ditherStrength?: number;
  finderDitherStrength?: number;
  blendPreservations?: boolean;
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
  startFrame?: number;
  maxFrames?: number;
  frameStep?: number;
  interpolate?: string;
  temporalDither?: string;
  pattern?: string;
  moduleJitter?: number;
  colorCycle?: boolean;
  seed?: number;
  easing?: string;

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
  watermarkPosition?: string;
  watermarkOpacity?: number;
  watermarkBlend?: string;
  watermarkImageUrl?: string;

  // Animation
  animationPattern?: string;
  animationFrames?: number;
  animationSpeed?: number;
  animationSeed?: number;

  // Metadata
  metaTitle?: string;
  metaAuthor?: string;
  metaCopyright?: string;
  metaLicense?: string;
  metaDescription?: string;
  metaCreationTime?: boolean;
  metaCustomKv?: string;

  // Render palette
  palette?: string;
  paletteMode?: string;

  // Safety per-ECC limits
  maxOverlayIntensityL?: number;
  maxOverlayIntensityM?: number;
  maxOverlayIntensityQ?: number;
  maxOverlayIntensityH?: number;

  // Module size (for server-side generation)
  modulePx?: number;
}

/**
 * Options for embed code generation
 */
export interface EmbedOptions {
  width?: number;
  height?: number;
  responsive?: boolean;
  showBorder?: boolean;
  includeLink?: boolean;
}
