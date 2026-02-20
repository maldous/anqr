/**
 * QR-Art Generation Script
 * 
 * Runs the full QR-Art pipeline with a target image and exports the result to PNG.
 * 
 * Usage:
 *   npx tsx scripts/run-qr-art.ts [image-path] [output-path] [version] [target-control-percent] [data] [suffix-mode] [strict-suffix] [ecc] [auto-suffix] [suffix]
 * 
 * Examples:
 *   npx tsx scripts/run-qr-art.ts public/tsunami.jpg qr-art-output.png
 *   npx tsx scripts/run-qr-art.ts public/tsunami.jpg qr-art-v10.png 10 60
 *   npx tsx scripts/run-qr-art.ts public/trump.png qr-art-mixed.png 6 100 "https://anqr.link" numeric 1 L
 *   npx tsx scripts/run-qr-art.ts public/trump.png qr-art-fixed.png 9 100 "https://whitehouse.gov" numeric 1 L 0 "123456..."
 *   npx tsx scripts/run-qr-art.ts public/tsunami.jpg
 */

// Polyfill import.meta.env for Node.js (Vite-specific)
(globalThis as any).import_meta_env = { DEV: false, PROD: true };
Object.defineProperty(import.meta, 'env', {
  get() { return { DEV: false, PROD: true, MODE: 'production' }; }
});

import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { generateFullQArtBestMask, type FullQArtResult } from '../src/modules/qr-art/generate';
import type { ECCLevel } from '../src/modules/qr-spec/types';

// Polyfill ImageData for Node.js
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    readonly data: Uint8ClampedArray;
    readonly width: number;
    readonly height: number;
    readonly colorSpace: 'srgb' = 'srgb';

    constructor(data: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
      if (typeof data === 'number') {
        // new ImageData(width, height)
        this.width = data;
        this.height = widthOrHeight;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      } else {
        // new ImageData(data, width, height?)
        this.data = data;
        this.width = widthOrHeight;
        this.height = height ?? (data.length / 4 / widthOrHeight);
      }
    }
  };
}

