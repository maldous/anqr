import { type ECCLevel } from './bit-mapping';
import { buildFullBasis } from './build-full-basis';
import type { RSBasis } from './rs-basis.types';

/**
 * Get cached basis or build new one
 * @deprecated Use buildFullBasis directly with dataLength for content protection
 */
export function getCachedBasis(version: number, ecc: ECCLevel): RSBasis {
  return buildFullBasis(version, ecc);
}
