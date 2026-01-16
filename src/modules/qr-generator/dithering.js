/**
 * QR Generator Dithering Module
 * Error diffusion dithering and related algorithms
 */

import { applyDither } from '../dither-algorithms.ts';
import { isData, isLocked } from '../qr-core.ts';
import { createSeededRandom } from './utils.js';

/**
 * Diffusion kernel definitions for error diffusion dithering.
 * Each kernel defines offsets (dx, dy) and weights for error distribution.
 */
export function getDiffusionKernel(kernelName) {
  const kernels = {
    floyd_steinberg: [
      { dx: 1, dy: 0, w: 7 / 16 },
      { dx: -1, dy: 1, w: 3 / 16 },
      { dx: 0, dy: 1, w: 5 / 16 },
      { dx: 1, dy: 1, w: 1 / 16 },
    ],
    jarvis_judice_ninke: [
      { dx: 1, dy: 0, w: 7 / 48 },
      { dx: 2, dy: 0, w: 5 / 48 },
      { dx: -2, dy: 1, w: 3 / 48 },
      { dx: -1, dy: 1, w: 5 / 48 },
      { dx: 0, dy: 1, w: 7 / 48 },
      { dx: 1, dy: 1, w: 5 / 48 },
      { dx: 2, dy: 1, w: 3 / 48 },
      { dx: -2, dy: 2, w: 1 / 48 },
      { dx: -1, dy: 2, w: 3 / 48 },
      { dx: 0, dy: 2, w: 5 / 48 },
      { dx: 1, dy: 2, w: 3 / 48 },
      { dx: 2, dy: 2, w: 1 / 48 },
    ],
    stucki: [
      { dx: 1, dy: 0, w: 8 / 42 },
      { dx: 2, dy: 0, w: 4 / 42 },
      { dx: -2, dy: 1, w: 2 / 42 },
      { dx: -1, dy: 1, w: 4 / 42 },
      { dx: 0, dy: 1, w: 8 / 42 },
      { dx: 1, dy: 1, w: 4 / 42 },
      { dx: 2, dy: 1, w: 2 / 42 },
      { dx: -2, dy: 2, w: 1 / 42 },
      { dx: -1, dy: 2, w: 2 / 42 },
      { dx: 0, dy: 2, w: 4 / 42 },
      { dx: 1, dy: 2, w: 2 / 42 },
      { dx: 2, dy: 2, w: 1 / 42 },
    ],
    burkes: [
      { dx: 1, dy: 0, w: 8 / 32 },
      { dx: 2, dy: 0, w: 4 / 32 },
      { dx: -2, dy: 1, w: 2 / 32 },
      { dx: -1, dy: 1, w: 4 / 32 },
      { dx: 0, dy: 1, w: 8 / 32 },
      { dx: 1, dy: 1, w: 4 / 32 },
      { dx: 2, dy: 1, w: 2 / 32 },
    ],
    sierra: [
      { dx: 1, dy: 0, w: 5 / 32 },
      { dx: 2, dy: 0, w: 3 / 32 },
      { dx: -2, dy: 1, w: 2 / 32 },
      { dx: -1, dy: 1, w: 4 / 32 },
      { dx: 0, dy: 1, w: 5 / 32 },
      { dx: 1, dy: 1, w: 4 / 32 },
      { dx: 2, dy: 1, w: 2 / 32 },
      { dx: -1, dy: 2, w: 2 / 32 },
      { dx: 0, dy: 2, w: 3 / 32 },
      { dx: 1, dy: 2, w: 2 / 32 },
    ],
    sierra_2: [
      { dx: 1, dy: 0, w: 4 / 16 },
      { dx: 2, dy: 0, w: 3 / 16 },
      { dx: -2, dy: 1, w: 1 / 16 },
      { dx: -1, dy: 1, w: 2 / 16 },
      { dx: 0, dy: 1, w: 3 / 16 },
      { dx: 1, dy: 1, w: 2 / 16 },
      { dx: 2, dy: 1, w: 1 / 16 },
    ],
    sierra_lite: [
      { dx: 1, dy: 0, w: 2 / 4 },
      { dx: -1, dy: 1, w: 1 / 4 },
      { dx: 0, dy: 1, w: 1 / 4 },
    ],
    atkinson: [
      { dx: 1, dy: 0, w: 1 / 8 },
      { dx: 2, dy: 0, w: 1 / 8 },
      { dx: -1, dy: 1, w: 1 / 8 },
      { dx: 0, dy: 1, w: 1 / 8 },
      { dx: 1, dy: 1, w: 1 / 8 },
      { dx: 0, dy: 2, w: 1 / 8 },
    ],
  };

  return kernels[kernelName] || kernels.floyd_steinberg;
}

