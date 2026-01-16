/**
 * QR Generator Drawing Gradients
 * Gradient fill creation for QR rendering
 */

/**
 * Create a gradient fill style based on config
 */
export function createGradientFill(ctx, config, size) {
  if (!config.gradient || config.gradient.type === 'none') {
    return config.fgColor;
  }

  const { type, stops, centerX = 0.5, centerY = 0.5 } = config.gradient;
  const angle = config.gradient.angle || 0;
  let gradient;

  switch (type) {
    case 'linear': {
      // Convert angle to start/end points
      const angleRad = (angle * Math.PI) / 180;
      const x1 = size / 2 - (Math.cos(angleRad) * size) / 2;
      const y1 = size / 2 - (Math.sin(angleRad) * size) / 2;
      const x2 = size / 2 + (Math.cos(angleRad) * size) / 2;
      const y2 = size / 2 + (Math.sin(angleRad) * size) / 2;
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      break;
    }
    case 'radial': {
      const cx = size * (centerX || 0.5);
      const cy = size * (centerY || 0.5);
      const radius = size * 0.7;
      gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      break;
    }
    case 'conic': {
      // Canvas doesn't have native conic gradient, simulate with radial
      const cx = size * (centerX || 0.5);
      const cy = size * (centerY || 0.5);
      gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.7);
      break;
    }
    default:
      return config.fgColor;
  }

  // Add color stops
  if (stops && stops.length > 0) {
    for (const stop of stops) {
      gradient.addColorStop(stop.pos, stop.color);
    }
  } else {
    // Default gradient from fgColor to a lighter version
    gradient.addColorStop(0, config.fgColor);
    gradient.addColorStop(1, config.bgColor);
  }

  return gradient;
}
