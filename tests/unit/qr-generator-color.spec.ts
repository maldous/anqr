import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

describe('qr-generator color', () => {
  beforeEach(() => {
    vi.doUnmock('../../src/modules/core');
    vi.doUnmock('../../src/modules/qr-generator/utils');
    vi.resetModules();
  });

  it('darkens/lightens color and applies per-module color modes', async () => {
    const mod = await import('../../src/modules/qr-generator/color');

    expect(mod.darkenColor('#808080', 0.5)).toBe('rgb(64,64,64)');
    expect(mod.lightenColor('#000000', 0.5)).toBe('rgb(128,128,128)');

    const overlayData: any = {
      0: [0.2, 0.8],
      colors: [[{ r: 10, g: 20, b: 30 }, { r: 200, g: 100, b: 50 }]],
    };
    const cfg: any = { overlayIntensity: 50 };

    expect(mod.applyPerModuleColor('by_brightness', '#336699', overlayData, 0, 0, 21, cfg)).toContain('rgb(');
    expect(mod.applyPerModuleColor('by_position', '#336699', overlayData, 0, 1, 21, cfg)).toContain('rgb(');
    expect(mod.applyPerModuleColor('by_overlay', '#336699', overlayData, 0, 1, 21, cfg)).toMatch(/^(#|rgb)/);
    expect(mod.applyPerModuleColor('by_overlay', '#336699', { colors: [[]] } as any, 0, 1, 21, cfg)).toBe('#336699');
    expect(mod.applyPerModuleColor('by_cluster', '#336699', overlayData, 4, 7, 21, cfg)).toContain('rgb(');
    expect(mod.applyPerModuleColor('unknown', '#336699', overlayData, 0, 0, 21, cfg)).toBe('#336699');
  });

  it('ensures contrast for satisfied, dark-bg, and light-bg paths', async () => {
    vi.doMock('../../src/modules/qr-generator/utils', () => ({
      getContrastRatio: vi
        .fn()
        .mockReturnValueOnce(10) // already sufficient
        .mockReturnValue(1), // then force fallback paths
    }));
    vi.doMock('../../src/modules/core', async () => {
      const actual = await vi.importActual<any>('../../src/modules/core');
      return {
        ...actual,
        getRelativeLuminance: vi.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.9),
      };
    });

    const mod = await import('../../src/modules/qr-generator/color');

    expect(mod.ensureContrast('#336699', '#ffffff', 4.5)).toBe('#336699');
    expect(mod.ensureContrast('#336699', '#000000', 4.5)).toBe('#ffffff');
    expect(mod.ensureContrast('#336699', '#ffffff', 4.5)).toBe('#000000');
  });

  it('handles ensureContrast failures and parseColor-null guards', async () => {
    vi.doMock('../../src/modules/qr-generator/utils', () => ({
      getContrastRatio: vi.fn(() => {
        throw new Error('boom');
      }),
    }));
    vi.doMock('../../src/modules/core', async () => {
      const actual = await vi.importActual<any>('../../src/modules/core');
      return {
        ...actual,
        parseColor: vi.fn(() => null),
        getRelativeLuminance: vi.fn(() => 0.2),
        blendColors: vi.fn((a: string) => a),
      };
    });

    const mod = await import('../../src/modules/qr-generator/color');
    expect(mod.ensureContrast('#123456', '#ffffff', 4.5)).toBe('#123456');
    expect(
      mod.applyPerModuleColor('by_brightness', '#123456', { 0: [0.5], colors: [[]] } as any, 0, 0, 21, {
        overlayIntensity: 50,
      } as any)
    ).toBe('#123456');
    expect(
      mod.applyPerModuleColor('by_position', '#123456', { 0: [0.5], colors: [[]] } as any, 0, 0, 21, {
        overlayIntensity: 50,
      } as any)
    ).toBe('#123456');
    expect(
      mod.applyPerModuleColor('by_cluster', '#123456', { 0: [0.5], colors: [[]] } as any, 0, 0, 21, {
        overlayIntensity: 50,
      } as any)
    ).toBe('#123456');
  });

  it('applies palette color across all palette modes', async () => {
    const mod = await import('../../src/modules/qr-generator/color');
    const palette = ['#111111', '#222222', '#333333'];

    expect(mod.applyPaletteColor(0, 0, 21, 0.1, palette, { fgColor: '#000', paletteMode: 'brightness' } as any)).toBe(
      '#333333'
    );
    expect(mod.applyPaletteColor(5, 2, 21, 0.5, palette, { fgColor: '#000', paletteMode: 'diagonal' } as any)).toMatch(
      /^#/
    );
    expect(mod.applyPaletteColor(10, 10, 21, 0.5, palette, { fgColor: '#000', paletteMode: 'radial' } as any)).toMatch(
      /^#/
    );
    expect(mod.applyPaletteColor(3, 7, 21, 0.5, palette, { fgColor: '#000', paletteMode: 'random' } as any)).toMatch(
      /^#/
    );
    expect(mod.applyPaletteColor(20, 1, 21, 0.5, palette, { fgColor: '#000', paletteMode: 'row' } as any)).toMatch(
      /^#/
    );
    expect(mod.applyPaletteColor(1, 20, 21, 0.5, palette, { fgColor: '#000', paletteMode: 'column' } as any)).toMatch(
      /^#/
    );
    expect(mod.applyPaletteColor(1, 2, 21, 0.5, palette, { fgColor: '#000' } as any)).toMatch(/^#/);

    expect(mod.applyPaletteColor(0, 0, 21, 0.5, [], { fgColor: '#abc' } as any)).toBe('#abc');
  });
});
