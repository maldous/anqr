import type { QArtWorkerBasePayload } from './worker-base-payload';

export interface QArtWorkerGeneratePayload extends QArtWorkerBasePayload {
  targetImageWidth: number;
  targetImageHeight: number;
  targetImagePixels: Uint8ClampedArray;
}
