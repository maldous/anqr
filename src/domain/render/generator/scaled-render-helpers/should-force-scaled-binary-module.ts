import type { ScaledPreserveFlags } from '../scaled-render-types';
import {
  PATTERN_ALIGNMENT,
  PATTERN_FIXED_DARK,
  PATTERN_FORMAT,
  PATTERN_TIMING,
  PATTERN_VERSION,
} from './pattern-flag-constants';
import { isFinderRegionFlag } from './is-finder-region-flag';

export function shouldForceScaledBinaryModule(
  flags: number,
  preserveFlags: ScaledPreserveFlags
): boolean {
  if (flags === 0) return false;
  if ((flags & PATTERN_FIXED_DARK) !== 0) return preserveFlags.preserveFixedDark;
  if (isFinderRegionFlag(flags)) return preserveFlags.preserveFinders;
  if ((flags & PATTERN_TIMING) !== 0) return preserveFlags.preserveTiming;
  if ((flags & PATTERN_ALIGNMENT) !== 0) return preserveFlags.preserveAlignment;
  if ((flags & PATTERN_FORMAT) !== 0) return preserveFlags.protectFormat;
  if ((flags & PATTERN_VERSION) !== 0) return preserveFlags.protectVersion;
  return false;
}
