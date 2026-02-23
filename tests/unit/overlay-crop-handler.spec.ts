// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

type Ctx = {
  scale: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  rect: ReturnType<typeof vi.fn>;
  clip: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
};

function createCtx(): Ctx {
  return {
    scale: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    save: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    restore: vi.fn(),
    strokeRect: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#fff',
    lineWidth: 1,
  };
}

describe('overlay crop-handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    class MockImage {
      width = 400;
      height = 200;
      crossOrigin = '';
      onload: null | (() => void) = null;
      set src(_v: string) {
        this.onload?.();
      }
    }
    (globalThis as any).Image = MockImage;

    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') {
        const canvas = originalCreate('canvas') as HTMLCanvasElement;
        const ctx = createCtx();
        (canvas as any)._ctx = ctx;
        vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as any);
        vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
          left: 0,
          top: 0,
          width: 300,
          height: 200,
          right: 300,
          bottom: 200,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as any);
        return canvas;
      }
      return originalCreate(tag as any);
    }) as any);
  });

  it('initializes, loads image, draws, and updates region via API', async () => {
    const mod = await import('../../src/modules/overlay/crop-handler');

    const container = document.createElement('div');
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 300,
      height: 200,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as any);

    const onCropChange = vi.fn();
    const handler = new mod.CropHandler({
      container,
      imageUrl: 'https://example.com/image.png',
      initialRegion: { x: 10, y: 20, size: 80 },
      minSize: 40,
      onCropChange,
    });

    expect(container.querySelector('canvas')).not.toBeNull();
    expect(handler.getRegion()).toEqual({ x: 10, y: 20, size: 80 });

    handler.setRegion({ x: 5, y: 6, size: 70 });
    expect(handler.getRegion()).toEqual({ x: 5, y: 6, size: 70 });

    const canvas = container.querySelector('canvas') as any;
    const ctx = canvas._ctx as Ctx;
    expect(ctx.scale).toHaveBeenCalled();
    expect(ctx.drawImage).toHaveBeenCalled();

    handler.destroy();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('handles dragging, resizing, cursor states, and mouse up reset', async () => {
    const mod = await import('../../src/modules/overlay/crop-handler');
    const container = document.createElement('div');
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 300,
      height: 200,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as any);

    const onCropChange = vi.fn();
    const handler = new mod.CropHandler({
      container,
      imageUrl: 'x',
      initialRegion: { x: 10, y: 10, size: 80 },
      onCropChange,
    });

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;

    // Drag inside crop
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 20, clientY: 40 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 80 }));
    const afterDrag = handler.getRegion();
    expect(afterDrag.x).toBeGreaterThan(10);
    expect(afterDrag.y).toBeGreaterThan(10);
    expect(onCropChange).toHaveBeenCalled();

    canvas.dispatchEvent(new MouseEvent('mouseup'));

    // Resize at bottom-right handle
    const scale = (handler as any).scale as number;
    const offsetX = (handler as any).offsetX as number;
    const offsetY = (handler as any).offsetY as number;
    const reg = handler.getRegion();
    const handleX = offsetX + (reg.x + reg.size) * scale - 1;
    const handleY = offsetY + (reg.y + reg.size) * scale - 1;

    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: handleX, clientY: handleY }));
    canvas.dispatchEvent(
      new MouseEvent('mousemove', { clientX: handleX + 40, clientY: handleY + 30 })
    );
    const afterResize = handler.getRegion();
    expect(afterResize.size).toBeGreaterThanOrEqual(reg.size);

    // Cursor updates
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 1 }));
    expect(canvas.style.cursor).toMatch(/crosshair|move|nwse-resize/);

    canvas.dispatchEvent(new MouseEvent('mouseleave'));
    expect((handler as any).isDragging).toBe(false);
    expect((handler as any).isResizing).toBe(false);
  });

  it('handles touch proxy methods, no-image move guard, and constructor context failure', async () => {
    const mod = await import('../../src/modules/overlay/crop-handler');

    const container = document.createElement('div');
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 300,
      height: 200,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as any);

    const handler = new mod.CropHandler({
      container,
      imageUrl: 'x',
      initialRegion: { x: 0, y: 0, size: 90 },
    });

    const preventDefault = vi.fn();
    (handler as any).handleTouchStart({ touches: [{ clientX: 10, clientY: 10 }] });
    (handler as any).handleTouchMove({ touches: [{ clientX: 20, clientY: 20 }], preventDefault });
    (handler as any).handleTouchEnd();
    expect(preventDefault).toHaveBeenCalled();

    // no image guard path
    (handler as any).image = null;
    (handler as any).isDragging = true;
    const before = handler.getRegion();
    (handler as any).handleMouseMove(new MouseEvent('mousemove', { clientX: 40, clientY: 40 }));
    expect(handler.getRegion()).toEqual(before);

    // constructor failure path when getContext is null
    const realCreateCanvas = document.createElementNS.bind(
      document,
      'http://www.w3.org/1999/xhtml'
    );
    const badCreate = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') {
        const c = realCreateCanvas('canvas') as HTMLCanvasElement;
        vi.spyOn(c, 'getContext').mockReturnValue(null);
        return c;
      }
      return realCreateCanvas(tag as any);
    }) as any);

    expect(() => new mod.CropHandler({ container, imageUrl: 'z' })).toThrow(
      'Could not get 2D context'
    );
    badCreate.mockRestore();
  });
});
