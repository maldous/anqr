import type { FunctionalMapCache } from "./functional-map-cache.types";
import { functionalMapCacheState } from "./functional-map-cache-state";
export { setFunctionalMapCache } from "./set-functional-map-cache";

export function getFunctionalMapCache(): FunctionalMapCache {
  return functionalMapCacheState;
}
