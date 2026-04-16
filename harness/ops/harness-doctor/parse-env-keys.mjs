import { readFileSync, existsSync } from "node:fs";

/**
 * Parse env file key names from a file. Skips comments and blank lines.
 * Returns an array of key names (not values — we never read secrets).
 *
 * @param {string} filePath
 * @returns {string[]}
 */
export function parseEnvKeys(filePath) {
  if (!existsSync(filePath)) return [];
  const content = readFileSync(filePath, "utf-8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const eqIdx = line.indexOf("=");
      return eqIdx > 0 ? line.slice(0, eqIdx).trim() : null;
    })
    .filter(Boolean);
}
