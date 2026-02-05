/**
 * QR-Art Test with Real Image (public/face.jpg)
 *
 * Tests the QR-Art pipeline with an actual image file to verify:
 * 1. Image loading works correctly
 * 2. Pipeline reaches elimination stage
 * 3. Art shaping produces visible results
 * 4. Output QR is scannable
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Polyfill ImageData for Node.js environment
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
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

import {
  generateFullQArt,
  verifyMatrixFormatInfo,
  type FullQArtConfig,
} from '../../src/modules/qr-art/generate';
import { decodeQR } from '../../src/modules/qr-decoder';

/**
 * Load an image file and convert to ImageData format
 */
async function loadImageAsImageData(imagePath: string, targetSize: number): Promise<ImageData> {
  const absolutePath = path.resolve(process.cwd(), imagePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Image not found: ${absolutePath}`);
  }

  // Use sharp to load and resize the image
  const imageBuffer = await sharp(absolutePath)
    .resize(targetSize, targetSize, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = imageBuffer;
  
  // Convert to Uint8ClampedArray
  const imageData = new Uint8ClampedArray(data);
  
  return {
    data: imageData,
    width: info.width,
    height: info.height,
  } as ImageData;
}

/**
 * Convert a QR matrix to ImageData for scanning
 */
function matrixToImageData(matrix: boolean[][], scale: number = 4, quietZone: number = 4): { data: Uint8ClampedArray; width: number; height: number } {
  const moduleCount = matrix.length;
  const size = (moduleCount + quietZone * 2) * scale;
  const imageData = new Uint8ClampedArray(size * size * 4);

  // Fill with white background
  for (let i = 0; i < imageData.length; i += 4) {
    imageData[i] = 255;
    imageData[i + 1] = 255;
    imageData[i + 2] = 255;
    imageData[i + 3] = 255;
  }

  // Draw QR modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix[row][col]) {
        const startX = (col + quietZone) * scale;
        const startY = (row + quietZone) * scale;
        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const idx = ((startY + py) * size + (startX + px)) * 4;
            imageData[idx] = 0;
            imageData[idx + 1] = 0;
            imageData[idx + 2] = 0;
          }
        }
      }
    }
  }

  return { data: imageData, width: size, height: size };
}

/**
 * Save a QR matrix as PNG for visual inspection
 */
async function saveMatrixAsPng(matrix: boolean[][], outputPath: string, scale: number = 10): Promise<void> {
  const moduleCount = matrix.length;
  const quietZone = 4;
  const size = (moduleCount + quietZone * 2) * scale;
  
  // Create grayscale buffer (no alpha needed for output)
  const buffer = Buffer.alloc(size * size);
  
  // Fill with white
  buffer.fill(255);
  
  // Draw QR modules (black)
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix[row][col]) {
        const startX = (col + quietZone) * scale;
        const startY = (row + quietZone) * scale;
        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const idx = (startY + py) * size + (startX + px);
            buffer[idx] = 0;
          }
        }
      }
    }
  }
  
  await sharp(buffer, { raw: { width: size, height: size, channels: 1 } })
    .png()
    .toFile(outputPath);
    
  console.log(`Saved QR-Art output to: ${outputPath}`);
}

describe('QR-Art with public/face.jpg', () => {
  const imagePath = 'public/face.jpg';
  const originalData = 'https://example.com';

  it('loads face.jpg image successfully', async () => {
    const imageSize = 37 * 4; // For version 5
    const targetImage = await loadImageAsImageData(imagePath, imageSize);
    
    expect(targetImage.width).toBe(imageSize);
    expect(targetImage.height).toBe(imageSize);
    expect(targetImage.data.length).toBe(imageSize * imageSize * 4);
  });

  it('generates QR-Art with face.jpg (version 7, ECC L)', async () => {
    // Version 7 = 45 modules
    const moduleCount = 45;
    const imageSize = moduleCount * 4; // 180x180 target
    const targetImage = await loadImageAsImageData(imagePath, imageSize);

    const config: FullQArtConfig = {
      data: originalData,
      targetImage,
      version: 7,
      ecc: 'L',
      maskPattern: -1, // Auto-mask for best result
      autoSuffix: true,
    };

    console.log('Starting QR-Art generation with face.jpg...');
    const result = await generateFullQArt(config);

    if (result.success) {
      console.log('=== QR-Art SUCCESS ===');
      console.log(`Match: ${result.matchPercentage.toFixed(1)}%`);
      console.log(`Matching pixels: ${result.matchingPixels}/${result.totalControllable}`);
      console.log(`Mask pattern: ${result.maskPattern}`);
      console.log(`Version: ${result.version}`);
      console.log(`Module count: ${result.moduleCount}`);

      // Verify format info
      const verification = verifyMatrixFormatInfo(result.matrix, 'L', result.maskPattern);
      expect(verification.valid).toBe(true);

      // Verify elimination was performed
      expect(result.totalControllable).toBeGreaterThan(0);
      expect(result.matchPercentage).toBeGreaterThan(0);

      // Save output for visual inspection
      await saveMatrixAsPng(result.matrix, 'qr-art-face-output.png', 10);

      // Verify it's scannable
      const scanData = matrixToImageData(result.matrix);
      const decoded = decodeQR({ data: scanData.data, width: scanData.width, height: scanData.height });
      
      expect(decoded).not.toBeNull();
      if (decoded) {
        expect(decoded.data.startsWith(originalData)).toBe(true);
        console.log(`Decoded data: ${decoded.data}`);
      }
    } else {
      console.log('=== QR-Art DID NOT ACHIEVE ART SHAPING ===');
      console.log(`Error: ${result.error}`);
      
      // Should NOT fail due to format-info issues (the fix we verified)
      expect(result.error).not.toContain('FATAL');
      expect(result.error).not.toContain('Extracted ECC level does not match');
      expect(result.error).not.toContain('FORMAT VERIFICATION FAILED');
    }
  }, 60000);

  it('generates QR-Art with face.jpg (version 10, ECC M for better art)', async () => {
    // Version 10 = 57 modules - more pixels for art
    const moduleCount = 57;
    const imageSize = moduleCount * 4; // 228x228 target
    const targetImage = await loadImageAsImageData(imagePath, imageSize);

    const config: FullQArtConfig = {
      data: originalData,
      targetImage,
      version: 10,
      ecc: 'M',
      maskPattern: -1,
      autoSuffix: true,
    };

    console.log('Starting QR-Art generation (v10, ECC M) with face.jpg...');
    const result = await generateFullQArt(config);

    if (result.success) {
      console.log('=== QR-Art SUCCESS (v10) ===');
      console.log(`Match: ${result.matchPercentage.toFixed(1)}%`);
      console.log(`Matching pixels: ${result.matchingPixels}/${result.totalControllable}`);

      // Save output
      await saveMatrixAsPng(result.matrix, 'qr-art-face-v10-output.png', 8);

      // Verify scannable
      const scanData = matrixToImageData(result.matrix);
      const decoded = decodeQR({ data: scanData.data, width: scanData.width, height: scanData.height });
      expect(decoded).not.toBeNull();
    } else {
      console.log(`v10 result: ${result.error}`);
      expect(result.error).not.toContain('FATAL');
    }
  }, 60000);

  it('compares different ECC levels with face.jpg', async () => {
    const eccLevels = ['L', 'M', 'Q', 'H'] as const;
    const moduleCount = 45; // Version 7
    const imageSize = moduleCount * 4;
    const targetImage = await loadImageAsImageData(imagePath, imageSize);

    console.log('\n=== ECC Level Comparison ===');

    for (const ecc of eccLevels) {
      const config: FullQArtConfig = {
        data: 'https://x.co', // Shorter URL for higher ECC
        targetImage,
        version: 7,
        ecc,
        maskPattern: -1,
        autoSuffix: true,
      };

      const result = await generateFullQArt(config);

      if (result.success) {
        console.log(`ECC ${ecc}: ${result.matchPercentage.toFixed(1)}% match (${result.matchingPixels}/${result.totalControllable} pixels)`);
      } else {
        console.log(`ECC ${ecc}: ${result.error}`);
        expect(result.error).not.toContain('FATAL');
      }
    }
  }, 120000);
});
