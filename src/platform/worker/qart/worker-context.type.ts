export type WorkerContext = {
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent<any>) => void) | null;
};
