import {for, hist, i, total} from '../shared';

export function quantileFromHistogram(hist: number[], total: number, q: number): number {
  const target = total * q;
  let cum = 0;
  for (let i = 0; i < 256; i++) {
    cum += hist[i];
    if (cum >= target) return i;
  }
  return 255;
}

