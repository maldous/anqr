import type { ColorMode, DiffusionKernel } from "@/modules/dither-algorithms/types";

/** Options for edge-aware dithering */
export interface EdgeAwareDitherOptions {
  kernelName?: DiffusionKernel;
  serpentine?: boolean;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}
