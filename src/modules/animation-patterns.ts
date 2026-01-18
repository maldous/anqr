/**
 * Animation Patterns Module
 * Generates animated QR code effects from static images
 */

// Import from canonical core module
import { createSeededRandom, hslToRgbTuple } from './core';

export type AnimationPattern =
  | 'none'
  | 'pulse'
  | 'wave'
  | 'scanline'
  | 'shimmer'
  | 'drift'
  | 'jitter'
  | 'color_cycle';
export type InterpolationMode = 'none' | 'crossfade' | 'morph';

// Use tuple format from core
const hslToRgb = hslToRgbTuple;

// Wrapper for seededRandom to maintain same interface
const seededRandom = createSeededRandom;

/**
 * Generate animation frames using a pattern effect on a static image
 */
export function generatePatternFrames(
  sourceCanvas: HTMLCanvasElement,
  pattern: AnimationPattern,
  frameCount: number = 24,
  seed: number = 0
): HTMLCanvasElement[] {
  if (pattern === 'none') {
    return [sourceCanvas];
  }

  const frames: HTMLCanvasElement[] = [];
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // Get source image data
  const sourceCtx = sourceCanvas.getContext('2d');
  if (!sourceCtx) throw new Error('Could not get canvas context');
  const sourceData = sourceCtx.getImageData(0, 0, width, height);

  for (let i = 0; i < frameCount; i++) {
    const progress = i / frameCount; // 0 to 1
    const frame = document.createElement('canvas');
    frame.width = width;
    frame.height = height;
    const ctx = frame.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Copy source data
    const frameData = ctx.createImageData(width, height);
    frameData.data.set(sourceData.data);

    // Apply pattern effect
    switch (pattern) {
      case 'pulse':
        applyPulsePattern(frameData, progress, seed);
        break;
      case 'wave':
        applyWavePattern(frameData, progress, width, height, seed);
        break;
      case 'scanline':
        applyScanlinePattern(frameData, progress, width, height, seed);
        break;
      case 'shimmer':
        applyShimmerPattern(frameData, progress, width, height, seed);
        break;
      case 'drift':
        applyDriftPattern(frameData, progress, width, height, seed);
        break;
      case 'jitter':
        applyJitterPattern(frameData, progress, width, height, seed);
        break;
      case 'color_cycle':
        applyColorCyclePattern(frameData, progress, width, height, seed);
        break;
    }

    ctx.putImageData(frameData, 0, 0);
    frames.push(frame);
  }

  return frames;
}

/**
 * Pulse pattern - scale and color intensity oscillates
 * Works on black/white QR codes by pulsing color tint
 */
function applyPulsePattern(imageData: ImageData, progress: number, seed: number): void {
  const data = imageData.data;
  // Sine wave oscillation for smooth pulsing
  const pulsePhase = Math.sin(progress * Math.PI * 2);
  const intensity = 0.3 + 0.2 * Math.abs(pulsePhase);

  // Pulse color based on seed
  const hue = (seed * 31) % 360;
  const pulseColor = hslToRgb(hue, 70, 50);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    if (isDark) {
      // Pulse dark pixels with color tint
      const tintAmount = intensity * (0.5 + pulsePhase * 0.5);
      data[i] = Math.min(255, r + pulseColor[0] * tintAmount);
      data[i + 1] = Math.min(255, g + pulseColor[1] * tintAmount);
      data[i + 2] = Math.min(255, b + pulseColor[2] * tintAmount);
    } else {
      // Subtle brightness pulse on light pixels
      const brightnessFactor = 1 - intensity * 0.1 * (1 + pulsePhase);
      data[i] = Math.max(0, Math.round(r * brightnessFactor));
      data[i + 1] = Math.max(0, Math.round(g * brightnessFactor));
      data[i + 2] = Math.max(0, Math.round(b * brightnessFactor));
    }
  }
}

/**
 * Wave pattern - horizontal wave with color gradient effect
 * Works on black/white QR codes by adding wave-based color tints
 */
