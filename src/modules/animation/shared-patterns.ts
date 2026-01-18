/**
 * Shared Animation Patterns
 *
 * Pixel-level animation pattern functions that operate on Uint8ClampedArray.
 * These are used by both client (useQRGenerator) and server (netlify function).
 */

import { createSeededRandom, hslToRgbTuple } from '../core';

// ============================================
// TYPES
// ============================================

export type AnimationEasing = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'bounce';

// ============================================
// EASING
// ============================================

/**
 * Apply easing function to progress value (0-1)
 */
export function applyAnimationEasing(progress: number, easing: AnimationEasing): number {
  switch (easing) {
    case 'ease_in':
      return progress * progress;
    case 'ease_out':
      return 1 - (1 - progress) * (1 - progress);
    case 'ease_in_out':
      return progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
    case 'bounce':
      if (progress < 0.5) {
        return 8 * progress * progress * progress * progress;
      } else {
        return 1 - (-2 * progress + 2) ** 4 / 2;
      }
    default:
      return progress;
  }
}

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

/**
 * Apply wave pattern effect to image data
 * Creates horizontal color waves across the image
 */
export function applyAnimationWave(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const waveFrequency = 3 + (seed % 5);
  const baseHue = (seed * 23) % 360;

  for (let y = 0; y < height; y++) {
    const wavePhase = Math.sin((y / height) * waveFrequency * Math.PI * 2 + progress * Math.PI * 2);
    const waveIntensity = (wavePhase + 1) / 2;
    const rowHue = (((baseHue + wavePhase * 30) % 360) + 360) % 360;
    const waveColor = hslToRgbTuple(rowHue, 70, 50);

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const isDark = brightness < 128;

      if (isDark) {
        const tintAmount = waveIntensity * 0.6;
        data[i] = Math.min(255, r + waveColor[0] * tintAmount);
        data[i + 1] = Math.min(255, g + waveColor[1] * tintAmount);
        data[i + 2] = Math.min(255, b + waveColor[2] * tintAmount);
      } else {
        const darkenAmount = waveIntensity * 0.15;
        data[i] = Math.round(r * (1 - darkenAmount));
        data[i + 1] = Math.round(g * (1 - darkenAmount));
        data[i + 2] = Math.round(b * (1 - darkenAmount));
      }
    }
  }
}

/**
 * Apply scanline pattern effect to image data
 * Creates a moving scan line across the image
 */
export function applyAnimationScanline(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const lineWidth = Math.max(4, height * 0.08);
  const lineY = progress * (height + lineWidth * 2) - lineWidth;
  const horizontal = seed % 2 === 0;
  const baseHue = (seed * 17) % 360;
  const scanColor = hslToRgbTuple(baseHue, 80, 50);
  const trailColor = hslToRgbTuple((baseHue + 180) % 360, 60, 60);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const pos = horizontal ? y : x;
      const linePos = horizontal ? lineY : progress * (width + lineWidth * 2) - lineWidth;
      const distance = Math.abs(pos - linePos);

      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const isDark = brightness < 128;

      if (distance < lineWidth) {
        const intensity = 1 - distance / lineWidth;
        if (isDark) {
          data[i] = Math.min(255, r + scanColor[0] * intensity * 0.8);
          data[i + 1] = Math.min(255, g + scanColor[1] * intensity * 0.8);
          data[i + 2] = Math.min(255, b + scanColor[2] * intensity * 0.8);
        } else {
          data[i] = Math.max(0, r - trailColor[0] * intensity * 0.3);
          data[i + 1] = Math.max(0, g - trailColor[1] * intensity * 0.3);
          data[i + 2] = Math.max(0, b - trailColor[2] * intensity * 0.3);
        }
      }
    }
  }
}

/**
 * Apply shimmer pattern effect to image data
 * Creates random sparkle effects
 */
export function applyAnimationShimmer(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const random = createSeededRandom(seed + Math.floor(progress * 1000));
  const spotCount = Math.floor(width * height * 0.02);
  const baseHue = (seed * 13 + progress * 100) % 360;

  for (let s = 0; s < spotCount; s++) {
    const x = Math.floor(random() * width);
    const y = Math.floor(random() * height);
    const i = (y * width + x) * 4;

    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    const spotHue = (baseHue + random() * 60) % 360;
    const sparkleColor = hslToRgbTuple(spotHue, 90, isDark ? 60 : 40);
    const intensity = 0.5 + random() * 0.5;

    if (isDark) {
      data[i] = Math.min(255, r + sparkleColor[0] * intensity);
      data[i + 1] = Math.min(255, g + sparkleColor[1] * intensity);
      data[i + 2] = Math.min(255, b + sparkleColor[2] * intensity);
    } else {
      data[i] = Math.max(0, r - (255 - sparkleColor[0]) * intensity * 0.3);
      data[i + 1] = Math.max(0, g - (255 - sparkleColor[1]) * intensity * 0.3);
      data[i + 2] = Math.max(0, b - (255 - sparkleColor[2]) * intensity * 0.3);
    }
  }
}

/**
 * Apply drift pattern effect to image data
 * Creates flowing color gradients
 */
export function applyAnimationDrift(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const scale = 0.015 + (seed % 10) * 0.003;
  const timeOffset = progress * Math.PI * 2;
  const baseHue = (seed * 41 + progress * 60) % 360;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const isDark = brightness < 128;

      const drift = Math.sin(x * scale + timeOffset) * Math.cos(y * scale + timeOffset);
      const driftIntensity = (drift + 1) / 2;
      const driftHue = (((baseHue + drift * 40) % 360) + 360) % 360;
      const driftColor = hslToRgbTuple(driftHue, 60, 50);

      if (isDark) {
        const tintAmount = driftIntensity * 0.5;
        data[i] = Math.min(255, r + driftColor[0] * tintAmount);
        data[i + 1] = Math.min(255, g + driftColor[1] * tintAmount);
        data[i + 2] = Math.min(255, b + driftColor[2] * tintAmount);
      } else {
        const darkenAmount = driftIntensity * 0.1;
        data[i] = Math.round(r * (1 - darkenAmount));
        data[i + 1] = Math.round(g * (1 - darkenAmount));
        data[i + 2] = Math.round(b * (1 - darkenAmount));
      }
    }
  }
}

/**
 * Apply color cycle pattern effect to image data
 * Cycles hue across the animation
 */
export function applyAnimationColorCycle(
  data: Uint8ClampedArray,
  progress: number,
  seed: number
): void {
  const baseHue = (progress * 360 + seed) % 360;
  const tintColor = hslToRgbTuple(baseHue, 80, 50);
  const complementHue = (baseHue + 180) % 360;
  const complementColor = hslToRgbTuple(complementHue, 30, 70);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    if (isDark) {
      const tintAmount = 0.7;
      data[i] = Math.min(255, r + tintColor[0] * tintAmount);
      data[i + 1] = Math.min(255, g + tintColor[1] * tintAmount);
      data[i + 2] = Math.min(255, b + tintColor[2] * tintAmount);
    } else {
      const tintAmount = 0.15;
      data[i] = Math.max(0, Math.round(r - (255 - complementColor[0]) * tintAmount));
      data[i + 1] = Math.max(0, Math.round(g - (255 - complementColor[1]) * tintAmount));
      data[i + 2] = Math.max(0, Math.round(b - (255 - complementColor[2]) * tintAmount));
    }
  }
}
