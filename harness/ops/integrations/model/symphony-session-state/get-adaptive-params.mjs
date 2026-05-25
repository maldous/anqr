import { loadAdaptiveParams } from "./load-adaptive-params.mjs";
import { paramsCache, setParamsCache } from "./params-cache.mjs";

/**
 * Resolve the adaptive params cache, lazily loading on first call.
 *
 * TS can't narrow the return type because `paramsCache` is a mutable
 * module-level `let null` whose set happens through a separate function
 * — the control-flow analyzer sees `T | null` as the inferred return.
 * In reality this function NEVER returns null: if the cache is empty
 * we populate it via loadAdaptiveParams (which always returns a value)
 * before returning. The JSDoc here pins the return type so tests don't
 * need to non-null-assert every consumer.
 *
 * @returns {ReturnType<typeof loadAdaptiveParams>}
 */
export function getAdaptiveParams() {
  if (!paramsCache) {
    setParamsCache(loadAdaptiveParams());
  }
  return /** @type {ReturnType<typeof loadAdaptiveParams>} */ (paramsCache);
}
