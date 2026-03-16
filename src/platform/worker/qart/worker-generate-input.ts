import type { QArtWorkerBasePayload } from "./worker-base-payload";

export interface QArtWorkerGenerateInput extends QArtWorkerBasePayload {
  targetImage: ImageData;
}
