import { isAlignmentPattern, isFormatInfo, isTimingPattern, isVersionInfo } from "../qr-spec";
import { isFinderModuleOrSeparator } from "./is-finder-module-or-separator";
import { isFixedDarkModule } from "./is-fixed-dark-module";

export function isFunctionalPatternModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
): boolean {
  return (
    isFixedDarkModule(row, col, moduleCount) ||
    isFinderModuleOrSeparator(row, col, moduleCount) ||
    isTimingPattern(row, col, moduleCount) ||
    isAlignmentPattern(row, col, moduleCount, version) ||
    isFormatInfo(row, col, moduleCount) ||
    isVersionInfo(row, col, moduleCount, version)
  );
}
