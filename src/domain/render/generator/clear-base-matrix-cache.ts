import { baseMatrixCacheState } from './base-matrix-cache-state';

export function clearBaseMatrixCache(): void {
  baseMatrixCacheState.qr = null;
  baseMatrixCacheState.scaledSize = 0;
  baseMatrixCacheState.scale = 0;
  baseMatrixCacheState.result = null;
}
