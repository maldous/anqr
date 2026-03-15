import type { DarkModuleReader } from './verify.types';

export function isFinderCoreCorrect(
  isDark: DarkModuleReader['isDark'],
  baseRow: number,
  baseCol: number
): boolean {
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const expectedDark =
        row === 0 ||
        row === 6 ||
        col === 0 ||
        col === 6 ||
        (row >= 2 && row <= 4 && col >= 2 && col <= 4);
      if (isDark(baseRow + row, baseCol + col) !== expectedDark) return false;
    }
  }
  return true;
}
