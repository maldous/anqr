export function rotateOverlayCanvas(source: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const newWidth = Math.round(source.width * cos + source.height * sin);
  const newHeight = Math.round(source.width * sin + source.height * cos);

  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return canvas;
}
