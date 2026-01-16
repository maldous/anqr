/**
 * QR Generator Drawing Patterns
 * Pattern drawing functions: finder patterns, alignment patterns, timing patterns
 */

import { drawFinderModule, drawModule } from './drawing-primitives.js';

/**
 * Draw a complete finder pattern (eye) with outer and inner styles
 */
export function drawFinderPatternComplete(ctx, centerX, centerY, moduleSize, config) {
  const outerStyle = config.eyeOuterStyle || config.finderStyle || 'square';
  const innerStyle = config.eyeInnerStyle || config.finderStyle || 'square';
  const scale = (config.eyeScale || 100) / 100;
  const cornerRadius = config.cornerRadius || 0;

  // Finder pattern is 7x7 modules
  // Outer: 7x7, Middle (white): 5x5, Inner: 3x3
  const outerSize = 7 * moduleSize * scale;
  const middleSize = 5 * moduleSize * scale;
  const innerSize = 3 * moduleSize * scale;

  const outerOffset = (7 * moduleSize - outerSize) / 2;
  const x = centerX + outerOffset;
  const y = centerY + outerOffset;

  // Draw outer (dark)
  ctx.fillStyle = config.fgColor;
  drawFinderModule(ctx, x, y, outerSize, outerStyle, cornerRadius);

  // Draw middle (light/background)
  ctx.fillStyle = config.bgColor;
  const middleOffset = (outerSize - middleSize) / 2;
  drawFinderModule(
    ctx,
    x + middleOffset,
    y + middleOffset,
    middleSize,
    outerStyle,
    cornerRadius
  );

  // Draw inner (dark)
  ctx.fillStyle = config.fgColor;
  const innerOffset = (outerSize - innerSize) / 2;
  drawFinderModule(
    ctx,
    x + innerOffset,
    y + innerOffset,
    innerSize,
    innerStyle,
    cornerRadius
  );
}

/**
 * Draw an alignment pattern with specified style
 */
export function drawAlignmentPattern(ctx, centerX, centerY, moduleSize, style, config) {
  const cornerRadius = config.cornerRadius || 0;

  // Alignment pattern is 5x5 modules
  // Outer: 5x5, Middle (white): 3x3, Inner: 1x1
  const outerSize = 5 * moduleSize;
  const middleSize = 3 * moduleSize;
  const innerSize = 1 * moduleSize;

  const x = centerX - outerSize / 2;
  const y = centerY - outerSize / 2;

  // Use the specified style or match finder style
  const effectiveStyle = style === 'match_finder' ? config.finderStyle || 'square' : style;

  // Draw outer (dark)
  ctx.fillStyle = config.fgColor;
  drawFinderModule(ctx, x, y, outerSize, effectiveStyle, cornerRadius);

  // Draw middle (light/background)
  ctx.fillStyle = config.bgColor;
  const middleX = centerX - middleSize / 2;
  const middleY = centerY - middleSize / 2;
  drawFinderModule(ctx, middleX, middleY, middleSize, effectiveStyle, cornerRadius);

  // Draw inner (dark)
  ctx.fillStyle = config.fgColor;
  const innerX = centerX - innerSize / 2;
  const innerY = centerY - innerSize / 2;
  drawFinderModule(ctx, innerX, innerY, innerSize, effectiveStyle, cornerRadius);
}

/**
 * Draw timing pattern with specified style
 */
export function drawTimingModule(ctx, x, y, size, style, config) {
  const cornerRadius = config.cornerRadius || 0;

  // Use the specified style or match module style
  const effectiveStyle = style === 'match_module' ? config.moduleStyle || 'square' : style;

  switch (effectiveStyle) {
    case 'solid':
      ctx.fillRect(x, y, size, size);
      break;
    case 'dashed': {
      // Draw a smaller centered rectangle for dashed look
      const dashSize = size * 0.7;
      const offset = (size - dashSize) / 2;
      ctx.fillRect(x + offset, y + offset, dashSize, dashSize);
      break;
    }
    default:
      // Use regular module drawing
      drawModule(ctx, x, y, size, effectiveStyle, { cornerRadius });
  }
}
