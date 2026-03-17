export function getBitsPerGroup(groupDigits: number): number {
  if (groupDigits === 3) return 10;
  if (groupDigits === 2) return 7;
  return 4;
}
