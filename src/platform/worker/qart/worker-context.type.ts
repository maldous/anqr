import type { QArtWorkerRequest } from "./worker-protocol";

export type WorkerContext = {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent<QArtWorkerRequest>) => void) | null;
};
