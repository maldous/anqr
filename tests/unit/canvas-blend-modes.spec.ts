import { describe, expect, it } from 'vitest';
import { createCanvas } from '@napi-rs/canvas';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function denorm(v: number): number {
  return Math.round(clamp01(v) * 255);
}

function multiply(base: number, blend: number): number {
  return denorm((base * blend) / (255 * 255));
}

function screen(base: number, blend: number): number {
  return denorm(1 - ((1 - base / 255) * (1 - blend / 255)));
}

function overlay(base: number, blend: number): number {
  const b = base / 255;
  const s = blend / 255;
  const out = b < 0.5 ? 2 * b * s : 1 - 2 * (1 - b) * (1 - s);
  return denorm(out);
}

function hardLight(base: number, blend: number): number {
  // Overlay with roles reversed (blend as base in formula)
  const b = blend / 255;
  const s = base / 255;
  const out = b < 0.5 ? 2 * b * s : 1 - 2 * (1 - b) * (1 - s);
  return denorm(out);
}

function softLight(base: number, blend: number): number {
  const b = base / 255;
  const s = blend / 255;
  let out: number;
  if (s <= 0.5) {
    out = b - (1 - 2 * s) * b * (1 - b);
  } else {
    const d = b <= 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b);
    out = b + (2 * s - 1) * (d - b);
  }
  return denorm(out);
}

function blendPixel(
  mode: GlobalCompositeOperation,
  base: { r: number; g: number; b: number },
  overlay: { r: number; g: number; b: number },
  opacity: number = 1
): { r: number; g: number; b: number } {
  const canvas = createCanvas(1, 1);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = `rgb(${base.r},${base.g},${base.b})`;
  ctx.fillRect(0, 0, 1, 1);

  ctx.globalCompositeOperation = mode;
  ctx.globalAlpha = opacity;
  ctx.fillStyle = `rgb(${overlay.r},${overlay.g},${overlay.b})`;
  ctx.fillRect(0, 0, 1, 1);

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  const data = ctx.getImageData(0, 0, 1, 1).data;
  return { r: data[0], g: data[1], b: data[2] };
}

function expectClose(actual: number, expected: number, tolerance: number = 1): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

describe('canvas blend modes (opaque inputs)', () => {
  const base = { r: 80, g: 140, b: 200 };
  const overlayColor = { r: 180, g: 60, b: 40 };

  it('matches multiply formula', () => {
    const out = blendPixel('multiply', base, overlayColor, 1);
    expectClose(out.r, multiply(base.r, overlayColor.r));
    expectClose(out.g, multiply(base.g, overlayColor.g));
    expectClose(out.b, multiply(base.b, overlayColor.b));
  });

  it('matches screen formula', () => {
    const out = blendPixel('screen', base, overlayColor, 1);
    expectClose(out.r, screen(base.r, overlayColor.r));
    expectClose(out.g, screen(base.g, overlayColor.g));
    expectClose(out.b, screen(base.b, overlayColor.b));
  });

  it('matches overlay formula', () => {
    const out = blendPixel('overlay', base, overlayColor, 1);
    expectClose(out.r, overlay(base.r, overlayColor.r));
    expectClose(out.g, overlay(base.g, overlayColor.g));
    expectClose(out.b, overlay(base.b, overlayColor.b));
  });

  it('matches hard-light formula', () => {
    const out = blendPixel('hard-light', base, overlayColor, 1);
    expectClose(out.r, hardLight(base.r, overlayColor.r));
    expectClose(out.g, hardLight(base.g, overlayColor.g));
    expectClose(out.b, hardLight(base.b, overlayColor.b));
  });

  it('matches soft-light formula', () => {
    const out = blendPixel('soft-light', base, overlayColor, 1);
    expectClose(out.r, softLight(base.r, overlayColor.r));
    expectClose(out.g, softLight(base.g, overlayColor.g));
    expectClose(out.b, softLight(base.b, overlayColor.b));
  });
});

describe('canvas blend modes (opacity)', () => {
  it('normal mode respects opacity', () => {
    const base = { r: 10, g: 20, b: 30 };
    const overlayColor = { r: 210, g: 220, b: 230 };
    const opacity = 0.5;
    const out = blendPixel('source-over', base, overlayColor, opacity);
    const expected = {
      r: Math.round(overlayColor.r * opacity + base.r * (1 - opacity)),
      g: Math.round(overlayColor.g * opacity + base.g * (1 - opacity)),
      b: Math.round(overlayColor.b * opacity + base.b * (1 - opacity)),
    };
    expectClose(out.r, expected.r, 1);
    expectClose(out.g, expected.g, 1);
    expectClose(out.b, expected.b, 1);
  });
});
