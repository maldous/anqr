export function markInvalidGroups(
  currentValues: number[],
  groupMax: number[],
  groupCount: number,
  invalid: Uint8Array,
): number {
  let count = 0;
  for (let g = 0; g < groupCount; g++) {
    const bad = currentValues[g] > (groupMax[g] ?? 0);
    invalid[g] = bad ? 1 : 0;
    if (bad) count++;
  }
  return count;
}
