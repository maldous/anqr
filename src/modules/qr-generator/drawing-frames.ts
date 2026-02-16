/**
 * QR Generator Frame Drawing
 * Frame background and border drawing functions
 */

import { createLogger } from '../../lib/logger';
import { roundRect } from './drawing-primitives';
import type { QRGeneratorConfig } from './types';

const _log = createLogger('GENERATE');

/**
 * Draw frame background (sticker style)
 */
export function drawFrameBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  _moduleSize: number,
  _margin: number,
  config: QRGeneratorConfig
): void {
  if (!config.frameStyle || config.frameStyle === 'none') return;

  const frameColor = config.frameColor || config.bgColor;
  const fgColor = config.fgColor || '#000000';

  // Determine border radius based on frame style
  const defaultRadius = config.frameStyle === 'sticker' ? 12 : config.frameStyle === 'tag' ? 4 : 0;
  const borderRadius = config.frameBorderRadius ?? defaultRadius;

  ctx.fillStyle = frameColor;

  if (borderRadius > 0) {
    const radius = (borderRadius / 100) * (size / 4);
    roundRect(ctx, 0, 0, size, size, radius);
  } else {
    ctx.fillRect(0, 0, size, size);
  }

  // Draw a visible border so the frame is distinguishable even without text
  if (config.frameStyle === 'sticker' || config.frameStyle === 'tag') {
    ctx.strokeStyle = fgColor;
    ctx.lineWidth = Math.max(1, Math.round(size / 200));
    const inset = ctx.lineWidth / 2;
    ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);
  }
}

/**
 * Draw frame text and border
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  moduleSize: number,
  _margin: number,
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
  logoCanvas: HTMLCanvasElement | OffscreenCanvas,
  canvasSize: number,
  logoSizePercent: number = 20
): void {
  const logoSize = (canvasSize * logoSizePercent) / 100;
  const logoX = (canvasSize - logoSize) / 2;
  const logoY = (canvasSize - logoSize) / 2;

  // Cast to CanvasImageSource for compatibility with both HTMLCanvasElement and OffscreenCanvas
  ctx.drawImage(logoCanvas as CanvasImageSource, logoX, logoY, logoSize, logoSize);
}
