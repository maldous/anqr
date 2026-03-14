import { polyEvalHighToLow } from './poly-eval-high-to-low';

export function computeSyndromes(
  received: number[],
  eccCount: number,
  gfExp: Uint8Array
): number[] {
  const syndromes: number[] = [];

  for (let i = 0; i < eccCount; i++) {
    syndromes.push(polyEvalHighToLow(received, gfExp[i]));
  }

  return syndromes;
}
