import type { RGB } from "../dither-algorithms/types";

export interface QuantizedPixelResult {
  isDark: boolean;
  color: RGB;
  errorR: number;
  errorG: number;
  errorB: number;
}
