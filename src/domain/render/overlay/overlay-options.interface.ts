import { type FilterOptions } from './overlay-filters';
import type { CropRegion } from './crop-region.interface';
import type { FitMode } from './fit-mode';
import type { OverlayDitherOptions } from './overlay-dither-options.interface';

export interface OverlayOptions {
  fitMode?: FitMode;
  crop?: CropRegion;
  rotation?: number;
  flipX?: boolean;
  flipY?: boolean;
  filters?: FilterOptions;
  dither?: OverlayDitherOptions;
}
