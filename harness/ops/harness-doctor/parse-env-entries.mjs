import { readFileSync, existsSync } from "node:fs";
import { hashValue } from "./hash-value.mjs";

/**
 * Placeholder patterns — values that indicate a key has not been properly
 * populated with a real secret. Checked case-insensitively.
 */
const PLACEHOLDER_PATTERNS = [
  /^REPLACE/i,
  /^changeme$/i,
  /^TODO$/i,
  /^x{3,}$/i,
  /^your[_-]?.*here$/i,
  /^REPLACE_WITH_REAL/i,
  /^<.*>$/,
];

/**
 * Parse env file entries with value awareness.
 * Returns key names, value hashes, and empty/placeholder flags.
 * **Never returns raw secret values.**
 *
 * @param {string} filePath
 * @returns {Array<{ key: string, valueHash: string, isEmpty: boolean, isPlaceholder: boolean }>}
 */
export function parseEnvEntries(filePath) {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, "utf-8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const eqIdx = line.indexOf("=");
      if (eqIdx <= 0) return null;
      const key = line.slice(0, eqIdx).trim();
      const value = line.slice(eqIdx + 1).trim();
      const isEmpty = value === "";
      const isPlaceholder = !isEmpty && PLACEHOLDER_PATTERNS.some((re) => re.test(value));
      return { key, valueHash: hashValue(value), isEmpty, isPlaceholder };
    })
    .filter(Boolean);
}
