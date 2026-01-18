/**
 * QR Generator Frame Drawing
 * Frame background and border drawing functions
 */

import type { QRGeneratorConfig } from './types';
import { roundRect } from './drawing-primitives';

/**
 * Draw frame background (sticker style)
 */
export function drawFrameBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  moduleSize: number,
  margin: number,
  config: QRGeneratorConfig
): void {
  if (!config.frameStyle || config.frameStyle === 'none') return;

  const frameColor = config.frameColor || config.bgColor;
  const borderRadius = config.frameBorderRadius ?? 0;

  ctx.fillStyle = frameColor;

  if (borderRadius > 0) {
    const radius = (borderRadius / 100) * (size / 4);
    roundRect(ctx, 0, 0, size, size, radius);
  } else {
    ctx.fillRect(0, 0, size, size);
  }
}

/**
 * Draw frame text and border
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  moduleSize: number,
  margin: number,
  config: QRGeneratorConfig
): void {
  if (!config.frameStyle || config.frameStyle === 'none') return;
  if (!config.frameText) return;

  const textColor = config.frameTextColor || config.fgColor;
  const frameHeight = moduleSize * 4;
  const textY = size - frameHeight / 2;

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate font size based on frame height
  const fontSize = Math.max(12, frameHeight * 0.5);
  ctx.font = `${fontSize}px sans-serif`;

  ctx.fillText(config.frameText, size / 2, textY);
}

/**
 * Draw center logo over the QR code
 */
export function drawCenterLogo(
  ctx: CanvasRenderingContext2D,
  logoCanvas: HTMLCanvasElement,
  canvasSize: number,
  logoSizePercent: number = 20
): void {
  const logoSize = (canvasSize * logoSizePercent) / 100;
  const logoX = (canvasSize - logoSize) / 2;
  const logoY = (canvasSize - logoSize) / 2;

  ctx.drawImage(logoCanvas, logoX, logoY, logoSize, logoSize);
}
