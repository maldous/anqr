/**
 * QR-Art timing probe
 * Logs per-stage durations using onProgress callbacks.
 */

import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

import { generateFullQArt, type FullQArtConfig } from '../../src/modules/qr-art/generate';

// Polyfill ImageData for Node.js
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = class ImageData {
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
  };
}

async function loadImageAsImageData(imagePath: string, targetSize: number): Promise<ImageData> {
  const absolutePath = path.resolve(process.cwd(), imagePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Image not found: ${absolutePath}`);
  }

  const img = await loadImage(absolutePath);
  const canvas = createCanvas(targetSize, targetSize);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, targetSize, targetSize);
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  return {
    data: new Uint8ClampedArray(imageData.data),
    width: imageData.width,
    height: imageData.height,
  } as ImageData;
}

const VERSION_MODULES: Record<number, number> = {
  5: 37,
  7: 45,
  9: 53,
  10: 57,
};

describe('QR-Art timing probe', () => {
  const imagePath = 'public/test.png';
  const originalData = 'https://anqr.link';

  it('logs stage timings for minimal version', async () => {
    const version = 5;
    const moduleCount = VERSION_MODULES[version];
    const targetImage = await loadImageAsImageData(imagePath, moduleCount * 4);

    const timings: Array<{ stage: string; t: number }> = [];
    const start = performance.now();

    const config: FullQArtConfig = {
      data: originalData,
      targetImage,
      version,
      ecc: 'L',
      maskPattern: -1,
      autoSuffix: true,
      strictSuffix: true,
      suffixMode: 'numeric',
      targetControlPercent: 100,
      lockVersionToMinimum: true,
      onProgress: (stage) => {
        timings.push({ stage, t: performance.now() - start });
      },
    };

    const result = await generateFullQArt(config);

    // eslint-disable-next-line no-console
    console.log(`[timing] success=${result.success} version=${result.version} match=${result.matchPercentage.toFixed(1)}%`);

    // eslint-disable-next-line no-console
    console.log('[timing] stage durations:');
    for (let i = 0; i < timings.length; i++) {
      const prev = i === 0 ? 0 : timings[i - 1].t;
      const delta = timings[i].t - prev;
      // eslint-disable-next-line no-console
      console.log(`  ${timings[i].stage}: +${delta.toFixed(1)}ms (t=${timings[i].t.toFixed(1)}ms)`);
    }
  }, 120000);

  it('compares timing vs higher version', async () => {
    const version = 10;
    const moduleCount = VERSION_MODULES[version];
    const targetImage = await loadImageAsImageData(imagePath, moduleCount * 4);

    const timings: Array<{ stage: string; t: number }> = [];
    const start = performance.now();

    const config: FullQArtConfig = {
      data: originalData,
      targetImage,
      version,
      ecc: 'L',
      maskPattern: -1,
      autoSuffix: true,
      strictSuffix: true,
      suffixMode: 'numeric',
      targetControlPercent: 100,
      onProgress: (stage) => {
        timings.push({ stage, t: performance.now() - start });
      },
    };

    const result = await generateFullQArt(config);

    // eslint-disable-next-line no-console
    console.log(`[timing] success=${result.success} version=${result.version} match=${result.matchPercentage.toFixed(1)}%`);

    // eslint-disable-next-line no-console
    console.log('[timing] stage durations:');
    for (let i = 0; i < timings.length; i++) {
      const prev = i === 0 ? 0 : timings[i - 1].t;
      const delta = timings[i].t - prev;
      // eslint-disable-next-line no-console
      console.log(`  ${timings[i].stage}: +${delta.toFixed(1)}ms (t=${timings[i].t.toFixed(1)}ms)`);
    }
  }, 120000);
});
