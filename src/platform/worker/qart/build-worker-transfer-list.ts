import type { QArtWorkerResultPayload } from './worker-protocol';

export const buildWorkerTransferList = (response: QArtWorkerResultPayload): Transferable[] => {
  const transferList: Transferable[] = [];
  if (response.matrix) {
    transferList.push(response.matrix.buffer as ArrayBuffer);
  }
  if (response.bitmap) {
    transferList.push(response.bitmap);
  }
  return transferList;
};
