import { requestContextStorage } from "./request-context-storage.mjs";
import { currentRequestId } from "./current-request-id.mjs";

/**
 * Concurrency-safe request ID getter.
 * Reads from AsyncLocalStorage first; falls back to module-global for
 * backward compatibility with code not yet wrapped in requestContextStorage.run().
 */
export function getCurrentRequestId() {
  const store = requestContextStorage.getStore();
  if (store?.requestId) return store.requestId;
  return currentRequestId;
}
