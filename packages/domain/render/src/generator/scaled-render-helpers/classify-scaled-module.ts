import {
  isAlignmentPattern as isAlignmentPatternSpec,
  isFinderPattern as isFinderPatternSpec,
  isFormatInfo as isFormatInfoSpec,
  isTimingPattern as isTimingPatternSpec,
  isVersionInfo as isVersionInfoSpec,
} from "../../qr-spec";
import {
  PATTERN_ALIGNMENT,
  PATTERN_FIXED_DARK,
  PATTERN_FINDER,
  PATTERN_FINDER_SEPARATOR,
  PATTERN_FORMAT,
  PATTERN_TIMING,
  PATTERN_VERSION,
} from "./pattern-flag-constants";
import { isDarkModule } from "./is-dark-module";
import { isFinderSeparator } from "./is-finder-separator";

export function classifyScaledModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
): number {
  let flags = 0;
  if (isFinderPatternSpec(row, col, moduleCount)) flags |= PATTERN_FINDER;
  if (isFinderSeparator(row, col, moduleCount)) flags |= PATTERN_FINDER_SEPARATOR;
  if (isTimingPatternSpec(row, col, moduleCount)) flags |= PATTERN_TIMING;
  if (isAlignmentPatternSpec(row, col, moduleCount, version)) flags |= PATTERN_ALIGNMENT;
  if (isFormatInfoSpec(row, col, moduleCount)) flags |= PATTERN_FORMAT;
  if (isVersionInfoSpec(row, col, moduleCount, version)) flags |= PATTERN_VERSION;
  if (isDarkModule(row, col, moduleCount)) flags |= PATTERN_FIXED_DARK;
  return flags;
}
