import { createCanvas } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
import { mapImageToTargetsSupersampled } from '../../src/modules/qr-art/image-utils';

describe('qr-art image utils', () => {
  it('handles canvas inputs without misclassifying canvas.data() as image data', () => {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');

    // Build a simple high-contrast target image: top half black, bottom half white.
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 100, 50);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 50, 100, 50);

    const { targets } = mapImageToTargetsSupersampled(canvas as unknown as HTMLCanvasElement, 10);
    const darkCount = targets.flat().filter(Boolean).length;

    // If canvas was misclassified as ImageData-like (because of canvas.data()),
    // targets can collapse to all-light/all-dark. We expect a mixed result.
    expect(darkCount).toBeGreaterThan(0);
    expect(darkCount).toBeLessThan(100);
  });
});
