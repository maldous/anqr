import { buildScaledFunctionalMap } from "./build-scaled-functional-map";
import { scaledFunctionalMapCache } from "./scaled-functional-map-cache";

export function getScaledFunctionalMap(moduleCount: number, version: number): Uint8Array {
  const key = `${moduleCount}:${version}`;
  const cached = scaledFunctionalMapCache.get(key);
  if (cached) return cached;
  const map = buildScaledFunctionalMap(moduleCount, version);
  scaledFunctionalMapCache.set(key, map);
  if (scaledFunctionalMapCache.size > 24) {
    const oldestKey = scaledFunctionalMapCache.keys().next().value;
    if (oldestKey !== undefined) scaledFunctionalMapCache.delete(oldestKey);
  }
  return map;
}
