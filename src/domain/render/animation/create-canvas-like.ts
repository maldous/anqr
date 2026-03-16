export function createCanvasLike(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  targetCanvas?: HTMLCanvasElement | OffscreenCanvas,
): HTMLCanvasElement | OffscreenCanvas {
  if (targetCanvas) {
    if (targetCanvas.width !== sourceCanvas.width) targetCanvas.width = sourceCanvas.width;
    if (targetCanvas.height !== sourceCanvas.height) targetCanvas.height = sourceCanvas.height;
    return targetCanvas;
  }

  if (
    typeof OffscreenCanvas !== "undefined" &&
    sourceCanvas instanceof OffscreenCanvas &&
    typeof sourceCanvas.width === "number"
  ) {
    return new OffscreenCanvas(sourceCanvas.width, sourceCanvas.height);
  }

  const result = document.createElement("canvas");
  result.width = sourceCanvas.width;
  result.height = sourceCanvas.height;
  return result;
}
