import type { PixelColor } from './pixel-color';

export interface PixelGridCtx {
  ctx: CanvasRenderingContext2D;
  marginPx: number;
  subPixelSize: number;
  scale: number;
  scaledSize: number;
  matrix: boolean[][];
  colors: (PixelColor | null)[][];
  isDitheredMode: boolean;
  needsBothDarkAndLightColors: boolean;
  needsExplicitLightModules: boolean;
  useColorRendering: boolean;
  useGradient: boolean;
  qrFirstMode: boolean;
  debug: boolean;
  effectiveFgColor: string;
  effectiveBgColor: string;
  gradientFill: string | CanvasGradient | null;
  subpixelDarkTargetLuma: number;
  subpixelDarkChroma: number;
  subpixelLightTargetLuma: number;
  subpixelLightChroma: number;
  seed: number;
  dotMinRadiusPx: number;
  dotMaxRadiusPx: number;
  lightGrainDensity: number;
  lightGrainAlpha: number;
  quantizeRadius: (r: number) => number;
  localVariance: (x: number, y: number) => number;
  drawDitherDot: (x: number, y: number, radius: number, jitterN: number) => void;
  shouldForceBinaryModule: (row: number, col: number) => boolean;
}
