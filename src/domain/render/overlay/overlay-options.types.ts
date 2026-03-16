import { type FilterOptions } from "./overlay-filters";
import type { CropRegion } from "./crop-region.types";
import type { FitMode } from "./fit-mode";
import type { OverlayDitherOptions } from "./overlay-dither-options.types";

export interface OverlayOptions {
  fitMode?: FitMode;
  crop?: CropRegion;
  rotation?: number;
  flipX?: boolean;
  flipY?: boolean;
  filters?: FilterOptions;
  dither?: OverlayDitherOptions;
}