function applyWavePattern(
  imageData: ImageData,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const data = imageData.data;
  const waveFrequency = 3 + (seed % 5);

  // Base hue for wave colors
  const baseHue = (seed * 23) % 360;

  for (let y = 0; y < height; y++) {
    // Calculate wave phase for this row
    const wavePhase = Math.sin((y / height) * waveFrequency * Math.PI * 2 + progress * Math.PI * 2);
    const waveIntensity = (wavePhase + 1) / 2; // Normalize to 0-1

    // Wave color varies along the wave (ensure positive hue)
    const rowHue = (((baseHue + wavePhase * 30) % 360) + 360) % 360;
    const waveColor = hslToRgb(rowHue, 70, 50);

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const isDark = brightness < 128;

      if (isDark) {
        // Tint dark pixels based on wave phase
        const tintAmount = waveIntensity * 0.6;
        data[i] = Math.min(255, r + waveColor[0] * tintAmount);
        data[i + 1] = Math.min(255, g + waveColor[1] * tintAmount);
        data[i + 2] = Math.min(255, b + waveColor[2] * tintAmount);
      } else {
        // Subtle darkening wave on light pixels
        const darkenAmount = waveIntensity * 0.15;
        data[i] = Math.round(r * (1 - darkenAmount));
        data[i + 1] = Math.round(g * (1 - darkenAmount));
        data[i + 2] = Math.round(b * (1 - darkenAmount));
      }
    }
  }
}

/**
 * Scanline pattern - moving bright line across image with inversion effect
 * Works on black/white QR codes by inverting colors near the scanline
 */
function applyScanlinePattern(
  imageData: ImageData,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const data = imageData.data;
  const lineWidth = Math.max(4, height * 0.08); // 8% of height for more visibility
  const horizontal = seed % 2 === 0;
  const maxPos = horizontal ? height : width;
  const linePos = progress * (maxPos + lineWidth * 2) - lineWidth;

  // Scanline color based on seed for variety
  const hue = (seed * 37) % 360;
  const scanColor = hslToRgb(hue, 80, 60);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const pos = horizontal ? y : x;
      const distance = Math.abs(pos - linePos);

      if (distance < lineWidth) {
        // Calculate intensity based on distance (1 at center, 0 at edges)
        const intensity = 1 - distance / lineWidth;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Determine if pixel is dark (QR module) or light (background)
        const brightness = (r + g + b) / 3;
        const isDark = brightness < 128;

        if (isDark) {
          // For dark pixels: tint with scanline color
          data[i] = Math.min(255, r + scanColor[0] * intensity * 0.8);
          data[i + 1] = Math.min(255, g + scanColor[1] * intensity * 0.8);
          data[i + 2] = Math.min(255, b + scanColor[2] * intensity * 0.8);
        } else {
          // For light pixels: add complementary tint and slight darkening
          const compColor = hslToRgb((hue + 180) % 360, 60, 70);
          data[i] = Math.max(0, r - (255 - compColor[0]) * intensity * 0.3);
          data[i + 1] = Math.max(0, g - (255 - compColor[1]) * intensity * 0.3);
          data[i + 2] = Math.max(0, b - (255 - compColor[2]) * intensity * 0.3);
        }
      }
    }
  }
}

/**
 * Shimmer pattern - colorful sparkle effect
 * Works on black/white QR codes by adding colored sparkles
 */
function applyShimmerPattern(
  imageData: ImageData,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const data = imageData.data;

  // Use seeded random for consistency
  const random = seededRandom(seed + Math.floor(progress * 100));

  // More spots for visibility (2% of pixels)
  const spotCount = Math.floor(width * height * 0.02);

  // Generate sparkle colors that cycle over time
  const baseHue = (progress * 360 + seed * 17) % 360;

  for (let s = 0; s < spotCount; s++) {
    const x = Math.floor(random() * width);
    const y = Math.floor(random() * height);
    const i = (y * width + x) * 4;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    // Random sparkle color with hue variation
    const sparkleHue = (baseHue + random() * 60 - 30) % 360;
    const sparkleSat = 70 + random() * 30;
    const sparkleLightness = isDark ? 50 + random() * 30 : 30 + random() * 20;
    const sparkleColor = hslToRgb(sparkleHue, sparkleSat, sparkleLightness);

    // Blend intensity varies by spot
    const intensity = 0.5 + random() * 0.5;

    if (isDark) {
      // Add bright colored sparkle to dark pixels
      data[i] = Math.min(255, r + sparkleColor[0] * intensity);
      data[i + 1] = Math.min(255, g + sparkleColor[1] * intensity);
      data[i + 2] = Math.min(255, b + sparkleColor[2] * intensity);
    } else {
      // Add darker colored sparkle to light pixels
      data[i] = Math.max(0, Math.min(255, r - (255 - sparkleColor[0]) * intensity * 0.5));
      data[i + 1] = Math.max(0, Math.min(255, g - (255 - sparkleColor[1]) * intensity * 0.5));
      data[i + 2] = Math.max(0, Math.min(255, b - (255 - sparkleColor[2]) * intensity * 0.5));
    }
  }
}

