import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from "@/modules/qr-spec";
import { isSeparatorModule } from "./is-separator-module";

export function categorizeSkippedModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  skipCounts: {
    finder: number;
    separator: number;
    timing: number;
    format: number;
    version: number;
    alignment: number;
    darkModule: number;
    other: number;
  },
): void {
  if (isFinderPattern(row, col, moduleCount)) skipCounts.finder++;
  else if (isSeparatorModule(row, col, moduleCount)) skipCounts.separator++;
  else if (isTimingPattern(row, col, moduleCount)) skipCounts.timing++;
  else if (isFormatInfo(row, col, moduleCount)) skipCounts.format++;
  else if (isVersionInfo(row, col, moduleCount, version)) skipCounts.version++;
  else if (isAlignmentPattern(row, col, moduleCount, version)) skipCounts.alignment++;
  else if (row === moduleCount - 8 && col === 8) skipCounts.darkModule++;
  else skipCounts.other++;
}
