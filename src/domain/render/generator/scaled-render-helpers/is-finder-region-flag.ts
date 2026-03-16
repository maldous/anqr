import { PATTERN_FINDER, PATTERN_FINDER_SEPARATOR } from "./pattern-flag-constants";

export function isFinderRegionFlag(flags: number): boolean {
  return (flags & (PATTERN_FINDER | PATTERN_FINDER_SEPARATOR)) !== 0;
}
