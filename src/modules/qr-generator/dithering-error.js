/**
 * QR Generator Dithering Error Distribution Module
 * Handles error distribution to neighboring pixels
 */

import { isData, isLocked } from '../qr-core.ts';

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
