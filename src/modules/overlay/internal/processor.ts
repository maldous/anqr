/**
 * Overlay Processor Module
 * Handles image loading, cropping, filter application, and blend modes
 *
 * Optimizations:
 * - Caches processed overlay data for repeated access
 * - Mobile detection for automatic performance tuning
 */

import { applyDither } from '../../dither-algorithms';
import type { DitherKind, DiffusionKernel, OrderedMatrix, ColorMode } from '../../dither-algorithms/types';
import { applyFilters, type FilterOptions } from './filters';

// Re-export types from dither-algorithms
export type { DitherKind, DiffusionKernel, OrderedMatrix, ColorMode };

// Local types
export type CropRegion = { x: number; y: number; size: number };
export type FitMode = 'cover' | 'contain' | 'stretch' | 'tile';
export type OverlayMode = 'halftone' | 'dither' | 'blend' | 'direct';
export type OverlayType = 'none' | 'image' | 'gif';

// ============================================
// TYPES
// ============================================

export interface OverlayOptions {
  url?: string;
  file?: File;
  canvas?: HTMLCanvasElement;
  fit: FitMode;
  crop?: CropRegion;
  flipX?: boolean;
  flipY?: boolean;
  rotation?: number; // 0, 90, 180, 270
  filters?: FilterOptions;
  dither?: OverlayDitherOptions;
}

export interface OverlayDitherOptions {
  kind: DitherKind;
  strength: number;
  colorMode: ColorMode;
  levels?: number;
  diffusionKernel?: DiffusionKernel;
  serpentine?: boolean;
  blueNoiseTileSize?: number;
  blueNoiseSeed?: number;
  orderedMatrix?: OrderedMatrix;
}

export interface ProcessedOverlay {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

// Default mobile-friendly dither settings
export const DEFAULT_MOBILE_DITHER: OverlayDitherOptions = {
  kind: 'blue_noise',
  strength: 100,
  colorMode: 'color',
  levels: 4,
  blueNoiseTileSize: 64,
  blueNoiseSeed: 0,
  diffusionKernel: 'floyd_steinberg',
  serpentine: true,
  orderedMatrix: 'bayer4',
};

// Default dither settings from store
export const STORE_DEFAULT_DITHER: OverlayDitherOptions = {
  kind: 'none',
  strength: 100,
  colorMode: 'color',
  levels: 4,
  diffusionKernel: 'floyd_steinberg',
  serpentine: true,
  blueNoiseTileSize: 64,
  blueNoiseSeed: 0,
  orderedMatrix: 'bayer4',
};

// ============================================
// IMAGE LOADING
// ============================================

/** Load image from file */
export async function loadImageFromFile(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/** Load image from URL */
export async function loadImageFromUrl(url: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };

    img.onerror = () => reject(new Error('Failed to load image from URL'));
    img.src = url;
  });
}

/** Load image from data URL */
export async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Failed to load image from data URL'));
    img.src = dataUrl;
  });
}

// ============================================
// IMAGE TRANSFORMATIONS
// ============================================

/** Crop image to square region */
export function cropImage(
  canvas: HTMLCanvasElement,
  crop: CropRegion,
  targetSize?: number
): HTMLCanvasElement {
  const srcWidth = canvas.width;
  const srcHeight = canvas.height;

  // Calculate crop area in pixels
  const cropX = Math.round(crop.x * srcWidth);
  const cropY = Math.round(crop.y * srcHeight);
  const cropSize = Math.round(crop.size * Math.min(srcWidth, srcHeight));

  // Output size (use crop size if not specified)
  const outSize = targetSize || cropSize;

  const result = document.createElement('canvas');
  result.width = outSize;
  result.height = outSize;

  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(canvas, cropX, cropY, cropSize, cropSize, 0, 0, outSize, outSize);

  return result;
}

