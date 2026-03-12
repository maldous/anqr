import type { OrderedMatrix } from '../dither/types';

export function resolveOrderedMatrixName(
  ditherKind: string,
  configured: string | undefined
): OrderedMatrix {
  if (ditherKind === 'ordered_clustered') return 'clustered_dot';
  if (ditherKind === 'ordered_void_cluster') return 'void_cluster';
  if (configured === 'bayer2' || configured === 'bayer4' || configured === 'bayer8')
    return configured;
  if (configured === 'clustered_dot' || configured === 'void_cluster') return configured;
  return 'bayer4';
}
