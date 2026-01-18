/**
 * Watermark Module
 * Handles text and image watermarks with positioning and blending
 */

// ============================================
// TYPES
// ============================================

export type WatermarkKind = 'none' | 'text' | 'image' | 'pattern';

export type WatermarkPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'corners'
  | 'edges';

export type WatermarkBlend =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export interface WatermarkOptions {
  kind: WatermarkKind;
  text?: string;
  imageUrl?: string;
  image?: HTMLCanvasElement | HTMLImageElement | null;
  position: WatermarkPosition;
  opacity: number;
  blend: WatermarkBlend;
  scale?: number;
  rotation?: number;
  font?: string;
  fontSize?: number;
  fontColor?: string;
  padding?: number;
}

export interface WatermarkResult {
  canvas: HTMLCanvasElement;
  applied: boolean;
}

// ============================================
// BLEND MODES
// ============================================

/** Apply blend mode to composite canvas */
export function applyBlendMode(
  ctx: CanvasRenderingContext2D,
  blend: WatermarkBlend
): void {
  ctx.globalCompositeOperation = blend as GlobalCompositeOperation;
}

// ============================================
// POSITION HELPERS
// ============================================

/** Get pixel coordinates for watermark position */
export function getWatermarkPositions(
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: WatermarkPosition,
  padding: number = 10
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];

  const left = padding;
  const right = canvasWidth - watermarkWidth - padding;
  const top = padding;
  const bottom = canvasHeight - watermarkHeight - padding;
  const centerX = (canvasWidth - watermarkWidth) / 2;
  const centerY = (canvasHeight - watermarkHeight) / 2;

  switch (position) {
    case 'top-left':
      positions.push({ x: left, y: top });
      break;
    case 'top-right':
      positions.push({ x: right, y: top });
      break;
    case 'bottom-left':
      positions.push({ x: left, y: bottom });
      break;
    case 'bottom-right':
      positions.push({ x: right, y: bottom });
      break;
    case 'center':
      positions.push({ x: centerX, y: centerY });
      break;
    case 'top':
      positions.push({ x: centerX, y: top });
      break;
    case 'bottom':
      positions.push({ x: centerX, y: bottom });
      break;
    case 'left':
      positions.push({ x: left, y: centerY });
      break;
    case 'right':
      positions.push({ x: right, y: centerY });
      break;
    case 'corners':
      positions.push({ x: left, y: top });
      positions.push({ x: right, y: top });
      positions.push({ x: left, y: bottom });
      positions.push({ x: right, y: bottom });
      break;
    case 'edges':
      positions.push({ x: centerX, y: top });
      positions.push({ x: centerX, y: bottom });
      positions.push({ x: left, y: centerY });
      positions.push({ x: right, y: centerY });
      break;
  }

  return positions;
}

// ============================================
// TEXT WATERMARK
// ============================================

/** Create a text watermark canvas */
export function createTextWatermark(
  text: string,
  options: {
    font?: string;
    fontSize?: number;
    color?: string;
    opacity?: number;
  } = {}
): HTMLCanvasElement {
  const {
    font = 'Arial',
    fontSize = 24,
    color = 'rgba(255, 255, 255, 0.5)',
    opacity = 0.5,
  } = options;

  // Create canvas to measure text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.font = `${fontSize}px ${font}`;
  const metrics = ctx.measureText(text);
  const width = Math.ceil(metrics.width) + 20;
  const height = Math.ceil(fontSize * 1.5);

  canvas.width = width;
  canvas.height = height;

  // Draw text
  ctx.font = `${fontSize}px ${font}`;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  return canvas;
}

// ============================================
// PATTERN WATERMARK
// ============================================

/** Create a pattern watermark (repeating text or image) */
export function createPatternWatermark(
  element: HTMLCanvasElement | HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  options: {
    rotation?: number;
    spacing?: number;
    opacity?: number;
  } = {}
): HTMLCanvasElement {
  const { rotation = -30, spacing = 100, opacity = 0.3 } = options;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.globalAlpha = opacity;

  // Rotate for diagonal pattern
  const rad = (rotation * Math.PI) / 180;
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate(rad);
  ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

  // Calculate extended bounds for rotation
  const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
  const startX = -(diagonal - canvasWidth) / 2;
  const startY = -(diagonal - canvasHeight) / 2;

  const elemWidth = 'naturalWidth' in element ? element.naturalWidth : element.width;
  const elemHeight = 'naturalHeight' in element ? element.naturalHeight : element.height;

  // Tile the pattern
  for (let y = startY; y < diagonal; y += elemHeight + spacing) {
    for (let x = startX; x < diagonal; x += elemWidth + spacing) {
      ctx.drawImage(element, x, y);
    }
  }

  return canvas;
}

// ============================================
// CENTER LOGO
// ============================================

