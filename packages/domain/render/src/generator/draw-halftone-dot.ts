export function drawHalftoneDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dotSize: number,
  shape: string | undefined,
  row: number,
  col: number,
): void {
  const halfSize = dotSize / 2;

  switch (shape) {
    case "square":
      ctx.fillRect(cx - halfSize, cy - halfSize, dotSize, dotSize);
      break;

    case "line": {
      ctx.save();
      ctx.translate(cx, cy);
      const angle = (row + col) % 2 === 0 ? Math.PI / 4 : -Math.PI / 4;
      ctx.rotate(angle);
      const lineWidth = dotSize * 0.35;
      const lineLength = dotSize * 1.2;
      ctx.fillRect(-lineLength / 2, -lineWidth / 2, lineLength, lineWidth);
      ctx.restore();
      break;
    }
    default:
      ctx.beginPath();
      ctx.arc(cx, cy, halfSize, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}
