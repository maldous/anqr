import type { ValidationResult } from "@/contracts/analyze";
import type { CanvasFactory } from "@/domain/render/canvas";

export type GeneratorInterstitialPlacement = "export";

export interface DownloadRuntime {
  downloadUrl: (url: string, filename: string, blob?: Blob) => void;
}

export interface InterstitialRuntime {
  prepareInterstitial: (placement: GeneratorInterstitialPlacement) => void | Promise<boolean>;
  showInterstitial: (placement: GeneratorInterstitialPlacement) => Promise<void | boolean> | void;
}

export interface ValidationWorkerRuntime {
  validateInWorker: (
    canvas: HTMLCanvasElement | OffscreenCanvas,
    expectedContent: string | undefined,
    attempts: number,
  ) => Promise<ValidationResult>;
  terminateValidationWorker: () => void;
}

export interface QArtWorkerGenerateOptions {
  timeoutMs?: number;
  onProgress?: (stage: string, percent: number) => void;
  signal?: AbortSignal;
}

export interface QArtWorkerGenerateInput {
  data: string;
  targetImage: ImageData;
  version: number;
  ecc: "L" | "M" | "Q" | "H";
  strictSuffix: boolean;
  targetControlPercent: number;
  searchAttempts: number;
  searchSeed: number;
  lockVersionToMinimum: boolean;
  maskPattern?: number;
  performanceProfile: "quality" | "balanced";
  renderConfig: Record<string, unknown>;
  renderInWorker: boolean;
}

export interface QArtWorkerResult {
  success: boolean;
  error?: string;
  matrix?: Uint8Array | null;
  moduleCount: number;
  version: number;
  maskPattern: number;
  matchingPixels: number;
  totalControllable: number;
  matchPercentage: number;
  encodedData?: string | Uint8Array;
  bitmap?: ImageBitmap | null;
}

export interface QArtWorkerRuntime {
  generateQArtInWorker: (
    payload: QArtWorkerGenerateInput,
    options?: QArtWorkerGenerateOptions,
  ) => Promise<QArtWorkerResult>;
  terminateQArtWorker: () => void;
}

export interface GeneratorRuntimeConfig {
  canvasFactory: CanvasFactory;
  download: DownloadRuntime;
  interstitials: InterstitialRuntime;
  qartWorker: QArtWorkerRuntime;
  validationWorker: ValidationWorkerRuntime;
}
