export function createScaledExportCanvas(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  widthPx: number,
  heightPx: number,
  crispEdges: boolean,
): HTMLCanvasElement {
  if (widthPx === sourceCanvas.width && heightPx === sourceCanvas.height) {
    return sourceCanvas as HTMLCanvasElement;
  }
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = widthPx;
  exportCanvas.height = heightPx;
  const exportCtx = exportCanvas.getContext("2d");
  if (exportCtx) {
    exportCtx.imageSmoothingEnabled = !crispEdges;
    exportCtx.imageSmoothingQuality = "high";
    exportCtx.drawImage(sourceCanvas, 0, 0, widthPx, heightPx);
  }
  return exportCanvas;
}
