import type { ECCLevel } from "@/modules/qr-encoder";

export interface QArtConfig {
  data: string;
  version: number;
  ecc: ECCLevel;
  maskPattern: number;
  image: ImageData;
  rotation?: 0 | 90 | 180 | 270;
  dither?: boolean;
  contrastThreshold?: number;
}
