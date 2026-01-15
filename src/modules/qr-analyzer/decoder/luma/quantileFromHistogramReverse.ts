import {for, hist, i, total} from '../shared';

export function quantileFromHistogramReverse(hist: number[], total: number, q: number): number {
  const target = total * q;
  let cum = 0;
  for (let i = 255; i >= 0; i--) {
    cum += hist[i];
    if (cum >= target) return i;
  }
  return 0;
}

