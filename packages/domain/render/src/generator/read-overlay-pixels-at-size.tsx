import type { CreateCanvasFn } from "./types";
import { get2DContext } from "./get2-d-context";
import { acquireSharedReadbackCanvas } from "./acquire-shared-readback-canvas";

export async function readOverlayPixelsAtSize(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  scaledSize: number,
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void,
): Promise<Uint8ClampedArray | null> {
  if (overlayCanvas.width === scaledSize && overlayCanvas.height === scaledSize) {
    const directCtx = get2DContext(overlayCanvas);
    if (directCtx) {
      return directCtx.getImageData(0, 0, scaledSize, scaledSize).data;
    }
  }

  const lease = await acquireSharedReadbackCanvas(scaledSize, createCanvasFn, releaseCanvasFn);
  if (!lease) return null;
  try {
    lease.ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
    return lease.ctx.getImageData(0, 0, scaledSize, scaledSize).data;
  } finally {
    lease.release();
  }
}
