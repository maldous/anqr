/**
 * Dithering Types
 */

import type { ColorMode, DiffusionKernel, DitherKind, OrderedMatrix } from '../../store/qr-store';

export type { ColorMode, DiffusionKernel, DitherKind, OrderedMatrix };

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface DitherOptions {
  kind: DitherKind;
  strength: number; // 0-100
  serpentine: boolean;
  diffusionKernel: DiffusionKernel;
  orderedMatrix: OrderedMatrix;
  colorMode: ColorMode;
  levels: number; // Output color levels (2 for B&W, more for grayscale)
  blueNoiseSeed: number;
  blueNoiseTileSize: number;
}

export interface DitherResult {
  matrix: boolean[][];
  colors: RGB[][];
}