/** Fit image to square canvas */
export function fitImage(
  canvas: HTMLCanvasElement,
  targetSize: number,
  mode: FitMode
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = targetSize;
  result.height = targetSize;

  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const srcAspect = canvas.width / canvas.height;
  let sx = 0,
    sy = 0,
    sw = canvas.width,
    sh = canvas.height;
  let dx = 0,
    dy = 0,
    dw = targetSize,
    dh = targetSize;

  switch (mode) {
    case 'cover': {
      // Fill entire target, crop excess
      if (srcAspect > 1) {
        // Wider than tall - crop sides
        sw = canvas.height;
        sx = (canvas.width - sw) / 2;
      } else {
        // Taller than wide - crop top/bottom
        sh = canvas.width;
        sy = (canvas.height - sh) / 2;
      }
      break;
    }

    case 'contain': {
      // Fit entire image, add letterbox
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, targetSize, targetSize);

      if (srcAspect > 1) {
        // Wider - letterbox top/bottom
        dh = targetSize / srcAspect;
        dy = (targetSize - dh) / 2;
      } else {
        // Taller - letterbox sides
        dw = targetSize * srcAspect;
        dx = (targetSize - dw) / 2;
      }
      break;
    }

    case 'stretch':
      // Just stretch to fill
      break;

    case 'tile': {
      // Tile the image
      const pattern = ctx.createPattern(canvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, targetSize, targetSize);
      }
      return result;
    }
  }

  ctx.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh);
  return result;
}

/** Rotate canvas by degrees (0, 90, 180, 270) */
export function rotateCanvas(canvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  if (normalizedDegrees === 0) return canvas;

  const result = document.createElement('canvas');
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  if (normalizedDegrees === 90 || normalizedDegrees === 270) {
    result.width = canvas.height;
    result.height = canvas.width;
  } else {
    result.width = canvas.width;
    result.height = canvas.height;
  }

  ctx.translate(result.width / 2, result.height / 2);
  ctx.rotate((normalizedDegrees * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  return result;
}

/** Flip canvas horizontally or vertically */
export function flipCanvas(
  canvas: HTMLCanvasElement,
  horizontal: boolean,
  vertical: boolean
): HTMLCanvasElement {
  if (!horizontal && !vertical) return canvas;

  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;

  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.translate(horizontal ? canvas.width : 0, vertical ? canvas.height : 0);
  ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  ctx.drawImage(canvas, 0, 0);

  return result;
}

// ============================================
// DITHERING
// ============================================

/** Get effective dither kind based on mobile detection */
export function getEffectiveDitherKind(kind: DitherKind, isMobile: boolean = false): DitherKind {
  if (!isMobile) return kind;

  // On mobile, prefer blue noise for performance
  if (kind === 'floyd_steinberg' || kind === 'atkinson' || kind === 'sierra') {
    return 'blue_noise';
  }
  return kind;
}

/** Apply dithering to overlay image */
export function ditherOverlay(
  canvas: HTMLCanvasElement,
  options: OverlayDitherOptions
): HTMLCanvasElement {
  if (options.kind === 'none') return canvas;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const result = applyDither(imageData, {
    kind: options.kind,
    strength: options.strength,
    colorMode: options.colorMode,
    levels: options.levels ?? 4,
    diffusionKernel: options.diffusionKernel ?? 'floyd_steinberg',
    serpentine: options.serpentine ?? true,
    blueNoiseTileSize: options.blueNoiseTileSize ?? 64,
    blueNoiseSeed: options.blueNoiseSeed ?? 0,
    orderedMatrix: options.orderedMatrix ?? 'bayer4',
  });

  // Convert result back to canvas
  // DitherResult has { matrix: boolean[][], colors: {r,g,b}[][] }
  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;
  const outCtx = output.getContext('2d');
  if (!outCtx) throw new Error('Could not get canvas context');

  const outData = outCtx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const color = result.colors[y]?.[x] ?? { r: 0, g: 0, b: 0 };
      outData.data[idx] = color.r;
      outData.data[idx + 1] = color.g;
      outData.data[idx + 2] = color.b;
      outData.data[idx + 3] = imageData.data[idx + 3]; // Preserve alpha
    }
  }

  outCtx.putImageData(outData, 0, 0);
  return output;
}

