import { workerClientState } from "./worker-client-state";

export function failAllPending(error: Error): void {
  for (const [id, request] of workerClientState.pending.entries()) {
    workerClientState.pending.delete(id);
    clearTimeout(request.timeoutId);
    request.removeAbortListener?.();
    request.reject(error);
  }
}
