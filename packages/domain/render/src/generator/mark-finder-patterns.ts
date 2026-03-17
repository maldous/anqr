import { PATTERN_FINDER } from "./functional-pattern-flags.const";

export function markFinderPatterns(map: Uint8Array, mc: number): void {
  const finderStarts: [number, number][] = [
    [0, 0],
    [0, mc - 7],
    [mc - 7, 0],
  ];
  for (const [sr, sc] of finderStarts) {
    const rEnd = Math.min(sr + 7, mc);
    const cEnd = Math.min(sc + 7, mc);
    for (let r = sr; r < rEnd; r++) {
      const rowBase = r * mc;
      for (let c = sc; c < cEnd; c++) {
        map[rowBase + c] |= PATTERN_FINDER;
      }
    }
  }
}
