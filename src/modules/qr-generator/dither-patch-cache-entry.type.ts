import type { DitherAttemptPatch } from './qr-generator-scan-gate';

export type DitherPatchCacheEntry = {
  patch: DitherAttemptPatch;
  updatedAt: number;
};
