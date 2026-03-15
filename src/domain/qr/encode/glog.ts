import { LOG_TABLE } from './exp-table';

/**
 * Galois field logarithm
 */
export function glog(n: number): number {
  if (n < 1) {
    throw new Error(`glog(${n})`);
  }
  return LOG_TABLE[n];
}
