import type { ColorMode } from "../../../modules/dither-algorithms/types";

/** Options for screened blue noise dithering */
export interface ScreenedBlueNoiseOptions {
  tileSize?: number;
  seed?: number;
  levels?: number;
  strength?: number;
  colorMode?: ColorMode;
}
