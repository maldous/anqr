/**
 * QR Generator Drawing Module
 * All drawing methods for modules, finder patterns, alignment patterns, frames, etc.
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

/**
 * Draw frame background (sticker) BEFORE QR modules
 * This must be called before drawing QR content so the background is behind
 */
export function drawFrameBackground(ctx, size, moduleSize, margin, config) {
  const frameStyle = config.frameStyle;
  if (frameStyle !== 'sticker') return;

  const frameText = config.frameText || '';
  const qrSize = size - margin * 2 * moduleSize - (frameText ? moduleSize * 4 : 0);
  const qrStart = margin * moduleSize;

  ctx.save();

  // Draw sticker-style background with shadow
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = moduleSize * 2;
  ctx.shadowOffsetX = moduleSize * 0.5;
  ctx.shadowOffsetY = moduleSize * 0.5;

  ctx.fillStyle = config.bgColor;
  const stickerPadding = moduleSize * 1.5;
  roundRect(
    ctx,
    qrStart - stickerPadding,
    qrStart - stickerPadding,
    qrSize + stickerPadding * 2,
    qrSize + stickerPadding * 2 + (frameText ? moduleSize * 4 : 0),
    moduleSize * 3
  );
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.restore();
}

/**
 * Draw a decorative frame around the QR code
 * For sticker style, only draws the text (background is drawn by drawFrameBackground)
 */
export function drawFrame(ctx, size, moduleSize, margin, config) {
  const frameStyle = config.frameStyle;
  if (!frameStyle || frameStyle === 'none') return;

  const frameText = config.frameText || '';
  const qrSize = size - margin * 2 * moduleSize - (frameText ? moduleSize * 4 : 0);
  const qrStart = margin * moduleSize;

  ctx.save();

  switch (frameStyle) {
    case 'rounded_frame': {
      // Draw rounded rectangle frame around QR
      ctx.strokeStyle = config.fgColor;
      ctx.lineWidth = moduleSize * 0.5;
      const frameMargin = moduleSize;
      roundRect(
        ctx,
        qrStart - frameMargin,
        qrStart - frameMargin,
        qrSize + frameMargin * 2,
        qrSize + frameMargin * 2 + (frameText ? moduleSize * 3 : 0),
        moduleSize * 2
      );
      ctx.stroke();
      break;
    }

    case 'sticker': {
      // Background is already drawn by drawFrameBackground
      // Only text is drawn here (after QR modules)
      break;
    }

    case 'tag': {
      // Draw tag-style frame with pointed end
      ctx.fillStyle = config.fgColor;
      const tagPadding = moduleSize;
      const tagWidth = qrSize + tagPadding * 2;
      const tagHeight = qrSize + tagPadding * 2 + (frameText ? moduleSize * 4 : 0);
      const tagX = qrStart - tagPadding;
      const tagY = qrStart - tagPadding;

      ctx.beginPath();
      ctx.moveTo(tagX + moduleSize, tagY);
      ctx.lineTo(tagX + tagWidth - moduleSize, tagY);
      ctx.quadraticCurveTo(tagX + tagWidth, tagY, tagX + tagWidth, tagY + moduleSize);
      ctx.lineTo(tagX + tagWidth, tagY + tagHeight - moduleSize);
      ctx.quadraticCurveTo(
        tagX + tagWidth,
        tagY + tagHeight,
        tagX + tagWidth - moduleSize,
        tagY + tagHeight
      );
      ctx.lineTo(tagX + moduleSize, tagY + tagHeight);
      ctx.quadraticCurveTo(tagX, tagY + tagHeight, tagX, tagY + tagHeight - moduleSize);
      ctx.lineTo(tagX, tagY + moduleSize);
      ctx.quadraticCurveTo(tagX, tagY, tagX + moduleSize, tagY);
      ctx.closePath();
      ctx.stroke();
      break;
    }
  }

  // Draw frame text if provided
  if (frameText) {
    ctx.fillStyle = config.fgColor;
    ctx.font = `bold ${moduleSize * 2}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const textY = qrStart + qrSize + moduleSize * 1.5;
    ctx.fillText(frameText, size / 2, textY);
  }

  ctx.restore();
}

/**
 * Draw center logo overlay
 */
export function drawCenterLogo(ctx, logoCanvas, canvasSize, logoSizePercent) {
  const logoSize = canvasSize * (logoSizePercent / 100);
  const x = (canvasSize - logoSize) / 2;
  const y = (canvasSize - logoSize) / 2;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);

  ctx.drawImage(logoCanvas, x, y, logoSize, logoSize);
}

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
