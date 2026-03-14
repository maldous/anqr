import type { QArtWorkerGeneratePayload } from './worker-generate-payload';

export interface QArtWorkerGenerateRequest {
  type: 'generate';
  id: number;
  payload: QArtWorkerGeneratePayload;
}
