/**
 * QR Generator Types
 * TypeScript type definitions for the QR generator module
 */

import type { GradientConfig } from '../core';

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
  blueNoiseSeed?: number;
  blueNoiseTileSize?: number;

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
  filterEdgeMode?: string;
  filterPosterize?: number;
  filterDuotone1?: string;
  filterDuotone2?: string;

  // Debug
  // When enabled, logs only the overlay/dither wiring and preservation decisions.
  debugOverlayDither?: boolean;
}

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
