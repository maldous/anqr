import type { ColorMode, DiffusionKernel } from "../dither-algorithms/types";

/** Options for error diffusion dithering */
export interface ErrorDiffusionOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}
