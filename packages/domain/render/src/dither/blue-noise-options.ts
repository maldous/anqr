import type { ColorMode } from "@/modules/dither-algorithms/types";

/** Options for blue noise dithering */
export interface BlueNoiseOptions {
  tileSize?: number;
  seed?: number;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}
