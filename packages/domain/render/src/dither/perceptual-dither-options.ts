import type { ColorMode, DiffusionKernel } from "../dither-algorithms/types";

/** Options for perceptual dithering */
export interface PerceptualDitherOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}
