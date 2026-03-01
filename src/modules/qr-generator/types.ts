/**
 * QR Generator Types
 * TypeScript type definitions for the QR generator module
 */

import { createLogger } from '../../lib/logger';
import type { GradientConfig } from '../core';

const _log = createLogger('GENERATE');

export interface QRGeneratorConfig {
  content: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  typeNumber: number;
  moduleSize: number;
  margin: number;
  fgColor: string;
  bgColor: string;
  transparentBg?: boolean;

  // Module styling
  moduleStyle?: 'square' | 'rounded' | 'dots' | 'diamond' | 'star' | 'heart' | 'connected';
  cornerRadius?: number;
  dotRotationDeg?: number;
  moduleGap?: number;
  gapMode?: 'none' | 'inset' | 'stroke' | 'negative_space';

  // Finder/alignment patterns
  finderStyle?: string;
  eyeOuterStyle?: string;
  eyeInnerStyle?: string;
  eyeScale?: number;
  alignmentStyle?: string;
  timingStyle?: string;
  preserveFinders?: boolean;
  preserveTiming?: boolean;
  preserveAlignment?: boolean;

  // Overlay settings
  overlayMode?: string;
  overlayIntensity?: number;
  colorMode?: string;
  ditherKind?: string;
  ditherStrength?: number;
  // Strength of finder/alignment pattern override when preservation is disabled (0-100).
  finderDitherStrength?: number;
  // When true, preservation-strength overlays use image-aware blended coloring instead of pure B/W alpha.
  blendPreservations?: boolean;
  // Strategy used when blendPreservations is enabled.
  blendPreservationMode?: 'overlay' | 'dither';
  // Color blending space for artifact pipeline.
  blendSpace?: 'srgb' | 'linear';
  // Strength used for halftone-dithered backdrop tinting of preserved modules.
  halftoneBackdropStrength?: number;
  // When true, force non-scaled overlay modes (halftone, mosaic, blend, etc.) through the
  // scaled rendering path. Used for animated overlays where per-pixel detail must be preserved
  // across frames.
  forceScaledOverlay?: boolean;
  blueNoiseSeed?: number;
  blueNoiseTileSize?: number;
  ditherMode?: 'blue_noise' | 'error_diffusion';
  ditherScale?: number;

  // Advanced dither settings
  ditherSerpentine?: boolean;
  diffusionKernel?: string;
  orderedMatrix?: string;
  colorDither?: 'none' | 'per_channel' | 'perceptual';
  dotMinRadiusPx?: number;
  dotMaxRadiusPx?: number;
  lightGrainDensity?: number;
  lightGrainAlpha?: number;
  ditherBackdropAlpha?: number;
  ditherBackdropWash?: number;
  renderScalePerModule?: number;
  /** Minimum render scale per module (default: 12). Set lower for animation frames. */
  renderScaleMinimum?: number;
  darkMinOccupancy?: number;
  lightMaxOccupancy?: number;
  edgeImprintThreshold?: number;
  toneStdThreshold?: number;
  edgeImprintWorsenLimit?: number;
  scanGateProfile?: 'full' | 'preview' | 'off';
  qrBitBiasStrength?: number;
  preserveFunctionalPatterns?: boolean;
  cleanupSpeckle?: boolean;
  forceCenterLock?: boolean;
  optimizeIterations?: number;

  // ECC-based overlay intensity limits (0-100 per ECC level)
  // When provided, overrides the hardcoded defaults in getEffectiveIntensity()
  maxOverlayIntensityByEcc?: Record<string, number>;

  // Color settings
  gradient?: GradientConfig;
  perModuleColorMode?: string;
  palette?: string[];
  paletteMode?: string;
  contrastGuard?: boolean;
  minContrastRatio?: number;

  // Frame settings
  frameStyle?: string;
  frameText?: string;
  frameColor?: string;
  frameTextColor?: string;
  frameBorderRadius?: number;

  // ECC awareness
  eccAwareEnabled?: boolean;
  eccAwareRiskBudget?: number;
  eccAwareWeightMap?: string;

  // Format/version protection
  protectFormatInfo?: boolean;
  protectVersionInfo?: boolean;

  // Quiet zone
  quietZoneMinEnforce?: boolean;

  // Encoding
  encodingMode?: string;
  maskPattern?: number | 'auto' | undefined;
  characterEncoding?: string;

  // Advanced
  logoSize?: number;
  seed?: number;
  moduleJitterPx?: number;
  pixelSnap?: 'none' | 'floor' | 'round' | 'ceil';
  frameIndex?: number;

  /** When true, skip expensive rendering features and lower scaled render density
   *  during active interaction. Full quality re-render follows after config settle. */
  fastPreview?: boolean;

