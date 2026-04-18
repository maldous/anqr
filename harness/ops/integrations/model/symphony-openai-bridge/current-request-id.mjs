/**
 * @deprecated Use getCurrentRequestId() or requestContextStorage for new code.
 * Kept as a backward-compat fallback for code that imports this variable directly.
 * Under concurrent requests, this may be stale — prefer the async-local getter.
 */
export let currentRequestId = null;

/**
 * @deprecated Use requestContextStorage.run({ requestId, ... }, fn) instead.
 * Setting this module-global is NOT concurrency-safe.
 */
export function setCurrentRequestId(value) {
  currentRequestId = value;
}
