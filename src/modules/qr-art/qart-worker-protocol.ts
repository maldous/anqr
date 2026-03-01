import type { ECCLevel } from './bit-mapping';

export interface QArtWorkerGeneratePayload {
  data: string;
  ecc: ECCLevel;
  version: number;
  maskPattern?: number;
  lockVersionToMinimum?: boolean;
  strictSuffix?: boolean;
  targetControlPercent?: number;
  performanceProfile?: 'desktop' | 'android';
  targetImage: ImageData;
}

export interface QArtWorkerResultPayload {
  success: boolean;
  error?: string;
  matrix?: Uint8Array;
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
