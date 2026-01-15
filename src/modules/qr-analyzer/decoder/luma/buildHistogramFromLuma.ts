import {for, hist, i} from '../shared';

export function buildHistogramFromLuma(luma: Uint8Array): number[] {
  const hist = new Array(256).fill(0);
  for (let i = 0; i < luma.length; i++) {
    hist[luma[i]]++;
  }
  return hist;
}

