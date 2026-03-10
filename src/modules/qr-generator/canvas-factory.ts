/**
 * Canvas Factory Module
 * Provides environment-agnostic canvas creation
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('GENERATE');
const MIN_CANVAS_DIMENSION = 1;

type Resettable2DContext = {
  setTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  globalCompositeOperation: string;
  globalAlpha: number;
  imageSmoothingEnabled: boolean;
  imageSmoothingQuality?: ImageSmoothingQuality;
  filter?: string;
  clearRect: (x: number, y: number, w: number, h: number) => void;
};

function normalizeCanvasDimension(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_CANVAS_DIMENSION;
  }
  return Math.max(MIN_CANVAS_DIMENSION, Math.round(value));
}

export function normalizeCanvasDimensions(
  width: number,
  height: number
): { width: number; height: number } {
  return {
    width: normalizeCanvasDimension(width),
    height: normalizeCanvasDimension(height),
  };
}

export function resetCanvas2DState(ctx: Resettable2DContext, width: number, height: number): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = false;
  if ('imageSmoothingQuality' in ctx && ctx.imageSmoothingQuality !== undefined) {
    ctx.imageSmoothingQuality = 'low';
  }
  if ('filter' in ctx && typeof ctx.filter === 'string') {
    ctx.filter = 'none';
  }
  ctx.clearRect(0, 0, width, height);
}

/**
 * Canvas factory interface for environment-agnostic canvas creation.
 * Allows QRGenerator to work in both browser and Node.js (Netlify functions).
 */
export interface CanvasFactory {
  createCanvas(width: number, height: number): Promise<HTMLCanvasElement | OffscreenCanvas>;
  loadImage?(src: string): Promise<HTMLImageElement>;
}

/**
 * Default browser canvas factory - uses DOM APIs
 * Exported for reference/extension by custom factories
 */
export const defaultBrowserCanvasFactory: CanvasFactory = {
  createCanvas: (width: number, height: number): Promise<HTMLCanvasElement> => {
    const normalized = normalizeCanvasDimensions(width, height);
    const canvas = document.createElement('canvas');
    canvas.width = normalized.width;
    canvas.height = normalized.height;
    const ctx = canvas.getContext('2d') as Resettable2DContext | null;
    if (ctx) {
      resetCanvas2DState(ctx, normalized.width, normalized.height);
    }
    return Promise.resolve(canvas);
  },
  loadImage: (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  },
};

/**
 * Canvas pool for reusing native canvas objects across render calls.
 * @napi-rs/canvas has no dispose() method, so V8's GC cannot reclaim native
 * memory effectively. This pool keeps released canvases available for reuse,
 * dramatically reducing native memory allocations during multi-attempt
 * scan gate loops and animated frame generation.
 */
export class CanvasPool {
  private readonly pool = new Map<string, (HTMLCanvasElement | OffscreenCanvas)[]>();
  private readonly factory: CanvasFactory;

  constructor(factory: CanvasFactory) {
    this.factory = factory;
  }

  async acquire(width: number, height: number): Promise<HTMLCanvasElement | OffscreenCanvas> {
    const normalized = normalizeCanvasDimensions(width, height);
    const key = `${normalized.width}x${normalized.height}`;
    const bucket = this.pool.get(key);
    if (bucket?.length) {
      const canvas = bucket.pop()!;
      const ctx = canvas.getContext('2d') as Resettable2DContext | null;
      if (ctx) {
        resetCanvas2DState(ctx, normalized.width, normalized.height);
      }
      return canvas;
    }
    return this.factory.createCanvas(normalized.width, normalized.height);
  }

  release(canvas: HTMLCanvasElement | OffscreenCanvas): void {
    const key = `${canvas.width}x${canvas.height}`;
    let bucket = this.pool.get(key);
    if (!bucket) {
      bucket = [];
      this.pool.set(key, bucket);
    }
    bucket.push(canvas);
  }

  clear(): void {
    this.pool.clear();
  }

  get size(): number {
    let count = 0;
    for (const bucket of this.pool.values()) count += bucket.length;
    return count;
  }
}
