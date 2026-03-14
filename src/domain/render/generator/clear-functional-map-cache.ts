import { setFunctionalMapCache } from './functional-map-cache';

export function clearFunctionalMapCache(): void {
  setFunctionalMapCache(0, 0, null);
}
