import type { Canvas2DContext } from "./canvas-2d-context.types";

export function getCanvas2DContext(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options?: CanvasRenderingContext2DSettings,
): Canvas2DContext | null {
  return (
    (canvas.getContext("2d", options) as Canvas2DContext | null) ??
    (canvas.getContext("2d") as Canvas2DContext | null)
  );
}
