import type { ECCLevel } from '../../qr-encoder';

export interface FragmentSearchConfig {
  baseUrl: string;
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  iterations: number;
  fragmentLength: number;
  seed: number;
  version: number;
  ecc: ECCLevel;
  maskPattern: number;
  onProgress?: (percent: number) => void;
}
