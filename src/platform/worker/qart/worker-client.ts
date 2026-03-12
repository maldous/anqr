import { createLogger } from '../../../infra/logging/logger';
import type {
  QArtWorkerGenerateInput,
  QArtWorkerGeneratePayload,
  QArtWorkerMessage,
  QArtWorkerResultPayload,
} from './worker-protocol';

const log = createLogger('QART');
const DEFAULT_TIMEOUT_MS = 90_000;

type PendingRequest = {
  resolve: (result: QArtWorkerResultPayload) => void;
  reject: (error: Error) => void;
  onProgress?: (stage: string, percent: number) => void;
  timeoutId: ReturnType<typeof setTimeout>;
  removeAbortListener?: () => void;
};

let worker: Worker | null = null;
let workerFailed = false;
let nextId = 0;
const pending = new Map<number, PendingRequest>();

function toWorkerPayload(input: QArtWorkerGenerateInput): QArtWorkerGeneratePayload {
  // Copy pixels before transfer so callers can safely re-read/reuse source ImageData.
  const pixelsCopy = new Uint8ClampedArray(input.targetImage.data);
  return {
    data: input.data,
    ecc: input.ecc,
    version: input.version,
    maskPattern: input.maskPattern,
    lockVersionToMinimum: input.lockVersionToMinimum,
    strictSuffix: input.strictSuffix,
    targetControlPercent: input.targetControlPercent,
    searchAttempts: input.searchAttempts,
    searchSeed: input.searchSeed,
    performanceProfile: input.performanceProfile,
    renderConfig: input.renderConfig,
    renderInWorker: input.renderInWorker,
    targetImageWidth: input.targetImage.width,
    targetImageHeight: input.targetImage.height,
    targetImagePixels: pixelsCopy,
  };
}

function failAllPending(error: Error): void {
  for (const [id, request] of pending.entries()) {
    pending.delete(id);
    clearTimeout(request.timeoutId);
    request.removeAbortListener?.();
    request.reject(error);
  }
}

function ensureWorker(): Worker | null {
  if (workerFailed) return null;
  if (worker) return worker;

  try {
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

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
        request.removeAbortListener?.();
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

    const signal = options?.signal;
    if (signal?.aborted) {
      clearTimeout(timeoutId);
      w.postMessage({ type: 'cancel', id });
      reject(new Error('QArt worker request aborted'));
      return;
    }

    const onAbort = () => {
      const request = pending.get(id);
      if (!request) return;
      pending.delete(id);
      clearTimeout(request.timeoutId);
      request.removeAbortListener?.();
      w.postMessage({ type: 'cancel', id });
      reject(new Error('QArt worker request aborted'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    pending.set(id, {
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

export function terminateQArtWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  failAllPending(new Error('QArt worker terminated'));
}
