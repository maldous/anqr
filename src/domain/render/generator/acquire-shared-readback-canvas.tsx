import type { CreateCanvasFn } from "./types";
import { sharedReadbackCache } from "./shared-readback-cache";
import { get2DContext } from "./get2-d-context";
import { trimSharedReadbackCache } from "./trim-shared-readback-cache";
import type { SharedReadbackEntry } from "./shared-readback-entry";
import type { SharedReadbackLease } from "./shared-readback-lease";

export async function acquireSharedReadbackCanvas(
  scaledSize: number,
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void,
): Promise<SharedReadbackLease | null> {
  const existing = sharedReadbackCache.get(scaledSize);
  const canReuseExisting =
    !!existing &&
    existing.createCanvasFn === createCanvasFn &&
    existing.releaseCanvasFn === releaseCanvasFn;
  if (canReuseExisting && existing && !existing.inUse) {
    existing.inUse = true;
    existing.lastUsedAt = Date.now();
    return {
      canvas: existing.canvas,
      ctx: existing.ctx,
      release: () => {
        existing.inUse = false;
        existing.lastUsedAt = Date.now();
      },
    };
  }
  if (existing && !canReuseExisting && !existing.inUse) {
    sharedReadbackCache.delete(scaledSize);
    existing.releaseCanvasFn?.(existing.canvas);
  }

  const canvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = get2DContext(canvas);
  if (!ctx) {
    releaseCanvasFn?.(canvas);
    return null;
  }

  if (!existing?.inUse) {
    const entry: SharedReadbackEntry = {
      canvas,
      ctx,
      createCanvasFn,
      inUse: true,
      lastUsedAt: Date.now(),
      releaseCanvasFn,
    };
    sharedReadbackCache.set(scaledSize, entry);
    trimSharedReadbackCache();
    return {
      canvas: entry.canvas,
      ctx: entry.ctx,
      release: () => {
        entry.inUse = false;
        entry.lastUsedAt = Date.now();
      },
    };
  }

  // Shared canvas for this size is busy; use a temporary canvas.
  return {
    canvas,
    ctx,
    release: () => {
      releaseCanvasFn?.(canvas);
    },
  };
}
