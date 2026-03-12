import { DIFFUSION_KERNELS } from '../dither/kernels';
import type { DiffusionKernel } from '../dither/types';

export function resolveDiffusionKernel(
  configuredKernel: string | undefined,
  ditherKind: string
): DiffusionKernel {
  if (configuredKernel && configuredKernel in DIFFUSION_KERNELS) {
    return configuredKernel as DiffusionKernel;
  }
  const kindKernelMap: Record<string, DiffusionKernel> = {
    floyd_steinberg: 'floyd_steinberg',
    atkinson: 'atkinson',
    stucki: 'stucki',
    burkes: 'burkes',
    sierra: 'sierra',
  };
  return kindKernelMap[ditherKind] ?? 'floyd_steinberg';
}