/** Apply a center logo to a canvas */
export function applyCenterLogo(
  targetCanvas: HTMLCanvasElement,
  logoCanvas: HTMLCanvasElement,
  maxSize: number = 0.3,
  opacity: number = 1
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = targetCanvas.width;
  result.height = targetCanvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Draw original
  ctx.drawImage(targetCanvas, 0, 0);

  // Calculate logo size
  const maxLogoSize = Math.min(targetCanvas.width, targetCanvas.height) * maxSize;
  const scale = Math.min(
    maxLogoSize / logoCanvas.width,
    maxLogoSize / logoCanvas.height
  );
  const logoWidth = logoCanvas.width * scale;
  const logoHeight = logoCanvas.height * scale;

  // Draw logo centered
  const x = (targetCanvas.width - logoWidth) / 2;
  const y = (targetCanvas.height - logoHeight) / 2;

  ctx.globalAlpha = opacity;
  ctx.drawImage(logoCanvas, x, y, logoWidth, logoHeight);
  ctx.globalAlpha = 1;

  return result;
}

// ============================================
// MAIN APPLY FUNCTION
// ============================================

/** Apply watermark to a canvas */
export async function applyWatermark(
  targetCanvas: HTMLCanvasElement,
  options: WatermarkOptions
): Promise<WatermarkResult> {
  if (options.kind === 'none') {
    return { canvas: targetCanvas, applied: false };
  }

  const result = document.createElement('canvas');
  result.width = targetCanvas.width;
  result.height = targetCanvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) {
    return { canvas: targetCanvas, applied: false };
  }

  // Draw original
  ctx.drawImage(targetCanvas, 0, 0);

  let watermarkCanvas: HTMLCanvasElement | null = null;

  if (options.kind === 'text' && options.text) {
    watermarkCanvas = createTextWatermark(options.text, {
      font: options.font,
      fontSize: options.fontSize,
      color: options.fontColor,
      opacity: options.opacity,
    });
  } else if (options.kind === 'image') {
    // Use pre-loaded image canvas if provided, otherwise load from URL
    if (options.image) {
      watermarkCanvas = document.createElement('canvas');
      const imgWidth = 'naturalWidth' in options.image ? options.image.naturalWidth : options.image.width;
      const imgHeight = 'naturalHeight' in options.image ? options.image.naturalHeight : options.image.height;
      watermarkCanvas.width = imgWidth;
      watermarkCanvas.height = imgHeight;
      const wmCtx = watermarkCanvas.getContext('2d');
      if (wmCtx) {
        wmCtx.drawImage(options.image, 0, 0);
      }
    } else if (options.imageUrl) {
      const img = await loadImage(options.imageUrl);
      watermarkCanvas = document.createElement('canvas');
      watermarkCanvas.width = img.naturalWidth;
      watermarkCanvas.height = img.naturalHeight;
      const wmCtx = watermarkCanvas.getContext('2d');
      if (wmCtx) {
        wmCtx.drawImage(img, 0, 0);
      }
    }
  } else if (options.kind === 'pattern' && options.text) {
    const textWatermark = createTextWatermark(options.text, {
      font: options.font,
      fontSize: options.fontSize,
      color: options.fontColor,
    });
    watermarkCanvas = createPatternWatermark(
      textWatermark,
      targetCanvas.width,
      targetCanvas.height,
      { rotation: options.rotation, opacity: options.opacity }
    );
  }

  if (!watermarkCanvas) {
    return { canvas: targetCanvas, applied: false };
  }

  // Apply scale if specified
  if (options.scale && options.scale !== 1) {
    const scaled = document.createElement('canvas');
    scaled.width = watermarkCanvas.width * options.scale;
    scaled.height = watermarkCanvas.height * options.scale;
    const scaledCtx = scaled.getContext('2d');
    if (scaledCtx) {
      scaledCtx.drawImage(watermarkCanvas, 0, 0, scaled.width, scaled.height);
      watermarkCanvas = scaled;
    }
  }

  // Get positions
  const positions = getWatermarkPositions(
    targetCanvas.width,
    targetCanvas.height,
    watermarkCanvas.width,
    watermarkCanvas.height,
    options.position,
    options.padding ?? 10
  );

  // Apply blend mode
  applyBlendMode(ctx, options.blend);
  ctx.globalAlpha = options.opacity;

  // Draw at each position
  for (const pos of positions) {
    if (options.rotation) {
      ctx.save();
      ctx.translate(pos.x + watermarkCanvas.width / 2, pos.y + watermarkCanvas.height / 2);
      ctx.rotate((options.rotation * Math.PI) / 180);
      ctx.drawImage(watermarkCanvas, -watermarkCanvas.width / 2, -watermarkCanvas.height / 2);
      ctx.restore();
    } else {
      ctx.drawImage(watermarkCanvas, pos.x, pos.y);
    }
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  return { canvas: result, applied: true };
}

// ============================================
// HELPERS
// ============================================

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// ============================================
// EXPORT
// ============================================

export const Watermark = {
  applyWatermark,
  applyCenterLogo,
  createTextWatermark,
  createPatternWatermark,
  getWatermarkPositions,
  applyBlendMode,
};

export default Watermark;
