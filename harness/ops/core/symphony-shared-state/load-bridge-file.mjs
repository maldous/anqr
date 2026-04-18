import fs from "node:fs";
import { getBridgeFilePath } from "./get-bridge-file-path.mjs";

/**
 * Atomically load and parse a JSON file from the shared bridge state directory.
 * Returns `fallback` if the file doesn't exist or can't be parsed.
 *
 * @param {string} fileName - File name relative to bridge state dir
 * @param {object} [fallback={}] - Default value if file is missing or corrupt
 * @returns {object}
 */
export function loadBridgeFile(fileName, fallback = {}) {
  try {
    const filePath = getBridgeFilePath(fileName);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch {
    /* corrupt or unreadable — return fallback */
  }
  return fallback;
}
