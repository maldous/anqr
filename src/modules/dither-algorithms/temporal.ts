/**
 * Temporal Dithering for Animation
 *
 * Provides temporal dithering for animated QR codes to improve perceived image quality.
 * By varying the dither pattern across frames, the eye perceives a smoother, higher-quality image.
 *
 * Two types of temporal dithering:
 * 1. Temporal blue noise dithering algorithm (temporalBlueNoiseDither)
 * 2. Temporal offset utilities for animation frames (calculateTemporalOffset, etc.)
 */

import type { ColorMode, DitherResult } from './types';
import { generateBlueNoiseTile } from './blue-noise';
import { rgbToGray } from './utils';

// ============================================================================
// Temporal Dither Mode Types and Utilities
// ============================================================================

/**
 * Temporal dithering modes:
 * - 'off': No temporal dithering (static pattern)
 * - 'blue_noise': Uses golden ratio-based offsets for optimal temporal distribution
 * - 'flicker_safe': Uses carefully chosen offsets that minimize perceived flicker
 */
export type TemporalDitherMode = 'off' | 'blue_noise' | 'flicker_safe';

/**
 * Calculate the temporal dither offset for a given frame
 * This offset is used to shift the dither pattern, creating temporal variation
 */
export function calculateTemporalOffset(
  frameIndex: number,
  mode: TemporalDitherMode,
  seed: number = 0
): number {
  if (mode === 'off' || !mode) {
    return 0;
  }

  if (mode === 'blue_noise') {
    // Blue noise temporal dithering: use golden ratio offset for each frame
    // This creates a maximally spread (low-discrepancy) sequence
    // that fills the [0,1] space evenly over time
    const phi = 1.618033988749895; // Golden ratio
    return (frameIndex * phi + seed * 0.1) % 1;
  }

  if (mode === 'flicker_safe') {
    // Flicker-safe: use slower, more gradual changes
    // Uses a carefully ordered set of offsets that:
    // 1. Don't create jarring transitions between adjacent frames
    // 2. Still provide good temporal coverage over time
    // 3. Return to similar values periodically for loop stability
    const safeOffsets = [
      0, // Frame 0
      0.5, // Frame 1 - halfway
      0.25, // Frame 2 - quarter
      0.75, // Frame 3 - three-quarter
      0.125, // Frame 4 - eighth
      0.625, // Frame 5
      0.375, // Frame 6
      0.875, // Frame 7
      0.0625, // Frame 8 - sixteenth
      0.5625, // Frame 9
      0.3125, // Frame 10
      0.8125, // Frame 11
      0.1875, // Frame 12
      0.6875, // Frame 13
      0.4375, // Frame 14
      0.9375, // Frame 15
    ];
    const offset = safeOffsets[frameIndex % safeOffsets.length];
    return (offset + seed * 0.01) % 1;
  }

  return 0;
}

/**
 * Apply temporal dither offset to a canvas by modifying pixel values slightly
 * This provides temporal dithering for modes that don't support native offset passing
 */
export function applyTemporalNoiseToCanvas(
  canvas: HTMLCanvasElement,
  offset: number,
  strength: number = 0.02
): HTMLCanvasElement {
  if (offset === 0 || strength === 0) {
    return canvas;
  }

  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  // Draw original
  ctx.drawImage(canvas, 0, 0);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, result.width, result.height);
  const data = imageData.data;

  // Apply subtle temporal noise based on offset
  // This creates slight variations that integrate over time for smoother perceived quality
  const phi = 1.618033988749895;

  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % result.width;
    const y = Math.floor(i / 4 / result.width);

    // Generate position-dependent noise that varies with temporal offset
    const noise = ((x * phi + y * phi * phi + offset * 1000) % 1) - 0.5;
    const adjustment = Math.round(noise * strength * 255);

    // Apply small adjustment to RGB channels
    data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
    // Alpha unchanged
  }

  ctx.putImageData(imageData, 0, 0);
  return result;
}

/**
 * Generate a sequence of temporal offsets for a given number of frames
 * Useful for pre-calculating offsets for an entire animation
 */
export function generateTemporalSequence(
  frameCount: number,
  mode: TemporalDitherMode,
  seed: number = 0
): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < frameCount; i++) {
    offsets.push(calculateTemporalOffset(i, mode, seed));
  }
  return offsets;
}

/**
 * Check if temporal dithering would have any effect
 */
export function isTemporalDitherActive(mode: TemporalDitherMode): boolean {
  return mode === 'blue_noise' || mode === 'flicker_safe';
}

// ============================================================================
// Temporal Blue Noise Dithering Algorithm
// ============================================================================

/** Apply temporal blue noise dithering for animation frames */
export function temporalBlueNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  frameIndex: number,
  tileSize: number = 64,
  seed: number = 0,
  _colorMode: ColorMode = 'bw'
): DitherResult {
  const tile = generateBlueNoiseTile(tileSize, seed);
  const offset = (frameIndex * 17) % (tileSize * tileSize);

  const resultMatrix: boolean[][] = [];
  const resultColors: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: { r: number; g: number; b: number }[] = [];

    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);

      const nx = x % tileSize;
      const ny = y % tileSize;
      const noiseIdx = (ny * tileSize + nx + offset) % (tileSize * tileSize);
      const threshold = tile[noiseIdx];

      const isDark = gray < threshold;

      matrixRow.push(isDark);
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}
