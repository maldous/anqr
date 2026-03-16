import { getSharedHashCanvas, setSharedHashCanvas } from "./shared-hash-canvas";
import { getSharedHashCanvasInUse, setSharedHashCanvasInUse } from "./shared-hash-canvas-in-use";
import { createHashCanvas } from "./create-hash-canvas";

export async function acquireHashCanvas(
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>,
): Promise<{ canvas: HTMLCanvasElement | OffscreenCanvas; release: () => void }> {
  if (!getSharedHashCanvas()) {
    setSharedHashCanvas(await createHashCanvas(createCanvasFn));
  }

  if (!getSharedHashCanvasInUse()) {
    setSharedHashCanvasInUse(true);
    return {
      canvas: getSharedHashCanvas()!,
      release: () => {
        setSharedHashCanvasInUse(false);
      },
    };
  }

  const fallbackCanvas = await createHashCanvas(createCanvasFn);
  return { canvas: fallbackCanvas, release: () => {} };
}
