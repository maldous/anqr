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

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    if (isDark) {
      const tintAmount = intensity * (0.5 + pulsePhase * 0.5);
      data[i] = Math.min(255, r + pulseColor[0] * tintAmount);
      data[i + 1] = Math.min(255, g + pulseColor[1] * tintAmount);
      data[i + 2] = Math.min(255, b + pulseColor[2] * tintAmount);
    } else {
      const bf = 1 - intensity * 0.1 * (1 + pulsePhase);
      data[i] = Math.max(0, Math.round(r * bf));
      data[i + 1] = Math.max(0, Math.round(g * bf));
      data[i + 2] = Math.max(0, Math.round(b * bf));
    }
  }
}
