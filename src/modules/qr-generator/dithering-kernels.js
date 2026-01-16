/**
 * QR Generator Dithering Kernels Module
 * Error diffusion kernel definitions for dithering algorithms
 */

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
