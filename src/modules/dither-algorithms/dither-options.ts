import type { ColorMode } from "./color-mode";
import type { DiffusionKernel } from "./diffusion-kernel";
import type { DitherKind } from "./dither-kind";
import type { OrderedMatrix } from "./ordered-matrix";

export interface DitherOptions {
  kind: DitherKind;
  strength: number;
  colorMode: ColorMode;
  levels?: number;
  diffusionKernel?: DiffusionKernel;
  serpentine?: boolean;
  blueNoiseTileSize?: number;
  blueNoiseSeed?: number;
  orderedMatrix?: OrderedMatrix;
}