/**
 * Drift pattern - flowing color gradient drift
 * Works on black/white QR codes by adding drifting color patterns
 */
function applyDriftPattern(
  imageData: ImageData,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const data = imageData.data;

  // Create a drifting pattern using sine waves
  const scale = 0.015 + (seed % 10) * 0.003;
  const timeOffset = progress * Math.PI * 2;

  // Base hue for drifting colors
  const baseHue = (seed * 41 + progress * 60) % 360;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const isDark = brightness < 128;

      // Calculate drift value using sine waves
      const drift = Math.sin(x * scale + timeOffset) * Math.cos(y * scale + timeOffset);
      const driftIntensity = (drift + 1) / 2; // Normalize to 0-1

      // Drift color varies spatially (ensure positive hue)
      const driftHue = (((baseHue + drift * 40) % 360) + 360) % 360;
      const driftColor = hslToRgb(driftHue, 60, 50);

      if (isDark) {
        // Apply drifting color tint to dark pixels
        const tintAmount = driftIntensity * 0.5;
        data[i] = Math.min(255, r + driftColor[0] * tintAmount);
        data[i + 1] = Math.min(255, g + driftColor[1] * tintAmount);
        data[i + 2] = Math.min(255, b + driftColor[2] * tintAmount);
      } else {
        // Subtle drift on light pixels
        const darkenAmount = driftIntensity * 0.1;
        data[i] = Math.round(r * (1 - darkenAmount));
        data[i + 1] = Math.round(g * (1 - darkenAmount));
        data[i + 2] = Math.round(b * (1 - darkenAmount));
      }
    }
  }
}

/**
 * Module Jitter pattern - random position offset per module
 */
function applyJitterPattern(
  imageData: ImageData,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const data = imageData.data;
  const tempData = new Uint8ClampedArray(data);

  // Jitter amount varies with animation progress
  const jitterAmount = Math.sin(progress * Math.PI * 2) * 2 + 2; // 0-4 pixels
  const random = seededRandom(seed + Math.floor(progress * 100));

  // Process in blocks (simulate QR modules)
  const moduleSize = Math.max(4, Math.floor(width / 40)); // Approximate module size

  for (let my = 0; my < height; my += moduleSize) {
    for (let mx = 0; mx < width; mx += moduleSize) {
      // Random offset for this module
      const offsetX = Math.floor((random() - 0.5) * jitterAmount);
      const offsetY = Math.floor((random() - 0.5) * jitterAmount);

      // Move pixels in this module
      for (let dy = 0; dy < moduleSize && my + dy < height; dy++) {
        for (let dx = 0; dx < moduleSize && mx + dx < width; dx++) {
          const srcX = mx + dx;
          const srcY = my + dy;
          const dstX = Math.max(0, Math.min(width - 1, srcX + offsetX));
          const dstY = Math.max(0, Math.min(height - 1, srcY + offsetY));

          const srcI = (srcY * width + srcX) * 4;
          const dstI = (dstY * width + dstX) * 4;

          // Copy from temp to destination
          data[dstI] = tempData[srcI];
          data[dstI + 1] = tempData[srcI + 1];
          data[dstI + 2] = tempData[srcI + 2];
          data[dstI + 3] = tempData[srcI + 3];
        }
      }
    }
  }
}

/**
 * Color Cycle pattern - tints QR code with cycling colors
 * Works on black/white QR codes by tinting dark modules with cycling colors
 */
