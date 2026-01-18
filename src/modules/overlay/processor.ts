/**
 * Overlay Processor Module
 * Handles image loading, cropping, filter application, and overlay modes
 */

import type { DitherKind as DitherAlgKind, DiffusionKernel, OrderedMatrix } from '../dither-algorithms';
import { applyDither } from '../dither-algorithms';
import { applyFilters, copyImageData, type FilterOptions } from './filters';

// Re-export types from dither-algorithms for convenience
export type DitherKind = DitherAlgKind;
export type { DiffusionKernel, OrderedMatrix };

// ============================================
// TYPES
// ============================================

export type FitMode = 'contain' | 'cover' | 'fill' | 'none';
export type OverlayMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light';
export type OverlayType = 'static' | 'animated';

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OverlayOptions {
  fitMode?: FitMode;
  crop?: CropRegion;
  rotation?: number;
  flipX?: boolean;
  flipY?: boolean;
  filters?: FilterOptions;
  dither?: OverlayDitherOptions;
}

export interface OverlayDitherOptions {
  enabled?: boolean;
  kind?: DitherKind;
  strength?: number;
  kernel?: DiffusionKernel;
  matrix?: OrderedMatrix;
  levels?: number;
  serpentine?: boolean;
}

export interface ProcessedOverlay {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_MOBILE_DITHER: OverlayDitherOptions = {
  enabled: true,
  kind: 'floyd_steinberg',
  strength: 0.8,
  levels: 4,
  serpentine: true,
};

export const STORE_DEFAULT_DITHER: OverlayDitherOptions = {
  enabled: false,
  kind: 'none',
  strength: 1.0,
  levels: 2,
  serpentine: false,
};

// ============================================
// IMAGE LOADING
// ============================================

export function loadImageFromFile(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function loadImageFromUrl(url: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2D context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Failed to load image from URL'));
    img.src = url;
  });
}

export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLCanvasElement> {
  return loadImageFromUrl(dataUrl);
}

// ============================================
// IMAGE TRANSFORMATION
// ============================================

export function cropImage(
  source: HTMLCanvasElement,
  region: CropRegion
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = region.width;
  canvas.height = region.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.drawImage(
    source,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    region.width,
    region.height
  );

  return canvas;
}

export function fitImage(
  source: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  mode: FitMode
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  const sourceAspect = source.width / source.height;
  const targetAspect = targetWidth / targetHeight;

  let drawX = 0;
  let drawY = 0;
  let drawWidth = targetWidth;
  let drawHeight = targetHeight;

  switch (mode) {
    case 'contain': {
      if (sourceAspect > targetAspect) {
        drawHeight = targetWidth / sourceAspect;
        drawY = (targetHeight - drawHeight) / 2;
      } else {
        drawWidth = targetHeight * sourceAspect;
        drawX = (targetWidth - drawWidth) / 2;
      }
      break;
    }
    case 'cover': {
      if (sourceAspect > targetAspect) {
        drawWidth = targetHeight * sourceAspect;
        drawX = (targetWidth - drawWidth) / 2;
      } else {
        drawHeight = targetWidth / sourceAspect;
        drawY = (targetHeight - drawHeight) / 2;
      }
      break;
    }
    case 'none': {
      drawWidth = source.width;
      drawHeight = source.height;
      drawX = (targetWidth - drawWidth) / 2;
      drawY = (targetHeight - drawHeight) / 2;
      break;
    }
    // 'fill' uses the default values (stretch to fill)
  }

  ctx.drawImage(source, drawX, drawY, drawWidth, drawHeight);
  return canvas;
}

export function rotateCanvas(
  source: HTMLCanvasElement,
  degrees: number
): HTMLCanvasElement {
  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const newWidth = Math.round(source.width * cos + source.height * sin);
  const newHeight = Math.round(source.width * sin + source.height * cos);

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return canvas;
}

export function flipCanvas(
  source: HTMLCanvasElement,
  horizontal: boolean,
  vertical: boolean
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.translate(
    horizontal ? source.width : 0,
    vertical ? source.height : 0
  );
  ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  ctx.drawImage(source, 0, 0);

  return canvas;
}

// ============================================
// DITHERING
// ============================================

export function getEffectiveDitherKind(options?: OverlayDitherOptions): DitherKind {
  if (!options?.enabled) return 'none';
  return options.kind ?? 'floyd_steinberg';
}

