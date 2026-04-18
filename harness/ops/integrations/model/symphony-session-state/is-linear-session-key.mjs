import { LINEAR_PREFIX } from "./session-key-prefixes.mjs";

/**
 * Check if a session key is from a Linear source.
 */
export function isLinearSessionKey(key) {
  return key?.startsWith(LINEAR_PREFIX) ?? false;
}
