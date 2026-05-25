/** @type {import("./load-adaptive-params.mjs").ReturnType extends infer R ? R | null : null} */
// JSDoc above pins paramsCache as `AdaptiveParams | null` instead of the
// literal-null type TS otherwise infers from `= null`. Lets tests
// access `paramsCache!.evalCycle` without a TS2339 on the `null` literal.
/** @type {ReturnType<typeof import("./load-adaptive-params.mjs").loadAdaptiveParams> | null} */
export let paramsCache = null;

export function setParamsCache(value) {
  paramsCache = value;
}
