/**
 * Validation Worker Client
 * Manages the QR validation Web Worker and provides a promise-based API.
 * Falls back to main-thread validation if the Worker fails to initialize.
 */

import { createLogger } from '../../../infra/logging/logger';
import type { ValidationResult } from '../../../domain/qr/analyze/scanner';
import { validateQRCodeRobust } from '../../../domain/qr/analyze/scanner';

const log = createLogger('SCANNER');

type CanvasLike = HTMLCanvasElement | OffscreenCanvas;
type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

let worker: Worker | null = null;
let workerFailed = false;
let nextId = 0;
const pending = new Map<number, (result: ValidationResult) => void>();

function ensureWorker(): Worker | null {
  if (workerFailed) return null;
  if (worker) return worker;

  try {
    const w = new Worker(new URL('./validation-worker.ts', import.meta.url), { type: 'module' });

    w.onmessage = (e: MessageEvent<{ id: number; result: ValidationResult }>) => {
      const resolve = pending.get(e.data.id);
      if (resolve) {
        pending.delete(e.data.id);
        resolve(e.data.result);
      }
    };

    w.onerror = (e) => {
      log.warn('Validation worker error, falling back to main thread', {
        message: e.message,
      });
      workerFailed = true;
      w.terminate();
      worker = null;
      // Resolve all pending with fallback-triggering failure
      for (const [id, resolve] of pending) {
        pending.delete(id);
        resolve({ valid: false, error: 'Worker error', confidence: 'low' });
      }
    };

    worker = w;
    return w;
  } catch (err) {
    log.warn('Failed to create validation worker', { error: err });
    workerFailed = true;
    return null;
  }
}

/**
 * Validate a QR code canvas using a Web Worker (off main thread).
 * Extracts ImageData on the main thread (cheap) and transfers it to the Worker
 * for decoding (expensive). Falls back to main-thread validation if Workers
 * are unavailable or fail.
 */
export function validateInWorker(
  canvas: CanvasLike,
  expectedContent: string | undefined,
  attempts: number
): Promise<ValidationResult> {
  const w = ensureWorker();

  if (!w) {
    // Fallback: synchronous main-thread validation
    return Promise.resolve(validateQRCodeRobust(canvas, expectedContent, attempts));
  }

  const ctx = canvas.getContext('2d') as CanvasContext | null;
  if (!ctx) {
    return Promise.resolve(validateQRCodeRobust(canvas, expectedContent, attempts));
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const id = ++nextId;

  return new Promise<ValidationResult>((resolve) => {
    // Timeout guard: if the worker doesn't respond within 10s, resolve with failure
    // and fall back gracefully instead of hanging forever.
    const timeout = setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        log.warn('Validation worker timed out');
        resolve({ valid: false, error: 'Worker timeout', confidence: 'low' });
      }
    }, 10_000);

    pending.set(id, (result) => {
      clearTimeout(timeout);
      resolve(result);
    });
    // Transfer the underlying ArrayBuffer for zero-copy messaging
    w.postMessage(
      {
        id,
        width: imageData.width,
        height: imageData.height,
        pixels: imageData.data,
        expectedContent,
        attempts,
      },
      [imageData.data.buffer]
    );
  });
}

/**
 * Terminate the validation worker and clean up resources.
 */
export function terminateValidationWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  for (const [id, resolve] of pending) {
    pending.delete(id);
    resolve({ valid: false, error: 'Worker terminated', confidence: 'low' });
  }
}
