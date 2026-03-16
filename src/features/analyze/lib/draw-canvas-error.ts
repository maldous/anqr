export function drawCanvasError(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  bgColor: string,
  textColor: string,
  lines: string[],
) {
  canvas.width = 200;
  canvas.height = 200;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = textColor;
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  lines.forEach((line, i) => ctx.fillText(line, 100, 80 + i * 20));
}
