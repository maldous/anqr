import type { RGB } from './rgb';

export interface DitherResult {
  matrix: boolean[][];
  colors: RGB[][];
}
