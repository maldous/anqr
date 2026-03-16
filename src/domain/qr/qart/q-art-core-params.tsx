import type { ECCLevel } from "./bit-mapping";
import type { QArtPerformanceSettings } from "./q-art-performance-settings";
import type { QArtPerformanceProfile } from "./generate.types";

export interface QArtCoreParams {
  data: string;
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  ecc: ECCLevel;
  maskPattern: number;
  onProgress?: (stage: string, percent: number) => void;
  performanceSettings: QArtPerformanceSettings;
  performanceProfile: QArtPerformanceProfile;
  resolvedSuffixMode: "numeric" | "byte";
  encodingSuffixMode: "numeric" | "byte";
  encodedData: string;
  actualSuffix: string;
  originalData: string;
  originalDataLength: number;
  versionToUse: number;
  strictSuffix: boolean;
  autoSuffix: boolean;
  suffix?: string;
}