/**
 * Distribute error to neighboring pixels using the specified diffusion kernel
 * Supports serpentine scanning with leftToRight parameter and dither strength
 */
export function distributeError(
  imageData,
  x,
  y,
  size,
  scale,
  errorR,
  errorG,
  errorB,
  leftToRight = true,
  kernel = null,
  strength = 1
) {
  const canChange = (px, py) => {
    if (px < 0 || py < 0 || px >= size || py >= size) return false;
    return !(isLocked(size, px, py, scale) || isData(px, py, scale));
  };

  // Apply strength to errors
  const scaledErrorR = errorR * strength;
  const scaledErrorG = errorG * strength;
  const scaledErrorB = errorB * strength;
  // Note: strength of 1.0 means full error diffusion

  // Use provided kernel or default Floyd-Steinberg
  const diffusionKernel = kernel || [
    { dx: 1, dy: 0, w: 7 / 16 },
    { dx: -1, dy: 1, w: 3 / 16 },
    { dx: 0, dy: 1, w: 5 / 16 },
    { dx: 1, dy: 1, w: 1 / 16 },
  ];

  // Distribute error using the kernel
  for (const { dx, dy, w } of diffusionKernel) {
    // Flip x direction for serpentine scanning on reverse passes
    const effectiveDx = leftToRight ? dx : -dx;
    const nx = x + effectiveDx;
    const ny = y + dy;

    if (canChange(nx, ny)) {
      imageData[ny][nx].r += scaledErrorR * w;
      imageData[ny][nx].g += scaledErrorG * w;
      imageData[ny][nx].b += scaledErrorB * w;
    }
  }
}

/**
 * Apply dithering to QR matrix - async version using canvas factory
 * Supports multiple diffusion kernels, serpentine scanning, and dither strength.
 */
