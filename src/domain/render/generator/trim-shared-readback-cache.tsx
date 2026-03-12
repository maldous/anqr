import { MAX_SHARED_READBACK_CANVASES } from './max-shared-readback-canvases';
import { sharedReadbackCache } from './shared-readback-cache';

export function trimSharedReadbackCache(): void {
  if (sharedReadbackCache.size <= MAX_SHARED_READBACK_CANVASES) return;
  const entries = [...sharedReadbackCache.entries()]
    .filter(([, entry]) => !entry.inUse)
    .sort((a, b) => a[1].lastUsedAt - b[1].lastUsedAt);
  while (sharedReadbackCache.size > MAX_SHARED_READBACK_CANVASES && entries.length > 0) {
    const [size, entry] = entries.shift()!;
    sharedReadbackCache.delete(size);
    entry.releaseCanvasFn?.(entry.canvas);
  }
}