async function main() {
  const args = process.argv.slice(2);
  const imagePath = args[0] || 'public/tsunami.jpg';
  const outputPath = args[1] || `qr-art-${path.basename(imagePath, path.extname(imagePath))}.png`;
  const requestedVersionRaw = args[2];
  const requestedVersionParsed = requestedVersionRaw ? Number.parseInt(requestedVersionRaw, 10) : 0;
  const requestedVersion =
    Number.isFinite(requestedVersionParsed) && requestedVersionParsed > 0 ? requestedVersionParsed : 0;
  const targetControlRaw = args[3];
  const targetControlParsed = targetControlRaw ? Number.parseFloat(targetControlRaw) : 60;
  const targetControlPercent =
    Number.isFinite(targetControlParsed) && targetControlParsed > 0 && targetControlParsed <= 100
      ? targetControlParsed
      : 60;
  const data = args[4] || 'https://anqr.link';
  const suffixModeRaw = (args[5] || 'auto').toLowerCase();
  const suffixMode: 'auto' | 'numeric' | 'byte' =
    suffixModeRaw === 'numeric' ? 'numeric' : suffixModeRaw === 'byte' ? 'byte' : 'auto';
  const strictRaw = (args[6] || '1').toLowerCase();
  const strictSuffix = !(strictRaw === '0' || strictRaw === 'false' || strictRaw === 'no');
  const eccRaw = (args[7] || 'H').toUpperCase();
  const ecc: ECCLevel = eccRaw === 'L' || eccRaw === 'M' || eccRaw === 'Q' || eccRaw === 'H' ? eccRaw : 'H';
  const autoSuffixRaw = (args[8] || '1').toLowerCase();
  const autoSuffix = !(autoSuffixRaw === '0' || autoSuffixRaw === 'false' || autoSuffixRaw === 'no');
  const explicitSuffix = args[9] || '';
  
  console.log('='.repeat(60));
  console.log('QR-Art Generation Script');
  console.log('='.repeat(60));
  console.log(`Input image: ${imagePath}`);
  console.log(`Output path: ${outputPath}`);
  console.log(`Requested version: ${requestedVersion > 0 ? requestedVersion : 'auto'}`);
  console.log(`Target control: ${targetControlPercent}%`);
  console.log(`Data: ${data}`);
  console.log(`Suffix mode: ${suffixMode}`);
  console.log(`Strict suffix: ${strictSuffix}`);
  console.log(`ECC: ${ecc}`);
  console.log(`Auto suffix: ${autoSuffix}`);
  if (!autoSuffix && explicitSuffix) {
    console.log(`Explicit suffix length: ${explicitSuffix.length}`);
  }
  console.log();

  // Check if input image exists
  if (!fs.existsSync(imagePath)) {
    console.error(`Error: Input image not found: ${imagePath}`);
    process.exit(1);
  }

  // Load the target image
  console.log('Loading target image...');
  const image = await loadImage(imagePath);
  
  // Create a canvas and draw the image
  // Note: We pass the canvas directly to generateFullQArtBestMask, not ImageData
  // because the QR-Art code needs to call getContext() on it
  const targetCanvas = createCanvas(image.width, image.height);
  const ctx = targetCanvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  
  console.log(`Image loaded: ${image.width}x${image.height}`);
  console.log();

  // Configure QR-Art generation
  console.log('Starting QR-Art generation...');
  console.log(`URL: ${data}`);
  console.log(`ECC: ${ecc}`);
  console.log(`Version: ${requestedVersion > 0 ? requestedVersion : 'auto (will be calculated)'}`);
  console.log();

  const startTime = Date.now();
  
  // Run the full QR-Art pipeline with best mask selection
  // Pass the canvas directly (not ImageData) because the QR-Art code calls getContext()
  const result: FullQArtResult = await generateFullQArtBestMask({
    data,
    targetImage: targetCanvas as unknown as ImageData,  // Cast needed - accepts Canvas or ImageData
    version: requestedVersion,
    ecc,
    autoSuffix,
    suffix: !autoSuffix && explicitSuffix ? explicitSuffix : undefined,
    targetControlPercent,
    suffixMode,
    strictSuffix,
    onProgress: (stage, percent) => {
      process.stdout.write(`\r  ${stage}: ${percent.toFixed(0)}%`);
    },
  });

  const elapsed = Date.now() - startTime;
  console.log('\n');

  if (!result.success) {
    console.error('QR-Art generation failed!');
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  console.log('QR-Art generation successful!');
  console.log('-'.repeat(40));
  console.log(`Version: ${result.version}`);
  console.log(`Mask pattern: ${result.maskPattern}`);
  console.log(`Module count: ${result.moduleCount}`);
  console.log(`Matching pixels: ${result.matchingPixels}/${result.totalControllable}`);
  console.log(`Match percentage: ${result.matchPercentage.toFixed(1)}%`);
  console.log(`Generation time: ${(elapsed / 1000).toFixed(2)}s`);
  console.log();

  // Render the QR matrix to a PNG
  console.log('Rendering to PNG...');
  
  const moduleSize = 10;  // Pixels per module
  const quietZone = 4;    // Quiet zone modules
  const qrSize = (result.moduleCount + quietZone * 2) * moduleSize;
  
  const outputCanvas = createCanvas(qrSize, qrSize);
  const outputCtx = outputCanvas.getContext('2d');
  
  // Fill background with white
  outputCtx.fillStyle = '#FFFFFF';
  outputCtx.fillRect(0, 0, qrSize, qrSize);
  
  // Draw QR modules
  outputCtx.fillStyle = '#000000';
  for (let row = 0; row < result.moduleCount; row++) {
    for (let col = 0; col < result.moduleCount; col++) {
      if (result.matrix[row]?.[col]) {
        const x = (col + quietZone) * moduleSize;
        const y = (row + quietZone) * moduleSize;
        outputCtx.fillRect(x, y, moduleSize, moduleSize);
      }
    }
  }
  
  // Save to PNG
  const buffer = outputCanvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`PNG saved to: ${outputPath}`);
  console.log(`Image size: ${qrSize}x${qrSize} pixels`);
  console.log();
  
  // Also save a higher-resolution version
  const hiResModuleSize = 20;
  const hiResQuietZone = 4;
  const hiResSize = (result.moduleCount + hiResQuietZone * 2) * hiResModuleSize;
  
  const hiResCanvas = createCanvas(hiResSize, hiResSize);
  const hiResCtx = hiResCanvas.getContext('2d');
  
  hiResCtx.fillStyle = '#FFFFFF';
  hiResCtx.fillRect(0, 0, hiResSize, hiResSize);
  
  hiResCtx.fillStyle = '#000000';
  for (let row = 0; row < result.moduleCount; row++) {
    for (let col = 0; col < result.moduleCount; col++) {
      if (result.matrix[row]?.[col]) {
        const x = (col + hiResQuietZone) * hiResModuleSize;
        const y = (row + hiResQuietZone) * hiResModuleSize;
        hiResCtx.fillRect(x, y, hiResModuleSize, hiResModuleSize);
      }
    }
  }
  
  const hiResOutputPath = outputPath.replace('.png', '-hires.png');
  const hiResBuffer = hiResCanvas.toBuffer('image/png');
  fs.writeFileSync(hiResOutputPath, hiResBuffer);
  
  console.log(`Hi-res PNG saved to: ${hiResOutputPath}`);
  console.log(`Hi-res image size: ${hiResSize}x${hiResSize} pixels`);
  console.log();
  
  console.log('='.repeat(60));
  console.log('Done!');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
