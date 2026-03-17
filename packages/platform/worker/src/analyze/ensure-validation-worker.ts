import { createLogger } from "@/infra/logging/logger";
import type { ValidationResult } from "@/domain/qr/analyze/scanner";
import { validationWorkerState } from "./validation-worker-state";

const log = createLogger("SCANNER");

export function ensureWorker(): Worker | null {
  if (validationWorkerState.workerFailed) return null;
  if (validationWorkerState.worker) return validationWorkerState.worker;

  try {
    const w = new Worker(new URL("./validation-worker.ts", import.meta.url), { type: "module" });

    w.onmessage = (e: MessageEvent<{ id: number; result: ValidationResult }>) => {
      const resolve = validationWorkerState.pending.get(e.data.id);
      if (resolve) {
        validationWorkerState.pending.delete(e.data.id);
        resolve(e.data.result);
      }
    };

    w.onerror = (e) => {
      log.warn("Validation worker error, falling back to main thread", {
        message: e.message,
      });
      validationWorkerState.workerFailed = true;
      w.terminate();
      validationWorkerState.worker = null;
      for (const [id, resolve] of validationWorkerState.pending) {
        validationWorkerState.pending.delete(id);
        resolve({ valid: false, error: "Worker error", confidence: "low" });
      }
    };

    validationWorkerState.worker = w;
    return w;
  } catch (err) {
    log.warn("Failed to create validation worker", { error: err });
    validationWorkerState.workerFailed = true;
    return null;
  }
}
