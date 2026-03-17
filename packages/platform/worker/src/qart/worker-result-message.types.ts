import type { QArtWorkerResultPayload } from "./worker-result-payload";

export interface QArtWorkerResultMessage {
  type: "result";
  id: number;
  result: QArtWorkerResultPayload;
}
