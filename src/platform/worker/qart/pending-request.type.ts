import type { QArtWorkerResultPayload } from "./worker-protocol";

export type PendingRequest = {
  resolve: (result: QArtWorkerResultPayload) => void;
  reject: (error: Error) => void;
  onProgress?: (stage: string, percent: number) => void;
  timeoutId: ReturnType<typeof setTimeout>;
  removeAbortListener?: () => void;
};
