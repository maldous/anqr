import { getCodebuffApiKey } from "./codebuff-key-pool.mjs";

/**
 * Returns the best available CodeBuff API key for the given cost mode.
 * When costMode is omitted, defaults to the primary (paid) key for
 * backward compatibility.
 *
 * @param {"paid"|"free"} [costMode]
 * @returns {string|null}
 */
export function getApiKey(costMode) {
  return getCodebuffApiKey(costMode) || null;
}
