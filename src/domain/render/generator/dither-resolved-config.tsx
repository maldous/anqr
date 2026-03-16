import { generateBlueNoiseTile } from "../dither";
import type { DiffusionKernel } from "../dither/types";
import type { DitherThresholdPattern } from "./dither-threshold-pattern";
import type { DitherStaticState } from "./dither-static-state";

export interface DitherResolvedConfig {
  intensity: number;
  version: number;
  serpentine: boolean;
  colorDitherMode: string;
  useColorDither: boolean;
  ditherKind: string;
  thresholdPattern: DitherThresholdPattern;
  thresholdOnly: boolean;
  kernelName: DiffusionKernel;
  tileSize: number;
  staticState: DitherStaticState;
  noiseTile: ReturnType<typeof generateBlueNoiseTile>;
  temporalOffsetX: number;
  temporalOffsetY: number;
  mix: number;
  qrBitBiasStrength: number;
}
