import {for, i, threshold} from '../shared';

export function createBinaryFromLuma(luma: Uint8Array, threshold: number): boolean[] {
  const binary = new Array<boolean>(luma.length);
  for (let i = 0; i < luma.length; i++) {
    binary[i] = luma[i] < threshold;
  }
  return binary;
}

