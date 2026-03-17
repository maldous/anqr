import { isFinderRegionFlag } from "./is-finder-region-flag";
import {
  PATTERN_ALIGNMENT,
  PATTERN_FIXED_DARK,
  PATTERN_FORMAT,
  PATTERN_TIMING,
  PATTERN_VERSION,
} from "./pattern-flag-constants";

export function isStructuralPatternModule(flags: number): boolean {
  return (
    isFinderRegionFlag(flags) ||
    (flags & PATTERN_ALIGNMENT) !== 0 ||
    (flags & PATTERN_TIMING) !== 0 ||
    (flags & PATTERN_FORMAT) !== 0 ||
    (flags & PATTERN_VERSION) !== 0 ||
    (flags & PATTERN_FIXED_DARK) !== 0
  );
}
