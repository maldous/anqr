/**
 * QR-Art Version Sweep (numeric suffix)
 *
 * Purpose: compare controllable bits and match percentage across versions
 * to diagnose why higher versions don't improve image quality.
 */

import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

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

  const imageBuffer = await sharp(absolutePath)
    .resize(targetSize, targetSize, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = imageBuffer;
  return {
    data: new Uint8ClampedArray(data),
    width: info.width,
    height: info.height,
  } as ImageData;
}

const VERSION_MODULES: Record<number, number> = {
  5: 37,
  6: 41,
  7: 45,
  8: 49,
  9: 53,
  10: 57,
  11: 61,
  12: 65,
  13: 69,
  14: 73,
  15: 77,
};

describe('QR-Art version sweep (numeric suffix)', () => {
  const imagePath = 'public/face.jpg';
  const originalData = 'https://anqr.link';

  it('logs control + match across versions', async () => {
    const versions = [7, 9, 10, 12, 15];
    const ecc: 'L' | 'M' | 'Q' | 'H' = 'M';

    for (const version of versions) {
      const moduleCount = VERSION_MODULES[version];
      const targetImage = await loadImageAsImageData(imagePath, moduleCount * 4);

      const config: FullQArtConfig = {
        data: originalData,
        targetImage,
        version,
        ecc,
        maskPattern: -1,
        autoSuffix: true,
        strictSuffix: true,
        suffixMode: 'numeric',
      };

      const result = await generateFullQArt(config);

      if (result.success) {
        // eslint-disable-next-line no-console
        console.log(
          `[v${version} ${ecc}] match=${result.matchPercentage.toFixed(1)}% ` +
            `matching=${result.matchingPixels}/${result.totalControllable} ` +
            `modules=${result.moduleCount} suffixLen=${result.suffix?.length ?? 0}`
        );
      } else {
        // eslint-disable-next-line no-console
        console.log(`[v${version} ${ecc}] FAILED: ${result.error}`);
      }
    }
  }, 120000);
});
