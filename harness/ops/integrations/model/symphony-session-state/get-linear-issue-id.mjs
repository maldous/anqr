import { isLinearSessionKey } from "./is-linear-session-key.mjs";
import { LINEAR_PREFIX } from "./session-key-prefixes.mjs";

/**
 * Extract the Linear issue identifier from a Linear session key.
 * Returns null if the key is not a Linear key.
 */
export function getLinearIssueId(key) {
  if (!isLinearSessionKey(key)) return null;
  return key.slice(LINEAR_PREFIX.length);
}
