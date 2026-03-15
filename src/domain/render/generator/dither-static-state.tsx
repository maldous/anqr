import { generateBlueNoiseTile } from '../dither';
import type { DiffusionKernelDef } from '../dither/kernels';
import type { DiffusionKernel } from '../dither/types';

export type DitherStaticState = {
  key: string;
  kernelName: DiffusionKernel;
  kernel: DiffusionKernelDef;
  noiseTile: ReturnType<typeof generateBlueNoiseTile>;
  orderedMatrix: number[][];
  orderedH: number;
  orderedW: number;
  orderedDivisor: number;
  whiteNoiseField: Float32Array;
  gaussianNoiseField: Float32Array;
  triangularNoiseField: Float32Array;
};
