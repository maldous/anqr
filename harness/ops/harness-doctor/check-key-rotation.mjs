import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { homedir } from "node:os";

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
 * Hash a value with SHA-256. Returns a hex digest.
 * Used for change-detection without ever storing or logging the raw value.
 *
 * @param {string} value
 * @returns {string}
 */
function hashValue(value) {
  return createHash("sha256").update(value).digest("hex");
}

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

/**
 * Load the rotation ledger from disk, or return a fresh empty ledger.
 *
 * @param {string} ledgerPath
 * @returns {{ version: number, keys: Record<string, { hash: string, lastRotatedAt: string, lastCheckedAt: string }> }}
 */
function loadLedger(ledgerPath) {
  if (!existsSync(ledgerPath)) {
    return { version: 1, keys: {} };
  }
  try {
    return JSON.parse(readFileSync(ledgerPath, "utf-8"));
  } catch {
    return { version: 1, keys: {} };
  }
}

/**
 * Check key rotation status for an env file.
 *
 * Detects:
 * - Empty keys (value is empty string)
 * - Placeholder keys (value matches known placeholder patterns)
 * - Stale keys (populated but not rotated within maxAgeDays)
 * - Rotated keys (value hash changed since last check)
 *
 * Maintains a rotation ledger at `ledgerPath` tracking value hashes
 * and rotation timestamps. **Never stores or logs raw secret values.**
 *
 * @param {object} [opts]
 * @param {string} [opts.envPath] — env file to check (default: live host file)
 * @param {string} [opts.ledgerPath] — rotation ledger location (default: reports/key-rotation-ledger.json)
 * @param {number} [opts.maxAgeDays] — max days before a key is considered stale (default: 90)
 * @returns {Promise<{ pass: boolean, detail: string, emptyKeys: string[], placeholderKeys: string[], staleKeys: string[], rotatedKeys: string[], totalKeys: number, populatedKeys: number }>}
 */
export async function checkKeyRotation({
  envPath: envPathOverride,
  ledgerPath: ledgerPathOverride,
  maxAgeDays = 90,
} = {}) {
  let envPath = envPathOverride;
  let ledgerPath = ledgerPathOverride;

  if (!envPath || !ledgerPath) {
    const { ROOT } = await import("./root.mjs");
    if (!envPath) {
      envPath = resolve(homedir(), ".config/systemd/user/anqr-ops.env");
    }
    if (!ledgerPath) {
      ledgerPath = resolve(ROOT, "reports", "key-rotation-ledger.json");
    }
  }

  if (!existsSync(envPath)) {
    return {
      pass: false,
      detail: `Env file not found: ${envPath}`,
      emptyKeys: [],
      placeholderKeys: [],
      staleKeys: [],
      rotatedKeys: [],
      totalKeys: 0,
      populatedKeys: 0,
    };
  }

  const entries = parseEnvEntries(envPath);
  const ledger = loadLedger(ledgerPath);
  const now = new Date().toISOString();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  const emptyKeys = [];
  const placeholderKeys = [];
  const staleKeys = [];
  const rotatedKeys = [];

  for (const entry of entries) {
    const prev = ledger.keys[entry.key];

    if (entry.isEmpty) {
      emptyKeys.push(entry.key);
    } else if (entry.isPlaceholder) {
      placeholderKeys.push(entry.key);
    }

    // Rotation detection: compare hash to ledger
    if (prev && prev.hash !== entry.valueHash) {
      // Hash changed — key was rotated
      rotatedKeys.push(entry.key);
      ledger.keys[entry.key] = {
        hash: entry.valueHash,
        lastRotatedAt: now,
        lastCheckedAt: now,
      };
    } else if (prev) {
      // Hash unchanged — update lastCheckedAt only
      ledger.keys[entry.key] = {
        ...prev,
        lastCheckedAt: now,
      };
    } else {
      // New key — first observation
      ledger.keys[entry.key] = {
        hash: entry.valueHash,
        lastRotatedAt: now,
        lastCheckedAt: now,
      };
    }

    // Stale detection: populated key not rotated within threshold
    // Only flag populated (non-empty, non-placeholder) keys as stale
    if (!entry.isEmpty && !entry.isPlaceholder) {
      const lastRotated = new Date(ledger.keys[entry.key].lastRotatedAt).getTime();
      if (Date.now() - lastRotated > maxAgeMs) {
        staleKeys.push(entry.key);
      }
    }
  }

  // Remove ledger entries for keys no longer in the env file
  for (const key of Object.keys(ledger.keys)) {
    if (!entries.some((e) => e.key === key)) {
      delete ledger.keys[key];
    }
  }

  // Write updated ledger
  mkdirSync(dirname(ledgerPath), { recursive: true });
  writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + "\n");

  const populatedKeys = entries.filter((e) => !e.isEmpty && !e.isPlaceholder).length;

  // pass = no empty or placeholder keys (stale keys are advisory)
  const pass = emptyKeys.length === 0 && placeholderKeys.length === 0;

  const parts = [];
  if (emptyKeys.length > 0) parts.push(`${emptyKeys.length} empty`);
  if (placeholderKeys.length > 0) parts.push(`${placeholderKeys.length} placeholder`);
  if (staleKeys.length > 0) parts.push(`${staleKeys.length} stale (>${maxAgeDays}d)`);
  if (rotatedKeys.length > 0) parts.push(`${rotatedKeys.length} rotated`);

  const detail = pass
    ? `${populatedKeys}/${entries.length} keys populated${staleKeys.length > 0 ? ` (${staleKeys.length} stale)` : ""}${rotatedKeys.length > 0 ? ` (${rotatedKeys.length} rotated)` : ""}`
    : `Value issues: ${parts.join(", ")}`;

  return {
    pass,
    detail,
    emptyKeys,
    placeholderKeys,
    staleKeys,
    rotatedKeys,
    totalKeys: entries.length,
    populatedKeys,
  };
}
