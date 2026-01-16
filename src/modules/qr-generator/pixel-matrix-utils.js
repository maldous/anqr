/**
 * Pixel Matrix Utilities
 * Helper functions for pixel decision matrix generation
 */

/**
 * Get the scale factor for a given overlay mode.
 * - Standard modes: scale=1 (module-level rendering)
 * - Dithered/Blue-noise modes: scale=3 (subpixel dithering)
 * - Subpixel modes: scale=2,3,4 (configurable grid)
 * @param {string} overlayMode - The overlay mode
 * @param {object} config - Generator config
 * @returns {number} Scale factor
 */
export function getScaleFactor(overlayMode, config) {
  switch (overlayMode) {
    case 'dithered':
    case 'blue-noise':
      return 3; // Fixed 3x scale for error diffusion modes
    case 'subpixel':
    case 'subpixel-size': {
      // Configurable NxN grid
      const gridSizeStr = config?.subpixelGridSize || '3x3';
      return Number.parseInt(gridSizeStr.charAt(0), 10) || 3;
    }
    default:
      return 1; // Module-level rendering
  }
}

/**
 * Generate base QR matrix at requested scale (no overlay)
 * @param {object} qr - QR code object
 * @param {number} scaledSize - Size at scale
 * @param {number} scale - Scale factor
 * @returns {{matrix: boolean[][], colors: object[][]}}
 */
export function generateBaseMatrix(qr, scaledSize, scale) {
  const matrix = [];
  const colors = [];
  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];
    for (let x = 0; x < scaledSize; x++) {
      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const isDark = qr.isDark(moduleRow, moduleCol);
      matrix[y][x] = isDark;
      colors[y][x] = isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
    }
  }
  return { matrix, colors };
}

/**
 * Apply per-ECC intensity limits
 * @param {object} config - Generator config
 * @returns {{effectiveIntensity: number, effectiveConfig: object}}
 */
export function getEffectiveIntensity(config) {
  let effectiveIntensity = config.overlayIntensity ?? 100;
  if (config.maxOverlayIntensityByEcc) {
    const eccLimit = config.maxOverlayIntensityByEcc[config.errorCorrection];
    if (eccLimit !== undefined && eccLimit < effectiveIntensity) {
      effectiveIntensity = eccLimit;
    }
  }
  const effectiveConfig = { ...config, overlayIntensity: effectiveIntensity };
  return { effectiveIntensity, effectiveConfig };
}
