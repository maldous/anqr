import { describe, expect, it } from 'vitest';
import { alphaBlend, multiplyBlend, overlayBlend, screenBlend } from '../../src/modules/core/color';

function expectRgb(
  actual: { r: number; g: number; b: number },
  expected: { r: number; g: number; b: number }
) {
  expect(actual.r).toBe(expected.r);
  expect(actual.g).toBe(expected.g);
  expect(actual.b).toBe(expected.b);
}

describe('core blend math', () => {
  it('multiplyBlend matches formula', () => {
    const out = multiplyBlend({ r: 100, g: 200, b: 50 }, { r: 10, g: 128, b: 255 });
    expectRgb(out, { r: 4, g: 100, b: 50 });
  });

  it('screenBlend matches formula', () => {
    const out = screenBlend({ r: 100, g: 200, b: 50 }, { r: 10, g: 128, b: 255 });
    // Expected: 255 - ((255-a)*(255-b))/255
    const r = Math.round(255 - ((255 - 100) * (255 - 10)) / 255);
    const g = Math.round(255 - ((255 - 200) * (255 - 128)) / 255);
    const b = Math.round(255 - ((255 - 50) * (255 - 255)) / 255);
    expectRgb(out, { r, g, b });
  });

  it('overlayBlend matches formula for dark/light base', () => {
    const outDark = overlayBlend({ r: 50, g: 50, b: 50 }, { r: 200, g: 120, b: 80 });
    const outLight = overlayBlend({ r: 200, g: 200, b: 200 }, { r: 60, g: 120, b: 180 });

    const overlay = (a: number, b: number) => {
      if (a < 128) return Math.round((2 * a * b) / 255);
      return Math.round(255 - (2 * (255 - a) * (255 - b)) / 255);
    };

    expectRgb(outDark, {
      r: overlay(50, 200),
      g: overlay(50, 120),
      b: overlay(50, 80),
    });

    expectRgb(outLight, {
      r: overlay(200, 60),
      g: overlay(200, 120),
      b: overlay(200, 180),
    });
  });

  it('alphaBlend matches straight alpha compositing', () => {
    const out = alphaBlend({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 255, g: 255, b: 255, a: 1 });
    expect(out.a).toBeCloseTo(1);
    expectRgb(out, { r: 128, g: 128, b: 128 });
  });
});
