import type { DitherAttemptPatch } from './dither-attempt-patch.type';

export type DitherPatchCacheEntry = {
  patch: DitherAttemptPatch;
  updatedAt: number;
};