export function ditherOverlay(
  imageData: ImageData,
  options: OverlayDitherOptions
): ImageData {
  if (!options.enabled || options.kind === 'none') {
    return imageData;
  }

  const result = applyDither(imageData, {
    kind: options.kind ?? 'floyd_steinberg',
    strength: options.strength ?? 1.0,
    levels: options.levels ?? 2,
    serpentine: options.serpentine ?? false,
    colorMode: 'color',
    diffusionKernel: options.kernel,
    orderedMatrix: options.matrix,
  });

  // Convert DitherResult back to ImageData
  const { width, height } = imageData;
  const outputData = new Uint8ClampedArray(width * height * 4);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const color = result.colors[y]?.[x];
      if (color) {
        outputData[i] = color.r;
        outputData[i + 1] = color.g;
        outputData[i + 2] = color.b;
        outputData[i + 3] = imageData.data[i + 3]; // Preserve alpha
      } else {
        // Fallback: copy original
        outputData[i] = imageData.data[i];
        outputData[i + 1] = imageData.data[i + 1];
        outputData[i + 2] = imageData.data[i + 2];
        outputData[i + 3] = imageData.data[i + 3];
      }
    }
  }

  return new ImageData(outputData, width, height);
}

export function ditherOverlayForQR(
  source: HTMLCanvasElement,
  options: OverlayDitherOptions
): HTMLCanvasElement {
  if (!options.enabled || options.kind === 'none') {
    return source;
  }

  const ctx = source.getContext('2d');
  if (!ctx) return source;

  const imageData = ctx.getImageData(0, 0, source.width, source.height);
  const dithered = ditherOverlay(imageData, options);

  const result = document.createElement('canvas');
  result.width = source.width;
  result.height = source.height;
  const resultCtx = result.getContext('2d');
  if (!resultCtx) return source;

  resultCtx.putImageData(dithered, 0, 0);
  return result;
}

// ============================================
// OVERLAY DATA EXTRACTION
// ============================================

export function getOverlayData(
  canvas: HTMLCanvasElement,
  targetSize: number
): Float32Array {
  // Resize to target size for module-level data
  const resized = fitImage(canvas, targetSize, targetSize, 'cover');
  const ctx = resized.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const data = imageData.data;
  const brightness = new Float32Array(targetSize * targetSize);

  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale brightness (0-1)
    brightness[i / 4] =
      (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
  }

  return brightness;
}

export function getOverlayRGBData(
  canvas: HTMLCanvasElement,
  targetSize: number
): { r: Float32Array; g: Float32Array; b: Float32Array } {
  const resized = fitImage(canvas, targetSize, targetSize, 'cover');
  const ctx = resized.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const data = imageData.data;
  const size = targetSize * targetSize;

  const r = new Float32Array(size);
  const g = new Float32Array(size);
  const b = new Float32Array(size);

  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    r[idx] = data[i] / 255;
    g[idx] = data[i + 1] / 255;
    b[idx] = data[i + 2] / 255;
  }

  return { r, g, b };
}

// ============================================
// OVERLAY MODE APPLICATION
// ============================================

export function applyOverlayMode(
  baseCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  mode: OverlayMode,
  opacity: number = 1
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = baseCanvas.width;
  result.height = baseCanvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Draw base
  ctx.drawImage(baseCanvas, 0, 0);

  // Set blend mode
  switch (mode) {
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
    case 'hard-light':
      ctx.globalCompositeOperation = 'hard-light';
      break;
    default:
      ctx.globalCompositeOperation = 'source-over';
  }

  // Draw overlay with opacity
  ctx.globalAlpha = opacity;
  ctx.drawImage(overlayCanvas, 0, 0, result.width, result.height);

  // Reset
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  return result;
}

// ============================================
// MAIN PROCESSOR FUNCTION
// ============================================

export function processOverlay(
  source: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  options: OverlayOptions = {}
): ProcessedOverlay {
  let canvas = source;
  const originalWidth = source.width;
  const originalHeight = source.height;

  // Apply crop first
  if (options.crop) {
    canvas = cropImage(canvas, options.crop);
  }

  // Apply rotation
  if (options.rotation && options.rotation !== 0) {
    canvas = rotateCanvas(canvas, options.rotation);
  }

  // Apply flip
  if (options.flipX || options.flipY) {
    canvas = flipCanvas(canvas, !!options.flipX, !!options.flipY);
  }

  // Fit to target size
  canvas = fitImage(canvas, targetWidth, targetHeight, options.fitMode ?? 'cover');

  // Apply filters
  if (options.filters) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const filtered = applyFilters(imageData, options.filters);
      ctx.putImageData(filtered, 0, 0);
    }
  }

  // Apply dithering
  if (options.dither?.enabled) {
    canvas = ditherOverlayForQR(canvas, options.dither);
  }

  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
    originalWidth,
    originalHeight,
  };
}