export async function applyDitherToMatrix(
  baseMatrix,
  scaledSize,
  scale,
  overlayCanvas,
  overlayIntensity,
  colorMode,
  serpentine,
  config,
  createCanvasFn,
  loadImageDataRGBFn
) {
  // Initialize output
  const matrix = baseMatrix.map((row) => [...row]);
  const colors = baseMatrix.map((row) =>
    row.map((isDark) => (isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }))
  );

  if (!overlayCanvas) {
    return { matrix, colors };
  }

  // Get dither settings from config
  const ditherStrength = (config.ditherStrength ?? 100) / 100; // 0-1 scale
  const diffusionKernel = config.diffusionKernel || 'floyd_steinberg';
  const fsKernel = getDiffusionKernel(diffusionKernel);

  // Load overlay image data with preprocessing
  const imageData = await loadImageDataRGBFn(overlayCanvas, scaledSize, config);
  const intensity = overlayIntensity / 100;

  // Convert to grayscale if needed
  if (colorMode === 'grayscale' || colorMode === 'bw') {
    for (let y = 0; y < scaledSize; y++) {
      for (let x = 0; x < scaledSize; x++) {
        const { r, g, b } = imageData[y][x];
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        imageData[y][x] = { r: gray, g: gray, b: gray };
      }
    }
  }

  // Apply Floyd-Steinberg error diffusion to free points
  // With optional serpentine scanning (alternating row direction)
  for (let y = 0; y < scaledSize; y++) {
    const leftToRight = !serpentine || y % 2 === 0;
    const xStart = leftToRight ? 0 : scaledSize - 1;
    const xEnd = leftToRight ? scaledSize : -1;
    const xStep = leftToRight ? 1 : -1;

    for (let x = xStart; leftToRight ? x < xEnd : x > xEnd; x += xStep) {
      // Skip locked areas and data points
      if (isLocked(scaledSize, x, y, scale)) continue;
      if (isData(x, y, scale)) continue;

      const pixel = imageData[y][x];

      if (colorMode === 'bw') {
        const gray = pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114;
        const newVal = gray > 0.5 ? 1 : 0;
        const error = gray - newVal;

        imageData[y][x] = { r: newVal, g: newVal, b: newVal };
        distributeError(
          imageData,
          x,
          y,
          scaledSize,
          scale,
          error,
          error,
          error,
          leftToRight,
          fsKernel,
          ditherStrength
        );
      } else if (colorMode === 'grayscale') {
        const gray = pixel.r;
        const levels = 4;
        const newVal = Math.round(gray * (levels - 1)) / (levels - 1);
        const error = gray - newVal;

        imageData[y][x] = { r: newVal, g: newVal, b: newVal };
        distributeError(
          imageData,
          x,
          y,
          scaledSize,
          scale,
          error,
          error,
          error,
          leftToRight,
          fsKernel,
          ditherStrength
        );
      } else {
        const levels = 4;
        const newR = Math.round(pixel.r * (levels - 1)) / (levels - 1);
        const newG = Math.round(pixel.g * (levels - 1)) / (levels - 1);
        const newB = Math.round(pixel.b * (levels - 1)) / (levels - 1);

        const errorR = pixel.r - newR;
        const errorG = pixel.g - newG;
        const errorB = pixel.b - newB;

        imageData[y][x] = { r: newR, g: newG, b: newB };
        distributeError(
          imageData,
          x,
          y,
          scaledSize,
          scale,
          errorR,
          errorG,
          errorB,
          leftToRight,
          fsKernel,
          ditherStrength
        );
      }
    }
  }

  // Merge dithered image with QR matrix
  // Use seeded PRNG for deterministic output (same settings = same output)
  // Seed based on scale to ensure reproducibility
  const seededRandom = createSeededRandom(scale * 12345);

  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      if (isLocked(scaledSize, x, y, scale)) continue;
      if (isData(x, y, scale)) continue;

      const pixel = imageData[y][x];
      const brightness = pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114;
      // Use seeded PRNG instead of Math.random() for deterministic output
      const useImage = seededRandom() < intensity;

      if (useImage) {
        matrix[y][x] = brightness < 0.5;
        colors[y][x] = {
          r: Math.round(Math.max(0, Math.min(1, pixel.r)) * 255),
          g: Math.round(Math.max(0, Math.min(1, pixel.g)) * 255),
          b: Math.round(Math.max(0, Math.min(1, pixel.b)) * 255),
        };
      }
    }
  }

  return { matrix, colors };
}

/**
 * Apply advanced dithering using dither-algorithms module
 * Supports all dithering types: ordered, error diffusion, blue noise, etc.
 */
