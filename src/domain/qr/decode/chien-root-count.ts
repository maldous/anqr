import { polyEvalAsc } from './poly-eval-asc';

export function chienRootCount(locator: number[], gfExp: Uint8Array): number {
  let roots = 0;

  for (let i = 0; i < 255; i++) {
    if (polyEvalAsc(locator, gfExp[i]) === 0) {
      roots++;
    }
  }

  return roots;
}
