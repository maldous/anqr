import { requestContextStorage } from "./request-context-storage.mjs";

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

/**
 * Concurrency-safe request context getter.
 * Reads from AsyncLocalStorage first; falls back to module-global for
 * code not yet wrapped in requestContextStorage.run().
 */
export function getRequestContext() {
  const store = requestContextStorage.getStore();
  if (store) return store;
  // Backward compat: return a synthetic context from the module-global
  if (currentRequestId) {
    return { requestId: currentRequestId, sessionKey: null, worktreeId: null };
  }
  return null;
}
