/**
 * QR Generator Halftone Drawing
 * Halftone pattern rendering for artistic QR effects
 */

import { createLogger } from '../../lib/logger';
import type { QRGeneratorConfig } from './types';

const _log = createLogger('GENERATE');

/**
 * Parse halftone cell configuration to get grid size
 * @param cellConfig - 'per_module' or 'n×n' format like '2x2', '3x3', '4x4'
 * @returns grid size (1 for per_module, 2/3/4 for grid patterns)
 */
function parseHalftoneCell(cellConfig: number | string | undefined): number {
  if (cellConfig === undefined || cellConfig === 'per_module') return 1;
  if (typeof cellConfig === 'number') return Math.max(1, Math.round(cellConfig));
  
  // Parse 'n×n' or 'nxn' format
  const match = String(cellConfig).match(/^(\d+)[x×](\d+)$/i);
  if (match) {
    return Math.max(1, parseInt(match[1], 10));
  }
  
  return 1; // Default to single dot per module
}

/**
 * Draw a single halftone dot with the specified shape
 */
function drawHalftoneDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dotSize: number,
  shape: string | undefined,
  row: number,
  col: number
): void {
  const halfSize = dotSize / 2;
  
  switch (shape) {
    case 'square':
      // Draw a square centered at (cx, cy)
      ctx.fillRect(cx - halfSize, cy - halfSize, dotSize, dotSize);
      break;
      
    case 'line': {
      // Draw a line-based halftone (alternating 45° and -45° based on position)
      ctx.save();
      ctx.translate(cx, cy);
      // Alternate rotation based on position for visual interest
      const angle = ((row + col) % 2 === 0) ? Math.PI / 4 : -Math.PI / 4;
      ctx.rotate(angle);
      // Draw an elongated rectangle (line)
      const lineWidth = dotSize * 0.35;
      const lineLength = dotSize * 1.2;
      ctx.fillRect(-lineLength / 2, -lineWidth / 2, lineLength, lineWidth);
      ctx.restore();
      break;
    }
      
    case 'circle':
    default:
      // Draw a circle (default behavior)
      ctx.beginPath();
      ctx.arc(cx, cy, halfSize, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

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
  moduleCol: number = 0
): void {
  // Legacy settings for backward compatibility
  const htDot = config.htDot ?? 0.8;
  const htCurve = config.htCurve ?? 1;
  
  // New configurable settings
  const gridSize = parseHalftoneCell(config.halftoneCell ?? config.htCell);
  const dotShape = config.halftoneDotShape || 'circle';

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
        drawHalftoneDot(ctx, cx, cy, dotSize, dotShape, moduleRow * gridSize + row, moduleCol * gridSize + col);
      }
    }
  }
}
