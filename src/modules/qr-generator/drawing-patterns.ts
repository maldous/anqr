/**
 * QR Generator Drawing Patterns
 * Finder and alignment pattern drawing functions
 */

import type { QRGeneratorConfig } from './types';
import { roundRect, drawModule } from './drawing-primitives';

/**
 * Draw a complete finder pattern at the specified position
 */
export function drawFinderPatternComplete(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number,
  config: QRGeneratorConfig
): void {
  const outerStyle = config.eyeOuterStyle || config.finderStyle || 'square';
  const innerStyle = config.eyeInnerStyle || config.finderStyle || 'square';
  const eyeScale = config.eyeScale ?? 1;
  const fgColor = config.fgColor;
  const bgColor = config.bgColor;

  const outerSize = 7 * moduleSize;
  const middleSize = 5 * moduleSize;
  const innerSize = 3 * moduleSize;

  const scaledOuterSize = outerSize * eyeScale;
  const scaledMiddleSize = middleSize * eyeScale;
  const scaledInnerSize = innerSize * eyeScale;

  const outerOffset = (outerSize - scaledOuterSize) / 2;
  const middleOffset = moduleSize + (outerSize - scaledOuterSize) / 2;
  const innerOffset = 2 * moduleSize + (outerSize - scaledOuterSize) / 2;

  // Draw outer ring (dark)
  ctx.fillStyle = fgColor;
  drawFinderRing(ctx, x + outerOffset, y + outerOffset, scaledOuterSize, outerStyle);

  // Draw middle ring (light/background)
  ctx.fillStyle = bgColor;
  const middleRingSize = scaledMiddleSize;
  const middleRingOffset = (scaledOuterSize - middleRingSize) / 2;
  drawFinderRing(ctx, x + outerOffset + middleRingOffset, y + outerOffset + middleRingOffset, middleRingSize, outerStyle);

  // Draw inner dot (dark)
  ctx.fillStyle = fgColor;
  const innerDotSize = scaledInnerSize;
  const innerDotOffset = (scaledOuterSize - innerDotSize) / 2;
  drawFinderRing(ctx, x + outerOffset + innerDotOffset, y + outerOffset + innerDotOffset, innerDotSize, innerStyle);
}

/**
 * Draw a finder ring with the specified style
 */
function drawFinderRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string
): void {
  switch (style) {
    case 'rounded': {
      const radius = size * 0.2;
      roundRect(ctx, x, y, size, size, radius);
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'square':
    default:
      ctx.fillRect(x, y, size, size);
      break;
  }
}

/**
 * Draw an alignment pattern at the specified center position
 */
export function drawAlignmentPattern(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  moduleSize: number,
  style: string,
  config: QRGeneratorConfig
): void {
  const fgColor = config.fgColor;
  const bgColor = config.bgColor;

  // Alignment pattern is 5x5 modules
  const outerSize = 5 * moduleSize;
  const middleSize = 3 * moduleSize;
  const innerSize = 1 * moduleSize;

  const effectiveStyle = style === 'match_finder' ? (config.finderStyle || 'square') : style;

  // Outer ring (dark)
  ctx.fillStyle = fgColor;
  drawAlignmentRing(ctx, centerX - outerSize / 2, centerY - outerSize / 2, outerSize, effectiveStyle);

  // Middle ring (light)
  ctx.fillStyle = bgColor;
  drawAlignmentRing(ctx, centerX - middleSize / 2, centerY - middleSize / 2, middleSize, effectiveStyle);

  // Inner dot (dark)
  ctx.fillStyle = fgColor;
  drawAlignmentRing(ctx, centerX - innerSize / 2, centerY - innerSize / 2, innerSize, effectiveStyle);
}

/**
 * Draw an alignment ring with the specified style
 */
function drawAlignmentRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string
): void {
  switch (style) {
    case 'rounded': {
      const radius = size * 0.15;
      roundRect(ctx, x, y, size, size, radius);
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'square':
    default:
      ctx.fillRect(x, y, size, size);
      break;
  }
}

/**
 * Draw a timing pattern module
 */
export function drawTimingModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string,
  config: QRGeneratorConfig
): void {
  if (style === 'match_module') {
    drawModule(ctx, x, y, size, config.moduleStyle || 'square', {
      cornerRadius: config.cornerRadius || 0,
    });
  } else if (style === 'dashed') {
    // Draw dashed timing module
    const dashSize = size * 0.7;
    const offset = (size - dashSize) / 2;
    ctx.fillRect(x + offset, y + offset, dashSize, dashSize);
  } else {
    // Default: solid square
    ctx.fillRect(x, y, size, size);
  }
}
