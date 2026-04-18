import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Async-local storage for request-scoped context.
 * Replaces the unsafe module-global `currentRequestId` with concurrency-safe
 * per-request attribution.
 *
 * Store shape: { requestId, sessionKey, worktreeId }
 *
 * Usage: requestContextStorage.run({ requestId, sessionKey, worktreeId }, async () => { ... })
 */
export const requestContextStorage = new AsyncLocalStorage();
