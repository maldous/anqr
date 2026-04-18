import { requestContextStorage } from "./request-context-storage.mjs";

/**
 * Run `fn` with a concurrency-safe request context that is accessible
 * via `getRequestContext()` / `getCurrentRequestId()` throughout the
 * async call tree.
 *
 * This replaces the unsafe pattern of setting a module-global
 * `currentRequestId` before a request and clearing it after.
 *
 * @param {{ requestId: string, sessionKey?: string|null, worktreeId?: string|null }} context
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
export function withRequestContext(context, fn) {
  return requestContextStorage.run(context, fn);
}