  // Halftone settings
  htDot?: number;
  htCurve?: number;
  htCell?: number;
  halftoneCell?: number | string;
  halftoneDotShape?: string;
  brightnessCurve?: number | string;
  duotoneColors?: string[];

  // Subpixel settings
  subpixelGrid?: number;
  subpixelCenter?: string;
  subpixelNeutral?: boolean;
  subpixelGridSize?: string; // '2x2' | '3x3' | '4x4'
  subpixelCenterRule?: string; // 'strict' | 'halftone_center'
  subpixelNeutralColor?: string; // hex color for neutral pixels
  subpixelFinderOverride?: string; // 'solid' | 'stylized'

  // Filter settings
  filterBrightness?: number;
  filterContrast?: number;
  filterSaturation?: number;
  filterHue?: number;
  filterGamma?: number;
  filterInvert?: boolean;
  filterGrayscale?: boolean;
  filterThreshold?: number;
  filterBlur?: number;
  filterSharpen?: number;
  filterEdgeDetect?: boolean;

  /** Disable automatic softening of high-contrast B&W images. Default: false (auto-soften enabled) */
  disableAutoSoften?: boolean;

  /** Force QR-first mode for overlays (guarantees scannability at cost of dithering fidelity) */
  qrFirstMode?: boolean;

  /** QR-Art: Number of fragment iterations to search */
  qrartIterations?: number;
  /** QR-Art: Length of numeric fragment to append */
  qrartFragmentLength?: number;
  /** QR-Art: Random seed for reproducible searches */
  qrartSeed?: number;
  /** Render QR-Art matrix without styling (debug) */
  rawMatrixRender?: boolean;
  filterEdgeMode?: string;
  filterPosterize?: number;
  filterDuotone1?: string;
  filterDuotone2?: string;

  // Debug
  // When enabled, logs only the overlay/dither wiring and preservation decisions.
  debugOverlayDither?: boolean;
}

/** Overlay modes that use the scaled (per-pixel) rendering path. */
export const INTRINSICALLY_SCALED_OVERLAY_MODES: ReadonlySet<string> = new Set([
  'dithered',
  'blue-noise',
  'blue_noise',
  'subpixel',
  'subpixel-size',
]);

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBWithMeta extends RGB {
  halftone?: boolean;
  sizeRatio?: number;
}

export interface PixelDecisionMatrix {
  matrix: boolean[][];
  colors: (RGBWithMeta | null)[][];
  scale: number;
  overlayData: OverlayData | null;
  effectiveIntensity: number;
}

export interface OverlayData {
  /** Module-space width/height. */
  size: number;
  /** Packed per-module brightness values in [0..1], row-major. */
  brightness: Float32Array;
  /** Optional packed per-module RGB colors (0x01RRGGBB), row-major. */
  colorsPacked?: Uint32Array;
  /**
   * Legacy sparse object fallback kept for compatibility with transitional paths.
   * New code should use packed helpers in `overlay-data-packed.ts`.
   */
  [row: number]: {
    [col: number]: number;
  };
  colors?: {
    [row: number]: {
      [col: number]: { r: number; g: number; b: number };
    };
  };
}

export interface OverlayModeResult {
  moduleColor: string;
  moduleSizeModifier: number;
  moduleOpacity: number;
  waveOffsetX: number;
  waveOffsetY: number;
  drawOutlineOnly: boolean;
  useHalftoneRendering: boolean;
  halftoneBrightness: number;
  shouldDrawCell: boolean;
}

export interface DiffusionKernel {
  offsets: Array<{ dx: number; dy: number; weight: number }>;
  divisor: number;
}

export type CreateCanvasFn = (
  width: number,
  height: number
) => Promise<HTMLCanvasElement | OffscreenCanvas>;

export type ReleaseCanvasFn = (canvas: HTMLCanvasElement | OffscreenCanvas) => void;

/**
 * Union type for canvas elements (browser or offscreen)
 * Used throughout the QR generator for canvas compatibility
 */
export type CanvasElement = HTMLCanvasElement | OffscreenCanvas;

/**
 * Union type for 2D rendering contexts
 */
export type Canvas2DContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

// QR code instance interface
export interface QRCodeInstance {
  isDark(row: number, col: number): boolean;
  getModuleCount(): number;
  addData(data: string, mode?: string): void;
  make(maskPattern?: number): void;
}

// QR matrix result
export interface QRMatrixResult {
  matrix: boolean[][];
  moduleCount: number;
}

// Pixel decision result (alias for consistency)
export type PixelDecisionResult = PixelDecisionMatrix;
