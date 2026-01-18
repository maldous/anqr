/**
 * Core Math Utilities
 * Pure math functions with no dependencies
 */

/** Clamp value to 0-255 range */
export function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Clamp value to 0-1 range */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Create a seeded pseudo-random number generator
 * Uses sine-based PRNG for deterministic sequences
 * @param seed - Initial seed value
 * @returns Function that returns values in [0, 1)
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = Math.sin(s * 9999) * 10000;
    return s - Math.floor(s);
  };
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Create a mulberry32 PRNG (better distribution than sine-based)
 * @param seed - Initial seed value
 * @returns Function that returns values in [0, 1)
 */
export function createRNG(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
