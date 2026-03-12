import type { DiffusionKernel, OrderedMatrix } from '../dither/types';

export function buildDitherStaticStateKey(args: {
  ditherKind: string;
  tileSize: number;
  seed: number;
  orderedMatrixName: OrderedMatrix;
  kernelName: DiffusionKernel;
  colorDitherMode: string;
  scaledSize: number;
}): string {
  return [
    args.ditherKind,
    args.tileSize,
    args.seed,
    args.orderedMatrixName,
    args.kernelName,
    args.colorDitherMode,
    args.scaledSize,
  ].join('|');
}
