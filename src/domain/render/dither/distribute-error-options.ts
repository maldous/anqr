import type { DiffusionKernelDef } from './kernels';

/** Options for distributing error to neighboring pixels */
export interface DistributeErrorOptions {
  pixels: { r: number; g: number; b: number }[][];
  x: number;
  y: number;
  width: number;
  height: number;
  errorR: number;
  errorG: number;
  errorB: number;
  kernel: DiffusionKernelDef;
  leftToRight: boolean;
}
