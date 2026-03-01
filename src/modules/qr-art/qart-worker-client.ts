import { createLogger } from '../../lib/logger';
import type {
  QArtWorkerGeneratePayload,
  QArtWorkerMessage,
  QArtWorkerResultPayload,
} from './qart-worker-protocol';

const log = createLogger('QART');
const DEFAULT_TIMEOUT_MS = 90_000;

type PendingRequest = {
  resolve: (result: QArtWorkerResultPayload) => void;
  reject: (error: Error) => void;
  onProgress?: (stage: string, percent: number) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

let worker: Worker | null = null;
let workerFailed = false;
let nextId = 0;
const pending = new Map<number, PendingRequest>();

function failAllPending(error: Error): void {
  for (const [id, request] of pending.entries()) {
    pending.delete(id);
    clearTimeout(request.timeoutId);
    request.reject(error);
  }
}

function ensureWorker(): Worker | null {
  if (workerFailed) return null;
  if (worker) return worker;

  try {
    const w = new Worker(new URL('./qart-worker.ts', import.meta.url), { type: 'module' });

    w.onmessage = (event: MessageEvent<QArtWorkerMessage>) => {
      const message = event.data;
      if (!message || typeof message !== 'object') return;

      if (message.type === 'progress') {
        pending.get(message.id)?.onProgress?.(message.stage, message.percent);
        return;
      }

      if (message.type === 'result') {
        const request = pending.get(message.id);
        if (!request) return;

        pending.delete(message.id);
        clearTimeout(request.timeoutId);
        request.resolve(message.result);
      }
    };

    w.onerror = (event) => {
      const error = new Error(event.message || 'QArt worker failed');
      log.warn('QArt worker error, falling back to main thread', { message: error.message });
      workerFailed = true;
      w.terminate();
      worker = null;
      failAllPending(error);
    };

    worker = w;
    return w;
  } catch (err) {
    log.warn('Failed to create QArt worker', { error: err });
    workerFailed = true;
    return null;
  }
}

export async function generateQArtInWorker(
  payload: QArtWorkerGeneratePayload,
  options?: {
    timeoutMs?: number;
    onProgress?: (stage: string, percent: number) => void;
  }
): Promise<QArtWorkerResultPayload> {
  const w = ensureWorker();
  if (!w) {
    throw new Error('QArt worker unavailable');
  }

  const id = ++nextId;

  return await new Promise<QArtWorkerResultPayload>((resolve, reject) => {
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const timeoutId = setTimeout(() => {
      const request = pending.get(id);
      if (!request) return;

      pending.delete(id);
      w.postMessage({ type: 'cancel', id });
      reject(new Error(`QArt worker timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    pending.set(id, {
      resolve,
      reject,
      timeoutId,
      onProgress: options?.onProgress,
    });

    const transferables: Transferable[] = [payload.targetImage.data.buffer as ArrayBuffer];
    w.postMessage({ type: 'generate', id, payload }, transferables);
  });
}

export function terminateQArtWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  failAllPending(new Error('QArt worker terminated'));
}
