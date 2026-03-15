export function renderPatternWatermark(
  text: string,
  font: string = '12px Arial',
  color: string = 'rgba(0, 0, 0, 0.1)',
  angle: number = -45,
  spacing: number = 100
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Create a pattern tile
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const _textHeight = Number.parseInt(font, 10) || 12;

  // Calculate tile size based on angle and spacing
  const tileSize = Math.max(spacing, textWidth + 20);
  canvas.width = tileSize;
  canvas.height = tileSize;

  // Fill with transparent
  ctx.clearRect(0, 0, tileSize, tileSize);

  // Draw rotated text
  ctx.save();
  ctx.translate(tileSize / 2, tileSize / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();

  return canvas;
}
