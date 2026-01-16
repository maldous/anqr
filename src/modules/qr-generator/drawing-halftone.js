/**
 * QR Generator Drawing Halftone
 * Halftone rendering for modules
 */

/**
 * Apply halftone rendering to a module
 */
export function drawHalftoneModule(ctx, x, y, size, brightness, config) {
  // halftoneCell setting determines rendering scope (per_module is default)
  const htDot = config.halftoneDotShape || 'circle';
  const htCurve = config.brightnessCurve || 'linear';

  // Apply brightness curve
  let adjustedBrightness = brightness;
  switch (htCurve) {
    case 's-curve':
      adjustedBrightness = brightness * brightness * (3 - 2 * brightness);
      break;
    case 'gamma':
      adjustedBrightness = brightness ** 2.2;
      break;
    default: // linear
      break;
  }

  // Calculate dot size based on brightness (darker = larger dot)
  const minSize = 0.2;
  const maxSize = 1;
  const dotSizeRatio = minSize + (1 - adjustedBrightness) * (maxSize - minSize);
  const dotSize = size * dotSizeRatio;
  const offset = (size - dotSize) / 2;

  const centerX = x + size / 2;
  const centerY = y + size / 2;

  switch (htDot) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(centerX, centerY, dotSize / 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'square':
      ctx.fillRect(x + offset, y + offset, dotSize, dotSize);
      break;

    case 'line': {
      // Draw a line that varies in thickness
      const lineWidth = dotSize * 0.8;
      ctx.fillRect(x, y + (size - lineWidth) / 2, size, lineWidth);
      break;
    }

    case 'diamond': {
      ctx.beginPath();
      ctx.moveTo(centerX, y + offset);
      ctx.lineTo(x + size - offset, centerY);
      ctx.lineTo(centerX, y + size - offset);
      ctx.lineTo(x + offset, centerY);
      ctx.closePath();
      ctx.fill();
      break;
    }
    // default case uses identical logic to 'circle' - fall through
  }
}
