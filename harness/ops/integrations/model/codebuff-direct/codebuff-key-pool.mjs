// ── CodeBuff API Key Pool ──────────────────────────────────────────────
// Manages up to 3 CODEBUFF_API_KEY variants with automatic rotation.
//
// Key 1 (CODEBUFF_API_KEY):   paid + free — primary key for all modes.
// Key 2 (CODEBUFF_API_KEY2):  free only  — secondary free-tier key.
// Key 3 (CODEBUFF_API_KEY3):  free only  — tertiary free-tier key.
//
// Free models have per-key usage limits. Cycling through keys maximizes
// utilization of the best available free models (e.g. DeepSeek V4 Pro,
// Kimi K2.6, MiniMax M2.7 in FreeBuff mode).
//
// When a key is rate-limited (429, insufficient credits, etc.), it enters
// a cooldown period. Subsequent getCodebuffApiKey() calls skip cooled-down
// keys and return the next available one.

const KEY_COOLDOWN_MS = 90_000; // 90-second cooldown after rate-limit or credit exhaustion

const keyCooldowns = new Map(); // apiKey (string) → cooldownEnd (epoch ms)
let lastReturnedKey = null; // tracks the last key returned by getCodebuffApiKey

function loadKeyPool(costMode) {
  const pool = [];

  // Primary key: always available for any mode
  const primary = process.env.CODEBUFF_API_KEY;
  if (primary) {
    pool.push({ key: primary, label: "primary", paid: true, free: true });
  }

  // Free-only keys: only relevant when costMode is "free"
  if (costMode === "free") {
    const k2 = process.env.CODEBUFF_API_KEY2;
    if (k2) {
      pool.push({ key: k2, label: "free2", paid: false, free: true });
    }
    const k3 = process.env.CODEBUFF_API_KEY3;
    if (k3) {
      pool.push({ key: k3, label: "free3", paid: false, free: true });
    }
  }

  return pool;
}

/**
 * Returns the best available API key for the given cost mode.
 * Skips keys in cooldown. Falls back to the primary key if all are exhausted.
 *
 * @param {"paid"|"free"} costMode
 * @returns {string|null}
 */
export function getCodebuffApiKey(costMode = "paid") {
  const pool = loadKeyPool(costMode);
  if (pool.length === 0) return null;

  const now = Date.now();

  // Find first non-cooled-down key matching the cost mode
  for (const entry of pool) {
    const cooldownEnd = keyCooldowns.get(entry.key);
    if (cooldownEnd && cooldownEnd > now) continue; // still cooling down

    // For paid mode, only use keys that support paid
    if (costMode !== "free" && !entry.paid) continue;

    lastReturnedKey = entry.key;
    return entry.key;
  }

  // All keys are in cooldown — return the primary as last resort
  const fallback = pool[0]?.key || null;
  lastReturnedKey = fallback;
  return fallback;
}

/**
 * Marks the LAST key returned by getCodebuffApiKey as exhausted.
 * Call this when a CodeBuff request fails with rate-limit or credit exhaustion.
 * The key will be skipped for KEY_COOLDOWN_MS.
 *
 * This always marks the key that was ACTUALLY used with the SDK (tracked
 * via lastReturnedKey), NOT the env-var key from the provider definition.
 */
export function markCodebuffKeyExhausted() {
  const targetKey = lastReturnedKey;
  if (!targetKey) return;
  keyCooldowns.set(targetKey, Date.now() + KEY_COOLDOWN_MS);
}

/**
 * Immediately clears the cooldown on the last returned key.
 *
 * @param {string} [apiKey]
 */
export function clearCodebuffKeyCooldown(apiKey) {
  const targetKey = apiKey || lastReturnedKey;
  if (targetKey) keyCooldowns.delete(targetKey);
}

