import type { ColorMode, DiffusionKernel } from "../../../modules/dither-algorithms/types";

/** Options for blue noise error diffusion */
export interface BlueNoiseErrorDiffusionOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
  tileSize?: number;
  seed?: number;
}
