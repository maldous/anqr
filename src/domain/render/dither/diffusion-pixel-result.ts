import type { RGB } from '../../../modules/dither-algorithms/types';

export interface DiffusionPixelResult {
  isDark: boolean;
  color: RGB;
  errorR: number;
  errorG: number;
  errorB: number;
}
