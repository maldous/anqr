/**
 * Watermark Module
 * Handles text and image watermarks with positioning and blending
 */

// ============================================
// TYPES
// ============================================

export type WatermarkKind = 'text' | 'image' | 'pattern';
export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
export type WatermarkBlend = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';

export interface WatermarkOptions {
  kind: WatermarkKind;
  text?: string;
  image?: HTMLCanvasElement | HTMLImageElement;
  position?: WatermarkPosition;
  opacity?: number;
  blend?: WatermarkBlend;
  scale?: number;
  padding?: number;
  font?: string;
  color?: string;
  tiled?: boolean;
}

export interface WatermarkResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

// ============================================
// BLEND MODES
// ============================================

export function applyWatermarkBlendMode(
  ctx: CanvasRenderingContext2D,
  blend: WatermarkBlend
): void {
  switch (blend) {
    case 'multiply':
      ctx.globalCompositeOperation = 'multiply';
      break;
    case 'screen':
      ctx.globalCompositeOperation = 'screen';
      break;
    case 'overlay':
      ctx.globalCompositeOperation = 'overlay';
      break;
    case 'soft-light':
      ctx.globalCompositeOperation = 'soft-light';
      break;
    default:
      ctx.globalCompositeOperation = 'source-over';
  }
}

// ============================================
// POSITION CALCULATION
// ============================================

export function calculateWatermarkPositions(
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: WatermarkPosition,
  padding: number = 10
): { x: number; y: number } {
  let x = padding;
  let y = padding;

  switch (position) {
    case 'top-left':
      break;
    case 'top-center':
      x = (canvasWidth - watermarkWidth) / 2;
      break;
    case 'top-right':
      x = canvasWidth - watermarkWidth - padding;
      break;
    case 'center-left':
      y = (canvasHeight - watermarkHeight) / 2;
      break;
    case 'center':
      x = (canvasWidth - watermarkWidth) / 2;
      y = (canvasHeight - watermarkHeight) / 2;
      break;
    case 'center-right':
      x = canvasWidth - watermarkWidth - padding;
      y = (canvasHeight - watermarkHeight) / 2;
      break;
    case 'bottom-left':
      y = canvasHeight - watermarkHeight - padding;
      break;
    case 'bottom-center':
      x = (canvasWidth - watermarkWidth) / 2;
      y = canvasHeight - watermarkHeight - padding;
      break;
    case 'bottom-right':
      x = canvasWidth - watermarkWidth - padding;
      y = canvasHeight - watermarkHeight - padding;
      break;
  }

  return { x, y };
}

// ============================================
// WATERMARK CREATION
// ============================================

export function renderTextWatermark(
  text: string,
  font: string = '16px Arial',
  color: string = 'rgba(0, 0, 0, 0.3)'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.font = font;
  const metrics = ctx.measureText(text);
  const height = parseInt(font, 10) || 16;

  canvas.width = Math.ceil(metrics.width) + 4;
  canvas.height = height + 4;

  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  ctx.fillText(text, 2, 2);

  return canvas;
}

export function renderPatternWatermark(
  text: string,
  font: string = '12px Arial',
  color: string = 'rgba(0, 0, 0, 0.1)',
  angle: number = -45,
  spacing: number = 100
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Create a pattern tile
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const _textHeight = parseInt(font, 10) || 12;

  // Calculate tile size based on angle and spacing
  const tileSize = Math.max(spacing, textWidth + 20);
  canvas.width = tileSize;
  canvas.height = tileSize;

  // Fill with transparent
  ctx.clearRect(0, 0, tileSize, tileSize);

  // Draw rotated text
  ctx.save();
  ctx.translate(tileSize / 2, tileSize / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();

  return canvas;
}

// ============================================
// MAIN WATERMARK FUNCTIONS
// ============================================

export function applyWatermark(
  sourceCanvas: HTMLCanvasElement,
  options: WatermarkOptions
): WatermarkResult {
  const {
    kind,
    text = '',
    image,
    position = 'bottom-right',
    opacity = 0.5,
    blend = 'normal',
    scale = 1,
    padding = 10,
    font = '16px Arial',
    color = 'rgba(0, 0, 0, 0.3)',
    tiled = false,
  } = options;

  const result = document.createElement('canvas');
  result.width = sourceCanvas.width;
  result.height = sourceCanvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Draw source
  ctx.drawImage(sourceCanvas, 0, 0);

  // Set up blending
  ctx.globalAlpha = opacity;
  applyWatermarkBlendMode(ctx, blend);

  let watermark: HTMLCanvasElement | HTMLImageElement | null = null;

  switch (kind) {
    case 'text':
      watermark = renderTextWatermark(text, font, color);
      break;
    case 'pattern':
      watermark = renderPatternWatermark(text, font, color);
      break;
    case 'image':
      watermark = image || null;
      break;
  }

  if (!watermark) {
    return { canvas: result, width: result.width, height: result.height };
  }

  const wmWidth = watermark.width * scale;
  const wmHeight = watermark.height * scale;

  if (tiled || kind === 'pattern') {
    // Tile the watermark
    const pattern = ctx.createPattern(watermark, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, result.width, result.height);
    }
  } else {
    // Position the watermark
    const pos = calculateWatermarkPositions(
      result.width,
      result.height,
      wmWidth,
      wmHeight,
      position,
      padding
    );
    ctx.drawImage(watermark, pos.x, pos.y, wmWidth, wmHeight);
  }

  // Reset compositing
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  return { canvas: result, width: result.width, height: result.height };
}

export function applyWatermarkCenterLogo(
  sourceCanvas: HTMLCanvasElement,
  logoCanvas: HTMLCanvasElement,
  maxSizePercent: number = 20,
  opacity: number = 1
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = sourceCanvas.width;
  result.height = sourceCanvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Draw source
  ctx.drawImage(sourceCanvas, 0, 0);

  // Calculate logo size
  const maxSize = Math.min(result.width, result.height) * (maxSizePercent / 100);
  const logoAspect = logoCanvas.width / logoCanvas.height;
  let logoWidth = maxSize;
  let logoHeight = maxSize / logoAspect;

  if (logoHeight > maxSize) {
    logoHeight = maxSize;
    logoWidth = maxSize * logoAspect;
  }

  // Center position
  const x = (result.width - logoWidth) / 2;
  const y = (result.height - logoHeight) / 2;

  // Draw logo
  ctx.globalAlpha = opacity;
  ctx.drawImage(logoCanvas, x, y, logoWidth, logoHeight);
  ctx.globalAlpha = 1;

  return result;
}

// Namespace export
export const Watermark = {
  applyWatermark,
  applyWatermarkCenterLogo,
  renderTextWatermark,
  renderPatternWatermark,
  calculateWatermarkPositions,
  applyWatermarkBlendMode,
};
