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

describe('core utilities', () => {
  beforeEach(() => {
    vi.doUnmock('../../src/modules/core/color');
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('checks contrast AA/AAA and adjusts foreground when needed', async () => {
    const contrast = await import('../../src/modules/core/contrast');

    expect(contrast.meetsContrastAA('#000000', '#ffffff')).toBe(true);
    expect(contrast.meetsContrastAAA('#000000', '#ffffff')).toBe(true);
    expect(contrast.meetsContrastAA('#777777', '#888888')).toBe(false);

    const adjusted = contrast.adjustForContrast('#777777', '#ffffff', 7);
    expect(adjusted.startsWith('hsl(') || adjusted === '#777777').toBe(true);

    const alreadyGood = contrast.adjustForContrast('#000000', '#ffffff', 4.5);
    expect(alreadyGood).toBe('#000000');
  });

  it('covers contrast null parse branches with mocked color parser', async () => {
    vi.resetModules();
    vi.doMock('../../src/modules/core/color', async () => {
      const actual = await vi.importActual<any>('../../src/modules/core/color');
      return {
        ...actual,
        parseColor: vi.fn(() => null),
        getContrastRatio: vi.fn(() => 1),
      };
    });

    const contrast = await import('../../src/modules/core/contrast');
    expect(contrast.meetsContrastAA('x', 'y')).toBe(false);
    expect(contrast.meetsContrastAAA('x', 'y')).toBe(false);
    expect(contrast.adjustForContrast('bad', 'bad', 4.5)).toBe('bad');
  });

  it('interpolates gradients and creates css gradients', async () => {
    const gradient = await import('../../src/modules/core/gradient');

    expect(gradient.getGradientColor({ type: 'linear', stops: [] }, 0.5)).toEqual({
      r: 0,
      g: 0,
      b: 0,
    });
    expect(
      gradient.getGradientColor({ type: 'linear', stops: [{ pos: 0, color: '#ff0000' }] }, 0.5)
    ).toMatchObject({
      r: 255,
      g: 0,
      b: 0,
    });

    const mid = gradient.getGradientColor(
      {
        type: 'linear',
        stops: [
          { pos: 0, color: '#000000' },
          { pos: 1, color: '#ffffff' },
        ],
      },
      0.5
    );
    expect(mid.r).toBeGreaterThan(120);
    expect(mid.r).toBeLessThan(136);

    const at = gradient.getGradientColorAt(
      [
        { pos: 0, color: '#000000' },
        { pos: 1, color: '#ffffff' },
      ],
      0.25
    );
    expect(at.r).toBeGreaterThan(50);

    expect(gradient.createCssGradient({ type: 'none', stops: [] })).toBe('transparent');
    expect(
      gradient.createCssGradient({
        type: 'linear',
        angle: 45,
        stops: [
          { pos: 0, color: '#000' },
          { pos: 1, color: '#fff' },
        ],
      })
    ).toContain('linear-gradient(45deg');
    expect(
      gradient.createCssGradient({ type: 'radial', stops: [{ pos: 0, color: '#000' }] })
    ).toContain('radial-gradient');
    expect(
      gradient.createCssGradient({ type: 'conic', angle: 90, stops: [{ pos: 0, color: '#000' }] })
    ).toContain('conic-gradient(from 90deg');
  });

  it('generates harmonious color palettes and invalid parse fallback', async () => {
    const harmony = await import('../../src/modules/core/harmony');

    expect(harmony.getComplementary('#ff0000')).toContain('rgb(');
    const analogous = harmony.getAnalogous('#00ff00', 20);
    expect(analogous[0]).toContain('rgb(');
    expect(analogous[1]).toContain('rgb(');

    const triadic = harmony.getTriadic('#0000ff');
    expect(triadic[0]).toContain('rgb(');
    expect(triadic[1]).toContain('rgb(');

    vi.resetModules();
    vi.doMock('../../src/modules/core/color', async () => {
      const actual = await vi.importActual<any>('../../src/modules/core/color');
      return {
        ...actual,
        parseColor: vi.fn(() => null),
      };
    });
    const harmonyFallback = await import('../../src/modules/core/harmony');
    expect(harmonyFallback.getComplementary('bad')).toBe('bad');
    expect(harmonyFallback.getAnalogous('bad')).toEqual(['bad', 'bad']);
    expect(harmonyFallback.getTriadic('bad')).toEqual(['bad', 'bad']);
  });
});