export async function applyAdvancedDither(overlayCanvas, moduleCount, config, createCanvasFn) {
  // Get overlay as ImageData at module resolution using canvas factory
  const tempCanvas = await createCanvasFn(moduleCount, moduleCount);
  const ctx = tempCanvas.getContext('2d');
  ctx.drawImage(overlayCanvas, 0, 0, moduleCount, moduleCount);
  const imageData = ctx.getImageData(0, 0, moduleCount, moduleCount);

  // Build dither options from config
  const ditherOptions = {
    kind: config.ditherKind || 'error_diffusion',
    strength: config.ditherStrength ?? 100,
    serpentine: config.serpentine !== false,
    diffusionKernel: config.diffusionKernel || 'floyd_steinberg',
    orderedMatrix: config.orderedMatrix || 'bayer4',
    colorMode: config.colorMode || 'bw',
    levels: 2,
    blueNoiseSeed: config.blueNoiseSeed || 0,
    blueNoiseTileSize: config.blueNoiseTileSize || 64,
  };

  // Apply dithering algorithm
  const result = applyDither(imageData, ditherOptions);
  return result;
}

/**
 * Apply true dithering to QR matrix based on overlay brightness
 */
export function applyTrueDither(
  qr,
  overlayData,
  config,
  extremeMode,
  isStructuralModule,
  isFinderPattern,
  isEccSafeToModifyFn,
  hashStringFn,
  createSeededRandomFn
) {
  const moduleCount = qr.getModuleCount();
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  // ECC-aware mode tracking
  const eccAware = config.eccAwareEnabled === true;
  let totalModifiedCount = 0;

  // Create a seeded PRNG for deterministic output
  // Seed from content hash + config to ensure same settings = same output
  const seed = config.seed ?? hashStringFn(config.content || '');
  const seededRandom = createSeededRandomFn(seed);

  // Create modifiable pattern - start with original QR
  const modifiedPattern = [];

  for (let row = 0; row < moduleCount; row++) {
    modifiedPattern[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      modifiedPattern[row][col] = qr.isDark(row, col);
    }
  }

  // Count total data modules for ECC budget calculation
  let totalDataModules = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!isStructuralModule(row, col, moduleCount, version)) {
        totalDataModules++;
      }
    }
  }

  // In extreme mode, flip ALL non-finder modules to match image
  // In normal dither mode, respect error correction limits
  if (extremeMode) {
    // Extreme: flip everything except finder patterns
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Only protect finder patterns (corners)
        if (isFinderPattern(row, col, moduleCount)) continue;

        const brightness = overlayData[row]?.[col] ?? 0.5;
        const intensity = config.overlayIntensity / 100;

        // Desired state based on image
        const desiredDark = brightness < 0.5;

        // ECC-aware check
        if (eccAware && desiredDark !== modifiedPattern[row][col]) {
          if (
            !isEccSafeToModifyFn(
              row,
              col,
              moduleCount,
              version,
              config,
              totalModifiedCount,
              totalDataModules
            )
          ) {
            continue; // Skip this modification
          }
          totalModifiedCount++;
        }

        // Apply with intensity blend using seeded PRNG for determinism
        if (intensity >= 1 || seededRandom() < intensity) {
          modifiedPattern[row][col] = desiredDark;
        }
      }
    }
  } else {
    // Safe dither: respect error correction limits
    const ecCapacity = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };
    const maxFlipRatio = ecCapacity[config.errorCorrection] || 0.25;
    const intensity = config.overlayIntensity / 100;

    let dataModuleCount = 0;
    const flipCandidates = [];

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (isStructuralModule(row, col, moduleCount, version)) continue;
        dataModuleCount++;

        const currentState = qr.isDark(row, col);
        const brightness = overlayData[row]?.[col] ?? 0.5;
        const desiredState = brightness < 0.5;

        if (currentState !== desiredState) {
          flipCandidates.push({
            row,
            col,
            score: Math.abs(brightness - 0.5),
            desiredState,
          });
        }
      }
    }

    // Sort by visual importance and flip up to limit
    flipCandidates.sort((a, b) => b.score - a.score);
    const maxFlips = Math.floor(dataModuleCount * maxFlipRatio * intensity);

    for (let i = 0; i < Math.min(flipCandidates.length, maxFlips); i++) {
      const c = flipCandidates[i];
      modifiedPattern[c.row][c.col] = c.desiredState;
    }
  }

  return modifiedPattern;
}
