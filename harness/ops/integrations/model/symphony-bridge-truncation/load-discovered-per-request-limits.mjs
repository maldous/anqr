import fs from "node:fs";
import { DISCOVERED_PER_REQUEST_LIMITS_FILE } from "./discovered-per-request-limits-cache-file.mjs";

/**
 * Load per-request limits discovered from 413 errors at runtime.
 * These are persisted across restarts so the bridge doesn't have to
 * re-learn the same limits on every boot.
 *
 * @returns {Record<string, {limit: number, discoveredAt: number, source: string}>}
 */
export function loadDiscoveredPerRequestLimits() {
  try {
    if (!fs.existsSync(DISCOVERED_PER_REQUEST_LIMITS_FILE)) return {};
    const data = JSON.parse(fs.readFileSync(DISCOVERED_PER_REQUEST_LIMITS_FILE, "utf8"));
    if (typeof data === "object" && data !== null) return data;
    return {};
  } catch {
    return {};
  }
}
