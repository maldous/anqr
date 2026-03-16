import { type ECCLevel } from "./bit-mapping";
import type { QArtPerformanceProfile } from "./qart-performance-profile.type";

export interface FullQArtConfig {
  data: string;
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  version: number;
  ecc: ECCLevel;
  maskPattern: number;
  onProgress?: (stage: string, percent: number) => void;
  suffix?: string;
  suffixMode?: "numeric" | "byte" | "auto";
  autoSuffix?: boolean;
  minPadCodewords?: number;
  forceVersion?: number;
  targetControlPercent?: number;
  searchAttempts?: number;
  searchSeed?: number;
  lockVersionToMinimum?: boolean;
  strictSuffix?: boolean;
  performanceProfile?: QArtPerformanceProfile;
}
