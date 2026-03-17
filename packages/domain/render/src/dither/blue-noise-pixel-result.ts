import type { RGB } from "@/modules/dither-algorithms/types";

export interface BlueNoisePixelResult {
  isDark: boolean;
  color: RGB;
}
