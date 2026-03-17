/**
 * Mulberry32 PRNG - simple, fast, deterministic random number generator.
 * Given the same seed, produces the same sequence of numbers.
 *
 * @param seed 32-bit seed value
 * @returns Function that returns next random number in [0, 1)
 */
export function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
