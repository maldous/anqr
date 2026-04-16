import { readFileSync, existsSync } from "node:fs";

/**
 * Load the rotation ledger from disk, or return a fresh empty ledger.
 *
 * @param {string} ledgerPath
 * @returns {{ version: number, keys: Record<string, { hash: string, lastRotatedAt: string, lastCheckedAt: string }> }}
 */
export function loadLedger(ledgerPath) {
  if (!existsSync(ledgerPath)) {
    return { version: 1, keys: {} };
  }
  try {
    return JSON.parse(readFileSync(ledgerPath, "utf-8"));
  } catch {
    return { version: 1, keys: {} };
  }
}
