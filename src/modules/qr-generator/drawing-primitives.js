/**
 * QR Generator Drawing Primitives
 * Basic shape drawing functions: roundRect, drawModule, drawFinderModule
 */

/**
 * Draw a rounded rectangle path
 */
export function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw a single module with support for style, corner radius, and rotation
 */
export function drawModule(ctx, x, y, size, style, options = {}) {
  const { cornerRadius = 0, rotation = 0 } = options;
  const padding = size * 0.05;
  const innerSize = size - padding * 2;

  // Calculate corner radius based on percentage
  const radiusPercent = cornerRadius / 100;
  const maxRadius = innerSize / 2;
  const actualRadius = maxRadius * radiusPercent;

  ctx.save();

  // Apply rotation around center if specified
  if (rotation !== 0) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  switch (style) {
    case 'rounded': {
      // Use cornerRadius if specified, otherwise default rounded
      const roundedRadius = actualRadius > 0 ? actualRadius : size * 0.3;
      roundRect(ctx, x + padding, y + padding, innerSize, innerSize, roundedRadius);
      ctx.fill();
      break;
    }

    case 'dots':
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, innerSize / 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + padding);
      ctx.lineTo(x + size - padding, y + size / 2);
      ctx.lineTo(x + size / 2, y + size - padding);
      ctx.lineTo(x + padding, y + size / 2);
      ctx.closePath();
      ctx.fill();
      break;

    case 'connected':
      // Draw full rectangle with no gaps for connected look
      if (actualRadius > 0) {
        roundRect(ctx, x, y, size, size, actualRadius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, size, size);
      }
      break;
    default:
      if (actualRadius > 0) {
        roundRect(ctx, x + padding, y + padding, innerSize, innerSize, actualRadius);
        ctx.fill();
      } else {
        ctx.fillRect(x + padding, y + padding, innerSize, innerSize);
      }
      break;
  }

  ctx.restore();
}

/**
 * Draw a single finder pattern module
 */
export function drawFinderModule(ctx, x, y, size, style, cornerRadius = 0) {
  const radiusPercent = cornerRadius / 100;
  const maxRadius = size / 2;
  const actualRadius = maxRadius * radiusPercent;

  switch (style) {
    case 'rounded': {
      const roundedRadius = actualRadius > 0 ? actualRadius : size * 0.2;
      roundRect(ctx, x, y, size, size, roundedRadius);
      ctx.fill();
      break;
    }

    case 'circle':
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      if (actualRadius > 0) {
        roundRect(ctx, x, y, size, size, actualRadius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, size, size);
      }
      break;
  }
}
