import { createLogger } from "../../../infra/logging/logger";
import type { QArtWorkerMessage } from "./worker-protocol";
import { failAllPending } from "./fail-all-pending";
import { workerClientState } from "./worker-client-state";

const log = createLogger("QART");

export function ensureWorker(): Worker | null {
  if (workerClientState.workerFailed) return null;
  if (workerClientState.worker) return workerClientState.worker;

  try {
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

    w.onmessage = (event: MessageEvent<QArtWorkerMessage>) => {
      const message = event.data;
      if (!message || typeof message !== "object") return;

      if (message.type === "progress") {
        workerClientState.pending.get(message.id)?.onProgress?.(message.stage, message.percent);
        return;
      }

      if (message.type === "result") {
        const request = workerClientState.pending.get(message.id);
        if (!request) return;

        workerClientState.pending.delete(message.id);
        clearTimeout(request.timeoutId);
        request.removeAbortListener?.();
        request.resolve(message.result);
      }
    };

    w.onerror = (event) => {
      const error = new Error(event.message || "QArt worker failed");
      log.warn("QArt worker error, falling back to main thread", { message: error.message });
      workerClientState.workerFailed = true;
      w.terminate();
      workerClientState.worker = null;
      failAllPending(error);
    };

    workerClientState.worker = w;
    return w;
  } catch (err) {
    log.warn("Failed to create QArt worker", { error: err });
    workerClientState.workerFailed = true;
    return null;
  }
}
