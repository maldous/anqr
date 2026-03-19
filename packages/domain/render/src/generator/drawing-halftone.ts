/**
 * QR Generator Halftone Drawing
 * Halftone pattern rendering for artistic QR effects
 */

import { createLogger } from "@/domain/logging";
import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";
import { drawHalftoneDot } from "./draw-halftone-dot";
import { parseHalftoneCell } from "./parse-halftone-cell";

const _log = createLogger("GENERATE");

/**
 * Draw a halftone-style module with size based on brightness
 * Supports configurable cell patterns (per_module or n×n grid) and dot shapes
 */
export function drawHalftoneModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  brightness: number,
  config: QRGeneratorConfig,
  moduleRow: number = 0,
  moduleCol: number = 0,
): void {
  // Legacy settings for backward compatibility
  const htDot = config.htDot ?? 0.8;
  const htCurve = config.htCurve ?? 1;

  // New configurable settings
  const gridSize = parseHalftoneCell(config.halftoneCell ?? config.htCell);
  const dotShape = config.halftoneDotShape || "circle";

  // Apply curve to brightness for non-linear dot size mapping
  const adjustedBrightness = (1 - brightness) ** htCurve;

  if (gridSize <= 1) {
    // Single dot per module (per_module mode)
    const minSize = size * 0.1;
    const maxSize = size * htDot;
    const dotSize = minSize + adjustedBrightness * (maxSize - minSize);

    // Center the dot in the cell
    const cx = x + size / 2;
    const cy = y + size / 2;

    drawHalftoneDot(ctx, cx, cy, dotSize, dotShape, moduleRow, moduleCol);
  } else {
    // Grid pattern (n×n mode) - draw multiple smaller dots
    const cellSize = size / gridSize;
    const maxDotSize = cellSize * htDot;
    const minDotSize = cellSize * 0.1;
    const dotSize = minDotSize + adjustedBrightness * (maxDotSize - minDotSize);

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cx = x + (col + 0.5) * cellSize;
        const cy = y + (row + 0.5) * cellSize;

        // Pass grid position for line rotation variation
        drawHalftoneDot(
          ctx,
          cx,
          cy,
          dotSize,
          dotShape,
          moduleRow * gridSize + row,
          moduleCol * gridSize + col,
        );
      }
    }
  }
}
