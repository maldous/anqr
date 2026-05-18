/**
 * Returns the best available CodeBuff API key for the given cost mode.
 * Reads directly from env vars — the key pool was incorrectly rewritten
 * overnight to generate random crypto bytes instead of reading env vars.
 *
 * Primary (CODEBUFF_API_KEY): paid + free.
 * Secondary (CODEBUFF_API_KEY2/3): free only, tried first for free mode.
 *
 * @param {"paid"|"free"} [costMode]
 * @returns {string|null}
 */
export function getApiKey(costMode) {
  const primary = process.env.CODEBUFF_API_KEY || null;
  if (!primary) return null;
  if (costMode === "free") {
    return process.env.CODEBUFF_API_KEY2 || process.env.CODEBUFF_API_KEY3 || primary;
  }
  return primary;
}
