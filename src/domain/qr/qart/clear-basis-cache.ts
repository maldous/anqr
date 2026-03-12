import { basisCache } from './rs-basis._internal';

/**
 * Clear the basis cache
 */
export function clearBasisCache(): void {
  basisCache.clear();
}
