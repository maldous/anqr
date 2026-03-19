import { createHashCanvas } from "./create-hash-canvas";
import { sharedHashCanvasInUseState } from "./shared-hash-canvas-in-use-state";
import { sharedHashCanvasState } from "./shared-hash-canvas-state";

export async function acquireHashCanvas(
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>,
): Promise<{ canvas: HTMLCanvasElement | OffscreenCanvas; release: () => void }> {
  sharedHashCanvasState.current ??= await createHashCanvas(createCanvasFn);

  if (!sharedHashCanvasInUseState.current) {
    sharedHashCanvasInUseState.current = true;
    return {
      canvas: sharedHashCanvasState.current,
      release: () => {
        sharedHashCanvasInUseState.current = false;
      },
    };
  }

  const fallbackCanvas = await createHashCanvas(createCanvasFn);
  return { canvas: fallbackCanvas, release: () => {} };
}
