import type { MapImageToTargetsOptions } from "./image-utils.types";

export function resolveSupersampleLevel(options?: MapImageToTargetsOptions): 1 | 2 | 3 {
  if (options?.supersampleLevel === 1) return 1;
  if (options?.supersampleLevel === 3) return 3;
  return 2;
}
