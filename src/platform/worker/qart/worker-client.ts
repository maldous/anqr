import { createLogger } from '../../../infra/logging/logger';
import type { QArtWorkerGenerateInput, QArtWorkerResultPayload } from './worker-protocol';
import { ensureWorker } from './ensure-worker';
import { failAllPending } from './fail-all-pending';
import type { PendingRequest } from './pending-request.type';
import { terminateQArtWorker as terminateQArtWorkerCore } from './terminate-worker';
import { DEFAULT_TIMEOUT_MS } from './worker-timeout-ms.const';
export { terminateQArtWorker } from './terminate-qart-worker';
import { toWorkerPayload } from './to-worker-payload';
import { workerClientState } from './worker-client-state';

export async function generateQArtInWorker(
  payload: QArtWorkerGenerateInput,
  options?: {
    timeoutMs?: number;
    onProgress?: (stage: string, percent: number) => void;
    signal?: AbortSignal;
  }
): Promise<QArtWorkerResultPayload> {
  const w = ensureWorker();
  if (!w) {
    throw new Error('QArt worker unavailable');
  }

  const id = ++workerClientState.nextId;

  return await new Promise<QArtWorkerResultPayload>((resolve, reject) => {
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const timeoutId = setTimeout(() => {
      const request = workerClientState.pending.get(id);
      if (!request) return;

      workerClientState.pending.delete(id);
      w.postMessage({ type: 'cancel', id });
      reject(new Error(`QArt worker timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    const signal = options?.signal;
    if (signal?.aborted) {
      clearTimeout(timeoutId);
      w.postMessage({ type: 'cancel', id });
      reject(new Error('QArt worker request aborted'));
      return;
    }

    const onAbort = () => {
      const request = workerClientState.pending.get(id);
      if (!request) return;
      workerClientState.pending.delete(id);
      clearTimeout(request.timeoutId);
      request.removeAbortListener?.();
      w.postMessage({ type: 'cancel', id });
      reject(new Error('QArt worker request aborted'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    workerClientState.pending.set(id, {
      resolve,
      reject,
      timeoutId,
      onProgress: options?.onProgress,
      removeAbortListener: signal
        ? () => {
            signal.removeEventListener('abort', onAbort);
          }
        : undefined,
    });

    const workerPayload = toWorkerPayload(payload);
    const transferables: Transferable[] = [workerPayload.targetImagePixels.buffer as ArrayBuffer];
    w.postMessage({ type: 'generate', id, payload: workerPayload }, transferables);
  });
}
