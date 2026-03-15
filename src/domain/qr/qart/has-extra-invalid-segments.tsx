import type { DecodedSegmentInfo } from '../decode';

export function hasExtraInvalidSegments(segments: DecodedSegmentInfo[]): boolean {
  return segments.some((seg, idx) => {
    if (idx === 0) return false;
    if (seg.modeName === 'terminator') return false;
    return !seg.valid || seg.modeName === 'unknown';
  });
}
