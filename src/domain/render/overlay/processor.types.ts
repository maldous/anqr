import type { DiffusionKernel, DitherKind, OrderedMatrix } from '../../../modules/dither-algorithms';
import { type FilterOptions } from './overlay-filters';

// ============================================
// TYPES
// ============================================

export type FitMode = 'contain' | 'cover' | 'fill' | 'none';

export type OverlayMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light';

export type OverlayType = 'static' | 'animated';

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OverlayOptions {
  fitMode?: FitMode;
  crop?: CropRegion;
  rotation?: number;
  flipX?: boolean;
  flipY?: boolean;
  filters?: FilterOptions;
  dither?: OverlayDitherOptions;
}

export interface OverlayDitherOptions {
  enabled?: boolean;
  kind?: DitherKind;
  strength?: number;
  kernel?: DiffusionKernel;
  matrix?: OrderedMatrix;
  levels?: number;
  serpentine?: boolean;
}

export interface ProcessedOverlay {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}
