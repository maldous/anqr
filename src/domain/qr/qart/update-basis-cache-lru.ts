import type { RSBasis } from './rs-basis.types';
import { BASIS_CACHE_LIMIT } from './basis-cache-limit';
import { basisCache } from './basis-cache';

export function updateBasisCacheLru(key: string, basis: RSBasis): void {
  basisCache.delete(key);
  basisCache.set(key, basis);
  if (basisCache.size <= BASIS_CACHE_LIMIT) return;
  const oldestKey = basisCache.keys().next().value;
  if (oldestKey !== undefined) {
    basisCache.delete(oldestKey);
  }
}
