import { createRNG, getOrderedMatrix } from "../dither";
import { DIFFUSION_KERNELS } from "../dither/kernels";
import type { DiffusionKernel, OrderedMatrix } from "../dither/types";
import { MAX_DITHER_STATIC_STATES } from "./max-dither-static-states";
import { ditherStaticStateCache } from "./dither-static-state-cache";
import { getBlueNoiseTileCached } from "./get-blue-noise-tile-cached";
import { buildDitherStaticStateKey } from "./build-dither-static-state-key";
import { clamp01 } from "./clamp01";
import type { DitherStaticState } from "./dither-static-state";

export function getDitherStaticState(args: {
  ditherKind: string;
  tileSize: number;
  seed: number;
  orderedMatrixName: OrderedMatrix;
  kernelName: DiffusionKernel;
  colorDitherMode: string;
  scaledSize: number;
}): DitherStaticState {
  const key = buildDitherStaticStateKey(args);
  const existing = ditherStaticStateCache.get(key);
  if (existing) return existing;

  const kernel = DIFFUSION_KERNELS[args.kernelName] ?? DIFFUSION_KERNELS.floyd_steinberg;
  const noiseTile = getBlueNoiseTileCached(args.tileSize, args.seed);
  const orderedMatrix = getOrderedMatrix(args.orderedMatrixName);
  const orderedH = orderedMatrix.length;
  const orderedW = orderedMatrix[0]?.length ?? orderedH;
  const orderedDivisor = Math.max(1, orderedH * orderedW);

  const pixelCount = args.scaledSize * args.scaledSize;
  const whiteNoiseField = new Float32Array(pixelCount);
  const gaussianNoiseField = new Float32Array(pixelCount);
  const triangularNoiseField = new Float32Array(pixelCount);
  const whiteNoiseRng = createRNG((args.seed ^ 0x9e3779b9) >>> 0);
  const gaussianNoiseRng = createRNG((args.seed ^ 0x7f4a7c15) >>> 0);
  const triangularNoiseRng = createRNG((args.seed ^ 0x94d049bb) >>> 0);
  for (let i = 0; i < pixelCount; i++) {
    whiteNoiseField[i] = whiteNoiseRng();
    const u1 = Math.max(1e-6, gaussianNoiseRng());
    const u2 = gaussianNoiseRng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    gaussianNoiseField[i] = clamp01(0.5 + z * 0.18);
    triangularNoiseField[i] = (triangularNoiseRng() + triangularNoiseRng()) * 0.5;
  }

  const created: DitherStaticState = {
    key,
    kernelName: args.kernelName,
    kernel,
    noiseTile,
    orderedMatrix,
    orderedH,
    orderedW,
    orderedDivisor,
    whiteNoiseField,
    gaussianNoiseField,
    triangularNoiseField,
  };
  ditherStaticStateCache.set(key, created);
  if (ditherStaticStateCache.size > MAX_DITHER_STATIC_STATES) {
    const oldestKey = ditherStaticStateCache.keys().next().value;
    if (oldestKey) ditherStaticStateCache.delete(oldestKey);
  }
  return created;
}
