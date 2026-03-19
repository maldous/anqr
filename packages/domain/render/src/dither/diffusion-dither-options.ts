import { DIFFUSION_KERNELS } from "./kernels";
import type { ColorMode, DiffusionKernel } from "../dither-algorithms/types";

export function resolveDiffusionDitherOptions(options: {
  colorMode?: ColorMode;
  kernelName?: DiffusionKernel;
  levels?: number;
  serpentine?: boolean;
  strength?: number;
}) {
  const kernelName = options.kernelName ?? "floyd_steinberg";
  const serpentine = options.serpentine ?? true;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? "bw";
  return {
    colorMode,
    kernel: DIFFUSION_KERNELS[kernelName],
    levels,
    serpentine,
    step: 1 / (levels - 1),
    strengthFactor: strength / 100,
  };
}
