import type { DominantColor } from "./dominant-color";

export interface ColorInfo {
  dominantColors: DominantColor[];
  averageColor: string;
  contrastRatio: number;
}
