import type { ECCLevel } from './bit-mapping';

export type QArtWorkerPerformanceProfile = 'quality' | 'balanced';

interface QArtWorkerBasePayload {
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

export interface QArtWorkerGenerateInput extends QArtWorkerBasePayload {
  targetImage: ImageData;
}

export interface QArtWorkerGeneratePayload extends QArtWorkerBasePayload {
  targetImageWidth: number;
  targetImageHeight: number;
  targetImagePixels: Uint8ClampedArray;
}

export interface QArtWorkerResultPayload {
  success: boolean;
  error?: string;
  matrix?: Uint8Array;
  bitmap?: ImageBitmap;
  moduleCount: number;
  version: number;
  maskPattern: number;
  matchingPixels: number;
  totalControllable: number;
  matchPercentage: number;
  encodedData?: string;
}

export interface QArtWorkerGenerateRequest {
  type: 'generate';
  id: number;
  payload: QArtWorkerGeneratePayload;
}

export interface QArtWorkerCancelRequest {
  type: 'cancel';
  id: number;
}

export type QArtWorkerRequest = QArtWorkerGenerateRequest | QArtWorkerCancelRequest;

export interface QArtWorkerProgressMessage {
  type: 'progress';
  id: number;
  stage: string;
  percent: number;
}

export interface QArtWorkerResultMessage {
  type: 'result';
  id: number;
  result: QArtWorkerResultPayload;
}

export type QArtWorkerMessage = QArtWorkerProgressMessage | QArtWorkerResultMessage;
