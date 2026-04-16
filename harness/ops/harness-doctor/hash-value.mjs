import { createHash } from "node:crypto";

/**
 * Hash a value with SHA-256. Returns a hex digest.
 * Used for change-detection without ever storing or logging the raw value.
 *
 * @param {string} value
 * @returns {string}
 */
export function hashValue(value) {
  return createHash("sha256").update(value).digest("hex");
}
