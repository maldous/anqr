import type { ContrastBoostFlags } from '../scaled-render-types';
import {
  PATTERN_ALIGNMENT,
  PATTERN_FIXED_DARK,
  PATTERN_FORMAT,
  PATTERN_TIMING,
  PATTERN_VERSION,
} from './pattern-flag-constants';
import { isFinderRegionFlag } from './is-finder-region-flag';

export function isScaledPatternBoostModule(flags: number, boostFlags: ContrastBoostFlags): boolean {
  return (
    (boostFlags.finderContrastBoost && isFinderRegionFlag(flags)) ||
    (boostFlags.alignmentContrastBoost && (flags & PATTERN_ALIGNMENT) !== 0) ||
    (boostFlags.timingContrastBoost && (flags & PATTERN_TIMING) !== 0) ||
    (boostFlags.formatContrastBoost && (flags & PATTERN_FORMAT) !== 0) ||
    (boostFlags.versionContrastBoost && (flags & PATTERN_VERSION) !== 0) ||
    (boostFlags.fixedDarkContrastBoost && (flags & PATTERN_FIXED_DARK) !== 0)
  );
}
