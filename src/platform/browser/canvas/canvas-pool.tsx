import type { CanvasFactory } from './canvas-factory.types';

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
    const key = `${width}x${height}`;
    const bucket = this.pool.get(key);
    if (bucket?.length) {
      const canvas = bucket.pop()!;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        if ('filter' in ctx) ctx.filter = 'none';
        ctx.clearRect(0, 0, width, height);
      }
      return canvas;
    }
    return this.factory.createCanvas(width, height);
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
