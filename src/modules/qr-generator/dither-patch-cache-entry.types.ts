import type { DitherAttemptPatch } from "./dither-attempt-patch.types";

export type DitherPatchCacheEntry = {
  patch: DitherAttemptPatch;
  updatedAt: number;
};
