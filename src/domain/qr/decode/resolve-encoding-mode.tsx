import type { DecodedEncodingMode } from './decode.types';

export function resolveEncodingMode(modesSeen: Set<DecodedEncodingMode>): DecodedEncodingMode {
  if (modesSeen.size === 1) return modesSeen.values().next().value!;
  if (modesSeen.size > 1) return 'mixed';
  return 'unknown';
}
