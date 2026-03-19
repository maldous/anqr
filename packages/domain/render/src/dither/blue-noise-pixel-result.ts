import type { RGB } from "../dither-algorithms/types";

export interface BlueNoisePixelResult {
  isDark: boolean;
  color: RGB;
}
