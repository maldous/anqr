import { describe, expect, it } from 'vitest';
import { generateQR } from '../../src/modules/qr-encoder';
import { decodeQR } from '../../src/modules/qr-decoder';
import { isStructuralModule } from '../../src/modules/qr-spec';

// Polyfill ImageData for Node environment
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  };
}

function matrixToImageData(
  matrix: boolean[][],
  scale: number = 6,
  quietZone: number = 4,
  invert: boolean = false
): ImageData {
  const moduleCount = matrix.length;
  const size = (moduleCount + quietZone * 2) * scale;
  const imageData = new Uint8ClampedArray(size * size * 4);

  const bg = invert ? 0 : 255;
  const fg = invert ? 255 : 0;

  // Fill background
  for (let i = 0; i < imageData.length; i += 4) {
    imageData[i] = bg;
    imageData[i + 1] = bg;
    imageData[i + 2] = bg;
    imageData[i + 3] = 255;
  }

  // Draw modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix[row][col]) {
        const startX = (col + quietZone) * scale;
        const startY = (row + quietZone) * scale;
        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const idx = ((startY + py) * size + (startX + px)) * 4;
            imageData[idx] = fg;
            imageData[idx + 1] = fg;
            imageData[idx + 2] = fg;
          }
        }
      }
    }
  }

  return { data: imageData, width: size, height: size } as ImageData;
}

function corruptMatrix(matrix: boolean[][], flipCount: number): boolean[][] {
  const size = matrix.length;
  const version = Math.floor((size - 17) / 4);
  const result = matrix.map((row) => row.slice());

  const start = Math.floor(size / 3);
  const end = size - start;
  let flipped = 0;

  for (let row = start; row < end && flipped < flipCount; row++) {
    for (let col = start; col < end && flipped < flipCount; col++) {
      if (!isStructuralModule(row, col, size, version)) {
        result[row][col] = !result[row][col];
        flipped++;
      }
    }
  }

  return result;
}

describe('qr-decoder pipeline', () => {
  it('decodes clean matrices across ECC levels', () => {
    const payload = 'https://example.com/decoder-test?ok=1';
    const eccLevels = ['L', 'M', 'Q', 'H'] as const;

    for (const ecc of eccLevels) {
      const { modules } = generateQR(payload, { errorCorrectionLevel: ecc });
      const imageData = matrixToImageData(modules, 6, 4, false);
      const result = decodeQR(imageData);
      expect(result?.data).toBe(payload);
    }
  });

  it('decodes with small corruption (ECC H)', () => {
    const payload = 'HELLO-DECODER-PIPELINE-TEST-1234567890';
    const { modules } = generateQR(payload, { errorCorrectionLevel: 'H' });
    const corrupted = corruptMatrix(modules, 8);
    const imageData = matrixToImageData(corrupted, 6, 4, false);
    const result = decodeQR(imageData);
    expect(result?.data).toBe(payload);
  });

  it('decodes inverted images (auto inversion)', () => {
    const payload = 'https://example.com/invert-test';
    const { modules } = generateQR(payload, { errorCorrectionLevel: 'M' });
    const imageData = matrixToImageData(modules, 6, 4, true);
    const result = decodeQR(imageData);
    expect(result?.data).toBe(payload);
  });
});