/** Dither overlay for QR code integration */
export function ditherOverlayForQR(
  canvas: HTMLCanvasElement,
  options: OverlayDitherOptions,
  moduleSize: number
): HTMLCanvasElement {
  // Apply standard dithering
  return ditherOverlay(canvas, options);
}

// ============================================
// OVERLAY DATA EXTRACTION
// ============================================

/** Get overlay pixel data as normalized RGB (0-1) */
export function getOverlayData(
  canvas: HTMLCanvasElement
): Array<Array<{ r: number; g: number; b: number }>> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const result: Array<Array<{ r: number; g: number; b: number }>> = [];

  for (let y = 0; y < canvas.height; y++) {
    const row: Array<{ r: number; g: number; b: number }> = [];
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      row.push({
        r: data[idx] / 255,
        g: data[idx + 1] / 255,
        b: data[idx + 2] / 255,
      });
    }
    result.push(row);
  }

  return result;
}

/** Get overlay RGB data as flat arrays */
export function getOverlayRGBData(canvas: HTMLCanvasElement): {
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
  width: number;
  height: number;
} {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const size = canvas.width * canvas.height;

  const r = new Float32Array(size);
  const g = new Float32Array(size);
  const b = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    const idx = i * 4;
    r[i] = data[idx] / 255;
    g[i] = data[idx + 1] / 255;
    b[i] = data[idx + 2] / 255;
  }

  return { r, g, b, width: canvas.width, height: canvas.height };
}

// ============================================
// OVERLAY MODE APPLICATION
// ============================================

/** Apply overlay mode to QR canvas */
export function applyOverlayMode(
  _qrCanvas: HTMLCanvasElement,
  _overlayCanvas: HTMLCanvasElement,
  _mode: OverlayMode,
  _intensity: number
): HTMLCanvasElement {
  // This is now handled in qr-generator.js
  // Keeping stub for backwards compatibility
  throw new Error('applyOverlayMode is deprecated - use qr-generator directly');
}

// ============================================
// MAIN PROCESSING FUNCTION
// ============================================

/** Process overlay with all transformations */
export async function processOverlay(
  options: OverlayOptions,
  targetSize: number
): Promise<ProcessedOverlay> {
  // Load source image
  let canvas: HTMLCanvasElement;

  if (options.canvas) {
    canvas = options.canvas;
  } else if (options.file) {
    canvas = await loadImageFromFile(options.file);
  } else if (options.url) {
    canvas = await loadImageFromUrl(options.url);
  } else {
    throw new Error('No image source provided');
  }

  const originalWidth = canvas.width;
  const originalHeight = canvas.height;

  // Apply rotation first
  if (options.rotation) {
    canvas = rotateCanvas(canvas, options.rotation);
  }

  // Apply flip
  if (options.flipX || options.flipY) {
    canvas = flipCanvas(canvas, options.flipX || false, options.flipY || false);
  }

  // Apply crop if specified
  if (options.crop && (options.crop.x !== 0 || options.crop.y !== 0 || options.crop.size !== 1)) {
    canvas = cropImage(canvas, options.crop, targetSize);
  } else {
    // Just fit to target size
    canvas = fitImage(canvas, targetSize, options.fit);
  }

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
  if (options.dither && options.dither.kind !== 'none') {
    canvas = ditherOverlay(canvas, options.dither);
  }

  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
    originalWidth,
    originalHeight,
  };
}

// ============================================
// EXPORT
// ============================================

export const OverlayProcessor = {
  // Loading
  loadImageFromFile,
  loadImageFromUrl,
  loadImageFromDataUrl,

  // Transformations
  cropImage,
  fitImage,
  rotateCanvas,
  flipCanvas,

  // Dithering
  ditherOverlay,
  ditherOverlayForQR,
  getEffectiveDitherKind,

  // Data extraction
  getOverlayData,
  getOverlayRGBData,

  // Processing
  processOverlay,
  applyOverlayMode,
};

export default OverlayProcessor;
