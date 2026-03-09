import { describe, expect, it } from 'vitest';

import { CanvasPool, type CanvasFactory } from '../../src/modules/qr-generator/canvas-factory';

type MockCtx = {
  setTransform: (...args: number[]) => void;
  globalCompositeOperation: string;
  globalAlpha: number;
  imageSmoothingEnabled: boolean;
  imageSmoothingQuality: ImageSmoothingQuality;
  filter: string;
  clearRect: (x: number, y: number, width: number, height: number) => void;
};

type MockCanvas = {
  width: number;
  height: number;
  getContext: (kind: '2d') => MockCtx | null;
};

function makeCanvas(width: number, height: number): { canvas: MockCanvas; ctx: MockCtx } {
  const ctx: MockCtx = {
    setTransform: () => {},
    globalCompositeOperation: 'multiply',
    globalAlpha: 0.42,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    filter: 'blur(2px)',
    clearRect: () => {},
  };

  const canvas: MockCanvas = {
    width,
    height,
    getContext: () => ctx,
  };

  return { canvas, ctx };
}

describe('CanvasPool', () => {
  it('resets smoothing and paint state when reusing a pooled canvas', async () => {
    const created: Array<{ canvas: MockCanvas; ctx: MockCtx }> = [];
    const factory: CanvasFactory = {
      createCanvas: async (width: number, height: number) => {
        const pair = makeCanvas(width, height);
        created.push(pair);
        return pair.canvas as unknown as HTMLCanvasElement;
      },
    };

    const pool = new CanvasPool(factory);

    const first = (await pool.acquire(64, 64)) as unknown as MockCanvas;
    const firstCtx = first.getContext('2d');
    expect(firstCtx).toBeTruthy();
    if (!firstCtx) throw new Error('expected context');

    firstCtx.imageSmoothingEnabled = true;
    firstCtx.imageSmoothingQuality = 'high';
    firstCtx.globalCompositeOperation = 'screen';
    firstCtx.globalAlpha = 0.25;
    firstCtx.filter = 'contrast(120%)';

    pool.release(first as unknown as HTMLCanvasElement);
    const reused = (await pool.acquire(64, 64)) as unknown as MockCanvas;
    const reusedCtx = reused.getContext('2d');
    expect(reusedCtx).toBeTruthy();
    if (!reusedCtx) throw new Error('expected reused context');

    expect(reused).toBe(first);
    expect(created).toHaveLength(1);
    expect(reusedCtx.imageSmoothingEnabled).toBe(false);
    expect(reusedCtx.imageSmoothingQuality).toBe('low');
    expect(reusedCtx.globalCompositeOperation).toBe('source-over');
    expect(reusedCtx.globalAlpha).toBe(1);
    expect(reusedCtx.filter).toBe('none');
  });
});
