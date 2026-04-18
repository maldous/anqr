import { requestContextStorage } from "./request-context-storage.mjs";
import { currentRequestId } from "./current-request-id.mjs";

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
