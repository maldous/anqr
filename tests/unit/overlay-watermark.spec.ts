// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

type MockCtx = {
  globalCompositeOperation: string;
  globalAlpha: number;
  font: string;
  fillStyle: any;
  textBaseline: CanvasTextBaseline;
  textAlign: CanvasTextAlign;
  drawImage: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  measureText: ReturnType<typeof vi.fn>;
  createPattern: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
};

function makeCanvas(width = 100, height = 60, withCtx = true): HTMLCanvasElement {
  const ctx: MockCtx = {
    globalCompositeOperation: 'source-over',
    globalAlpha: 1,
    font: '16px Arial',
    fillStyle: '#000',
    textBaseline: 'alphabetic',
    textAlign: 'start',
    drawImage: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
    createPattern: vi.fn(() => ({ kind: 'pattern' })),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
  };

  return {
    width,
    height,
    getContext: vi.fn(() => (withCtx ? ctx : null)),
    _ctx: ctx,
  } as any;
}

describe('overlay watermark', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeCanvas();
      return originalCreate(tag as any);
    }) as any);
  });

  it('maps blend modes to canvas composite operations', async () => {
    const mod = await import('../../src/modules/overlay/watermark');
    const ctx = makeCanvas().getContext('2d') as any;

    mod.applyWatermarkBlendMode(ctx, 'normal');
    expect(ctx.globalCompositeOperation).toBe('source-over');

    mod.applyWatermarkBlendMode(ctx, 'multiply');
    expect(ctx.globalCompositeOperation).toBe('multiply');

    mod.applyWatermarkBlendMode(ctx, 'screen');
    expect(ctx.globalCompositeOperation).toBe('screen');

    mod.applyWatermarkBlendMode(ctx, 'overlay');
    expect(ctx.globalCompositeOperation).toBe('overlay');

    mod.applyWatermarkBlendMode(ctx, 'soft-light');
    expect(ctx.globalCompositeOperation).toBe('soft-light');
  });

  it('calculates all watermark positions', async () => {
    const mod = await import('../../src/modules/overlay/watermark');

    expect(mod.calculateWatermarkPositions(100, 60, 20, 10, 'top-left', 4)).toEqual({ x: 4, y: 4 });
    expect(mod.calculateWatermarkPositions(100, 60, 20, 10, 'top-center', 4)).toEqual({ x: 40, y: 4 });
    expect(mod.calculateWatermarkPositions(100, 60, 20, 10, 'top-right', 4)).toEqual({ x: 76, y: 4 });
    expect(mod.calculateWatermarkPositions(100, 60, 20, 10, 'center-left', 4)).toEqual({ x: 4, y: 25 });
    expect(mod.calculateWatermarkPositions(100, 60, 20, 10, 'center', 4)).toEqual({ x: 40, y: 25 });
    expect(mod.calculateWatermarkPositions(100, 60, 20, 10, 'center-right', 4)).toEqual({ x: 76, y: 25 });
    expect(mod.calculateWatermarkPositions(100, 60, 20, 10, 'bottom-left', 4)).toEqual({ x: 4, y: 46 });
    expect(mod.calculateWatermarkPositions(100, 60, 20, 10, 'bottom-center', 4)).toEqual({ x: 40, y: 46 });
    expect(mod.calculateWatermarkPositions(100, 60, 20, 10, 'bottom-right', 4)).toEqual({ x: 76, y: 46 });
  });

  it('renders text and pattern watermark canvases, with missing context errors', async () => {
    const mod = await import('../../src/modules/overlay/watermark');

    const text = mod.renderTextWatermark('ANQR', '20px TestFont', 'rgba(1,2,3,0.4)');
    expect(text.width).toBeGreaterThan(0);
    expect(text.height).toBeGreaterThan(0);

    const pattern = mod.renderPatternWatermark('ANQR', '12px TestFont', 'rgba(0,0,0,0.2)', -30, 80);
    expect(pattern.width).toBeGreaterThan(0);
    expect(pattern.height).toBeGreaterThan(0);

    const originalCreate = document.createElement.bind(document);
    const badSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeCanvas(10, 10, false);
      return originalCreate(tag as any);
    }) as any);

    expect(() => mod.renderTextWatermark('x')).toThrow('Could not get 2D context');
    expect(() => mod.renderPatternWatermark('x')).toThrow('Could not get 2D context');

    badSpy.mockRestore();
  });

  it('applies text/image/pattern watermark variants and resets composition state', async () => {
    const mod = await import('../../src/modules/overlay/watermark');
    const source = makeCanvas(120, 80);

    const textRes = mod.applyWatermark(source, {
      kind: 'text',
      text: 'copyright',
      position: 'bottom-center',
      opacity: 0.3,
      blend: 'screen',
      scale: 1.1,
      padding: 6,
      font: '14px serif',
      color: 'rgba(255,0,0,0.5)',
    });
    expect(textRes.width).toBe(120);
    expect(textRes.height).toBe(80);

    const logo = makeCanvas(20, 10);
    const imageRes = mod.applyWatermark(source, {
      kind: 'image',
      image: logo,
      position: 'top-right',
      blend: 'multiply',
    });
    expect(imageRes.canvas.width).toBe(120);

    const tiledRes = mod.applyWatermark(source, {
      kind: 'pattern',
      text: 'watermark',
      tiled: true,
      blend: 'overlay',
    });
    expect(tiledRes.canvas.height).toBe(80);

    const emptyImage = mod.applyWatermark(source, { kind: 'image' });
    expect(emptyImage.width).toBe(120);

    const resultCtx = (tiledRes.canvas as any)._ctx as MockCtx;
    expect(resultCtx.globalAlpha).toBe(1);
    expect(resultCtx.globalCompositeOperation).toBe('source-over');
  });

  it('handles missing result context and applies centered logo sizing/aspect', async () => {
    const mod = await import('../../src/modules/overlay/watermark');

    const originalCreate = document.createElement.bind(document);
    const badSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeCanvas(10, 10, false);
      return originalCreate(tag as any);
    }) as any);

    expect(() => mod.applyWatermark(makeCanvas(), { kind: 'text', text: 'x' })).toThrow('Could not get 2D context');
    expect(() => mod.applyWatermarkCenterLogo(makeCanvas(), makeCanvas())).toThrow('Could not get 2D context');
    badSpy.mockRestore();

    const originalCreate2 = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeCanvas();
      return originalCreate2(tag as any);
    }) as any);

    const source = makeCanvas(200, 100);
    const logoWide = makeCanvas(300, 100);
    const centered = mod.applyWatermarkCenterLogo(source, logoWide, 30, 0.7);
    expect(centered.width).toBe(200);
    const ctx = (centered as any)._ctx as MockCtx;
    expect(ctx.drawImage).toHaveBeenCalled();

    const logoTall = makeCanvas(100, 300);
    const centeredTall = mod.applyWatermarkCenterLogo(source, logoTall, 20, 1);
    expect(centeredTall.height).toBe(100);

    expect(mod.Watermark.applyWatermark).toBe(mod.applyWatermark);
    expect(mod.Watermark.applyWatermarkCenterLogo).toBe(mod.applyWatermarkCenterLogo);
  });
});