function applyColorCyclePattern(
  imageData: ImageData,
  progress: number,
  _width: number,
  _height: number,
  seed: number
): void {
  const data = imageData.data;

  // Calculate cycling hue (full rotation per animation cycle)
  const hue = (progress * 360 + seed * 17) % 360;

  // Generate the tint color for dark modules
  const tintColor = hslToRgb(hue, 85, 45); // Saturated, medium lightness

  // Generate complementary color for subtle background tinting
  const compHue = (hue + 180) % 360;
  const bgTintColor = hslToRgb(compHue, 30, 90); // Low saturation, high lightness

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Determine if pixel is dark (QR module) or light (background)
    const brightness = (r + g + b) / 3;

    if (brightness < 128) {
      // Dark pixel - replace with tint color, preserving relative darkness
      const darkFactor = 1 - brightness / 128; // 1 for pure black, 0 for mid-gray
      data[i] = Math.round(tintColor[0] * darkFactor + r * (1 - darkFactor));
      data[i + 1] = Math.round(tintColor[1] * darkFactor + g * (1 - darkFactor));
      data[i + 2] = Math.round(tintColor[2] * darkFactor + b * (1 - darkFactor));
    } else {
      // Light pixel - subtle complementary tint
      const _lightFactor = (brightness - 128) / 127; // 0 for mid-gray, 1 for pure white
      const tintStrength = 0.15; // Subtle background tint
      data[i] = Math.round(r * (1 - tintStrength) + bgTintColor[0] * tintStrength);
      data[i + 1] = Math.round(g * (1 - tintStrength) + bgTintColor[1] * tintStrength);
      data[i + 2] = Math.round(b * (1 - tintStrength) + bgTintColor[2] * tintStrength);
    }
  }
}

/**
 * Interpolate between frames for smoother animation
 */
export function interpolateFrames(
  frames: HTMLCanvasElement[],
  mode: InterpolationMode,
  insertCount: number = 1
): HTMLCanvasElement[] {
  if (mode === 'none' || frames.length < 2 || insertCount < 1) {
    return frames;
  }

  const result: HTMLCanvasElement[] = [];
  const width = frames[0].width;
  const height = frames[0].height;

  for (let i = 0; i < frames.length; i++) {
    result.push(frames[i]);

    // Don't interpolate after last frame
    if (i < frames.length - 1) {
      const frameA = frames[i];
      const frameB = frames[i + 1];

      // Insert interpolated frames
      for (let j = 1; j <= insertCount; j++) {
        const t = j / (insertCount + 1); // 0 < t < 1
        const interpolated = document.createElement('canvas');
        interpolated.width = width;
        interpolated.height = height;
        const ctx = interpolated.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        if (mode === 'crossfade') {
          // Simple crossfade - draw both frames with opacity
          ctx.globalAlpha = 1 - t;
          ctx.drawImage(frameA, 0, 0);
          ctx.globalAlpha = t;
          ctx.drawImage(frameB, 0, 0);
          ctx.globalAlpha = 1;
        } else if (mode === 'morph') {
          // Pixel-level blending for smoother morph
          const ctxA = frameA.getContext('2d');
          const ctxB = frameB.getContext('2d');
          if (!(ctxA && ctxB)) throw new Error('Could not get canvas context');
          const dataA = ctxA.getImageData(0, 0, width, height);
          const dataB = ctxB.getImageData(0, 0, width, height);
          const result = ctx.createImageData(width, height);

          for (let p = 0; p < dataA.data.length; p += 4) {
            const invT = 1 - t;
            result.data[p] = Math.round(dataA.data[p] * invT + dataB.data[p] * t);
            result.data[p + 1] = Math.round(dataA.data[p + 1] * invT + dataB.data[p + 1] * t);
            result.data[p + 2] = Math.round(dataA.data[p + 2] * invT + dataB.data[p + 2] * t);
            result.data[p + 3] = Math.round(dataA.data[p + 3] * invT + dataB.data[p + 3] * t);
          }

          ctx.putImageData(result, 0, 0);
        }

        result.push(interpolated);
      }
    }
  }

  return result;
}

export default {
  generatePatternFrames,
  interpolateFrames,
};
