import { isAlignmentPattern } from "./is-alignment-pattern";
import { isFinderPattern } from "./is-finder-pattern";
import { isFormatInfo } from "./is-format-info";
import { isQuietZoneSeparator } from "./is-quiet-zone-separator";
import { isTimingPattern } from "./is-timing-pattern";
import { isVersionInfo } from "./is-version-info";

export function isStructuralModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
): boolean {
  if (isFinderPattern(row, col, moduleCount)) return true;
  if (isTimingPattern(row, col, moduleCount)) return true;
  if (isAlignmentPattern(row, col, moduleCount, version)) return true;
  if (isFormatInfo(row, col, moduleCount)) return true;
  if (isVersionInfo(row, col, moduleCount, version)) return true;
  if (row === moduleCount - 8 && col === 8) return true;
  return isQuietZoneSeparator(row, col, moduleCount);
}
