export function getBitsPerGroup(groupDigits: number): number {
  return groupDigits === 3 ? 10 : groupDigits === 2 ? 7 : 4;
}
