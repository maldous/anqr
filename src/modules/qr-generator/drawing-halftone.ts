/**
 * QR Generator Halftone Drawing
 * Halftone pattern rendering for artistic QR effects
 */

import type { QRGeneratorConfig } from './types';

/**
 * Draw a halftone-style module with size based on brightness
 */
export function drawHalftoneModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  brightness: number,
  config: QRGeneratorConfig
): void {
  const htDot = config.htDot ?? 0.8;
  const htCurve = config.htCurve ?? 1;
  const htCell = config.htCell ?? 1;

  // Apply curve to brightness for non-linear dot size mapping
  const adjustedBrightness = (1 - brightness) ** htCurve;

  // Calculate dot size based on brightness
  const minSize = size * 0.1;
  const maxSize = size * htDot;
  const dotSize = minSize + adjustedBrightness * (maxSize - minSize);

  // Cell multiplier affects spacing
  const cellSize = size * htCell;
  const _offset = (cellSize - size) / 2;

  // Center the dot in the cell
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.beginPath();
  ctx.arc(cx, cy, dotSize / 2, 0, Math.PI * 2);
  ctx.fill();
}
