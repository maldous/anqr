// ============================================================================
// NUMERIC SUFFIX SAFETY FILTER (greedy, preserves numeric validity)
// ============================================================================

export function getNumericBitsCount(digits: number): number {
  const fullGroups = Math.floor(digits / 3);
  const rem = digits % 3;
  return fullGroups * 10 + (rem === 1 ? 4 : rem === 2 ? 7 : 0);
}
