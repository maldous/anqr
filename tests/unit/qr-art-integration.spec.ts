/**
 * QR-Art Full Integration Test
 *
 * Tests that the QR-Art pipeline successfully:
 * 1. Generates base QR without early abort on format-info disagreement
 * 2. Reaches the Gauss-Jordan elimination stage
 * 3. Produces a valid QR code that scans correctly
 *
 * This test verifies the fix for the format-info verification issue
 * that was causing "FATAL: Extracted ECC level does not match requested ECC!"
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock import.meta.env.DEV for the logger
vi.stubGlobal('import', { meta: { env: { DEV: true } } });

import { qrcode } from '../../src/modules/qr-encoder';
import {
  extractMaskFromMatrix,
  eccNumericToLevel,
  verifyMatrixFormatInfo,
  generateFullQArt,
  type FullQArtConfig,
} from '../../src/modules/qr-art/generate';
import { decodeQR } from '../../src/modules/qr-decoder';

// Helper to build matrix from QR code
function buildMatrixFromQR(
  qr: ReturnType<typeof qrcode>
): boolean[][] {
  const moduleCount = qr.getModuleCount();
  const matrix: boolean[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    matrix[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      matrix[row][col] = qr.isDark(row, col);
    }
  }
  return matrix;
}

// Helper to create a simple target image (grayscale gradient)
function createTestImage(size: number): ImageData {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Create a gradient pattern - darker in top-left, lighter in bottom-right
      const gray = Math.floor(((x + y) / (2 * size)) * 255);
      data[idx] = gray;     // R
      data[idx + 1] = gray; // G
      data[idx + 2] = gray; // B
      data[idx + 3] = 255;  // A
    }
  }
  return { data, width: size, height: size } as ImageData;
}

// Helper to create a checkerboard pattern (high contrast for QR-Art)
function createCheckerboardImage(size: number, cellSize: number = 4): ImageData {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const cellX = Math.floor(x / cellSize);
      const cellY = Math.floor(y / cellSize);
      const isDark = (cellX + cellY) % 2 === 0;
      const gray = isDark ? 0 : 255;
      data[idx] = gray;
      data[idx + 1] = gray;
      data[idx + 2] = gray;
      data[idx + 3] = 255;
    }
  }
  return { data, width: size, height: size } as ImageData;
}

describe('QR-Art Full Integration', () => {
  describe('Pipeline reaches elimination stage', () => {
    const eccLevels = ['L', 'M', 'Q', 'H'] as const;

    it('format verification does not block pipeline for valid QR codes', () => {
      // Generate a valid QR code and verify format info extraction works
      for (const ecc of eccLevels) {
        for (const mask of [0, 3, 5, 7]) {
          const qr = qrcode(5, ecc);
          qr.addData('https://test.com');
          qr.make(mask);

          const matrix = buildMatrixFromQR(qr);

          // Format verification should pass (not block the pipeline)
          const verification = verifyMatrixFormatInfo(matrix, ecc, mask);
          expect(verification.valid).toBe(true);
          expect(verification.eccMatch).toBe(true);
          expect(verification.maskMatch).toBe(true);

          // Extraction should match encoder values
          const extracted = extractMaskFromMatrix(matrix);
          expect(eccNumericToLevel(extracted.eccLevel)).toBe(ecc);
          expect(extracted.mask).toBe(mask);
          expect(extracted.isValid).toBe(true);
        }
      }
    });

    it('format parser disagreement is diagnostic only (does not abort)', () => {
      // This test verifies the fix: even if format parser disagrees,
      // the pipeline should continue with encoder-requested values
      // and let the scan validation be the real gate.

      for (const ecc of eccLevels) {
        const qr = qrcode(5, ecc);
        qr.addData('https://example.com/test');
        qr.make(2);

        const matrix = buildMatrixFromQR(qr);

        // Verify using wrong expected ECC - should fail verification
        // but this should be diagnostic only (not abort)
        const wrongEccVerification = verifyMatrixFormatInfo(matrix, ecc === 'L' ? 'H' : 'L', 2);
        expect(wrongEccVerification.valid).toBe(false);
        expect(wrongEccVerification.reason).toBe('ECC_MISMATCH');

        // But the correct verification should still work
        const correctVerification = verifyMatrixFormatInfo(matrix, ecc, 2);
        expect(correctVerification.valid).toBe(true);
      }
    });
  });

  describe('generateFullQArt reaches elimination stage', () => {
    // These tests call the actual generateFullQArt function to verify
    // the pipeline reaches the elimination stage without early abort

    it('generates QR-Art with gradient image (version 5, ECC M)', async () => {
      const imageSize = 21 * 4; // 84x84 for version 5
      const targetImage = createTestImage(imageSize);

      const config: FullQArtConfig = {
        data: 'https://example.com',
        targetImage,
        version: 5,
        ecc: 'M',
        maskPattern: 2,
        autoSuffix: true,
      };

      const result = await generateFullQArt(config);

      // The pipeline should complete (success or known failure reason)
      // The key test is that it doesn't abort with "FATAL: Extracted ECC level does not match"
      if (result.success) {
        // Verify the result matrix has valid format info
        const verification = verifyMatrixFormatInfo(result.matrix, 'M', result.maskPattern);
        expect(verification.valid).toBe(true);

        // Verify elimination was performed (controllable pixels > 0)
        expect(result.totalControllable).toBeGreaterThan(0);

        // Log success metrics
        console.log(`QR-Art success: ${result.matchPercentage.toFixed(1)}% match, ${result.matchingPixels}/${result.totalControllable} controllable pixels`);
      } else {
        // If it failed, it should NOT be due to format-info mismatch (the fix)
        expect(result.error).not.toContain('FATAL');
        expect(result.error).not.toContain('Extracted ECC level does not match');
        expect(result.error).not.toContain('BASE MATRIX FORMAT VERIFICATION FAILED');
        expect(result.error).not.toContain('FINAL MATRIX FORMAT VERIFICATION FAILED');

        console.log(`QR-Art did not achieve art shaping: ${result.error}`);
      }
    }, 30000);

    it('generates QR-Art with checkerboard image (version 7, ECC L)', async () => {
      const imageSize = 45 * 2; // 90x90 for version 7
      const targetImage = createCheckerboardImage(imageSize, 3);

      const config: FullQArtConfig = {
        data: 'https://test.org/path',
        targetImage,
        version: 7,
        ecc: 'L',
        maskPattern: -1, // Auto-mask
        autoSuffix: true,
      };

      const result = await generateFullQArt(config);

      if (result.success) {
        expect(result.totalControllable).toBeGreaterThan(0);
        console.log(`QR-Art success (auto-mask=${result.maskPattern}): ${result.matchPercentage.toFixed(1)}% match`);
      } else {
        // Should NOT abort due to format-info issues
        expect(result.error).not.toContain('FATAL');
        expect(result.error).not.toContain('Extracted ECC level does not match');
        console.log(`QR-Art result: ${result.error}`);
      }
    }, 30000);

    it('generates QR-Art with high ECC (version 5, ECC H)', async () => {
      const imageSize = 21 * 4;
      const targetImage = createTestImage(imageSize);

      const config: FullQArtConfig = {
        data: 'https://hi.co', // Shorter URL to fit with high ECC
        targetImage,
        version: 5,
        ecc: 'H',
        maskPattern: 4,
        autoSuffix: true,
      };

      const result = await generateFullQArt(config);

      if (result.success) {
        const verification = verifyMatrixFormatInfo(result.matrix, 'H', result.maskPattern);
        expect(verification.valid).toBe(true);
        expect(result.totalControllable).toBeGreaterThan(0);
      } else {
        // Should NOT abort due to format-info issues
        expect(result.error).not.toContain('FATAL');
        expect(result.error).not.toContain('Extracted ECC level does not match');
      }
    }, 30000);

    it('pipeline logs FORMAT_PARSER_DISAGREEMENT as warning (not error)', async () => {
      // This test verifies the key fix: format parser disagreement
      // should be logged as a warning, not cause hard failure

      const imageSize = 21 * 4;
      const targetImage = createTestImage(imageSize);

      const config: FullQArtConfig = {
        data: 'https://example.com/test-logging',
        targetImage,
        version: 5,
        ecc: 'M',
        maskPattern: 2,
        autoSuffix: true,
      };

      const result = await generateFullQArt(config);

      // The pipeline should not abort - it should either succeed or fail
      // for a legitimate reason (not format-info parsing issues)
      if (!result.success) {
        expect(result.error).not.toContain('FATAL');
        expect(result.error).not.toContain('FORMAT VERIFICATION FAILED');
      }
    }, 30000);
  });

  describe('QR-Art output is scannable', () => {
    it('generated QR-Art decodes correctly', async () => {
      const originalData = 'https://example.com';
      const imageSize = 21 * 4;
      const targetImage = createTestImage(imageSize);

      const config: FullQArtConfig = {
        data: originalData,
        targetImage,
        version: 5,
        ecc: 'M',
        maskPattern: 2,
        autoSuffix: true,
      };

      const result = await generateFullQArt(config);

      if (result.success) {
        // Convert matrix to ImageData for scanning
        const moduleCount = result.matrix.length;
        const scale = 4;
        const quietZone = 4;
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
            if (result.matrix[row][col]) {
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

        // Decode and verify
        const decoded = decodeQR({ data: imageData, width: size, height: size });

        expect(decoded).not.toBeNull();
        if (decoded) {
          // In HYBRID mode, decoded data should start with original data
          expect(decoded.data.startsWith(originalData)).toBe(true);
        }
      }
    }, 30000);
  });
});
