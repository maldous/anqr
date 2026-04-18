import fs from "node:fs/promises";
import path from "node:path";
import { DISCOVERED_PER_REQUEST_LIMITS_FILE } from "./discovered-per-request-limits-cache-file.mjs";
import { loadDiscoveredPerRequestLimits } from "./load-discovered-per-request-limits.mjs";

/**
 * Persist a per-request limit discovered from a 413 error.
 * Merges with existing entries — new discoveries override old ones.
 * Uses async write to avoid blocking the event loop in the fallback path.
 *
 * @param {string} providerName
 * @param {number} limit - The per-request token limit discovered from the error
 * @param {string} source - Description of where the limit came from (e.g. "413 tokens_limit_reached")
 */
export function saveDiscoveredPerRequestLimit(providerName, limit, source) {
  // Fire-and-forget async write — don't block the fallback path
  const dir = path.dirname(DISCOVERED_PER_REQUEST_LIMITS_FILE);
  fs.mkdir(dir, { recursive: true })
    .then(() => fs.readFile(DISCOVERED_PER_REQUEST_LIMITS_FILE, "utf8"))
    .catch(() => "{}")
    .then((raw) => {
      const existing = JSON.parse(raw);
      if (typeof existing !== "object" || existing === null) return;
      existing[providerName] = {
        limit,
        discoveredAt: Date.now(),
        source: source || "413_error",
      };
      return fs.writeFile(DISCOVERED_PER_REQUEST_LIMITS_FILE, JSON.stringify(existing, null, 2));
    })
    .catch((err) => {
      // Best-effort persistence — don't let cache write failures break anything
      if (process.env.SYMPHONY_DEBUG) {
        console.error(
          `[DIAG] Failed to persist discovered limit for ${providerName}:`,
          err.message,
        );
      }
    });
}
