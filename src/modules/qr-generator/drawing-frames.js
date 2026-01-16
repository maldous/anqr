/**
 * QR Generator Drawing Frames
 * Frame drawing functions: frame background, frame borders, center logo
 */

import { roundRect } from './drawing-primitives.js';

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
