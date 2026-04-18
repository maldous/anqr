/**
 * Lightweight holder for the provider registry array.
 *
 * Introduced to break the circular dependency:
 *   providers.mjs → build-provider-registry → build-static-providers →
 *   probe-* → record-probe-result → calculate-provider-score → providers.mjs
 *
 * `providers.mjs` populates this array at boot; all other consumers import
 * from here instead of `providers.mjs` to avoid completing the cycle.
 */
export const PROVIDERS = [];
