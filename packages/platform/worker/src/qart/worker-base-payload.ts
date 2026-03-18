import type { ECCLevel } from "../../../../domain/qr/src/qart/bit-mapping";
import type { QArtWorkerPerformanceProfile } from "./worker-performance-profile";

export interface QArtWorkerBasePayload {
  data: string;
  ecc: ECCLevel;
  version: number;
  maskPattern?: number;
  lockVersionToMinimum?: boolean;
  strictSuffix?: boolean;
  targetControlPercent?: number;
  searchAttempts?: number;
  searchSeed?: number;
  performanceProfile?: QArtWorkerPerformanceProfile;
  renderConfig?: Record<string, unknown>;
  renderInWorker?: boolean;
}
