import type { DiffusionKernelDef } from "./kernels.types";

export function prepareKernel(kernel: DiffusionKernelDef): void {
  let count = 0;
  for (let ky = 0; ky < kernel.matrix.length; ky++) {
    for (let kx = 0; kx < kernel.matrix[ky].length; kx++) {
      if (kernel.matrix[ky][kx] !== 0) count += 1;
    }
  }

  const xOffsetsLtr = new Int8Array(count);
  const xOffsetsRtl = new Int8Array(count);
  const yOffsets = new Uint8Array(count);
  const normalizedWeights = new Float32Array(count);

  let idx = 0;
  for (let ky = 0; ky < kernel.matrix.length; ky++) {
    for (let kx = 0; kx < kernel.matrix[ky].length; kx++) {
      const weight = kernel.matrix[ky][kx];
      if (weight === 0) continue;
      const offsetX = kx - kernel.offset;
      xOffsetsLtr[idx] = offsetX;
      xOffsetsRtl[idx] = -offsetX;
      yOffsets[idx] = ky;
      normalizedWeights[idx] = weight / kernel.divisor;
      idx += 1;
    }
  }

  kernel.prepared = {
    xOffsetsLtr,
    xOffsetsRtl,
    yOffsets,
    normalizedWeights,
  };
}
