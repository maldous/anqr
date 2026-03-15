import { forEachOpaquePixel } from './for-each-opaque-pixel';
import { hslToRgbTuple } from '../color/color';

// ============================================
// PIXEL-LEVEL PATTERN FUNCTIONS
// ============================================

/**
 * Apply pulse pattern effect to image data
 * Tints dark pixels with a pulsing color based on progress
 */
export function applyAnimationPulse(data: Uint8ClampedArray, progress: number, seed: number): void {
  const pulsePhase = Math.sin(progress * Math.PI * 2);
  const intensity = 0.3 + 0.2 * Math.abs(pulsePhase);
  const hue = (seed * 31) % 360;
  const pulseColor = hslToRgbTuple(hue, 70, 50);

  forEachOpaquePixel(data, (index, r, g, b, isDark) => {
    if (isDark) {
      const tintAmount = intensity * (0.5 + pulsePhase * 0.5);
      data[index] = Math.min(255, r + pulseColor[0] * tintAmount);
      data[index + 1] = Math.min(255, g + pulseColor[1] * tintAmount);
      data[index + 2] = Math.min(255, b + pulseColor[2] * tintAmount);
    } else {
      const bf = 1 - intensity * 0.1 * (1 + pulsePhase);
      data[index] = Math.max(0, Math.round(r * bf));
      data[index + 1] = Math.max(0, Math.round(g * bf));
      data[index + 2] = Math.max(0, Math.round(b * bf));
    }
  });
}
