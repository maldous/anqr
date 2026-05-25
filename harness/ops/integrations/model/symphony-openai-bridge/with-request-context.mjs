import { requestContextStorage } from "./request-context-storage.mjs";

/**
 * Run `fn` with a concurrency-safe request context that is accessible
 * via `getRequestContext()` / `getCurrentRequestId()` throughout the
 * async call tree.
 *
 * This replaces the unsafe pattern of setting a module-global
 * `currentRequestId` before a request and clearing it after.
 *
 * `fn` can be sync OR async — AsyncLocalStorage.run returns whatever
 * the callback returns. `requestId` is optional so callers can test
 * the "fallback to module-global when async-local has no requestId"
 * code path with a partial context.
 *
 * @template T
 * @param {{ requestId?: string|null, sessionKey?: string|null, worktreeId?: string|null }} context
 * @param {() => T} fn
 * @returns {T}
 */
export function withRequestContext(context, fn) {
  return requestContextStorage.run(context, fn);
}
