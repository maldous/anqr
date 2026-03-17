export function flipOverlayCanvas(
  source: HTMLCanvasElement,
  horizontal: boolean,
  vertical: boolean,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  ctx.translate(horizontal ? source.width : 0, vertical ? source.height : 0);
  ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  ctx.drawImage(source, 0, 0);

  return canvas;
}
