// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const calculateTemporalOffset = vi.fn(() => 0.25);
const applyTemporalNoiseToCanvas = vi.fn((canvas: unknown) => canvas);

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../src/modules/dither-algorithms', async () => {
  const actual = await vi.importActual<any>('../../src/modules/dither-algorithms');
  return {
    ...actual,
    calculateTemporalOffset,
    applyTemporalNoiseToCanvas,
  };
});

describe('animation temporal-dither wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns original canvas when mode is off', async () => {
    const mod = await import('../../src/modules/animation/temporal-dither');
    const canvas = { width: 4, height: 4 } as any;
    const out = mod.applyTemporalDither(canvas, 0, 'off', 123);
    expect(out).toBe(canvas);
    expect(calculateTemporalOffset).not.toHaveBeenCalled();
    expect(applyTemporalNoiseToCanvas).not.toHaveBeenCalled();
  });

  it('delegates to dither-algorithms for active modes', async () => {
    const mod = await import('../../src/modules/animation/temporal-dither');
    const canvas = { width: 4, height: 4 } as any;

    const out = mod.applyTemporalDither(canvas, 3, 'blue_noise', 9);
    expect(out).toBe(canvas);
    expect(calculateTemporalOffset).toHaveBeenCalledWith(3, 'blue_noise', 9);
    expect(applyTemporalNoiseToCanvas).toHaveBeenCalledWith(canvas, 0.25, 0.02);

    mod.applyTemporalDither(canvas, 1, 'flicker_safe', 2);
    expect(calculateTemporalOffset).toHaveBeenCalledWith(1, 'flicker_safe', 2);
  });
});
