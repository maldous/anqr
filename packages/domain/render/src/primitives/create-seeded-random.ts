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
