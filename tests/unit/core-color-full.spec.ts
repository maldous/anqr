import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

// ImageData polyfill for node
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: string;
  constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = height!;
    }
    this.colorSpace = 'srgb';
  }
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = MockImageData;
}

describe('core/color.ts', () => {
  async function getMod() {
    return import('../../src/modules/core/color');
  }

  // ==========================================================================
  // parseHex
  // ==========================================================================
  describe('parseHex', () => {
    it('parses 6-char hex with #', async () => {
      const { parseHex } = await getMod();
      expect(parseHex('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('parses 6-char hex without #', async () => {
      const { parseHex } = await getMod();
      expect(parseHex('000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('parses 3-char shorthand hex', async () => {
      const { parseHex } = await getMod();
      expect(parseHex('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('parses white', async () => {
      const { parseHex } = await getMod();
      expect(parseHex('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('parses mid-range color', async () => {
      const { parseHex } = await getMod();
      expect(parseHex('#808080')).toEqual({ r: 128, g: 128, b: 128 });
    });
  });

  // ==========================================================================
  // parseHexAlpha
  // ==========================================================================
  describe('parseHexAlpha', () => {
    it('parses 8-char hex with alpha', async () => {
      const { parseHexAlpha } = await getMod();
      const result = parseHexAlpha('#ff000080');
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBeCloseTo(0x80 / 255, 2);
    });

    it('parses 4-char shorthand with alpha', async () => {
      const { parseHexAlpha } = await getMod();
      const result = parseHexAlpha('#f008');
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBeCloseTo(0x88 / 255, 2);
    });

    it('defaults alpha to 1 for 6-char hex', async () => {
      const { parseHexAlpha } = await getMod();
      const result = parseHexAlpha('#ff0000');
      expect(result.a).toBe(1);
    });

    it('parses fully opaque 8-char hex', async () => {
      const { parseHexAlpha } = await getMod();
      const result = parseHexAlpha('#ff0000ff');
      expect(result.a).toBe(1);
    });

    it('parses fully transparent', async () => {
      const { parseHexAlpha } = await getMod();
      const result = parseHexAlpha('#ff000000');
      expect(result.a).toBe(0);
    });
  });

  // ==========================================================================
  // parseRgbString
  // ==========================================================================
  describe('parseRgbString', () => {
    it('parses rgb()', async () => {
      const { parseRgbString } = await getMod();
      expect(parseRgbString('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('parses rgba()', async () => {
      const { parseRgbString } = await getMod();
      expect(parseRgbString('rgba(0, 0, 255, 0.5)')).toEqual({ r: 0, g: 0, b: 255, a: 0.5 });
    });

    it('returns defaults for invalid string', async () => {
      const { parseRgbString } = await getMod();
      expect(parseRgbString('invalid')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });

    it('parses rgb without spaces', async () => {
      const { parseRgbString } = await getMod();
      expect(parseRgbString('rgb(128,64,32)')).toEqual({ r: 128, g: 64, b: 32, a: 1 });
    });
  });

  // ==========================================================================
  // parseHslString
  // ==========================================================================
  describe('parseHslString', () => {
    it('parses hsl()', async () => {
      const { parseHslString } = await getMod();
      expect(parseHslString('hsl(0, 100, 50)')).toEqual({ h: 0, s: 100, l: 50, a: 1 });
    });

    it('parses hsla()', async () => {
      const { parseHslString } = await getMod();
      expect(parseHslString('hsla(120, 50, 50, 0.8)')).toEqual({ h: 120, s: 50, l: 50, a: 0.8 });
    });

    it('returns defaults for invalid string', async () => {
      const { parseHslString } = await getMod();
      expect(parseHslString('invalid')).toEqual({ h: 0, s: 0, l: 0, a: 1 });
    });
  });

  // ==========================================================================
  // parseColor
  // ==========================================================================
  describe('parseColor', () => {
    it('parses hex color', async () => {
      const { parseColor } = await getMod();
      const result = parseColor('#ff0000');
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('parses rgb() string', async () => {
      const { parseColor } = await getMod();
      const result = parseColor('rgb(0, 255, 0)');
      expect(result.r).toBe(0);
      expect(result.g).toBe(255);
      expect(result.b).toBe(0);
    });

    it('parses hsl() string', async () => {
      const { parseColor } = await getMod();
      const result = parseColor('hsl(240, 100, 50)');
      expect(result.b).toBeGreaterThan(200);
    });

    it('parses named color "red"', async () => {
      const { parseColor } = await getMod();
      const result = parseColor('red');
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('parses named color "black"', async () => {
      const { parseColor } = await getMod();
      const result = parseColor('black');
      expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });

    it('parses named color "white"', async () => {
      const { parseColor } = await getMod();
      const result = parseColor('white');
      expect(result).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    });

    it('returns null for unknown color', async () => {
      const { parseColor } = await getMod();
      expect(parseColor('unknown')).toBeNull();
    });

    it('trims whitespace and is case-insensitive', async () => {
      const { parseColor } = await getMod();
      const result = parseColor('  RED  ');
      expect(result.r).toBe(255);
    });

    it('parses named "transparent"', async () => {
      const { parseColor } = await getMod();
      const result = parseColor('transparent');
      expect(result.a).toBe(0);
    });
  });

  // ==========================================================================
  // rgbToHex
  // ==========================================================================
  describe('rgbToHex', () => {
    it('converts red', async () => {
      const { rgbToHex } = await getMod();
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    });

    it('converts black', async () => {
      const { rgbToHex } = await getMod();
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('converts white', async () => {
      const { rgbToHex } = await getMod();
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });
  });

  // ==========================================================================
  // rgbaToHex
  // ==========================================================================
  describe('rgbaToHex', () => {
    it('converts with alpha', async () => {
      const { rgbaToHex } = await getMod();
      const result = rgbaToHex(255, 0, 0, 0.5);
      expect(result).toContain('ff0000');
      expect(result.length).toBe(9); // #RRGGBBAA
    });

    it('converts fully opaque', async () => {
      const { rgbaToHex } = await getMod();
      expect(rgbaToHex(255, 0, 0, 1)).toBe('#ff0000ff');
    });
  });

  // ==========================================================================
  // rgbToString / rgbaToString
  // ==========================================================================
  describe('rgbToString', () => {
    it('formats rgb string', async () => {
      const { rgbToString } = await getMod();
      expect(rgbToString(255, 0, 0)).toBe('rgb(255, 0, 0)');
    });
  });

  describe('rgbaToString', () => {
    it('formats rgba string', async () => {
      const { rgbaToString } = await getMod();
      expect(rgbaToString(255, 0, 0, 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    });
  });

  // ==========================================================================
  // rgbToGray
  // ==========================================================================
  describe('rgbToGray', () => {
    it('white → ~255', async () => {
      const { rgbToGray } = await getMod();
      expect(rgbToGray(255, 255, 255)).toBeCloseTo(255, 0);
    });

    it('black → 0', async () => {
      const { rgbToGray } = await getMod();
      expect(rgbToGray(0, 0, 0)).toBe(0);
    });

    it('red → luminance-weighted', async () => {
      const { rgbToGray } = await getMod();
      expect(rgbToGray(255, 0, 0)).toBeCloseTo(76.245, 0);
    });
  });

  // ==========================================================================
  // rgbToHsl
  // ==========================================================================
  describe('rgbToHsl', () => {
    it('red → h=0, s=100, l=50', async () => {
      const { rgbToHsl } = await getMod();
      const result = rgbToHsl(255, 0, 0);
      expect(result.h).toBeCloseTo(0, 0);
      expect(result.s).toBeCloseTo(100, 0);
      expect(result.l).toBeCloseTo(50, 0);
    });

    it('green → h=120', async () => {
      const { rgbToHsl } = await getMod();
      expect(rgbToHsl(0, 255, 0).h).toBeCloseTo(120, 0);
    });

    it('blue → h=240', async () => {
      const { rgbToHsl } = await getMod();
      expect(rgbToHsl(0, 0, 255).h).toBeCloseTo(240, 0);
    });

    it('gray → s=0', async () => {
      const { rgbToHsl } = await getMod();
      expect(rgbToHsl(128, 128, 128).s).toBeCloseTo(0, 0);
    });

    it('white → l=100', async () => {
      const { rgbToHsl } = await getMod();
      expect(rgbToHsl(255, 255, 255).l).toBeCloseTo(100, 0);
    });

    it('black → l=0', async () => {
      const { rgbToHsl } = await getMod();
      expect(rgbToHsl(0, 0, 0).l).toBeCloseTo(0, 0);
    });
  });

  // ==========================================================================
  // hslToRgb
  // ==========================================================================
  describe('hslToRgb', () => {
    it('red hsl → rgb', async () => {
      const { hslToRgb } = await getMod();
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('green hsl → rgb', async () => {
      const { hslToRgb } = await getMod();
      expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('blue hsl → rgb', async () => {
      const { hslToRgb } = await getMod();
      expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('achromatic (s=0) → gray', async () => {
      const { hslToRgb } = await getMod();
      const result = hslToRgb(0, 0, 50);
      expect(result.r).toBe(result.g);
      expect(result.g).toBe(result.b);
      expect(result.r).toBeCloseTo(128, 0);
    });

    it('white', async () => {
      const { hslToRgb } = await getMod();
      expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('black', async () => {
      const { hslToRgb } = await getMod();
      expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  // ==========================================================================
  // hslToRgbTuple / rgbToHslTuple
  // ==========================================================================
  describe('hslToRgbTuple', () => {
    it('returns [r,g,b] tuple', async () => {
      const { hslToRgbTuple } = await getMod();
      const result = hslToRgbTuple(0, 100, 50);
      expect(result).toEqual([255, 0, 0]);
    });
  });

  describe('rgbToHslTuple', () => {
    it('returns [h,s,l] tuple', async () => {
      const { rgbToHslTuple } = await getMod();
      const [h, s, l] = rgbToHslTuple(255, 0, 0);
      expect(h).toBeCloseTo(0, 0);
      expect(s).toBeCloseTo(100, 0);
      expect(l).toBeCloseTo(50, 0);
    });
  });

  // ==========================================================================
  // blendRgb
  // ==========================================================================
  describe('blendRgb', () => {
    it('ratio=0 returns c1', async () => {
      const { blendRgb } = await getMod();
      const c1 = { r: 255, g: 0, b: 0 };
      const c2 = { r: 0, g: 255, b: 0 };
      expect(blendRgb(c1, c2, 0)).toEqual(c1);
    });

    it('ratio=1 returns c2', async () => {
      const { blendRgb } = await getMod();
      const c1 = { r: 255, g: 0, b: 0 };
      const c2 = { r: 0, g: 255, b: 0 };
      expect(blendRgb(c1, c2, 1)).toEqual(c2);
    });

    it('ratio=0.5 returns midpoint', async () => {
      const { blendRgb } = await getMod();
      const c1 = { r: 0, g: 0, b: 0 };
      const c2 = { r: 200, g: 100, b: 50 };
      const result = blendRgb(c1, c2, 0.5);
      expect(result.r).toBe(100);
      expect(result.g).toBe(50);
      expect(result.b).toBe(25);
    });
  });

  // ==========================================================================
  // blendColors
  // ==========================================================================
  describe('blendColors', () => {
    it('blends black and white at 0.5', async () => {
      const { blendColors } = await getMod();
      const result = blendColors('#000000', '#ffffff', 0.5);
      expect(result).toContain('80');
    });

    it('returns rgba string when alpha < 1', async () => {
      const { blendColors } = await getMod();
      const result = blendColors('rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)', 0.5);
      expect(result).toContain('rgba');
    });

    it('returns hex when alpha = 1', async () => {
      const { blendColors } = await getMod();
      const result = blendColors('#ff0000', '#0000ff', 0);
      expect(result).toBe('#ff0000');
    });
  });

  // ==========================================================================
  // alphaBlend
  // ==========================================================================
  describe('alphaBlend', () => {
    it('opaque over anything → top wins', async () => {
      const { alphaBlend } = await getMod();
      const top = { r: 255, g: 0, b: 0, a: 1 };
      const bottom = { r: 0, g: 255, b: 0, a: 1 };
      const result = alphaBlend(top, bottom);
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.a).toBe(1);
    });

    it('transparent over opaque → bottom wins', async () => {
      const { alphaBlend } = await getMod();
      const top = { r: 255, g: 0, b: 0, a: 0 };
      const bottom = { r: 0, g: 255, b: 0, a: 1 };
      const result = alphaBlend(top, bottom);
      expect(result.r).toBe(0);
      expect(result.g).toBe(255);
    });

    it('both transparent → transparent black', async () => {
      const { alphaBlend } = await getMod();
      const result = alphaBlend({ r: 255, g: 0, b: 0, a: 0 }, { r: 0, g: 255, b: 0, a: 0 });
      expect(result.a).toBe(0);
      expect(result.r).toBe(0);
    });

    it('semi-transparent blending', async () => {
      const { alphaBlend } = await getMod();
      const result = alphaBlend({ r: 255, g: 0, b: 0, a: 0.5 }, { r: 0, g: 0, b: 255, a: 1 });
      expect(result.a).toBe(1);
      expect(result.r).toBeGreaterThan(100);
      expect(result.b).toBeGreaterThan(100);
    });
  });

  // ==========================================================================
  // multiplyBlend
  // ==========================================================================
  describe('multiplyBlend', () => {
    it('white * any = any', async () => {
      const { multiplyBlend } = await getMod();
      const white = { r: 255, g: 255, b: 255 };
      const color = { r: 128, g: 64, b: 32 };
      const result = multiplyBlend(white, color);
      expect(result.r).toBe(128);
      expect(result.g).toBe(64);
      expect(result.b).toBe(32);
    });

    it('black * any = black', async () => {
      const { multiplyBlend } = await getMod();
      const result = multiplyBlend({ r: 0, g: 0, b: 0 }, { r: 200, g: 100, b: 50 });
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  // ==========================================================================
  // screenBlend
  // ==========================================================================
  describe('screenBlend', () => {
    it('black screen any = any', async () => {
      const { screenBlend } = await getMod();
      const result = screenBlend({ r: 0, g: 0, b: 0 }, { r: 128, g: 64, b: 32 });
      expect(result.r).toBe(128);
      expect(result.g).toBe(64);
      expect(result.b).toBe(32);
    });

    it('white screen any = white', async () => {
      const { screenBlend } = await getMod();
      const result = screenBlend({ r: 255, g: 255, b: 255 }, { r: 128, g: 64, b: 32 });
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  // ==========================================================================
  // overlayBlend
  // ==========================================================================
  describe('overlayBlend', () => {
    it('handles low values (<128) branch', async () => {
      const { overlayBlend } = await getMod();
      const result = overlayBlend({ r: 64, g: 64, b: 64 }, { r: 128, g: 128, b: 128 });
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
    });

    it('handles high values (>=128) branch', async () => {
      const { overlayBlend } = await getMod();
      const result = overlayBlend({ r: 200, g: 200, b: 200 }, { r: 128, g: 128, b: 128 });
      expect(result.r).toBeGreaterThan(128);
    });

    it('black overlay = black', async () => {
      const { overlayBlend } = await getMod();
      const result = overlayBlend({ r: 0, g: 0, b: 0 }, { r: 128, g: 128, b: 128 });
      expect(result.r).toBe(0);
    });
  });

  // ==========================================================================
  // getRelativeLuminance
  // ==========================================================================
  describe('getRelativeLuminance', () => {
    it('black → ~0', async () => {
      const { getRelativeLuminance } = await getMod();
      expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 4);
    });

    it('white → ~1', async () => {
      const { getRelativeLuminance } = await getMod();
      expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2);
    });

    it('red → ~0.2126', async () => {
      const { getRelativeLuminance } = await getMod();
      expect(getRelativeLuminance({ r: 255, g: 0, b: 0 })).toBeCloseTo(0.2126, 2);
    });

    it('accepts string input', async () => {
      const { getRelativeLuminance } = await getMod();
      expect(getRelativeLuminance('#000000')).toBeCloseTo(0, 4);
    });

    it('handles sRGB linearization threshold (0.03928)', async () => {
      const { getRelativeLuminance } = await getMod();
      // Value 10/255 ≈ 0.0392 (near threshold)
      const result = getRelativeLuminance({ r: 10, g: 10, b: 10 });
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(0.01);
    });
  });

  // ==========================================================================
  // getContrastRatio
  // ==========================================================================
  describe('getContrastRatio', () => {
    it('black/white → ~21', async () => {
      const { getContrastRatio } = await getMod();
      expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
    });

    it('same color → ~1', async () => {
      const { getContrastRatio } = await getMod();
      expect(getContrastRatio('#ff0000', '#ff0000')).toBeCloseTo(1, 0);
    });

    it('order does not matter', async () => {
      const { getContrastRatio } = await getMod();
      const r1 = getContrastRatio('#000000', '#ffffff');
      const r2 = getContrastRatio('#ffffff', '#000000');
      expect(r1).toBeCloseTo(r2, 5);
    });

    it('accepts RGB objects', async () => {
      const { getContrastRatio } = await getMod();
      expect(getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 0);
    });
  });

  // ==========================================================================
  // isDark
  // ==========================================================================
  describe('isDark', () => {
    it('black → true', async () => {
      const { isDark } = await getMod();
      expect(isDark({ r: 0, g: 0, b: 0 })).toBe(true);
    });

    it('white → false', async () => {
      const { isDark } = await getMod();
      expect(isDark({ r: 255, g: 255, b: 255 })).toBe(false);
    });

    it('accepts string input', async () => {
      const { isDark } = await getMod();
      expect(isDark('#000000')).toBe(true);
    });

    it('mid gray is boundary', async () => {
      const { isDark } = await getMod();
      expect(isDark({ r: 127, g: 127, b: 127 })).toBe(true);
      expect(isDark({ r: 129, g: 129, b: 129 })).toBe(false);
    });
  });

  // ==========================================================================
  // getTextColor
  // ==========================================================================
  describe('getTextColor', () => {
    it('black background → white text', async () => {
      const { getTextColor } = await getMod();
      expect(getTextColor('#000000')).toBe('#ffffff');
    });

    it('white background → black text', async () => {
      const { getTextColor } = await getMod();
      expect(getTextColor('#ffffff')).toBe('#000000');
    });

    it('dark blue → white text', async () => {
      const { getTextColor } = await getMod();
      expect(getTextColor('#000066')).toBe('#ffffff');
    });

    it('yellow → black text', async () => {
      const { getTextColor } = await getMod();
      expect(getTextColor('#ffff00')).toBe('#000000');
    });
  });
});
