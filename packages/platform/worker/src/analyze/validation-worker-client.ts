/**
 * Validation Worker Client
 * Manages the QR validation Web Worker and provides a promise-based API.
 * Falls back to main-thread validation if the Worker fails to initialize.
 */

import type { ValidationResult } from "@/contracts/analyze";
import { validateQRCodeRobust } from "@/domain/qr/analyze";
import type { CanvasContext } from "./canvas-context.types";
import type { CanvasLike } from "./canvas-like.types";
import { ensureWorker } from "./ensure-validation-worker";
export { terminateValidationWorker } from "./terminate-validation-worker";
import { validationWorkerState } from "./validation-worker-state";
import { VALIDATION_WORKER_TIMEOUT_MS } from "./validation-worker-timeout.const";
import { validationWorkerLog as log } from "./validation-worker-log";

/**
 * Validate a QR code canvas using a Web Worker (off main thread).
 * Extracts ImageData on the main thread (cheap) and transfers it to the Worker
 * for decoding (expensive). Falls back to main-thread validation if Workers
 * are unavailable or fail.
 */
export function validateInWorker(
  canvas: CanvasLike,
  expectedContent: string | undefined,
  attempts: number,
): Promise<ValidationResult> {
  const w = ensureWorker();

  if (!w) {
    // Fallback: synchronous main-thread validation
    return Promise.resolve(validateQRCodeRobust(canvas, expectedContent, attempts));
  }

  const ctx = canvas.getContext("2d") as CanvasContext | null;
  if (!ctx) {
    return Promise.resolve(validateQRCodeRobust(canvas, expectedContent, attempts));
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const id = ++validationWorkerState.nextId;

  return new Promise<ValidationResult>((resolve) => {
    // Timeout guard: if the worker doesn't respond within 10s, resolve with failure
    // and fall back gracefully instead of hanging forever.
    const timeout = setTimeout(() => {
      if (validationWorkerState.pending.has(id)) {
        validationWorkerState.pending.delete(id);
        log.warn("Validation worker timed out");
        resolve({ valid: false, error: "Worker timeout", confidence: "low" });
      }
    }, VALIDATION_WORKER_TIMEOUT_MS);

    validationWorkerState.pending.set(id, (result) => {
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
      [imageData.data.buffer],
    );
  });
}

/**
 * Terminate the validation worker and clean up resources.
 */
